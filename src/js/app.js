import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import render from './view';
import parseData from './parse';

export default (target, lang) => {
  // Initialize
  const state = {
    // STATES: input, processing
    formState: 'input',
    // TODO: change errors
    errors: {
      inputEmptyError: false,
      urlValidationError: false,
      feedAlreadySubmittedError: false,
      networkError: false,
      proxyError: false,
      parseError: false,
      unknownError: false,
    },
    loadedFeeds: [],
    getFeedsUrls() {
      return this.loadedFeeds.map((feed) => feed.url);
    },
  };

  const watchedState = onChange(state, () => {
    render(state, lang);
  });

  yup.setLocale({
    mixed: {
      required: 'inputEmptyError',
      notOneOf: 'feedAlreadySubmittedError',
    },
    string: {
      url: 'urlValidationError',
    },
  });

  const urlInput = document.querySelector('#link-form_input');
  urlInput.focus();

  // Logic
  async function fetchData(url) {
    const proxiedUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxiedUrl)
      .catch((error) => {
        const proxyError = new Error(error.message);
        proxyError.code = 'proxyError';
        throw proxyError;
      });
    if (response.data.status.http_code !== 200) {
      const networkError = new Error('Network error.');
      networkError.code = 'networkError';
      throw networkError;
    }
    return response.data.contents;
  }

  async function validateUrl(url) {
    const schema = yup.string().required().url().notOneOf(watchedState.getFeedsUrls());
    return schema.validate(url)
      .catch((error) => {
        const validationError = new Error(error.message);
        validationError.code = error.message;
        throw validationError;
      });
  }

  const form = document.querySelector('#link-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState = 'processing';
    const url = urlInput.value;
    validateUrl(url)
      // TODO: sometimes wrong links are accepted
      .then((validatedUrl) => fetchData(validatedUrl))
      .then((fetchedData) => parseData(fetchedData))
      .then((parsedFeed) => {
        console.log(parsedFeed);
        watchedState.loadedFeeds.push({ url, data: parsedFeed });
      })
      .then(() => {
        // console.log('[Submit] Feed loaded');
        // console.log(state.loadedFeeds);
      })
      .catch((error) => {
        // TODO: change errors state to an array?
        if (!error.code) {
          watchedState.errors.undefinedError = true;
        } else {
          watchedState.errors[error.code] = true;
        }
        throw error;
      })
      .finally(() => {
        form.reset();
        watchedState.formState = 'input';
        urlInput.focus();
      });
  });
  // Clear errors on input
  urlInput.addEventListener('input', () => {
    Object.keys(watchedState.errors).forEach((errorType) => {
      watchedState.errors[errorType] = false;
    });
  });
};

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
    // TODO: change way errors
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
    loadedPosts: [],
    getFeedsUrls() {
      return this.loadedFeeds.map((feed) => feed.url);
    },
    // loadFeed(feedMeta) {
    //   this.loadedFeeds.push({
    //     id: watchedState.loadedFeeds.length + 1,
    //     ...parsedFeedMeta,
    //   })
    // },
    // loadPosts(posts) {
    //   this.loadPosts.push(...posts)
    // },
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
    const proxiedUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
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
    // TODO: sometimes wrong links are accepted
    // TODO: change errors state to an array?
    // TODO: нормализовать возвращаемые из парсера фидов данные
    //       на отдельные сущности фидов и постов
    // TODO: add button to show tooltip with test feed URLs
    // TODO: перенести генерацию uniqueId в app.js чтобы parseData() стала чистой
    validateUrl(url)
      .then((validatedUrl) => fetchData(validatedUrl))
      .then((fetchedData) => parseData(fetchedData))
      .then(([parsedFeedMeta, parsedFeedPosts]) => {
        watchedState.loadedFeeds.push({ ...parsedFeedMeta, sourceUrl: url });
        watchedState.loadedPosts.push(...parsedFeedPosts);
        console.log('[Submit] Feed loaded \n', state.loadedFeeds);
      })
      .catch((error) => {
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

import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import render from './view';
import parse from './parse';

// TODO:
export default (target, lang) => {
  const state = {
    // STATES: input, processing
    stage: 'input',
    form: {
      inputValue: '',
    },
    errors: {
      linkValidityError: undefined,
      networkError: undefined,
    },
    currentFeeds: [],
  };

  const watchedState = onChange(state, () => {
    render(watchedState, lang);
  });

  // Initialize validation; Create custom error messages
  yup.setLocale({
    mixed: {
      required: 'requiredField',
      notOneOf: 'alreadySubmitted',
    },
    string: {
      url: 'validUrl',
    },
  });

  // Logic
  const linkInput = document.querySelector('#link-form_input');
  linkInput.focus();

  const getFeed = async (url) => {
    const proxiedUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxiedUrl)
      .catch((error) => {
        // TODO: переработать как хранятся ошибки
        watchedState.errors.networkError.push = 'proxyError';
        console.log(`[Network] ${error.message}`);
        throw error;
      });
    if (response.data.status.http_code !== 200) {
      watchedState.errors.networkError = 'networkError';
      console.log('[Network] Proxy couldn\'t get data from target URL');
      throw new Error();
    }
    // console.log(response.data.contents);
    try {
      const document = parse(response.data.contents);
      // console.log(document);
      return document;
    } catch (error) {
      watchedState.errors.parseError = 'parseError';
      console.log(`[Parse] ${error.message}`);
      throw error;
    }
  };

  const validateLink = async (link) => {
    const schema = yup.string().required().url().notOneOf(watchedState.currentFeeds);
    return schema.validate(link)
      .then(() => {
        watchedState.errors.linkValidityError = undefined;
        console.log('[Validation] Link is valid.');
      })
      .catch((error) => {
        watchedState.errors.linkValidityError = error.message;
        console.log('[Validation] Link is invalid.', watchedState.form.errors);
        throw new Error();
      });
  };

  const form = document.querySelector('#link-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.stage = 'processing';
    const link = linkInput.value;
    validateLink(link)
      .then(async () => {
        await getFeed(link);
        watchedState.currentFeeds.push(link);
        console.log('[Submit] Link submitted');
        form.reset();
        linkInput.focus();
        // Getting data
      })
      .finally(() => {
        watchedState.stage = 'input';
      });
  });
  // Clear errors on input
  linkInput.addEventListener('input', () => {
    Object.keys(watchedState.errors).forEach((errorType) => {
      watchedState.errors[errorType] = undefined;
    });
  });
};

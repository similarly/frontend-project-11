import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId, differenceBy } from 'lodash';
import render from './view';
import parseData from './parse';

export default (target, lang) => {
  // Initialize
  const state = {
    // STATES: input, processing
    formState: 'input',
    // TODO: implement a Set for seenIds, change way errors are kept,
    // group data into 'data', 'ui', 'proccessing'
    errors: {
      inputEmptyError: false,
      urlValidationError: false,
      feedAlreadySubmittedError: false,
      networkError: false,
      proxyError: false,
      parseError: false,
      unknownError: false,
    },
    success: false,
    loadedFeeds: [],
    loadedPosts: [],
    seenPostIds: [],
    getFeedsUrls() {
      return this.loadedFeeds.map((feed) => feed.url);
    },
    loadPosts(posts, parentFeedId) {
      this.loadedPosts.push(...posts.map((post) => ({
        id: uniqueId('post'),
        parentFeedId,
        ...post,
      })));
    },
    loadFeed(feedMeta, url) {
      const feedId = uniqueId('feed');
      this.loadedFeeds.push({
        id: feedId,
        url,
        ...feedMeta,
      });
      return feedId;
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
    const proxiedUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxiedUrl)
      .catch((error) => {
        const networkError = new Error(error.message);
        networkError.code = 'networkError';
        throw networkError;
      });
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
  // Clear feedback on input
  function clearFeedback() {
    Object.keys(watchedState.errors).forEach((errorType) => {
      watchedState.errors[errorType] = false;
    });
    watchedState.success = false;
  }
  // Fetch new posts and update state
  async function updateFeeds() {
    const feedsUpdatePromises = Promise.all(watchedState.loadedFeeds.map((feed) => {
      const updateFeedPromise = fetchData(feed.url)
        .then((fetchedData) => parseData(fetchedData))
        .then(([, parsedFeedPosts]) => {
          const newPosts = differenceBy(parsedFeedPosts, watchedState.loadedPosts, 'source');
          if (!(newPosts.length === 0)) {
            console.log(`Found updated feeds. Updating ${feed.id} with`, newPosts);
            watchedState.loadPosts(newPosts, feed.id);
          }
        })
        // TODO: Separate submission errors, and background update errors
        .catch((error) => {
          if (!error.code) {
            watchedState.errors.undefinedError = true;
          } else {
            watchedState.errors[error.code] = true;
          }
          throw error;
        });
      return updateFeedPromise;
    }));
    feedsUpdatePromises.finally(() => setTimeout(() => updateFeeds(), 5000));
  }
  updateFeeds();
  const form = document.querySelector('#link-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();
    watchedState.formState = 'processing';
    const url = urlInput.value;
    // TODO: change errors state property to an array?
    validateUrl(url)
      .then((validatedUrl) => fetchData(validatedUrl))
      .then((fetchedData) => parseData(fetchedData))
      .then(([parsedFeedMeta, parsedFeedPosts]) => {
        const feedId = watchedState.loadFeed(parsedFeedMeta, url);
        watchedState.loadPosts(parsedFeedPosts, feedId);
        console.log('[Submit] Feed loaded \n', state);
      })
      .then(() => {
        watchedState.success = true;
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
  const postsList = document.querySelector('#posts');
  postsList.addEventListener('click', (e) => {
    const postId = e.target.closest('.post')?.getAttribute('data-post-id');
    if (e.target.getAttribute('clickable')) {
      watchedState.seenPostIds.push(postId);
    }
  });
};

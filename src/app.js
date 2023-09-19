import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId, differenceBy } from 'lodash';
import i18next from 'i18next';
import render from './view';
import parseData from './parse';
import * as resources from './lang/index';

export default async () => {
  /* TODO:
    add Set for keeping seenIds
    add error in fetchData func on a fixed timeout?
    pass watchedState getter function to view renderer
  */
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });
  const elements = {
    urlInput: document.querySelector('#link-form_input'),
    form: document.querySelector('#link-form'),
    submitButton: document.querySelector('#link-form_button'),
    postsList: document.querySelector('#posts'),
    feedsList: document.querySelector('#feeds'),
    feedbackContainer: document.querySelector('#feedback-container'),
  };
  yup.setLocale({
    mixed: {
      required: 'inputEmptyError',
      notOneOf: 'feedAlreadySubmittedError',
    },
    string: {
      url: 'urlValidationError',
    },
  });
  const state = {
    // data
    error: null,
    success: false,
    loadedFeeds: [],
    loadedPosts: [],
    // ui
    /* input; processing */
    formState: 'input',
    seenPostIds: [],
    shownModal: null,
  };

  const watchedState = onChange(state, () => {
    render(state, elements, i18nextInstance);
  });
  const getFeedsUrls = (feeds) => feeds.map((feed) => feed.url);
  const loadPosts = (posts, parentFeedId) => {
    watchedState.loadedPosts.push(...posts.map((post) => ({
      id: uniqueId('post'),
      parentFeedId,
      ...post,
    })));
  };
  const loadFeed = (feedMeta, url) => {
    const feedId = uniqueId('feed');
    watchedState.loadedFeeds.push({
      id: feedId,
      url,
      ...feedMeta,
    });
    return feedId;
  };

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
    const schema = yup.string().required().url().notOneOf(getFeedsUrls(watchedState.loadedFeeds));
    return schema.validate(url)
      .catch((error) => {
        const validationError = new Error(error.message);
        validationError.code = error.message;
        throw validationError;
      });
  }

  async function updateFeeds() {
    const feedsUpdatePromises = Promise.all(watchedState.loadedFeeds.map((feed) => {
      const updateFeedPromise = fetchData(feed.url)
        .then((fetchedData) => parseData(fetchedData))
        .then(([, parsedFeedPosts]) => {
          const newPosts = differenceBy(parsedFeedPosts, watchedState.loadedPosts, 'source');
          if (!(newPosts.length === 0)) {
            loadPosts(newPosts, feed.id);
          }
        })
        .catch((error) => {
          console.log(error.message, `Внутренний код ошибки: ${error.code}`);
        });
      return updateFeedPromise;
    }));
    feedsUpdatePromises.finally(() => setTimeout(() => updateFeeds(), 5000));
  }
  updateFeeds();
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.error = null;
    watchedState.success = null;
    watchedState.formState = 'processing';
    const url = elements.urlInput.value;
    validateUrl(url)
      .then((validatedUrl) => fetchData(validatedUrl))
      .then((fetchedData) => parseData(fetchedData))
      .then(([parsedFeedMeta, parsedFeedPosts]) => {
        const feedId = loadFeed(parsedFeedMeta, url);
        loadPosts(parsedFeedPosts, feedId);
      })
      .then(() => {
        watchedState.success = true;
      })
      .catch((error) => {
        if (!error.code) {
          watchedState.error = 'undefinedError';
        } else {
          watchedState.error = error.code;
        }
        throw error;
      })
      .finally(() => {
        elements.form.reset();
        watchedState.formState = 'input';
      });
  });
  elements.postsList.addEventListener('click', (e) => {
    const postId = e.target.closest('.post')?.getAttribute('data-post-id');
    if (e.target.getAttribute('clickable')) {
      watchedState.seenPostIds.push(postId);
    }
  });
};

import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import { uniqueId, differenceBy } from 'lodash';
import i18next from 'i18next';
import getRenderFunction from './view';
import parseData from './parse';
import * as resources from './lang/index';

export default async () => {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });
  const elements = {
    urlInput: document.querySelector('#link-form_input'),
    form: document.querySelector('#link-form'),
    submitButton: document.querySelector('#link-form_button'),
    contentLayout: document.querySelector('#content-layout'),
    postsList: document.querySelector('#posts'),
    feedsList: document.querySelector('#feeds'),
    feedbackContainer: document.querySelector('#feedback-container'),
    modal: document.querySelector('#modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalFullButton: document.querySelector('.full-article'),
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
    /* idle ; loading ; failure */
    loadingProcess: 'idle',
    data: {
      loadedFeeds: [],
      loadedPosts: [],
    },
    ui: {
      viewedPostsId: [],
      currentShownModalPostId: null,
    },
    form: {
      error: null,
      valid: null,
    },
  };

  const watchedState = onChange(state, getRenderFunction(state, elements, i18nextInstance));
  const getLoadedFeedsUrls = (feeds) => feeds.map((feed) => feed.url);
  const loadPosts = (posts, parentFeedId) => {
    watchedState.data.loadedPosts.push(...posts.map((post) => ({
      id: uniqueId('post'),
      parentFeedId,
      ...post,
    })));
  };
  const loadFeed = (feedMeta, url) => {
    const feedId = uniqueId('feed');
    watchedState.data.loadedFeeds.push({
      id: feedId,
      url,
      ...feedMeta,
    });
    return feedId;
  };
  const addProxy = (url) => {
    const proxiedUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxiedUrl.searchParams.set('url', url);
    proxiedUrl.searchParams.set('disableCache', 'true');
    console.log(proxiedUrl.toString());
    return proxiedUrl.toString();
  };
  async function fetchData(url) {
    const proxiedUrl = addProxy(url);
    const response = await axios.get(proxiedUrl)
      .then((r) => {
        if (r.data.status?.error?.code === 'ENOTFOUND') {
          const networkError = new Error(r.data.status.error.code);
          networkError.code = 'networkError';
          throw networkError;
        }
        return r;
      })
      .catch((error) => {
        const networkError = new Error(error.message);
        networkError.code = 'networkError';
        throw networkError;
      });
    return response.data.contents;
  }

  async function validateUrl(url) {
    const loadedFeedUrls = getLoadedFeedsUrls(watchedState.data.loadedFeeds);
    const schema = yup.string().required().url().notOneOf(loadedFeedUrls);
    return schema.validate(url)
      .catch((error) => {
        const validationError = new Error(error.message);
        validationError.code = error.message;
        throw validationError;
      });
  }

  async function updateFeeds() {
    const feedsUpdatePromises = Promise.all(watchedState.data.loadedFeeds.map((feed) => {
      const updateFeedPromise = fetchData(feed.url)
        .then((fetchedData) => parseData(fetchedData))
        .then(({ parsedPosts }) => {
          const newPosts = differenceBy(parsedPosts, watchedState.data.loadedPosts, 'source');
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
    watchedState.loadingProcess = 'loading';
    const url = elements.urlInput.value;
    validateUrl(url)
      .then((validatedUrl) => fetchData(validatedUrl))
      .then((fetchedData) => parseData(fetchedData))
      .then(({ parsedFeedMeta, parsedPosts }) => {
        const feedId = loadFeed(parsedFeedMeta, url);
        loadPosts(parsedPosts, feedId);
      })
      .then(() => {
        watchedState.loadingProcess = 'idle';
        watchedState.form.error = null;
        watchedState.form.valid = true;
      })
      .catch((error) => {
        watchedState.form.valid = false;
        watchedState.loadingProcess = 'failure';
        if (!error.code) {
          watchedState.form.error = 'undefinedError';
        } else {
          watchedState.form.error = error.code;
        }
        throw error;
      })
      .finally(() => {
        elements.form.reset();
      });
  });
  elements.postsList.addEventListener('click', (e) => {
    const postId = e.target.closest('.post')?.getAttribute('data-post-id');
    if (e.target.getAttribute('clickable')) {
      watchedState.ui.viewedPostsId.push(postId);
      watchedState.ui.currentShownModalPostId = postId;
    }
  });
};

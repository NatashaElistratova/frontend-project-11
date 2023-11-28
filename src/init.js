import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import locale from './locales/locale.js';
import watch from './view.js';
import parseRss from './parseRss.js';

const createProxy = (url) => {
  const urlProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlProxy.searchParams.set('url', url);
  urlProxy.searchParams.set('disableCache', 'true');
  return urlProxy.toString();
};

const getRss = (watchedState) => {
  const url = watchedState.form.urlInput;
  const proxyUrl = createProxy(url);

  return axios.get(proxyUrl)
    .then((result) => parseRss(result.data.contents))
    .then((data) => {
      const newFeedId = uniqueId();
      const newFeed = { url, id: newFeedId, ...data };

      const newPosts = data.posts.map((post) => ({ feedId: newFeedId, id: uniqueId(), ...post }));

      watchedState.feeds.push(newFeed);
      watchedState.posts.push(...newPosts);
      watchedState.feedUrls.push(url);
      watchedState.form.success = true;
      watchedState.form.urlInput = '';

      return url;
    })
    .catch((error) => {
      const errorMessage = error.code === 'ERR_NETWORK'
        ? 'errors.networkError'
        : error.message;

      watchedState.form.errors = { urlInput: errorMessage };
      watchedState.form.valid = false;
    });
};

const getNewPosts = (watchedState, timeout) => {
  const promises = watchedState.feeds.map((feed) => {
    const url = createProxy(feed.url);

    return axios
      .get(url)
      .then((result) => parseRss(result.data.contents))
      .then((data) => {
        const newPosts = data.posts.filter(
          (post) => !watchedState.posts.some(
            (el) => el.title === post.title,
          ),
        );
        watchedState.posts.push(...newPosts);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => {
      getNewPosts(watchedState, timeout);
    }, timeout);
  });
};

export default () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const submitBtn = document.querySelector('button[type="submit"]');
  const postsWrap = document.querySelector('.posts');
  const defaultLang = 'ru';
  const getPostsTimeout = 5000;
  const i18n = i18next.createInstance();

  const initialState = {
    feeds: [],
    posts: [],
    feedUrls: [],
    form: {
      valid: true,
      errors: {},
      success: null,
      urlInput: '',
    },
    visitedPosts: new Set(),
  };

  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  }).then(() => {
    const state = onChange(initialState, watch(urlInput, initialState, i18n));

    yup.setLocale(locale);

    const schema = yup.string().url().required();

    const validateUrl = (url, watchedState) => {
      const actualSchema = schema.notOneOf(watchedState.feedUrls);

      return actualSchema.validate(url)
        .then(() => ({}))
        .catch((e) => {
          const [message] = e.errors.map((err) => i18n.t(err.key));
          return { urlInput: message };
        });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      validateUrl(url, state).then((errors) => {
        state.form.errors = errors;
        state.form.valid = isEmpty(errors);

        if (!state.form.valid) return;

        state.form.urlInput = url;

        submitBtn.setAttribute('disabled', true);

        getRss(state).then(() => {
          submitBtn.removeAttribute('disabled');
          urlInput.focus();
          getNewPosts(state, getPostsTimeout);
        });
      });
    });

    postsWrap.addEventListener('click', (e) => {
      if (!('id' in e.target.dataset)) return;

      const { id } = e.target.dataset;
      state.visitedPosts.add(id);
    });
  });
};

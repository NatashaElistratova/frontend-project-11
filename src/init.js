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

const getPostsTimeout = 5000;

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
      watchedState.form.status = 'success';
      watchedState.form.urlInput = '';

      return url;
    })
    .catch((error) => {
      let errorMessage = '';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'errors.networkError';
      } else if (error.code === 'err_parser') {
        errorMessage = 'errors.parsingError';
      } else {
        errorMessage = error.message;
      }

      watchedState.form.errors = { urlInput: errorMessage };
      watchedState.form.status = 'error';
    });
};

const getNewPosts = (watchedState) => {
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
    setTimeout(() => getNewPosts(watchedState), getPostsTimeout);
  });
};

export default () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const submitBtn = document.querySelector('button[type="submit"]');
  const postsWrap = document.querySelector('.posts');
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      valid: true,
      errors: {},
      urlInput: '',
      status: '',
    },
    visitedPosts: new Set(),
  };

  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  }).then(() => {
    const state = onChange(initialState, watch({ urlInput, submitBtn }, initialState, i18n));

    yup.setLocale(locale);

    const schema = yup.string().url().required();

    const validateUrl = (url, feedUrls) => {
      const actualSchema = schema.notOneOf(feedUrls);

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
      const feedUrls = state.feeds.map((feed) => feed.url);

      validateUrl(url, feedUrls).then((errors) => {
        const isError = !isEmpty(errors);

        if (isError) {
          state.form.errors = errors;
          state.form.valid = false;
          state.form.status = 'error';
        } else {
          state.form.urlInput = url;
          state.form.valid = true;
          state.form.status = 'processing';

          getRss(state);
        }
      });
    });

    postsWrap.addEventListener('click', (e) => {
      if (!('id' in e.target.dataset)) return;

      const { id } = e.target.dataset;
      state.visitedPosts.add(id);
    });

    setTimeout(() => getNewPosts(state), getPostsTimeout);
  });
};

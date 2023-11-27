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

export default async () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const submitBtn = document.querySelector('button[type="submit"]');
  const postsWrap = document.querySelector('.posts');
  const defaultLang = 'ru';
  const getNewPostsTimeout = 5000;
  const i18n = i18next.createInstance();

  const initialState = {
    feeds: [],
    posts: [],
    feedUrls: [],
    form: {
      valid: true,
      errors: {},
      success: {},
      urlInput: '',
    },
    visitedPosts: new Set(),
  };

  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  yup.setLocale(locale);

  const state = onChange(initialState, watch(urlInput, initialState, i18n));

  const schema = yup.string().required().url();

  const validateUrl = async (watchedState) => {
    const actualSchema = schema.notOneOf(watchedState.feedUrls);
    try {
      await actualSchema.validate(watchedState.form.urlInput, { abortEarly: false });
      return {};
    } catch (e) {
      const [message] = e.errors.map((err) => i18n.t(err.key));
      return { urlInput: message };
    }
  };

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

        state.feeds.push(newFeed);
        state.posts.push(...newPosts);
        state.feedUrls.push(url);

        state.form.success = {
          urlInput: i18n.t('success.rssAdded'),
        };
        state.form.urlInput = '';
        urlInput.focus();

        return url;
      })
      .catch((error) => {
        const errorMessage = error.code === 'ERR_NETWORK'
          ? i18n.t('errors.networkError')
          : error.message;
        state.form.errors = { urlInput: i18n.t(errorMessage) };
        state.form.valid = false;
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
          state.posts.push(...newPosts);
        })
        .catch((error) => {
          console.log(error);
        });
    });

    Promise.all(promises).finally(() => {
      setTimeout(() => {
        getNewPosts(state);
      }, getNewPostsTimeout);
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    state.form.urlInput = formData.get('url').trim();

    validateUrl(state).then((errors) => {
      state.form.errors = errors;
      state.form.valid = isEmpty(errors);

      if (!state.form.valid) return;

      submitBtn.setAttribute('disabled', true);

      getRss(state).then((feedUrl) => {
        submitBtn.removeAttribute('disabled');
        getNewPosts(state, feedUrl);
      });
    });
  });

  postsWrap.addEventListener('click', (e) => {
    if (!('id' in e.target.dataset)) return;

    const { id } = e.target.dataset;
    state.visitedPosts.add(id);
  });
};

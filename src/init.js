import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import resources from './locales/index.js';
import watch from './view.js';
import parseRss from './parseRss.js';

export default async () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      valid: true,
      errors: {},
      urlInput: '',
    },
  };

  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      required: () => ({ key: 'errors.validation.required' }),
      url: () => ({ key: 'errors.validation.url' }),
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
    },
  });

  const state = onChange(initialState, watch(urlInput, initialState, i18n));

  const schema = yup.string().url();

  const validateUrl = async (el, feeds) => {
    const actualSchema = schema.notOneOf(feeds);
    try {
      await actualSchema.validate(el, { abortEarly: false });
      return {};
    } catch (e) {
      const [message] = e.errors.map((err) => i18n.t(err.key));
      return { urlInput: message };
    }
  };

  const renderPosts = (watchedState) => {
    const postsWrap = document.querySelector('.posts');
    const postsTitle = document.createElement('h2');
    postsTitle.innerText = i18n.t('headings.posts');
    postsWrap.appendChild(postsTitle);

    watchedState.posts.forEach((post) => {
      const postLinkWrap = document.createElement('div');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.setAttribute('target', '_blank');
      postLink.innerText = post.title;

      postLinkWrap.appendChild(postLink);
      postsWrap.appendChild(postLinkWrap);
    });
  };

  const renderFeeds = (watchedState) => {
    const feedsWrap = document.querySelector('.feeds');
    const feedsTitle = document.createElement('h2');
    feedsTitle.innerText = i18n.t('headings.feeds');

    feedsWrap.appendChild(feedsTitle);

    watchedState.feeds.forEach((feed) => {
      const feedWrap = document.createElement('div');
      const feedTitle = document.createElement('h3');
      const feedSubTitle = document.createElement('p');

      feedTitle.innerText = feed.title;
      feedSubTitle.innerText = feed.description;
      feedWrap.appendChild(feedTitle);
      feedWrap.appendChild(feedSubTitle);
      feedsWrap.appendChild(feedWrap);
    });
  };

  const getRss = (url) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`, { params: { disableCache: true } })
    .then((result) => parseRss(result.data.contents, state.feeds.length, i18n))
    .then((data) => {
      const { feed, posts } = data;
      state.feeds = [...state.feeds, feed];
      state.posts = [...state.posts, ...posts];
      renderPosts(state);
      renderFeeds(state);
      state.form.urlInput = '';
      urlInput.focus();
    })
    .catch((error) => {
      state.form.errors = { urlInput: error.message };
      state.form.valid = false;
    });

  urlInput.addEventListener('input', (e) => {
    state.form.urlInput = e.target.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = await validateUrl(state.form.urlInput, state.feeds);
    state.form.errors = errors;
    state.form.valid = isEmpty(errors);

    if (!state.form.valid) return;

    await getRss(state.form.urlInput);

    console.log(state);
  });
};

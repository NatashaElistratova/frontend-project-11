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
      success: {},
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
    postsWrap.innerHTML = `<div class="card border-0">
                            <div class="card-body"></div>
                          </div>`;

    const postsTitle = document.createElement('h2');
    postsTitle.classList.add('card-title', 'h4');
    postsTitle.innerText = i18n.t('headings.posts');
    postsWrap.querySelector('.card-body').appendChild(postsTitle);

    const postLinkWrap = document.createElement('ul');
    postLinkWrap.classList.add('list-group');
    postsWrap.querySelector('.card').appendChild(postLinkWrap);

    watchedState.posts.forEach((post) => {
      const postLinkItem = document.createElement('li');
      postLinkItem.classList.add('list-group-item', 'border-0');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.setAttribute('target', '_blank');

      postLink.innerText = post.title;
      postLinkItem.appendChild(postLink);
      postLinkWrap.appendChild(postLinkItem);
    });
  };

  const renderFeeds = (watchedState) => {
    const feedsWrap = document.querySelector('.feeds');
    feedsWrap.innerHTML = `<div class="card border-0">
                            <div class="card-body"></div>
                          </div>`;

    const feedsTitle = document.createElement('h2');
    feedsTitle.classList.add('card-title', 'h4');
    feedsTitle.innerText = i18n.t('headings.feeds');

    feedsWrap.querySelector('.card-body').appendChild(feedsTitle);

    const feedWrap = document.createElement('ul');
    feedWrap.classList.add('list-group');
    feedsWrap.querySelector('.card').appendChild(feedWrap);

    watchedState.feeds.forEach((feed) => {
      const feedItem = document.createElement('li');
      feedItem.classList.add('list-group-item', 'border-0');
      const feedTitle = document.createElement('h3');
      feedTitle.classList.add('h6', 'm-0');
      const feedSubTitle = document.createElement('p');
      feedSubTitle.classList.add('small', 'text-black-50', 'm-0');

      feedTitle.innerText = feed.title;
      feedSubTitle.innerText = feed.description;
      feedItem.appendChild(feedTitle);
      feedItem.appendChild(feedSubTitle);
      feedWrap.appendChild(feedItem);
    });
  };

  const getRss = (url) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`, { params: { disableCache: true } })
    .then((result) => parseRss(result.data.contents, state.feeds.length, i18n))
    .then((data) => {
      const { feed, posts } = data;
      state.feeds = [...state.feeds, feed];
      state.posts = [...state.posts, ...posts];
      state.form.success = { urlInput: i18n.t('success.rssAdded') };

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

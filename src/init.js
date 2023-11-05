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

  const getRss = (url) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`, { params: { disableCache: true } });

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

  urlInput.addEventListener('input', (e) => {
    state.form.urlInput = e.target.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = await validateUrl(state.form.urlInput, state.feeds);
    state.form.errors = errors;
    state.form.valid = isEmpty(errors);

    if (!state.form.valid) return;

    getRss(state.form.urlInput)
      .then((result) => parseRss(result.contents, i18n))
      .then((feed) => {
        state.feeds = [...state.feeds, feed];
        state.form.urlInput = '';
        urlInput.focus();
      })
      .catch((error) => {
        state.form.errors = { urlInput: error.message };
        state.form.valid = false;
      });
    console.log(state);
  });
};

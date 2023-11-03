import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import resources from './locales/index.js';
import watch from './view.js';

export default async () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
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

  const initialState = {
    feeds: [],
    form: {
      valid: true,
      errors: {},
      fields: {
        urlInput: '',
      },
    },
  };

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
    state.form.fields.urlInput = e.target.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = await validateUrl(state.form.fields.urlInput, state.feeds);
    state.form.errors = errors;
    state.form.valid = isEmpty(errors);

    if (state.form.valid) {
      state.feeds.push(state.form.fields.urlInput);
      state.form.fields.urlInput = '';
      urlInput.focus();
    }
    console.log(state);
  });
};

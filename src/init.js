import * as yup from 'yup';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import watch from './view.js';

export default () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');

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

  const state = onChange(initialState, watch(urlInput, initialState));

  const schema = yup.string().url('Ссылка должна быть валидным URL');

  const validateUrl = async (el, feeds) => {
    const actualSchema = schema.notOneOf(feeds, 'RSS уже существует');
    try {
      await actualSchema.validate(el, { abortEarly: false });
      return {};
    } catch (e) {
      return { urlInput: e.message };
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

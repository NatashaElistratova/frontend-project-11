import * as yup from 'yup';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';
import has from 'lodash/has.js';
import keyBy from 'lodash/keyBy.js';

export default () => {
  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');
  const errorEl = document.querySelector('.feedback');

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
  const setInputValue = (value) => {
    urlInput.value = value || '';
  };

  const renderError = (el, state) => {
    const { errors } = state.form;
    const error = errors.urlInput;
    const errorMessage = error?.message;

    if (!error) {
      el.classList.remove('is-invalid');
      errorEl.textContent = '';
      return;
    }

    if (errorEl.textContent) {
      errorEl.textContent = errorMessage;
      return;
    }

    el.classList.add('is-invalid');
    errorEl.textContent = errorMessage;
  };

  const renderForm = (el, state) => (path, value, prevValue) => {
    console.log(path);
    switch (path) {
      case 'form.errors':
        renderError(el, state);
        break;
      case 'form.fields.urlInput':
        setInputValue(value);
        break;

      default:
        break;
    }
  };

  const state = onChange(initialState, renderForm(urlInput, initialState));

  const schema = yup.object().shape({
    urlInput: yup.string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(
        [...state.feeds],
        'RSS уже существует',
      ),
  });

  const validate = async (fields) => {
    try {
      await schema.validate(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return keyBy(e.inner, 'path');
    }
  };

  urlInput.addEventListener('input', (e) => {
    state.form.fields.urlInput = e.target.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = await validate(state.form.fields);
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

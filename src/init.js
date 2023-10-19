import * as yup from 'yup';
import onChange from 'on-change';
import isEmpty from 'lodash/isEmpty.js';

export default () => {
  const schema = yup.object().shape({
    url: yup.string().url('Ссылка должна быть валидным URL'),
  });

  const initialState = {
    links: [],
    form: {
      valid: true,
      errors: {},
      fields: {
        urlInput: '',
      },
    },
  };

  const state = onChange(initialState, () => { console.log('changed!'); });

  const validate = (fields) => schema.validate(fields)
    .then((res) => res)
    .catch((e) => e);

  const form = document.querySelector('[data-form="rss-form"]');
  const urlInput = document.querySelector('#url-input');

  urlInput.addEventListener('input', (e) => {
    state.form.fields.urlInput = e.target.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = await validate(state.form.fields);
    state.form.errors = errors;
    state.form.valid = isEmpty(errors);
    console.log(state);
  });
};

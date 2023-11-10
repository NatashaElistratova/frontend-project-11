export default {
  string: {
    url: () => ({ key: 'errors.validation.url' }),
  },
  mixed: {
    required: () => ({ key: 'errors.validation.required' }),
    notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
  },
};

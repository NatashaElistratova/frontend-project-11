const urlInput = document.querySelector('#url-input');

const renderError = (el, state) => {
  const errorEl = document.querySelector('.feedback');
  const { errors } = state.form;
  const errorMessage = errors.urlInput;

  if (!errorMessage) {
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

export default (el, state) => (path, value) => {
  switch (path) {
    case 'form.errors':
      renderError(el, state);
      break;
    case 'form.urlInput':
      urlInput.value = value || '';
      break;

    default:
      break;
  }
};

const urlInput = document.querySelector('#url-input');

const renderError = (el, state) => {
  const feedbackEl = document.querySelector('.feedback');
  const { errors } = state.form;
  const errorMessage = errors.urlInput;

  if (!errorMessage) {
    el.classList.remove('is-invalid');
    feedbackEl.textContent = '';
    return;
  }

  if (feedbackEl.textContent) {
    feedbackEl.textContent = errorMessage;
    return;
  }

  el.classList.add('is-invalid');
  feedbackEl.textContent = errorMessage;
};

const renderSuccess = (el, state) => {
  const feedbackEl = document.querySelector('.feedback');
  const { success } = state.form;
  const successMessage = success.urlInput;

  el.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = successMessage;
};

export default (el, state) => (path, value) => {
  switch (path) {
    case 'form.errors':
      renderError(el, state);
      break;
    case 'form.success':
      renderSuccess(el, state);
      break;
    case 'form.urlInput':
      urlInput.value = value || '';
      break;

    default:
      break;
  }
};

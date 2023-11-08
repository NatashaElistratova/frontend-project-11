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
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
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

const renderPosts = (watchedState, i18n) => {
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

const renderFeeds = (watchedState, i18n) => {
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

export default (el, state, i18n) => (path, currentValue) => {
  switch (path) {
    case 'form.errors':
      renderError(el, state);
      break;
    case 'form.success':
      renderSuccess(el, state);
      break;
    case 'form.urlInput':
      urlInput.value = currentValue || '';
      break;
    case 'posts':
      renderPosts(state, i18n);
      break;
    case 'feeds':
      renderFeeds(state, i18n);
      break;

    default:
      break;
  }
};

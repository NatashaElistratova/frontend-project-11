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

  el.classList.add('is-invalid');
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
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

const renderPosts = (posts, i18n) => {
  if (!document.querySelector('.posts .card')) {
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
  }

  const postElements = posts.map((post) => {
    const postLinkItem = document.createElement('li');
    postLinkItem.classList.add('list-group-item', 'border-0');
    const postLink = document.createElement('a');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');

    postLink.innerText = post.title;
    postLinkItem.appendChild(postLink);
    return postLinkItem;
  });

  const postsWrap = document.querySelector('.posts .card .list-group');
  postsWrap.prepend(...postElements);
};

const renderFeeds = (feed, i18n) => {
  if (!document.querySelector('.feeds .card')) {
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
  }

  // const feedElements = feeds.map((feed) => {
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
  // });

  const feedsWrap = document.querySelector('.feeds .card .list-group');
  feedsWrap.prepend(feedItem);
};

const watchFeeds = (currentValue, prevValue, i18n) => {
  const newFeed = currentValue.find((feed) => !prevValue.some((el) => el.id === feed.id));
  renderFeeds(newFeed, i18n);
};

const watchPosts = (currentValue, prevValue, i18n) => {
  const newPosts = currentValue.filter((post) => !prevValue.some((el) => el.id === post.id));
  renderPosts(newPosts, i18n);
};

export default (el, state, i18n) => (path, currentValue, prevValue) => {
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
    case 'feeds':
      watchFeeds(currentValue, prevValue, i18n);
      break;
    case 'posts':
      watchPosts(currentValue, prevValue, i18n);
      break;

    default:
      break;
  }
};

const renderError = (el, state, i18n) => {
  const feedbackEl = document.querySelector('.feedback');
  const { errors } = state.form;
  const errorMessage = i18n.t(errors.urlInput);

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

const renderSuccess = (el, i18n) => {
  const feedbackEl = document.querySelector('.feedback');
  const successMessage = i18n.t('success.rssAdded');

  el.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = successMessage;
};

const renderModal = (post) => {
  const modal = document.querySelector('.modal');
  const title = modal.querySelector('.modal-title');
  const description = modal.querySelector('.modal-body');
  const link = modal.querySelector('a');

  title.textContent = post.title;
  description.textContent = post.description;
  link.setAttribute('href', post.link);
};

const renderListWrapper = (element, title) => {
  const cardEl = document.createElement('div');
  const cardBody = document.createElement('div');
  const titleEl = document.createElement('h2');
  const list = document.createElement('ul');

  cardEl.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  titleEl.classList.add('card-title', 'h4');
  list.classList.add('list-group');

  titleEl.textContent = title;

  cardBody.append(titleEl);
  cardEl.append(cardBody);
  cardEl.append(list);
  element.append(cardEl);
};

const renderPosts = (posts, i18n) => {
  if (!document.querySelector('.posts .card')) {
    const postsWrap = document.querySelector('.posts');
    const title = i18n.t('headings.posts');
    renderListWrapper(postsWrap, title);
  }

  const postElements = posts.map((post) => {
    const postItem = document.createElement('li');
    postItem.classList.add(
      'list-group-item',
      'border-0',
      'd-flex',
      'justify-content-between',
      'align-items-center',
    );
    const postLink = document.createElement('a');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('data-id', post.id);
    postLink.classList.add('fw-bold');

    const postBtn = document.createElement('button');
    postBtn.setAttribute('type', 'button');
    postBtn.setAttribute('data-bs-toggle', 'modal');
    postBtn.setAttribute('data-bs-target', '#postModal');
    postBtn.setAttribute('data-id', post.id);
    postBtn.classList.add('btn', 'btn-outline-primary');
    postBtn.textContent = 'Просмотр';
    postBtn.addEventListener('click', () => renderModal(post));

    postLink.textContent = post.title;
    postItem.appendChild(postLink);
    postItem.appendChild(postBtn);
    return postItem;
  });

  const postsWrap = document.querySelector('.posts .card .list-group');
  postsWrap.prepend(...postElements);
};

const renderFeeds = (feed, i18n) => {
  if (!document.querySelector('.feeds .card')) {
    const feedsWrap = document.querySelector('.feeds');
    const title = i18n.t('headings.feeds');
    renderListWrapper(feedsWrap, title);
  }

  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0');
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  const feedSubTitle = document.createElement('p');
  feedSubTitle.classList.add('small', 'text-black-50', 'm-0');

  feedTitle.textContent = feed.title;
  feedSubTitle.textContent = feed.description;
  feedItem.appendChild(feedTitle);
  feedItem.appendChild(feedSubTitle);

  const feedsWrap = document.querySelector('.feeds .card .list-group');
  feedsWrap.prepend(feedItem);
};

const watchFeeds = (currentValue, prevValue, i18n) => {
  const newFeed = currentValue.find(
    (feed) => !prevValue.some((el) => el.id === feed.id),
  );

  renderFeeds(newFeed, i18n);
};

const watchPosts = (currentValue, prevValue, i18n) => {
  const newPosts = currentValue.filter(
    (post) => !prevValue.some((el) => el.id === post.id),
  );

  renderPosts(newPosts, i18n);
};

const watchVisitedPosts = (currentValue) => {
  const visitedPostId = [...currentValue].pop();
  const visitedPost = document.querySelector(`[data-id="${visitedPostId}"]`);
  visitedPost.classList.remove('fw-bold');
  visitedPost.classList.add('fw-normal', 'link-secondary');
};

const watchStatus = (process, elements, state, i18n) => {
  const { urlInput, submitBtn } = elements;

  switch (process) {
    case 'processing':
      submitBtn.disabled = true;
      break;
    case 'success':
      renderSuccess(urlInput, i18n);
      submitBtn.disabled = false;
      urlInput.focus();
      break;
    case 'error':
      renderError(urlInput, state, i18n);
      submitBtn.disabled = false;
      break;

    default:
      break;
  }
};

export default (elements, state, i18n) => (path, currentValue, prevValue) => {
  const { urlInput } = elements;

  switch (path) {
    case 'form.status':
      watchStatus(currentValue, elements, state, i18n);
      break;
    case 'form.urlInput':
      urlInput.value = currentValue;
      break;
    case 'feeds':
      watchFeeds(currentValue, prevValue, i18n);
      break;
    case 'posts':
      watchPosts(currentValue, prevValue, i18n);
      break;
    case 'visitedPosts':
      watchVisitedPosts(currentValue);
      break;
    default:
      break;
  }
};

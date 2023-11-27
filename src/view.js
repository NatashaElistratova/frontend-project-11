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

const renderModal = (post) => {
  const modal = document.querySelector('.modal');
  const title = modal.querySelector('.modal-title');
  const description = modal.querySelector('.modal-body');
  const link = modal.querySelector('a');

  title.innerText = post.title;
  description.innerHTML = post.description;
  link.setAttribute('href', post.link);
};

const renderListWrapper = (element, title) => {
  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'border-0');
  cardEl.innerHTML = `<div class="card-body">
                        <h2 class"card-title h4">${title}</h2>
                      </div>
                      <ul class="list-group"></ul>`;
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
    postBtn.innerText = 'Просмотр';
    postBtn.addEventListener('click', () => renderModal(post));

    postLink.innerText = post.title;
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

  feedTitle.innerText = feed.title;
  feedSubTitle.innerText = feed.description;
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

export default (el, state, i18n) => (path, currentValue, prevValue) => {
  switch (path) {
    case 'form.errors':
      renderError(el, state);
      break;
    case 'form.success':
      renderSuccess(el, state);
      break;
    case 'form.urlInput':
      const input = el;
      input.value = currentValue || '';
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

export default (str, feedUrl, state, i18n) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    const errorMessage = i18n.t('errors.parsingError');
    throw new Error(errorMessage);
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const feedId = state.feeds.length;

  const items = doc.querySelectorAll('item');
  const postsLength = state.posts.length;
  const posts = [...items].map((item, idx) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const id = postsLength + idx;

    return {
      id, feedId, title, description, link,
    };
  });

  return {
    id: feedId,
    url: feedUrl,
    title: feedTitle,
    description: feedDescription,
    posts,
  };
};

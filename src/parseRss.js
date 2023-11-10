export default (str, feedUrl, feedId, i18n) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    const errorMessage = i18n.t('errors.parsingError');
    throw new Error(errorMessage);
  }

  const feedTitle = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item, id) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;

    return {
      id, title, link, feedId,
    };
  });

  return {
    id: feedId, url: feedUrl, title: feedTitle, description, posts,
  };
};

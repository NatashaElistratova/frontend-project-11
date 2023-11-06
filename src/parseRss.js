export default (str, feedId, i18n) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    const errorMessage = i18n.t('errors.parsingError');
    throw new Error(errorMessage);
  }

  const feedTitle = doc.querySelector('title').innerHTML;
  const description = doc.querySelector('description').innerHTML;
  const feed = { id: feedId, title: feedTitle, description };

  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item, id) => {
    const title = item.querySelector('title').innerHTML;
    const link = item.querySelector('link').innerHTML;

    return {
      id, title, link, feedId,
    };
  });

  return { feed, posts };
};

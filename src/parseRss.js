export default (str, i18n) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(str, 'text/xml');
  const errorNode = feed.querySelector('parsererror');

  if (!errorNode) {
    return new Promise((resolve) => {
      resolve(feed);
    });
  }

  const errorMessage = i18n.t('errors.parsingError');
  throw new Error(errorMessage);
};

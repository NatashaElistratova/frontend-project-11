export default (str, i18n) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(str, 'text/xml');
  const errorNode = feed.querySelector('parsererror');

  return new Promise((resolve, reject) => {
    if (!errorNode) {
      resolve(feed);
    } else {
      const errorMessage = i18n.t('errors.parsingError');
      reject(new Error(errorMessage));
    }
  });
};

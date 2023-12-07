export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    throw new Error({ code: 'err_parser', message: errorNode });
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;

  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    return {
      title, description, link,
    };
  });

  return {
    title: feedTitle,
    description: feedDescription,
    posts,
  };
};

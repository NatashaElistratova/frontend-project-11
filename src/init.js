import App from './App.js';

export default () => {
  const element = document.getElementById('app');
  return new App(element);
};

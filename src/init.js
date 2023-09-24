import App from './App.js';

export default () => {
  const element = document.getElementById('app');
  const obj = new App(element);
  obj.init();
};

import '../scss/app.scss';
import i18next from 'i18next';
import * as resources from '../lang/index';
import app from './app';

async function main() {
  // Create locale control instance
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });

  // Mount app
  const target = document.getElementById('app');
  app(target, i18nextInstance);
}

main();

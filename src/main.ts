import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import Title from './mixins/Title';
import packageJSON from '../package.json';
import { createPinia } from 'pinia';

const app = createApp(App);

app.config.globalProperties.$appInformation = {
  version: packageJSON.version,
  dependencies: packageJSON.dependencies,
  devDependencies: packageJSON.devDependencies
};

app.use(createPinia()).use(router).mixin(Title).mount('#app');

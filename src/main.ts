import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import i18n from "./utils/i18n";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  app.use(i18n);
  return {
    app,
  };
}

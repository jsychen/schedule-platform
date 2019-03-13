// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router/index.js';
import VueRouter from 'vue-router';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import $ from 'jquery';
import store from 'storejs';
import conversion from '@/utils/conversion';

Vue.config.productionTip = false
Vue.use(VueRouter);

Vue.use(iView);

import Element from 'element-ui'; 
Vue.use(Element)

Vue.prototype.$store = store;
Vue.prototype.$conversion = conversion;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  render:h => h(App)
})

import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import Drip from 'drip-libs';
import 'ant-design-vue/dist/antd.css';
import 'drip-libs/style';

Vue.use(Antd);
Vue.use(Drip);

new Vue({
  el: '#app',
  render: h => h(App),
});

import antDirective from '../_util/antDirective';
import clipboard from '../_util/clipboard'
const base = {};
let span = null;
const install = function(Vue) {
  base.Vue = Vue;
  Vue.use(antDirective);
  Vue.use({
    install: vue => {
      vue.prototype.$textCopy = text => {
        if(!span) {
          span = document.createElement('span')
          span.style.display = 'none'
          document.body.append(span)
          span.onclick = e => {
            e.target.innerText && clipboard(e.target.innerText, e)
          }
        }
        span.innerText = text
        span.click()
      }
    }
  });
};
base.install = install;

export default base;

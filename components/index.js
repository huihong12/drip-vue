/* @remove-on-es-build-begin */
// this file is not used if use https://github.com/ant-design/babel-plugin-import
const ENV = process.env.NODE_ENV;
if (
  ENV !== 'production' &&
  ENV !== 'test' &&
  typeof console !== 'undefined' &&
  console.warn &&
  typeof window !== 'undefined'
) {
  console.warn(
    'You are using a whole package of antd, ' +
      'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}
/* @remove-on-es-build-end */

import { default as Base } from './base';

import { default as LocaleProvider } from './locale-provider';

import { default as version } from './version';

import { default as ConfigProvider } from './config-provider';

import { default as FormGenerator } from './form-generator';

import { default as Tabs } from './tabs';
import { default as Table } from './table';
import { default as FilePreview } from './file-preview';
import { default as FileUpload } from './file-upload';
import { default as formModal } from './form-modal';
import { default as PDF } from './file-preview/pdf';


const components = [
  Base,
  LocaleProvider,
  ConfigProvider,
  FormGenerator,
  Tabs,
  Table,
  FilePreview,
  FileUpload,
  formModal,
  PDF
];

const install = function(Vue) {
  components.map(component => {
    Vue.use(component);
  });

  Vue.prototype.$filePreview = FilePreview.show;
  Vue.prototype.$formModal = formModal.show;
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  Base,
  version,
  install,
  LocaleProvider,
  ConfigProvider,
  FormGenerator,
  Tabs,
  Table,
  FilePreview,
  FileUpload,
  formModal,
  PDF
};

export default {
  version,
  install,
};

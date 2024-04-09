import Vue from 'vue';
import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { filterEmpty } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import LocaleProvider, { MARK } from '../locale-provider';
import LocaleReceiver from '../locale-provider/LocaleReceiver';

function getWatch(keys = []) {
  const watch = {};
  keys.forEach(k => {
    watch[k] = function(value) {
      this._proxyVm._data[k] = value;
    };
  });
  return watch;
}

const ConfigProvider = {
  name: 'DripConfigProvider',
  props: {
    prefixCls: PropTypes.string,
    locale: PropTypes.object,
    fileUploadConfig: PropTypes.object
  },
  provide() {
    const _self = this;
    this._proxyVm = new Vue({
      data() {
        return {
          ..._self.$props,
          getPrefixCls: _self.getPrefixCls
        };
      },
    });
    return {
      configProvider: this._proxyVm._data,
    };
  },
  watch: {
    ...getWatch([
      'prefixCls',
      'fileUploadConfig',
      'locale'
    ]),
  },
  methods: {
    getPrefixCls(suffixCls, customizePrefixCls) {
      const { prefixCls = 'drip' } = this.$props;
      if (customizePrefixCls) return customizePrefixCls;
      return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
    },
    renderProvider(legacyLocale) {
      return (
        <LocaleProvider locale={this.locale || legacyLocale} _MARK__={MARK}>
          {this.$slots.default ? filterEmpty(this.$slots.default)[0] : null}
        </LocaleProvider>
      );
    },
  },

  render() {
    return (
      <LocaleReceiver
        scopedSlots={{ default: (_, __, legacyLocale) => this.renderProvider(legacyLocale) }}
      />
    );
  },
};

/* istanbul ignore next */
ConfigProvider.install = function(Vue) {
  Vue.use(Base);
  Vue.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;

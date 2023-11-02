import PropTypes from '../_util/vue-types';
import { initDefaultProps, getComponentFromProp } from '../_util/props-util';
import Base from '../base';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

export const tabsProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.array.def(() => ([])),
  options: PropTypes.array.def(() => ([])),
  multiple: PropTypes.bool,
  type: PropTypes.oneOf(['line','block']),
  label: PropTypes.string,
  allValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}, {multiple: false, type: 'line'});

const Tabs = {
  name: 'DripTabs',
  props: tabsProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {}
  },
  methods: {
    change(item) {
      this.$emit(
        'change',
        item.value === this.allValue
          ? [this.allValue]
          : this.value.includes(item.value)
          ? this.multiple && this.value.length !== 1
            ? this.value.filter((it) => it !== item.value)
            : this.value
          : this.multiple
          ? this.allValue !== undefined &&
            this.value.concat(item.value).filter((it) => it !== this.allValue).length === this.options.length - 1
            ? [this.allValue]
            : this.value.concat(item.value).filter((it) => it !== this.allValue)
          : [item.value]
      )
    }
  },

  render() {
    const { value, label, type, options, prefixCls: customizePrefixCls, } = this
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('tabs', customizePrefixCls);
    const right = getComponentFromProp(this, 'right');

    return <div class={`${prefixCls} ${prefixCls}-${type}`}>
      <ul class={`${prefixCls}-left`}>
        {label && <li class={`${prefixCls}-left-label`}>{ label }</li>}
        {
          options.map(item => (<li
            class={{[`${prefixCls}-selected`]: value.includes(item.value)}}
            onClick={()=>{this.change(item)}}>
            {item.label}
            {item.badge && <div class={`${prefixCls}-badge`}>{ item.maxBadge ? (item.badge > item.maxBadge ? `${item.maxBadge}+` : item.badge) : (item.badge > 9 ? '9+' : item.badge)}</div>}
          </li>))
        }
      </ul>
      <div class={`${prefixCls}-right`}>
        {right}
      </div>
    </div>;
  },
};

/* istanbul ignore next */
Tabs.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Tabs.name, Tabs);
};

export default Tabs;

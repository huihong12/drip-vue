import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { initDefaultProps,} from 'ant-design-vue/lib/_util/props-util';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';
import { filterEmpty } from 'ant-design-vue/lib/_util/props-util';

import Icon from 'ant-design-vue/lib/icon';
import FormItem from 'ant-design-vue/lib/form-model/FormItem';
import { FormItemProps } from 'ant-design-vue/lib/form-model/FormItem';
import Select from 'ant-design-vue/lib/select';
import Radio from 'ant-design-vue/lib/radio';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/form-model/style';
import 'ant-design-vue/lib/select/style';
import 'ant-design-vue/lib/radio/style';
import 'ant-design-vue/lib/tooltip/style';

export const formItemProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.any,
  formItem: FormItemProps,
  field: PropTypes.object,
}, {});

const changeHandler = function(props, val, ...reset) {
  switch (this.field.tag) {
    case 'a-input':
    case 'a-input-password':
    case 'a-textarea':
    case 'a-input-search':
    case 'a-radio-group':
      this.$emit('change', typeof val.target.value === 'string' ? val.target.value.trim() : val.target.value)
      break;
    case 'file-upload':
      this.$emit('change', val)
      break;
    case 'a-select':
      let _val = val
      if(props.dataType === 'array') {
        _val = [val]
      }
      this.$emit('change', _val)
      break;
    default:
      this.$emit('change', typeof val === 'string' ? val.trim() : val)
      break;
  }
  this.field.on && this.field.on.change && this.field.on.change(val, ...reset)
}

const blurHandler = function(...reset) {
  this.$emit('blur', ...reset)
  this.field.on && this.field.on.blur && this.field.on.blur(...reset)
}

export default {
  name: 'DripFormItem',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: formItemProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  methods: {
    getSelectOptions(opt) {
      return <Select.Option key={opt.value} disabled={opt.disabled} class={opt.class} value={opt.value} label={opt.label}>
        <span {...{domProps: {title: opt.label}}}>{opt.label}</span>
      </Select.Option>
    }
  },

  render(h) {
    const {
      prefixCls: customizePrefixCls,
      field,
      formItem,
      $slots,
    } = this;
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('form-item', customizePrefixCls);

    if(typeof field.getOptions === 'function') {
      this.$set(field, 'options', field.getOptions())
    }

    let children = []
    if(field.tag === 'span') {
      children = [<span {...{domProps: { innerHTML: this.value || '' }}}></span>]
    }
    if(field.tag === 'a-select' && field.options instanceof Array && field.options.length) {
      children = field.options.map(opt => {
        if(opt.group instanceof Array && opt.group.length) {
          return <Select.OptGroup key={opt.value} label={opt.label}>
            {opt.group.map(_opt => this.getSelectOptions(_opt))}
          </Select.OptGroup>
        }
        return this.getSelectOptions(opt)
      })
      delete field.options
    }
    if(field.tag === 'a-radio-group') {
      if(field.options instanceof Array && field.radioType === 'button') {
        children = field.options.map(opt => <Radio.Button key={opt.value} disabled={opt.disabled} class={opt.class} value={opt.value} label={opt.label}>
          <span>{opt.label}</span>
        </Radio.Button>)
        delete field.options
      }
    }
    let props = {}
    if(['a-date-picker', 'a-range-picker'].includes(field.tag)) {
      props.valueFormat = field.valueFormat !== undefined ? field.valueFormat : 'YYYY-MM-DD'
    }
    if(['a-input', 'a-select', 'a-input-search'].includes(field.tag)) {
      props.allowClear = field.allowClear !== undefined ? field.allowClear : true
      props.showArrow = field.showArrow !== undefined ? field.showArrow : true
    }
    if(['table-input','drip-table'].includes(field.tag)) {
      props.prop = formItem.prop
    }
    if(['a-select'].includes(field.tag)) {
      props.showSearch = field.showSearch !== undefined ? props.showSearch : true
      props.dropdownMatchSelectWidth = field.dropdownMatchSelectWidth !== undefined ? props.dropdownMatchSelectWidth : false
      props.filterOption = (inputValue, option) => {
        return option.data.props.label.includes(inputValue)
      }
    }
    if(['a-cascader'].includes(field.tag)) {
      props.showSearch = field.showSearch !== undefined ? field.showSearch : { matchInputWidth: false }
    }
    if(['drip-form-group'].includes(field.tag)) {
      props.label = formItem.label
      props.prop = formItem.prop
    }
    let value = this.value
    if(field.tag === 'a-select' && field.dataType === 'array' && value instanceof Array) {
      value = value[0]
    }
    Object.assign(props, {
      ...field,
      value,
      disabled: field.readonly,
      on: undefined,
      change: undefined,
      blur: undefined
    })

    const validateStatusTipsEl = <Tooltip>
      <template slot="title">{field.validateStatusTips}</template>
      <Icon type={'exclamation-circle'} style="position:absolute;top:4px;right:-20px;cursor:pointer;" />
    </Tooltip>

    const labelRender = () => {
      if(!formItem.label || field.tag === 'drip-form-group') return null
      const children = []
      if(formItem.tips && formItem.tips.type && formItem.tips.value) {
        children.push(<Tooltip>
          <template slot="title">{formItem.tips.type === 'image' ? <img style="width:100%;" class={`${prefixCls}-tips-image`} /> : <span class={`${prefixCls}-tips-text`}>{formItem.tips.value}</span>}</template>
          <Icon class={`${prefixCls}-question-circle-icon`} type={'question-circle'} style="margin-left:5px;" />
        </Tooltip>)
      }
      if(formItem.helpLink && formItem.helpLink.link && formItem.helpLink.label) {
        children.push(<a href={formItem.helpLink.link} target="_blank" style="margin-left:5px;">{formItem.helpLink.label}</a>)
      }
      return <span>
        <span {...{domProps: { innerHTML: formItem.label }}} class={`${prefixCls}-label`}></span>
        {children}
      </span>
    };
    const formItemProps = {
      props: {
        ...formItem,
        label: labelRender
      },
      class: formItem.class,
      style: formItem.style
    };
    return <FormItem {...formItemProps}>{
      h(field.tag, {
        props,
        on: {
          ...field.on,
          change: changeHandler.bind(this, props),
          blur: blurHandler.bind(this)
        },
        class: field.class,
        style: field.style
      }, children)
    }{field.validateStatusTips ? validateStatusTipsEl : null}{filterEmpty($slots.default)}</FormItem>;
  },
};

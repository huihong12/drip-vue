import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { initDefaultProps } from 'ant-design-vue/lib/_util/props-util';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

import FormItem from './FormItem';
import { Row, Col } from 'ant-design-vue/lib/grid';
import { ColProps } from 'ant-design-vue/lib/grid/Col';
import 'ant-design-vue/lib/grid/style';

export const formGroupProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.object.def(() => ({})),
  rowProps: PropTypes.object.def(() => ({})),
  colProps: PropTypes.objectOf(ColProps).def(() => ({})),
  prop: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.array,
  readonly: PropTypes.bool
}, {readonly:false});

export default {
  name: 'DripFormGroup',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: formGroupProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  methods: {
    renderHead(prefixCls) {
      if(!this.label) return null
      return <h2 class={`${prefixCls}-title`} {...{domProps: {innerHTML: this.label}}}></h2>
    }
  },

  render() {
    const {
      prefixCls: customizePrefixCls,
      prop,
      readonly,
      rowProps,
      colProps,
      children,
      value,
    } = this;
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('form-group', customizePrefixCls);

    return <div class={`${prefixCls}`}>
      {this.renderHead(prefixCls)}
      <div class={`${prefixCls}-content`}>
        <Row {...{props: rowProps}}>
          {
            children && children.map(item => {
              const formItemProps = {
                props: {
                  value: value[item.formItem.prop],
                  formItem: {
                    ...item.formItem,
                    prop: `${prop.indexOf('.') !== -1 ? '.' : ''}${prop}.${item.formItem.prop}`
                  },
                  field: {...item.field, readonly: item.field.readonly || readonly},
                  groupProp: prop
                },
                on: {
                  change: (val) => {
                    this.$set(value, item.formItem.prop, val)
                    this.$emit('change', value)
                    typeof item.field.change === 'function' && item.field.change(val)
                  },
                  blur: (...reset) => {
                    this.$emit('blur', ...reset)
                    typeof item.field.blur === 'function' && item.field.blur(...reset)
                  }
                }
              };
              return <Col {...{props: (item.formItem.colProps || colProps)}} key={item.formItem.prop}>
                <FormItem {...formItemProps} />
              </Col>
            })
          }
        </Row>
      </div>
    </div>;
  },
};

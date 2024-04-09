import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { filterEmpty } from 'ant-design-vue/lib/_util/props-util';
import { initDefaultProps } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import FormItem, { formItemProps } from './FormItem';
import FormGroup from './FormGroup';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

import FormModel from 'ant-design-vue/lib/form-model';
import 'ant-design-vue/lib/form-model/style';
import 'ant-design-vue/lib/row/style';
import 'ant-design-vue/lib/col/style';

export const formGeneratorProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.object.def(() => ({})),
  formType: PropTypes.oneOf(['step','default']),
  formProfile: PropTypes.arrayOf(formItemProps).def(() => ([])),
  readonly: PropTypes.bool
}, {readonly: false,formType: 'default'});

const FormGenerator = {
  name: 'DripFormGenerator',
  props: formGeneratorProps,
  FormItem: FormItem,
  FormGroup: FormGroup,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      step: {
        prop: '',
        index: 0
      },
      validateStatus: {},
      formRef: null
    }
  },
  async mounted() {
    this.formRef = this.$refs.form

    if(this.formType === 'step') {
      await this.validateStatusInit()
    }
  },
  methods: {
    async validateStep(step) {
      return new Promise((res, rej)=>{
        const index = this.formProfile.findIndex(item => item.formItem.prop === step.prop)
        const fields = this.formProfile[index].field.children.map(item => {
          return `${this.formProfile[index].formItem.prop}.${item.formItem.prop}`
        })
        let cur = 0
        let _rule = null
        this.$refs.form.validateField(fields, (errMsg, rule) => {
          ++cur
          if(!_rule) _rule = rule
          if(cur === fields.length) {
            this.$set(this.validateStatus, this.formProfile[index].formItem.prop, _rule ? false : true)
            res()
          }
        })
      })
    },
    async validateStatusInit() {
      const group = this.formProfile.filter(item => item.field.tag === 'drip-form-group')
      let step
      for (let index = 0; index < group.length; index++) {
        const item = group[index]
        if(index === 0) this.step = {index, prop: item.formItem.prop}
        await this.validateStep({prop: item.formItem.prop, index})
        if(!this.readonly && !this.validateStatus[item.formItem.prop] && !step) {
          step = {index, prop: item.formItem.prop}
        }
      }
      this.step = step
      this.$refs.form.clearValidate()
    },
    async stepChange(target, forc) {
      if(forc) {
        this.step = target
        return
      }
      await this.validateStep(this.step)
      const targetStepIndex = this.formProfile.findIndex(item => item.formItem.prop === target.prop)
      if(targetStepIndex > this.step.index) {
        this.formProfile
          .filter(item => item.field.tag === 'drip-form-group')
          .slice(this.step.index, targetStepIndex)
          .every(item => this.validateStatus[item.formItem.prop]) && (this.step = target)
      }
      if(targetStepIndex < this.step.index) {
        this.step = target
      }
    },
    renderStepNav() {
      if(this.formType !== 'step') {
        return null
      }
      return <div class="slide">
        <ul>
          {
            this.formProfile.filter(item => item.field.tag === 'drip-form-group').map((item, i) => (
              <li class={{cur: this.step.prop === item.formItem.prop, finished: this.validateStatus[item.formItem.prop]}} onClick={()=>{this.stepChange({prop: item.formItem.prop, index: i}, this.readonly)}}>{item.formItem.label}</li>
            ))
          }
        </ul>
      </div>
    },
  },

  render() {
    const { value, readonly, formType, formProfile, step, $slots, prefixCls: customizePrefixCls, } = this
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('form', customizePrefixCls);

    return <div class={`${prefixCls} ${prefixCls}-${formType}`}>
      {this.renderStepNav()}
      <div class={`${prefixCls}-wrapper`}>
        <FormModel {...{props: {model: value}, ref: 'form'}}>
          {
            formProfile.map(item => {
              const formItemProps = {
                props: {
                  value: value[item.formItem.prop],
                  formItem: {...item.formItem, class: formType === 'step' && item.field.tag === 'drip-form-group' && step.prop !== item.formItem.prop ? 'hide' : 'show'},
                  field: {...item.field, readonly: item.field.readonly || readonly}
                },
                on: {
                  change: (val) => {
                    this.$set(value, item.formItem.prop, val)
                    this.$emit('change', value)
                    typeof item.field.change === 'function' && item.field.change(value)
                  },
                  blur: (...reset) => {
                    this.$emit('blur', ...reset)
                    typeof item.field.blur === 'function' && item.field.blur(...reset)
                  }
                }
              };
              return <FormItem {...formItemProps}/>
            })
          }
          {filterEmpty($slots.default)}
        </FormModel>
      </div>
    </div>;
  },
};

/* istanbul ignore next */
FormGenerator.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FormItem.name, FormItem);
  Vue.component(FormGroup.name, FormGroup);
  Vue.component(FormGenerator.name, FormGenerator);
};

export default FormGenerator;

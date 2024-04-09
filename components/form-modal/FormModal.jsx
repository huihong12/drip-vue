import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { initDefaultProps } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';
import FormGenerator, { formGeneratorProps } from '../form-generator'

import Modal from 'ant-design-vue/lib/modal';
import Icon from 'ant-design-vue/lib/icon';
import Dropdown from 'ant-design-vue/lib/dropdown';
import Menu from 'ant-design-vue/lib/menu';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/dropdown/style';
import 'ant-design-vue/lib/menu/style';
import 'ant-design-vue/lib/button/style';
import 'ant-design-vue/lib/icon/style';
import 'ant-design-vue/lib/modal/style';

export const formModalProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  formGenerator: PropTypes.objectOf(formGeneratorProps).def(() => ({})),
  actions: PropTypes.array
}, {value: false, width: 520, title: '表单'});

const FormModal = {
  name: 'DripFormModal',
  props: formModalProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      fullscreen: false
    }
  },
  computed: {},
  watch: {},
  methods: {},

  render() {
    const { value, title, width, prefixCls: customizePrefixCls, fullscreen, formGenerator, actions } = this
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('form-modal', customizePrefixCls);

    const modalProps = {
      class: { fullscreen, [prefixCls]: !!prefixCls },
      props: {
        visible: value,
        footer: () => {
          return actions&&actions.map((action,i)=>{
            if(!(typeof action.show === 'boolean' ? action.show : action.show(action,i))) return null
            if(action.children && action.children.length) {
              if(action.children.some((item) => typeof item.show === 'boolean' ? item.show : item.show(action,i))) {
                return <Dropdown {...actions.dropdown}>
                  <span class={`${prefixCls}-column-actions-dropdown-item`} onClick={(e) => e.preventDefault()}>
                    { action.label } <Icon type="down" />
                  </span>
                  <template slot="overlay">
                    <Menu>
                      {
                        action.children.map((childrenAction, j)=>{
                          if(!(typeof childrenAction.show === 'boolean' ? childrenAction.show : childrenAction.show(childrenAction, j))) return null
                          return <Menu.Item onClick={()=>{childrenAction.handler && childrenAction.handler(childrenAction, j)}}>
                            {childrenAction.prefix && <Icon type={childrenAction.prefix} />} { childrenAction.label }
                          </Menu.Item>
                        }).filter(item=>item)
                      }
                    </Menu>
                  </template>
                </Dropdown>
              }
            }else {
              return <Button {...{props: { loading: action.loading, type: action.type }}} onClick={()=>{action.handler && action.handler(formGenerator.props.value,this.$refs.form.formRef,()=>{this.$emit('change', false)},formGenerator)}}>{ action.label }</Button>
            }
          }).filter(item=>item)
        },
        zIndex: 999,
        centered: true,
        maskClosable: false,
        width,
        title: () => {
          return <div>
            {title}
            <button class="ant-modal-close" style="right: 56px;">
              <span class="ant-modal-close-x"><Icon class="anticon anticon-close ant-modal-close-icon" {...{props: {type:fullscreen?'fullscreen-exit':'fullscreen'},on:{ click: ()=>{ this.fullscreen=!this.fullscreen } }}} /></span>
            </button>
          </div>
        }
      },
      on: {
        cancel:() => {
          this.$emit('change', false)
        }
      }
    }
    return <Modal {...modalProps}>
      <div class={`${prefixCls}-form-modal-wrapper`}>
        <FormGenerator {...{...formGenerator,on: {...formGenerator.on,change:val=>this.$set(formGenerator.props, 'value', val)}}} ref={"form"}></FormGenerator>
      </div>
    </Modal>
  },
};

/* istanbul ignore next */
FormModal.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FormModal.name, FormModal);
};

export default FormModal;

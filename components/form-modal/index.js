import FormModal from './FormModal';
import Base from '../base';

let FormModalInstance = null;

FormModal.show = function show(config) {
  if(FormModalInstance) {
    Object.assign(FormModalInstance.formModalProps.props, config, {value: true})
    FormModalInstance.$forceUpdate()
    return FormModalInstance
  }
  let currentConfig = { ...config, value: true };
  const formModalProps = { props: {}, on: { change: val => { currentConfig.value = val } } };
  const div = document.createElement('div');
  const el = document.createElement('div');
  div.appendChild(el);
  document.body.appendChild(div);


  function render(props) {
    formModalProps.props = props;
    const V = Base.Vue || Vue;
    return new V({
      el,
      parent: config.parentContext,
      data() {
        return { formModalProps };
      },
      render() {
        // 先解构，避免报错，原因不详
        const cdProps = { ...this.formModalProps };
        return <FormModal {...cdProps} />;
      },
    });
  }

  FormModalInstance = render(currentConfig);
  return FormModalInstance;
}

/* istanbul ignore next */
FormModal.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FormModal.name, FormModal);
};

export default FormModal;

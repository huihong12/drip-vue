import PropTypes from '../_util/vue-types';
import { ConfigConsumerProps } from './configConsumerProps';

const RenderEmpty = {
  functional: true,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  props: {
    componentName: PropTypes.string,
  },
  render(createElement, context) {
    const { props, injections } = context;
    function renderHtml(componentName) {
      const getPrefixCls = injections.configProvider.getPrefixCls;
      const prefix = getPrefixCls('empty');
      switch (componentName) {
        case 'Table':
        case 'List':
          return <div>没有内容</div>;

        case 'Select':
        case 'TreeSelect':
        case 'Cascader':
        case 'Transfer':
        case 'Mentions':
          return <div class={`${prefix}-small`}>没有内容</div>;

        default:
          return <div>没有内容</div>;
      }
    }
    return renderHtml(props.componentName);
  },
};

function renderEmpty(h, componentName) {
  return <RenderEmpty componentName={componentName} />;
}

export default renderEmpty;

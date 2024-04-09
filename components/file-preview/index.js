import FilePreview from './FilePreview';
import Base from '../base';

let FilePreviewInstance = null;

FilePreview.show = function show(config) {
  if(FilePreviewInstance) {
    Object.assign(FilePreviewInstance.filePreviewProps.props, config, {value: true})
    FilePreviewInstance.$forceUpdate()
    return FilePreviewInstance
  }
  let currentConfig = { ...config, value: true };
  const filePreviewProps = { props: {}, on: { change: val => { currentConfig.value = val } } };
  const div = document.createElement('div');
  const el = document.createElement('div');
  div.appendChild(el);
  document.body.appendChild(div);


  function render(props) {
    filePreviewProps.props = props;
    const V = Base.Vue || Vue;
    return new V({
      el,
      parent: config.parentContext,
      data() {
        return { filePreviewProps };
      },
      render() {
        // 先解构，避免报错，原因不详
        const cdProps = { ...this.filePreviewProps };
        return <FilePreview {...cdProps} />;
      },
    });
  }

  FilePreviewInstance = render(currentConfig);
  return FilePreviewInstance;
}

/* istanbul ignore next */
FilePreview.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FilePreview.name, FilePreview);
};

export default FilePreview;

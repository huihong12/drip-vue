import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { initDefaultProps } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';
import { download } from '../_util/download'
import { trigger } from '../_util/fileUpload'

import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style';

export const fileUploadProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.array,
  fileType: PropTypes.arrayOf(PropTypes.string),
  fileSize: PropTypes.number,
  mode: PropTypes.oneOf(['simple', 'multiple','default','card','card-text','square']),
  filename: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  withFile: PropTypes.bool,
  readonly: PropTypes.bool,
  request: PropTypes.object
}, {value: [], request: ConfigConsumerProps.fileUploadConfig.request, placeholder: '文件上传', readonly: false});

const FileUpload = {
  name: 'DripFileUpload',
  props: fileUploadProps,
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
  computed: {},
  watch: {},
  methods: {},

  render() {
    const { value, prefixCls: customizePrefixCls, placeholder, mode, readonly, fileType, fileSize, filename, withFile, request } = this
    const { getPrefixCls, fileUploadConfig: _fileUploadConfig } = this.configProvider;
    const prefixCls = getPrefixCls('file-upload', customizePrefixCls);
    const fileUploadConfig = Object.assign({}, _fileUploadConfig)
    if(mode !== undefined) fileUploadConfig.mode = mode
    if(fileType !== undefined) fileUploadConfig.fileType = fileType
    if(fileSize !== undefined) fileUploadConfig.fileSize = fileSize
    if(filename !== undefined) fileUploadConfig.filename = filename
    if(withFile !== undefined) fileUploadConfig.withFile = withFile
    if(request !== undefined) fileUploadConfig.request = request

    const renderComponent = prefixCls => {
      let file = {}
      if(value&&value[0]) file = value[0]
      switch (fileUploadConfig.mode) {
        case 'multiple':
          //if(!file.url&&!readonly) 
          if(!file.url&&readonly) return <span style="font-size:16px;color:#999;">未上传</span>
          return <button onClick={()=>{trigger('click',{...fileUploadConfig,fileList:value,request: { ...fileUploadConfig.request, onProgress:fileList=>{ this.$emit('change', fileList) } }})}} onDrop={e=>trigger('click',{...fileUploadConfig,fileList:value,request: { ...fileUploadConfig.request, onProgress:fileList=>{ this.$emit('change', fileList) } }},e)} style="color:#63C26B;">{placeholder}</button>
          if(file.status === 'uploading') return <span class="progress">{file.progress}%</span>
          if(file.status === 'fail') return <button class="fail" onClick={e=>{trigger('click',{...fileUploadConfig,fileList:value,request: { ...fileUploadConfig.request, onProgress:fileList=>{ this.$emit('change', fileList) } }})}}>失败重传</button>
          if(file.url) return <template>
            {/* <button class="preview" v-if="canPreview(file.url)" onClick="$filePreview.open({url:file.url})" style="color:#63C26B;">预览</button> */}
            <button class="re-upload" onClick={()=>{trigger('click',{...fileUploadConfig,fileList:value,onProgress:fileList=>{ this.$emit('change', fileList) }})}} onDrop={e=>trigger('drop',{...fileUploadConfig,fileList:value,onProgress:fileList=>{ this.$emit('change', fileList) }},e)} style="color:#63C26B;">重新上传</button>
            {/* <button class="del" v-if="!readonly" onClick="delFile" style="color:#63C26B;">删除</button> */}
          </template>
      }
    }

    return <div class={`${prefixCls}`}>
      {renderComponent(prefixCls)}
      {/* {example&&<div class={{example:true,[mode]:!!mode}}>
        <div class="cover" onClick={()=>{this.$filePreview({url:example})}}><img src={example} alt="example" /></div>
        <p>示例图</p>
      </div>} */}
    </div>;
  },
};

/* istanbul ignore next */
FileUpload.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FileUpload.name, FileUpload);
};

export default FileUpload;

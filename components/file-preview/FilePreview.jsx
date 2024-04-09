import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { initDefaultProps } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';
import PDF from './pdf'
import CMapReaderFactory from './pdf/CMapReaderFactory'
import Viewerjs from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import { download } from '../_util/download'

import Modal from 'ant-design-vue/lib/modal';
import Pagination from 'ant-design-vue/lib/pagination';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style';
import 'ant-design-vue/lib/modal/style';
import 'ant-design-vue/lib/pagination/style';

let viewer
const container = document.createElement('div')

export const filePreviewProps = initDefaultProps({
  prefixCls: PropTypes.string,
  value: PropTypes.bool,
  url: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  filename: PropTypes.string,
  fileType: PropTypes.oneOf(['image', 'pdf']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
}, {value: false, width: 520, title: '文件预览', fileType: 'image'});

const FilePreview = {
  name: 'DripFilePreview',
  props: filePreviewProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      loadedRatio: 0,
			page: 1,
			numPages: 0,
      error: undefined
    }
  },
  computed: {
    pdfSrc() {
      if(this.fileType === 'pdf')
        return PDF.createLoadingTask({
          url: this.url,
          CMapReaderFactory
        })
    }
  },
  watch: {
    url: {
      immediate: true,
      handler(val) {
        if(!this.value || !val) return
        if(this.fileType === 'image') {
          if(!viewer) {
            container.style.display = 'none'
            document.body.append(container)
            viewer = new Viewerjs(container, {
              hide: () => { this.$emit('change', false) }
            })
          }
          container.innerHTML = ''
          let images = val
          if(typeof val === 'string') images = val.split(',')
          container.append(...(images.map(item => {const img = document.createElement('img'); img.src=item;return img;})))
          viewer.update()
          viewer.show()
        }
      }
    }
  },
  methods: {},

  render() {
    const { value, title, url, width, filename, prefixCls: customizePrefixCls, loadedRatio, page, numPages, error, pdfSrc, fileType } = this
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('file-preview', customizePrefixCls);

    const modalProps = {
      props: {
        visible: value && fileType === 'pdf',
        footer: null,
        zIndex: 99999,
        centered: true,
        width,
        title
      },
      on: {
        cancel:() => {
          this.$emit('change', false)
        }
      }
    }
    const paginationProps = {
      props: {
        simple: true,
        current: page,
        pageSize: 1,
        total: numPages
      },
      on: {
        change:(_page)=>{
          this.page = _page
        }
      }
    }
    const pdfProps = {
      props: {
        src: pdfSrc,
        page: page
      },
      on: {
        error: err => { this.error = err },
        progress: e => { this.loadedRatio = e },
        'num-pages': e => { this.numPages = e },
        'link-clicked': e => { this.page = e }
      },
      style: { width: '100%' }
    }
    const loaded = loadedRatio > 0 && loadedRatio < 1
    return <div class={`${prefixCls}`}>
      <Modal class={`${prefixCls}-modal`} {...modalProps}>
        <div class={`${prefixCls}-modal-pdf`}>
          {!error&&<div class={`${prefixCls}-modal-pdf-actions`}><Pagination {...paginationProps} /><Icon type="download" onClick={()=>{download(url, filename)}} style="font-size:16px;" /></div>}
          {!!error&&<div style="color:red;">{error==='InvalidPDFException'&&<span>无效的pdf文档</span>}</div>}
          {loaded&&<div>{ Math.floor(loadedRatio * 100) }%</div>}
          {!loaded&&<PDF {...pdfProps}></PDF>}
        </div>
      </Modal>
    </div>;
  },
};

/* istanbul ignore next */
FilePreview.install = function(Vue) {
  Vue.use(Base);
  Vue.component(FilePreview.name, FilePreview);
};

export default FilePreview;

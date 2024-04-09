import { clone } from '../_util/clone';
import PropTypes from 'ant-design-vue/lib/_util/vue-types';
import { dateFormart } from 'ant-design-vue/lib/_util/moment-util';
import { initDefaultProps, getComponentFromProp } from 'ant-design-vue/lib/_util/props-util';
import Base from '../base';
import FormGenerator from '../form-generator';
import '../form-generator/style';
import Tabs from '../tabs';
import '../tabs/style';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

import Button from 'ant-design-vue/lib/button';
import Dropdown from 'ant-design-vue/lib/dropdown';
import Menu from 'ant-design-vue/lib/menu';
import Icon from 'ant-design-vue/lib/icon';
import Tooltip from 'ant-design-vue/lib/tooltip';
import Popover from 'ant-design-vue/lib/popover';
import Checkbox from 'ant-design-vue/lib/checkbox';
import Tree from 'ant-design-vue/lib/tree';
import ATable from 'ant-design-vue/lib/table';
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/button/style';
import 'ant-design-vue/lib/dropdown/style';
import 'ant-design-vue/lib/menu/style';
import 'ant-design-vue/lib/icon/style';
import 'ant-design-vue/lib/tooltip/style';
import 'ant-design-vue/lib/popover/style';
import 'ant-design-vue/lib/checkbox/style';
import 'ant-design-vue/lib/tree/style';
import 'ant-design-vue/lib/table/style';
import 'ant-design-vue/lib/pagination/style';

export const tableProps = initDefaultProps({
  prefixCls: PropTypes.string,
  searchParams: PropTypes.object.def(() => ({
    pagination: {
      current: 1,
      pageSize: 10
    },
    searchForm: {}
  })),
  searchForm: PropTypes.object,
  table: PropTypes.object,
  toolbar: PropTypes.object,
  cache: PropTypes.object,
  value: PropTypes.array,
  readonly: PropTypes.bool,
  prop: PropTypes.string,
}, {readonly:false,prop:''});

const Table = {
  name: 'DripTable',
  props: tableProps,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      formData: {},
      defaultSearchParams: null,
      expand: false,
      size: 'small',
      checkedKeys: [],
      tableColums: []
    }
  },
  created() {
    this.resetColumns()
    this.cacheGet()
    this.defaultSearchParams = clone(this.searchParams)
    this.$nextTick(() => {
      this.formData = clone(this.searchParams.searchForm||{})
      this.search()
    })
  },
  computed: {
    formProfile() {
      if(!(this.searchForm && this.searchForm.formProfile instanceof Array && this.searchForm.formProfile.length)) return []
      return this.searchForm.formProfile
        .map((item) => {
          const inject = {on: {}}
          inject.change = (val) => {
            this.$set(this.formData, item.formItem.prop, val)
            if (['a-select', 'a-cascader'].includes(item.field.tag)) {
              this.search()
            }
          }
          if (item.field.tag === 'a-input-search') {
            inject.on.search = this.search
          }
          if (item.field.tag === 'a-input') {
            inject.on.pressEnter = this.search
          }
          if (['a-date-picker', 'a-range-picker'].includes(item.field.tag)) {
            inject.on.ok = this.search
          }
          return { formItem: {...(this.searchForm.formProfileMixins&&this.searchForm.formProfileMixins.formItem), ...item.formItem}, field: {...(this.searchForm.formProfileMixins&&this.searchForm.formProfileMixins.field), ...inject, ...item.field} }
        })
        .filter((item, i) => (this.expand ? true : i < 2 || this.searchForm.formProfile.length - 1 === i))
    },
    leftTableColums() {
      return this.tableColums.filter((item) => item.fixed === 'left')
    },
    rightTableColums() {
      return this.tableColums.filter((item) => item.fixed === 'right')
    },
    middleTableColums() {
      return this.tableColums.filter((item) => !['left', 'right'].includes(item.fixed))
    },
    displayTableColums() {
      return this.tableColums.filter((item) => this.checkedKeys.includes(item.dataIndex))
    },
    displayExport() {
      if (this.toolbar && this.toolbar.export && this.toolbar.export.length) {
        return this.toolbar.export.filter((item) => (typeof item.show === 'function' ? item.show() : item.show))
      }
      return []
    },
    displayImport() {
      if (this.toolbar && this.toolbar.import && this.toolbar.import.length) {
        return this.toolbar.import.filter((item) => (typeof item.show === 'function' ? item.show() : item.show))
      }
      return []
    },
    displayMore() {
      if (this.toolbar && this.toolbar.more && this.toolbar.more.length) {
        return this.toolbar.more.filter((item) => (typeof item.show === 'function' ? item.show() : item.show))
      }
      return []
    }
  },
  methods: {
    search() {
      const searchParams = {
        ...this.searchParams,
        searchForm: {
          ...this.searchParams.searchForm,
          ...this.formData
        },
        pagination: {
          ...this.searchParams.pagination,
          current: 1
        }
      }
      this.$emit('update:searchParams', searchParams)
      this.$emit('search', searchParams)
      this.cacheSet()
      this.fetchList(searchParams)
    },
    getText(col, record, index) {
      if(col.dateFormart) {
        return dateFormart(record[col.dataIndex], col.dateFormart)
      }
      if (typeof col.getEnum === 'function') {
        return col.getEnum(record, index)[record[col.dataIndex]]
      }
      if (col.enum) {
        return col.enum[record[col.dataIndex]]
      }
      return record[col.dataIndex]
    },
    rowEdit(col, row, index) {
      this.$refs.table && this.$refs.table.$forceUpdate()
      const key = col.dataIndex
      if (!row.editable) {
        this.$set(row, 'editable', true)
        this.$set(row, key + 'Copy', row[key])
        return
      }
      if (row[key + 'Copy'] === row[key] && row.editable) {
        this.$set(row, 'editable', false)
        return
      }
      this.$set(row, 'loading', true)
      col.rowEditHandler && col
        .rowEditHandler(row, row[key + 'Copy'], index)
        .then(() => {
          this.fetchList(this.searchParams)
          this.$set(row, 'editable', false)
        })
        .finally(() => {
          this.$set(row, 'loading', false)
        })
    },
    cacheSet() {
      if (!(this.cache && this.cache.key)) return
      let storage = localStorage
      if (this.cache.type === 'sessionStorage') storage = sessionStorage
      try {
        const data = {
          searchParams: this.searchParams,
          columns: {
            checkedKeys: this.tableColums
              .filter((item) => !this.checkedKeys.includes(item.dataIndex))
              .map((item) => item.dataIndex),
            tableColums: this.tableColums.map((item) => ({
              key: item.dataIndex,
              fixed: item.fixed
            }))
          },
          expand: this.expand,
          size: this.size
        }
        storage.setItem(`ProTable:${this.cache.key}`, JSON.stringify(data))
      } catch (error) {
        console.warn(error)
      }
    },
    cacheGet() {
      let searchParams = localStorage.getItem(`ProTable:searchParams`)
      setTimeout(() => localStorage.removeItem(`ProTable:searchParams`))
      if (!(this.cache && this.cache.key)) return
      let storage = localStorage
      if (this.cache.type === 'sessionStorage') storage = sessionStorage
      try {
        if (searchParams) this.$emit('update:searchParams', JSON.parse(searchParams))
      } catch (error) {
        console.warn(error)
      }
      let data = storage.getItem(`ProTable:${this.cache.key}`)
      if (!data) return
      try {
        data = JSON.parse(data)
        if (!searchParams) this.$emit('update:searchParams', data.searchParams)
        this.checkedKeys = this.tableColums
          .filter((item) => !data.columns.checkedKeys.includes(item.dataIndex))
          .map((item) => item.dataIndex)
        this.expand = data.expand !== undefined ? data.expand : true
        this.size = data.size
        data.columns.tableColums.forEach((coll, i) => {
          this.tableColums.forEach((col) => {
            if (col.dataIndex === coll.key) Object.assign(col, coll, { sort: i })
          })
        })
        this.tableColums.sort((a, b) => a.sort - b.sort)
      } catch (error) {
        console.warn(error)
      }
    },
    onFixed(item, position) {
      this.$set(item, 'fixed', position)
      this.$refs.table && this.$refs.table.$forceUpdate()
      this.cacheSet()
    },
    oncheck(checkedKeys, e) {
      if (e.checked) {
        if (!this.checkedKeys.includes(e.node.eventKey)) this.checkedKeys.push(e.node.eventKey)
      } else {
        if (this.checkedKeys.includes(e.node.eventKey))
          this.checkedKeys = this.checkedKeys.filter((item) => item !== e.node.eventKey)
      }
      this.cacheSet()
    },
    resetColumns() {
      if(!(this.table && this.table.columns)) return
      this.checkedKeys = this.table.columns.map((item) => item.dataIndex)
      this.tableColums = clone(this.table.columns)
      this.$refs.table && this.$refs.table.$forceUpdate()
    },
    onCheckAllChange(e) {
      if (e.target.checked) {
        this.checkedKeys = this.table.columns.map((item) => item.dataIndex)
      } else {
        this.checkedKeys = []
      }
      this.cacheSet()
    },
    onDrop(e) {
      if (!(e.node && e.dragNode && e.node.eventKey && e.dragNode.eventKey)) return
      const dropKey = e.node.eventKey
      const dragKey = e.dragNode.eventKey
      const dropPos = e.node.pos.split('-')
      const dropPosition = e.dropPosition - Number(dropPos[dropPos.length - 1])
      const item = this.tableColums.splice(
        this.tableColums.findIndex((it) => it.dataIndex === dragKey),
        1
      )[0]
      const targetIndex = this.tableColums.findIndex((it) => it.dataIndex === dropKey)
      this.tableColums.splice(dropPosition === -1 ? targetIndex : targetIndex + 1, 0, item)
      this.cacheSet()
    },
    paginationChange(page, pageSize) {
      let _page = page
      if (this.searchParams.pagination.pageSize !== pageSize) _page = 1
      this.$emit('update:searchParams', {
        ...this.searchParams,
        pagination: {
          current: _page,
          pageSize: pageSize
        }
      })
    },
    reset() {
      this.$emit('reset')
      console.log(clone(this.defaultSearchParams))
      this.$emit('update:searchParams', clone(this.defaultSearchParams))
      this.formData = clone(this.defaultSearchParams.searchForm)
      this.fetchList(this.searchParams)
    },
    async fetchList(searchParams) {
      if (typeof this.request !== 'function') return
      const params = searchParams || this.searchParams
      this.$emit('update:table', {
        ...this.table,
        loading: true
      })
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        const res = await this.request(params).catch((err) => {
          console.warn('fetchList error: ', err)
          return { total: 0, value: [] }
        })
        if (JSON.stringify(this.searchParams) !== JSON.stringify(params)) return
        this.$emit('change', res.value)
        this.$emit('update:table', {
          ...this.table,
          loading: false,
          pagination: {
            ...this.table.pagination,
            total: res.total
          }
        })
      }, 200)
    },
    renderSearchForm(prefixCls) {
      if(!this.formProfile.length) return null
      const formGeneratorProps = {
        props: {
          formProfile: [{
            formItem: {
              prop: 'group',
              label: '',
            },
            field: {
              tag: 'drip-form-group',
              rowProps: this.searchForm.rowProps,
              colProps: this.searchForm.colProps,
              children: this.formProfile
            }
          }],
          formType: 'default',
          value: {
            group: this.formData
          }
        }
      }
      return <div class={`${prefixCls}-search-form`}>
        {this.searchForm.label && <span class={`${prefixCls}-search-form-label`}>{this.searchForm.label}</span>}
        <FormGenerator {...formGeneratorProps}>
          <div class={`${prefixCls}-search-form-actions`}>
            <Button type="primary" class={`${prefixCls}-search-form-actions-search-button`} onClick={this.search}>查询</Button>
            <Button class={`${prefixCls}-search-form-actions-reset-button`} onClick={this.reset}>重置</Button>
            {this.searchForm.formProfile.length > 3 &&  <Button class={`${prefixCls}-search-form-actions-expand-button`} type="link" icon={this.expand ? 'up' : 'down'} onClick={() => {this.expand = !this.expand;this.cacheSet();}}>{ this.expand ? '收起筛选' : '展开筛选' }</Button>}
          </div>
        </FormGenerator>
      </div>
    },
    renderToolBar(prefixCls) {
      if(!this.toolbar) return null
      const toolbarLeft = getComponentFromProp(this, 'toolbarLeft');
      const toolbarTabsRight = getComponentFromProp(this, 'toolbarTabsRight');
      return <div class={`${prefixCls}-toolbar`}>
        {toolbarLeft && <div class={`${prefixCls}-toolbar-slot`}>{toolbarLeft}</div>}
        {this.toolbar.actions && this.toolbar.actions.length !==0 && <div class={`${prefixCls}-toolbar-actions`}>
          {
            this.toolbar.actions.map(action => {
              return <span class={`${prefixCls}-toolbar-action`}>
                {
                  action.children &&
                  action.children.length &&
                  action.children.some((item) => (typeof item.show === 'boolean' ? item.show : item.show())) &&
                  <Dropdown {...{props: action.dropdownProps}}>
                    <Button class={`${prefixCls}-toolbar-action-button`} onClick={(e) => e.preventDefault()}>
                      { action.label } <Icon type="down" />
                    </Button>
                    <template slot="overlay">
                      <Menu {...{props: action.menuProps}}>
                        {
                          action.children.filter(item => typeof item.show === 'boolean' ? item.show : item.show()).map(childrenAction => {
                            return <Menu.Item onClick={()=>{childrenAction.handler && childrenAction.handler()}}>
                              {childrenAction.prefix && <Icon type={childrenAction.prefix} />} {childrenAction.label}
                            </Menu.Item>
                          })
                        }
                      </Menu>
                    </template>
                  </Dropdown>
                }
                {
                  !(action.children && action.children.length) &&
                  <Button type="primary" class={`${prefixCls}-toolbar-action-button`} onClick={()=>{action.handler && action.handler()}}>{ action.label }</Button>
                }
              </span>
            })
          }
        </div>}
        {this.toolbar.tabs && <div class={`${prefixCls}-toolbar-tabs`}>
          <Tabs {...{props: {...this.toolbar.tabs, value: this.searchParams.tabs}, on: {change: val => $emit('update:searchParams', {...this.searchParams, toolbarTabs: val, pagination: { ...this.searchParams.pagination, current: 1 }})}}}>
            <template slot="right">
              {toolbarTabsRight}
            </template>
          </Tabs>
        </div>}
        <div class={`${prefixCls}-toolbar-more`}>
          {this.displayMore.length !==0 && <Tooltip>
            <template slot="title"> 更多操作 </template>
            <Dropdown {...{props: {trigger:['click']}}}>
              <Icon type="menu" />
              <template slot="overlay">
                <Menu>{this.displayMore.map(item => (<Menu.Item onClick={item.handler}><span>{ item.label }</span></Menu.Item>))}</Menu>
              </template>
            </Dropdown>
          </Tooltip>}
          {this.displayImport.length !==0 && <Tooltip>
            <template slot="title"> 导入 </template>
            <Dropdown {...{props: {trigger:['click']}}}>
              <Icon type="import" />
              <template slot="overlay">
                <Menu>{this.displayImport.map(item => (<Menu.Item onClick={item.handler}><span>{ item.label }</span></Menu.Item>))}</Menu>
              </template>
            </Dropdown>
          </Tooltip>}
          {this.displayExport.length !==0 && <Tooltip>
            <template slot="title"> 导出 </template>
            <Dropdown {...{props: {trigger:['click']}}}>
              <Icon type="upload" />
              <template slot="overlay">
                <Menu>{this.displayExport.map(item => (<Menu.Item onClick={item.handler}><span>{ item.label }</span></Menu.Item>))}</Menu>
              </template>
            </Dropdown>
          </Tooltip>}
          <Tooltip>
            <template slot="title"> 刷新 </template>
            <Icon type="reload" onClick={()=>{this.$emit('refresh', this.searchParams);this.fetchList(this.searchParams);}} />
          </Tooltip>
          <Tooltip>
            <template slot="title"> 密度 </template>
            <Dropdown {...{props: {trigger:['click']}}}>
              <Icon type="column-height" />
              <template slot="overlay">
                <Menu>
                  <Menu.Item onClick={()=>{this.size = 'default'}}>
                    <span class={this.size === 'default' ? `${prefixCls}-toolbar-more-current-size` : undefined}>默认</span>
                  </Menu.Item>
                  <Menu.Item onClick={()=>{this.size = 'middle'}}>
                    <span class={this.size === 'middle' ? `${prefixCls}-toolbar-more-current-size` : undefined}>中等</span>
                  </Menu.Item>
                  <Menu.Item onClick={()=>{this.size = 'small'}}>
                    <span class={this.size === 'small' ? `${prefixCls}-toolbar-more-current-size` : undefined}>紧凑</span>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </Tooltip>
          <Tooltip>
            <template slot="title"> 列设置 </template>
            <Popover {...{props: {trigger: 'click',placement: 'bottomRight'}}}>
              <div slot="title" class={`${prefixCls}-toolbar-more-columns-select-title`}>
                <div>
                  <Checkbox {...{props: {indeterminate: Boolean(this.checkedKeys.length && this.table.columns.length !== this.checkedKeys.length),checked: this.table.columns.length === this.checkedKeys.length},on: {change: this.onCheckAllChange}}}>
                    列展示(拖拽排序)
                  </Checkbox>
                </div>
                <div class={`${prefixCls}-toolbar-more-columns-select-reset-btn`} onClick={this.resetColumns}>重置</div>
              </div>
              <template slot="content">
                {this.leftTableColums.length !==0 && <div class={`${prefixCls}-toolbar-more-columns-select-tree`}>
                  <h1>固定在左侧</h1>
                  <Tree {...{props: {draggable:true,checkable:true,blockNode:true,switcherIcon:null,checkedKeys:this.checkedKeys.filter((item) => this.leftTableColums.find((it) => it.dataIndex === item))},on:{drop:this.onDrop,check:this.oncheck}}}>
                    {
                      this.leftTableColums.map(item => (
                        <Tree.TreeNode key={item.dataIndex}>
                          <div slot="title" class={`${prefixCls}-toolbar-more-columns-select-tree-title`}>
                            <span>{ item.title }</span>
                            <div class={`${prefixCls}-toolbar-more-columns-select-tree-actions`}>
                              <Tooltip>
                                <template slot="title"> 固定在右侧 </template>
                                <Icon onClick={()=>{this.onFixed(item, 'right')}} type="vertical-align-bottom" />
                              </Tooltip>
                              <Tooltip>
                                <template slot="title"> 不固定 </template>
                                <Icon onClick={()=>{this.onFixed(item, false)}} type="vertical-align-middle" />
                              </Tooltip>
                            </div>
                          </div>
                        </Tree.TreeNode>
                      ))
                    }
                  </Tree>
                </div>}
                {this.middleTableColums.length !==0 && <div class={`${prefixCls}-toolbar-more-columns-select-tree`}>
                  {(this.leftTableColums.length !==0||this.rightTableColums.length !==0) && <h1>不固定</h1>}
                  <Tree {...{props: {draggable:true,checkable:true,blockNode:true,switcherIcon:null,checkedKeys:this.checkedKeys.filter((item) => this.middleTableColums.find((it) => it.dataIndex === item))},on:{drop:this.onDrop,check:this.oncheck}}}>
                    {
                      this.middleTableColums.map(item => (
                        <Tree.TreeNode key={item.dataIndex}>
                          <div slot="title" class={`${prefixCls}-toolbar-more-columns-select-tree-title`}>
                            <span>{ item.title }</span>
                            <div class={`${prefixCls}-toolbar-more-columns-select-tree-actions`}>
                              <Tooltip>
                                <template slot="title"> 固定在左侧 </template>
                                <Icon onClick={()=>{this.onFixed(item, 'left')}} type="vertical-align-top" />
                              </Tooltip>
                              <Tooltip>
                                <template slot="title"> 固定在右侧 </template>
                                <Icon onClick={()=>{this.onFixed(item, 'right')}} type="vertical-align-bottom" />
                              </Tooltip>
                            </div>
                          </div>
                        </Tree.TreeNode>
                      ))
                    }
                  </Tree>
                </div>}
                {this.rightTableColums.length !==0 && <div class={`${prefixCls}-toolbar-more-columns-select-tree`}>
                  <h1>固定在右侧</h1>
                  <Tree {...{props: {draggable:true,checkable:true,blockNode:true,switcherIcon:null,checkedKeys:this.checkedKeys.filter((item) => this.rightTableColums.find((it) => it.dataIndex === item))},on:{drop:this.onDrop,check:this.oncheck}}}>
                    {
                      this.rightTableColums.map(item => (
                        <Tree.TreeNode key={item.dataIndex}>
                          <div slot="title" class={`${prefixCls}-toolbar-more-columns-select-tree-title`}>
                            <span>{ item.title }</span>
                            <div class={`${prefixCls}-toolbar-more-columns-select-tree-actions`}>
                              <Tooltip>
                                <template slot="title"> 固定在左侧 </template>
                                <Icon onClick={()=>{this.onFixed(item, 'left')}} type="vertical-align-top" />
                              </Tooltip>
                              <Tooltip>
                                <template slot="title"> 不固定 </template>
                                <Icon onClick={()=>{this.onFixed(item, false)}} type="vertical-align-middle" />
                              </Tooltip>
                            </div>
                          </div>
                        </Tree.TreeNode>
                      ))
                    }
                  </Tree>
                </div>}
              </template>
              <Icon type="setting" />
            </Popover>
          </Tooltip>
        </div>
      </div>
    },
    renderRowSelection(prefixCls) {
      if(!(this.table && this.table.rowSelection && this.table.rowSelection.selectedRowKeys && this.table.rowSelection.selectedRowKeys.length && this.table.rowSelectionActions)) return null
      return <div class={`${prefixCls}-row-selection-actions-wrapper`}>
        <div class={`${prefixCls}-row-selection-actions-left`}>
          已选择 { this.table.rowSelection.selectedRowKeys.length } 项
          <span class={`${prefixCls}-row-selection-actions-deselect-button`} onClick={()=>{this.$set(this.table.rowSelection, 'selectedRowKeys', [])}}>取消选择</span>
        </div>
        <div class={`${prefixCls}-row-selection-actions-right`}>
            {
              this.table.rowSelectionActions && this.table.rowSelectionActions.actions.filter(item => typeof item.show === 'boolean' ? item.show : item.show()).map(item => {
                return <Button class={`${prefixCls}-row-selection-actions-button`} {...{props: {loading:item.loading,type:'primary',size:'small'}}} onClick={()=>{item.handler && item.handler(this.table.rowSelection.selectedRowKeys)}}>{ item.label }</Button>
              })
            }
        </div>
      </div>
    }
  },

  render() {
    const { size, searchParams, table, readonly, prefixCls: customizePrefixCls, } = this
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('table', customizePrefixCls);
    const beforeTable = getComponentFromProp(this, 'beforeTable');
    const afterTable = getComponentFromProp(this, 'afterTable');

    return <div class={prefixCls}>
      {this.renderSearchForm(prefixCls)}
      {beforeTable}
      {this.renderToolBar(prefixCls)}
      {this.renderRowSelection(prefixCls)}
      {table && <ATable {...{
        props: {
          rowKey: (record, index) => {
            if(table.rowKey) {
              return record[table.rowKey]
            }
            return index
          },
          ...table,
          size: size,
          pagination: false,
          dataSource: this.value,
          scroll: { x: true },
          columns: undefined,
          rowSelectionActions: undefined
        },
        on: {
          ...table.on
        },
        ref: 'table'
      }}>
        {
          this.displayTableColums.map(col => {
            return <ATable.Column {...{props: {...col, ellipsis:true,title: () => {
              return <span>
                {col.field && col.field.required && !readonly && <span style="color:red;">*</span>}
                {col.title}
                {col.tips && <Tooltip title={col.tips}>
                  <Icon class={`${prefixCls}-column-title-tips`} type={'question-circle'} style="margin-left:5px;" />
                </Tooltip>}
              </span>
            }},scopedSlots: {
              default: (text, record, index) => {
                const _text = this.getText(col, record, index)
                let children = _text ? [
                  <span style={typeof col.style === 'function' ? col.style(record, index) : col.style} class="text-ellipsis" title={col.ellipsis ? _text : undefined} onClick={()=>{col.clickHandler&&col.clickHandler(record, index)}}>
                    {_text}
                    {col.copy && <Icon type="copy" style="margin-left:5px;" onClick={()=>{this.$textCopy(_text)}} />}
                  </span>
                ] : []
                if(col.field && (typeof col.allowEdit === 'function' ? col.allowEdit(record, index) : col.allowEdit)) {
                  const field = typeof col.getField === 'function' ? col.getField(text, record, index) : col.field
                  const formItemProps = {
                    props: {
                      value: record[col.dataIndex],
                      formItem: {
                        prop: `${this.prop}.${index}.${col.dataIndex}`,
                        ...field.formItem
                      },
                      field: {
                        ...field.field,
                        options: col.optionsSource === 'row' ? record.options : field.options,
                        readonly: col.optionsSource === 'row' ? record.selectDisabled || field.readonly || record.readonly : (typeof field.readonly === 'function' ? field.readonly(record, index) : field.readonly) || record.readonly
                      }
                    },
                    on: {
                      change: (val) => {
                        this.$set(record, col.dataIndex, val)
                        this.$emit('change', this.value)
                      },
                      blur: () => {
                        this.$emit('blur')
                      }
                    }
                  }
                  const element = <div class={`${prefixCls}-column-edit-row`}>
                    {(record.editable||!col.showConfirmButton) && <FormGenerator.FormItem {...formItemProps} />}
                    {col.showConfirmButton && <span class={`${prefixCls}-column-edit-row-button`} onClick={()=>{this.rowEdit(col, record, index)}}>{record.editable ? '确定': '编辑'}</span>}
                    {record.loading && <Icon type="loading" />}
                  </div>
                  if(col.showConfirmButton && record.editable) {
                    children = element
                  }else {
                    children.push(element)
                  }
                }
                if(col.actions && col.actions.items && col.actions.items.length) {
                  children.push(...col.actions.items.map((action,i)=>{
                    if(!(typeof action.show === 'boolean' ? action.show : action.show(record, index))) return null
                    if(action.children && action.children.length) {
                      if(action.children.some((item) => typeof item.show === 'boolean' ? item.show : item.show(record, index))) {
                        return <Dropdown {...{props:col.actions.dropdownProps,on:col.actions.dropdownProps&&col.actions.dropdownProps.on}}>
                          <span class={`${prefixCls}-column-actions-dropdown-item`} onClick={(e) => e.preventDefault()}>
                            { action.label } <Icon type="down" />
                          </span>
                          <template slot="overlay">
                            <Menu>
                              {
                                action.children.map((childrenAction, j)=>{
                                  if(!(typeof childrenAction.show === 'boolean' ? childrenAction.show : childrenAction.show(record, index))) return null
                                  return <Menu.Item onClick={()=>{childrenAction.handler && childrenAction.handler(record, index)}}>
                                    {childrenAction.prefix && <Icon type={childrenAction.prefix} />} { childrenAction.label }
                                  </Menu.Item>
                                }).filter(item=>item)
                              }
                            </Menu>
                          </template>
                        </Dropdown>
                      }
                    }else {
                      return <span class={`${prefixCls}-column-actions-item`} onClick={()=>{action.handler && action.handler(record, index)}}>{ action.label }</span>
                    }
                  }).filter(item=>item))
                }
                if(col.filePreview && text) {
                  if(col.filePreview.type === 'pdf') children = <span onClick={()=>{this.$filePreview({url:text})}} class={`${prefixCls}-column-actions-item`}>查看</span>
                  if(col.filePreview.type === 'img') children = <img src={(text instanceof Array?text[0]:text)} style={{cursor: 'pointer',...col.filePreview.style}} onClick={()=>{this.$filePreview({url:text})}} />
                }
                if(col.scopedSlots && col.scopedSlots.customRender) {
                  children = this.$scopedSlots[col.scopedSlots.customRender]({text, record, index})
                }
                return <div class={`${prefixCls}-column`}>
                  {children}
                </div>
              }
            }}}>
            </ATable.Column>
          })
        }
      </ATable>}
      {table && table.pagination && table.pagination.total !== 0 && <Pagination {...{
        props: {
          showTotal: (total) => `共 ${total} 条, 共 ${Math.ceil(total / searchParams.pagination.pageSize)} 页`,
          showSizeChanger: true,
          showQuickJumper: true,
          ...table.pagination,
          current: searchParams.pagination.current,
          pageSize: searchParams.pagination.pageSize
        },
        on: {
          change: this.paginationChange,
          showSizeChange: this.paginationChange
        }
      }}/>}
      {afterTable}
    </div>;
  },
};

/* istanbul ignore next */
Table.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Table.name, Table);
};

export default Table;

<template>
  <div style="padding: 20px;">
    <!-- <a-card
      title="测试"
      :tab-props="{ size: 'small' }"
      :tab-list="[
        { key: 'tab1', tab: 'tab1' },
        { key: 'tab2', tab: 'tab2' },
      ]"
    /> -->
    <!-- {{formData}}
    <drip-form-generator ref="formGenerator" v-model="formData" :formProfile="formProfile" formType="step" :readonly="readonly">
      <button @click="submit">submit</button>
    </drip-form-generator> -->
    <!-- <drip-tabs v-model="current" :options="options" label="title" type="block">
      <template slot="right">123</template>
    </drip-tabs>
    {{current}} -->
    <drip-table v-model="dataSource" :cache="cache" :table.sync="table" :toolbar="toolbar" :searchForm="searchForm" :searchParams.sync="searchParams" />
  </div>
</template>
<script>

export default {
    data() {
        return {
          current: ['value'],
          options: [
            { label: 'label', value: 'value' },
            { label: 'label1', value: 'value1' },
          ],
          formData: {
            attr: {
              'attr1': 'value',
              'attra11': 'value'
            },
            attra: {}
          },
          formProfile: [
            {
              formItem: {
                prop: 'attr',
                label: 'title',
              },
              field: {
                tag: 'drip-form-group',
                children: [
                  {
                    formItem: {
                      prop: 'attr1',
                      label: 'title',
                      helpLink: {
                        link: '...',
                        label: '111'
                      },
                      tips: {
                        type: 'text',
                        value: '333'
                      },
                      rules: [{ required: true, message: "请选择", trigger: "change" }]
                    },
                    field: {
                      tag: 'a-select',
                      options: [{label:'label',value:'value'},{label:'label1',value:'value1'}],
                    }
                  },
                  {
                    formItem: {
                      prop: 'attra11',
                      label: 'input',
                      helpLink: {
                        link: '...',
                        label: '111'
                      },
                      tips: {
                        type: 'text',
                        value: '333'
                      },
                      rules: [{ required: true, message: "请输入", trigger: "blur" }]
                    },
                    field: {
                      tag: 'a-input-number',
                    }
                  }
                ]
              }
            },
            {
              formItem: {
                prop: 'attra',
                label: 'titlea',
                rules: [{ required: true, message: "请填写", trigger: "blur" }]
              },
              field: {
                tag: 'drip-form-group',
                children: [
                  {
                    formItem: {
                      prop: 'attra1',
                      label: 'input',
                      helpLink: {
                        link: '...',
                        label: '111'
                      },
                      tips: {
                        type: 'text',
                        value: '333'
                      },
                      rules: [{ required: true, message: "请选择", trigger: "blur" }]
                    },
                    field: {
                      tag: 'a-input',
                    }
                  }
                ]
              }
            }
          ],
          readonly: false,
          dataSource: [{name: 'name',name1: 'name1'}],
          table: {
            columns: [
              { align: "center", dataIndex: "name", title: "站点组名称",copy:true,tips: 'asdasd',allowEdit:true,showConfirmButton: true,field:{
                formItem: {
                  prop: 'attra21',
                  label: ''
                },
                field: {
                  tag: 'a-input',
                }
              } },
              { align: "center", dataIndex: "actions", title: "站点组名称1",copy:true,tips: 'asdasd', actions: {
                items: [{
                  label: '审核',
                  children: [
                    {
                      label: '审核',
                      handler: row => {
                        const data = JSON.parse(JSON.stringify(row))
                        this.audit(data)
                      },
                      show: true
                    }
                  ],
                  show: true
                }]
              } },
            ],
            pagination: {
              total: 110
            },
            rowSelection: {
              selectedRowKeys: [],
              onChange(selectedRowKeys, selectedRows) {
                this.selectedRowKeys = selectedRowKeys
              },
              fixed: true
            },
            rowSelectionActions: {
              actions: [
                {
                  label: '审核',
                  handler: row => {
                    const data = JSON.parse(JSON.stringify(row))
                    this.audit(data)
                  },
                  show: true
                },
              ]
            }
          },
          toolbar: {
            export: [
              {
                label: '导出',
                handler: row => {
                  const data = JSON.parse(JSON.stringify(row))
                  this.audit(data)
                },
                show: true
              },
            ],
            import: [
              {
                label: '导出',
                handler: row => {
                  const data = JSON.parse(JSON.stringify(row))
                  this.audit(data)
                },
                show: true
              },
            ],
            more: [
              {
                label: '导出',
                handler: row => {
                  const data = JSON.parse(JSON.stringify(row))
                  this.audit(data)
                },
                show: true
              },
            ],
          },
          searchForm: {
            formProfileMixins:{
              formItem: {
                labelCol: { span: 5 },
                wrapperCol: { span: 19 }
              }
            },
            rowProps: { span: 24 },
            colProps: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
            formProfile: [
              {
                formItem: {
                  prop: 'attra1',
                  label: 'select',
                  tips: {
                    type: 'text',
                    value: '333'
                  },
                },
                field: {
                  tag: 'a-select',
                  options: [ {label:'123',value:1} ],
                }
              },
              {
                formItem: {
                  prop: 'attra21',
                  label: 'input',

                  tips: {
                    type: 'text',
                    value: '333'
                  },
                },
                field: {
                  tag: 'a-input',
                }
              },
              {
                formItem: {
                  prop: 'attra31',
                  label: 'input',

                  tips: {
                    type: 'text',
                    value: '333'
                  },
                },
                field: {
                  tag: 'a-input',
                }
              },
              {
                formItem: {
                  prop: 'attra41',
                  label: 'input',

                  tips: {
                    type: 'text',
                    value: '333'
                  },
                },
                field: {
                  tag: 'a-input',
                }
              }
            ]
          },
          searchParams: {
            pagination: {
              current: 1,
              pageSize: 10
            }
          },
          cache: { key: 'test' }
        };
    },
    created() {
      console.log(this)
    },
    methods: {
      submit() {
        this.$refs.formGenerator.formRef.validateField(['attr.attr1'], (errorMessage,rule) => {console.log(errorMessage,rule)})
      }
    }
};
</script>

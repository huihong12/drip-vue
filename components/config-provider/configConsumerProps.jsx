export const ConfigConsumerProps = {
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) return customizePrefixCls;
    return `drip-${suffixCls}`;
  },
  fileUploadConfig: {
    fileType: ['*'],
    fileSize: 0,
    withFile: false,
    request: {
      url: 'https://jeecgboot.slzxgd.com/jeecg-boot/sys/pageinfo/upload',
      fieldName: 'file',
      withCredentials: true,
      headers: {'X-Access-Token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZ2VudElkIjoiIiwiZXhwIjoxNzA2MjM1MzQ5LCJ1c2VybmFtZSI6ImFkbWluIn0.wTB1P7fMmUEv7JCe60b6jS_062CTi0EMkJ4Yugrbl-A'},
      getResult(xhr) {
        try {
          const json = JSON.parse(xhr.response)
          return { isSuccess: true, url: json.result.url }
        } catch (error) {
          return { isSuccess: false, error }          
        }
      }
    }
  }
};

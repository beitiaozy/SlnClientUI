/** @format */

// paginate/hehuoren/shebei_admin.js
let app = getApp();

Page({
  data: {
    parameter: {
      return: "1",
      title: "设备管理",
      color: "#fff",
      class: "app_bg_title",
    },
    isEdit: false,
    isAddMode: false,
    list: [],
    editValue: {},
    addr_id: null,
    params: {
      only_code: "",
      name: "",
    },
    page:{
      body:{},
      totalPage: 1,
      pageNo: 1,
      pageSize: 8
    },
    loaded: false, // 用于防止多次加载
  },

  onLoad(options) {
    console.info(options)
    if (options.addr_id) {
      this.setData({
        addr_id: options.addr_id,
      });
    } else if (options.id) {
      this.setData({
        box_id: options.id,
      });
    }

    this.getList(); // 只在 onLoad 中请求一次
  },

  onShow() {
    // onShow 里只做展示，不重复请求
  },

  getList() {
    if (this.data.loaded) return; // 避免重复请求

    let data = {
      pageNo: this.data.page.pageNo,
      pageSize: this.data.page.pageSize,
      body: {...this.data.params}
    };

    app.post("manageNetSite/vmDeviceList", data).then((res) => {
      this.setData({
        list: res.data.datas || [],
        page:{
          totalPage: res.data.totalPage || 1,
        },
        loaded: true,
      });
    });
  },

  addDevice() {
    const first = this.data.list?.[list.length - 1] || {};
    // 拷贝第一条数据为模板，去掉 ID
    const newDevice = { ...first };
    delete newDevice.id; // ⬅️ 确保你要去除后端识别设备的主键字段
    console.info(newDevice)
    this.setData({
      isEdit: true,
      editValue: newDevice,
      isAddMode: true, // ✅ 标记当前是“新增模式”
    });
  },

  changeTab(e) {
    this.setData({
      list: [],
      loaded: false,
    });
    this.getList();
  },

  search(e) {
    const value = e.detail.value.search.trim();
    let params = { ...this.data.params, pageNo: 1 }; // 重置分页
    if (value) {
      if (!isNaN(value)) {
        params.only_code = value;
        params.name = "";
      } else {
        params.name = value;
        params.only_code = "";
      }
    } else {
      params.only_code = "";
      params.name = "";
    }

    this.setData({
      params,
      list: [],
      loaded: false,
    });
    this.getList();
  },

  goPages(e) {
    const url = e.currentTarget.dataset.url;
    const addr_id = this.data.addr_id ? `?addr_id=${this.data.addr_id}` : "";
    wx.navigateTo({
      url: url + addr_id,
    });
  },

  edit(e) {
    const item = e.currentTarget.dataset.item;

    console.info(item)

    this.setData({
      isEdit: true,
      editValue: item
    });
  },

  sure(e) {
    const formValues = e.detail.value;
    const base = this.data.editValue;
    const params = { ...base, ...formValues };

    params.type = "自助";

    const requiredFields = [
      { key: "only_code", msg: "请输入设备号" },
      { key: "name", msg: "请输入设备名称" },
      { key: "base_time_x", msg: "请输入基础时间" },
      { key: "price_y", msg: "请输入基础价格" },
      { key: "price_z", msg: "请输入超时价格" },
      { key: "prize_pm", msg: "请输入泡沫每秒价格" },
      { key: "prize_sl", msg: "请输入水流每秒价格" },
    ];

    for (const field of requiredFields) {
      if (!params[field.key]) return app.showToast(field.msg);
    }

    const api = this.data.isAddMode ? "manageNetSite/addVMDevice" : "manageNetSite/editVMDevice";

    app.post(api, params).then((res) => {
      app.showToast(res.data);
      this.edit_close();
      this.setData({ loaded: false });
      this.getList();
    });
  },

  edit_close() {
    this.setData({
      isEdit: false,
      isHuoDong: false,
    });
  },


  changeInput(e) {
  },

  sure(e) {
    const formValues = e.detail.value;
    const base = this.data.editValue;
    const params = { ...base, ...formValues };

    params.type = "自助";

    const requiredFields = [
      { key: "only_code", msg: "请输入设备号" },
      { key: "name", msg: "请输入设备名称" },
      { key: "base_time_x", msg: "请输入基础时间" },
      { key: "price_y", msg: "请输入基础价格" },
      { key: "price_z", msg: "请输入超时价格" },
      { key: "prize_pm", msg: "请输入泡沫每秒价格" },
      { key: "prize_sl", msg: "请输入水流每秒价格" },
    ];

    for (const field of requiredFields) {
      if (!params[field.key]) return app.showToast(field.msg);
    }

    const api = this.data.isAddMode ? "manageNetSite/addDevice" : "manageNetSite/editVMDevice";

    app.post(api, params).then((res) => {
      app.showToast(res.data);
      this.edit_close();
      this.setData({ loaded: false });
      this.getList();
    });
  },


  onReachBottom() {
    if (this.data.params.pageNo < this.data.totalPage) {
      this.setData({
        "params.pageNo": this.data.params.pageNo + 1,
        loaded: false,
      });
      this.getList();
    }
  },
});

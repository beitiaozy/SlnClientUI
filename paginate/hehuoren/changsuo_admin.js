let app = getApp();
Page({
  data: {
    parameter: {
      return: "1",
      title: "场地管理",
      color: "#fff",
      class: "app_bg_title",
    },
    list: [],
    isEdit: false,
    editValue: {},
    position: "",
  },

  onShow() {
    this.getList();
  },

  goPages(e) {
    let data = e.currentTarget.dataset;
    if (data.url == "/paginate/hehuoren/shebei_admin") {
      wx.navigateTo({
        url: data.url + "?addr_id=" + data.item.id,
      });
      return;
    }
    if (data.url == "/paginate/huodong/huodong") {
      wx.navigateTo({
        url: data.url + "?address_id=" + data.item.id,
      });
      return;
    }
    wx.navigateTo({
      url: data.url,
    });
  },

  getList() {
    app.post("manageAddress/addressList").then((res) => {
      res.data.map((item) => {
        item.imges = typeof item.imges === "object" ? [] : item.imges.split(",");
      });
      this.setData({ list: res.data });
    });
  },

  edit(e) {
    this.setData({
      isEdit: true,
      editValue: {
        ...e.currentTarget.dataset.item,
        address_id: e.currentTarget.dataset.item.id
      },
      position: e.currentTarget.dataset.item.addr_location,
    });
  },

  edit_close() {
    this.setData({ isEdit: false });
  },

  getPostion() {
    wx.chooseLocation({
      latitude: this.data.editValue.addr_lat,
      longitude: this.data.editValue.addr_lng,
      success: (res) => {
        let address = {
          addr_area: res.address.indexOf("区") != "-1"
              ? res.address.split("区")[0] + "区"
              : res.address.split("市")[0] + "市" + res.address.split("市")[1] + "市",
          addr_location: res.name,
          addr_lng: res.longitude,
          addr_lat: res.latitude,
        };
        this.setData({
          position: res.address,
          editValue: { ...this.data.editValue, ...address },
        });
      },
    });
  },

  changeInput(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      [`editValue.${name}`]: e.detail.value
    });
  },

  editSubmit(e) {
    let data = { ...this.data.editValue, ...e.detail.value };
    if (!data.addr_name) return wx.showToast({ title: "请输入场所名称", icon: "none" });
    if (!data.addr_area) return wx.showToast({ title: "请选择场所", icon: "none" });
    if (!data.addr_location) return wx.showToast({ title: "请选择场所", icon: "none" });
    if (!data.addr_person_name) return wx.showToast({ title: "请输入场所管理员姓名", icon: "none" });
    if (!data.addr_person_mobile) return wx.showToast({ title: "请输入场所管理员手机号", icon: "none" });
    if (!data.img) return wx.showToast({ title: "请上传场所图片", icon: "none" });

    data.addr_price = 0;
    app.post("manageAddress/editAddress", data).then((res) => {
      wx.showToast({ title: res.data, icon: "none" });
      setTimeout(() => {
        this.setData({ isEdit: false });
        this.getList();
      }, 1500);
    }).catch((err) => {
      wx.showToast({ title: err, icon: "none" });
    });
  },

  del(e) {
    const data = e.currentTarget.dataset.item;
    const action = data.status == "正常" ? "delAddress" : "reductionAddress";
    const actionText = data.status == "正常" ? "删除" : "还原";

    wx.showModal({
      title: "提示",
      content: `你确定要${actionText}${data.addr_name}吗？`,
      success: (res) => {
        if (res.confirm) {
          app.post(`manageAddress/${action}`, { address_id: data.id })
              .then((result) => {
                wx.showToast({ title: result.data, icon: "none" });
                this.getList();
              })
              .catch((err) => {
                wx.showToast({ title: err, icon: "none" });
              });
        }
      },
    });
  },

  chooseMedia() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      camera: "back",
      success: (res) => {
        wx.uploadFile({
          url: app.globalData.baseUrl,
          filePath: res.tempFiles[0].tempFilePath,
          name: "file",
          formData: {
            "lt-id": wx.getStorageSync("lt-id"),
            "lt-token": wx.getStorageSync("lt-token"),
          },
          success: (res) => {
            const img = JSON.parse(res.data).data;
            this.setData({ "editValue.img": img });
          },
        });
      },
    });
  },
});
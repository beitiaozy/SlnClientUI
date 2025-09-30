// paginate/hehuoren/shebei_admin.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '设备列表',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    isEdit: false,
    position: '',
    address: {
      addr_area: '', addr_location: '',
    },
    editValue: {},
    addr_id: null,
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    this.setData({
      addr_id: options.addr_id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getList()
  },
  getList(params) {
    let data = {addr_id: this.data.addr_id}
    if (params) {
      if (!Number(params)) {
        data.name = params
      } else {
        data.dev_id = params
      }
    }
    app.post('vendingMachine/vmDeviceList', data).then(res => {
      this.setData({
        list: res.data
      })
    })
  },
  search(e) {
    console.log(e);
    this.getList(e.detail.value.search)
  },
  goPages(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  edit (e) {
    this.setData({
      isEdit: true,
      editValue: e.currentTarget.dataset.item
    })
  },
  edit_close() {
    this.setData({
      isEdit: false
    })
  },
  addNum() {
    this.setData({
      'editValue.amount': this.data.editValue.amount + 1
    })
  },
  delNum() {
    if (this.data.editValue.amount < 2) {
      return
    }
    this.setData({
      'editValue.amount': this.data.editValue.amount - 1
    })
  },
  changeInput(e) {
    console.log(e);
    let value = e.detail.value
    if (parseInt(value) < 1 || !value) {
      this.setData({
        'editValue.amount': this.data.editValue.amount
      })
      return
    }
    this.setData({
      'editValue.amount': parseInt(value)
    })
  },
  sure() {
    app.post('vendingMachine/editVMDevice', {...this.data.editValue, ...{vmdevice_id: this.data.editValue.id, address_id: this.data.editValue.addr_id}}).then(res => {
      wx.showToast({
        title: res.data, icon: 'none'
      })
      this.getList()
    }).catch(err => {
      wx.showToast({
        title: err, icon: 'none'
      })
    })
  },
  getPostion() {
    return
    wx.chooseLocation({
      success: res => {
        const a = res.address.split('区')
        const address = {
          diqu: a[0] + '区',
          diduan: res.name
        }
        this.setData({position: res.address, address})
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
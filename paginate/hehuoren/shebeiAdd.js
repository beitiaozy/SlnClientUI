// paginate/submitInfo/submitInfo.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {
      dev_id: '',
      name: '',
      status: '',
      address: '',
      address_id: '',
    },
    type: '0',
    isSelect: false,
    list: [],
    isTrue: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    this.setData({
      'info.dev_id': options.dev_id,
      'info.address_id': options.addr_id,
      type: options.type,
    })
    if (options.addr_id && options.addr_id != 'null') {
      app.post('vendingMachine/addressList').then(res => {
        res.data.map(item => {
          if (item.id == options.addr_id) {
            this.setData({
              isTrue: true,
              'info.address': item.addr_name,
              'info.address_id': item.id,
            })
          }
        })
      })
    }
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
    this.getInfo()
  },
  getInfo() {
    if (this.data.type == '1') {
      app.post('vendingMachine/getVMDevice', { dev_id: this.data.info.dev_id }).then(res => {
        this.setData({
          info: { ...this.data.info, ...res.data }
        })
      }).catch(err => {
        wx.showModal({
          title: '提示',
          content: err,
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      })
    }
    else if (this.data.type == '2') {
      app.post('rentalBox/getRentalBox', { dev_id: this.data.info.dev_id }).then(res => {
        this.setData({
          info: { ...this.data.info, ...res.data }
        })
      }).catch(err => {
        wx.showModal({
          title: '提示',
          content: err,
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      })
    }
  },
  select_changsuo() {
    if (this.data.isTrue) {
      return
    }
    app.post('vendingMachine/addressList').then(res => {
      this.setData({
        list: res.data,
        isSelect: true
      })
    })
  },
  select_close() {
    this.setData({
      isSelect: false
    })
  },
  changeRadio(e) {
    let data = e.currentTarget.dataset.item
    this.setData({
      isSelect: false,
      'info.address': data.addr_name,
      'info.address_id': data.id,
    })
  },
  addSubmit(e) {
    let data = { ...this.data.info, ...e.detail.value }
    if (!this.data.info.address_id) return wx.showToast({
      title: '请选择场所', icon: 'none'
    })
    if (this.data.type == '1') {
      if (!data.amount) return wx.showToast({
        title: '请输入货到数量', icon: 'none'
      })
      if (parseInt(data.amount) < 1) return wx.showToast({
        title: '货到数量不能小于1', icon: 'none'
      })
      app.post('vendingMachine/addVMDevice', data).then(res => {
        wx.showToast({
          title: res.data, icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1500)
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    }
    else if (this.data.type =='2') {
      app.post('rentalBox/addRentalBox', data).then(res => {
        wx.showToast({
          title: res.data, icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1500)
      }).catch(err => {
        wx.showToast({
          title: err, icon: 'none'
        })
      })
    }

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
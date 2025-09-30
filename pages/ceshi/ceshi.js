// pages/ceshi/ceshi.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '测试',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    men: '开门',
    dian: '开电',
    shui: '开水',
    beiyong: '开启备用',
    order: '订单开始',
    loadding: false,
    status: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!wx.getStorageSync('only_code')) {
      wx.setStorageSync('only_code', 869298055040976)
    }
    this.setData({
      imei: wx.getStorageSync('only_code')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  async manipulate(e) {
    // console.log(e);
    let type = e.currentTarget.dataset.type
    try {
      switch (type) {
        case '开门':
          const res1 = await app.post('user/doorCont', { type: 1, only_code: wx.getStorageSync('only_code') })
          app.showToast(res1.data)
          break
        case '关门':
          const res2 = await app.post('user/doorCont', { type: 0, only_code: wx.getStorageSync('only_code') })
          app.showToast(res2.data)
          break
        case '开电':
          const res3 = await app.post('user/powerCont', { type: 1, only_code: wx.getStorageSync('only_code') })
          app.showToast(res3.data)
          break
        case '断电':
          const res4 = await app.post('user/powerCont', { type: 0, only_code: wx.getStorageSync('only_code') })
          app.showToast(res4.data)
          break
        case '开水':
          const res5 = await app.post('user/waterCont', { type: 1, only_code: wx.getStorageSync('only_code') })
          app.showToast(res5.data)
          break
        case '关水':
          const res6 = await app.post('user/waterCont', { type: 0, only_code: wx.getStorageSync('only_code') })
          app.showToast(res6.data)
          break
        case '开启备用':
          const res7 = await app.post('user/spareCont', { type: 1, only_code: wx.getStorageSync('only_code') })
          app.showToast(res7.data)
          break
        case '关闭备用':
          const res8 = await app.post('user/spareCont', { type: 0, only_code: wx.getStorageSync('only_code') })
          app.showToast(res8.data)
          break
        case '订单开始':
          wx.showLoading({
            title: '订单开始',
          })
          const res9 = await app.post('user/beginCont', { only_code: wx.getStorageSync('only_code') })
          app.showToast(res9.data)
          break
        case '订单结束':
          wx.showLoading({
            title: '订单结束',
          })
          const res10 = await app.post('user/endCont', { only_code: wx.getStorageSync('only_code') })
          app.showToast(res10.data)
          break
        case 'status':
          wx.showLoading({
            title: '获取状态',
          })
          const res11 = await app.post('user/getStatus', { only_code: this.data.imei })
          wx.hideLoading()
          this.setData({
            status: res11.data
          })
          break
        case '开启欠费语音':
          const res12 = await app.post('user/moneyCont', { type: 1, only_code: wx.getStorageSync('only_code') })
          app.showToast(res12.data)
          break
        case '关闭欠费语音':
          const res13 = await app.post('user/moneyCont', { type: 0, only_code: wx.getStorageSync('only_code') })
          app.showToast(res13.data)
          break
      }
    } catch (error) {
      app.showToast(error)
    }
  },

  changeInput(e) {
    this.setData({
      imei: e.detail.value.trim()
    })
    // wx.setStorageSync('only_code', e.detail.value.trim())
  },
  edit() {
    wx.setStorageSync('only_code', this.data.imei)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
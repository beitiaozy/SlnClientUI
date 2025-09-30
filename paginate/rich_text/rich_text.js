// paginate/rich_text/rich_text.js
const app = getApp()
// 富文本插件
const wxParse = require("../../wxParse/wxParse.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '公告',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    info: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      'parameter.title': options.type
    })
    this.getInfo(options.type)
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
  async getInfo(e) {
    try {
      if (e == '公告') {
        const {data} = await app.post('')
        data.content = wxParse.wxParse('content', 'html', data.content, this, 0);
        this.setData({info: data})
        return
      }
      if (e == '轮播图' ||wx.getStorageSync('description')) {
        wxParse.wxParse('content', 'html', wx.getStorageSync('description'), this, 0);
        this.setData({info: wx.getStorageSync('description')})
        return
      }
    } catch (error) {
      app.showToast(error)
    }
   
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
    if (wx.getStorageSync('description')) {
      wx.removeStorageSync('description')
    }
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
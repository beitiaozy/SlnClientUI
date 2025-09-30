// paginate/shezhi/login.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'return': '1',
      'title': '修改密码',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    identity: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      identity: options.identity
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

  },
  async submit(e) {
    console.log(e);
    let data = e.detail.value
    if (!data.old_psd) return wx.showToast({
      title: '请输入原密码', icon: 'none'
    })
    if (!data.new_psd) return wx.showToast({
      title: '请输入新密码', icon: 'none'
    })
    if (!data.new_psd2) return wx.showToast({
      title: '请确认新密码', icon: 'none'
    })
    if (data.new_psd != data.new_psd2) return wx.showToast({
      title: '新密码输入不一致', icon: 'none'
    })
    console.log(data);
    try {
      const res = await app.post('manage/updatePsd', data)
      app.showToast(res.data)
      setTimeout(() => {
        wx.removeStorageSync('agent-id')
        wx.removeStorageSync('agent-token')
        wx.removeStorageSync('agent_info')
        wx.navigateBack({
          delta: 1,
        })
      }, 1500)
    } catch (error) {
      app.showToast(error)

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
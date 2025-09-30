// paginate/hehuoren/hehuoren.js
let app = getApp()
Page({
  data: {
    parameter: {
      'return': '1',
      'title': '代理商后台',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    background: [
      { money: 0, num: 0, dayMoney: 0, name1: '今日充值金额(元)', name2: '今日充值人数', name3: '今日消费额' },
      { money: 0, num: 0, dayMoney: 0, name1: '昨日充值金额(元)', name2: '昨日充值人数', name3: '昨日消费额' },
      { money: 0, num: 0, dayMoney: 0, name1: '本月充值金额(元)', name2: '本月充值人数', name3: '本月消费额' },
    ],
    current: 0,
    info: {},
    menuList: [
      { label: '会员管理', icon: 'icon-renyuan-', color: '#5e35b1', url: '/paginate/hehuoren/members/member' },
      { label: '订单', image: '/paginate/img/dingdan.png', url: '/paginate/hehuoren/m_order/order' },
      { label: '充值记录', image: '/images/dfk.png', url: '/paginate/hehuoren/m_recharge/recharge' },
      { label: '设备管理', icon: 'icon-menci', color: '#3a81fd', url: '/paginate/hehuoren/shebei_admin' },
      { label: '场地管理', image: '/paginate/img/changdi.png', url: '/paginate/hehuoren/changsuo_admin' },
      { label: '修改密码', icon: 'icon-xiugai', color: '#ff7043', url: '/paginate/editPwd/editPwd' },
      { label: '退出登录', icon: 'icon-h', color: '#bdbdbd', url: '退出' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      'parameter.title': wx.getStorageSync('agent_info').type + '后台'
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
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('agent_info').type
    })
    this.getInfo()
  },
  getInfo() {
    app.post('manage/homeInfo').then(res => {
      if (res.data.out_device_count === 0) {
        res.data.qhl = 0
      } else {
        res.data.qhl = parseFloat(parseFloat(res.data.out_device_count / res.data.online_device_count * 1000).toFixed(2)) / 10
      }

      let period = res.data.period


      this.data.background[0].money = period.today.recharge_money
      this.data.background[0].num = period.today.recharge_count
      this.data.background[0].dayMoney = period.today.consume_money

      this.data.background[1].money = period.yesterday.recharge_money
      this.data.background[1].num = period.yesterday.recharge_count
      this.data.background[1].dayMoney = period.yesterday.consume_money

      this.data.background[2].money = period.month.recharge_money
      this.data.background[2].num = period.month.recharge_count
      this.data.background[2].dayMoney = period.month.consume_money
      this.setData({ info: res.data.resDto, background: this.data.background })
    })
  },
  changeSwiper(e) {
    this.setData({ current: e.detail.current })
  },
  goPages(e) {
    let url = e.currentTarget.dataset.url
    if (url == '退出') {
      wx.removeStorageSync('agent-id')
      wx.removeStorageSync('agent-token')
      wx.removeStorageSync('agent_info')
      wx.switchTab({
        url: '/pages/user/user',
      })
      app.globalData.set_back2 = true
    } else {
      wx.navigateTo({
        url: url,
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
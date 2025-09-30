// components/kefu/kefu.js
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    phone() {
      app.post('user/getParameter').then(res => {
        wx.makePhoneCall({
          phoneNumber: res.data.mobile //仅为示例，并非真实的电话号码
        })
        this.setData({
          hidden: false
        })
      })

    },
    open() {
      this.setData({
        hidden: true
      })
    },
    close() {
      this.setData({
        hidden: false
      })
    },
  }
})

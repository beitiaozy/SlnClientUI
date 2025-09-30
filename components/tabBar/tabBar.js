// components/tabBar/tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    active: String,
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
    goTabBar(e) {
      console.log(e);
      wx.redirectTo({
        url: e.currentTarget.dataset.url,
      })
    }
  }
})

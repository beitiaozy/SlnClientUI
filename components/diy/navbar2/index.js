var app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    parameter:{
      type: Object,
      value:{
        class:'0'
      },
    },
    logoUrl:{
      type:String,
      value:'',
    }
  },
  data: {
    navH: ""
  },
  ready: function(){
    this.setClass();
    var pages = getCurrentPages();
    if (pages.length <= 1) this.setData({'parameter.return':0});
  },
  attached: function () {
    this.setData({
      navH: app.globalData.navHeight,
      height: app.globalData.boxHeight,
      top: app.globalData.boxTop,
    });
  },
  methods: {
    return:function(){
      // if (this.data.parameter.return == "2") {
      //   wx.redirectTo({
      //     url: '/pages/home_page/home_page'
      //   })
      //   return
      // }
      if (this.data.parameter.delta) {
        wx.redirectTo({
          url: '/pages/home_page/home_page'
        })
      } else {
        wx.navigateBack()
      }
    },
    setGoodsSearch:function(){
       wx.navigateTo({
         url: '/page/goods_search/index',
       })
    },
    setClass:function(){
      var color = '';
      switch (this.data.parameter.class) {
        case "0": case 'on':
          color = 'on'
          break;
        case '1': case 'black':
          color = 'black'
          break;
        case '2': case 'gray':
          color = 'gray'
          break;
        case '3': case "red":
          color = 'red'
          break;
        case '4': case "gradual01":
          color = 'gradual01'
          break;
        default:
          color = this.data.parameter.class;
          break;
      }
      this.setData({
        'parameter.class': color
      })
    }
  }
})
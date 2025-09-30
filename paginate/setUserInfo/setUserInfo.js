
const app = getApp()
import {Base64} from '../../utils/util2'
Page({
  data: {
    parameter: {
      'return': '1',
      'title': '个人信息',
      'color': '#fff',
      'class': 'app_bg_title',
      'navH': app.globalData.navHeight
    },
    avatarUrl_old: '',
    avatarUrl: '',
    nickname: '',
  },
  onLoad() {
    app.post('user/personInfo').then(res => {
      let base = new Base64(); 
      this.setData({
        avatarUrl:res.data.avatar,
        avatarUrl_old:res.data.avatar,
        nickname: base.decode(res.data.nickname)
      })
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    console.log(e);
    this.setData({
      avatarUrl,
    })
  },
  changeName(e) {
    this.setData({
      nickname: e.detail.value
    })
  },
  // 保存
  preserve(e) {
    console.log(e);
    let that = this
    const n = {
      'lt-id': wx.getStorageSync('lt-id'),
      'lt-token': wx.getStorageSync('lt-token')
    }
    wx.showLoading({
      title: '上传中',
    })
    console.log(app.globalData.baseUrl)
    console.log( this.data.avatarUrl.toString())
    let value = e.detail.value
    if (this.data.avatarUrl_old != this.data.avatarUrl) {
      console.log('ok')
      wx.uploadFile({
        url: app.globalData.baseUrl,
        filePath: this.data.avatarUrl.toString(),
        name: "img",
        formData: n,
        success: function(t) {
          console.log('上传');
          console.log(t);
          const avatar = JSON.parse(t.data).data;
          const params = {
            avatar,
            username:value.username
          }

          app.post('user/editUser',params).then(res => {
            console.log('ok')
            wx.hideLoading({})
            wx.showToast({
              title: res.data, icion: 'none'
            })
            let userInfo = wx.getStorageSync('userInfo')
            userInfo.avatarUrl = avatar
            userInfo.nickName = that.data.nickname
            wx.setStorageSync('userInfo', userInfo)
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              }, 1500)
            })
            console.log(res);
          }).catch(err => {
            wx.hideLoading({})
          })
        },
        fail:err =>{
          wx.hideLoading({})
          console.log('err', err);
        },
      });
    }else {
      const params = {
        username:value.username
      }
      app.post('user/editUser',params).then(res => {
        wx.hideLoading({})
        let userInfo = wx.getStorageSync('userInfo')
        userInfo.nickName = that.data.nickname
        wx.setStorageSync('userInfo', userInfo)
        wx.showToast({
          title: res.data, icion: 'none'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          }, 1500)
        })
        console.log(res);
      }).catch(err => {
        wx.hideLoading({})
      })
    }



  }
})

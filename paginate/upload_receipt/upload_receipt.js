Page({
  data: {
    parameter: {
      return: "1",
      title: "停车费凭证", // 统一标题
      color: "#fff",
      class: "app_bg_title"
    },
    image: '',
    description: ''
  },

  chooseImage() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success(res) {
        that.setData({
          image: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  onDescInput(e) {
    this.setData({
      description: e.detail.value
    });
  },

  submitForm() {
    wx.showLoading({
      title: '上传中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          wx.navigateBack({
            delta: 1
          });
        }
      });
    }, 1500);
  }
});
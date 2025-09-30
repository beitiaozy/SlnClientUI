let app = getApp();

Page({
    data: {
        mobile: '17727447972',  // 默认手机号
        password: '123456',     // 默认密码
        identity: '',           // 用户身份（代理或商家）
    },

    onLoad(options) {
        if (options.identity) {
            this.setData({
                identity: options.identity
            });
        }
    },
    goHome() {
        wx.switchTab({
            url: '/pages/main/main'  // 替换成你的主菜单路径
        });
    },
    // 提交表单
    submit(e) {
        const data = e.detail.value;

        // 校验手机号和密码
        if (!data.username) {
            return wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
        }
        if (!data.password) {
            return wx.showToast({
                title: '请输入密码',
                icon: 'none'
            });
        }

        // 发送登录请求
        const loginUrl = this.data.identity === '代理' ? 'manage/login' : 'shoper/login';

        console.info("loginUrl")
        app.post(loginUrl, data).then(res => {
            const userInfo = res.data;
            const userKey = this.data.identity === '代理' ? 'agent' : 'shoper';

            // 存储用户信息
            wx.setStorageSync(`${userKey}-id`, userInfo.user_id);
            wx.setStorageSync(`${userKey}-token`, userInfo.token);
            wx.setStorageSync(`${userKey}_info`, userInfo);

            // 跳转到不同页面
            wx.redirectTo({
                url: '/paginate/hehuoren/hehuoren',
            });
        }).catch(err => {
            wx.showToast({
                title: err,
                icon: 'none'
            });
        });
    },
});

/** @format */

import util, {Base64} from '../../utils/util2';
import {formatFreeMap} from "../../api/commonUtils";

const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        parameter: {
            return: '1',
            title: '个人中心',
            color: '#fff',
            class: 'app_bg_title'
        },
        auth: true,
        userInfo: {},
        MyMenus: [],
        isGoIndex: true,
        iShidden: true,
        isAuto: false,
        switchActive: true,
        loginType: app.globalData.loginType,
        orderStatusNum: {},
        info: {},
        showSpecialButtons: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.info("onLoad")
        this.setData({MyMenus: app.globalData.MyMenus});
        let params = {};
        params.dev_id = '0090D5000F10';
        app.post('banner/getInfo', params).then(res => {
            this.setData({
                info: res.data
            })
        })

    },
    onShow: function () {
        console.info("onshow")
        // 判断有没有授权登录
        if (wx.getStorageSync('isLogin') && wx.getStorageSync('lt-token')) {
            // this.getMobileNumber()
            this.getUserInfo();
            this.setData({
                userInfo: wx.getStorageSync('userInfo'),
                iShidden: true
            });
        } else {
            this.setData({
                userInfo: {},
                iShidden: false
            });
        }
    },
    close: function () {
        this.setData({switchActive: false});
    },
    /**
     * 授权回调
     */
    onLoadFun: function (e) {
        // this.getUserInfo();
        // this.getMyMenus();
        if (wx.getStorageSync('open_id')) {
            this.getUserInfo();
            // this.setData({
            //   userInfo: wx.getStorageSync('userInfo')
            // })
        }
    },
    Setting: function () {
        wx.openSetting({
            success: function (res) {
                console.log(res.authSetting);
            }
        });
    },
    /**
     *
     * 获取个人中心图标
     */
    getMyMenus: function () {
        var that = this;
        if (this.data.MyMenus.length) return;
        app.post('menu/user').then(res => {
            that.setData({MyMenus: res.data.routine_my_menus});
        });
    },
    /**
     * 获取个人用户信息
     */
    getUserInfo: function () {
        var that = this;
        app.post('user/personInfo').then(res => {
            let base = new Base64();
            res.data.nickname = base.decode(res.data.nickname);
            that.setData({
                userInfo: res.data,
                showSpecialButtons: res.data.mobile === '18382051045'
                    || res.data.mobile === '17727447972'
                    || res.data.mobile === '13085067560'
                    || res.data.mobile === '13423435982'
            });
        }).catch(e => {
            this.setData({iShidden: false});
        });
    },

    getPhoneNumber(e) {
        if (e.detail.hasOwnProperty('encryptedData')) {
            app.globalData.mobileCode = e.detail.code;
        }
    },
    editUserInfo() {
        if (wx.getStorageSync('lt-id')) {
            wx.navigateTo({
                url: '/paginate/setUserInfo/setUserInfo'
            });
        }
    },
    /**
     * 页面跳转
     */
    goPages: function (e) {
        let url = e.currentTarget.dataset.url;
        if (!wx.getStorageSync('lt-id')) {
            this.setData({iShidden: false});
            return;
        }
        if (url == '/paginate/user/apply') {
            // 申请成为后端管理员 -- 这部分逻辑得重新修改
        }
        if (url == '/paginate/hehuoren/hehuoren') {
            if (wx.getStorageSync('agent-token')) {
                wx.navigateTo({
                    url: '/paginate/hehuoren/hehuoren'
                });
            } else {
                wx.navigateTo({
                    url: '/paginate/shezhi/login?identity=代理'
                });
            }
            return;
        }

        if (url == 'saoma') {
            let self = this;
            wx.scanCode({
                onlyFromCamera: false,
                scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
                success: async result => {
                    const data = util.getUrlParams(decodeURIComponent(result.result).split('?')[1]); // ✅ 手动追加 recharge=true
                    data.recharge = 'true';
                    let {dev_id} = data;
                    await self.loadMessageData(dev_id)
                    // ✅ 如果有 recharge=true，就直接跳到充值页面
                    wx.navigateTo({
                        url: `/paginate/invest/invest?money=${this.data.userInfo?.money || 0}&address_id=4`
                    });
                    return;
                },
                fail: () => {
                },
                complete: () => {
                }
            });
        }
        wx.navigateTo({
            url: url
        });
    },

    async loadMessageData(dev_id) {
        let params = {};
        params.dev_id = dev_id ?? '0090D5000F10';
        let res2 = await app.post('banner/getInfo', params);
        if (res2.data === '设备参数错误') {
            wx.showModal({
                title: '提示',
                content: '店铺不存在',
                showCancel: false,
                success: () => {
                    wx.navigateBack({
                        delta: 1
                    });
                }
            });
            return;
        }
        const formattedFreeMap = formatFreeMap(res2.data.free_map);
        res2.data.free_map = formattedFreeMap
        wx.setStorageSync('messagedata', res2.data);
        app.globalData.address_id = res2.data.address_id;
    },

    kf_call: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.kf_tel
        });
    },

    linkTo({dev_id, num, recharge}) {
        const self = this;
        if (!wx.getStorageSync('lt-id')) {
            app.showToast('请先登录');
            app.globalData.dev_id = dev_id;
            self.setData({iShidden: false});
            return;
        }
        let res = recharge ? true : false
        wx.navigateTo({
            url: `/pages/index/index?dev_id=${dev_id}&isScan=true&num=${num}&recharge=${res}`
        });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({switchActive: false});
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
    }
});

/** @format */
import util from '../../utils/util2';
import {formatFreeMap} from "../../api/commonUtils";

const app = getApp();

// pages/main/main.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        parameter: {
            return: '1',
            title: '洗淶樂',
            color: '#   ',
            class: 'app_bg_title'
        },
        // 首页悬浮按钮相关
        showFloatingBall: false,
        currentOrder: null,
        // 轮播图、公告
        swiper: [],
        gonggao: [],
        // 登录提示
        iShidden: true,
        // 公告详情弹框
        modalVisible: false,
        modalContent: '',
        // 轮播图高度（根据图片宽高比动态计算）
        swiperHeight: 0
    },

    /**
     * 判断当前是否已登录
     */
    isUserLoggedIn() {
        return Boolean(wx.getStorageSync('lt-id'));
    },
    bindload(e) {
        const windowWidth = wx.getSystemInfoSync().windowWidth;
        const imgWidth = e.detail.width;
        const imgHeight = e.detail.height;
        const scale = windowWidth / imgWidth;
        const calculatedHeight = imgHeight * scale;
        this.setData({
            swiperHeight: calculatedHeight
        });
    },

    /**
     * 扫一扫
     */
    scan: function () {
        const self = this;
        wx.scanCode({
            onlyFromCamera: false,
            scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
            success: async result => {
                const data = util.getUrlParams(decodeURIComponent(result.result).split('?')[1]);
                self.linkTo(data);
            },
            fail: () => {
            },
            complete: () => {
            }
        });
    },

    async linkTo({dev_id, num, address_id}) {
        const self = this;
        if (!this.isUserLoggedIn()) {
            app.showToast('请先登录');
            app.globalData.dev_id = dev_id;
            self.setData({iShidden: false});
            return;
        }
        await this.loadMessageData(dev_id)
        wx.navigateTo({
            url: `/pages/index/index?dev_id=${dev_id}&isScan=true&num=${num}&address_id=${address_id}`
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.getInfo();
    },
    async getInfo() {
        const res1 = await app.post('banner/imgList');
        const res3 = await app.post('user/platformNoticeList');
        this.setData({
            swiper: res1.data.banner,
            gonggao: res3.data
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
    },
    checkOrderStatus() {
        app.post('userSiteOrder/getCurrentOrder')
            .then(res => {
                const data = res.data;
                if (data && data.only_code) {
                    // ✅ 有订单，显示按钮并缓存订单数据
                    this.setData({
                        showFloatingBall: true,
                        currentOrder: data
                    });
                } else {
                    // ✅ 没有订单
                    this.setData({
                        showFloatingBall: false,
                        currentOrder: null
                    });
                }
            })
            .catch(err => {
                // 接口失败也隐藏按钮
                this.setData({
                    showFloatingBall: false,
                    currentOrder: null
                });
            });
    },

    async gotoOrderPage() {
        const data = this.data.currentOrder;
        if (data && data.only_code) {
            // 复用下单时的缓存逻辑，保证跳转后信息齐全
            await this.loadMessageData(data.only_code)
            wx.navigateTo({
                url: `/pages/index/index?dev_id=${data.only_code}&isScan=true&num=${data.num}`
            });
        } else {
            app.showToast("暂无进行中的订单");
        }
    },

    onNoticeClick(e) {
        const index = e.currentTarget.dataset.index;
        const content = this.data.gonggao[index].content || '暂无内容';
        this.setData({
            modalVisible: true,
            modalContent: content
        });
    },
    closeModal() {
        this.setData({
            modalVisible: false,
            modalContent: ''
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (!this.isUserLoggedIn() || !wx.getStorageSync('lt-token')) {
            this.setData({ iShidden: false, showFloatingBall: false, currentOrder: null });
            return;
        }
        this.setData({ iShidden: true });
        this.checkOrderStatus();
    },

    async loadMessageData(dev_id) {
        // 设备信息与计费配置
        const params = {
            dev_id: dev_id ?? '0090D5000F10'
        };
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

        // 统一整理空闲时间配置
        const formattedFreeMap = formatFreeMap(res2.data.free_map);
        res2.data.free_map = formattedFreeMap;

        // 缓存设备信息供其他页面使用
        wx.setStorageSync('messagedata', res2.data);
        app.globalData.address_id = res2.data.address_id;
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
});

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
        if (!this.isUserLoggedIn()) {
            app.showToast('请先登录');
            app.globalData.dev_id = dev_id;
            this.setData({iShidden: false});
            return;
        }

        const deviceInfo = await this.loadMessageData(dev_id);
        if (!deviceInfo) return;

        const targetAddressId = address_id ?? deviceInfo.address_id;
        const targetNum = num ?? deviceInfo.num ?? 1;
        this.rememberLastDevice({dev_id, num: targetNum, address_id: targetAddressId});

        wx.navigateTo({
            url: `/pages/index/index?dev_id=${dev_id}&isScan=true&num=${targetNum}&address_id=${targetAddressId}`
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.hasAutoNavigated = false;
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
        return app.post('userSiteOrder/getCurrentOrder')
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
            const deviceInfo = await this.loadMessageData(data.only_code);
            if (!deviceInfo) return;

            const targetAddressId = data.address_id ?? deviceInfo.address_id;
            const targetNum = data.num ?? deviceInfo.num ?? 1;
            this.rememberLastDevice({
                dev_id: data.only_code,
                num: targetNum,
                address_id: targetAddressId
            });
            wx.navigateTo({
                url: `/pages/index/index?dev_id=${data.only_code}&isScan=true&num=${targetNum}&address_id=${targetAddressId}`
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
    async onShow() {
        if (!this.isUserLoggedIn() || !wx.getStorageSync('lt-token')) {
            this.hasAutoNavigated = false;
            this.setData({ iShidden: false, showFloatingBall: false, currentOrder: null });
            return;
        }

        this.setData({ iShidden: true });
        await this.checkOrderStatus();
        await this.autoNavigateIfPossible();
    },

    async loadMessageData(dev_id) {
        const params = {
            dev_id: dev_id ?? '0090D5000F10'
        };
        let res2;
        try {
            res2 = await app.post('banner/getInfo', params);
        } catch (error) {
            app.showToast(typeof error === 'string' ? error : '获取设备信息失败');
            return null;
        }

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
            return null;
        }

        const deviceData = {...res2.data};

        if (!this.ensureAddressAvailable(deviceData)) {
            return null;
        }

        if (!this.ensureDeviceAvailable(deviceData)) {
            return null;
        }

        const formattedFreeMap = formatFreeMap(deviceData.free_map);
        deviceData.free_map = formattedFreeMap;

        wx.setStorageSync('messagedata', deviceData);
        app.globalData.address_id = deviceData.address_id;

        return deviceData;
    },

    ensureDeviceAvailable(deviceData = {}) {
        const status = this.extractStatus(deviceData, [
            'dev_status',
            'device_status',
            'deviceStatus',
            'device_state',
            'deviceState',
            'vm_status',
            'is_online',
            'online_status'
        ]);

        const availability = this.translateStatusToAvailability(status);
        if (availability === false) {
            wx.showModal({
                title: '提示',
                content: '该设备处于离线状态，请更换其他设备',
                showCancel: false
            });
            return false;
        }
        return true;
    },

    ensureAddressAvailable(deviceData = {}) {
        const status = this.extractStatus(deviceData, [
            'address_status',
            'addr_status',
            'addressStatus',
            'address_state',
            'addressState',
            'shop_status',
            'store_status'
        ]);

        const availability = this.translateStatusToAvailability(status);
        if (availability === false) {
            wx.showModal({
                title: '提示',
                content: '店面升级维护中，请下次再来',
                showCancel: false
            });
            return false;
        }
        return true;
    },

    extractStatus(source = {}, keys = []) {
        for (const key of keys) {
            if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
                return source[key];
            }
        }
        return undefined;
    },

    translateStatusToAvailability(status) {
        if (status === undefined) return undefined;

        if (typeof status === 'boolean') return status;

        if (typeof status === 'number') {
            if (status === 0) return false;
            if (status === -1) return false;
            return status > 0;
        }

        const statusText = String(status).trim();
        if (!statusText) return undefined;

        const upper = statusText.toUpperCase();
        const onlineKeywords = ['ONLINE', 'ACTIVE', 'ENABLED', 'ENABLE', 'AVAILABLE', 'OPEN', 'RUNNING', 'IN_SERVICE'];
        const offlineKeywords = [
            'OFFLINE',
            'INACTIVE',
            'DISABLED',
            'DISABLE',
            'CLOSED',
            'CLOSE',
            'MAINTAIN',
            'MAINTAINING',
            'MAINTENANCE',
            'UPGRADE',
            'UPGRADING',
            'SHUTDOWN',
            'SHUT_DOWN',
            'STOP',
            'STOPPED',
            'OUT_OF_SERVICE'
        ];

        if (onlineKeywords.includes(upper)) return true;
        if (offlineKeywords.includes(upper)) return false;

        if (/维护|升级|停用|暂停|关闭|离线/.test(statusText)) return false;
        if (/营业|正常|开放|开启|在线/.test(statusText)) return true;

        return undefined;
    },

    rememberLastDevice(payload = {}) {
        if (!payload || !payload.dev_id) return;
        wx.setStorageSync('lastScanInfo', {
            dev_id: payload.dev_id,
            num: payload.num ?? 1,
            address_id: payload.address_id
        });
    },

    async autoNavigateIfPossible() {
        if (this.hasAutoNavigated) return;

        const cached = this.resolveCachedDevice();
        if (!cached) return;

        const deviceInfo = await this.loadMessageData(cached.dev_id);
        if (!deviceInfo) return;

        const targetAddressId = cached.address_id ?? deviceInfo.address_id;
        if (!targetAddressId) return;

        const targetNum = cached.num ?? deviceInfo.num ?? 1;

        this.hasAutoNavigated = true;
        this.rememberLastDevice({
            dev_id: cached.dev_id,
            num: targetNum,
            address_id: targetAddressId
        });

        wx.navigateTo({
            url: `/pages/index/index?dev_id=${cached.dev_id}&isScan=true&num=${targetNum}&address_id=${targetAddressId}`
        });
    },

    resolveCachedDevice() {
        const cached = wx.getStorageSync('lastScanInfo');
        if (cached && cached.dev_id) {
            return cached;
        }

        const messageData = wx.getStorageSync('messagedata');
        if (messageData && messageData.dev_id) {
            return {
                dev_id: messageData.dev_id,
                num: messageData.num,
                address_id: messageData.address_id
            };
        }

        if (app.globalData && app.globalData.dev_id) {
            return {
                dev_id: app.globalData.dev_id,
                num: app.globalData.num,
                address_id: app.globalData.address_id
            };
        }

        return null;
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

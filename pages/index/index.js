/** @format */

// index.js
// 获取应用实例
import util from '../../utils/util2';

const app = getApp();

Page({
    data: {
        parameter: {
            return: '1',
            title: '',
            color: '#fff',
            class: 'app_bg_title'
        },
        iShidden: true,
        info: {},
        userInfo: {},
        timeMoney: null,
        img: [],
        location: {
            longitude: null,
            latitude: null
        },
        state: '待使用',
        type: '',
        order_id: null,
        address_id: null,
        shouldSkipOnShow: false // 标记：当由充值页返回时，跳过 onShow 的自动流程
    },
    onLoad(options) {
        if (!wx.getStorageSync('lt-id')) {
            wx.switchTab({
                url: '/pages/user/user'
            });
            return;
        }

        this.initFromOptions(options);

        // ✅ 如果有 recharge=true，就直接跳到充值页面
        if (options.recharge === 'true' && options.address_id) {
            wx.navigateTo({
                url: `/paginate/invest/invest?money=${this.data.userInfo?.money || 0}&address_id=${options.address_id || ''}`
            });
            this.setData({shouldSkipOnShow: true});
        }
    },
    async onShow() {
        if (this.data.shouldSkipOnShow) {
            // 外部流程需要手动重置 shouldSkipOnShow，避免重复触发
            return;
        }

        const shouldContinue = await this.getInfo(); // 保证在获取信息后获取订单
        if (!shouldContinue) return;
        const noHas = await this.orderInfo();
        if (true === noHas) {
            // 当不存在订单时判断是否需要进行跳转操作
            // 清除订单id
            app.globalData.order_dev_id = undefined;
            // 说明没有订单
            if (this.data.isScan) {
                this.createOrder();
                // 将扫码状态改变
                this.setData({
                    isScan: false
                });
            }
        }
    },
    /**
     * 根据页面参数初始化业务字段
     */
    initFromOptions(options = {}) {
        const {isScan} = options;

        const num = !options.num || options.num === 'undefined' ? 1 : options.num;
        const address_id = !options.address_id || options.address_id === 'undefined' ? 4 : options.address_id;

        const dev_id = options.dev_id;
        app.globalData.dev_id = dev_id;

        this.setData({
            isScan,
            num,
            dev_id,
            address_id
        });
    },
    /**
     * 获取门店信息、个人信息
     */
    async getInfo() {
        try {
            let params = {};
            params.dev_id =
                // 获取当前订单的设备id
                app.globalData.order_dev_id ??
                this.data.dev_id ??
                app.globalData.dev_id;

            const datas = wx.getStorageSync('messagedata');
            wx.setStorageSync("address_id", datas.address_id);

            const res3 = await app.post('user/personInfo');

            const userAndAddressInfo = { ...datas, ...res3.data };
            wx.setStorageSync('messagedata', userAndAddressInfo);
            this.setData({
                type: datas.type,
                'parameter.title': datas.addr_name,
                userInfo: userAndAddressInfo,
            });

            if (Number(userAndAddressInfo.money) < 3) {
                wx.navigateTo({
                    url: `/paginate/invest/invest?money=${userAndAddressInfo.money || 0}&address_id=${userAndAddressInfo.address_id || ''}`
                });
                return false;
            }

        } catch (error) {
            wx.showModal({
                title: '提示',
                content: error,
                showCancel: false,
                success: () => {
                    wx.navigateTo({
                        url: '/pages/user/user'
                    });
                }
            });
            return false;
        }
        return true;
    },
    bindload(e) {
        app.bindload(e, this);
    },
    /**
     * 创建订单
     */
    createOrder(e) {
        try {
            const {
                currentTarget: {dataset: {url = undefined}} = {
                    dataset: {url: undefined}
                }
            } = e;
            if (url && !this.data.isScan) {
                const that = this;
                wx.scanCode({
                    success: (e) => {
                        const data = util.getUrlParams(
                            decodeURIComponent(e.result).split('?')[1]
                        );
                        app.globalData.dev_id = data.dev_id;
                        app.globalData.num = data.num;
                        // wx.setStorageSync("address_id", app.globalData.dev_id);
                        that.setData({
                            isScan: true,
                            dev_id: data.dev_id,
                            address_id: data.address_id,
                            num: data.num
                        });
                        //主要获取他的类型
                        that.onShow();
                    }
                });
                return;
            }
        } catch (e) {
            app.showToast(e);
        }
        wx.navigateTo({
            url: `/paginate/payment/payment`
        });
    },
    /**
     * 统一处理入口按钮跳转
     */
    async goPages(e) {
        let url = e.currentTarget.dataset.url;
        if (url == 'saoma') {
            // 主动扫码
            this.setData({isScan: false})
            this.createOrder();
            return;
        }
        if (url == 'stop') {
            const that = this;
            const orderId = that.data.order_id;
            if (!orderId) {
                app.showToast('缺少订单ID，无法结束洗车');
                return;
            }

            wx.showModal({
                title: '提示',
                content: '您需要停止洗车吗？',
                success: (a) => {
                    if (a.confirm) {
                        app.post('userSiteOrder/endOrder', {order_id: orderId})
                            .then((res) => {
                                const {data: err} = res;


                                console.info("===============")

                                if (/*余额不足*/ err === '账户余额不足 请先充值') {
                                    wx.navigateTo({
                                        url: `/paginate/invest/invest?money=${that.data.userInfo.money}&address_id=${that.data.info.address_id}`,
                                        success: () => {
                                            wx.showModal({
                                                title: '提示',
                                                content: '账户余额不足，请先充值',
                                                showCancel: false
                                            });
                                        }
                                    });
                                    return;
                                }
                                clearInterval(this.timer);
                                this.setData({timeMoney: null});
                                //跳转到订单详情
                                wx.switchTab({
                                    url: '/pages/main/main'  // 替换成你的主菜单路径
                                });
                                return;
                            })
                            .catch((err) => {
                                wx.showModal({
                                    title: '提示',
                                    content: err,
                                    showCancel: false,
                                    success: () => {
                                        if (/*余额不足*/ err === '账户余额不足 请先充值') {
                                            wx.navigateTo({
                                                url: `/paginate/invest/invest?money=${that.data.userInfo.money}&address_id=${that.data.info.address_id}`
                                            });
                                            return;
                                        }
                                    }
                                });
                            });
                    }
                }
            });
            return;
        }
        if (url == '/paginate/invest/invest') {
            wx.navigateTo({
                url: `${url}?money=${this.data.userInfo.money}&address_id=${this.data.info.address_id}`
            });
            return;
        }
        wx.navigateTo({
            url: url
        });
    },
    /**
     * 查询当前订单信息
     */
    async orderInfo() {
        const res = await app.post('userSiteOrder/getCurrentOrder');
        try {
            if (!res.data || Object.keys(res.data).length === 0) return true;
            if (res.data.status === '待付款') {
                this.setData({
                    state: '待使用'
                });
                return true;
            } else
                this.setData({
                    state: res.data.status
                });

            let begin = new Date(res.data.begin_time.replace(/-/g, '/')).getTime();

            const info = util.useTime(begin);
            res.data.time = info.time;
            let timeMoney = {
                begin,
                price_y: res.data.price_y,
                price_z: res.data.price_z,
                prize_pm: res.data.prize_pm,
                prize_sl: res.data.prize_sl,
                base_time_x: res.data.base_time_x,
                time: info.time,
                min: info.min,
                pay_code: res.data.pay_code
            };
            timeMoney.price = res.data.total_money;
            this.setData({
                timeMoney,
                type: res.data.type,
                order_id: res.data.id
            });

            this.timer = setInterval(() => {
                this.useTM();
            }, 1000);
        } catch (error) {
            app.showToast(error.message);
        }
        return res.data.status === '待付款';
    },
    /**
     * 计时费用展示刷新
     */
    useTM() {
        let info = util.useTime(this.data.timeMoney.begin);

        let timeMoney = {
            time: info.time,
            min: info.min
        };
        this.setData({
            timeMoney: {
                ...this.data.timeMoney,
                ...timeMoney
            }
        });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        clearInterval(this.timer);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(this.timer);
        app.globalData.num = null;
        app.globalData.dev_id = null;
    },
    /**
     * 用户点击分享
     */
    onShareAppMessage: function () {
    }
});

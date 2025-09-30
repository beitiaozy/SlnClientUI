/** @format */

const app = getApp();

Page({
    data: {
        parameter: {
            return: '1',
            title: '订单支付',
            color: '#fff',
            class: 'app_bg_title'
        },
        type: '自助',
        money: '0',
        y_list: [],
        couponOptions: ['不使用优惠券'],
        couponIndex: -1,
        new_people: {
            status: false
        },
        activities: [], // 当前活动
        selectedActivity: null // 选中的活动
    },

    // 选择活动
    selectActivity: function(e) {
        const { index } = e.currentTarget.dataset;
        this.setData({
            selectedActivity: { index }
        });
    },

    // 优惠券选择变化
    onCouponChange: function(e) {
        const index = e.detail.value;
        this.setData({
            couponIndex: index,
        });
    },


    // 提交充值
    async submitRecharge() {
        if (!this.data.selectedActivity) {
            wx.showToast({
                title: '请选择充值活动',
                icon: 'none'
            });
            return;
        }
        let {index} = this.data.selectedActivity;
        let data = this.data.activities[index];

        try {
            const res = await app.post(`recharge/getRechargeCode?rechargeId=${data.id}`);

            const res2 = await app.post('payment/getCodeForRechargePay', {
                order_id: res.data
            });

            app.sqbPay(res2.data.wap_pay_request, e => {
                if (e == '支付成功') {
                    app.showToast('支付成功');
                    this.refresh(this.data.address_id);
                }
            });
        } catch (error) {
            console.error('充值失败', error);
            app.showToast(error.message || '充值失败');
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        let options = wx.getStorageSync('messagedata');
        console.info(options)
        // 原有代码保持不变
        const {address_id} = options;
        if(address_id) wx.setStorageSync("address_id", address_id)

        this.setData(options);
        this.refresh(address_id)
        this.getList();
    },

    async getList() {
        try {
            const res = await app.post('recharge/listRecharge', {
                address_id: this.data.address_id
            });
            const list = Array.from(res.data);

            // 分离新用户活动和常规活动
            const activities = list.filter(it => it.type !== 'routine'.toUpperCase());

            this.setData({activities});
        } catch (error) {
            app.showToast('获取充值活动列表失败，请联系管理员');
            this.setData({ activities: []});
        }
    },

    async refresh(address_id) {
        let param = {};
        param['address_id'] = address_id;
        param['status'] = 'ACTIVE';
        param['use_time'] = new Date().toISOString().substring(0, 10);
        const res = await app.post('userVoucher/voucherList', param);

        // 构建优惠券选项
        const couponOptions = ['不使用优惠券'];
        if (res.data && res.data.length > 0) {
            res.data.forEach(coupon => {
                if (coupon.type === "DEAL_COMBO") {
                    couponOptions.push(`${coupon.type_description} (剩余${coupon.amount}次)`);
                } else if (coupon.type === "MONTH_COMBO") {
                    couponOptions.push(`${coupon.type_description} (剩余${coupon.amount}天)`);
                } else {
                    couponOptions.push(`${coupon.type_description} (￥${coupon.total_money})`);
                }
            });
        }
        this.setData({
            y_list: res.data,
            couponOptions,
            couponIndex: res.data.length === 0 ? '-1' : 1
        })
    },

    // 保留原有的y_pay函数
    async y_pay() {
        // 原有代码保持不变
        const {dev_id, num, y_list, couponIndex, money, address_id} = this.data;
        const callback = () => {
            const param = {dev_id, num};
            if (y_list.length > 0 && couponIndex > '0') {
                param.voucher_id = y_list[couponIndex - 1].id;
            }

            app.post('userSiteOrder/beginOrder', param)
                .then(res => {
                    app.showToast(res.data);
                    app.globalData.order_dev_id = dev_id;
                    wx.navigateBack({delta: 1});
                }).catch(error => {
                wx.showModal({
                    title: '提示',
                    content: error,
                    showCancel: error == '账户余额不足 请先充值',
                    success: a => {
                        if (a.confirm && error == '账户余额不足 请先充值') {
                            wx.navigateTo({
                                url: `/paginate/invest/invest?money=${money}&address_id=${address_id}`
                            });
                        }
                    }
                });
            });
        };
        callback();
    },

    // 其他生命周期函数保持不变
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});
import {Base64} from '../../../utils/util2'
import {formatTime} from "../../../utils/util";

let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parameter: {
            'return': '1',
            'title': '我的订单',
            'color': '#fff',
            'class': 'app_bg_title'
        },
        orderList: [],
        params: {
            pageNo: 1,
            pageSize: 10,
            body: {
                mobile: '',
                pay_code: ''
            },
            totalPage: -1
        },
        searchMobile: '',
        isLogin: false,
        // 新增场地相关数据
        addressList: [],
        addressIndex: -1,
        currentAddress: null,
        showFullName: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    // 新增方法：获取场地列表
    async getAddressList() {
        try {
            const res = await app.post("manage/queryAddressList");
            const addressList = res.data || [];
            // 如果地址列表不为空，则默认选中第一个地址
            if (addressList.length > 0) {
                this.setData({
                    addressList,
                    addressIndex: 0,
                    currentAddress: addressList[0]
                });

                console.info('getAddressList')
                // 默认加载一次会员列表
                this.orderList();
            } else {
                // 如果没有地址，不加载数据
                this.setData({ addressList: [], addressIndex: -1, currentAddress: null });
                wx.showToast({ title: "暂无场地可选", icon: "none" });
            }
        } catch (e) {
            console.log(e)
            wx.showToast({ title: "场地加载失败", icon: "none" });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (wx.getStorageSync('agent-token')) {
            this.setData({
                isLogin: true, orderList: [], param: {
                    pageNo: 1,
                    pageSize: 10
                }
            })
            this.getAddressList();
        } else {
            this.setData({isLogin: false})
        }


    },

    resetList() {
        this.setData({
            list: [],
            ['params.pageNo']: 1,
            ['params.total']: -1
        }, () => {
            this.orderList();
        });
    },
    // 订单列表
    orderList() {


        if (this.data.loading) return;
        // 新增判断：未选中场地则提示
        if (!this.data.currentAddress) {
            wx.showToast({title: '请选择场地', icon: 'none'});
            return;
        }

        // if (this.data.params.totalPage !== -1 && this.data.orderList.length >= this.data.params.total) {
        //     return wx.showToast({title: '已加载全部数据', icon: 'none'});
        // }

        this.setData({loading: true});

        try {
            const params = {
                page_no: this.data.params.pageNo,
                page_size: this.data.params.pageSize,
                body: {
                    mobile: this.data.searchMobile,
                    address_id: this.data.currentAddress.address_id
                }
            };

            app.post('manageOrder/orderList', params).then(res => {
                let base = new Base64();
                const statusTypeMap = {
                    '已完成': 'completed',
                    '使用中': 'processing',
                    '待支付': 'pending'
                };

                const formatAmount = (value, fallback = '0.00') => {
                    if (value === null || value === undefined || value === '') {
                        return fallback;
                    }
                    const num = Number(value);
                    return Number.isFinite(num) ? num.toFixed(2) : fallback;
                };

                const formattedList = (res.data.datas || []).map(item => {
                    const decodedNickname = base.decode(item.nickname);
                    const netAmountRaw = item.net_amount ?? item.total_money ?? item.pay_amount;
                    const totalAmountRaw = item.total_amount ?? item.total_money ?? netAmountRaw;
                    const discountAmountRaw = item.discount_amount ?? (
                        totalAmountRaw !== undefined && netAmountRaw !== undefined
                            ? Number(totalAmountRaw) - Number(netAmountRaw)
                            : undefined
                    );

                    const netAmount = formatAmount(netAmountRaw);
                    const totalAmount = formatAmount(totalAmountRaw, netAmount);
                    const discountAmount = formatAmount(discountAmountRaw, '0.00');

                    return {
                        ...item,
                        nickname: decodedNickname,
                        net_amount: netAmount,
                        total_amount: totalAmount,
                        discount_amount: discountAmount,
                        _statusType: statusTypeMap[item.status] || 'default'
                    };
                });

                this.setData({
                    orderList: formattedList,
                    params: {
                        ...this.data.params,
                        ...{
                            pageNo: res.data.page_number,
                            totalPage: res.data.total_page
                        }
                    }
                })
            })
        } catch (err) {
            wx.showToast({ title: '数据加载失败', icon: 'none' });
            console.error(err);
        } finally {
            this.setData({ loading: false });
        }

    },
    onSearchInput(e) {
        this.setData({
            searchMobile: e.detail.value
        });
    },
    // 新增方法：选择场地
    onAddressChange(e) {
        const index = e.detail.value;
        console.log("onAddressChange")
        this.setData({
            addressIndex: index,
            currentAddress: index >= 0 ? this.data.addressList[index] : null,
            showFullName: false,
            orderList: [],
            ['params.pageNo']: 1,
            ['params.body.mobile']:undefined,
            ['params.total']: -1
        });
        this.orderList();
    },

    searchByMobile() {
        this.setData({
            'params.pageNo': 1,
            'params.body.mobile': this.data.searchMobile.length <= 11 ? this.data.searchMobile : '',
            'params.body.pay_code': this.data.searchMobile.length > 11 ? this.data.searchMobile : '',
            orderList: []
        }, () => {
            this.orderList();
        });
    },
    copyOrder(e) {
        let data = e.currentTarget.dataset.item;
        wx.setClipboardData({
            data: "手机号: " + data.mobile + "\n" + "订单号: " + data.pay_code,
            success(res) {
                wx.showToast({
                    title: '手机号与订单号已复制',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail(err) {
                console.error('复制失败:', err)
                wx.showToast({
                    title: '复制失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        })

    },

    // 取消订单
    cancelOrder(e) {
        let _this = this;
        let data = e.currentTarget.dataset;
        wx.showModal({
            title: "提示",
            content: "您确认要结束该订单吗？",
            success(o) {
                if (o.confirm) {
                    app.post('manageOrder/cancel', {order_id: data.item.order_id}).then(res => {
                        app.showToast(res.data)
                        this.onShow()
                    }).catch(err => {
                        app.showToast(err)
                    })
                    return
                    cancel(params).then(res => {
                        // console.log(res);
                        wx.showToast({
                            title: res.data, icon: 'none',
                            success: a => {
                                _this.setData({
                                    orderList: [],
                                    'params.page': 1,
                                })
                                _this.orderList()
                            }
                        })
                    }).catch(err => {
                        wx.showToast({
                            title: err, icon: 'none'
                        })
                    })
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (this.data.params.pageNo < this.data.params.totalPage) {
            this.setData({
                'params.pageNo': this.data.params.pageNo + 1
            })
            this.orderList()
        }
    },
})
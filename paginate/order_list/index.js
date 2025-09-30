import {Base64} from '../../utils/util2'

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
        totalPage: 1,
        params: {
            type: '全部',
            pageNo: 1,
            pageSize: 10,
            body: {
                mobile: ''
            },
            totalPage: -1
        },
        iShidden: true,
        searchMobile: '',
        isLogin: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (!wx.getStorageSync('lt-token') || !this.data.isLogin) {
            this.setData({isLogin: false})
            this.setData({ iShidden: false });
        }

        if (options.mobile) {
            this.data.params.pageNo = options.mobile
        }
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
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
        if (wx.getStorageSync('lt-token')) {
            this.data.params.pageNo = 1
            this.setData({isLogin: true, orderList: []})
            this.orderList()
        } else {
            this.setData({isLogin: false})
            this.setData({ iShidden: false });
        }


    },
    // 订单列表
    orderList() {
        app.post('userSiteOrder/orderList', this.data.params).then(res => {
            let base = new Base64();
            res.data.datas.map(item => {
                item.nickname = base.decode(item.nickname);
            })
            this.setData({
                orderList: [...this.data.orderList, ...res.data.datas],
                params: {
                    ...this.data.params, ...{
                        totalPage: res.data.total_page
                    }
                }
            })
        })
    },
    handleInput(e) {
        this.setData({
            searchMobile: e.detail.value
        });
    },
    copyOrder(e) {
        let data = e.currentTarget.dataset.item;
        wx.setClipboardData({
            data: "手机号: " + data.mobile + "\n" + "订单号: " + data.pay_code,
            success(res) {
                wx.showToast({
                    title: '手机号与订单号已複製',
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
                    app.post('userSiteOrder/endOrder', {order_id: data.item.order_id}).then(res => {
                        app.showToast(res.data)
                        _this.onShow()
                    }).catch(err => {
                        app.showToast(err)
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
    onReachBottom: function () {
        if (this.data.params.pageNo < this.data.params.totalPage) {
            this.setData({
                'params.pageNo': this.data.params.pageNo + 1
            })
            this.orderList()
        }
    },
})
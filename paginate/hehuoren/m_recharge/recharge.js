import {Base64} from '../../../utils/util2'

let app = getApp()

Page({
    data: {
        parameter: {
            return: '1',
            title: '充值明细',
            color: '#fff',
            class: 'app_bg_title',
            navH: app.globalData.navHeight
        },
        params: {
            page_no: 1,
            page_size: 10,  // 統一使用 page_size 而非 page_size
            total_page: 1,
            body: {
                address_id: null,  // 使用駝峰命名
                mobile: null,
                start_date: '',
                end_date: ''
            }
        },
        isLogin: false,
        addressList: [],
        addressIndex: 0,
        currentAddress: null,
        mobile: '',
        date: '',
        date2: '',
        list: [],
        info: {},
        loading: false,  // 新增加載狀態
        noMoreData: false  // 新增無更多數據標記
    },

    onLoad: function () {
    },

    onShow: function () {
        if (wx.getStorageSync('agent-token')) {
            const today = new Date().toISOString().split('T')[0]
            this.setData({
                date: today,
                date2: today,
                isLogin: true,
                list: [],
                loading: false,
                noMoreData: false,
                params: {
                    page_no: 1,
                    page_size: 10,
                    total_page: 1,
                    body: {
                        mobile: null,
                        start_date: today + ' 00:00:00',
                        end_date: today + ' 23:59:59',
                        address_id: null
                    }
                }
            })
            this.getAddressList()
        } else {
            this.setData({isLogin: false})
        }
    },

    async getAddressList() {
        try {
            wx.showLoading({title: '加载中...', mask: true})
            const res = await app.post("manage/queryAddressList")
            const addressList = res.data || []

            if (addressList.length > 0) {
                this.setData({
                    addressList,
                    addressIndex: 0,
                    currentAddress: addressList[0],
                    'params.body.address_id': addressList[0].address_id,
                    'params.page_no': 1,
                    noMoreData: false
                })
                this.getList()
            } else {
                this.setData({
                    addressList: [],
                    addressIndex: -1,
                    currentAddress: null,
                    'params.body.address_id': null
                })
                wx.showToast({title: "暂无场地可选", icon: "none"})
            }
        } catch (e) {
            console.error(e)
            wx.showToast({title: "场地加载失败", icon: "none"})
        } finally {
            wx.hideLoading()
        }
    },

    onAddressChange(e) {
        const index = e.detail.value
        const selected = this.data.addressList[index]
        this.setData({
            addressIndex: index,
            currentAddress: selected,
            'params.body.address_id': selected.address_id,
            'params.page_no': 1,
            list: [],
            noMoreData: false
        }, () => {
            this.getList()
        })
    },

    onSearchInput(e) {
        this.setData({
            mobile: e.detail.value,
            'params.body.mobile': e.detail.value,
            'params.page_no': 1,
            list: [],
            noMoreData: false
        })

        // 添加防抖處理
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.getList()
        }, 500)
    },

    resetList() {
        const today = new Date().toISOString().split('T')[0]
        this.setData({
            'params.page_no': 1,
            'params.body.mobile': null,
            'params.body.start_date': today + ' 00:00:00',
            'params.body.end_date': today + ' 23:59:59',
            date: today,
            date2: today,
            mobile: '',
            list: [],
            noMoreData: false
        }, () => {
            this.getList()
        })
    },

    bindDateChange(e) {
        const start = e.detail.value
        const end = this.data.date2 || start

        this.setData({
            date: start,
            'params.body.start_date': `${start} 00:00:00`,
            'params.body.end_date': `${end} 23:59:59`,
            'params.page_no': 1,
            list: [],
            noMoreData: false
        }, () => {
            this.getList()
        })
    },

    bindDateChange2(e) {
        const end = e.detail.value
        const start = this.data.date || end

        this.setData({
            date2: end,
            'params.body.start_date': `${start} 00:00:00`,
            'params.body.end_date': `${end} 23:59:59`,
            'params.page_no': 1,
            list: [],
            noMoreData: false
        }, () => {
            this.getList()
        })
    },

    async getList() {
        if (this.data.loading || this.data.noMoreData) return

        this.setData({loading: true})

        try {
            // 確保必填參數
            if (!this.data.params.body.address_id && this.data.addressList.length > 0) {
                this.setData({
                    'params.body.address_id': this.data.addressList[0].address_id
                })
            }

            // 構建請求參數
            const requestParams = {
                page_no: this.data.params.page_no,
                page_size: this.data.params.page_size,
                body: {
                    ...this.data.params.body,
                    // 確保後端接收的字段名正確
                    address_id: this.data.params.body.address_id,
                    start_date: this.data.params.body.start_date,
                    end_date: this.data.params.body.end_date
                }
            }

            const res = await app.post('recharge/listRechargeRecord', requestParams)

            if (res.data && res.data.list) {
                // 處理數據
                const base = new Base64()
                const newData = res.data.list.datas.map(item => {
                    return {
                        ...item,
                        nickname: item.nickname ? base.decode(item.nickname) : ''
                    }
                })

                this.setData({
                    list: this.data.params.page_no === 1 ? newData : [...this.data.list, ...newData],
                    'params.total_page': res.data.list.total_page || 1,
                    info: res.data,
                    noMoreData: this.data.params.page_no >= (res.data.list.total_page || 1)
                })
            }
        } catch (err) {
            console.error('Error fetching recharge records:', err)
            wx.showToast({title: "查询失败", icon: "none"})
        } finally {
            this.setData({loading: false})
        }
    },

    bindscrolltolower() {
        if (!this.data.loading &&
            !this.data.noMoreData &&
            this.data.params.page_no < this.data.params.total_page) {

            this.setData({
                'params.page_no': this.data.params.page_no + 1
            }, () => {
                this.getList()
            })
        }
    },

    copy(e) {
        let item = e.currentTarget.dataset.item
        let cpyStr = ` 手机号：${item.mobile}\n  订单号： ${item.code}`
        wx.setClipboardData({
            data: cpyStr,
            success(res) {
                wx.showToast({
                    title: '手机号与订单号已複製',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    }
})
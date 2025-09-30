const app = getApp();
import { formatTime } from '../../../utils/util';
import {Base64} from "../../../utils/util2";

Page({
    data: {
        parameter: {
            'return': '1',
            'title': '会员管理',
            'color': '#fff',
            'class': 'app_bg_title'
        },
        page: {
            pageNo: 1,
            pageSize: 10,
            total: -1
        },
        mobile: '',
        list: [],
        loading: false,
        showEditModal: false,
        showRefundModal: false,
        currentUser: {},
        newBalance: '',
        extMoney: '0',
        remark: '',
        refundAmount: '',
        refundReason: '',
        // 新增场地相关数据
        addressList: [],
        addressIndex: -1,
        currentAddress: null,
        showFullName: false
    },

    onLoad() {
        this.getAddressList();
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

                // 默认加载一次会员列表
                this.getMemberList();
            } else {
                // 如果没有地址，不加载数据
                this.setData({ addressList: [], addressIndex: -1, currentAddress: null });
                wx.showToast({ title: "暂无场地可选", icon: "none" });
            }
        } catch (e) {
            wx.showToast({ title: "场地加载失败", icon: "none" });
        }
    },


    // 打开修改弹窗
    openEditModal(e) {
        const user = e.currentTarget.dataset.item;
        let base = new Base64();
        this.setData({
            showEditModal: true,
            currentUser: {
                ...user,
                nickname: base.decode(user.nickname) // 解密nickname
            },
            newBalance: user.current_account.balance.toString(),
            extMoney: (user.current_account.ext_money || 0).toString(),
            remark: ''
        });
    },

    // 打开退款弹窗
    openRefundModal(e) {
        const user = e.currentTarget.dataset.item;
        let base = new Base64();
        this.setData({
            showRefundModal: true,
            currentUser: {
                ...user,
                nickname: base.decode(user.nickname) // 解密nickname
            },
            refundAmount: '',
            refundReason: ''
        });
    },

    // 输入处理
    onBalanceInput(e) {
        this.setData({ newBalance: e.detail.value });
    },
    onExtInput(e) {
        this.setData({ extMoney: e.detail.value });
    },
    onRemarkInput(e) {
        this.setData({ remark: e.detail.value });
    },
    onRefundInput(e) {
        this.setData({ refundAmount: e.detail.value });
    },
    onRefundReasonInput(e) {
        this.setData({ refundReason: e.detail.value });
    },

    // 关闭弹窗
    closeEditModal() {
        this.setData({
            showEditModal: false,
            currentUser: {},
            newBalance: '',
            extMoney: '0',
            remark: ''
        });
    },
    closeRefundModal() {
        this.setData({
            showRefundModal: false,
            refundAmount: '',
            refundReason: ''
        });
    },

    // 确认修改
    async confirmEdit() {
        const { currentUser, newBalance, extMoney, remark } = this.data;

        if (!newBalance || isNaN(newBalance)) {
            wx.showToast({ title: '请输入有效金额', icon: 'none' });
            return;
        }

        if (parseFloat(newBalance) < 0 || parseFloat(extMoney) < 0) {
            wx.showToast({ title: '金额不能为负数', icon: 'none' });
            return;
        }

        try {
            wx.showLoading({ title: '提交中...', mask: true });

            const res = await app.post("member/editMember", {
                user_id: currentUser.id,
                address_id: this.data.currentAddress.address_id,
                balance: parseFloat(newBalance),
                ext_money: parseFloat(extMoney || 0),
                remark: remark || '管理员修改余额'
            });
            wx.hideLoading();

            if (res.code === '000') {
                wx.showToast({ title: '修改成功' });
                this.closeEditModal();
                this.refreshUserList(currentUser.id, {
                    balance: parseFloat(newBalance),
                    ext_money: parseFloat(extMoney || 0)
                });
            } else {
                wx.showToast({ title: res.msg || '修改失败', icon: 'none' });
            }
        } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '网络错误', icon: 'none' });
            console.error(err);
        }
    },

    // 确认退款
    async confirmRefund() {
        const { currentUser, refundAmount, refundReason } = this.data;

        if (!refundAmount || isNaN(refundAmount)) {
            wx.showToast({ title: '请输入有效金额', icon: 'none' });
            return;
        }

        if (parseFloat(refundAmount) <= 0) {
            wx.showToast({ title: '退款金额必须大于0', icon: 'none' });
            return;
        }

        if (parseFloat(refundAmount) > parseFloat(currentUser.balance)) {
            wx.showToast({ title: '退款金额不能大于可退余额', icon: 'none' });
            return;
        }

        try {
            wx.showLoading({ title: '提交中...', mask: true });

            const res = await app.post("member/applyRefund", {
                user_id: currentUser.id,
                amount: parseFloat(refundAmount),
                reason: refundReason || '用户申请退款',
                operator: app.globalData.userInfo.id
            });

            wx.hideLoading();

            if (res.code === '000') {
                wx.showToast({ title: '退款申请已提交' });
                this.closeRefundModal();
                this.refreshUserList(currentUser.id, {
                    balance: parseFloat(currentUser.balance) - parseFloat(refundAmount)
                });
            } else {
                wx.showToast({ title: res.msg || '退款申请失败', icon: 'none' });
            }
        } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '网络错误', icon: 'none' });
            console.error(err);
        }
    },

    // 刷新列表数据
    refreshUserList(userId, newData) {
        this.setData({
            list: this.data.list.map(item => {
                if (item.id === userId) {
                    return { ...item, ...newData };
                }
                return item;
            })
        });
    },

    // 搜索相关方法
    onSearchInput(e) {
        this.setData({ mobile: e.detail.value });
    },

    resetList() {
        this.setData({
            list: [],
            ['page.pageNo']: 1,
            ['page.total']: -1
        }, () => {
            this.getMemberList();
        });
    },

    // 获取会员列表
    // 新增方法：点击场地选择器
    onAddressTap() {
        if (this.data.currentAddress) {
            this.setData({
                showFullName: !this.data.showFullName
            });

            if (this.data.showFullName) {
                setTimeout(() => {
                    this.setData({ showFullName: false });
                }, 1500);
            }
        }
    },

    // 新增方法：选择场地
    onAddressChange(e) {
        const index = e.detail.value;
        this.setData({
            addressIndex: index,
            currentAddress: index >= 0 ? this.data.addressList[index] : null,
            showFullName: false,
            list: [],
            ['page.pageNo']: 1,
            ['page.total']: -1
        });
        this.getMemberList();
    },

    // 修改原方法：增加场地筛选
    // 修改 getMemberList，未选择场地不请求
    async getMemberList() {
        if (this.data.loading) return;
        // 新增判断：未选中场地则提示
        if (!this.data.currentAddress) {
            wx.showToast({ title: '请选择场地', icon: 'none' });
            return;
        }

        if (this.data.page.total !== -1 && this.data.list.length >= this.data.page.total) {
            return wx.showToast({ title: '已加载全部数据', icon: 'none' });
        }

        this.setData({ loading: true });

        try {
            const params = {
                page_no: this.data.page.pageNo,
                page_size: this.data.page.pageSize,
                body:{
                    mobile: this.data.mobile,
                    address_id: this.data.currentAddress.address_id
                }
            };

            const response = await app.post("member/memberList", params);
            let base = new Base64();

            const list = (response.data.datas || []).map(item => ({
                ...item,
                nickname: item.nickname ? base.decode(item.nickname) : '未设置',
                create_time: formatTime(new Date(item.create_time))
            }));

            this.setData({
                list: this.data.page.pageNo === 1 ? list : [...this.data.list, ...list],
                ['page.pageNo']: this.data.page.pageNo + 1,
                ['page.total']: response.data.total_record || 0
            });
        } catch (err) {
            wx.showToast({ title: '数据加载失败', icon: 'none' });
            console.error(err);
        } finally {
            this.setData({ loading: false });
        }
    }
});
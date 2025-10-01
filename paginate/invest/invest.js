/** @format */
const app = getApp();

Page({
	data: {
                parameter: {
                        return: '1',
                        title: '余额充值',
                        color: '#fff',
                        class: 'app_cz_title',
                        backType: '',
                        backTo: ''
                },
		money: 0,
		info: null,
		agree: false,
		list: [],
		activities: [], // 活动列表
		combo: [], // 套餐列表
		activeType: null, // 当前选中类型: activity/combo/regular
		activeIndex: null, // 当前选中索引
		selectedItem: null, // 当前选中项
		datas: {}
	},

        onLoad: function(options) {
                const shouldReturnToMain = options.returnToMain !== '0';

                this.setData({
                        datas: wx.getStorageSync('messagedata') || {},
                        money: options.money,
                        'parameter.backType': shouldReturnToMain ? 'switchTab' : '',
                        'parameter.backTo': shouldReturnToMain ? '/pages/main/main' : ''
                });
                this.getList();
        },

	onAgreeChange: function() {
		this.setData({
			agree: !this.data.agree
		});
	},

	// 获取充值列表
	async getList() {
		try {
			const res = await app.post('recharge/listRecharge', {
				address_id: this.data.datas.address_id || 4
			});

			const list = Array.from(res.data);
			// 修改过滤条件
			const routine = list.filter(it => it.type === 'routine'.toUpperCase());
			const activities = list.filter(it => it.type === 'newcomer'.toUpperCase() || it.type === 'holiday'.toUpperCase());
			const combo = list.filter(it => it.type === 'month_combo'.toUpperCase() || it.type === 'deal_combo'.toUpperCase());

			this.setData({
				list: routine,
				activities: activities,
				combo: combo
			});

		} catch (error) {
			app.showToast('获取充值列表失败，请联系管理员');
			this.setData({ list: [], activities: [], combo: [] });
		}
	},

	// 选择活动充值
	selectActivity: function(e) {
		const index = e.currentTarget.dataset.index;
		const item = this.data.activities[index];

		this.setData({
			activeType: 'activity',
			activeIndex: index,
			selectedItem: item
		});
	},

	// 选择套餐优惠
	selectCombo: function(e) {
		const index = e.currentTarget.dataset.index;
		const item = this.data.combo[index];

		this.setData({
			activeType: 'combo',
			activeIndex: index,
			selectedItem: item
		});
	},

	// 选择常规充值
	selectRegular: function(e) {
		const index = e.currentTarget.dataset.index;
		const item = this.data.list[index];

		this.setData({
			activeType: 'regular',
			activeIndex: index,
			selectedItem: item
		});
	},

	// 提交充值
	async submitSub(e) {
		if (!this.data.agree) {
			const res = await new Promise((resolve) => {
				wx.showModal({
					title: '充值提示',
					content: '请先仔细阅读并同意相关协议后再进行付款操作。',
					confirmText: '同意',
					complete: resolve
				});
			});

			if (!res.confirm) return;
			this.setData({ agree: true });
		}

		if (!this.data.selectedItem) {
			wx.showToast({ title: '请选择充值金额', icon: 'none' });
			return;
		}

		try {
			const data = this.data.selectedItem;
			const res = await app.post(`recharge/getRechargeCode?rechargeId=${data.id}`);
			console.info(res)
			const res2 = await app.post('payment/getCodeForRechargePay', {
				order_id: res.data
			});

			if (res2.data) {
				app.sqbPay(res2.data.wap_pay_request, e => {
					if (e == '支付成功') {
						app.showToast('支付成功');
						setTimeout(() => {
							wx.navigateBack({ delta: 1 });
						}, 1500);
					}
				});
			}
		} catch (error) {
			app.showToast(error.message || '支付失败');
		}
	}
});
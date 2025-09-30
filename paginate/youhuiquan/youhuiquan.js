/** @format */
const app = getApp();

Page({
	data: {
		parameter: {
			return: "1",
			title: "我的卡券",
			color: "#fff",
			class: "app_bg_title"
		},
		active: ["active-item", ""],
		activeIndex: "0",
		list: [],
		pre: "0",
		switchIndex: "-1",
		dataIndex: "0"
	},

	async onLoad() {
		// 获取卡券类型映射和卡券列表
		let res = await app.post('manageRecharge/genericRechargeMapping');
		const res1 = await app.post("userVoucher/voucherList");

		const list = res1.data.map(item => ({
			voucher_id: item.id,
			type: item.type, // 优惠券 / 月卡 / 次卡
			type_name: res.data[item.type] || item.type, // 优惠券 / 月卡 / 次卡
			type_class : item.type === 'MONTH_COMBO' ? 'month-card': item.type === 'DEAL_COMBO' ?'time-card' : 'coupon-card',
			total_money: item.total_money,
			amount: item.amount, // 天数 / 次数
			status: item.status_description, // 状态文本
			status_class: item.status === 'active' ? 'active' : item.status === '已用完' ? 'used' : 'expired',
			expire_date: item.expire_date,
			address_name: item.address_name,
			// 新增字段
			create_time: item.create_time, // 创建时间
			finish_time: item.finish_time, // 用完时间
			use_time: item.use_time // 下次使用日期
		}));

		this.setData({ list });
	},

	// 将状态代码转换为可读文本
	getStatusText(statusCode) {
		const statusMap = {
			'active': '有效期中',
			'used': '已用完',
			'expired': '已过期'
		};
		return statusMap[statusCode] || statusCode;
	},

	switchCard(e) {
		if (this.data.pre === "0") return;
		const index = e.detail.value ?? e.currentTarget.dataset.index;
		this.setData({ switchIndex: index });
		app.globalData.voucher_id = this.data.list[index].voucher_id;
	},

	switchTab({ currentTarget: { dataset: { index } } }) {
		if (this.data.pre === "0") {
			const newActive = ["", ""];
			newActive[index] = "active-item";
			this.setData({
				active: newActive,
				activeIndex: index,
				dataIndex: index
			});
		}
	}
});
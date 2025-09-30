/** @format */

const app = getApp();

Component({
	properties: {
		payMode: {
			type: Array
		},
		pay_close: {
			type: Boolean,
			value: false
		},
		order_id: {
			type: String,
			value: ""
		},
		totalPrice: {
			type: String,
			value: "0"
		},
		pay_code: {
			type: String,
			value: ""
		}
	},
	data: {},
	attached: function () {
		console.log(this.data.payMode);
	},
	methods: {
		close: function () {
			this.triggerEvent("onChangeFun", { action: "pay_close" });
		},
		goPay: function (e) {
			let that = this;
			console.log(this.data);
			let paytype = e.currentTarget.dataset.value;
			let number = e.currentTarget.dataset.number;
			if (!that.data.order_id)
				return wx.showToast({ title: "请选择要支付的订单", icon: "noen" });
			// if (paytype == 'yue' && parseFloat(number) < parseFloat(that.data.totalPrice)) return wx.showToast({title: '余额不足',})
			wx.showLoading({ title: "支付中" });
			switch (paytype) {
				case "yue":
					app.post("pay/restmoney", {
						pay_code: that.data.pay_code,
						order_id: that.data.order_id,
						pay_money: that.data.totalPrice
					})
						.then(res => {
							wx.hideLoading();
							wx.showToast({
								title: res.data,
								icon: "none",
								success: a => {
									that.triggerEvent("onChangeFun", { action: "pay_complete" });
								}
							});
							return;
						})
						.catch(err => {
							wx.hideLoading();
							wx.showToast({
								title: err,
								icon: "none",
								success: a => {
									that.triggerEvent("onChangeFun", { action: "pay_complete" });
								}
							});
							return;
						});
					break;
				case "jifen":
					wx.hideLoading();
					let params = {
						pay_money: this.data.totalPrice,
						order_id: that.data.order_id
					};
					app.post("pay/restintegral", params)
						.then(res3 => {
							wx.showToast({
								title: "支付成功",
								duration: 2000,
								success: a => {
									that.triggerEvent("onChangeFun", { action: "pay_complete" });
								}
							});
						})
						.catch(err => {
							wx.showToast({
								title: err,
								icon: "none",
								success: a => {
									that.triggerEvent("onChangeFun", { action: "pay_complete" });
								}
							});
						});
					break;
			}
		}
	}
});

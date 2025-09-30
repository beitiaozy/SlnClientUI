/** @format */

// paginate/add_shebi/add_shebei.js
import util from "../../utils/util2";

const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: "1",
			title: "录入设备",
			color: "#fff",
			class: "app_bg_title"
		},
		params: {
			dev_id: "",
			base_time_x: "",
			price_y: "",
			price_z: "",
			address_id: "",
			address: "",
			door_num: "0"
		},
		isSelect: false,
		isTrue: false,
		typeArray: ["1"],
		type: ["请选择类型", "自助", "自动"],
		typeIndex: "0"
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (options.hasOwnProperty("addr_id")) {
			app.post("manageAddress/addressList").then(res => {
				res.data.map(item => {
					if (item.id == options.addr_id) {
						this.setData({
							"isTrue": true,
							"params.address": item.addr_name,
							"params.address_id": item.id
						});
					}
				});
			});
			this.setData({
				addr_id: options.addr_id
			});
		}
		this.setData({
			top: app.globalData.navHeight
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	scan() {
		wx.scanCode({
			success: res => {
				console.log(res);
				const data = util.getUrlParams(res.result.split("?")[1]);
				console.log(data);
				this.setData({ "params.dev_id": data.dev_id });
				this.getList();
			}
		});
	},
	async getList() {
		const res = await app.post("manageNetSite/getVMDevice", {
			dev_id: this.data.params.dev_id
		});
	},
	select_changsuo() {
		if (this.data.isTrue) {
			return;
		}
		app.post("manageAddress/addressList").then(res => {
			this.setData({
				list: res.data,
				isSelect: true
			});
		});
	},
	changeRadio(e) {
		let data = e.currentTarget.dataset.item;
		this.setData({
			"isSelect": false,
			"params.address": data.addr_name,
			"params.address_id": data.id
		});
	},

	changeInput(e) {
		let type = e.currentTarget.dataset.type;
		this.data.params[type] = e.detail.value;
		this.setData({
			params: this.data.params
		});
	},
	async sure(e) {
		try {
			if (this.data.typeIndex === "0") {
				app.showToast("请选择类型!");
				return;
			}

			let params = { ...e.detail.value, ...this.data.params };
			if (!params.dev_id) return app.showToast("请输入设备号");
			if (!params.name) return app.showToast("请输入设备名称");
			if (!params.address_id) return app.showToast("请选择场所");
			if (this.data.typeIndex === "1") {
				if (!params.base_time_x) return app.showToast("请输入基础时间");
				if (!params.price_y) return app.showToast("请输入基础价格");
				if (!params.price_z) return app.showToast("请输入超时价格");
				if (!params.prize_pm) return app.showToast("请输入泡沫每秒价格");
				if (!params.prize_sl) return app.showToast("请输入水流每秒价格");
			} else {
				if (!params.money) {
					return app.showToast("请输入自动洗车单价");
				}
				if (Number.parseFloat(params.money) < 15) {
					return app.showToast("自动洗车单价过低(请大于等于15)");
				}
			}
			params.type = this.data.type[this.data.typeIndex];
			params.door_num = this.data.typeArray[params.door_num];
			const { data } = await app.post("manageNetSite/addVMDevice", params);
			app.showToast(data);
			if (e.detail.target.dataset.type == "继续") {
				this.setData({
					params: {}
				});
				return;
			}
			wx.navigateBack({
				delta: 1
			});
		} catch (error) {
			app.showToast(error);
		}
	},
	select_close() {
		this.setData({ isSelect: false });
	},

	bindPickerChange(e) {
		console.log(e);
		this.setData({
			"params.door_num": e.detail.value
		});
	},

	switchType(e) {
		this.setData({
			typeIndex: e.detail.value
		});
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
});

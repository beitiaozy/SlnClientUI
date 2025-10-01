/** @format */

// app.js
import request from "./utils/request";
import { baseUrl } from "./config";
function login(app) {
	const _this = this;
	wx.login({
		success: (res1) => {
			wx.getUserInfo({
				// desc: '获取用户信息',
				success: async (res) => {
					let userInfo = res.userInfo;

					if (res1.code) {
						let code = res1.code;
						let params = {
							code: code
						};
						try {
							let res2 = await app.post(
								"wXMiNiProgram/authorize",
								params
							);
							// 如果没有token
							if (!res2.data.token) {
								//没有注册
							} else {
								//
								app.globalData.token = res2.data.token;
								app.globalData.isLogin = true;
								app.globalData.userInfo = res2.data;
								wx.setStorageSync("isLogin", true);
								//取消登录提示
								wx.hideLoading();
                                                                wx.setStorageSync("userInfo", userInfo);
                                                                wx.setStorageSync("open_id", res2.data);
                                                                wx.setStorageSync("lt-id", res2.data.user_id);
                                                                wx.setStorageSync("lt-token", res2.data.token);
                                                                wx.setStorageSync("address_id", app.globalData.dev_id);
                                                                wx.removeStorageSync('toLogin');
							}
						} catch (err) {}
					} else {
					}
				},
				fail: console.log
			});
		},
		fail: console.log
	});
}
App({
	onLaunch() {
		// 获取导航高度；
		wx.getSystemInfo({
			success: (res) => {
				//导航高度
				this.globalData.windowWidth = res.windowWidth;
				this.globalData.windowHeight = res.windowHeight;
				this.globalData.navHeight =
					res.statusBarHeight * (750 / res.windowWidth) + 97;
			},
			fail(err) {}
		});
	},
	globalData: {
		windowWidth: null,
		windowHeight: null,
		navHeight: null,
		baseUrl: baseUrl + "aliYunOss/upload",
		dev_id: null,
		num: null,
		address_id: null,
		selected: 0
	},
	onShow() {
		if (!wx.getStorageSync("lt-id") || !wx.getStorageSync("lt-token"))
			login(this);
	},

	post(url, params) {
		return request.post(url, params);
	},
	showToast(text, type, duration) {
		wx.showToast({
			title: text,
			icon: type || "none",
			duration: duration || 1500
		});
	},
	pay(params, callback) {
		console.log(params);
		wx.requestPayment({
			timeStamp: params.timestamp,
			nonceStr: params.noncestr,
			package: "prepay_id=" + params.prepayid,
			signType: "MD5",
			paySign: params.sign,
			// appId: res.data.data.appid,
			success: (result) => {
				console.log(result);
				callback("支付成功");
			},
			fail: (err) => {
				console.log("支付失败", err);
			}
		});
	},
	sqbPay(params, callback) {
		wx.requestPayment({
			timeStamp: params.timeStamp,
			nonceStr: params.nonceStr,
			package: params.package,
			signType: "MD5",
			paySign: params.paySign,
			// appId: res.data.data.appid,
			success: (result) => {
				console.log(result);
				callback("支付成功");
			},
			fail: (err) => {
				console.log("支付失败", err);
			}
		});
	},
	// 计算图片宽高
	bindload(e, that) {
		console.log(e);
		// 宽高比
		let ratio = e.detail.width / e.detail.height;
		// 计算的高度值
		let imgHeight = this.globalData.windowWidth / ratio;
		that.setData({
			imgHeight
		});
		return imgHeight;
	},
	/**
	 * 跳转到指定页面
	 * 支持tabBar页面
	 */
	navigateTo(url) {
		let app = this;
		if (app.isNull(url)) {
			app.showError("url错误");
			return false;
		}
		let tabBarLinks = [
			"/pages/user/user"
		];
		url = url.substr(0, 1) == "/" ? url : "/" + url;
		// tabBar页面
		if (tabBarLinks.indexOf(url.slice(1)) != -1) {
			wx.switchTab({
				url
			});
		} else {
			// 普通页面
			wx.navigateTo({
				url
			});
		}
	}
});

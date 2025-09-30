import Util from '../../utils/util.js';

const app = getApp();
function compareVersion(v1, v2) {
	v1 = v1.split('.');
	v2 = v2.split('.');
	const len = Math.max(v1.length, v2.length);

	while (v1.length < len) {
		v1.push('0');
	}
	while (v2.length < len) {
		v2.push('0');
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i]);
		const num2 = parseInt(v2[i]);

		if (num1 > num2) {
			return 1;
		} else if (num1 < num2) {
			return -1;
		}
	}

	return 0;
}
function login() {
	const _this = this;
	wx.login({
		success: res1 => {
			wx.getUserInfo({
				// desc: '获取用户信息',
				success: async res => {
					let userInfo = res.userInfo;

					if (res1.code) {
						let code = res1.code;
						let params = {
							code: code
						};
						try {
							let res2 = await app.post('wXMiNiProgram/authorize', params);
							// 如果没有token
							if (!res2.data.token) {
								//没有注册
							} else {
								_this.setData({ iShidden: true });
								//
								app.globalData.token = res2.data.token;
								app.globalData.isLogin = true;
								app.globalData.userInfo = res2.data;
								wx.setStorageSync('isLogin', true);
								//取消登录提示
								wx.hideLoading();
								wx.setStorageSync('userInfo', userInfo);
								wx.setStorageSync('open_id', res2.data);
								wx.setStorageSync('lt-id', res2.data.user_id);
								wx.setStorageSync('lt-token', res2.data.token);
								_this.triggerEvent('onLoadFun', {});
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

Component({
	properties: {
		iShidden: {
			type: Boolean,
			value: true
		},
		//是否自动登录
		isAuto: {
			type: Boolean,
			value: true
		},
		isGoIndex: {
			type: Boolean,
			value: true
		}
	},
	data: {
		cloneIner: null,
		loading: false,
		errorSum: 0,
		errorNum: 3
	},
	observers: {
		iShidden: function (iShidden) {
			console.info("authorize=== iShidden")
			if (iShidden) return;
			if (!wx.getStorageSync('lt-id') || !wx.getStorageSync('lt-token')) login.call(this);
			const info = wx.getSystemInfoSync();

			if (-1 === compareVersion(info.SDKVersion, '2.21.2')) {
				//尝试兼容处理
				wx.login({
					success: async res => {
						await app.post('wXMiNiProgram/authorize', { code });
					},
					fail: console.log
				});
			}
		}
	},
	lifetimes: {
		attached() {
			if (wx.getStorageSync('open_id') && wx.getStorageSync('isLogin')) {
				return;
			}
			const info = wx.getSystemInfoSync();
			//尝试登陆

			//基本库低于这个无法被监听，所以打开就要调用
			if (-1 === compareVersion(info.SDKVersion, '2.6.1')) {
				login.call(this);
				//尝试兼容处理
				wx.login({
					success: async res => {
						await app.post('wXMiNiProgram/authorize', { code });
					},
					fail: console.log
				});
			}
		}
	},

	methods: {
		close() {
			let pages = getCurrentPages();
			let currPage = pages[pages.length - 1];
			if (this.data.isGoIndex) {
				// wx.navigateTo({url:'/pages/index/index'});
				this.setData({
					iShidden: true
				});
			} else {
				this.setData({
					iShidden: true
				});
				if (currPage && currPage.data.iShidden != undefined) {
					currPage.setData({ iShidden: true });
				}
			}
		},

		//检测登录状态并执行自动登录
		setAuthStatus() {
			var that = this;
			Util.chekWxLogin()
				.then(res => {
					let pages = getCurrentPages();
					let currPage = pages[pages.length - 1];
					if (currPage && currPage.data.iShidden != undefined) {
						currPage.setData({ iShidden: true });
					}
					if (res.isLogin) {
						if (!Util.checkLogin())
							return Promise.reject({
								authSetting: true,
								msg: '用户token失效',
								userInfo: res.userInfo
							});
						that.triggerEvent('onLoadFun', app.globalData.userInfo);
					} else {
						wx.showLoading({ title: '正在登录中' });
						that.setUserInfo(res.userInfo, true);
					}
				})
				.catch(res => {
					if (res.authSetting === false) {
						//没有授权不会自动弹出登录框
						if (that.data.isAuto === false) return;
						//自动弹出授权
						that.setData({ iShidden: false });
					} else if (res.authSetting) {
						//授权后登录token失效了
						that.setUserInfo(res.userInfo);
					}
				});
		},
		// 获取手机号code
		getPhoneNumber(e) {
			if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
				// 用户拒绝授权
				wx.showModal({
					title: '提示',
					content: '用户拒绝授权',
					showCancel: false
				});
			} else if ('code' in e.detail && e.detail.hasOwnProperty('encryptedData')) {
				app.globalData.mobileCode = e.detail.code;
				this.setUserInfo();
			} else {
				wx.showModal({
					title: '提示',
					content: '获取手机号码失败'
				});
			}
		},
		setUserInfo(e) {
			//
			// 弹出授权登录窗口
			wx.login({
				success: res1 => {
					wx.getUserInfo({
						// desc: '获取用户信息',
						success: res => {
							let userInfo = res.userInfo;
							// 获取code

							if (res1.code) {
								wx.showLoading({
									title: '正在登录'
								});
								let code = res1.code;
								let params = {
									code: code
								};
								// 向后端传code
								app.post('wXMiNiProgram/authorize', params)
									.then(res2 => {
										// 如果没有token
										if (!res2.data.token) {
											wx.setStorageSync('open_id', res2.data);
											wx.setStorageSync('nickName', userInfo.nickName);
											wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
											// 注册
											this.signUpByWeiXin();
										} else {
											this.setData({ iShidden: true });
											//
											app.globalData.token = res2.data.token;
											app.globalData.isLogin = true;
											app.globalData.userInfo = res2.data;
											wx.setStorageSync('isLogin', true);
											//取消登录提示
											wx.hideLoading();
											wx.setStorageSync('userInfo', userInfo);
											wx.setStorageSync('open_id', res2.data);
											wx.setStorageSync('lt-id', res2.data.user_id);
											wx.setStorageSync('lt-token', res2.data.token);
											this.triggerEvent('onLoadFun', {});
										}
									})
									.catch(err => {
										wx.hideLoading();
										wx.showToast({
											title: '登录失败' + err,
											icon: 'none'
										});
									});
							} else {
							}
						}
					});
				}
			});
		},
		// 注册登录
		signUpByWeiXin: function () {
			// if (app.globalData.dev_id === null || app.globalData.dev_id === void 0) {
			// 	return wx.showModal({
			// 		title: '登录提示',
			// 		content: '请在门店列表点击进行注册，或扫码打开小程序后登录注册',
			// 		showCancel: false
			// 	});
			// }
			let params = {
				open_id: wx.getStorageSync('open_id'),
				headimgurl: wx.getStorageSync('avatarUrl'),
				nickname: wx.getStorageSync('nickName'),
				mobile_code: app.globalData.mobileCode,
				dev_id: app.globalData.dev_id
				// id: app.APP_ID
			};
			if (wx.getStorageSync('invite_mobile')) {
				params.invite_mobile = wx.getStorageSync('invite_mobile');
				if (params.invite_mobile == this.data.phone) {
					params.invite_mobile = '';
				}
			}
			let that = this;
			app.post('wXMiNiProgram/signUpByWeiXin', params)
				.then(res => {
					console.info("註冊登錄後側結果")
					console.info(res)
					wx.setStorageSync('lt-token', res.data.token);
					wx.setStorageSync('lt-id', res.data.user_id);
					var userInfo = {
						nickName: wx.getStorageSync('nickName'),
						avatarUrl: wx.getStorageSync('avatarUrl'),
						open_id: res.data.open_id,
						mobile: wx.getStorageSync('nickName'),
						user_id: res.data.user_id
					};
					wx.setStorageSync('userInfo', userInfo);
					app.globalData.token = res.data.token;
					app.globalData.isLogin = true;
					app.globalData.userInfo = res.data;
					wx.setStorageSync('isLogin', true);
					//取消登录提示
					wx.hideLoading();
					this.setData({ iShidden: true });
					//执行登录完成回调
					that.triggerEvent('onLoadFun', app.globalData.userInfo);
					wx.showModal({
						title: '领取优惠券',
						content: '“新用户登录成功，新用户限时专享优惠可点击“充值”了解详情”',
						showCancel: false
					});
				})
				.catch(err => {
					//取消登录提示
					wx.hideLoading();
					return app.showToast(err);
				});
		}
	}
});

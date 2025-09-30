/** @format */

// paginate/submitInfo/submitInfo.js
let app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		parameter: {
			return: '1',
			title: '添加场所',
			color: '#fff',
			class: 'app_bg_title'
		},
		position: '',
		params: {
			addr_area: '',
			addr_location: '',
			img: '',
			addr_price: ''
		},
		disabled: false
	},
	xiangqingqye() {
		const that = this;
		wx.chooseMedia({
			count: 5,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			camera: 'back',
			success(res) {
				wx.uploadFile({
					url: app.globalData.baseUrl, //仅为示例，非真实的接口地址
					filePath: res.tempFiles[0].tempFilePath,
					name: 'file',
					formData: {
						'lt-id': wx.getStorageSync('lt-id'),
						'lt-token': wx.getStorageSync('lt-token')
					},
					success(res) {
						const img = JSON.parse(res.data).data;
						if (that.data.params.imges === undefined) {
							that.data.params.imges = [img];
						} else {
							that.data.params.imges.push(img);
						}
						that.setData(that.data);
					}
				});
			}
		});
	},
	delImage: function (e) {
		const index = e.currentTarget.dataset.index;
		this.data.params.imges.splice(index, 1);
		this.setData(this.data);
	},
	inputNumber(e) {
		const {
			detail: { value }
		} = e;
		this.setData({
			'params.addr_price': /^\d*$/g.test(value) ? value : this.data.params.addr_price
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {},
	getPostion() {
		wx.chooseLocation({
			success: res => {
				console.log(res);
				let a;
				let address;
				if (res.address.indexOf('区') != '-1') {
					a = res.address.split('区');
					address = {
						addr_area: a[0] + '区',
						addr_location: res.name,
						addr_lng: res.longitude,
						addr_lat: res.latitude
					};
				} else {
					a = res.address.split('市');
					console.log(a);
					address = {
						addr_area: a[0] + '市' + a[1] + '市',
						addr_location: res.name,
						addr_lng: res.longitude,
						addr_lat: res.latitude
					};
				}
				this.setData({ position: res.address, params: address });
			}
		});
	},
	submitForm(e) {
		console.log(e);
		let data = { ...this.data.params, ...e.detail.value };
		console.log({ ...this.data.params, ...e.detail.value });
		if (!data.addr_name) return wx.showToast({ title: '请输入场所名称', icon: 'none' });
		if (!data.addr_area) return wx.showToast({ title: '请选择场所', icon: 'none' });
		if (!data.addr_location) return wx.showToast({ title: '请选择场所', icon: 'none' });
		if (!data.addr_price) return wx.showToast({ title: '请输入场所价格', icon: 'none' });
		if (!data.addr_person_name)
			return wx.showToast({ title: '请输入场所管理员姓名', icon: 'none' });
		if (!data.addr_person_mobile)
			return wx.showToast({ title: '请输入场所管理员手机号', icon: 'none' });
		if (!data.img) return wx.showToast({ title: '请上传场所图片', icon: 'none' });
		// data.img = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp09%2F210F2130512J47-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1663812568&t=33ea13b3ae73e771cb4035aeb34cdc48"
		if (!this.data.disabled) {
			this.setData({ disabled: true });
			setTimeout(() => {
				this.setData({ disabled: fasle });
			}, 1500);
			app.post('manageAddress/addAddress', data)
				.then(res => {
					wx.showToast({
						title: res.data,
						icon: 'none'
					});
					setTimeout(() => {
						wx.navigateBack({
							delta: 1
						});
					}, 1500);
				})
				.catch(err => {
					wx.showToast({
						title: err,
						icon: 'none'
					});
				});
		}
	},
	chooseMedia() {
		let that = this;
		wx.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			camera: 'back',
			success(res) {
				console.log(res);
				console.log(res.tempFiles[0]);
				wx.uploadFile({
					url: app.globalData.baseUrl, //仅为示例，非真实的接口地址
					filePath: res.tempFiles[0].tempFilePath,
					name: 'file',
					formData: {
						'lt-id': wx.getStorageSync('lt-id'),
						'lt-token': wx.getStorageSync('lt-token')
					},
					success(res) {
						console.log(res);
						const img = JSON.parse(res.data).data;
						that.setData({ 'params.img': img });
					}
				});
			}
		});
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {}
});

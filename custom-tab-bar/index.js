/** @format */

const app = getApp();
Component({
	data: {
		selected: 0,
		color: '#7A7E83',
		selectedColor: '#0D34A5',
		list: [
			{
				pagePath: '/pages/main/main',
				text: '首页',
				iconPath: '/images/icon-shouye@2x.png',
				selectedIconPath: '/images/icon-shouye-blue@2x.png'
			},
			{
				pagePath: '/pages/user/user',
				text: '我的',
				iconPath: '/images/icon_geren@2x.png',
				selectedIconPath: '/images/icon_geren-blue@2x.png'
			}
		]
	},
	attached() {},
	lifetimes: {},
	methods: {
		switchTab(e) {
			const { index, path } = e.currentTarget.dataset;
			wx.switchTab({ url: path });
			app.globalData.selected = index;
			this.setData({
				selected: index
			});
		}
	}
});

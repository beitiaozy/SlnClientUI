import { formatTime } from "../../utils/util";

const app = getApp();

Page({
	data: {
		parameter: {
			return: "1",
			title: "充值记录",
			color: "#fff",
			class: "app_bg_title"
		},
		list: [],
		page: {
			pageNo: 1,
			size: 10,
			total: -1
		},
		hasMore: true,
		loading: false
	},

	onLoad(options) {
		wx.showLoading({
			title: "加载中...",
			mask: true
		});
		this.getList().finally(() => {
			wx.hideLoading();
		});
	},

	async getList() {
		if (this.data.loading) return;

		if (this.data.page.total !== -1 && this.data.list.length >= this.data.page.total) {
			this.setData({ hasMore: false });
			return;
		}

		this.setData({ loading: true });

		try {
			const page = this.data.page;
			const response = await app.post("recharge/rechargeRecord", {
				page_no: page.pageNo,
				page_size: page.size
			});

			if (response.code !== '000') {
				throw new Error(response.msg || '获取数据失败');
			}

			const list = response.data.datas || [];
			const total = response.data.total_record || 0;

			const formattedList = list.map(item => {
				return {
					...item,
					create_time: formatTime(new Date(item.create_time)),
					order_no: item.order_no || item.id || '暂无'
				};
			});

			this.setData({
				list: [...this.data.list, ...formattedList],
				'page.pageNo': page.pageNo + 1,
				'page.total': total,
				hasMore: this.data.list.length + formattedList.length < total,
				loading: false
			});

		} catch (error) {
			console.error('获取充值记录失败:', error);
			wx.showToast({
				title: error.message || '加载失败',
				icon: 'none'
			});
			this.setData({ loading: false });
		}
	},

	goToRecharge() {
		wx.switchTab({
			url: '/pages/index/index' // 请根据实际情况修改路径
		});
	},

	onReachBottom() {
		this.getList();
	},

	onPullDownRefresh() {
		this.setData({
			list: [],
			page: {
				pageNo: 1,
				size: 10,
				total: -1
			},
			hasMore: true
		});

		this.getList().finally(() => {
			wx.stopPullDownRefresh();
		});
	}
});
// paginate/huodong/index.js
const app = getApp()

Page({
  data: {
    parameter: {
      'return': '1',
      'title': '活动设置',
      'color': '#fff',
      'class': 'app_bg_title'
    },
    list: [],
    groupedArray: [], // 分组后的数组
    showModal: false,
    isEdit: false,
    formData: {
      id: '',
      title: '',
      money: '',
      awards: '',
      address_id: 0,
      expiration_date: '',
      user_level: 'ALL',
      type: '',
      enable: 0
    },
    activityTypes: [],
    activityTypesLoaded: false, // 新增标志位，表示活动类型是否已加载
    activityTypeIndex: 0,
    typeLabel: '选择活动类型',
    userLevels: [
      { key: "ALL", value: "全员" }
    ],
    userLevelIndex: 0,
    levelLabel: '选择用户等级',
    statusOptions: [
      { key: 0, value: "启用" },
      { key: 1, value: "禁用" }
    ],
    statusIndex: 0,
    enableLabel: '选择状态'
  },

  onLoad(options) {
    if (options.hasOwnProperty('address_id')) {
      this.setData({
        address_id: options.address_id
      })
    }
    this.getActivityTypes()
  },

  onShow() {
    // 从onShow移到getActivityTypes的成功回调中
  },

  // 获取活动类型
  getActivityTypes() {
    app.post('manageRecharge/genericRechargeMapping').then(res => {

      let activityTypes = Object.keys(res.data).map(key => ({
        key,
        value: res.data[key]
      }));

      this.setData({
        activityTypes: activityTypes,
        activityTypesLoaded: true,
        'formData.type': activityTypes.length > 0 ? activityTypes[0].key : '',
        typeLabel: activityTypes.length > 0 ? activityTypes[0].value : '选择活动类型'
      });

      // 获取活动列表
      this.getList();
    }).catch(err => {
      console.error('获取活动类型失败:', err);
      wx.showToast({
        title: err.message || '活动类型加载失败',
        icon: 'none'
      });
      this.setData({
        activityTypesLoaded: true
      });
    });
  },

  // 获取活动列表
  getList() {
    let data = {}
    if (this.data.address_id) {
      data.address_id = this.data.address_id
    }

    app.post('manageRecharge/myRechargeList', data).then(res => {
      const list = res.data || []
      // 按类型分组
      const grouped = {}
      list.forEach(item => {
        if (!grouped[item.type]) {
          grouped[item.type] = []
        }
        grouped[item.type].push(item)
      })

      // 转换为数组格式并添加类型标签
      const groupedArray = []
      for (const type in grouped) {
        const typeObj = this.data.activityTypes.find(t => t.key === type) || { value: type }
        groupedArray.push({
          type: type,
          typeLabel: typeObj.value,
          items: grouped[type],
          collapsed: true // 默认不折叠
        })
      }

      this.setData({
        list: list,
        groupedArray: groupedArray
      })
    }).catch(err => {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    })
  },

  // 切换分组折叠状态
  toggleGroup(e) {
    const type = e.currentTarget.dataset.type;
    const groupedArray = this.data.groupedArray.map(group => {
      if (group.type === type) {
        return {
          ...group,
          collapsed: !group.collapsed
        }
      }
      return group;
    });

    this.setData({
      groupedArray: groupedArray
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const { item } = e.currentTarget.dataset
    const isEdit = !!item
    let formData = {}

    if (isEdit && item) {
      formData = {
        id: item.id,
        title: item.title,
        money: item.money,
        awards: item.awards,
        address_id: item.address_id,
        expiration_date: item.expiration_date,
        user_level: item.user_level,
        type: item.type,
        enable: Number(item.enable)
      }
    } else {
      // 使用第一个活动类型作为默认值
      const defaultType = this.data.activityTypes.length > 0 ? this.data.activityTypes[0].key : ''
      formData = {
        id: '',
        title: '',
        money: '',
        awards: '',
        address_id: this.data.address_id,
        expiration_date: '',
        user_level: 'ALL',
        type: defaultType,
        enable: 0
      }
    }

    // 设置选择器索引
    const activityTypeIndex = this.data.activityTypes.findIndex(t => t.key === formData.type)
    const userLevelIndex = this.data.userLevels.findIndex(l => l.key === formData.user_level)
    const statusIndex = this.data.statusOptions.findIndex(s => s.key === formData.enable)

    this.setData({
      formData,
      activityTypeIndex: Math.max(activityTypeIndex, 0),
      userLevelIndex: Math.max(userLevelIndex, 0),
      statusIndex: Math.max(statusIndex, 0),
      typeLabel: (this.data.activityTypes.find(t => t.key === formData.type) || {}).value || '选择活动类型',
      levelLabel: (this.data.userLevels.find(l => l.key === formData.user_level) || {}).value || '选择用户等级',
      enableLabel: (this.data.statusOptions.find(s => s.key === formData.enable) || {}).value || '选择状态',
      isEdit,
      showModal: true
    })
  },

  // 显示新增弹窗
  showAddModal() {
    this.showEditModal({ currentTarget: { dataset: {} } })
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showModal: false
    })
  },

  // 日期选择变化
  dateChange(e) {
    this.setData({
      'formData.expiration_date': e.detail.value
    })
  },

  // 活动类型选择
  typeChange(e) {
    const index = e.detail.value
    const typeObj = this.data.activityTypes[index]
    this.setData({
      'formData.type': typeObj.key,
      typeLabel: typeObj.value,
      activityTypeIndex: index
    })
  },

  // 用户等级选择
  levelChange(e) {
    const index = e.detail.value
    const levelObj = this.data.userLevels[index]
    this.setData({
      'formData.user_level': levelObj.key,
      levelLabel: levelObj.value,
      userLevelIndex: index
    })
  },

  // 状态选择
  statusChange(e) {
    const index = e.detail.value
    const statusObj = this.data.statusOptions[index]
    this.setData({
      'formData.enable': statusObj.key,
      enableLabel: statusObj.value,
      statusIndex: index
    })
  },

  // 提交表单
  submitForm(e) {
    let finalData = {
      ...this.data.formData,
      ...e.detail.value
    }

    // 对于套餐类型，设置默认过期日期
    if ((finalData.type === 'DEAL_COMBO' || finalData.type === 'MONTH_COMBO') && !finalData.expiration_date) {
      finalData.expiration_date = '2099-12-31'
    }

    // 表单验证
    if (!finalData.title) {
      return wx.showToast({ title: '请输入活动标题', icon: 'none' })
    }
    if (!finalData.money || finalData.money <= 0) {
      return wx.showToast({ title: '请输入有效的金额', icon: 'none' })
    }
    if (!finalData.awards || finalData.awards < 0) {
      const label = finalData.type === 'DEAL_COMBO' || finalData.type === 'MONTH_COMBO' ? '次数' : '奖励金额'
      return wx.showToast({ title: `请输入有效的${label}`, icon: 'none' })
    }
    if (!finalData.expiration_date && finalData.type !== 'DEAL_COMBO' && finalData.type !== 'MONTH_COMBO') {
      return wx.showToast({ title: '请选择过期日期', icon: 'none' })
    }

    if(finalData.type === 'DEAL_COMBO'){
      finalData.remaining_days = 60
    }

    if(finalData.type === 'MONTH_COMBO'){
      finalData.remaining_days = 30
    }

    const api = this.data.isEdit ? 'manageRecharge/editRecharge' : 'manageRecharge/addRecharge'

    app.post(api, finalData).then(res => {
      wx.showToast({
        title: this.data.isEdit ? '修改成功' : '创建成功',
        icon: 'success'
      })
      this.closeModal()
      this.getList()
    }).catch(err => {
      wx.showToast({
        title: err.message || '操作失败',
        icon: 'none'
      })
    })
  },

  // 切换启用状态
  toggleEnable(e) {
    const item = e.currentTarget.dataset.item
    const newStatus = item.enable === 0 ? 1 : 0

    wx.showModal({
      title: '提示',
      content: `确定要${newStatus === 0 ? '启用' : '禁用'}该活动吗？`,
      success: (res) => {
        if (res.confirm) {
          app.post('manageRecharge/updateRechargeStatus', {
            id: item.id,
            enable: newStatus
          }).then(() => {
            wx.showToast({
              title: `${newStatus === 0 ? '启用' : '禁用'}成功`,
              icon: 'success'
            })
            this.getList()
          }).catch(err => {
            wx.showToast({
              title: err.message || '操作失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  // 删除活动
  del(e) {
    const item = e.currentTarget.dataset.item

    wx.showModal({
      title: '提示',
      content: '确定要删除该活动吗？',
      success: (res) => {
        if (res.confirm) {
          app.post('manageRecharge/delRecharge', {
            recharge_id: item.id
          }).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.getList()
          }).catch(err => {
            wx.showToast({
              title: err.message || '删除失败',
              icon: 'none'
            })
          })
        }
      }
    })
  }
})
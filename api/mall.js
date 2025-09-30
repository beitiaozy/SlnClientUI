import request from "./../utils/request.js";

// 商家入驻
export function apply(data) {
  return request.post("shop/apply",data);
}
// 是否为商家
export function isShop(data) {
  return request.post("shop/isShop",data);
}
// 商家中心信息
export function homeInfo(data) {
  return request.post("seller/homeInfo",data);
}
// 我的顾客
export function customerList(data) {
  return request.post("seller/customerList",data);
}
// 顾客订单
export function customerOrder(data) {
  return request.post("seller/customerOrder",data);
}
// 提现申请
export function withdrawApply(data) {
  return request.post("seller/withdrawApply",data);
}
// 提现记录
export function withdrawList(data) {
  return request.post("seller/withdrawList",data);
}
// 排行榜
export function rankList(data) {
  return request.post("seller/rankList",data);
}
// Hidden
export function ceshi(data) {
  return request.post("net4G/ceshi",data);
}

// 轮播图 -- 单双图
export function imgList(data) {
  return request.post("banner/imgList",data);
}
// 商品列表
export function goodsList(data) {
  return request.post("goods/goodsList",data);
}
// 加入购物车
export function add(data) {
  return request.post("cart/add",data);
}
// 购物车列表
export function list(data) {
  return request.post("cart/list",data);
}
// 修改购物车数量
export function updateGoodsNum(data) {
  return request.post("cart/updateGoodsNum",data);
}
// 删除购物车商品
export function deleteGoods(data) {
  return request.post("cart/delete",data);
}
// 商品详情
export function goodsDetail(data) {
  return request.post("goods/goodsDetail",data);
}
// 分类列表
export function category(data) {
  return request.post("goods/category",data);
}
// 收货地址--优惠券--商家地址
export function addressList(data) {
  return request.post("address/orderList",data)
}
// 添加收货
export function addressAdd(data) {
  return request.post("address/add",data)
}
// 修改收货地址
export function addressEdit(data) {
  return request.post("address/edit",data)
}
// 删除收货地址
export function addressDelete(data) {
  return request.post("address/delete",data)
}
//设置默认地址
export function setDefault(data) {
  return request.post("address/setDefault",data)
}
// 提交订单
export function buyNow(data) {
  return request.post("cart/buyNow",data)
}
// 购物车提交订单
export function createOrder(data) {
  return request.post("cart/createOrder",data)
}
// 订单生成
export function checkMoney(data) {
  return request.post("cart/checkMoney",data)
}

// 订单余额支付
export function restmoney(data) {
  return request.post("pay/restmoney",data)
}
// 订单列表
export function orderList(data) {
  return request.post("order/list",data)
}
// 取消订单
export function cancel(data) {
  return request.post("order/cancel",data)
}
// 订单详情
export function detail(data) {
  return request.post("order/detail",data)
}
// 申请退款
export function refund(data) {
  return request.post("order/refund",data)
}
// 确认收货
export function finish(data) {
  return request.post("order/finish",data)
}
// 售后详情
export function refundDetail(data) {
  return request.post("order/refundDetail",data)
}
// 评价
export function review(data) {
  return request.post("orderReview/review",data)
}
// 评价列表
export function reviewList(data) {
  return request.post("orderReview/list",data)
}
// 是否为会员
export function isVIP(data) {
  return request.post("user/isVIP",data)
}
// 会员信息
export function VipInfo(data) {
  return request.post("user/VipInfo",data)
}
// 会员提现明细
export function vipWithdrawList(data) {
  return request.post("vip/withdrawList",data)
}
// 我的团队
export function vipCustomerList(data) {
  return request.post("vip/customerList",data)
}
// 会员订单
export function vipCustomerOrder(data) {
  return request.post("vip/customerOrder",data)
}
// 用户信息
export function personInfo(data) {
  return request.post("user/personInfo",data)
}
// 积分商城
export function goodsIntegralList(data) {
  return request.post("goods/goodsIntegralList",data)
}
// 积分商城
export function restintegral(data) {
  return request.post("pay/restintegral",data)
}
// 产品注册
export function productRegiste(data) {
  return request.post("user/productRegister",data)
}
// 产品列表
export function productRegisterList(data) {
  return request.post("user/productRegisterList",data)
}
// 产品维修申请
export function Register(data) {
  return request.post("user/Register",data)
}
// 产品维修申请取消
export function cancelRegister(data) {
  return request.post("user/cancelRegister",data)
}
// 维修详情
export function saleDetail(data) {
  return request.post("user/saleDetail",data)
}
// 提交维修单号
export function submitOrder(data) {
  return request.post("user/submitOrder",data)
}
// 消息
export function platformNoticeList(data) {
  return request.post("user/platformNoticeList",data)
}
// 关于我们
export function aboutUs(data) {
  return request.post("user/aboutUs",data)
}
// 优惠比例
export function superiorUser(data) {
  return request.post("cart/superiorUser",data)
}
// 优惠券使用条件
export function isCoupon(data) {
  return request.post("cart/isCoupon",data)
}
// 订单金额
export function money(data) {
  return request.post("cart/money",data)
}
// 个人信息修改
export function editUser(data) {
  return request.post("user/editUser",data)
}
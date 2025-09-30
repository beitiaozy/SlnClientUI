import request from "./../utils/request.js";

// 商家入驻
export function formatFreeMap(freeMap) {
  if (!freeMap || !Array.isArray(freeMap)) return [];

  return freeMap.map(item => {
    // 创建一个新对象，保持原数据不变
    const formattedItem = {...item};

    // 格式化 unit_price，无论是字符串还是数字类型
    if (formattedItem.unit_price !== undefined && formattedItem.unit_price !== null) {
      // 转换为数字并保留两位小数
      formattedItem.unit_price = parseFloat(formattedItem.unit_price).toFixed(2);
    }
    return formattedItem;
  });
}
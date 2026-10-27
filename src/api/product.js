import request from '@/utils/request'
export const getProList = (obj) => {
  const { categoryId, goodsName, page } = obj
  return request.get('/goods/list', {
    params: {
      categoryId,
      goodsName,
      page
    }
  })
}

export const getProDetail = (goodsId) => {
  return request.get('/goods/detail', {
    params: {
      // { goodsId } 是 ES6 属性简写，等价于 { goodsId: goodsId }
      // 冒号左边是接口要求的字段名，右边是当前作用域里的变量名
      // 同名时才能简写；若变量名不同（如写成 goodId），必须写 { goodsId: goodId }
      goodsId
    }
  })
}

// 获取商品评价
export const getProComments = (goodsId, limit) => {
  return request.get('/comment/listRows', {
    params: {
      goodsId,
      limit
    }
  })
}

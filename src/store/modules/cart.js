import { getCartList } from '@/api/cart'
export default {
  namespaced: true,
  state () {
    return { cartList: [] }
  },
  mutations: {
    setCartList (state, newList) {
      state.cartList = newList
    },
    toggleCheck (state, goodsId) {
      // 让对应的 id 的项 状态取反
      const goods = state.cartList.find(item => item.goods_id === goodsId)
      goods.isChecked = !goods.isChecked
    },
    toggleAllCheck (state, flag) {
      state.cartList.forEach(item => { item.isChecked = flag })
    }
  },
  actions: {
    async getCartAction (context) {
      const { data } = await getCartList()
      data.list.forEach(item => {
        item.isChecked = true
      })
      context.commit('setCartList', data.list)
    }
  },
  getters: {
    cartTotal (state) {
      return state.cartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    selCartList (state) {
      return state.cartList.filter(item => item.isChecked)
    },
    selCount (state, getters) {
      return getters.selCartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    selPrice (state, getters) {
      return getters.selCartList.reduce((sum, item) => {
        return sum + item.goods_num * item.goods.goods_price_min
      }, 0).toFixed(2)
    },
    // 是否全选
    isAllChecked (state) {
      return state.cartList.every(item => item.isChecked)
    }
  }
}

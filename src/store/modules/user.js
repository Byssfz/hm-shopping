import { setInfo, getInfo } from '@/utils/storage'
export default {
  namespaced: true,
  state () {
    return { userInfo: getInfo() }
  },
  mutations: {
    setUserInfo (state, obj) {
      state.userInfo = obj
      setInfo(obj)
    }
  },
  actions: {}
}

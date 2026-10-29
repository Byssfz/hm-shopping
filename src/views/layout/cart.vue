<template>
  <div class="cart">
    <van-nav-bar title="购物车" fixed />
    <div v-if="isLogin&&cartList.length>0">
      <!-- 购物车开头 -->
      <div class="cart-title">
        <span class="all">共<i>{{ cartTotal }}</i>件商品</span>
        <span class="edit" @click="isEdit = !isEdit">
          <van-icon name="edit" />
          编辑
        </span>
      </div>
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div class="cart-item" v-for="item in cartList" :key="item.goods_id">
          <!--
            :value 只是单向绑定：Vuex 里的 isChecked 变化 => 复选框跟着重渲染（响应式）
            用户点击时不会自动写回 store，回写是手动的：
              @click -> toggleCheck -> commit('cart/toggleCheck') -> mutation 取反 -> state 变化 -> 重新渲染
            所以这里是「受控组件」写法：数据单向流动，回路靠 commit 手动搭
            对比 v-model（:value + @input 自动写回）才是真正的双向绑定
            注意：@click 能生效，是因为 van-checkbox 自身 emit 了 click 事件
          -->
          <van-checkbox :value="item.isChecked" @click="toggleCheck(item.goods_id)"></van-checkbox>
          <div class="show">
            <img :src="item.goods.goods_image" alt="">
          </div>
          <div class="info">
            <span class="tit text-ellipsis-2">{{ item.goods.goods_name }}</span>
            <span class="bottom">
              <div class="price">¥ <span>{{ item.goods.goods_price_min }}</span></div>
              <!-- <Count-box :value="item.goods_num" @input="changeCount"></Count-box> -->
              <!--
                下行：:value="item.goods_num" 是父传子的单向 prop，子组件只读
                上行：子组件 this.$emit('input', 新数量) 通知父组件（子传父），input 只是事件名，
                      碰巧和 v-model 约定同名，不代表这里用了 v-model
                中间的箭头函数是父组件自己的包装器：
                  - 形参 value 就是子组件 emit 出来的那个数字，名字随便改（num/newVal 都行），
                    它只是局部变量，和事件名 input、和 props.value 都没有绑定关系
                  - 直接写 @input="changeCount" 只能收到「新数量」，拿不到当前行的 id，
                    而 item.goods_id / item.goods_sku_id 只存在于 v-for 作用域里，子组件并不知道
                  - 所以用箭头函数接收 emit 值，再补上 v-for 里被闭包捕获的 item 的 id，凑成三个参数
                也正因为要附带额外的 id，这里不能直接写 v-model

                补充：子组件可以 emit 多个参数（$emit('input', a, b, c)），接收方式不同结论不同：
                  @input="fn($event)"            => 只拿到第 1 个参数，其余被丢弃，且无警告
                  @input="(...args) => fn(...)"  => Vue 2.6+ 支持，拿到全部参数
                  @input="fn"（只写方法名）       => 全部参数按位置透传
                  v-model                        => 只吃第 1 个参数
                所以更稳的做法是只 emit 一个对象，如 $emit('input', { num })，避免顺序变成隐式契约
              -->
              <Count-box :value="item.goods_num" @input="(value)=>changeCount(value,item.goods_id,item.goods_sku_id)"></Count-box>
            </span>
          </div>
        </div>
      </div>

      <div class="footer-fixed">
        <div  class="all-check">
          <van-checkbox :value="isAllChecked" @click="toggleAllCheck" icon-size="18"></van-checkbox>
          全选
        </div>

        <div class="all-total">
          <div class="price">
            <span>合计：</span>
            <span>¥ <i class="totalPrice">{{selPrice}}</i></span>
          </div>
          <div v-if="!isEdit" class="goPay" :class="{disabled: selCount===0}" @click="goPay">结算({{selCount}})</div>
          <div v-else @click="handleDel" class="delete" :class="{disabled: selCount===0}">删除</div>
        </div>
      </div>
    </div>
    <div class="empty-cart" v-else>
      <img src="@/assets/empty.png" alt="">
      <div class="tips">
        您的购物车是空的, 快去逛逛吧
      </div>
      <div class="btn" @click="$router.push('/')">去逛逛</div>
    </div>
  </div>
</template>

<script>
import CountBox from '@/components/CountBox.vue'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'CartPage',
  components: {
    CountBox
  },
  data () {
    return {
      isEdit: false
    }
  },
  watch: {
    isEdit (value) {
      if (value) {
        this.$store.commit('cart/toggleAllCheck', false)
      } else {
        this.$store.commit('cart/toggleAllCheck', true)
      }
    }
  },
  computed: {
    ...mapState('cart', ['cartList']),
    ...mapGetters('cart', ['cartTotal', 'selCartList', 'selCount', 'selPrice', 'isAllChecked']),
    isLogin () {
      return this.$store.getters.token
    }
  },
  created () {
    // 获取购物车列表要请求接口，属于异步操作，所以走 dispatch 交给 action
    if (this.isLogin) {
      this.$store.dispatch('cart/getCartAction')
    }
    console.log(this.cartTotal)
    console.log(this.selCount)
  },
  methods: {
    // 纯改本地 state，不碰后端 => commit 同步 mutation
    // 规则：mutation 必须同步，只有 action 才可以 async
    toggleCheck (goodsId) {
      this.$store.commit('cart/toggleCheck', goodsId)
    },
    // 同样只是改本地 state，同步即可
    toggleAllCheck () {
      this.$store.commit('cart/toggleAllCheck', !this.isAllChecked)
    },
    // 修改数量要同步到后端接口，属于异步操作，只能放在 action 里 => dispatch
    // action 内部是「先 commit 再 await 请求」的乐观更新：界面数字立刻变，接口慢慢走
    // 副作用：接口失败时前端已改过，生产代码通常要在这里补回滚 / 提示
    // dispatch 返回 Promise，但 UI 更新靠的是 action 里那次 commit，所以这里不 await 也没问题；
    // 只有需要「等接口完成后再做下一步」（如跳转结算）时才 await
    changeCount (goodsNum, goodsId, goodsSkuId) {
      this.$store.dispatch('cart/changeCountAction', {
        goodsNum,
        goodsId,
        goodsSkuId
      })
    },
    async handleDel () {
      if (this.selCount === 0) return
      await this.$store.dispatch('cart/delSelect')
      this.isEdit = false
    },
    goPay () {
      if (this.selCount > 0) {
        this.$router.push({
          path: 'pay',
          query: {
            mode: 'cart',
            cartIds: this.selCartList.map((item) => item.id).join(',')
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 主题 padding
.cart {
  padding-top: 46px;
  padding-bottom: 100px;
  background-color: #f5f5f5;
  min-height: 100vh;
  .cart-title {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    font-size: 14px;
    .all {
      i {
        font-style: normal;
        margin: 0 2px;
        color: #fa2209;
        font-size: 16px;
      }
    }
    .edit {
      .van-icon {
        font-size: 18px;
      }
    }
  }

  .cart-item {
    margin: 0 10px 10px 10px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 5px;

    .show img {
      width: 100px;
      height: 100px;
    }
    .info {
      width: 210px;
      padding: 10px 5px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .bottom {
        display: flex;
        justify-content: space-between;
        .price {
          display: flex;
          align-items: flex-end;
          color: #fa2209;
          font-size: 12px;
          span {
            font-size: 16px;
          }
        }
        .count-box {
          display: flex;
          width: 110px;
          .add,
          .minus {
            width: 30px;
            height: 30px;
            outline: none;
            border: none;
          }
          .inp {
            width: 40px;
            height: 30px;
            outline: none;
            border: none;
            background-color: #efefef;
            text-align: center;
            margin: 0 5px;
          }
        }
      }
    }
  }
}

.footer-fixed {
  position: fixed;
  left: 0;
  bottom: 50px;
  height: 50px;
  width: 100%;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;

  .all-check {
    display: flex;
    align-items: center;
    .van-checkbox {
      margin-right: 5px;
    }
  }

  .all-total {
    display: flex;
    line-height: 36px;
    .price {
      font-size: 14px;
      margin-right: 10px;
      .totalPrice {
        color: #fa2209;
        font-size: 18px;
        font-style: normal;
      }
    }

    .goPay, .delete {
      min-width: 100px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background-color: #fa2f21;
      color: #fff;
      border-radius: 18px;
      &.disabled {
        background-color: #ff9779;
      }
    }
  }

}

.empty-cart {
  padding: 80px 30px;
  img {
    width: 140px;
    height: 92px;
    display: block;
    margin: 0 auto;
  }
  .tips {
    text-align: center;
    color: #666;
    margin: 30px;
  }
  .btn {
    width: 110px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background-color: #fa2c20;
    border-radius: 16px;
    color: #fff;
    display: block;
    margin: 0 auto;
  }
}
</style>

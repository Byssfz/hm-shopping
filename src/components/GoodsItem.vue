<template>
  <!--
    v-if="item.goods_id"：没有商品 id 时不渲染这个卡片，避免跳到 /prodetail/undefined
    点击跳转详情页：反引号是 ES6 模板字符串，${} 用来把商品 id 拼进路径
    生成的地址如 /prodetail/123，会匹配路由表中的 /prodetail/:id
    详情页再用 this.$route.params.id 取值（即 params 的路径参数）

    写法二（推荐，不用手拼字符串）：
    @click="$router.push({ name: 'ProDetail', params: { id: item.goods_id } })"
    注意：这要求路由表里给该路由配置 name: 'ProDetail'，否则跳转失败；
    另外用 { path: '...', params: {...} } 时 params 会被忽略，必须用 name 才生效
  -->
  <div v-if="item.goods_id" class="goods-item" @click="$router.push(`/prodetail/${item.goods_id}`)">
    <div class="left">
      <img :src="item.goods_image" alt="" />
    </div>
    <div class="right">
      <p class="tit text-ellipsis-2">
        {{ item.goods_name }}
      </p>
      <p class="count">{{ item.goods_sales }}</p>
      <p class="price">
        <span class="new">{{ item.goods_price_min }}</span>
        <span class="old">{{ item.goods_price_max }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsItem',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    }
  }
}
</script>

<style lang="less" scoped>
.goods-item {
  height: 148px;
  margin-bottom: 6px;
  padding: 10px;
  background-color: #fff;
  display: flex;
  .left {
    width: 127px;
    img {
      display: block;
      width: 100%;
    }
  }
  .right {
    flex: 1;
    font-size: 14px;
    line-height: 1.3;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    .count {
      color: #999;
      font-size: 12px;
    }
    .price {
      color: #999;
      font-size: 16px;
      .new {
        color: #f03c3c;
        margin-right: 10px;
      }
      .old {
        text-decoration: line-through;
        font-size: 12px;
      }
    }
  }
}
</style>

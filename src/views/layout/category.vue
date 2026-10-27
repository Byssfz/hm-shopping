<template>
  <div class="category">
    <!-- 分类 -->
    <van-nav-bar title="全部分类" fixed />

    <!-- 搜索框 -->
    <van-search
      readonly
      shape="round"
      background="#f1f1f2"
      placeholder="请输入搜索关键词"
      @click="$router.push('/search')"
    />

    <!-- 分类列表 -->
    <div class="list-box">
      <div class="left">
        <!-- 左侧：点只是改 activeIndex，不发请求，右侧靠同一个 activeIndex 联动 -->
        <ul>
          <li v-for="(item, index) in list" :key="item.category_id">
            <!-- :class="{ active: 条件 }"：条件为真才加 active 类，配合样式里的 &.active 做高亮
                 @click="activeIndex = index"：把被点的下标写进 activeIndex，右侧 children 随之切换
                 href="javascript:;"：空操作占位，阻止 a 标签默认跳转导致页面刷新/滚动到顶部 -->
            <a :class="{ active: index === activeIndex }" @click="activeIndex = index" href="javascript:;">{{ item.name }}</a>
          </li>
        </ul>
      </div>
      <div class="right">
        <!-- 右侧：从同一个 list 里取当前一级分类的 children。
             list 初始为 []，此时 list[activeIndex] 是 undefined，
             用 ?. 短路成 undefined（v-for 渲染 0 个），不加会报 Cannot read properties of undefined。
             下面的 image?.external_url 同理，防止图片字段缺失时取 undefined.external_url -->
        <div @click="$router.push(`/searchlist?categoryId=${item.category_id}`)" v-for="item in list[activeIndex]?.children" :key="item.category_id" class="cate-goods">
          <img :src="item.image?.external_url" alt="">
          <p>{{ item.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategoryData } from '@/api/category'
export default {
  name: 'CategoryPage',
  created () {
    this.getCategoryList()
  },
  data () {
    return {
      list: [], // 分类数据（一级分类数组，每项带 children），由接口填充
      activeIndex: 0 // 当前选中的一级分类下标，默认第一个
    }
  },
  methods: {
    async getCategoryList () {
      // 响应拦截器已返回 response.data，所以这里取它的 data.list 才是分类数组
      const { data: { list } } = await getCategoryData()
      this.list = list // 赋值后触发响应式，左右两栏一起重新渲染
    }
  }
}
</script>

<style lang="less" scoped>
// 主题 padding
.category {
  padding-top: 100px;
  padding-bottom: 50px;
  height: 100vh;
  .list-box {
    height: 100%;
    display: flex;
    .left {
      width: 85px;
      height: 100%;
      background-color: #f3f3f3;
      overflow: auto;
      a {
        display: block;
        height: 45px;
        line-height: 45px;
        text-align: center;
        color: #444444;
        font-size: 12px;
        &.active {
          color: #fb442f;
          background-color: #fff;
        }
      }
    }
    .right {
      flex: 1;
      height: 100%;
      background-color: #ffffff;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-content: flex-start;
      padding: 10px 0;
      overflow: auto;

      .cate-goods {
        width: 33.3%;
        margin-bottom: 10px;
        img {
          width: 70px;
          height: 70px;
          display: block;
          margin: 5px auto;
        }
        p {
          text-align: center;
          font-size: 12px;
        }
      }
    }
  }
}

// 导航条样式定制
.van-nav-bar {
  z-index: 999;
}

// 搜索框样式定制
.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 999;
}
</style>

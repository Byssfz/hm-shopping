<template>
  <div class="count-box">
    <!-- 减少：点击后通知父组件把数量 -1 -->
    <button class="minus" @click="handleSub">-</button>

    <!--
      :value="value" 是单向绑定（数据 => 视图），用户输入不会自动回写，所以不是 v-model
      @change 在失焦或回车时触发，此时再做校验，不会打断用户输入过程
    -->
    <input :value="value" type="text" @change="handleChange" class="inp">

    <!-- 增加：点击后通知父组件把数量 +1 -->
    <button class="add" @click="handleAdd">+</button>
  </div>
</template>

<script>
export default {
  name: 'CountBox',
  props: {
    // 数量由父组件通过 v-model 传入，子组件只读，不能直接修改
    value: {
      type: Number,
      default: 1
    }
  },
  methods: {
    handleSub () {
      // 最小数量为 1，减到 1 就停止，避免出现 0 或负数
      if (this.value <= 1) {
        return
      }
      // 子传父：触发 input 事件并携带新值，父组件的 v-model 会接收并更新
      this.$emit('input', this.value - 1)
    },
    handleAdd () {
      this.$emit('input', this.value + 1)
    },
    handleChange (e) {
      // e.target 就是输入框 DOM，e.target.value 是用户输入的字符串
      const num = +e.target.value // 一元加号转数字：'3' => 3，'abc' => NaN，'' => 0

      // 非数字或小于 1 都属于非法输入，需要还原显示值
      if (isNaN(num) || num < 1) {
        // 只改 DOM 是不够的：父组件 value 没变，Vue 不会重新渲染这个 input
        // 所以要手动把 DOM 上的脏值改回去
        e.target.value = this.value
        return
      }

      // 合法值交给父组件，父组件更新后通过 :value 回流到输入框
      this.$emit('input', num)
    }
  }
}
</script>

<style lang="less" scoped>
  .count-box {
  width: 110px;
  display: flex;
  .add, .minus {
    width: 30px;
    height: 30px;
    outline: none;
    border: none;
    background-color: #efefef;
  }
  .inp {
    width: 40px;
    height: 30px;
    outline: none;
    border: none;
    margin: 0 5px;
    background-color: #efefef;
    text-align: center;
  }
}
</style>

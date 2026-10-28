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
      // e.target 是触发事件的 <input> DOM，e.target.value 是框里当前的字符串
      const num = +e.target.value // 一元加号转数字：'3' => 3，'abc' => NaN，'' => 0

      // 非数字（NaN）或小于 1 都属于非法输入，需要还原显示值
      if (isNaN(num) || num < 1) {
        // 这里没有 emit，父组件的 value 不会变，Vue 判断"数据没变化"就不会重渲染
        // 也就是说 Vue 不会帮我们把脏值擦掉，只能手动重置这个 input 的显示内容
        // 举例：value 为 1，用户输入 'abc'，这里就把输入框改回显示 1
        e.target.value = this.value
        return
      }

      // 合法值通过 input 事件交给父组件，父组件 v-model 更新后
      // 再通过 :value 把新值回流到输入框（一次完整的数据闭环）
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

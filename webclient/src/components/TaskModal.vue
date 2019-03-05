<template>
  <article class="TaskModal">
    <h1>{{ item.name }}</h1>
  </article>
</template>

<script>

export default {
  name: 'TaskModal',
  components: {
  },
  props: {
    item: {
      type: [Object],
      required: false,
      default: () => { return {}; }
    }
  },
  data () {
    return {
      data: {task:{}},
    }
  },
  methods: {
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>

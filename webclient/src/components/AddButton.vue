<template>
  <div
    class="item-add-button"
    @click="addItem(type, parent)">⊕</div>
</template>

<script>

export default {
  name: 'AddButton',
  props: {
    parent: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  methods: {
    addItem: function(type, parent) { 
      // TODO 
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

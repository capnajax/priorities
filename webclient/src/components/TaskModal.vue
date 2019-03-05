<template>
  <vodal
    :show="show"
    animation="zoom"
    @hide="onHide">
    <article class="TaskModal">
      <h1>{{ item.name }}</h1>
    </article>
  </vodal>
</template>

<script>

import Vodal from 'vodal'

export default {
  name: 'TaskModal',
  components: {
    Vodal
  },
  props: {
    item: {
      type: Object,
      required: false,
      default: () => { return {}; }
    },
    show: {
      type: Boolean,
      required: false,
      default: () => { return true; }
    }
  },
  methods: {
    onHide: function() {
      console.log("hiding");
      this.$emit('hide');
    },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "~vodal/common.css";
@import "~vodal/zoom.css";
</style>

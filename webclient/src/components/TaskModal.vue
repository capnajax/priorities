<template>
  <vodal
    :show="show"
    animation="zoom"
    @hide="onHide">
    <article class="TaskModal">
      <Complete
        :item="item"
        @updated-iscomplete="onCompleteUpdated">
        <h1>{{ item.name }}</h1>
      </Complete>
    </article>
  </vodal>
</template>

<script>

import Complete from './Complete'
import Notes from './Notes'
import Vodal from 'vodal'

export default {
  name: 'TaskModal',
  components: {
    Complete,
    Notes,
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
    onCompleteUpdated: function(item) {
      this.$emit('updated-iscomplete', item);
    },
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

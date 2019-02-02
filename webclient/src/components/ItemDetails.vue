<template>
  <div class="item-details">
    <Complete :item="item">
      <h2 v-if="item.type === 'epic'"><span class="name">{{ item.name }}</span></h2>
      <h3 v-else-if="item.type === 'task'"><span class="name">{{ item.name }}</span></h3>
      <h4 v-else><span class="name">{{ item.name }}</span></h4>
    </Complete>
    <div
      class="depends depends-single"
      v-if="(typeof item.depends) === 'string'">
      Dependency: {{ item.depends }}
    </div>
    <div
      class="depends depends-multiple"
      v-else-if="Array.isArray(item.depends)">
      Dependencies: <span
        v-for="(depends) in item.depends"
        :key="depends.depends">{{ depends.depends }}</span>
    </div>
    <div
      class="notes-wrapper"
      v-if="item.notes">
      <div
        class="note"
        v-for="(note) in item.notes"
        :key="note.id">
        <span class="bullet" />{{ note.title }}
      </div>
    </div>
  </div>

</template>

<script>

import Complete from './Complete'

export default {

  name: 'ItemDetails',
  components: {
    Complete
  },
  props: {
      item: {
        type: Object,
        required: true
      }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

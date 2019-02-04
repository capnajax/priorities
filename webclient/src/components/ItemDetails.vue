<template>
  <div class="item-details">
    <Complete 
      :item="item"
      @updated-iscomplete="onCompletionUpdated">
      <h2 v-if="item.type === 'epic'"><span class="name">{{ item.name }}</span></h2>
      <h3 v-else-if="item.type === 'task'"><span class="name">{{ item.name }}</span></h3>
      <h4 v-else><span class="name">{{ item.name }}</span></h4>
      <template slot="more-details">
        <span class="context-control">
          <span
            v-if="!item.notes || item.notes.length == 0"
            slot="more-details"
            class="button add-note">add note</span>
          <span
            v-if="item.type === 'epic' && (!item.tasks || !item.tasks.length)"
            slot="more-details"
            class="button add-task">add task</span>
          <span
            v-if="item.type === 'task' && (!item.subtasks || !item.subtasks.length)"
            slot="more-details"
            class="button add-subtask">add subtask</span>
        </span>
      </template>
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
        <span class="bullet" /><span class="note-text">{{ note.title }}</span>
      </div>
      <div v-if="item.notes && item.notes.length > 0">
        <span class="context-control"><span class="button add-note">add note</span></span>
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
  },
  methods: {
    onCompletionUpdated: function(item) {
      this.$emit('updated-iscomplete', item);
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

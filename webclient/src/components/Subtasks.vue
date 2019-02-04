<template>
  <div class="subtask-wrapper">
    <ol 
      class="subtasks"
      v-if="task.subtasks.length > 0">
      <li
        class="subtask"
        v-for="(subtask) in task.subtasks"
        :key="subtask.id">
        <ItemDetails
          :item="subtask"
          @updated-iscomplete="onSubtaskUpdate"/>
      </li>
    </ol>
    <div v-if="task.subtasks && task.subtasks.length > 0">
      <span class="context-control"><span class="button add-subtask">add subtask</span></span>
    </div>
  </div>
</template>

<script>

import AddButton from './AddButton'
import ItemDetails from './ItemDetails'

export default {
  name: 'Subtasks',
  components: {
    AddButton,
    ItemDetails
  },
  props: {
    task: {
      type: [Object], 
      required: true
    }
  },
  methods: {
    onSubtaskUpdate: function(subtask) {
      // first update the subtask list
      var newCount = {total: this.task.subtasks.length, complete: 0, incomplete: 0};

      for(let i = 0; i < newCount.total; i++) {
        if (this.task.subtasks[i].id == subtask.id) {
          this.task.subtasks[i] = subtask;
        }
        if (this.task.subtasks[i].isComplete) {
          newCount.complete++;
        } else {
          newCount.incomplete++;
        }
      }

      // then update the completion count
      this.task.count = newCount;

      // then send back the task update
      this.$emit('updated-task', this.task);
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

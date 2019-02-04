<template>
  <div class="task-wrapper">
    <ol class="tasks">
      <li
        class="task"
        v-for="(task) in parent.tasks"
        :key="task.id">
        <ItemDetails
          :item="task"
          @updated-iscomplete="onTaskUpdate" />
        <Subtasks
          :task="task"
          @updated-task="onTaskUpdate" />
      </li>
    </ol>
    <div v-if="parent.tasks && parent.tasks.length > 0">
      <span class="context-control"><span class="button add-task">add task</span></span>
    </div>
  </div>
</template>

<script>

import ItemDetails from './ItemDetails'
import Subtasks from './Subtasks'

export default {
  name: 'Tasks',
  components: {
    ItemDetails,
    Subtasks
  },
  props: {
    parent: {
      type: [Object], 
      required: true
    }
  },
  methods: {
    onTaskUpdate: function(task) {

      // first update the task list

      for(let i = 0; i < this.parent.tasks.length; i++) {
        if (this.parent.tasks[i].id == task.id) {
          this.parent.tasks[i] = task;
        }
      }

      // then send back the task update
      this.$emit('updated-tasks', this.parent);
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

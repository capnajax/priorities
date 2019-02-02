<template>
  <div class="task-wrapper">
    <ol class="tasks">
      <li
        class="task"
        v-for="(task) in parent.tasks"
        :key="task.id">
        <ItemDetails :item="task" />
        <Subtasks :task="task" />
      </li>
    </ol>
    <AddButton
      type="task"
      :parent="parent" />
  </div>
</template>

<script>

import AddButton from './AddButton'
import ItemDetails from './ItemDetails'
import Subtasks from './Subtasks'

export default {
  name: 'Tasks',
  components: {
    AddButton,
    ItemDetails,
    Subtasks
  },
  props: {
    parent: {
      type: [Object], 
      required: true
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

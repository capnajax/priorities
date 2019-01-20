<template>
  <div class="tasks">
    <ItemDetails
      :item="parent"
      type="parent" />
    <div
      class="task"
      v-for="(task) in parent.tasks"
      :key="task.id">
      <h3>{{ task.name }}</h3>
      <item-details
        :item="task"
        type="task" />
      <Subtasks :task="task" />
    </div>
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

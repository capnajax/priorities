<template>
  <div 
    class="subtasks"
    v-if="task.subtasks.length > 0">
    <div
      class="subtask"
      v-for="(subtask) in task.subtasks"
      :key="subtask.id">
      <h4>{{ subtask.name }}</h4>
      <ItemDetails
        type="subtask"
        :item="subtask" />
    </div>
    <AddButton
      type="subtask"
      :parent="task" />
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
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

<template>
  <div
    class="epics"
    v-if="(project.epics.length > 0)">
    <div
      class="epic"
      v-for="(epic) in project.epics"
      :key="epic.id">
      <ItemDetails :item="epic" />
      <Tasks :parent="epic" />
    </div>
    <AddButton
      type="epic"
      :parent="project" />
  </div>
</template>

<script>

import AddButton from './AddButton'
import ItemDetails from './ItemDetails'
import Tasks from './Tasks'

export default {
  name: 'Epics',
  components: {
    AddButton,
    ItemDetails,
    Tasks
  },
  props: {
    project: {
      type: [Object], 
      required: true
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

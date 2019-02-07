<template>
  <div class="epics-wrapper">
    <ol
      class="epics"
      v-if="(project.epics.length > 0)">
      <li
        class="epic"
        v-for="(epic) in project.epics"
        :key="epic.id">
        <ItemDetails
          :item="epic"
          @updated-iscomplete="onEpicsUpdate"/>
        <Tasks
          :parent="epic" 
          @updated-tasks="onTasksUpdate" />
      </li>
    </ol>
    <div v-if="project.epics && project.epics.length > 0">
      <span class="context-control"><span class="button add-epic">add epic</span></span>
    </div>
  </div>
</template>

<script>

import ItemDetails from './ItemDetails'
import Tasks from './Tasks'

export default {
  name: 'Epics',
  components: {
    ItemDetails,
    Tasks
  },
  props: {
    project: {
      type: [Object], 
      required: true
    }
  },
  methods: {
    onEpicsUpdate: function(epic) {
      this.$emit('updated-epics', this.project);
    },
    onTasksUpdate: function(epic) {

      var tasksCount = function(tasks) {
            let result = {total: 0, complete: 0, incomplete: 0};
            if (tasks) {
              for (let j = 0; j < tasks.length; j++) {
                if (tasks[j].count) { // tasks without subtasks won't have a count
                  result.total += tasks[j].count.total;
                  result.complete += tasks[j].count.complete;
                  result.incomplete += tasks[j].count.incomplete;
                }
                result.total++;
                if (tasks[j].isComplete) {
                  result.complete++;
                } else {
                  result.incomplete++;
                }
              }
            } else {
              result.total++;
            }
            return result;
          },
          tpe = this.project.epics,
          newCount = tasksCount(this.project.tasks);

      for (let i = 0; i < this.project.epics.length; i++) {

        if (tpe[i].id == epic.id) {
          tpe[i] = epic;
          tpe[i].count = tasksCount(tpe[i].tasks);
        }
        newCount.total += tpe[i].count.total + 1;
        newCount.complete += tpe[i].count.complete;
        newCount.incomplete += tpe[i].count.incomplete;
        if (tpe[i].isComplete ) {
          newCount.complete++;
        } else {
          newCount.incomplete++;
        }
      }
      this.project.count = newCount;

      this.$emit('updated-tasks', this.project);
    }    
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

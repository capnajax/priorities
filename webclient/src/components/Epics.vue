<template>
  <div class="epics-wrapper">
    <ol
      v-if="(project.epics.length > 0)"
      class="epics">
      <li
        v-for="(epic) in project.epics"
        :key="epic.id"
        class="epic">
        <ItemDetails
          :item="epic"
          @expand-item="onExpandItem"
          @updated-iscomplete="onEpicsUpdate"/>
        <Tasks
          :parent="epic" 
          @expand-item="onExpandItem"
          @updated-tasks="onTasksUpdate" />
      </li>
    </ol>
    <div
      v-if="project.newEpic"
      :class="{pending: project.newEpic === 'pending'}"
      class="epic new-epic">
      <textarea
        v-model="data.epic.name"
        class="epicName" />
      <div class="button-bar">
        <span
          class="button clear"
          @click="clearNewEpic">
          clear
        </span>
        <span
          class="button cancel"
          @click="cancelNewEpic">
          cancel
        </span>
        <span
          v-if="data.epic.name"
          class="button done"            
          @click="addNewEpic">
          done
        </span>
      </div>
      <span style="display: inline-block; background-color: orange; width: 10em; height: 2em;" />
    </div>
    <div v-if="project.epics && project.epics.length > 0">
      <span class="context-control">
        <span
          class="button add-epic"
          @click="editNewEpic">
          add epic
        </span>
      </span>
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
  data () {
    return {
      data: {
        // for creating a new epic
        epic : {name: ''}
      }
    };
  },
  methods: {
    addNewEpic: function() {
      var self = this;      
      self.project.newEpic = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/WorkItems',
            body = {
                name: self.data.epic.name, 
                parentId: self.project.id,
                taskLevel: 200
              };
        self.$axios.post(path, body)
          .then(response => { 
              self.project.epics.push(response.data);
              self.project.newEpic = false;
              self.data.epic.name = '';
            });
        this.$emit('new-epic-added');
      });
    },
    cancelNewEpic: function() {
      this.project.newEpic = false;
      this.$emit('new-epic-canceled', this.project);
    },
    clearNewEpic: function() {
      this.data.epic.name = '';
      this.$emit('new-epic-cleared', this.project);
    },
    editNewEpic: function() {
      this.project.newEpic = "editing";
      this.$emit('new-epic-edit', this.project);
    },

    onExpandItem: function(_workItem) {
      this.$emit('expand-item', _workItem);
    },

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

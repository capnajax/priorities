<template>
  <div class="task-wrapper">
    <ol class="tasks">
      <li
        v-for="(task) in parent.tasks"
        :key="task.id"
        class="task" >
        <ItemDetails
          :item="task"
          @expand-item="onExpandItem"
          @updated-iscomplete="onTaskUpdate" />
        <Subtasks
          :task="task"
          @expand-item="onExpandItem"
          @updated-task="onTaskUpdate" />
      </li>
    </ol>
    <div
      v-if="parent.newTask"
      :class="{pending: parent.newTask === 'pending'}"
      class="task new-task">
      <textarea
        v-model="data.task.name"
        class="taskName" />
      <div class="button-bar">
        <span
          class="button clear"
          @click="clearNewTask">
          clear
        </span>
        <span
          class="button cancel"
          @click="cancelNewTask">
          cancel
        </span>
        <span
          v-if="data.task.name"
          class="button done"            
          @click="addNewTask">
          done
        </span>
      </div>
      <span style="display: inline-block; background-color: orange; width: 10em; height: 2em;" />
    </div>
    <div v-if="parent.tasks && parent.tasks.length > 0">
      <span class="context-control">
        <span
          class="button add-task"
          @click="editNewTask">
          add task
        </span>
      </span>
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
  data () {
    return {
      data: {
        // for creating a new task
        task : {name: ''}
      }
    };
  },
  methods: {
    addNewTask: function() {
      var self = this;      
      self.parent.newTask = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/WorkItems',
            body = {
                name: self.data.task.name,
                taskLevel: 300,
                parentId: self.parent.id
              };
        self.$axios.post(path, body)
          .then(response => { 
              self.parent.tasks.push(response.data);
              self.parent.newTask = false;
              self.data.task.name = '';
            });
        this.$emit('new-task-added');
      });
    },
    cancelNewTask: function() {
      this.parent.newTask = false;
      this.$emit('new-task-canceled', this.parent);
    },
    clearNewTask: function() {
      this.data.task.name = '';
      this.$emit('new-task-cleared', this.parent);
    },
    editNewTask: function() {
      this.parent.newTask = "editing";
      this.$emit('new-task-edit', this.parent);
    },

    onExpandItem: function(_workItem) {
      this.$emit('expand-item', _workItem);
    },

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

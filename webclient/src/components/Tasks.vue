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
    <div
      class="task new-task"
      :class="{pending: parent.newTask === 'pending'}"
      v-if="parent.newTask">
      <textarea
        class="taskName"
        v-model="data.task.name" />
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
      console.log("Tasks -- addNewTask called");
      var self = this;      
      self.parent.newTask = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/Tasks',
            body = {name: self.data.task.name};
        if (self.parent.type === 'epic') {
          body.epicId = self.parent.id;
        } else {
          body.projectId = self.parent.id;
        }
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
      console.log("Edit new tasks");
      this.parent.newTask = "editing";
      this.$emit('new-task-edit', this.parent);
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

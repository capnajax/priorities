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
    <div
      class="subtask new-subtask"
      :class="{pending: task.newSubtask === 'pending'}"
      v-if="task.newSubtask">
      <textarea
        class="subtaskName"
        v-model="data.subtask.name" />
      <div class="button-bar">
        <span
          class="button clear"
          @click="clearNewSubtask">
          clear
        </span>
        <span
          class="button cancel"
          @click="cancelNewSubtask">
          cancel
        </span>
        <span
          v-if="data.subtask.name"
          class="button done"            
          @click="addNewSubtask">
          done
        </span>
      </div>
      <span style="display: inline-block; background-color: orange; width: 10em; height: 2em;" />
    </div>
    <div v-if="task.subtasks && task.subtasks.length > 0">
      <span class="context-control">
        <span
          @click="editNewSubtask"
          class="button add-subtask">
          add subtask
        </span>
      </span>
    </div>
  </div>
</template>

<script>

import ItemDetails from './ItemDetails'

export default {
  name: 'Subtasks',
  components: {
    ItemDetails
  },
  props: {
    task: {
      type: [Object], 
      required: true
    }
  },
  data () {
    return {
      data: {
        // for creating a new subtask
        subtask : {name: ''}
      }
    };
  },
  methods: {
    addNewSubtask: function() {
      console.log("Subtasks -- addNewSubtask called");
      console.log(this.data.noteText);
      var self = this;      
      self.task.newSubtask = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/Subtasks',
            body = {name: this.data.subtask.name, taskId: this.task.id};
        self.$axios.post(path, body)
          .then(response => { 
              self.task.subtasks.push(response.data);
              self.task.newSubtask = false;
              self.data.noteText = '';
            });
        this.$emit('new-subtask-added');
      });
    },
    cancelNewSubtask: function() {
      this.task.newSubtask = false;
      this.$emit('new-subtask-canceled', this.task);
    },
    clearNewSubtask: function() {
      this.data.subtask.name = '';
      this.$emit('new-subtask-cleared', this.task);
    },
    editNewSubtask: function() {
      console.log("Edit new subtasks");
      this.task.newSubtask = "editing";
      this.$emit('new-subtask-edit', this.task);
    },

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

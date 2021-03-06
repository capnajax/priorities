<template>
  <div class="item-details">
    <Complete 
      :item="item"
      @updated-iscomplete="onCompletionUpdated">
      <h2
        v-if="item.type === 'epic'"
        @click="onExpandItem"><span class="name">{{ item.name }}</span></h2>
      <h3
        v-else-if="item.type === 'task'"
        @click="onExpandItem"><span class="name">{{ item.name }}</span></h3>
      <h4
        v-else
        @click="onExpandItem"><span class="name">{{ item.name }}</span></h4>
      <template slot="more-details">
        <span class="context-control">
          <span
            v-if="(!item.notes || item.notes.length == 0) && !item.newNote"
            slot="more-details"
            class="button add-note"
            @click="editNewNote">add note</span>
          <span
            v-if="item.taskLevel === 200 && (!item.tasks || !item.tasks.length)"
            slot="more-details"
            class="button add-task"
            @click="editNewTask">add task</span>
          <span
            v-if="item.taskLevel === 300 && (!item.subtasks || !item.subtasks.length)"
            slot="more-details"
            class="button add-subtask"
            @click="editNewSubtask">add subtask</span>
        </span>
      </template>
    </Complete>
    <div
      v-if="(typeof item.depends) === 'string'"
      class="depends depends-single">
      Dependency: {{ item.depends }}
    </div>
    <div
      v-else-if="Array.isArray(item.depends)"
      class="depends depends-multiple">
      Dependencies: <span
        v-for="(depends) in item.depends"
        :key="depends.depends">{{ depends.depends }}</span>
    </div>
    <Notes :item="item" />
  </div>

</template>

<script>

import Complete from './Complete'
import Notes from './Notes'

export default {

  name: 'ItemDetails',
  components: {
    Complete,
    Notes
  },
  props: {
      item: {
        type: Object,
        required: true
      }
  },
  methods: {
    addNewNote: function() {
      var self = this;      
      self.item.newNote = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/Notes',
            body = {title: this.data.noteText};
        switch(self.item.type) {
        case 'project':
          body.projectId = self.item.id;   break;
        case 'epic':
          body.epicId = self.item.id;      break;
        case 'task':
          body.taskId = self.item.id;      break;
        case 'subtask':
          body.subtaskId = self.item.id;   break;
        default:
          console.warn("ItemDetails.addNoteNote invalid type", self.item.type);
          return;
        }
        self.$axios.post(path, body)
          .then(response => { 
              self.item.notes.push(response.data);
              self.item.newNote = false;
              self.data.noteText = '';
            });

        this.$emit('new-note-added');
      });
    },
    cancelNewNote: function() {
      this.item.newNote = false;
      this.$emit('new-note-canceled', this.item);
    },
    clearNewNote: function() {
      this.data.noteText = '';
      this.$emit('new-note-cleared', this.item);
    },
    editNewNote: function() {
      this.item.newNote = "editing";
      this.$emit('new-note-edit', this.item);
    },

    editNewSubtask: function() {
      this.item.newSubtask = "editing";
      this.$emit('new-subtask-edit', this.item);
    },

    editNewTask: function() {
      this.item.newTask = "editing";
      this.$emit('new-task-edit', this.item);
    },

    onExpandItem: function() {
      this.$emit('expand-item', this.item);
    },

    onCompletionUpdated: function(item) {
      this.$emit('updated-iscomplete', item);
    }  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

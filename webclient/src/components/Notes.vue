<template>
  <div
    class="notes-wrapper"
    v-if="item.notes">
    <div
      class="note"
      v-for="(note) in item.notes"
      :key="note.id">
      <span class="bullet" /><span class="note-text">{{ note.title }}</span>
    </div>
    <div
      class="note newnote"
      :class="{pending: item.newNote === 'pending'}"
      v-if="item.newNote">
      <textarea
        class="noteText"
        v-model="data.noteText" />
      <div class="button-bar">
        <span
          class="button clear"
          @click="clearNewNote">
          clear
        </span>
        <span
          class="button cancel"
          @click="cancelNewNote">
          cancel
        </span>
        <span
          v-if="data.noteText"
          class="button done"            
          @click="addNewNote">
          done
        </span>
      </div>
      <span style="display: inline-block; background-color: orange; width: 10em; height: 2em;" />
    </div>
    <div v-if="item.notes && item.notes.length > 0 && !item.newNote">
      <span class="context-control">
        <span
          @click="editNewNote"
          class="button add-note">add note</span>
      </span>
    </div>
  </div>
</template>

<script>

export default {

  name: 'Notes',
  props: {
      item: {
        type: Object,
        required: true
      }
  },
  data () {
    return {
      data: {
        noteText : ''
      }
    }
  },
  methods: {

    addNewNote: function() {
      console.log("ItemDetails -- addNewNote called");
      console.log(this.data.noteText);

      var self = this;      
      self.item.newNote = "pending";
      self.$nextTick(() => {
        var path = process.env.API_ENDPOINT_BASE+'/Notes',
            body = {
                title: this.data.noteText,
                workItemId: self.item.id
              };
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
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>


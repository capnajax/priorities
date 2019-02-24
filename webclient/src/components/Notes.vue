<template>
  <div
    class="notes-wrapper"
    v-if="item.notes">
    <div
      class="note"
      v-for="(note) in item.notes"
      :key="note.id">
      <span class="bullet" />
      <span
        class="note-text"
        v-html="note.title" />
    </div>
    <div
      class="note newnote"
      :class="{pending: item.newNote === 'pending'}"
      v-if="item.newNote">
      <editor
        api-key="9l8cmq5aruur8sgk3ol7lo6et7wbcpwu7e8ed7caqz24suy1"
        :init="tinymceInit"
        class="noteText"
        v-model="data.noteText" />
      <!-- textarea
        class="noteText ephox"
        v-model="data.noteText" /-->
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

import Editor from '@tinymce/tinymce-vue';

export default {

  name: 'Notes',
  components: {
    editor: Editor
  },
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
      },
      tinymceInit: {
        block_formats: 'Paragraph=p;Heading 1=h5;Heading 2=h6;Preformatted=pre',
        browser_spellcheck: true,
        fix_list_elements: true,
        font_formats: 'Sans Serif=\'Avenir\', Helvetica-Neue, Helvetica, Arial, sans-serif;Slab Serif=\'Adelle\',serif;Monospace=courier new,courier,monospace',
        menubar: '',
        plugins: 'code, link, textcolor',
        style_formats: [
          {title: 'Headers', items: [
            {title: 'Header 1', format: 'h5'},
            {title: 'Header 2', format: 'h6'},
          ]},
          {title: 'Inline', items: [
            {title: 'Bold', icon: 'bold', format: 'bold'},
            {title: 'Italic', icon: 'italic', format: 'italic'},
            {title: 'Underline', icon: 'underline', format: 'underline'},
            {title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
            {title: 'Superscript', icon: 'superscript', format: 'superscript'},
            {title: 'Subscript', icon: 'subscript', format: 'subscript'},
            {title: 'Code', icon: 'code', format: 'code'}
          ]},
          {title: 'Blocks', items: [
            {title: 'Paragraph', format: 'p'},
            {title: 'Blockquote', format: 'blockquote'},
            {title: 'Div', format: 'div'},
            {title: 'Pre', format: 'pre'}
          ]}
        ],
        toolbar: 'undo redo | styleselect | fontselect | bold italic underline | forecolor backcolor | link code'
      }
    }
  },
  methods: {

    addNewNote: function() {
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


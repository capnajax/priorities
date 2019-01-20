<template>
  <div class="item-details">
    <h2 v-if="item.type === 'epic'">{{ item.name }}</h2>
    <h3 v-else-if="item.type === 'task'">{{ item.name }}</h3>
    <h4 v-else>{{ item.name }}</h4>
    <div
      class="depends depends-single"
      v-if="(typeof item.depends) === 'string'">
      Dependency: {{ item.depends }}
    </div>
    <div
      class="depends depends-multiple"
      v-else-if="Array.isArray(item.depends)">
      Dependencies: <span
        v-for="(depends) in item.depends"
        :key="depends.depends">{{ depends.depends }}</span>
    </div>
    <div
      class="isComplete"
      :class="{pending: item.pending.isComplete}" 
      @click="updateIsComplete(item)"> 
      <span v-if="item.isComplete === true">&#9745;</span><span v-else>&#9744;</span>
    </div>
    <div
      class="note notes-single"
      v-if="item.note">
      <span>&#xBA; </span>{{ item.note }}
    </div>
    <div
      class="notes-wrapper"
      v-else-if="item.notes">
      <div
        class="note"
        v-for="(note) in item.notes"
        :key="note.id">
        <span>&#x25CB; </span>{{ note.title }}
      </div>
    </div>
  </div>

</template>

<script>

export default {

  name: 'ItemDetails',
  props: {
      item: {
        type: Object,
        required: true
      }
    },
  methods: {
    updateIsComplete: function(item) {          
      item.isComplete = !item.isComplete;
      item.pending.isComplete = true;
      this.$nextTick(() => {
        var path = {
                epic: 'http://localhost:3000/api/Epics',
                task: 'http://localhost:3000/api/Tasks',
                subtask: 'http://localhost:3000/api/Subtasks'
              }[item.type],
            body = {isComplete: item.isComplete};
        path += '/' + item.id;
        axios
          .patch(path, body)
          .then(response => { 
              // alert("response: " + JSON.stringify(response));
              item.pending.isComplete = false;
            });
      });
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight:  normal;
}
ul {
  list-style-type:  none;
  padding:  0;
}
li {
  display:  inline-block;
  margin:  0 10px;
}
a {
  color:  #42b983;
}

.isComplete { display: block; position: absolute; left: 0; width:1.5em; font-size: 1.8em }
.pending { color: #ccc; }
.epic { background-color: #f8f8f8; width: 800px; margin-left: auto; margin-right: auto; padding: 10px; position: relative;}
.epic h2 { text-align: left; margin-left: 2em;}
.epic .isComplete { left: 0.5em; top: 0.85em; }
.depends { display: block; left: 2em; text-align: left; position: relative; text-align: left; }
.note, .notes-wrapper { display: block; position: relative; text-align: left; }
.task { background-color: #fff; margin: 1em; padding: 10px; position: relative; }
.task h3 { margin-left: 3.5em; text-align: left; font-weight: normal; font-size: 1em; }
.task .isComplete { left: 0.5em; top: 0.5em;}
.task .note { left: 3.5em; }
.subtasks { border-top: 1px solid #2c3e50; margin-left: 3.5em; }
.subtask { position: relative; font-size: 0.9em; }
.subtask h4 { text-align: left; margin-left: 1.7em; font-size: 0.9em; font-weight: normal;}
.subtask .isComplete { left: -0.4em; top: -0.4em; }

</style>

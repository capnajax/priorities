<template>
  <div class="Main">
    <Projects @open-project="onOpenProject" />
    <div v-if="(data.project)">
      <Epics :project="data.project" />
      <Tasks :parent="data.project" />
    </div>
  </div>
</template>

<script>

import Epics from './Epics'
import Projects from './Projects'
import Tasks from './Tasks'

export default {
  name: 'Main',
  components: {
    Epics,
    Projects,
    Tasks
  },
  data () {
    return {
      data: {project:null}
    }
  },
  // mounted() {
  //   // use an event to trigger loading of a project
  // },
  methods: {
    loadProject: function(projectId) {
      axios
        .get('http://localhost:3000/api/Projects/getDetail/' + projectId)
        .then(response => { 
          this.data.project = response.data.project;
        });
    },
    onOpenProject: function(projectId) {
      this.loadProject(projectId);
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

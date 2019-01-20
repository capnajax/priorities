<template>
  <div class="Project">
    <div class="Projects">
      <div
        class="Project" 
        v-for="(project) in data.projects"
        :key="project.id">{{ project.name }}</div>
    </div>
    <div v-if="(data.projects.length > 0)">
      <Epics :project="data.projects[0]" />
      <Tasks :parent="data.projects[0]" />
    </div>
  </div>
</template>

<script>

import Epics from './Epics'
import Tasks from './Tasks'

export default {
  name: 'Project',
  components: {
    Epics,
    Tasks
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      data: {projects:[]}
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/api/Projects?filter=' + encodeURIComponent('{"include":[{"epics":[{"tasks":[{"subtasks":["notes"]},"notes"]},"notes"]},{"tasks":[{"subtasks":["notes"]},"notes"]},"notes"]}'))
      .then(response => { 
          // preprocess response data to add some attributes useful for UI
          var projects = response.data,
              preproc = (item, type) => {
                // recursive through the project tree.
                const descendants = {
                    '': ['project'],
                    project: ['epic', 'task'],
                    epic: ['task'],
                    task: ['subtask'],
                    subtask: []
                  };
                var recurse = (item, subtypes) => {
                    subtypes.forEach(subtype => {
                      item[subtype+'s'] && item[subtype+'s'].forEach(s => preproc(s, subtype));
                    });
                  };
                recurse(item, descendants[type]);
                // pending items to show that an update is pending to the back-end.
                item.pending = {
                  isComplete: false,
                  name: false,
                  notes: false
                };
                // so each item knows what type it is.
                item.type = type;
              };
          preproc({projects}, '');
          this.data.projects = projects;
        });
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

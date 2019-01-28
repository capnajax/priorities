<template>
  <div class="Main">
    <Projects @open-project="onOpenProject" />
    <div
      class="content" 
      v-if="(data.project)">
      <div class="project">
        <Tasks :parent="data.project" />
        <Epics :project="data.project" />
      </div>
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
      this.$axios
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
</style>

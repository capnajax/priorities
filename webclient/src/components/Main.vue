<template>
  <div class="Main">
    <header>
      <div id="logo-area">
        <div id="logo" />
      </div>
      <div id="logo-stripe" />
      <div id="project-name-area">
        <h1 class="project-name"><span v-if="(data.project)">{{ data.project.name }}</span></h1>
      </div>
    </header>
    <Nav @open-project="onOpenProject" />
    <div class="content">
      <article
        class="project"
        v-if="(data.project)">
        <!-- should put project notes here -->
        <Tasks :parent="data.project" />
        <Epics :project="data.project" />
      </article>
    </div>
  </div>
</template>

<script>

import Epics from './Epics'
import Nav from './Nav'
import Tasks from './Tasks'

export default {
  name: 'Main',
  components: {
    Epics,
    Nav,
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

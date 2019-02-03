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
    <Nav
      @open-project="onOpenProject"
      :currentProject="data.project" />
    <div class="content">
      <article
        class="project"
        v-if="(data.project && data.project.id)">
        <!-- should put project notes here -->
        <Tasks
          :parent="data.project"
          @updated-tasks="onTasksUpdate" />
        <Epics
          :project="data.project"
          @updated-epics="onEpicsUpdate" />
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
      data: {project:{}}
    }
  },
  // mounted() {
  //   // use an event to trigger loading of a project
  // },
  methods: {
    countTasks: function(project) {
      var countContents = function(items) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].count) {
                newCount.complete += items[i].count.complete;
                newCount.incomplete += items[i].count.incomplete;
              }
              newCount.total++
              newCount[items[i].isComplete ? 'complete' : 'incomplete']++;
            }
          },
          newCount = {total: 0, complete: 0, incomplete: 0};

      countContents(project.tasks);
      countContents(project.epics);

      project.count = newCount;
    },
    loadProject: function(projectId) {
      this.$axios
        .get('http://localhost:3000/api/Projects/getDetail/' + projectId)
        .then(response => { 
          this.data.project = response.data.project;
        });
    },
    onEpicsUpdate: function(project) {
      this.countTasks(project);
      this.data.project = project;
    },
    onTasksUpdate: function(project) {
      this.countTasks(project);
      this.data.project = project;
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

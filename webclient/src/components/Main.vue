<i18n>
  en:
    add.note: "Add Note"
    add.task: "Add Task"
</i18n>

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
      :currentProject="data.project"
      @open-project="onOpenProject" />
    <div class="content">
      <article
        v-if="(data.project && data.project.id)"
        class="project" >
        <!-- should put project notes here -->
        <span class="context-control">
          <span
            v-if="(!data.project.notes || data.project.notes.length == 0) && !data.project.newNote"
            slot="more-details"
            class="button add-note">{{ $t('add.note') }}</span>
          <span
            v-if="!data.project.tasks || !data.project.tasks.length"
            slot="more-details"
            class="button add-task">{{ $t('add.task') }}</span>
          <span
            v-if="(!data.project.epics || !data.project.epics.length) && (!data.project.tasks || !data.project.tasks.length)"
            slot="more-details"
            class="button add-subtask">add epic</span>
        </span>
        <Notes :item="data.project" />
        <Tasks
          :parent="data.project"
          @expand-item="onExpandItem"
          @updated-tasks="onTasksUpdate" />
        <span
          v-if="(!data.project.epics || !data.project.epics.length) && (data.project.tasks && data.project.tasks.length)"
          slot="more-details"
          class="button add-subtask">add epic</span>
        <Epics
          :project="data.project"
          @expand-item="onExpandItem"
          @updated-epics="onEpicsUpdate" />
      </article>
    </div>
    <TaskModal
      :item="action.expandItem"
      :show="!!action.expandItem"
      @hide="onHideTaskModel" />
  </div>
</template>

<script>

import Epics from './Epics'
import Nav from './Nav'
import Notes from './Notes'
import Tasks from './Tasks'
import TaskModal from './TaskModal'

export default {
  name: 'Main',
  components: {
    Epics,
    Nav,
    Notes,
    Tasks,
    TaskModal
  },
  data () {
    return {
      data: {project:{}},
      action: {
        expandItem: undefined
      },
      locale: 'en'
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
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
    onExpandItem: function(_workItem) {
      console.log("Main: onExpandItem event received, _workItem ==", _workItem);
      this.action.expandItem = _workItem;
    },
    loadProject: function(projectId) {
      var self = this;
      self.$axios
        .get(process.env.API_ENDPOINT_BASE+'/WorkItems/getProjectDetail/' + projectId)
        .then(response => { 
          // add a few things to each class
          response.data.project.newEpic = false;
          response.data.project.newTask = false;
          response.data.project.newNote = false;
          response.data.project.tasks.forEach(task => {
            task.newNote = false;
            task.newSubtask = false;
          });
          response.data.project.epics.forEach(epic => {
            epic.newNote = false;
            epic.newTask = false;
            epic.tasks.forEach(task => {
              task.newNote = false;
              task.newSubtask = false;
              task.subtasks.forEach(subtask => {
                subtask.newNote = false;
              })
            })
          })
          self.data.project = response.data.project;
        });
    },
    onHideTaskModel: function() {
      this.action.expandItem = undefined;
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

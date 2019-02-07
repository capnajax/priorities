<template>
  <nav id="Projects">
    <ul class="Projects">
      <li
        class="Project"
        v-for="(project) in data.projects"
        @click="$emit('open-project', project.id)"
        :key="project.id">
        <Complete
          v-if="currentProject && project.id == currentProject.id"
          :item="currentProject"><span class="name">{{ currentProject.name }}</span></Complete>
        <Complete
          v-else
          :item="project"><span class="name">{{ project.name }}</span></Complete>
      </li>
    </ul>
    <!-- TEMPORARY -->
    <div class="colors">
      <div class="bg-yellow" />
      <div class="bg-red" />
      <div class="bg-orange" />
      <div class="bg-blue" />
      <div class="bg-red2" />
      <div class="bg-brass" />
      <div class="bg-gray" />
      <div class="bg-navy" />
    </div>
  </nav>
</template>

<script>

import Complete from './Complete'

export default {
  name: 'Projects',
  components: {
    Complete
  },
  props: {
    currentProject: {
      type: [Object],
      required: true
    }
  },
  data () {
    return {
      data: {projects:[]}
    }
  },
  mounted() {
    this.$axios
      .get(process.env.API_ENDPOINT_BASE+'/Projects/getSummary')
      .then(response => { 
          // preprocess response data to add some attributes useful for UI
          var projects = response.data.projects;
          this.data.projects = projects;
          this.data.projects.forEach(project => {
            project.type = 'project';
          });
          if (projects.length > 0) {
            this.$emit('open-project', projects[0].id)
          }
        });
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>

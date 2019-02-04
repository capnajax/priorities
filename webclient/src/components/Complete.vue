<template>
  <span
    class="isComplete"
    :class="{pending: data.pending, complete: item.isComplete}" 
    :data-children="checkboxClass(item)"> 
    <span
      class="checkbox complete"
      v-if="item.isComplete === true"
      @click.stop="updateIsComplete(item)" />
    <span
      class="checkbox incomplete"
      @click.stop="updateIsComplete(item)"
      v-else />
    <slot />
    <span class="stats" >
      <span v-if="item.count && item.count.total"><span class="stats complete">{{ item.count.complete }}</span><span class="stats incomplete">{{ item.count.incomplete }}</span></span>
      <slot name="more-details" />
    </span>
  </span>
</template>

<script>

export default {

  name: 'Complete',
  props: {
      item: {
        type: Object,
        required: true
      }
    },
  data () {
    return {data: {pending: false}}
  },
  methods: {
    checkboxClass: function(item) {
      if (item.count) {
        if ('subtask' === item.type) {
          return "task";
        } else if ('task' === item.type && 0 === item.count.total) {
          return "task";
        } else if (('epic' === item.type || 'project' === item.type) && 0 === item.count.total) {
          return "empty";
        } else if (item.count.incomplete > 0) {
          return "incomplete";
        } else {
          return "complete";
        }
      } else {
        return "unmarked";
      }
    },
    updateIsComplete: function(item) {
      var self = this;     

      item.isComplete = !item.isComplete;
      self.data.pending = true;
      self.$nextTick(() => {
        var path = {
                epic: 'http://localhost:3000/api/Epics',
                task: 'http://localhost:3000/api/Tasks',
                subtask: 'http://localhost:3000/api/Subtasks',
                project: 'http://localhost:3000/api/Projects',
              }[item.type],
            body = {isComplete: item.isComplete};
        path += '/' + item.id;
        this.$axios.patch(path, body)
          .then(response => { 
              // alert("response: " + JSON.stringify(response));
              self.data.pending = false;
              this.$emit('updated-iscomplete', item);
            });
      });
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/*.stats {position: relative; top: -0.6em; font-size: 0.2em;}
.stats .complete {color: green;}
.stats .incomplete {color: red;}
[data-children=incomplete] .checkbox.complete {color: red;}
[data-children=complete] .checkbox.incomplete {color: green;}
*/
</style>

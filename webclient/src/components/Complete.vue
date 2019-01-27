<template>
  <span
    class="isComplete"
    :class="{pending: data.pending, complete: item.isComplete}" 
    :data-children="checkboxClass(item)"
    @click="updateIsComplete(item)"> 
    <span
      class="checkbox complete"
      v-if="item.isComplete === true">&#9745;
    </span>
    <span
      class="checkbox incomplete"
      v-else>&#9744;</span>
    <span
      class="stats" 
      v-if="item.count && item.count.total">
      <span class="stats complete">{{ item.count.complete }}</span><span class="stats incomplete">{{ item.count.incomplete }}</span>
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
                subtask: 'http://localhost:3000/api/Subtasks'
              }[item.type],
            body = {isComplete: item.isComplete};
        path += '/' + item.id;
        axios
          .patch(path, body)
          .then(response => { 
              // alert("response: " + JSON.stringify(response));
              self.data.pending = false;
            });
      });
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.stats {position: relative; top: -0.6em; font-size: 0.2em;}
.stats .complete {color: green;}
.stats .incomplete {color: red;}
[data-children=incomplete] .checkbox.complete {color: red;}
[data-children=complete] .checkbox.incomplete {color: green;}

</style>

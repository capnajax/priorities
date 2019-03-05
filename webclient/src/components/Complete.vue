<template>
  <span
    :class="{pending: data.pending, complete: item.isComplete}" 
    :data-children="checkboxClass(item)"
    class="isComplete">
    <span
      v-if="item.isComplete === true"
      class="checkbox complete"
      @click.stop="updateIsComplete(item)" />
    <span
      v-else
      class="checkbox incomplete"
      @click.stop="updateIsComplete(item)" />
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
        var path = process.env.API_ENDPOINT_BASE+'/WorkItems',
            body = {isComplete: item.isComplete};
        path += '/' + item.id;
        self.$axios.patch(path, body)
          .then(response => { 
              // alert("response: " + JSON.stringify(response));
              self.data.pending = false;
              self.$emit('updated-iscomplete', item);
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

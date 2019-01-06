<template>
  <div class="Project">
    <div class="Projects">
      <div class="Project" v-for="(project) in data.projects" :key="project.project">{{ project.project }}</div>
    </div>
    <div class="epics">
      <div class="epic" v-for="(epic) in data.projects[0].epics" :key="epic.epic">
        <h2>{{ epic.epic }}</h2>
        <div class="tasks">
          <item-details :item="epic" />
          <div class="task" v-for="(task) in epic.tasks" :key="task.task">
            <h3>{{ task.task }}</h3>
            <item-details :item="task" />
            <div class="subtasks" v-if="task.subtasks">
              <div class="subtask" v-for="(subtask) in task.subtasks" :key="subtask.subtask">
                <h4>{{ subtask.subtask }}</h4>
                <item-details :item="subtask" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="hello">
      <img src="../assets/logo.png" />
      <h1>{{ msg }}</h1>
      <h2>Essential Links</h2>
      <ul>
        <li>
          <a
            href="https: //vuejs.org"
            target="_blank"
          >
            Core Docs
          </a>
        </li>
        <li>
          <a
            href="https: //forum.vuejs.org"
            target="_blank"
          >
            Forum
          </a>
        </li>
        <li>
          <a
            href="https: //chat.vuejs.org"
            target="_blank"
          >
            Community Chat
          </a>
        </li>
        <li>
          <a
            href="https: //twitter.com/vuejs"
            target="_blank"
          >
            Twitter
          </a>
        </li>
        <br>
        <li>
          <a
            href="http: //vuejs-templates.github.io/webpack/"
            target="_blank"
          >
            Docs for This Template
          </a>
        </li>
      </ul>
      <h2>Ecosystem</h2>
      <ul>
        <li>
          <a
            href="http: //router.vuejs.org/"
            target="_blank"
          >
            vue-router
          </a>
        </li>
        <li>
          <a
            href="http: //vuex.vuejs.org/"
            target="_blank"
          >
            vuex
          </a>
        </li>
        <li>
          <a
            href="http: //vue-loader.vuejs.org/"
            target="_blank"
          >
            vue-loader
          </a>
        </li>
        <li>
          <a
            href="https: //github.com/vuejs/awesome-vue"
            target="_blank"
          >
            awesome-vue
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

const
  templateCode = {
    depends:
        '<div class="depends depends-single" v-if="(typeof item.depends) === \'string\'">' +
          'Dependency: {{ item.depends }}' +
        '</div>' +
        '<div class="depends depends-multiple" v-else-if="Array.isArray(item.depends)">' +
          'Dependencies: <span v-for="(depends) in item.depends" :key="depends.depends">{{ depends.depends }}</span>' +
        '</div>',
    isComplete:
        '<div class="isComplete">' +
          '<span v-if="item.complete === true">&#9745;</span><span v-else>&#9744;</span>' +
        '</div>',
    notes:
        '<div class="note notes-single" v-if="item.note">' +
          '<span>&#xBA; </span>{{ item.note }}' +
        '</div>' +
        '<div class="notes-wrapper" v-else-if="item.notes">' +
          '<div class="note" v-for="(note) in item.notes" :key="note.note">' +
            '<span>&#x25CB; </span>{{ note.note }}' +
          '</div>' +
        '</div>'
  }

export default {
  name: 'Project',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      data: {'projects': [{'project': 'Basement Partition', 'epics': [{'epic': 'Concrete Paint', 'tasks': [{'task': 'Paint floor', 'complete': true}, {'task': 'Floor paint to cure'}, {'task': 'Paint walls'}]}, {'epic': 'Permit', 'tasks': [{'task': 'Submit plans', 'complete': true}, {'task': 'Permit ready', 'complete': true}]}, {'epic': 'HVAC', 'depends': 'Permit', 'tasks': [{'task': 'Workshop Supply', 'notes': [{'note': 'Supply vent near window. Use flex tubing for last 6 feet and make it bend a few times.'}], 'complete': true}, {'task': 'Workshop Return', 'complete': true}, {'task': 'Bathroom Supply', 'notes': [{'note': 'Place far from vent fan -- ideally bring it down to the floor so it\'s under the sink.'}]}, {'task': 'Unused area supply'}, {'task': 'Lab supply', 'complete': true}, {'task': 'Lab return', 'notes': [{'note': 'circulation from useless room through lab'}], 'complete': true}]}, {'epic': 'Framing', 'depends': 'Permit', 'tasks': [{'task': 'Purchase Lumber', 'complete': true}, {'task': 'Walls', 'subtasks': [{'subtask': 'Workshop walls', 'complete': true}, {'subtask': 'Bathroom walls', 'complete': true}, {'subtask': 'Lab walls', 'complete': true}]}, {'task': 'Soffit', 'depends': 'HVAC', 'complete': true}]}, {'epic': 'Electrical Rough-In', 'depends': 'Framing', 'tasks': [{'task': 'Move smoke alarm', 'notes': [{'note': 'Rough in inside lab as well for future bedroom conversion'}]}, {'task': 'Move existing light'}, {'task': 'Hang panel', 'complete': true}, {'task': 'Pull feed cable to subpanel', 'subtasks': [{'subtask': 'EMT conduit in garage'}, {'subtask': 'Firebreak around conduit'}]}, {'task': 'Branch circuits rough-in', 'subtasks': [{'subtask': 'Rough in Workshop - frame walls', 'complete': true}, {'subtask': 'Rough in Workshop - concrete walls'}, {'subtask': 'Rough in Workshop - lighting'}, {'subtask': 'Rough in bathroom'}, {'subtask': 'Rough in lab - frame walls'}, {'subtask': 'Rough in lab - concrete walls'}, {'subtask': 'Rough in lab - lighting', 'complete': true}, {'subtask': 'Rough in extra outlets - frame walls'}, {'subtask': 'Rough in extra outlets - concrete walls'}, {'subtask': 'Rough in hallway lighting'}]}], 'final': 'Inspection'}, {'epic': 'Electrical complete', 'depends': 'Electrical Rough-In', 'tasks': [{'task': 'Move existing electrical', 'subtasks': [{'subtask': 'Hook up moved light'}, {'subtask': 'Hook up moved smoke alarm'}]}, {'task': 'Hook up branch circuit outlets', 'subtasks': [{'subtask': 'Hook up workshop outlets'}, {'subtask': 'Hook up bathroom outlets'}, {'subtask': 'Hook up lab outlets'}, {'subtask': 'Hook up extra outlets'}]}]}, {'epic': 'Plumbing', 'tasks': [{'task': 'Rough-In bathroom'}, {'task': 'Rough-In Utility sink in workshop'}]}, {'epic': 'Usable workshop', 'depends': [{'depends': 'Electrical complete'}, {'depends': 'Concrete Paint'}], 'tasks': [{'task': 'Insulation'}, {'task': 'Drywall'}, {'task': 'Plumbing'}]}]}]}
    }
  },
  components: {
    itemDetails: {
      name: 'item-details',
      props: ['item'],
      template: '<div>' + templateCode.depends + templateCode.isComplete + templateCode.notes + '</div>'
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

<template>
  <div class="Registration">
    <header>
      <div id="logo-area">
        <div id="logo" />
      </div>
      <div id="logo-stripe" />
      <div id="project-name-area">
        <h1 class="project-name"><span>Registration</span></h1>
      </div>
    </header>
    <div id="registration-form">
      <label for="fullName">What is your full name?</label>
      <input
        v-model="form.fullName"
        type="text"
        placeholder="Wilberforce Bartholemew Poppelwell"
        name="fullName"
        required>

      <label for="goesBy">What should we call you?</label>
      <input
        v-model="form.goesBy"
        type="text"
        placeholder="Bart"
        name="goesBy"
        required>

      <h2>Choose your identity</h2>

      <label for="email">e-mail</label>
      <input
        v-model="form.email"
        type="text"
        placeholder="wilberforce@poppelwell.com"
        name="email"
        required>
      <input
        v-model="form.emailMatch"
        type="text"
        placeholder="Confirm e-mail"
        name="emailMatch"
        required>

      <label for="username">Username</label>
      <input
        v-model="form.username"
        type="text"
        placeholder="wilberforce88"
        name="username"
        required>

      <label for="username">Password</label>
      <input
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="new-password"
        required>

      <label for="username">Confirm Password</label>
      <input
        v-model="form.passwordMatch"
        type="password"
        name="passwordMatch"
        autocomplete="new-password"
        required>
      <span class="password-entropy">{{ data.passwordEntropy }}</span>

      <label for="acceptsTerms">Accept terms</label>
      <input
        v-model="form.acceptsTerms"
        type="checkbox"
        name="acceptsTerms"
        required>

      <h2>Tell us about yourself</h2>

      TODO


      <div class="temp">{{ form.fullName }} &quot;{{ form.goesBy }}&quot;</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Main',
  components: {
  },
  data () {
    return {
      data: {
        passwordEntropy: 0
      },
      form: {
        fullName: '',
        goesBy: 'fuckyou',
        email: '',
        emailMatch: '',
        username: '',
        password: '',
        passwordMatch: '',
        acceptsTerms: false,
        country: '',
        state: '',
        city: ''
      }
    }
  },
  methods: {
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>

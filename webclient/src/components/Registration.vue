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
        type="text"
        placeholder="Wilberforce Bartholemew Poppelwell"
        name="fullName"
        v-model="form.fullName"
        required>

      <label for="goesBy">What should we call you?</label>
      <input
        type="text"
        placeholder="Bart"
        name="goesBy"
        v-model="form.goesBy"
        required>

      <h2>Choose your identity</h2>

      <label for="email">e-mail</label>
      <input
        type="text"
        placeholder="wilberforce@poppelwell.com"
        name="email"
        v-model="form.email"
        required>
      <input
        type="text"
        placeholder="Confirm e-mail"
        name="emailMatch"
        v-model="form.emailMatch"
        required>

      <label for="username">Username</label>
      <input
        type="text"
        placeholder="wilberforce88"
        name="username"
        v-model="form.username"
        required>

      <label for="username">Password</label>
      <input
        type="password"
        name="password"
        autocomplete="new-password"
        v-model="form.password"
        required>

      <label for="username">Confirm Password</label>
      <input
        type="password"
        name="passwordMatch"
        autocomplete="new-password"
        v-model="form.passwordMatch"
        required>
      <span class="password-entropy">{{ data.passwordEntropy }}</span>

      <label for="acceptsTerms">Accept terms</label>
      <input
        type="checkbox"
        name="acceptsTerms"
        v-model="form.acceptsTerms"
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

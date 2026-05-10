<script setup lang="ts">
  import { ref } from 'vue'
  const first_name = ref('John')
  const last_name  = ref('Doe')
  const email      = ref('john@example.com')
  const event_name = ref('Event Name')
  const date       = ref('')
  const address    = ref('')
  const lat        = ref(0)
  const long_       = ref(0)
  const comments   = ref('')
  const backend = ref("http://localhost:3033")
  const captcha_img = ref("")
  const captcha_token = ref('')
  const captcha_value = ref('')
  
  async function fetch_captcha() {
      console.log("e")
    try{
      const res = await fetch(backend.value + "/generate-captcha")
      const data = await res.json()
      captcha_token.value = data.captcha_token
      captcha_img.value = 'data:image/png;base64,' + data.image
    } catch (e) {
      console.error(e)
    }
  }
fetch_captcha()
</script>

<template>
  <h1>Create an event</h1>

  <form @submit.prevent="fetch_captcha">
    <div>
      <label for="first-name">First Name</label>
      <input id="first-name" type="text" value="John" v-model="first_name"/>

      <label for="last-name">Last Name</label>
      <input id="last-name" type="text" value="Doe" v-model="last_name"/>

      <label for="email">Email</label>
      <input id="email" type="email" value="john@example.com" v-model="email"/>

      <label for="event-name">Event Name</label>
      <input id="event-name" type="text" value="Event Name" v-model="event_name"/>

      <label for="date">Date</label>
      <input id="date" type="date" v-model="date"/>

      <label for="address">Address</label>
      <input id="address" type="text" v-model="address"/>

      <label for="lat">Latitude</label>
      <input id="lat" type="number" v-model="lat"/>

      <label for="long">Longitude</label>
      <input id="long" type="number" v-model="long_"/>

      <label for="comments">Comments</label>
      <textarea id="comments" v-model="comments"/>
    </div>
    <div>
      <label for="captcha">Captcha</label>
      <img :src="captcha_img"/>
      <input id="captcha" type="text" v-model="captcha_value" />
      <button @click="fetch_captcha()">Generate Captcha</button>
    </div>
  </form>


</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { router } from '../router.ts'

  const props = defineProps<{
    token?: String,
  }>()

  const is_token = ref(null)
  const is_errored = ref(false)
  const token_value = ref('')
  const event_data =  ref(null)

  watch (is_token, async (new_val) => {
    if (new_val)
      event_data.value = await fetch_event()
  })

  if (props.token == undefined) {
    is_token.value = false
  } else {
    token_value.value = props.token
    is_token.value = true
  }

  function redirect_with_token() {
    router.push({ path: '/event', query: { token: token_value.value } })
    is_token.value = true
  }

  async function fetch_event() {
    try {
      const res = await fetch('/api/getEvent?token=' + token_value.value)
      const data = await res.json()
      if (!res.ok) {
        is_errored.value = true
      }
      return data
    } catch(err) {
      console.log(err)
      is_errored.value = true
      return err
    }
  }


</script>
<template>
  <h1>Event</h1>

  <div v-if="!is_token">
    <form>
      <label for="token-in" type="text">Enter your token below</label>
      <input id="token-in" v-model="token_value" placeholder="Enter token" />
      <button @click="redirect_with_token()">Submit</button>
    </form>
  </div>
  <div v-else>
    <h2>Event Details</h2>
    <div v-if="!is_errored">
      {{ event_data }}
    </div>
    <div v-else>TOTO</div>
  </div>

</template>

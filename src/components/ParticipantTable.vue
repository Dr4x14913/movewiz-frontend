<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { router } from '../router'

interface Participant {
  firstName: string
  lastName: string
  mode: string
  latitude?: number
  longitude?: number
  phoneNumber?: string
  email?: string
  showEmail?: boolean
  contactToken?: string
  registrationDate?: string
  address?: string
}

const props = defineProps<{
  participants: Participant[],
  modelValue?: string,
}>()

const emit = defineEmits<{
  filtered: [participants: Participant[]]
  'update:modelValue': [value: string]
}>()

const searchQuery = ref(props.modelValue)
const modeFilter = ref('all')

const filteredParticipants = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  emit('update:modelValue', searchQuery.value)
  return props.participants.filter(p => {
    if (modeFilter.value !== 'all' && p.mode !== modeFilter.value) return false

    if (!query) return true

    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    const address = (p.address || '').toLowerCase()
    return name.includes(query) || address.includes(query)
  })
})

watch(filteredParticipants, (newval) => {
  emit('filtered', newval)
}, { immediate: true })

watch(() => props.modelValue, (newVal) => searchQuery.value = newVal)

function goSendMessage(token: string) {
  router.push({ path: '/sendMessage', query: { token } })
}
</script>

<template>
  <div class="participant-table">
    <div v-if="participants.length === 0" class="participant-table__empty">
      {{ $t('eventPage.participants.empty') }}
    </div>
    <div v-else>
      <div class="participant-table__filters">
        <div class="participant-table__search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('eventPage.participants.search')"
            class="participant-table__search"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="participant-table__clear" type="button">×</button>
        </div>
        <select v-model="modeFilter" class="participant-table__mode-filter">
          <option value="all">{{ $t('eventPage.participants.all') }}</option>
          <option value="driver">{{ $t('eventPage.participants.driver') }}</option>
          <option value="passenger">{{ $t('eventPage.participants.passenger') }}</option>
        </select>
      </div>
      <div class="participant-table__scroll">
        <table class="participant-table__table">
        <thead>
          <tr>
            <th>{{ $t('eventPage.participants.table.name') }}</th>
            <th>{{ $t('eventPage.participants.table.mode') }}</th>
            <th>{{ $t('eventPage.participants.table.phone') }}</th>
            <th>{{ $t('eventPage.participants.table.email') }}</th>
            <th>{{ $t('eventPage.participants.table.address') }}</th>
            <th>{{ $t('eventPage.participants.table.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in filteredParticipants" :key="idx">
          <td class="participant-table__name">
            <a href="#" @click.prevent="searchQuery = `${p.firstName} ${p.lastName}`">{{ p.firstName }} {{ p.lastName }}</a>
          </td>
          <td>
            <span :class="['participant-table__badge', p.mode === 'driver' ? 'participant-table__badge--driver' : 'participant-table__badge--passenger']">
              {{ p.mode === 'driver' ? $t('eventPage.participants.driver') : $t('eventPage.participants.passenger') }}
            </span>
          </td>
          <td class="participant-table__phone">
            <span v-if="p.phoneNumber">{{ p.phoneNumber }}</span>
            <span v-else class="participant-table__none">—</span>
          </td>
          <td class="participant-table__email">
            <span v-if="p.showEmail && p.email">{{ p.email }}</span>
            <span v-else>
              <button
                v-if="p.contactToken"
                @click="goSendMessage(p.contactToken)"
                class="participant-table__email-btn"
                :title="$t('sendMessage.hiddenEmailTooltip')"
                type="button"
              >{{ $t('sendMessage.buttonLabel') }}</button>
              <span v-else class="participant-table__none">—</span>
            </span>
          </td>
          <td class="participant-table__address">
            <span v-if="p.address">{{ p.address }}</span>
            <span v-else class="participant-table__none">—</span>
          </td>
          <td class="participant-table__date">
            <span v-if="p.registrationDate">{{ p.registrationDate }}</span>
            <span v-else class="participant-table__none">—</span>
          </td>
        </tr>
      </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<style scoped>
.participant-table__empty {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-medium);
  font-style: italic;
}

.participant-table__filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.participant-table__search-wrap {
  position: relative;
  flex: 1;
}

.participant-table__search {
  flex: 1;
  padding: 0.625rem 2.25rem 0.625rem 0.75rem;
  border: 1px solid var(--color-input-border);
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  background-color: var(--color-bg-cream);
  color: var(--color-text-dark);
  outline: none;
  transition: border-color 0.2s;
  width: 80%;
}

.participant-table__search:focus {
  border-color: var(--color-primary-green);
}

.participant-table__clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-text-medium);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.participant-table__clear:hover {
  color: var(--color-text-dark);
}

.participant-table__mode-filter {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-input-border);
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  background-color: var(--color-bg-cream);
  color: var(--color-text-dark);
  outline: none;
  cursor: pointer;
  min-width: 120px;
}

.participant-table__mode-filter:focus {
  border-color: var(--color-primary-green);
}

.participant-table__scroll {
  max-height: 400px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.participant-table__scroll::-webkit-scrollbar {
  height: 6px;
}

.participant-table__scroll::-webkit-scrollbar-track {
  background: var(--color-bg-cream);
}

.participant-table__scroll::-webkit-scrollbar-thumb {
  background: var(--color-secondary-green);
  border-radius: 3px;
}

.participant-table__table {
  min-width: 600px;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.participant-table__table th {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-text-medium);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--color-input-border);
}

.participant-table__table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--color-input-border);
  color: var(--color-text-dark);
  vertical-align: middle;
}

.participant-table__name a {
  font-weight: 600;
  color: var(--color-secondary-green);
  text-decoration: none;
  cursor: pointer;
}

.participant-table__name a:hover {
  text-decoration: underline;
}

.participant-table__badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.participant-table__badge--driver {
  background-color: var(--color-primary-green);
  color: white;
}

.participant-table__badge--passenger {
  background-color: var(--color-secondary-green);
  color: white;
}

.participant-table__none {
  color: var(--color-text-medium);
}

.participant-table__email-btn {
  background: none;
  border: 1px solid var(--color-primary-orange);
  border-radius: 50px;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-primary-orange);
  transition: background-color 0.2s, color 0.2s;
}

.participant-table__email-btn:hover {
  background-color: var(--color-primary-orange);
  color: white;
}

@media (max-width: 600px) {
  .participant-table__table {
    font-size: 0.8rem;
  }

  .participant-table__table th,
  .participant-table__table td {
    padding: 0.4rem 0.375rem;
  }
}
</style>

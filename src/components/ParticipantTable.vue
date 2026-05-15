<script setup lang="ts">
interface Participant {
  firstName: string
  lastName: string
  mode: string
  latitude?: number
  longitude?: number
  phoneNumber?: string
  email?: string
  showEmail?: boolean
  registrationDate?: string
  address?: string
}

defineProps<{
  participants: Participant[]
}>()
</script>

<template>
  <div class="participant-table">
    <div v-if="participants.length === 0" class="participant-table__empty">
      {{ $t('eventPage.participants.empty') }}
    </div>
    <div v-else class="participant-table__scroll">
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
        <tr v-for="(p, idx) in participants" :key="idx">
          <td class="participant-table__name">{{ p.firstName }} {{ p.lastName }}</td>
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
            <span v-else class="participant-table__none">—</span>
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
</template>

<style scoped>
.participant-table__empty {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-medium);
  font-style: italic;
}

.participant-table__scroll {
  overflow-x: auto;
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

.participant-table__name {
  font-weight: 600;
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

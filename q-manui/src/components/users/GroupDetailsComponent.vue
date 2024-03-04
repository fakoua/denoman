<template>
  <div>
    <div>Members</div>
    <div>
      <ul>
        <li v-for="member in group.members" :key="member">
          {{ member }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { GroupModel } from '../models';

export default defineComponent({
  name: 'GroupDetailsComponent',
  props: {
    group: {
      type: Object as PropType<GroupModel>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

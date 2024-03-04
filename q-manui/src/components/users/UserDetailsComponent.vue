<template>
  <div class="q-pa-md example-row-all-breakpoints">
    <div class="row">
      <div class="col-9">
        <div class="row q-mb-md">
          <div class="col">
            <div class="title">User</div>
            <div>
              {{ user.name }}
            </div>
          </div>
          <div class="col">
            <div class="title">Active</div>
            <div>
              {{ user.enabled ? 'Yes' : 'No' }}
            </div>
          </div>
          <div class="col">
            <div class="title">Requies password</div>
            <div>
              {{ user.passwordRequired ? 'Yes' : 'No' }}
            </div>
          </div>
        </div>
        <div class="row q-mb-md">
          <div class="col">
            <div class="title">Name</div>
            <div>
              {{ user.fullName }}
            </div>
          </div>
          <div class="col">
            <div class="title">Can change password</div>
            <div>
              {{ user.userMayChangePassword ? 'Yes' : 'No' }}
            </div>
          </div>
          <div class="col">
            <div class="title">Last logon</div>
            <div>
              {{ user.lastLogon }}
            </div>
          </div>
        </div>
        <div class="row q-mb-md">
          <div class="col">
            <div class="title">Password changed</div>
            <div>
              {{ user.passwordLastSet }}
            </div>
          </div>
          <div class="col">
            <div class="title">Password changeable</div>
            <div>
              {{ user.passwordChangeableDate }}
            </div>
          </div>
          <div class="col">
            <div class="title">Password expires</div>
            <div>
              {{ user.passwordExpires }}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="title">Description</div>
            <div>
              {{ user.description }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-3">
        <div>Member of</div>
        <div>
          <ul>
            <li v-for="group in user.groups" :key="group">
              {{ group }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.title {
  color: rgb(179, 179, 179);
  font-size: 12px;
}
</style>
<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { UserModel } from '../models';

export default defineComponent({
  name: 'UserDetailsComponent',
  props: {
    user: {
      type: Object as PropType<UserModel>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

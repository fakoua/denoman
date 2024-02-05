<template>
  <div class="div-form">
    <div v-if="isLoading">
      <q-skeleton type="text" width="150px" />
      <q-skeleton height="160px" />
      <q-separator class="q-mt-md q-mb-md" />
      <q-skeleton type="text" width="150px" />
      <q-skeleton type="text" width="130px" />
      <q-skeleton height="160px" />
    </div>
    <div class="q-gutter-md" v-if="!isLoading">
      <q-card class="card-height shadow-1">
        <q-card-section>
          <div class="small-font">This service depends on:</div>
          <q-tree
            :nodes="dependentsNode"
            node-key="name"
            label-key="caption"
            @lazy-load="onLazyLoad"
            no-nodes-label="No services"
          >
            <template v-slot:default-header="props">
              <div
                class="q-tree__node-header-content col row no-wrap items-center dm-font"
              >
                <q-icon
                  :name="props.node.icon"
                  :class="getStateColor(props.node.state)"
                />
                <div>{{ props.node.caption }}</div>
              </div>
            </template>
          </q-tree>
        </q-card-section>
      </q-card>
      <q-card class="card-height shadow-1">
        <q-card-section>
          <div class="small-font">
            The following services depend on this service:
          </div>
          <q-tree
            :nodes="antecedentsNode"
            node-key="name"
            label-key="caption"
            @lazy-load="onLazyLoadAntecedent"
            no-nodes-label="No system drivers"
          >
            <template v-slot:default-header="props">
              <div
                class="q-tree__node-header-content col row no-wrap items-center dm-font"
              >
                <q-icon
                  :name="props.node.icon"
                  :class="getStateColor(props.node.state)"
                />
                <div>{{ props.node.caption }}</div>
              </div>
            </template>
          </q-tree>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="css" scoped>
.service-running {
  color: green;
}
.service-stopped {
  color: red;
}
.card-height {
  height: 224px;
  overflow-y: auto;
}
.dm-font {
  font-size: 11px;
}
.small-font {
  font-size: 11px;
}
div.div-form {
  height: 460px !important;
}
</style>
<script lang="ts">
import { uid } from 'quasar';
import { PropType, defineComponent, onMounted, ref } from 'vue';

import * as serviceApi from '../service-api';

import { DependenciesModel, ServiceModel, TreeNodeDeps } from '../models';

export default defineComponent({
  name: 'DependenciesTabComponent',

  props: {
    service: {
      type: Object as PropType<ServiceModel>,
      required: false,
    },
  },

  methods: {
    getStateColor(state: string): string {
      return state === 'Running' ? 'service-running' : 'service-stopped';
    },
  },

  setup(props) {
    const isLoading = ref(true);
    const getNodeChildren = async (key: string): Promise<TreeNodeDeps[]> => {
      const name = key.split('@')[0];
      const services = await serviceApi.getServices();
      const deps = await serviceApi.getDependencies();
      if (services && deps) {
        const dependsOn: Array<DependenciesModel> = deps.filter(
          (v: DependenciesModel) => {
            return v.dependent == name;
          }
        );

        return dependsOn.map((v) => {
          const svr = (services as ServiceModel[]).find(
            (s: ServiceModel) => s.name == v.antecedent
          );
          return {
            caption: svr?.caption,
            name: `${v.antecedent}@${uid()}`,
            lazy: true,
            icon: svr?.isSystemDriver ? 'usb' : 'settings_suggest',
            state: svr?.state,
          } as TreeNodeDeps;
        });
      }
      return [];
    };

    const getNodeChildrenAntecedent = async (
      key: string
    ): Promise<TreeNodeDeps[]> => {
      const name = key.split('@')[0];
      const services = await serviceApi.getServices();
      const deps = await serviceApi.getDependencies();
      if (services && deps) {
        const antecedentsOn: Array<DependenciesModel> = deps.filter(
          (v: DependenciesModel) => {
            return v.antecedent == name;
          }
        );

        return antecedentsOn.map((v) => {
          const svr = (services as ServiceModel[]).find(
            (s: ServiceModel) => s.name == v.dependent
          );
          return {
            caption: svr?.caption,
            name: `${v.dependent}@${uid()}`,
            lazy: true,
            icon: svr?.isSystemDriver ? 'usb' : 'settings_suggest',
            state: svr?.state,
          } as TreeNodeDeps;
        });
      }
      return [];
    };

    onMounted(async () => {
      dependentsNode.value = await getNodeChildren(
        `${props.service?.name}@root`
      );
      antecedentsNode.value = await getNodeChildrenAntecedent(
        `${props.service?.name}@root`
      );
      isLoading.value = false;
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onLazyLoad = async ({ key, done }) => {
      const children = await getNodeChildren(key);
      done(children);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onLazyLoadAntecedent = async ({ key, done }) => {
      const children = await getNodeChildrenAntecedent(key);
      done(children);
    };

    const dependentsNode = ref<TreeNodeDeps[]>([]);
    const antecedentsNode = ref<TreeNodeDeps[]>([]);

    return {
      onLazyLoad,
      onLazyLoadAntecedent,
      dependentsNode,
      antecedentsNode,
      isLoading,
    };
  },
});
</script>

<script setup lang="ts">
import type { Rule, Duty, Consequence, Target } from "../types";

import { watch } from "vue";

import { useTarget, type Props } from "../composables/useTarget";

import { ODRL } from "../../../server/src/namespaces";
import assetTypes from "../shared/assetTypes";

import GroupConstraints from "./GroupConstraints.vue";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})
const initialTarget = defineModel<Target>("target")
const parent = defineModel<Rule | Duty | Consequence>("parent", { required: true })

const {
  assetType,
  uri,
  target,
  additionalData
} = useTarget(props, parent, initialTarget)

/*watch(
  [uri],
  ([newURI]) => {
    const index = parent.value.targets.findIndex(
      (target: any) => target.id === target.id
    );

    if (index < 0) {
      if (newURI) {
        parent.value.targets.push(target as any)
      }
    } else {
      if (
        newURI == null ||
        newURI === ""
      ) {
        parent.value.targets.splice(index, 1);
      }
    }
  }
);*/

watch(uri, (newURI) => {
  if (assetType.value === ODRL("Asset").value) {
    target.source = null
    target.uid = newURI !== "" ? newURI : null
  } else {
    target.uid = null
    target.source = newURI !== "" ? newURI : null
  }
})

watch(assetType, (newType) => {
  if (newType === ODRL("Asset").value) {
    target.uid = target.source
    target.source = null
  } else {
    target.source = target.uid
    target.uid = null
  }
})
</script>

<template>
  <p>
    <label>Type</label>
    <select v-model="assetType">
      <template v-for="(type, index) in assetTypes" :key="index">
        <option :value="ODRL(type).value">{{ type }}</option>
      </template>
    </select>
    <br />
    <label>URI</label>
    <!--<input v-if="initialTarget" v-model="initialTarget.uid" />-->
    <input v-model="uri" />
  </p>

  <p>
    <ul>
      <li><h3>Refinements</h3></li>
      <group-constraints
        v-model:parent="target"
        v-model:constraints="target.refinements"
        parentType="target"
        :additionalData="additionalData"
      >
      </group-constraints>
    </ul>
  </p>
</template>

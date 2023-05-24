<script setup lang="ts">
import type { Obligation, Duty } from "../types";

import { ref, computed, watch } from "vue";
import { string } from "@poppinss/utils/build/helpers";

import useGetRandomID from "../composables/useGetRandomID";

import parties from "../shared/parties";

import Action from "./Action.vue";

const props = defineProps<{
  parent: Obligation | Duty;
  parentType: "obligation" | "duty";
  additionalData?: {};
}>();

const partyType = ref();
const partyURI = ref(null);

const consequence = {
  id: useGetRandomID(),
  policy_id: props.parent.policy_id,
  actions: [],
  targets: [],
  ...props.additionalData
};

const data: { consequence_id: number; duty_id?: number } = {
  consequence_id: consequence.id
};

if (props.parentType === "duty") {
  data.duty_id = props.parent.id;
}

watch([partyType], ([newPartyType]) => {
  const parent = props.parent;
  const index = parent.consequences.findIndex(
    (_consequence) => _consequence.id === consequence.id
  );

  if (index > -1) {
    parent.consequences[index] = {
      ...consequence,
      [string.snakeCase(newPartyType)]: partyURI
    };
  } else {
    parent.consequences.push({
      ...consequence,
      [string.snakeCase(newPartyType)]: partyURI
    });
  }
});
</script>

<template>
  <p>
    <action
      :parent="consequence"
      :allowRefinements="false"
      :data="data"
      parentType="consequence"
    />
  </p>
  <p>
    <label>Function</label>
    <select v-model="partyType">
      <template v-for="(party, index) in parties" :key="index">
        <option :value="party">{{ party }}</option>
      </template>
    </select>
  </p>

  <p>
    <label>URI</label>
    <input v-model="partyURI" type="text" />
  </p>
</template>

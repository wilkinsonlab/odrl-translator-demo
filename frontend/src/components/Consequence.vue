<script setup lang="ts">
import type { Obligation, Duty, Consequence } from "../types";

import { ref, markRaw, watch } from "vue";
import { string } from "@poppinss/utils/build/helpers";

import useGetRandomID from "../composables/useGetRandomID";

import parties from "../shared/parties";

import Action from "./Action.vue";

const props = defineProps<{
  //parent: Obligation | Duty;
  parentType: "obligation" | "duty";
  additionalData?: {};
}>();
const parent = defineModel<Obligation | Duty>("parent", { required: true });
const initialConsequence = defineModel<Consequence>("consequence");

const actions = ref(
  initialConsequence?.value
    ? new Array(initialConsequence?.value?.actions.length).fill(markRaw(Action))
    : [markRaw(Action)]
);

const partyType = ref();
const partyURI = ref(null);

const consequence = {
  id: useGetRandomID(),
  policy_id: parent.value.policy_id,
  actions: [],
  targets: [],
  ...props.additionalData
};

const rule_id =
initialConsequence?.value?.rule_id ?? parent.value.id;

const data: { consequence_id: number; duty_id?: number } = {
  consequence_id: consequence.id
};

if (props.parentType === "duty") {
  data.duty_id = parent.value.id;
}

function addAction() {
  actions.value.push(markRaw(Action));
}

function removeAction(index: number) {
  actions.value.splice(index, 1);
  consequence.actions.splice(index, 1);
}

watch([partyType], ([newPartyType]) => {
  const index = parent.value.consequences.findIndex(
    (_consequence) => _consequence.id === consequence.id
  );

  if (index > -1) {
    parent.value.consequences[index] = {
      ...consequence,
      [string.snakeCase(newPartyType)]: partyURI
    };
  } else {
    parent.value.consequences.push({
      ...consequence,
      [string.snakeCase(newPartyType)]: partyURI
    });
  }
});
</script>

<template>
  <p>
    <ul>
      <li><h4>Consequence actions</h4></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(action, index) in actions" :key="index">
            <h4>
              Action {{ index + 1 }}
              <span
                @click="removeAction(index)"
                class="remove"
                >X</span
              >
            </h4>
            <component
              v-if="initialConsequence"
              :is="action"
              v-model:action="initialConsequence.actions[index]"
              v-model:parent="initialConsequence"
              parentType="consequence"
              :data="data"
            ></component>
            <component
              v-else
              :is="action"
              v-model:action="consequence.actions[index]"
              v-model:parent="consequence"
              parentType="consequence"
              :data="data"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addAction">
            + Add consequence action
          </li>
        </ul>
      </li>
    </ul>
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

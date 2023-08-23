<script setup lang="ts">
import type { Consequence, Duty, Rule, Action } from "../types";

import { computed } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import actions from "../shared/actions"
import occeActions from "../shared/occeActions"
import cces from "../shared/cces"

import { useAction, type Props } from "../composables/useAction";

import GroupConstraints from "./GroupConstraints.vue";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})
const initialAction = defineModel<Action>("action")
const parent = defineModel<Rule | Duty | Consequence>("parent", { required: true })

const {
  actionValue,
  action,
  additionalData
} = useAction(props, parent, initialAction)

const filter = (initialObject, keys) => {
  return Object.keys(initialObject)
  .filter(key => keys.includes(key))
  .reduce((result, key) => {
    result[key] = initialObject[key];

    return result;
  }, {});
}

const $actions = computed(() => {
  const mergedActions = Object.assign({}, occeActions, actions.reduce((obj, action) => {
    obj[action] = ODRL(action).value

    return obj
  }, {}))
  const $parent = parent.value

  if ('cce' in $parent) {
    if ([
      'geographical_area',
      'regulatory_jurisdiction',
      'research_use',
      'clinical_care',
      'clinical_research_use',
      'disease_specific_use',
      'use_as_control',
      'profit_motivated_use',
      'time_period',
      'ethics_approval',
      'user_authentication'
    ].includes($parent.cce)) {
      return filter(mergedActions, ['use'])
    } else if (['return_of_results', 'return_of_incidental_findings'].includes($parent.cce)) {
      return filter(mergedActions, ['share'])
    } else if ($parent.cce === 'commercial_entity') {
      return filter(mergedActions, ['CommercialUse', 'use'])
    } else if ($parent.cce === 'collaboration') {
      return filter(mergedActions, ['inform', 'Attribution', 'share', 'Collaboration'])
    } else if ($parent.cce === 'fees') {
      return filter(mergedActions, ['compensate'])
    } else if (['reidentification_of_individuals_without_irp', 'reidentification_of_individuals_with_irp'].includes($parent.cce)) {
      return filter(mergedActions, ['De-Anonymize'])
    }  else if (['publication_moratorium', 'publication'].includes($parent.cce)) {
      return filter(mergedActions, ['share', 'PublishData', 'Publication'])
    }
  }

  return mergedActions
})
</script>

<template>
  <p>
    <label>Action</label>
    <select v-model="actionValue">
      <template v-for="(uri, action) in $actions" :key="action">
        <option :value="uri">{{ action }}</option>
      </template>
    </select>
  </p>

  <p v-if="allowRefinements">
    <h3>Refinements</h3>

    <group-constraints
      v-model:parent="action"
      v-model:constraints="action.refinements"
      parentType="action"
      :additionalData="additionalData"
    >
    </group-constraints>
  </p>
</template>

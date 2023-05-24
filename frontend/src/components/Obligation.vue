<script setup lang="ts">
import type { Duty, Permission, Prohibition } from "../types";

import { useObligation, type Props } from "../composables/useObligation";

const props = withDefaults(defineProps<Props>(), {
  allowConsequences: true
});

const {
  targets,
  actions,
  assignees,
  constraints,
  consequences,
  addTarget,
  removeTarget,
  addAction,
  removeAction,
  addAssignee,
  removeAssignee,
  addConstraint,
  removeConstraint,
  addConsequence,
  removeConsequence,
  obligation
} = useObligation(props);

const childrenParentType = props.parent
  ? props.parentType === "permission"
    ? "duty"
    : "remedy"
  : ("rule" as "duty" | "remedy" | "rule");
const childrenData = props.parent
  ? props.parentType === "permission"
    ? { duty_id: obligation.id }
    : { remedy_id: obligation.id }
  : {};
</script>

<template>
  <section>
    <ul>
      <li><h3 class="title">Targets</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(target, index) in targets" :key="target.name">
            <h4>
              Target {{ index + 1 }}
              <span
                v-if="targets.length > 1"
                @click="removeTarget(index)"
                class="remove"
                >X</span
              >
            </h4>
            <component
              :is="target"
              :parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addTarget">
            + Add {{ parentType }} target
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li><h3>Actions</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(action, index) in actions" :key="action.name">
            <h4>
              Action {{ index + 1 }}
              <span
                v-if="actions.length > 1"
                @click="removeAction(index)"
                class="remove"
                >X</span
              >
            </h4>
            <component
              :is="action"
              :parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addAction">
            + Add duty action
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li><h3>Assignees</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(assignee, index) in assignees" :key="assignee.name">
            <h4>
              Assignee {{ index + 1 }}
              <span @click="removeAssignee(index)" class="remove">X</span>
            </h4>
            <component
              :is="assignee"
              :parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addAssignee">
            + Add duty assignee
          </li>
        </ul>
      </li>
    </ul>

    <ul v-if="allowConsequences">
      <li><h3>Consequences</h3></li>
      <li class="no-list-style">
        <ul>
          <li
            v-for="(consequence, index) in consequences"
            :key="consequence.name"
          >
            <h4>
              Consequence {{ index + 1 }}
              <span @click="removeConsequence(index)" class="remove">X</span>
            </h4>
            <component
              :is="consequence"
              :parent="(obligation as any)"
              :parentType="parent ? 'duty' : 'obligation'"
              :additionalData="
                parent
                  ? {
                      rule_id: parent.id ?? obligation.id,
                      ...(parent ? { duty_id: obligation.id } : {})
                    }
                  : {}
              "
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addConsequence">
            + Add {{ parent ? "duty" : "obligation" }} consequence
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li><h3>Constraints</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(constraint, index) in constraints" :key="constraint.name">
            <h4>
              Constraint {{ index + 1 }}
              <span @click="removeConstraint(index)" class="remove">X</span>
            </h4>
            <component
              :is="constraint"
              :parent="obligation"
              :additionalData="{
                rule_id: parent?.id,
                ...(parent ? { duty_id: obligation.id } : {})
              }"
              constraintKey="constraints"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addConstraint">
            + Add {{ parent ? "duty" : "obligation" }} constraint
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<style></style>

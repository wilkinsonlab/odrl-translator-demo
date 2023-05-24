import type { Obligation, Permission, Policy, Prohibition } from "../types";

import { ref, reactive, computed } from "vue";
import useGetRandomID from "./useGetRandomID";
import { ODRL } from "../../../server/src/namespaces";

const policies = ref({
  policies: [] as any
});

const policy = reactive({
  id: useGetRandomID(),
  type: ODRL("Set").value,
  creator: null,
  description: "",
  rules: {
    permissions: [] as Array<Permission>,
    prohibitions: [] as Array<Prohibition>,
    obligations: [] as Array<Obligation>
  },
  references: [] as Array<any>
});

policies.value.policies.push(policy);

const done = ref(false);

function onDone() {
  done.value = true;
}

export default (function () {
  return () => {
    return {
      policy,
      onDone,
      done,
      policies
    };
  };
})();

import { createRouter, createWebHistory } from "vue-router";
import Index from "@/pages/Index.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Index
    },
    {
      path: "/policy_creator",
      component: () => import("@/pages/PolicyCreator.vue")
    }
  ]
});

import { createRouter, createWebHistory } from "vue-router";

import HomePage from "@/pages/HomePage.vue";
import OrdersPending from "@/pages/OrdersPending.vue";


const routes = [
  { path: "/", component: HomePage },
  { path: "/orders/pending", component: OrdersPending },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
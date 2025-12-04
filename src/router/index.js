import { createRouter, createWebHistory } from "vue-router";

import HomePage from "@/pages/HomePage.vue";
import OrdersPending from "@/pages/OrdersPending.vue";
import PickupOrder from "@/pages/PickupOrder.vue";
import DeliveryOrder from "@/pages/DeliveryOrder.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/orders/pending", component: OrdersPending },
  { path: "/PickupOrder", component: PickupOrder },
  { path: "/DeliveryOrder", component: DeliveryOrder },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
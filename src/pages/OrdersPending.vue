<template>
  <v-container class="container">

    <h1 class="title">Available Orders</h1>
    <span class="subtitle">Choose your next race</span>

    <div class="orders-wrapper">
      <div
        v-for="order in orders"
        :key="order._id"
        class="order-card"
        @click="openModal(order)"
      >
        <h2 class="order-title">Pedido {{ order.destinyLoc }}</h2>
        <p class="order-client">Cliente: {{ order.idClient?.name || "—" }}</p>
      </div>
    </div>

    <OrdersModal
      v-if="selectedOrder"
      :order="selectedOrder"
      v-model:show="showModal"
      @accept="acceptOrder"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getPendingOrders } from "../services/api.js";
import OrdersModal from "../components/OrdersModal.vue";

const orders = ref([]);
const selectedOrder = ref(null);
const showModal = ref(false);

async function loadOrders() {
  try {
    const data = await getPendingOrders();
    orders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Erro ao buscar pedidos pendentes:", err);
  }
}

onMounted(() => {
  loadOrders();
});

function openModal(order) {
  selectedOrder.value = order;
  showModal.value = true;
}

async function acceptOrder() {
  try {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/order/${selectedOrder.value._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ accept: true }),
    });

    showModal.value = false;
    selectedOrder.value = null;
    await loadOrders();

  } catch (err) {
    console.error("Erro ao aceitar pedido:", err);
  }
}
</script>

<style scoped>
/* Fundo da tela */
.container {
  min-height: 100vh;
  padding-top: 30px;
  background: #14149c;
  background: linear-gradient(90deg, rgba(20, 20, 156, 1) 0%, rgba(25, 25, 77, 1) 100%);
  color: white !important;
}

/* Títulos */
.title {
  color: white;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  color: #ddd;
  font-size: 16px;
  margin-bottom: 20px;
}

/* Wrapper das orders */
.orders-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Cada pedido */
.order-card {
  border: 2px solid rgba(255, 255, 255, 0.35);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: 0.2s ease;
}

.order-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.02);
}

/* Textos cada card */
.order-title {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.order-client {
  margin: 5px 0 0;
  color: white;
  opacity: 0.8;
  font-size: 14px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
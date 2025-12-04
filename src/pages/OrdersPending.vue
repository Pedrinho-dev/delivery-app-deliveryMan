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
        <h2 class="order-title">
          Pedido {{ order.destinyLoc || "(Sem destino)" }}
        </h2>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getPendingOrders } from "../services/api.js";
import OrdersModal from "../components/OrdersModal.vue";
import { loadGoogleMaps } from "../composables/useGoogleMaps.js";
import { useOrderStore } from "../stores/orderStore.js";

const router = useRouter();
const orderStore = useOrderStore();

const orders = ref([]);
const selectedOrder = ref(null);
const showModal = ref(false);
let pollingInterval = null;

async function loadOrders() {
  try {
    const data = await getPendingOrders();
    orders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Erro ao buscar pedidos pendentes:", err);
  }
}

function startPolling() {
  pollingInterval = setInterval(() => {
    loadOrders();
  }, 1000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

onMounted(() => {
  loadOrders();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});

function openModal(order) {
  selectedOrder.value = order;
  showModal.value = true;
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true }
    );
  });
}

async function getAddressFromCoordinates(lat, lng) {
  try {
    const gm = await loadGoogleMaps();
    const geocoder = new gm.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          const fullAddress = results[0].formatted_address;
          resolve(fullAddress);
        } else {
          reject(new Error("Não foi possível obter o endereço"));
        }
      });
    });
  } catch (err) {
    console.error("Erro ao buscar endereço:", err);
    return `${lat}, ${lng}`;
  }
}

async function acceptOrder() {
  try {
    const userToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjIyYTY5YmQyYzk5ZGNhY2MzM2YyZCIsImlhdCI6MTc2NDg4NjQwNywiZXhwIjoxNzY0ODkzNjA3fQ.n0JWG2V3xjAwMvUmEzT_CHI41AvMiAPMwMe4DSSQei8";
    const token = userToken;

    if (!token) {
      console.warn("Nenhum token encontrado. A requisição pode falhar.");
    }

    let locDeliveryMan = "Localização desconhecida";

    // Tentar obter localização atual do motorista, mas não impedir o fluxo se falhar
    try {
      const location = await getCurrentLocation();
      locDeliveryMan = await getAddressFromCoordinates(
        location.lat,
        location.lng
      );
    } catch (geoErr) {
      console.warn(
        "Não foi possível obter a localização do motorista:",
        geoErr
      );
    }

    const response = await fetch(
      `http://localhost:3000/order/${selectedOrder.value._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          accept: true,
          locDeliveryMan: locDeliveryMan,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro do servidor:", errorData);
      throw new Error("Erro ao aceitar pedido");
    }

    const updatedOrder = await response.json();
    console.log("Pedido atualizado:", updatedOrder);

    // Salvar o pedido na store
    orderStore.setCurrentOrder(updatedOrder);

    showModal.value = false;
    selectedOrder.value = null;

    // Redirecionar para a página de buscar pedido (motorista -> cliente)
    router.push("/PickupOrder");
  } catch (err) {
    console.error("Erro ao aceitar pedido:", err);
    alert("Erro ao aceitar pedido. Tente novamente.");
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-top: 30px;
  background: #14149c;
  background: linear-gradient(
    90deg,
    rgba(20, 20, 156, 1) 0%,
    rgba(25, 25, 77, 1) 100%
  );
  color: white !important;
}

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

.orders-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

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

<template>
  <v-container class="container">
    <h1 class="title">Indo buscar o pedido</h1>

    <div v-if="order" class="order-info">
      <v-card class="mb-4">
        <v-card-text>
          <h3>Informações do Pedido</h3>
          <p><b>Cliente:</b> {{ order.idClient?.name || "—" }}</p>
          <p><b>Status:</b> Indo buscar o pedido no cliente</p>
          <p><b>Origem:</b> {{ originAddress }}</p>
          <p><b>Destino:</b> {{ destinationAddress }}</p>
        </v-card-text>
      </v-card>

      <div class="map-container">
        <MapRoute
          v-if="origin && destination"
          :origin="origin"
          :destination="destination"
        />
      </div>

      <v-btn
        color="primary"
        size="large"
        block
        class="mt-4"
        @click="confirmPickup"
      >
        Pedido retirado - Ir para entrega
      </v-btn>
    </div>

    <div v-else class="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Carregando informações do pedido...</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import MapRoute from "../components/MapRoute.vue";
import { loadGoogleMaps } from "../composables/useGoogleMaps.js";
import { useOrderStore } from "../stores/orderStore.js";

const router = useRouter();
const orderStore = useOrderStore();

const origin = ref(null);
const destination = ref(null);
const originAddress = ref("—");
const destinationAddress = ref("—");

const order = computed(() => orderStore.currentOrder);

function parseCoords(str) {
  if (!str) return null;
  if (typeof str === "string") {
    const parts = str.split(",").map((s) => s.trim());
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

async function getAddressFromCoordinates(lat, lng) {
  try {
    const gm = await loadGoogleMaps();
    const geocoder = new gm.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error("Não foi possível converter as coordenadas"));
        }
      });
    });
  } catch (err) {
    console.error("Erro ao buscar endereço:", err);
    return `${lat}, ${lng}`;
  }
}

async function getCoordinatesFromAddress(address) {
  try {
    const gm = await loadGoogleMaps();
    const geocoder = new gm.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error("Não foi possível converter o endereço"));
        }
      });
    });
  } catch (err) {
    console.error("Erro ao buscar coordenadas:", err);
    return null;
  }
}

async function loadMapRoute() {
  if (!order.value) return;

  // Rota: Motorista -> Cliente
  let driverCoords = parseCoords(order.value.locDeliveryMan);

  // Se não for coordenada direta, tenta geocodificar o endereço
  if (!driverCoords && order.value.locDeliveryMan) {
    driverCoords = await getCoordinatesFromAddress(order.value.locDeliveryMan);
  }

  const clientLoc = parseCoords(order.value.clientLoc);

  if (driverCoords && clientLoc) {
    origin.value = driverCoords;
    destination.value = clientLoc;

    // Se locDeliveryMan já era endereço, usa ele. Se era coord, tenta converter (ou usa a string crua se falhar)
    if (
      order.value.locDeliveryMan &&
      !parseCoords(order.value.locDeliveryMan)
    ) {
      originAddress.value = order.value.locDeliveryMan;
    } else {
      originAddress.value = await getAddressFromCoordinates(
        driverCoords.lat,
        driverCoords.lng
      );
    }

    destinationAddress.value = await getAddressFromCoordinates(
      clientLoc.lat,
      clientLoc.lng
    );
  } else {
    console.error("Coordenadas inválidas:", { driverCoords, clientLoc });
  }
}

async function confirmPickup() {
  try {
    if (!order.value) return;

    await orderStore.updateOrderFinalLoc(order.value._id);

    // Redirecionar para a página de entrega (cliente -> destino)
    router.push("/DeliveryOrder");
  } catch (err) {
    console.error("Erro ao confirmar retirada:", err);
    alert("Erro ao atualizar status do pedido");
  }
}

onMounted(async () => {
  if (!orderStore.hasCurrentOrder) {
    alert("Nenhum pedido selecionado");
    router.push("/orders/pending");
    return;
  }

  await loadMapRoute();
});
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
  color: white;
}

.title {
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
}

.order-info {
  max-width: 800px;
  margin: 0 auto;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  height: 400px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.loading p {
  color: white;
  font-size: 18px;
}
</style>

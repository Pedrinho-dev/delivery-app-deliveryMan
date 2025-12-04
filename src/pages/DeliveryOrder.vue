<template>
    <v-container class="container">
        <h1 class="title">Realizando entrega</h1>

        <div v-if="order" class="order-info">
            <v-card class="mb-4">
                <v-card-text>
                    <h3>Informações do Pedido</h3>
                    <p><b>Cliente:</b> {{ order.idClient?.name || "—" }}</p>
                    <p><b>Status:</b> A caminho do destino final</p>
                    <p><b>Origem:</b> {{ originAddress }}</p>
                    <p><b>Destino Final:</b> {{ destinationAddress }}</p>
                </v-card-text>
            </v-card>

            <div class="map-container">
                <MapRoute v-if="origin && destination" :origin="origin" :destination="destination" />
            </div>

            <v-btn color="success" size="large" block class="mt-4" @click="completeDelivery">
                Entrega concluída
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

async function loadMapRoute() {
    if (!order.value) return;

    // Rota: Cliente -> Destino Final
    const clientLoc = parseCoords(order.value.clientLoc);
    const destLoc = parseCoords(order.value.destinyLoc);

    if (clientLoc && destLoc) {
        origin.value = clientLoc;
        destination.value = destLoc;

        originAddress.value = await getAddressFromCoordinates(clientLoc.lat, clientLoc.lng);
        destinationAddress.value = await getAddressFromCoordinates(destLoc.lat, destLoc.lng);
    } else {
        console.error("Coordenadas inválidas:", { clientLoc, destLoc });
    }
}

async function completeDelivery() {
    try {
        // Limpar o pedido da store
        orderStore.clearCurrentOrder();

        alert("Entrega concluída com sucesso!");

        // Voltar para a lista de pedidos
        router.push("/orders/pending");
    } catch (err) {
        console.error("Erro ao concluir entrega:", err);
        alert("Erro ao finalizar entrega");
    }
}

onMounted(async () => {
    if (!orderStore.hasCurrentOrder) {
        alert("Nenhum pedido selecionado");
        router.push("/orders/pending");
        return;
    }

    if (!order.value.finalLoc) {
        alert("Pedido ainda não foi retirado");
        router.push("/PickupOrder");
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
    background: linear-gradient(90deg, rgba(20, 20, 156, 1) 0%, rgba(25, 25, 77, 1) 100%);
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
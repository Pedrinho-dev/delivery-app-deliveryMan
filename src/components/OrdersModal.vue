<template>
  <v-dialog
    :model-value="show"
    @update:model-value="emit('update:show', $event)"
    max-width="600px"
  >
    <v-card>
      <v-card-title> Pedido #{{ order._id }} </v-card-title>

      <v-card-text>
        <h3>Cliente</h3>
        <p><b>Nome:</b> {{ order.idClient?.name }}</p>

        <h3 class="mt-3">Localização</h3>
        <p><b>Client:</b> {{ order.clientLoc || "Endereço não informado" }}</p>
        <p>
          <b>Destino final:</b>
          {{ order.destinyLoc || "Endereço não informado" }}
        </p>

        <v-divider class="my-3" />

        <h3>Distância</h3>
        <p>{{ distance }}</p>

        <v-divider class="my-3" />

        <h3>Rota no Mapa</h3>

        <MapRoute
          v-if="originObj && destObj"
          :origin="originObj"
          :destination="destObj"
        />
        <div v-else class="text-center text-grey my-4">
          Mapa indisponível (endereços faltando)
        </div>
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" @click="accept">Aceitar</v-btn>
        <v-btn color="secondary" @click="emit('update:show', false)"
          >Fechar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import MapRoute from "./MapRoute.vue";
import { loadGoogleMaps } from "../composables/useGoogleMaps";

const props = defineProps({
  order: { type: Object, required: true },
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["update:show", "accept"]);

const distance = ref("...");
const clientCoordsText = ref("");
const destCoordsText = ref("");

const originObj = ref(null);
const destObj = ref(null);

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
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.error("Erro ao buscar coordenadas:", err);
    return null;
  }
}

async function calculateDistance() {
  let clientLoc = parseCoords(props.order.clientLoc);
  if (!clientLoc && props.order.clientLoc) {
    clientLoc = await getCoordinatesFromAddress(props.order.clientLoc);
  }

  let destLoc = parseCoords(props.order.destinyLoc);
  if (!destLoc && props.order.destinyLoc) {
    destLoc = await getCoordinatesFromAddress(props.order.destinyLoc);
  }

  // Atualizar refs apenas se tiver dados válidos
  if (clientLoc) originObj.value = clientLoc;
  if (destLoc) destObj.value = destLoc;

  clientCoordsText.value = clientLoc
    ? `${clientLoc.lat}, ${clientLoc.lng}`
    : "—";
  destCoordsText.value = destLoc ? `${destLoc.lat}, ${destLoc.lng}` : "—";

  if (!clientLoc || !destLoc) {
    distance.value = "N/A";
    return;
  }

  try {
    const gm = await loadGoogleMaps();
    const service = new gm.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [new gm.LatLng(clientLoc.lat, clientLoc.lng)],
        destinations: [new gm.LatLng(destLoc.lat, destLoc.lng)],
        travelMode: "DRIVING",
      },
      (res) => {
        distance.value = res?.rows?.[0]?.elements?.[0]?.distance?.text || "N/A";
      }
    );
  } catch (err) {
    console.error("Erro GoogleMaps:", err);
    distance.value = "N/A";
  }
}

watch(
  () => props.order,
  () => calculateDistance(),
  { immediate: true }
);

function accept() {
  emit("accept");
  emit("update:show", false);
}
</script>

<style scoped></style>

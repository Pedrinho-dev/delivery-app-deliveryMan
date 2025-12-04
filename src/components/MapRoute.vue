<template>
  <div ref="mapRef" class="map"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { loadGoogleMaps } from "../composables/useGoogleMaps";

const props = defineProps({
  origin: { type: Object, required: true },
  destination: { type: Object, required: true },
});

const mapRef = ref(null);
let map = null;
let directionsService = null;
let directionsRenderer = null;

async function initMap() {
  const gm = await loadGoogleMaps();

  map = new gm.Map(mapRef.value, {
    zoom: 14,
    center: props.origin,
  });

  directionsService = new gm.DirectionsService();
  directionsRenderer = new gm.DirectionsRenderer();
  directionsRenderer.setMap(map);

  drawRoute();
}

function drawRoute() {
  if (!directionsService || !props.origin || !props.destination) return;

  directionsService.route(
    {
      origin: props.origin,
      destination: props.destination,
      travelMode: "DRIVING",
    },
    (result, status) => {
      if (status === "OK") directionsRenderer.setDirections(result);
    }
  );
}

onMounted(initMap);

watch(() => [props.origin, props.destination], drawRoute, { deep: true });
</script>

<style scoped>
.map {
  width: 100%;
  height: 300px;
  border-radius: 12px;
}
</style>

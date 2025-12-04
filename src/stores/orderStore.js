import { defineStore } from "pinia";

export const useOrderStore = defineStore("order", {
  state: () => ({
    currentOrder: null,
  }),

  actions: {
    setCurrentOrder(order) {
      this.currentOrder = order;
    },

    clearCurrentOrder() {
      this.currentOrder = null;
    },

    async fetchOrder(orderId) {
      try {
        // TODO: Adicione um token válido aqui se não houver login no app
        const userToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjIyYTY5YmQyYzk5ZGNhY2MzM2YyZCIsImlhdCI6MTc2NDg4NjQwNywiZXhwIjoxNzY0ODkzNjA3fQ.n0JWG2V3xjAwMvUmEzT_CHI41AvMiAPMwMe4DSSQei8";
        const token = userToken;

        const response = await fetch(`https://delivery-app-api-pi.vercel.app/order/${orderId}`, {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar pedido");
        }

        this.currentOrder = await response.json();
        return this.currentOrder;
      } catch (err) {
        console.error("Erro ao carregar pedido:", err);
        throw err;
      }
    },

    async updateOrderFinalLoc(orderId) {
      try {
        // TODO: Adicione um token válido aqui se não houver login no app
        const userToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjIyYTY5YmQyYzk5ZGNhY2MzM2YyZCIsImlhdCI6MTc2NDg4NjQwNywiZXhwIjoxNzY0ODkzNjA3fQ.n0JWG2V3xjAwMvUmEzT_CHI41AvMiAPMwMe4DSSQei8";
        const token = userToken;

        const response = await fetch(`http://localhost:3000/order/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            finalLoc: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar pedido");
        }

        const updatedOrder = await response.json();
        this.currentOrder = updatedOrder;
        return updatedOrder;
      } catch (err) {
        console.error("Erro ao atualizar pedido:", err);
        throw err;
      }
    },
  },

  getters: {
    hasCurrentOrder: (state) => state.currentOrder !== null,
    orderStatus: (state) => {
      if (!state.currentOrder) return "—";
      if (!state.currentOrder.finalLoc) return "Indo buscar o pedido";
      return "A caminho do destino final";
    },
  },
});

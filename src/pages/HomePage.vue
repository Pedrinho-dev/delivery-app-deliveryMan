<template>
    <div class="container">
        <img src="../assets/logoAppDelivery.png" alt="">
        <h1>FoodDelivery</h1>
        <h4>The best delivery app on the market.</h4>
        <button @click="irParaProxima" class="btn-continuar">Continuar -> </button>
    </div>
</template>

<script>
export default {
    name: "HomePage",
    methods: {
        irParaProxima() {
            this.$router.push("/orders/pending")
        }
    }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background: #14149c;
  background: linear-gradient(90deg, rgba(20, 20, 156, 1) 0%, rgba(25, 25, 77, 1) 100%);
}

img{
    height: 120px;
}

h1{
  font-size: 32px;
  margin-bottom: 20px;
  color: white;
}

h4{
    color: gray;
}

.btn-continuar {
  padding: 10px 25px;
  font-size: 18px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  transition: 0.2s;
}

.btn-continuar:hover {
  background-color: #2563eb;
}
</style>
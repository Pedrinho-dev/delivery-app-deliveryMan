export const API_URL = "http://localhost:3000";

export async function getPendingOrders() {
  const resp = await fetch(`http://localhost:3000/order/pending`);
  return resp.json();
}

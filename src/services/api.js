export const API_URL = "http://localhost:3000";

export async function getPendingOrders() {
  const resp = await fetch(`https://delivery-app-api-pi.vercel.app/order/pending`);
  return resp.json();
}

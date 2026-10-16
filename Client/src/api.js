const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Products
  getProducts: (params = "") => request(`/products${params}`),
  getAllProductsAdmin: () => request(`/products?all=true`),
  reactivateProduct: (id, token) =>
    request(`/products/${id}/reactivate`, { method: "PUT", token }),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data, token) => request("/products", { method: "POST", body: data, token }),
  updateProduct: (id, data, token) =>
    request(`/products/${id}`, { method: "PUT", body: data, token }),
  deleteProduct: (id, token) => request(`/products/${id}`, { method: "DELETE", token }),

  // Auth / users
  register: (data) => request("/users/register", { method: "POST", body: data }),
  login: (data) => request("/users/login", { method: "POST", body: data }),
  logout: (token) => request("/users/logout", { method: "POST", token }),
  me: (token) => request("/users/me", { token }),
  updateMe: (data, token) => request("/users/me", { method: "PUT", body: data, token }),

  // Cart
  getCart: (token) => request("/cart", { token }),
  addToCart: (data, token) => request("/cart/add", { method: "POST", body: data, token }),
  updateCartItem: (data, token) => request("/cart/update", { method: "PUT", body: data, token }),
  removeCartItem: (data, token) =>
    request("/cart/remove", { method: "DELETE", body: data, token }),
  clearCart: (token) => request("/cart/clear", { method: "DELETE", token }),

  // Orders
  checkout: (data, token) => request("/orders/checkout", { method: "POST", body: data, token }),
  myOrders: (token) => request("/orders/mine", { token }),
  allOrders: (token) => request("/orders", { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: "PUT", body: { status }, token }),

  // Admin / store settings
  getPublicConfig: () => request("/admin/public-config"),
  getAdminConfig: (token) => request("/admin/config", { token }),
  updateAdminConfig: (data, token) => request("/admin/config", { method: "PUT", body: data, token }),
  adminUsers: (token) => request("/admin/users", { token }),
  setUserRole: (id, role, token) =>
    request(`/admin/users/${id}/role`, { method: "PUT", body: { role }, token }),
};

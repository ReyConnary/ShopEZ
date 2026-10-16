import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { formatRupiah } from "../utils/currency";

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1>My Orders</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((o) => (
        <div className="order-card" key={o._id}>
          <div className="order-header">
            <span>Order #{o._id.slice(-6)}</span>
            <span className={`status status-${o.status}`}>{o.status}</span>
          </div>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx}>
                {i.productName} ({i.variantSku}) × {i.quantity} — {formatRupiah(i.priceAtPurchase)} each
              </li>
            ))}
          </ul>
          <p>Shipping to: {o.shippingAddress}</p>
          <p>
            <strong>Total: {formatRupiah(o.totalAmount)}</strong>
          </p>
        </div>
      ))}
    </div>
  );
}

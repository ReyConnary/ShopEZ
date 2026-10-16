import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api";
import { formatRupiah } from "../../utils/currency";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.allOrders(token).then(setOrders).catch((err) => setError(err.message));
  }
  useEffect(load, [token]);

  async function handleStatus(id, status) {
    await api.updateOrderStatus(id, status, token);
    load();
  }

  return (
    <div>
      <h2>All orders</h2>
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>User</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6)}</td>
              <td>{o.userId?.username || o.userId?.email || o.userId}</td>
              <td>{formatRupiah(o.totalAmount)}</td>
              <td>
                <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

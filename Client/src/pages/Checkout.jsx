import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api";
import { formatRupiah } from "../utils/currency";

export default function Checkout() {
  const { token, user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await api.checkout({ shippingAddress: address }, token);
      await refresh();
      navigate("/orders", { state: { justPlaced: order._id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.items.length) return <p>Your cart is empty.</p>;

  return (
    <div className="form-page">
      <h1>Checkout</h1>
      <ul>
        {cart.items.map((i) => (
          <li key={`${i.productId}-${i.variantId}`}>
            {i.productName} ({i.sku}) × {i.quantity} - {formatRupiah(i.subtotal)}
          </li>
        ))}
      </ul>
      <h2>Total: {formatRupiah(cart.total)}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

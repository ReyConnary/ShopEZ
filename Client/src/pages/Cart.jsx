import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useState } from "react";
import { formatRupiah } from "../utils/currency";

export default function Cart() {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleQty(item, qty) {
    setError("");
    try {
      await updateQuantity(item.productId, item.variantId, Number(qty));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(item) {
    await removeItem(item.productId, item.variantId);
  }

  if (loading) return <p>Loading cart...</p>;

  return (
    <div>
      <h1>Your Cart</h1>
      {error && <p className="error">{error}</p>}
      {cart.items.length === 0 && (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>.
        </p>
      )}
      {cart.items.map((item) => (
        <div className="cart-row" key={`${item.productId}-${item.variantId}`}>
          {item.image && <img src={item.image} alt={item.productName} />}
          <div className="cart-row-info">
            <strong>{item.productName}</strong>
            <span>{item.sku}</span>
            <span>{formatRupiah(item.price)} each</span>
          </div>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.quantity}
            onChange={(e) => handleQty(item, e.target.value)}
          />
          <span>{formatRupiah(item.subtotal)}</span>
          <button onClick={() => handleRemove(item)}>Remove</button>
        </div>
      ))}

      {cart.items.length > 0 && (
        <div className="cart-total">
          <h2>Total: {formatRupiah(cart.total)}</h2>
          <button onClick={() => navigate("/checkout")}>Proceed to checkout</button>
        </div>
      )}
    </div>
  );
}

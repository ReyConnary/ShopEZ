import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatRupiah } from "../utils/currency";

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setVariantId(p.variants[0]?._id || "");
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleAdd() {
    setError("");
    setMessage("");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product._id, variantId, Number(quantity));
      setMessage("Added to cart.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !product) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  const variant = product.variants.find((v) => v._id === variantId);
  const displayImage = variant?.image || product.image;

  return (
    <div className="product-detail">
      {displayImage && <img src={displayImage} alt={product.name} />}
      <div>
        <h1>{product.name}</h1>
        <p className="category">{product.category}</p>
        <p>{product.description}</p>

        <label>
          Variant:
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {product.variants.map((v) => (
              <option key={v._id} value={v._id}>
                {v.sku} — {formatRupiah(v.price)} ({v.stock} in stock)
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity:
          <input
            type="number"
            min="1"
            max={variant?.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        <button onClick={handleAdd} disabled={!variant || variant.stock === 0}>
          {variant?.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

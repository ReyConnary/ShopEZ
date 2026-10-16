import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatRupiah } from "../utils/currency";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query = "") {
    setLoading(true);
    setError("");
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : "";
      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(search);
  }

  return (
    <div>
      <h1>Products</h1>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="product-grid">
        {products.map((p) => {
          const minPrice = Math.min(...p.variants.map((v) => v.price));
          return (
            <Link to={`/products/${p._id}`} key={p._id} className="product-card">
              {p.image && <img src={p.image} alt={p.name} />}
              <h3>{p.name}</h3>
              <p className="category">{p.category}</p>
              <p className="price">from {formatRupiah(minPrice)}</p>
            </Link>
          );
        })}
      </div>

      {!loading && products.length === 0 && <p>No products found.</p>}
    </div>
  );
}

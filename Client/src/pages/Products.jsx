import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatRupiah } from "../utils/currency";

const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicConfig()
      .then((cfg) => {
        setCategories(cfg.categories || []);
        setBanner(cfg.banner || "");
      })
      .catch(() => {
        // No admin-defined categories/banner yet — page still works without them.
      });
  }, []);

  const bannerIsImage = banner && IMAGE_PATTERN.test(banner);

  async function load(query = search, cat = category) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (cat) params.set("category", cat);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await api.getProducts(qs);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(search, category);
  }

  function handleCategoryChange(e) {
    const value = e.target.value;
    setCategory(value);
    load(search, value);
  }

  return (
    <div>
      {bannerIsImage && <img src={banner} alt="Store banner" className="landing-banner-img" />}
      {banner && !bannerIsImage && <div className="landing-banner-text">{banner}</div>}

      <h1>Products</h1>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.length > 0 && (
          <select value={category} onChange={handleCategoryChange}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
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

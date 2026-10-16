import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api";

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  image: "",
  variants: [{ sku: "", price: "", stock: "", image: "" }],
};

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [error, setError] = useState("");

  function load() {
    api.getAllProductsAdmin().then(setProducts).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function updateVariant(idx, field, value) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...f, variants };
    });
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { sku: "", price: "", stock: "", image: "" }],
    }));
  }

  function removeVariant(idx) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      image: product.image || "",
      variants: product.variants.map((v) => ({
        _id: v._id,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        image: v.image || "",
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyProduct);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        variants: form.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };
      if (editingId) {
        await api.updateProduct(editingId, payload, token);
      } else {
        await api.createProduct(payload, token);
      }
      setEditingId(null);
      setForm(emptyProduct);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate(id) {
    await api.deleteProduct(id, token);
    load();
  }

  async function handleReactivate(id) {
    await api.reactivateProduct(id, token);
    load();
  }

  return (
    <div>
      <h2>{editingId ? "Edit product" : "Create product"}</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <h3>Variants</h3>
        {form.variants.map((v, idx) => (
          <div className="variant-row" key={v._id || idx}>
            <input
              placeholder="SKU"
              value={v.sku}
              onChange={(e) => updateVariant(idx, "sku", e.target.value)}
              required
            />
            <input
              placeholder="Price (Rp)"
              type="number"
              value={v.price}
              onChange={(e) => updateVariant(idx, "price", e.target.value)}
              required
            />
            <input
              placeholder="Stock"
              type="number"
              value={v.stock}
              onChange={(e) => updateVariant(idx, "stock", e.target.value)}
              required
            />
            <input
              placeholder="Image URL"
              value={v.image}
              onChange={(e) => updateVariant(idx, "image", e.target.value)}
            />
            {form.variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(idx)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVariant}>
          + Add variant
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "Save changes" : "Create product"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
      {error && <p className="error">{error}</p>}

      <h2>All products</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Variants</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.variants.length}</td>
              <td>{p.isActive ? "Yes" : "No"}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(p)}>Edit</button>
                {p.isActive ? (
                  <button onClick={() => handleDeactivate(p._id)}>Deactivate</button>
                ) : (
                  <button onClick={() => handleReactivate(p._id)}>Reactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

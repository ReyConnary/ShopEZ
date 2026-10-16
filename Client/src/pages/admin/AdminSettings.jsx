import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api";

export default function AdminSettings() {
  const { token } = useAuth();
  const [banner, setBanner] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAdminConfig(token)
      .then((cfg) => {
        setBanner(cfg.banner || "");
        setCategories(cfg.categories || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  function addCategory() {
    const value = newCategory.trim();
    if (!value || categories.includes(value)) return;
    setCategories([...categories, value]);
    setNewCategory("");
  }

  function removeCategory(cat) {
    setCategories(categories.filter((c) => c !== cat));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await api.updateAdminConfig({ banner, categories }, token);
      setBanner(updated.banner);
      setCategories(updated.categories);
      setMessage("Store settings saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="form-page" style={{ maxWidth: 500 }}>
      <h2>Store settings</h2>
      <p className="muted">
        Controls the banner shown on the landing page and the category list used for product
        filtering and creation.
      </p>
      <form onSubmit={handleSave}>
        <label>Banner text / image URL</label>
        <input
          placeholder="e.g. Big sale this week! or an image URL"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
        />

        <label>Categories</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Add a category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
          />
          <button type="button" onClick={addCategory}>
            Add
          </button>
        </div>

        <div className="category-chips">
          {categories.map((c) => (
            <span className="chip" key={c}>
              {c}
              <button type="button" onClick={() => removeCategory(c)}>
                ×
              </button>
            </span>
          ))}
          {categories.length === 0 && <p className="muted">No categories yet.</p>}
        </div>

        <button type="submit">Save settings</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

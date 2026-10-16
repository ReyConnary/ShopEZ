import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", address: "" });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/products");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="form-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={form.username} onChange={(e) => update("username", e.target.value)} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <input placeholder="Address (optional)" value={form.address} onChange={(e) => update("address", e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

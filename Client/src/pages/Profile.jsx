import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [address, setAddress] = useState(user?.address || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await api.updateMe({ username, address }, token);
      setUser(updated);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="form-page">
      <h1>My Profile</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        <button type="submit">Save</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

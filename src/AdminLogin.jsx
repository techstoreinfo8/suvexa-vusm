
import { useState } from "react";
import { ShieldCheck, LockKeyhole, Mail } from "lucide-react";
import "./Admin.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      sessionStorage.setItem("suvexa-admin-token", result.token);
      window.location.assign("/admin/dashboard");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check your backend."
          : err.message || "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <div className="admin-brand-mark">S</div>

        <div className="admin-auth-heading">
          <ShieldCheck size={30} />
          <h1>Admin Login</h1>
          <p>Suvexa VUSM Technologies</p>
        </div>

        <form onSubmit={handleLogin} className="admin-auth-form">
          <label htmlFor="admin-email">Email address</label>
          <div className="admin-input-wrap">
            <Mail size={18} />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="admin-password">Password</label>
          <div className="admin-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <a className="admin-back-link" href="/">
          Back to main website
        </a>

        <p className="admin-security-note">
          <LockKeyhole size={13} />
          Protected administrator access
        </p>
      </section>
    </main>
  );
}

export default AdminLogin;

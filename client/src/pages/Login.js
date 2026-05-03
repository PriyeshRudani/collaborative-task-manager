import { useState } from "react";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      alert("Login successful");

      window.location.href = "/";
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email" required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input 
            type="password" required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
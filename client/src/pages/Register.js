import { useState } from "react";
import { registerUser } from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser({
        name,
        email,
        password,
      });

      alert("User registered successfully");

      window.location.href = "/login";
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <p className="eyebrow">Create workspace access</p>
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;

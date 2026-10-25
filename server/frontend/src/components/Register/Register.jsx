
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${window.location.origin}/djangoapp/registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed.");
      }

      setMessage("Registration successful! Redirecting to login...");
      setIsError(false);

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Sign-up</h2>

        <label htmlFor="register-username">Username</label>
        <input
          id="register-username"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Username"
          autoComplete="username"
          required
        />

        <label htmlFor="register-firstname">First Name</label>
        <input
          id="register-firstname"
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First Name"
          autoComplete="given-name"
          required
        />

        <label htmlFor="register-lastname">Last Name</label>
        <input
          id="register-lastname"
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Last Name"
          autoComplete="family-name"
          required
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email"
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label htmlFor="register-confirm-password">
          Confirm Password
        </label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          placeholder="Confirm Password"
          autoComplete="new-password"
          required
        />

        {message && (
          <p
            className={isError ? "register-error" : "register-success"}
            role="status"
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

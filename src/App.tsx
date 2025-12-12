import { useState } from "react";
import "./styles/auth.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(Email: ${email}\nPassword: ${password});
  };

  return (
    <div className="wrapper">
      <div className="form-box register">
        <h2 className="title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <div className="input-box">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span className="password-toggle">👁</span>
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>

        <div className="social-login">
          <span>Or login with</span>
          <div className="social-icons">
            <div className="social-icon">G</div>
            <div className="social-icon">F</div>
            <div className="social-icon">T</div>
          </div>
        </div>

        <p className="linkTxt">
          Don't have an account? <a href="#">Register</a>
        </p>
      </div>
    </div>
  );
}

export default App;
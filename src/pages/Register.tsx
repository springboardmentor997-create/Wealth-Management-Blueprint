import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");           // ✅ Name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const handlePasswordChange = (val: string) => {
    setPassword(val);

    // Simple password strength calculation
    let score = 0;
    if (val.length >= 6) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[\W]/.test(val)) score += 1;
    setStrength(score);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Name: ${name}\nEmail: ${email}\nPassword: ${password}`);
    setName("");     // ✅ clear name
    setEmail("");
    setPassword("");
    setStrength(0);
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 0: return "";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 1: return "red";
      case 2: return "orange";
      case 3: return "blue";
      case 4: return "green";
      default: return "transparent";
    }
  };

  return (
    <div className="wrapper">
      <div className="form-box register">
        <h2 className="title">Register</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Name Field */}
          <div className="input-box">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Name</label>
          </div>

          {/* Email Field */}
          <div className="input-box">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          {/* Password Field */}
          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            <label>Password</label>
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Password Strength */}
          {strength > 0 && (
            <div style={{ color: getStrengthColor(), marginBottom: "10px" }}>
              Password Strength: {getStrengthLabel()}
            </div>
          )}

          <button type="submit" className="btn">
            Register
          </button>
        </form>

        <p className="linkTxt">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

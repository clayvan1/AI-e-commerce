import React, { useState } from 'react';
import Input from '../../components/AuthForm/Input';
import Button from '../../components/AuthForm/Button';
import FallingText from '../../components/AuthForm/FallingText';
import DotGrid from './DotGrid';
import useSignup from '../../hooks/Auth/useSignup';
import validateForm from '../../utils/validateForm';
import './Login.css';

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { signup, loading, error } = useSignup();

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors } = validateForm({ email, password, username });
    setErrors(errors);

    if (isValid) {
      signup({ username, email, password });
    }
  };

  return (
    <div className="login-container">
      <div className="dotgrid-background">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="login-page">
        <div className="falling-text-top">
          <FallingText
            text="Join Gee Planet and explore innovation, style, and convenience."
            highlightWords={['Gee', 'Planet', 'innovation', 'style']}
            highlightClass="highlighted"
            trigger="auto"
            backgroundColor="transparent"
            gravity={0.4}
            fontSize="1.5rem"
          />
        </div>

        <div className="login-card">
          

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              errorText={errors.username}
              placeholder="Enter your username"
              required
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorText={errors.email}
              placeholder="Enter your email"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorText={errors.password}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            {error && <p className="error-text">{error}</p>}
          </form>

          <p className="signup-link">
            Already have an account? <a href="/login">Log In</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;

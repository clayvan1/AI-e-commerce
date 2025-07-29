import React, { useState, useEffect } from 'react';
import Input from '../../components/AuthForm/Input';
import Button from '../../components/AuthForm/Button';
import FallingText from '../../components/AuthForm/FallingText';
import DotGrid from './DotGrid';
import useLogin from '../../hooks/Auth/useLogin';
import validateForm from '../../utils/validateForm';
import './Login.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function LoginPage() {
   useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, loading, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm({ email, password });
    setEmailError(errors.email || '');
    setPasswordError(errors.password || '');

    if (isValid) {
      login({ email, password });
    }
  };

  return (
    <div className="login-container">
      {/* DotGrid animated background */}
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

      {/* Content overlay */}
      <div className="login-page">
        <div className="falling-text-top">
          <FallingText
            text="Welcome to Gee Planet — your gateway to amazing products and services."
            highlightWords={['Gee', 'Planet', 'amazing', 'products']}
            highlightClass="highlighted"
            trigger="auto"
            backgroundColor="transparent"
            gravity={0.6}
            fontSize="1.5rem"
          />
        </div>

        <div className="login-card"data-aos="fade-up">
          

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorText={emailError}
              placeholder="Enter your email"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorText={passwordError}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
            {error && <p className="error-text">{error}</p>}
          </form>

          <p className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </p>
          <p className="signup-link">
            Don't have an account? <a href="/Sign">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

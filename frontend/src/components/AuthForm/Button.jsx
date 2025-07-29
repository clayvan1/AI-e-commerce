// Button.jsx
import React from 'react';
import './Button.css'; // Assuming you'll create some basic styling for your button

const Button = ({
  children, // The text or content inside the button
  onClick,
  type = 'button', // Default to 'button', can be 'submit', 'reset'
  className = '', // For adding extra classes from parent component
  disabled = false,
  ...props // Allows passing other native button props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`} // Apply base 'btn' class and any additional classes
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
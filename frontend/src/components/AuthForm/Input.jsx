// Input.jsx
import React from 'react';
import './Input.css'; // Assuming you'll create some basic styling for your input

const Input = ({
  id,
  
  type = 'text', // Default to text input
  value,
  onChange,
  onBlur,
  errorText,
  placeholder,
  required = false,
  ...props // Allows passing other native input props like 'name', 'minLength', etc.
}) => {
  return (
    <div className="form-control">
      
      <input
        type={type}
        id={id}
        name={id} // Good practice to have name attribute matching id for form submission
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        {...props}
      />
      {errorText && <p className="error-text">{errorText}</p>}
    </div>
  );
};

export default Input;
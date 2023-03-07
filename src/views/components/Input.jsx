import React from "react";
import "../../styles/Input.css";

const Input = (props) => {
  return (
    <div id="urlInput">
      <label htmlFor={props.name} className="form-label">
        {props.title}
      </label>
      <input
        className="form-input"
        id={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.handleChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        error={props.error}
        aria-label={props.name + " urlInput"}
        noValidate
      />
    </div>
  )
}

export default Input;

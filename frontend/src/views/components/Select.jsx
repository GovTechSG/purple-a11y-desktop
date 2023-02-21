import React from "react";
import "../../styles/Select.css";

const Select = (props) => {
  return (
    <div className="select-form">
      <label className="input-title" htmlFor={props.name}>
        {props.title}
      </label>
      <select className="select-field"
        name={props.name}
        value={props.value}
        onChange={props.handleChange}
        id="selectField"
      >
        {props.options.map(option => {
          return (
            <option
              key={option}
              value={option}
              label={option}
              aria-label={option + " selectField"}
            >
              {option}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default Select;

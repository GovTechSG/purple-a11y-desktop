import React from "react";
import "../../styles/Select.css";

const Select = (props) => {
  return (
    <div className="select-form">
      {!props.hideLabel && (
        <label htmlFor={props.name}>
          {props.title}
        </label>
      )}
      <select
        aria-label={props.title}
        className="select-field"
        name={props.name}
        value={props.value}
        onChange={props.handleChange}
        id="selectField"
      >
        {props.options.map((option) => {
          return (
            <option
              key={option}
              value={option}
              label={option}
              aria-label={option + " selectField"}
            >
              {option}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;

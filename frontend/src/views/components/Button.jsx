import React from "react";
import "../../styles/Button.css";

const Button = (props) => {
  return (
    <button className={props.className} onClick={props.action} type={props.type} disabled={props.disabled} >
      {props.title}
    </button>
  )
}

export default Button;
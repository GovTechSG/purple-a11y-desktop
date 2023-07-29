import { useState } from "react";
import questionMarkIcon from "../../assets/question-mark.svg"; 

const ToolTip = ({description, id, showToolTip, setShowToolTip}) => {
    return (
        <div className="custom-tooltip-container">
            <button 
                className="custom-tooltip-button"
                onMouseOver={() => setShowToolTip(true)}
                onMouseLeave={() => setShowToolTip(false)}
            >
                <img src={questionMarkIcon}></img>
            </button>
            { showToolTip && 
                <div role="tooltip" className="custom-tooltip" id={id}>
                    <div aria-live="polite" className="custom-tooltip-description">{description}</div>
                    <div className="custom-tooltip-arrow"></div>
                </div>
            }
        </div>
    )
}

export default ToolTip;


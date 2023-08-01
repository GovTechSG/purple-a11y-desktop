import { useState } from "react";
import questionMarkIcon from "../../assets/question-mark.svg"; 

const ToolTip = ({description, id, showToolTip, setShowToolTip}) => {
    return (
        <div className="custom-tooltip-container">
            <button 
                className="custom-tooltip-button"
                aria-hidden="true"
                tabIndex='-1'
                onMouseOver={() => setShowToolTip(true)}
                onMouseLeave={() => setShowToolTip(false)}
            >
                <img src={questionMarkIcon}></img>
            </button>
            { showToolTip && 
                <div role="tooltip" className="custom-tooltip">
                    <div aria-live="polite" id={id} className="custom-tooltip-description">{description}</div>
                    <div className="custom-tooltip-arrow"></div>
                </div>
            }
        </div>
    )
}

export default ToolTip;


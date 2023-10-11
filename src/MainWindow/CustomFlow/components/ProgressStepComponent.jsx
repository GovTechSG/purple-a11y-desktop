import { useEffect } from "react";
import fullPurpleCheckIcon from "../../../assets/full-purple-check-circle.svg"; 

const ProgressStepComponent = ({step}) => {
    useEffect(() => {
        const currentProgressStepItemID = `#progress-step-item-${step}`; 
        const currentProgressStepItemElement = document.querySelector(currentProgressStepItemID);
        currentProgressStepItemElement.setAttribute("aria-current", "step");

        return () => {
            currentProgressStepItemElement.removeAttribute("aria-current");
        }
     })

    const ProgressStepItemComponent = ({num, label}) => {
        const progressStepClassName = num === step ? 'progress-step active' : 'progress-step';
        const progressStepID = `progress-step-item-${num}`; 

        return (
            <div id={progressStepID} className='progress-step-item'>
                {num < step 
                    ? <img src={fullPurpleCheckIcon}></img>
                    : <div class={progressStepClassName}>{num}</div>}
                <span className="progress-step-label">{label}</span>
            </div>
        )
    }

    const ProgressStepBarComponent = ({num}) => {
        const classNameToUse = num < step ? 'progress-step-bar active' : 'progress-step-bar';
        return (
            <div className={classNameToUse}></div>
        )
    }

    return (
        <div className="progress-step-container">
            <h4>CUSTOM FLOW</h4>
            <div className="progress-step-list">
                <ProgressStepItemComponent num={1} label={'Prepare'} />
                <ProgressStepBarComponent num={1} />
                <ProgressStepItemComponent num={2} label={'Record'} />
                <ProgressStepBarComponent num={2} />
                <ProgressStepItemComponent num={3} label={'Replay'} />
                <ProgressStepBarComponent num={3} />
                <ProgressStepItemComponent num={4} label={'Label'} />
            </div>
        </div>
    )
}

export default ProgressStepComponent;
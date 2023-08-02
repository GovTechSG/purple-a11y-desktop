import fullPurpleCheckIcon from "../../../assets/full-purple-check-circle.svg"; 

const ProgressStepComponent = ({step}) => {

    const ProgressStepItemComponent = ({num, label}) => {
        const classNameToUse = num === step ? 'progress-step active' : 'progress-step';

        return (
            <div className="progress-step-item">
                {num < step 
                    ? <img src={fullPurpleCheckIcon}></img>
                    : <div class={classNameToUse}>{num}</div>}
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
                <ProgressStepItemComponent num={1} label={'Record'} />
                <ProgressStepBarComponent num={1} />
                <ProgressStepItemComponent num={2} label={'Replay'} />
                <ProgressStepBarComponent num={2} />
                <ProgressStepItemComponent num={3} label={'Label'} />
            </div>
        </div>
    )
}

export default ProgressStepComponent;
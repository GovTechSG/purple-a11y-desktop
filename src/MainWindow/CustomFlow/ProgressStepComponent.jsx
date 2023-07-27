const ProgressStepComponent = () => {
    return (
        <div className="progress-step-container">
            <h4>CUSTOM FLOW</h4>
            <div className="progress-step-list">
                <div className="progress-step-item">
                    <div class="progress-step">1</div>
                    <span className="progress-step-label">Record</span>
                </div>
                <div className="progress-step-bar"></div>
                <div className="progress-step-item">
                    <div class="progress-step">2</div>
                    <span className="progress-step-label">Replay</span>
                </div>
                <div className="progress-step-bar"></div>
                <div className="progress-step-item">
                    <div class="progress-step">3</div>
                    <span className="progress-step-label">Label</span>
                </div>
            </div>
        </div>
    )
}

export default ProgressStepComponent;
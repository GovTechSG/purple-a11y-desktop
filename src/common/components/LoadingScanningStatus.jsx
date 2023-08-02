import LoadingSpinner from "./LoadingSpinner";

const LoadingScanningStatus = ({scanningMessage}) => {
    return (
        <div className="scanning-status-container">
            <LoadingSpinner></LoadingSpinner>
            <p className="scanning-status-label">{scanningMessage}</p>
        </div>
    )
}

export default LoadingScanningStatus; 
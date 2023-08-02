import purpleCheckIcon from "../../assets/purple-check-circle.svg";

const DoneScanningStatus = () => {
    return (
        <div className="scanning-status-container">
            <img className="scanning-check-icon" src={purpleCheckIcon}></img>
            <p className="scanning-status-label"><b>Done!</b></p>
        </div>
    )
}

export default DoneScanningStatus; 
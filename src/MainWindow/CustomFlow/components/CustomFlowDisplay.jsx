const CustomFlowDisplay = ({
  icon, 
  step, 
  title, 
  url, 
  description, 
}) => {
  return (
    <>
      <div className="custom-flow-header">
        <div className="custom-flow-header-content">
          <img className="custom-flow-header-img" src={icon} alt="record"></img>
          <div className="custom-flow-header-title-container">
            <span className="custom-flow-header-step" role="status" aria-live="polite">STEP {step} of 3</span>
            <h3 className="custom-flow-header-title">{title}</h3>
          </div>
        </div>
        <span className="custom-flow-header-url"><b>URL: </b>{url}</span>
      </div>
      <hr/>
      <div className="custom-flow-body">
        <p className="custom-flow-description">{description}</p>
      </div>
    </>
  )
}

export default CustomFlowDisplay;
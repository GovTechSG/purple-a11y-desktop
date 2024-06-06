const CustomFlowDisplay = ({
  icon, 
  title, 
  url, 
  description, 
}) => {
  return (
    <>
      <div className="custom-flow-header">
        <div className="custom-flow-header-content">
          <img className="custom-flow-header-img" src={icon} alt=""></img>
          <div className="custom-flow-header-title-container">
          <p className="custom-flow-header-step">FINAL STEP</p>
            <h3 className="custom-flow-header-title">{title}</h3>
          </div>
        </div>
        <p className="custom-flow-header-url"><span>URL:</span> {url}</p>
      </div>
      <hr class="my-5"/>
      <p>{description}</p>
    </>
  )
}

export default CustomFlowDisplay;
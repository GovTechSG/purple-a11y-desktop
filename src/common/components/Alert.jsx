const Alert = ({ alertClassName, children, icon }) => {
  return (
    <div className={`alert d-flex flex-row ${alertClassName ? alertClassName : ""}`}>
      {
        icon &&
        <div className="me-2"><img src={icon}></img></div>
      }
      <div>
      {children}
      </div>
    </div>
  )
};

export default Alert;
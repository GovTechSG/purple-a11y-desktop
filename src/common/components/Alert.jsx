const Alert = ({ alertClassName, children, icon }) => {
  return (
    <div className={`alert d-flex flex-row ${alertClassName ? alertClassName : ""}`} role="alert">
      {
        icon &&
        <div className="me-2"><img src={icon}></img></div>
      }
      <div class="d-flex justify-content-center flex-grow-1">
      {children}
      </div>
    </div>
  )
};

export default Alert;
const Button = ({ type, className, children, ...props }) => {
  return (
    <button className={`${type}${className ? " " + className : ""}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

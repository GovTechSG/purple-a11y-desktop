const ButtonSvgIcon = ({ className, focusable = false, svgIcon }) => {
  return (
    <span aria-hidden focusable={focusable} className={`${className}`}>
      {svgIcon}
    </span>
  );
};

export default ButtonSvgIcon;

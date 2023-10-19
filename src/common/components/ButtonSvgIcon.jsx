const ButtonSvgIcon = ({ className, svgIcon }) => {
  return (
    <span aria-hidden className={`${className}`}>
      {svgIcon}
    </span>
  );
};

export default ButtonSvgIcon;

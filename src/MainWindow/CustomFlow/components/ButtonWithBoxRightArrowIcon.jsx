import boxRightArrowIcon from "../../../assets/box-arrow-up-right.svg";

 const ButtonWithBoxRightArrowIcon = ({onClick, buttonLabel}) => {
    return (
    <button className="btn-primary custom-flow-button" type="button" onClick={onClick}>
        {buttonLabel}&nbsp;
        <img src={boxRightArrowIcon}></img>
    </button>
    )
}

export default ButtonWithBoxRightArrowIcon;
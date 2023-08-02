import boxRightArrowIcon from "../../../assets/box-arrow-up-right.svg";
import Button from "../../../common/components/Button";

 const ButtonWithBoxRightArrowIcon = ({onClick, buttonLabel}) => {
    return (
    <Button type="primary" onClick={onClick}>
        {buttonLabel}&nbsp;
        <img src={boxRightArrowIcon}></img>
    </Button>
    )
}

export default ButtonWithBoxRightArrowIcon;
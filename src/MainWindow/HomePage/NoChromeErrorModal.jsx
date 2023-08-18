import { handleClickLink,installChromeUrl } from "../../common/constants";
import Modal from "../../common/components/Modal";
import Button from "../../common/components/Button";

const NoChromeErrorModal = ({showModal, setShowModal}) => {
    const onClickInstallChrome = (e) => {
        handleClickLink(e, installChromeUrl);
        setShowModal(false);
        return;
    }

    return (
        <Modal
            id='no-chrome-browser-modal'
            showModal={showModal}
            showHeader={true}
            keyboardTrap={true}
            modalTitle={'Please install chrome'}
            modalBody={'To run Purple HATS Custom Flow Scan, please install Google Chrome.'}
            modalFooter={
                <button className='primary modal-button modal-full-button' onClick={(e) => onClickInstallChrome(e)}>Install Chrome Here</button>
            }
            setShowModal={setShowModal}
        />
    )
}

export default NoChromeErrorModal;
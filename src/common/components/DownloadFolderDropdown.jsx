import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import Button from "../../common/components/Button";
import folder from "../../assets/folder.svg";
import { useEffect, useState } from "react";
import services from "../../services";
import editIcon from "../../assets/edit-icon.svg";

const DownloadFolderDropdown = ({
    labelledBy
}) => {
    const dropdownOptionActiveClass = "dropdown-list-item active";
    const dropdownOptionInactiveClass = "dropdown-list-item";

    const [active, setActive] = useState(true); 
    const [exportDir, setExportDir] = useState();
    const [openDropDown, setOpenDropDown] = useState(false);
     
    useEffect(() => {
        const getExportDir = async () => {
            const userData = await services.getUserData();
            setExportDir(userData.exportDir);
        };
        getExportDir();
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) =>  {
            const dropdownListElement = document.querySelector('.dropdown-list'); 
            const dropdownOptions = dropdownListElement.querySelectorAll('.dropdown-list-item'); 

            console.log(event.key);
            console.log(event.target);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                if (!dropdownListElement.contains(event.target)) {
                    event.preventDefault();
                    dropdownOptions[0].focus();
                }

                if (event.target === dropdownOptions[0]) {
                    event.preventDefault(); 
                    dropdownOptions[1].focus();
                }

                if (event.target === dropdownOptions[1]) {
                    event.preventDefault(); 
                    dropdownOptions[0].focus();
                }
            }

            const focusOnButton = () => {
                const dropdownButton = document.querySelector('.dropdown-btn'); 
                dropdownButton.focus();
            }

            if (event.key === 'Enter') {
                if (!dropdownListElement.contains(event.target)) {
                    event.preventDefault();
                    dropdownOptions[0].focus();
                }
                if (event.target === dropdownOptions[0]) {
                    event.preventDefault();
                    handleClickCurrent();
                    focusOnButton();
                }
                if (event.target === dropdownOptions[1]) {
                    event.preventDefault();
                    dropdownOptions[1].blur();
                    handleSetExportDir();
                    focusOnButton();
                }
            }

            if (event.key === 'Tab' || event.key === 'Escape') {
                event.preventDefault();
                focusOnButton();
                setOpenDropDown(false);
            }
        }
        if (openDropDown) {
            document.addEventListener('keydown', handleKeyDown); 

            return (() => {
                document.removeEventListener('keydown', handleKeyDown); 
            })
        }
    }, [openDropDown])

    const handleKeydownOpenDropdown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpenDropDown(true); 
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setOpenDropDown(false); 
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            setOpenDropDown(true);
        }
    }


    const handleClickCurrent = () => {
        setOpenDropDown(false);
    }

    const handleSetExportDir = async () => {
        setActive(false)
        const exportDir = await window.services.setExportDir(); 
        setExportDir(exportDir);
        setOpenDropDown(false);
        setActive(true)
    }

    return (
        <div className="download-dropdown">
          <Button className="dir-info-button download-dropdown-btn" aria-describedby="download-folder-label" onClick={handleSetExportDir}>
            <div className="d-flex download-path">
              <img src={folder}></img>
              <span id="dir-info">{exportDir}</span>
            </div>
            <div className="change-download-btn">
              <img src={editIcon} aria-label="Change download directory"></img>
            </div>
        </Button>
      </div>
    )                                     
}           

export default DownloadFolderDropdown;
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import Button from "../../common/components/Button";
import folder from "../../assets/folder.svg";
import { useEffect, useState } from "react";
import services from "../../services";

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
        <div className="dropdown fade-in">
        <button aria-controls="download-dropdown-list" aria-expanded={openDropDown} aria-haspopup="listbox" aria-labelledBy={labelledBy} className="dropdown-btn" onClick={() => {setOpenDropDown(!openDropDown)}} onKeyDown={(e) => handleKeydownOpenDropdown(e)}>
          <img id="folder-img" src={folder}></img>
          <span id="dir-info">{exportDir}</span>
          {openDropDown ? (
            <ButtonSvgIcon
              className={`chevron-up-icon`}
              svgIcon={<ChevronUpIcon />}
            />
          ) : (
            <ButtonSvgIcon
              className={`chevron-down-icon`}
              svgIcon={<ChevronDownIcon />}
            />
          )}
        </button>
        {openDropDown && 
            <>
            <ul id="download-dropdown-list" className="dropdown-list" role="listbox">
                <li className={active ? dropdownOptionActiveClass : dropdownOptionInactiveClass}  role="option" aria-selected={active} onClick={handleClickCurrent} tabindex="-1">
                    <span id="dir-info">{exportDir}</span>
                </li>
                <li className={!active ? dropdownOptionActiveClass : dropdownOptionInactiveClass}  role="option" aria-selected={!active} onClick={handleSetExportDir} tabindex="-1">
                    Choose Another
                </li>
            </ul>
            </>
        }
      </div>
    )                                     
}           

export default DownloadFolderDropdown;
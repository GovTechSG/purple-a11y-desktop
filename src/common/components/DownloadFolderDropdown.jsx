import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import Button from "../../common/components/Button";
import folder from "../../assets/folder.svg";
import { useEffect, useState } from "react";
import services from "../../services";

const DownloadFolderDropdown = () => {
    const dropdownOptionActiveClass = "download-dropdown-btn dropdown-list-btn active";
    const dropdownOptionInactiveClass = "download-dropdown-btn dropdown-list-btn";

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
            const dropdownListElement = document.querySelector('.download-dropdown-list'); 
            const dropdownOptions = dropdownListElement.querySelectorAll('.dropdown-list-btn'); 

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                console.log(event.key);
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

            if (event.key === 'Tab') {
                event.preventDefault();
                const dropdownButton = document.querySelector('.dir-info-btn'); 
                dropdownButton.focus();
                setOpenDropDown(false);
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                const dropdownButton = document.querySelector('.dir-info-btn'); 
                dropdownButton.focus();
                setOpenDropDown(false);
            }
        }
        if (openDropDown) {
            document.addEventListener('keydown', handleKeyDown); 
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
        <div className="download-dropdown fade-in">
        <button aria-haspopup="menu" className="dir-info-btn download-dropdown-btn" onClick={() => {setOpenDropDown(!openDropDown)}} onKeyDown={(e) => handleKeydownOpenDropdown(e)}>
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
            <div className="download-dropdown-list" role="menu">
                <button className={active ? dropdownOptionActiveClass : dropdownOptionInactiveClass} onClick={handleClickCurrent} role="menuitem" aria-selected="true">
                    <span id="dir-info">{exportDir}</span>
                </button>
                <button className={!active ? dropdownOptionActiveClass : dropdownOptionInactiveClass} role="menuitem" onClick={handleSetExportDir}>Choose Another</button>
            </div>
        }
      </div>
    )                                     
}           

export default DownloadFolderDropdown;
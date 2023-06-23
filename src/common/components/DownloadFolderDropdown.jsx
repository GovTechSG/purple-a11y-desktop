import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import Button from "../../common/components/Button";
import folder from "../../assets/folder.svg";
import { useEffect, useState } from "react";
import services from "../../services";

const DownloadFolderDropdown = () => {
    const [exportDir, setExportDir] = useState();
    const [openDropDown, setOpenDropDown] = useState(false);
   
    useEffect(() => {
        const getExportDir = async () => {
            const userData = await services.getUserData();
            setExportDir(userData.exportDir);
        };

        getExportDir();
    }, [])

    const handleSetExportDir = async () => {
        const exportDir = await window.services.setExportDir(); 
        setExportDir(exportDir);
        setOpenDropDown(false);
    }

    return (
        <div className="download-dropdown fade-in">
        <Button className="dir-info-button download-dropdown-btn" onClick={() => {setOpenDropDown(!openDropDown)}}>
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
        </Button>
        {openDropDown && <Button className="download-dropdown-btn choose-dir-button" onClick={handleSetExportDir}>Choose Another</Button>}
      </div>
    )
}

export default DownloadFolderDropdown;
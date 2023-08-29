import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import { ReactComponent as ChevronUpIcon } from "../../assets/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/chevron-down.svg";
import Button from "../../common/components/Button";
import folder from "../../assets/folder.svg";
import { useEffect, useState } from "react";
import services from "../../services";
import editIcon from "../../assets/edit-icon.svg";

const ExclusionsFolderDropdown = ({
    isOnboarding
  }) => {
      const dropdownClassName = isOnboarding ? "download-dropdown fade-in-left" : "download-dropdown";
      const [exclusionsDir, setexclusionsDir] = useState();
      
      useEffect(() => {
          const getexclusionsDir = async () => {
              const userData = await services.getUserData();
              setexclusionsDir(userData.exclusionsDir);
          };
  
          getexclusionsDir();
          console.log("exclusion dir: ", exclusionsDir)
      }, [])
  
      const handleSetexclusionsDir = async () => {
          const exclusionsDir = await window.services.setexclusionsDir(); 
          setexclusionsDir(exclusionsDir);
      }
  
      return (
          <div className={dropdownClassName}>
            <button className="dir-info-button exclusions-dropdown-btn" aria-describedby="exclusions-folder-label" onClick={handleSetexclusionsDir}>
              <div className="d-flex download-path">
                <img src={folder}></img>
                <span id="dir-info">{exclusionsDir}</span>
              </div>
              <div className="change-download-btn">
                <img src={editIcon} aria-label="Change exclusions directory"></img>
              </div>
          </button>
        </div>
      )
  }
  
  export default ExclusionsFolderDropdown;
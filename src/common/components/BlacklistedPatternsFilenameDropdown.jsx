import folder from "../../assets/folder-grey.svg";
import { useEffect, useState } from "react";
import services from "../../services";
import editIcon from "../../assets/edit-pencil-purple.svg";

const BlacklistedPatternsFilenameDropdown = ({
  isOnboarding,
  onUpdateBlacklistedPatternsFilename  // A function to update the filename/path in the parent state
}) => {
    const dropdownClassName = isOnboarding ? "download-dropdown fade-in-left" : "download-dropdown";
    const [selectedFile, setSelectedFile] = useState();

    useEffect(() => {
        const fetchAndSetUserData = async () => {
            const userData = await services.getUserData();
            setSelectedFile(userData.exportDir);  // Initially set to export directory for backward compatibility
            onUpdateBlacklistedPatternsFilename(userData.exportDir);  // Notify parent component
        };

        fetchAndSetUserData();
    }, [onUpdateBlacklistedPatternsFilename]);

    const handleFileSelect = async () => {
      const file = await window.services.selectFile();
      if (file) {
        console.log("Selected file:", file);
        setSelectedFile(file);
        onUpdateBlacklistedPatternsFilename(file);  // Update the parent component with the selected file path
      } else {
        console.log("No file was selected.");
      }
    };

    return (
        <div className={dropdownClassName}>
          <button className="dir-info-button blacklisted-patterns-dropdown-btn" onClick={handleFileSelect}>
            <div className="d-flex blacklisted-patterns-path">
              <img src={folder} alt="Folder Icon"></img>
              <span id="blacklisted-patterns-info">{selectedFile || "Select a file"}</span>
            </div>
            <div className="change-blacklisted-patterns-btn">
              <img src={editIcon} aria-label="Change selected file" alt="Edit Icon"></img>
            </div>
          </button>
        </div>
    )
}

export default BlacklistedPatternsFilenameDropdown;

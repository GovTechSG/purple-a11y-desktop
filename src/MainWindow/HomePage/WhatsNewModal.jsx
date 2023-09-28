import Modal from "../../common/components/Modal";
import boxRightArrow from '../../assets/box-right-arrow.png';
import { useEffect, useRef } from "react";
import { handleClickLink } from "../../common/constants";

const WhatsNewModalBody = ({ latestReleaseNotes }) => {
  const bodyRef = useRef(null);

  const insertAfter = (referenceNode, newNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  useEffect(() => {
    // inject parsed release notes into div element
    bodyRef.current.innerHTML = latestReleaseNotes;
    // remove unneeded info
    const allElements = bodyRef.current.childNodes;
    const toRemoveUpToId = "newfeatures";
    for (const element of allElements) {
      if (element.id === toRemoveUpToId) break;
      element.remove();
    }
    // Add <hr> elements below h4s (for divider)
    const headings = bodyRef.current.getElementsByTagName("h4");
    for (const heading of headings) {
      insertAfter(heading, document.createElement("hr"));
    }
  }, []);

  return <div ref={bodyRef}></div>
};

const WhatsNewModal = ({ showModal, setShowModal, latestVersion, latestReleaseNotes }) => {
  return (
    <Modal
      id="whats-new-modal"
      showModal={showModal}
      showHeader={true}
      modalTitle={"What's new in v" + latestVersion}
      modalBody={<WhatsNewModalBody latestReleaseNotes={latestReleaseNotes} />}
      modalFooter={
        <a
          role="link"
          className="link me-auto" // to align to left
          href="#"
          onClick={(e) => {handleClickLink(e, "https://github.com/GovTechSG/purple-hats-desktop/releases/")}}
        >
          See previous versions
          <img id="box-arrow-right" src={boxRightArrow}></img>
        </a>
      }
      setShowModal={setShowModal}
    />
  );
};

export default WhatsNewModal;

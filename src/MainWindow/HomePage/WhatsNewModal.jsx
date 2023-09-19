import Modal from "../../common/components/Modal";
import boxRightArrow from '../../assets/box-right-arrow.png';
import { useEffect, useRef } from "react";

const WhatsNewModalBody = ({ latestReleaseNotes }) => {
  const bodyRef = useRef(null);

  useEffect(() => {
    // inject parsed release notes into div element
    bodyRef.current.innerHTML = latestReleaseNotes;
    // remove unneeded info
    const toRemoveTags = ["#releaseinfo", "#installationguide", "#whatsnew"];
    const toRemoveElements = bodyRef.current.querySelectorAll(toRemoveTags.join(","));
    toRemoveElements.forEach((element) => {
      element.remove();
    });
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
          className="link"
          href="#"
          style={{ marginRight: 'auto' }} // to align to left
          onClick={(e) => {
            console.log(e);
          }}
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

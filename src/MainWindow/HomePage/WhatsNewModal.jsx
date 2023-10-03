import Modal from "../../common/components/Modal";
import boxRightArrow from "../../assets/box-right-arrow.png";
import { useEffect, useRef, createElement } from "react";
import { handleClickLink } from "../../common/constants";

// const WhatsNewModalBody = ({ latestReleaseNotes }) => {
//   const bodyRef = useRef(null);

//   // const insertAfter = (referenceNode, newNode) => {
//   //   referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
//   // };

//   useEffect(() => {
//     // inject parsed release notes into div element
//     const releaseNotesNode = document.createElement("div");
//     releaseNotesNode.innerHTML = latestReleaseNotes;

//     // remove unneeded info
//     const allElements = releaseNotesNode.childNodes;
//     const toRemoveUpToId = "newfeatures";
//     for (const element of allElements) {
//       if (element.id === toRemoveUpToId) break;
//       element.remove();
//     }
//     const headings = releaseNotesNode.getElementsByTagName("h4");
//     const headingsLen = headings.length;
//     const uls = releaseNotesNode.getElementsByTagName("ul");
//     for (let i = 0; i < headingsLen; i++) {
//       const heading = headings[0];
//       const ul = uls[0];
//       heading.removeAttribute("id"); // remove redundant id

//       // group together within a div
//       const whatsNewSection = document.createElement("div");
//       whatsNewSection.classList.add("whats-new-section");
//       whatsNewSection.appendChild(heading);
//       whatsNewSection.appendChild(ul);

//       // put content into final modal body
//       bodyRef.current.appendChild(whatsNewSection);
//     }
//   }, []);

//   return <div ref={bodyRef}></div>;
// };

const WhatsNewModal = ({
  showModal,
  setShowModal,
  latestVersion,
  latestReleaseNotes,
}) => {

  const injectReleaseNotes = (body) => {
    // inject parsed release notes into div element
    const releaseNotesNode = document.createElement("div");
    releaseNotesNode.innerHTML = latestReleaseNotes;

    // remove unneeded info
    const allElements = releaseNotesNode.childNodes;
    const toRemoveUpToId = "newfeatures";
    for (const element of allElements) {
      if (element.id === toRemoveUpToId) break;
      element.remove();
    }

    const headings = releaseNotesNode.getElementsByTagName("h4");
    const headingsLen = headings.length;
    const uls = releaseNotesNode.getElementsByTagName("ul");
    for (let i = 0; i < headingsLen; i++) {
      const heading = headings[0];
      const ul = uls[0];
      heading.removeAttribute("id"); // remove redundant id

      // group together within a div
      const whatsNewSection = document.createElement("div");
      whatsNewSection.classList.add("whats-new-section");
      whatsNewSection.appendChild(heading);
      whatsNewSection.appendChild(ul);

      // put content into final modal body
      body.appendChild(whatsNewSection);
    }
  };

  const injectGithubLink = (body) => {
    const linkElem = document.createElement("a");
    linkElem.href = "#";
    linkElem.role = "link";
    linkElem.onClick = (e) => {
      handleClickLink(
        e,
        "https://github.com/GovTechSG/purple-hats-desktop/releases/"
      );
    };
    const innerHTML = `
      See previous versions <img id="box-arrow-right" src="${boxRightArrow}"></img>
    `
    linkElem.innerHTML = innerHTML;
    body.appendChild(linkElem);
  }

  useEffect(() => {
    const modalBodyNode = document.querySelector("#whats-new-modal .modal-body");
    if (!modalBodyNode || !latestReleaseNotes) return;
    injectReleaseNotes(modalBodyNode);
    injectGithubLink(modalBodyNode);
  }, [latestReleaseNotes]);

  return (
    <Modal
      id="whats-new-modal"
      showModal={showModal}
      showHeader={true}
      modalSizeClass="modal-lg modal-dialog-centered"
      modalTitle={"What's new in v" + latestVersion}
      // modalFooter={
      //   <a
      //     role="link"
      //     className="link me-auto" // to align to left
      //     href="#"
      //     onClick={(e) => {
      //       handleClickLink(
      //         e,
      //         "https://github.com/GovTechSG/purple-hats-desktop/releases/"
      //       );
      //     }}
      //   >
      //     See previous versions
      //     <img id="box-arrow-right" src={boxRightArrow}></img>
      //   </a>
      // }
      setShowModal={setShowModal}
    />
  );
};

export default WhatsNewModal;

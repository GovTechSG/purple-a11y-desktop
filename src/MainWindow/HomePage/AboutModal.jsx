import Alert from "../../common/components/Alert";
import Modal from "../../common/components/Modal";
import Switch from "../../common/components/Switch";
import arrowRepeat from "../../assets/arrow-repeat-white.svg";
import boxRightArrow from "../../assets/box-right-arrow.png";
import labModeOff from "../../assets/lab-icon-off.svg";
import labModeOn from "../../assets/lab-icon-on.svg";
import phLogo from "../../assets/purple-hats-logo.svg";
import { handleClickLink, versionComparator } from "../../common/constants";
import { useEffect, useState } from "react";
import Button from "../../common/components/Button";

const UpdateAlert = ({ latestVer }) => {
  const handleRestartApp = (e) => {
    window.services.restartApp();
  };

  return (
    <Alert alertClassName="alert-custom mb-4">
      <div className="flex-grow-1">
        <h4>Update available ({latestVer})</h4>
        To update, restart Purple HATS.
      </div>
      <Button className="primary align-self-center" onClick={handleRestartApp}>
        Restart
        <img className="ms-2" src={arrowRepeat} alt="" />
      </Button>
    </Alert>
  );
};

const LabModeDescription = ({ isLabMode, setIsLabMode }) => {
  const handleToggleLabMode = (e) => {
    const checked = e.target.checked;
    setIsLabMode(checked);
  };

  return (
    <div className="card">
      <div className="card-body p-3">
        <div className="d-flex gap-2">
          <p className="bold-text card-title">
            <img
              className="me-2"
              src={isLabMode ? labModeOn : labModeOff}
              alt=""
            />
            Lab mode
          </p>
          <Switch isChecked={isLabMode} onChange={handleToggleLabMode} />
        </div>
        <p className="card-text">
          Lab mode grants early access to our pre-releases with existing feature
          improvements and experimental features. These features are not ready
          for public use and may <strong>change, break or disappear</strong> at
          any moment.
        </p>
      </div>
    </div>
  );
};

const ExternalLink = ({ url, children, linkClass }) => {
  const finalClass = `link ${linkClass ? linkClass : ""}`;
  return (
    <a
      role="link"
      className={finalClass}
      href="#"
      onClick={(e) => handleClickLink(e, url)}
    >
      {children}
      <img id="box-arrow-right" src={boxRightArrow} alt=""></img>
    </a>
  );
};

const AppDescription = ({ version, needsUpdate }) => {
  const releaseNotesUrl = `https://github.com/GovTechSG/purple-hats-desktop/releases/tag/${version}`;
  const a11yWebsiteUrl = "https://go.gov.sg/a11y";
  const privacyPolicyUrl = "https://www.tech.gov.sg/privacy/";

  return (
    <div className="mb-4">
      <div className="d-flex gap-3">
        <img id="ph-logo" src={phLogo} alt="Logo of Purple HATS" />
        <div>
          <p className="m-0 bold-text">Purple HATS</p>
          <p className="m-0 d-inline-block me-3">
            Version {version} {!needsUpdate && "(latest stable build)"}
          </p>
          <ExternalLink url={releaseNotesUrl}>See release notes</ExternalLink>
        </div>
      </div>
      <p className="my-2">
        Built by GovTech Accessibility Enabling (A11y) Team.
      </p>
      <div>
        <ExternalLink url={a11yWebsiteUrl} linkClass="me-3">
          A11Y Website
        </ExternalLink>
        <ExternalLink url={privacyPolicyUrl}>Privacy Policy</ExternalLink>
      </div>
    </div>
  );
};

const AboutModal = ({
  showModal,
  setShowModal,
  appVersionInfo,
  isLabMode,
  setIsLabMode,
}) => {
  const { appVersion, latestInfo, latestPrereleaseInfo } = appVersionInfo;
  const [toUpdateVer, setToUpdateVer] = useState(undefined);
  const [needsUpdate, setNeedsUpdate] = useState(true);

  useEffect(() => {
    if (!latestInfo || !latestPrereleaseInfo) {
      // if unable to fetch release info, dont show update alert / "(latest)" label
      setNeedsUpdate(true);
      return setToUpdateVer(undefined);
    }
    const latestVerToUpdate = latestInfo.tag_name;
    const latestPrereleaseToUpdate = latestPrereleaseInfo.tag_name;

    const toCompare = isLabMode ? latestPrereleaseToUpdate : latestVerToUpdate;
    const isNeedUpdate = versionComparator(appVersion, toCompare) === -1;
    setNeedsUpdate(isNeedUpdate);

    if (isNeedUpdate) {
      setToUpdateVer(toCompare);
    } else {
      setToUpdateVer(undefined);
    }
  }, [isLabMode]);

  return (
    <Modal
      id="about-ph-modal"
      showModal={showModal}
      showHeader={true}
      modalBodyClassName="pt-1"
      modalBody={
        <>
          {toUpdateVer && <UpdateAlert latestVer={toUpdateVer} />}
          <AppDescription version={appVersion} needsUpdate={needsUpdate} />
          <LabModeDescription
            isLabMode={isLabMode}
            setIsLabMode={setIsLabMode}
          />
        </>
      }
      modalSizeClass="modal-lg modal-dialog-centered"
      modalTitle="About Purple HATS"
      setShowModal={setShowModal}
    />
  );
};

export default AboutModal;

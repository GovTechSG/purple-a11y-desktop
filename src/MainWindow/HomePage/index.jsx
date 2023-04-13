import a11yLogo from "../../assets/a11y-logo.svg";
import appIllustration from "../../assets/app-illustration.svg";
import InitScanForm from "./InitScanForm";
import { useNavigate } from "react-router";
import "./HomePage.scss";
import services from "../../services";

const HomePage = ({ setCompletedScanId }) => {
  const navigate = useNavigate();

  const startScan = async (scanDetails) => {
    navigate("/scanning");

    const response = await services.startScan(scanDetails);
    if (response.success) {
      setCompletedScanId(response.scanId);
      navigate("/result");
    } else {
      navigate("/error");
    }
  };

  return (
    <div id="home-page">
      <img
        id="a11y-logo"
        src={a11yLogo}
        alt="Logo of the GovTech Accessibility Enabling Team"
      />
      <h1 id="app-title">Accessibility Site Scanner</h1>
      <InitScanForm startScan={startScan} />
      <div id="homepage-bottom-cluster">
        <img
          id="app-illustration"
          src={appIllustration}
          alt="Illustration showing people with sight, hearing, motor and cognitive disabilities"
        />
        <p id="footer-text">Built by GovTech Accessibility Enabling Team</p>
      </div>
    </div>
  );
};

export default HomePage;

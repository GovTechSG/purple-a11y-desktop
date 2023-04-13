import LoadingSpinner from "../../common/components/LoadingSpinner";
import "./ScanningPage.scss";

const ScanningPage = () => {
  return (
    <div id="scanning-page">
      <LoadingSpinner />
      <h1>Please wait while we scan your site...</h1>
    </div>
  );
};

export default ScanningPage;

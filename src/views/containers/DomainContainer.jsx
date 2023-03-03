import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Select from "../components/Select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DomainContainer.css";
import { startScan } from "../../services";

const validUrlRegex = RegExp(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
  return valid;
};

function DomainContainer({ setScanId }) {
  const [state, setState] = useState({
    domain: "",
    scanMethod: "Website",
  });
  const [error, setError] = useState("");
  const [touch, setTouch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!validUrlRegex.test(state.domain) && touch === true) {
      setError("Domain is not valid");
    } else {
      setError("");
    }
  }, [state, touch]);

  const handleTouch = () => {
    setTouch(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(error)) {
      console.error("Invalid Form");
      return;
    }

    navigate("/result", { state: "scanning" });

    const response = await startScan({
      scanType: state.scanMethod.toLowerCase(),
      url: state.domain,
    });
    if (response.success) {
      setScanId(response.scanId);
    } else {
      navigate("/error", { state: { message: response.message } });
    }
  };

  return (
    <>
      <div className="input-fields">
        <div className="select-input">
          <Select
            name={"scanMethod"}
            options={["Website", "Sitemap"]}
            value={state.scanMethod}
            placeholder={
              state.scanMethod === "Website"
                ? "https://www.hive.gov.sg"
                : "https://www.hive.gov.sg/sitemap.xml"
            }
            handleChange={(e) =>
              setState({ ...state, scanMethod: e.target.value })
            }
          />
          <Input
            type={"text"}
            name={"domain"}
            value={state.domain}
            placeholder={
              state.scanMethod === "Website"
                ? "https://www.hive.gov.sg"
                : "https://www.hive.gov.sg/sitemap.xml"
            }
            handleChange={(e) => setState({ ...state, domain: e.target.value })}
            onBlur={handleTouch}
          />
        </div>

        <div className="error">{error}</div>
      </div>
      <p className="btn-area">
        <Button
          type="submit"
          action={handleFormSubmit}
          className={"button-field"}
          title={"Scan Site"}
          disabled={!state.domain || error}
        />
      </p>
    </>
  );
}

export default DomainContainer;

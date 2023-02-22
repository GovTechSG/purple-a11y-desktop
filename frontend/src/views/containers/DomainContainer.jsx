import React from "react";
import axios from "axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Select from "../components/Select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DomainContainer.css";
import { generateRandomToken } from "../../utils";

const validUrlRegex = RegExp(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
  return valid;
};

const checkUrlExists = (url) => {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    xhttp.open("get", proxyurl + url, true);
    console.log(`this is my url: ${proxyurl + url}`);
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200 || xhttp.status === 0) {
          console.log("Url exists");
          resolve(1);
        } else {
          console.error("Url does not exist");
          resolve(2);
        }
      }
    };
    xhttp.send();
  });
};

const setNewScan = (state, randomToken) => {
  var newScan = {};
  if (state.scanMethod === "Sitemap") {
    newScan = {
      sitemapUrl: state.domain,
      randomToken: randomToken,
      call: "/api/sitemap",
    };
  } else if (state.scanMethod === "Website") {
    newScan = {
      domainUrl: state.domain,
      randomToken: randomToken,
      call: "/api/domain",
    };
  }

  return newScan;
};

const crawler = (baseUrl, newScan, setScanResults, navigate) => {
  axios
    .post(baseUrl + newScan.call, newScan)
    .then((res) => {
      console.log(res.status);

      if (res.status === 200) {
        console.log("Success");
        console.log(res.data);
        setScanResults(res.data);
      } else {
        console.log("Failure");
      }
    })
    .catch((err) => {
      navigate("/error", { state: { message: err } });
    });
};

function DomainContainer({ setScanResults }) {
  const [state, setState] = useState({
    domain: "",
    scanMethod: "Website",
  });
  const [error, setError] = useState("");
  const [touch, setTouch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(state);
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
    if (validateForm(error)) {
      console.info("Valid Form");
      console.log(`Domain: ${state.domain}`);

      const CURRENT_ENV = process.env.REACT_APP_ENV;
      var CURRENT_BASE_URL = "";
      navigate("/result", { state: "scanning" });

      if (CURRENT_ENV === "local") {
        CURRENT_BASE_URL = process.env.REACT_APP_LOCAL_BASE_URL;

        const res = await checkUrlExists(state.domain);
        if (res === 1) {
          const randomToken = generateRandomToken();
          console.log("url checked and valid");

          const newScan = setNewScan(state, randomToken);
          crawler(CURRENT_BASE_URL, newScan, setScanResults, navigate);
        } else {
          console.error("url checked and invalid");
          navigate("/error", { state: { message: "Invalid URL" } });
        }
      } else {
        if (CURRENT_ENV === "dev") {
          CURRENT_BASE_URL = process.env.REACT_APP_DEV_BASE_URL;
        } else {
          CURRENT_BASE_URL = process.env.REACT_APP_PROD_BASE_URL;
        }
        const checkDomain = {
          url_to_check: state.domain,
        };

        axios
          .post(CURRENT_BASE_URL + "/api/check", checkDomain)
          .then((res) => {
            const randomToken = generateRandomToken();
            console.log("url checked and valid");

            const newScan = setNewScan(state, randomToken);
            crawler(CURRENT_BASE_URL, newScan, setScanResults, navigate);
          })
          .catch((err) => {
            console.log("url checked and invalid");
            console.log("error from response: ", err.message);
            if (err.message === "Request failed with status code 400") {
              navigate("/error", { state: { message: "Invalid URL" } });
            } else if (err.message === "Network Error") {
              navigate("/error", { state: { message: "Network Error" } });
            }
          });
      }
    } else {
      console.error("Invalid Form");
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

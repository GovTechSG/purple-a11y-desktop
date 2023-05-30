import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import Button from "../common/components/Button";
import ConnectionNotification from "./ConnectionNotification";
import "./MainWindow.css";

const MainWindow = ({ appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);

  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [promptUserData, setPromptUserData] = useState(false);
  const [userInputErrorMessage, setUserInputErrorMessage] = useState('');

  useEffect(() => {
      window.services.userDataExists((status) => {
        console.log("checking if user data exists");
        if (status === "doesNotExist") {
          setPromptUserData(true); 
        } else {
          setPromptUserData(false);
        }
      })
  }, []);

  const handleSetUserData = () => {
    const invalidName = (name === null || name.trim() === ''); 
    const invalidEmail = (email === null || email.trim() === '' || !isValidEmail(email));

    if (invalidEmail || invalidName) {
      setUserInputErrorMessage("Invalid name or email.");
      // return;
    } else {
      window.services.setUserData({name: name, email: email, autoSubmit: true});
      setPromptUserData(false);
    }
  }

  const isValidEmail = (email) => {
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    return regex.test(email);
  }

  if (promptUserData) {
    return (
        <div id="home-page">
          <h1>Please enter your user details</h1>
          {userInputErrorMessage && (<p className="error-text">{userInputErrorMessage}</p>)}
          <form>
            <label for="name">Name</label>
            <input type="text" id="name" onChange={(e) => setName(e.target.value)}></input><br/>
            <label for="email">Email</label>
            <input type="text" id="email" onChange={(e) => setEmail(e.target.value)}></input>
            <Button
              id="submit-button"
              type="submit"
              onClick={handleSetUserData}
            >
              Submit
            </Button>
          </form>
        </div>
    );
  } 
  return (
    <>
      <ConnectionNotification />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                appVersion={appVersion}
                setCompletedScanId={setCompletedScanId}
              />
            }
          />
          <Route path="/scanning" element={<ScanningPage />} />
          <Route
            path="/result"
            element={<ResultPage completedScanId={completedScanId} />}
          />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default MainWindow;

import { useEffect, useState } from "react";
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import ErrorPage from "./ErrorPage";
import ScanningPage from "./ScanningPage";
import ResultPage from "./ResultPage";
import Button from "../common/components/Button";
import ConnectionNotification from "./ConnectionNotification";
import services from "../services";
import "./MainWindow.css";


const MainWindow = ({ appVersion }) => {
  const [completedScanId, setCompletedScanId] = useState(null);

  const [email, setEmail] = useState(''); 
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);
  const [userInputErrorMessage, setUserInputErrorMessage] = useState('');

  useEffect(() => {
      window.services.userDataExists((status) => {
        setStatus(status);
      })
  }, []);

  const handleSetUserData =  (event) =>  {
    event.preventDefault();

    if (!services.isValidEmail(email)) {
      setUserInputErrorMessage('Please enter a valid email.'); 
      return;
    }

    window.services.setUserData({name: name, email: email, autoSubmit: true});
    setStatus("exists");
  }

  if (status === "doesNotExist") {
    return (
        <div id="home-page">
          <h1>Please enter your user details</h1>
          {userInputErrorMessage && (<p className="error-text">{userInputErrorMessage}</p>)}
          <form onSubmit={(e) => handleSetUserData(e)}>
            <label for="name">Name</label>
            <input type="text" id="name" onChange={(e) => setName(e.target.value)}></input><br/>
            <label for="email">Email</label>
            <input type="text" id="email" onChange={(e) => setEmail(e.target.value)}></input>
            <Button
              id="submit-button"
              type="submit"
            >
              Submit
            </Button>
          </form>
        </div>
    );
  } 

  if (status === "exists") {
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

  return null;
}


export default MainWindow;

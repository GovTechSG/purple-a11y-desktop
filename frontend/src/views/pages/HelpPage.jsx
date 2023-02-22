import React, { useState, useEffect } from "react";
import HelpHeader from "../components/HelpHeader";
import HelpTab from "../components/HelpTab";
import HelpFooter from "../components/HelpFooter";

function HelpPage(props) {
  const [tab, setTab] = useState(1)
  // console.log("Getting from tab store:", (localStorage.getItem("tabstore")));

  useEffect(() => {
    if (localStorage.getItem("tabstore") === null) {
      setTab(1)
    } else {
      setTab(Number(localStorage.getItem("tabstore")));
    }
    localStorage.removeItem('tabstore');
  }, []);

  return (
    <>
      <div className='no-bg'>
        <HelpHeader />
        <HelpTab value={tab} />
        <HelpFooter />
      </div>
    </>
  )
}

export default HelpPage;

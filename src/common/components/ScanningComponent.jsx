import { useEffect, useState } from "react";
import LoadingSpinner from "../../common/components/LoadingSpinner";
import checkIcon from "../../assets/check-circle.svg";
import LoadingScanningStatus from "./LoadingScanningStatus";

const ScanningComponent = ({scanningMessage}) => {
  const [urls, setUrls] = useState(new Array());
  const [urlItems, setUrlItems] = useState(new Array());
  const [pagesScanned, setPagesScanned] = useState(0);

//   const testLoadingUrls = [
//     "https://tech.gov.sghttps://tech.gov.sghttps://tech.gov.sg", 
//     "https://www.cpf.gov.sg/memberhttps://www.cpf.gov.sg/member", 
//     "https://ticketmaster.sg/https://ticketmaster.sg/https://ticketmaster.sg/", 
//     "https://www.crowdtask.gov.sg/https://www.crowdtask.gov.sg/", 
//   ]

//   const testCompletedUrls = [
//     "https://www.ntu.edu.sg/https://www.ntu.edu.sg/", 
//     "https://www.starbucks.com.sg/https://www.starbucks.com.sg/", 
//     "https://www.mcdonalds.com.sg/https://www.mcdonalds.com.sg/", 
//     "https://www.teamsingapore.sg/https://www.teamsingapore.sg/", 
//     "https://www.mom.gov.sg/https://www.mom.gov.sg/",
//   ]
  useEffect(() => {
    // const urlTestItems = [
    //     ...testLoadingUrls.map((url, index) => <InProgressUrlComponent key={index} url={url}></InProgressUrlComponent>), 
    //     ...testCompletedUrls.map((url, index) => <CompletedUrlComponent key={index} url={url}></CompletedUrlComponent>)
    // ]
    // setUrlItems(urlTestItems);
    window.services.scanningUrl((url) => {
      setPagesScanned(urls.length);

      const newUrls = [url, ...urls];
      setUrls(newUrls);
      
      console.log(urls);
      const newUrlItems = [
        <InProgressUrlComponent key={urlItems.length} url={url}/>,
         ...urls.map((url, index) => <CompletedUrlComponent key={index} url={url}/>), 
      ] 
      setUrlItems(newUrlItems);
    })
  })

  const InProgressUrlComponent = ({key, url}) => {
    return (
      <li className="scanning-url-list-item fade-in" key={key}>
        <LoadingSpinner></LoadingSpinner>
        <p className="scanning-url">{url}</p>
      </li>
    )
  }

  const CompletedUrlComponent = ({key, url}) => {
   return (
    <li className="scanning-url-list-item fade-in-top" key={key}>
      <img className="scanning-check-icon" src={checkIcon}></img>
      <p className="scanning-url">{url}</p>
    </li>
   )
  }

  return (
    <div className="scanning-component">
      { urls.length > 0 
        ?
        <>
          <h1 className="scanning-url-title">Scanned: {pagesScanned} pages</h1>
          <ul className="scanning-url-list">{urlItems}</ul> 
        </>
        : <LoadingScanningStatus scanningMessage={scanningMessage} />
      }
    </div>
  );
};

export default ScanningComponent;

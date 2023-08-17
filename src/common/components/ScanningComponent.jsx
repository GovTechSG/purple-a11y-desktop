import { useEffect, useState } from "react";
import LoadingSpinner from "../../common/components/LoadingSpinner";
import checkIcon from "../../assets/check-circle.svg";
import slashCircleIcon from "../../assets/slash-circle.svg";
import crossCircleIcon from "../../assets/cross-circle.svg";
import LoadingScanningStatus from "./LoadingScanningStatus";

const ScanningComponent = ({scanningMessage}) => {
  const [scannedItems, setScannedItems] = useState([]);
  const [urlItems, setUrlItems] = useState([]);
  const [urlItemComponents, setUrlItemComponents] = useState([]);
  const [pagesScanned, setPagesScanned] = useState(0);
  const [displayPageNum, setDisplayPageNum] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);

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
      if (!scanCompleted) {
        window.services.scanningUrl((urlItem) => {
          setDisplayPageNum(pagesScanned);
          if (urlItem.status === 'scanned') {
            setPagesScanned(pagesScanned + 1);  
          }
          
          const newUrlItems = [urlItem, ...urlItems];
          setUrlItems(newUrlItems);
    
          console.log(newUrlItems);
          const newUrlItemComponents = [
             ...newUrlItems.map((urlItem, index) => <UrlItemComponent index={index} urlItem={urlItem}/> )
          ] 
          setUrlItemComponents(newUrlItemComponents);
        });
    
        window.services.scanningCompleted(() => {
            setDisplayPageNum(pagesScanned);
            const completedUrlItems = [
              ...urlItems.map((urlItem, index) => <UrlItemComponent index={index} urlItem={urlItem} scanCompleted={true}/>)
            ]
            setUrlItemComponents(completedUrlItems);
            setScanCompleted(true);
        })
      }
  })

  const UrlItemComponent = ({index, urlItem, scanCompleted}) => {
    const isMostRecent = index === 0; 
    const urlItemClassName = !isMostRecent ? "scanning-url-list-item fade-in-top" : "scanning-url-list-item"; 
    const statusIcon = () => {
      if (isMostRecent && !scanCompleted) {
        return <LoadingSpinner></LoadingSpinner>
      } else {
        switch (urlItem.status) {
          case 'scanned': {
            return <img className="scanning-check-icon" src={checkIcon}></img>; 
          }
          case 'skipped': {
            return <img className="scanning-check-icon" src={slashCircleIcon}></img>
          }
          case 'error': {
            return <img className="scanning-check-icon" src={crossCircleIcon}></img>
          }
        }
      }
    }
    return (
      <li className={urlItemClassName} key={index}> 
        {statusIcon()}
        <p className="scanning-url">{urlItem.url}</p>
      </li>
    )
  }
  return (
    <div className="scanning-component">
      { urlItems.length > 0 
        ?
        <>
          <h1 className="scanning-url-title">Scanned: {displayPageNum} pages</h1>
          <div className="scanning-url-list-container">
            <ul className="scanning-url-list">{urlItemComponents}</ul> 
            <div className="blurred-overlay"></div>
          </div>
        </>
        : <LoadingScanningStatus scanningMessage={scanningMessage} />
      }
    </div>
  );
};

export default ScanningComponent;

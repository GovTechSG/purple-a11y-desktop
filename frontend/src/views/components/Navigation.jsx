import React from "react";
import "sgds-govtech/css/sgds.css";

const Navigation = (props) => {
  return (
    <>
      <div>
        <main>
          <div className="sgds-masthead">
            <a
              href="https://www.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sgds-icon sgds-icon-sg-crest"></span>
              <span className="is-text">
                A Singapore Government Agency Website
              </span>
            </a>
          </div>

          {props.children}
        </main>
      </div>
    </>
  );
}

export default Navigation;

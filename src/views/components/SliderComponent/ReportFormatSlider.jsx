import React from "react";
import "../../../styles/Slider.css";
import ReportImg from "../../../assets/report-img.svg";

const ReportFormatSlider = () => {
  return (
    <div className="slider">
      <div className="intro">
        <h2 className="body-title">Report Format</h2>
        <p>Everything you need to know about our accessibility report.</p>
        <hr></hr>
        <h3>Overview</h3>
        <p>
          Our testing tool uses{" "}
          <a
            href="https://www.deque.com/axe/"
            target="_BLANK"
            rel="noopener noreferrer"
          >
            axe-core
          </a>{" "}
          library to audit your site for web accessibility issues. After the
          scan, it will generate a report in HTML format which lists all the
          issues in a table view.
        </p>
        <img className="report-img" src={ReportImg} alt="report"></img>
      </div>
      <hr></hr>
      <div className="table-info">
        <h3>Table columns</h3>
        <table>
          <tbody>
            <tr>
              <th>IMPACT</th>
              <td>
                indicates the severity of the issue as classified by axe-core.
              </td>
            </tr>
            <tr>
              <th>ISSUE</th>
              <td>
                indicates the issue description with its corresponding WCAG
                indices.
              </td>
            </tr>
            <tr>
              <th>PAGE</th>
              <td>points to the URL of the page with the issue.</td>
            </tr>
            <tr>
              <th>HTML ELEMENT</th>
              <td>code snippet of the issue.</td>
            </tr>
            <tr>
              <th>HELP URL</th>
              <td>
                link to the Deque University website that details how to fix the
                issue.
              </td>
            </tr>
            <tr>
              <th>FIXED?</th>
              <td>
                visual tracking feature to check off the issues that have been
                fixed.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportFormatSlider;

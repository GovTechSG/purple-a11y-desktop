import React, { Component } from 'react';
import '../../../styles/Slider.css';
// eslint-disable-next-line
import { BrowserRouter as Router, Link } from 'react-router-dom';

export default class AboutSlider extends Component {

  render() {
    return (
      <div className='slider'>
        <div className='intro'>
          <h2 className='body-title'>About this tool</h2>
          <p>The HATS Accessibility Testing Tool helps you to:
          <ul>
              <li>test your site for accessibility issues,</li>
              <li>check your site against WCAG 2.1 standards.</li>
            </ul></p>
          <p>The scan will generate an HTML report.  Learn how it works
          <Link className="read-more"
              onClick={(e) => { localStorage.setItem("tabstore", 1); window.location.reload() }}
              to={{
                pathname: '/about'
              }}> here</Link>
          </p>
          <hr></hr>
          <h3>Why is accessibility important?</h3>
          <p>When we design for accessibility, everyone benefits.</p>
          <p>For example, providing video captions helps both people with hearing disabilities and anyone who wants to watch a video without sound.</p>
          <p>Accessibility also affects everyone — this includes you.</p>
          <p>We may all experience temporary or situational disabilities — illness, injury or even something as simple as not being able to see well due to bright sunlight.</p>
          <p>It’s important for services to support a wide range of needs and experiences.</p>
        </div>
      </div>
    );
  }
}

import React from "react";

import "./Footer.css";

const Footer = () => (
  <>
    <div className="footer-block"></div>
    <div className="footer">
      <div className="footer-container">
        <p>
        Voir ce projet sur{" "}
          <a
            className="profile"
            href="https://github.com/Adrabalde"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
        <p>
          Fait avec <i className="fas fa-heartbeat" /> par{" "}
          <a
            className="profile"
            href="https://github.com/Adrabalde"
            target="_blank"
            rel="noopener noreferrer"
          >
           Abdourahamane BALDE
          </a>
        
        </p>
      </div>
    </div>
  </>
);

export default Footer;

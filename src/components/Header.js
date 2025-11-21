import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src="/images/logo/econuza-logo.png" alt="ECONUZA" className="logo-img" />
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#home">HOME</a></li>
              <li><a href="#how-it-works">HOW IT WORKS</a></li>
              <li><a href="#mission">MISSION</a></li>
              <li><a href="#impact">IMPACT</a></li>
              <li><button className="register-btn" onClick={() => alert('Registration form coming soon!')}>REGISTER YOUR CLUB</button></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';

const Hero = () => {
  return (
    <section className="hero" style={{backgroundImage: "url('/images/hero/hero-background.jpg')"}} id="home">
      <div className="container">
        <div className="hero-content">
          <h1>GROW TREES<br />MOTIVATE STUDENTS<br />REWARD SUCCESS</h1>
          <p>EcoKuza helps schools track tree planting, monitor growth, and compete nationally so students and 4K Clubs stay motivated and recognized.</p>
          <button className="hero-btn" onClick={() => document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'})}>Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import React from 'react';

const EmpoweringSchools = () => {
  return (
    <section className="empowering-schools" id="mission">
      <div className="container">
        <div className="section-header">
          <h2>Empowering Schools to<br />Grow and Protect Trees,<br />Together</h2>
          <p>EcoKuza helps schools build active 4K clubs by making tree planting simple, guided and exciting.</p>
          <p>We believe every school can become a leader in environmental action when given the right tools.</p>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature-image">
              <img src="/images/features/strong-clubs.jpg" alt="Strong Environmental Clubs" />
            </div>
            <h3>Strong Environmental Clubs</h3>
            <p>Activities, Challenges, and Mentorship Built-in</p>
          </div>
          <div className="feature">
            <div className="feature-image">
              <img src="/images/features/simple-tools.jpg" alt="Simple Tools for Real Impact" />
            </div>
            <h3>Simple Tools for Real Impact</h3>
            <p>Easy Tree Tracking for Teachers and Students</p>
          </div>
          <div className="feature">
            <div className="feature-image">
              <img src="/images/features/collaboration.jpg" alt="Collaboration That Works" />
            </div>
            <h3>Collaboration That Works</h3>
            <p>Schools, NGOs and Government Aligned under One Platform</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmpoweringSchools;
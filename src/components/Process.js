import React from 'react';

const Process = () => {
  return (
    <section className="process">
      <div className="container">
        <h2>A simple process that helps schools plant, monitor, and grow more surviving trees.</h2>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Plant and Record</h3>
            <p>The Club Mentor Uploads tree Photos with GPS using the EcoKuza App</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Verifies Growth</h3>
            <p>AI and Satellite Checks and Confirms the Trees are Real and Grown</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Earn Points and Rewards</h3>
            <p>Schools Climb Leader-boards and Receive Recognition from NGOs and Government Partners</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
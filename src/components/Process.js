import React from 'react';

const Process = () => {
  return (
    <section className="process" id="how-it-works">
      <div className="container">
        <h2 id="process-header">A simple process that helps schools plant, monitor, and grow more surviving trees.</h2>
        <div className="process-steps">
          <div className="step" id="step-1">
            <div className="step-icon">
              <img src="/images/process/step1-plant.png" alt="Plant and Record" />
            </div>
            <h3>Plant and Record</h3>
            <p>The Club Mentor Uploads tree Photos with GPS using the EcoKuza App</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <img src="/images/process/step2-ai.png" alt="AI Verifies Growth" />
            </div>
            <h3>AI Verifies Growth</h3>
            <p>AI and Satellite Checks and Confirms the Trees are Real and Grown</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <img src="/images/process/step3-rewards.png" alt="Earn Points and Rewards" />
            </div>
            <h3>Earn Points and Rewards</h3>
            <p>Schools Climb Leader-boards and Receive Recognition from NGOs and Government Partners</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
import React from 'react';

const EnvironmentAction = () => {
  return (
    <section className="environment-action" id="impact">
      <div className="container">
        <div className="section-header">
          <h2>Real Environment Action That Can Be Seen and Measured</h2>
        </div>
        <div className="benefits">
          <div className="benefit">
            <div className="benefit-icon">
              <img src="/images/icons/tree-icon.svg" alt="More Trees Surviving - Verified tree growth icon" loading="lazy" />
            </div>
            <h3>More Trees Surviving</h3>
            <p>Tree Growth Is Verified<br />Through AI + Photos + Satellite</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon">
              <img src="/images/icons/growth-icon.svg" alt="Active and Motivated Schools - Growth and motivation icon" loading="lazy" />
            </div>
            <h3>Active and Motivated Schools</h3>
            <p>Leader-boards and Rewards<br />Drive Consistent Participation</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon">
              <img src="/images/icons/tree-icon.svg" alt="Trusted Environmental Data - Data verification icon" loading="lazy" />
            </div>
            <h3>Trusted Environmental Data</h3>
            <p>NGOs and Government Get Verified Reports for Planning and Awards</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentAction;
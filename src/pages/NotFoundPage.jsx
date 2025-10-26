import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <section className="page_404">
      <div className="nf_container">
        <div className="nf_row">
          <div className="nf_col">
            <div className="four_zero_four_bg">
              <h1 style={{position: "relative", top:"-100px"}} className="text-center">404</h1>
            </div>

            <div className="contant_box_404">
              <h3 className="h2">Looks like you're lost</h3>
              <p>The page you are looking for is not available!</p>

              <Link to="/" className="link_404">Go to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;

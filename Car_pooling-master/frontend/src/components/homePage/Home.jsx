import React from "react";
import "./Home.css";
import Reviews from "../Reviews/Reviews";
import Footer from "../footer/Footer";
import Chatbox from "../chatbot/Chatbox";
import { useNavigate } from "react-router-dom";
import video from "./car.mp4";

const Home = ({ token }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/drive");
  };
  return (
    <div className="app">
      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <video width="750" height="500"  controls autoPlay loop muted> 
              <source src={video} type="video/mp4" />
            </video>
            <h2 className="hero-text">Find Your Ride</h2>
            <p className="hero-description">
              Join the carpooling community and enjoy a comfortable and
              eco-friendly ride to your destination.
            </p>
            <button onClick={handleClick} className="cta-button">
              Get Started
            </button>
          </div>
        </section>
        <Chatbox />
        <div className="Features-sec">
          <h3>Features</h3>
          <section className="features">
            <div className="feature">
              <h3>Save Money</h3>
              <p>
                Share the cost of your journey and save money on transportation
                expenses.
              </p>
            </div>
            <div className="feature">
              <h3>Reduce Carbon Footprint</h3>
              <p>
                Contribute to a greener environment by sharing rides and
                reducing the number of individual cars on the road.
              </p>
            </div>
            <div className="feature">
              <h3>Connect with Others</h3>
              <p>
                Meet new people and build connections with fellow commuters
                during your rides.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Reviews />
      <Footer />
    </div>
  );
};

export default Home;

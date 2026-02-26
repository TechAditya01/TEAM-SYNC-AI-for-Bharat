import React from 'react';
import {
  About,
  Features,
  Footer,
  Hero,
  Navbar,
  WhatsAppIntegration,
} from '../components/LandingPages';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Navbar />
      <Hero />
      <Features />
      <WhatsAppIntegration />
      <About />
      <Footer />
    </div>
  );
};

export default HomePage;

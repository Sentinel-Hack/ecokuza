import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Process from './components/Process';
import EmpoweringSchools from './components/EmpoweringSchools';
import EnvironmentAction from './components/EnvironmentAction';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Process />
      <EmpoweringSchools />
      <EnvironmentAction />
      <Footer />
    </div>
  );
}

export default App;
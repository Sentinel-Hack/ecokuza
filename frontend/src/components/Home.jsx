import React from 'react';
import { TreePine, Award, Globe, Sprout, Wrench, Link, Trophy } from 'lucide-react';
import HeroImg from '../assets/heroimage.jpg';
import PlantingImg from '../assets/img1.jpg';
import VerificationImg from '../assets/img2.jpg';
import RewardsImg from '../assets/img3.jpg';
import Logo from '../assets/logo.jpg';

export default function App() {
  return (
       <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#6DA704] px-12 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="EcoKuza Logo" className="h-8 w-8" />
          <div className="text-black text-xl font-medium">
            ECO<span className="text-white">KUZA</span>
          </div>
        </div>

        <nav className="hidden md:flex gap-10 items-center">
          <a href="#home" className="text-white uppercase text-sm hover:text-black transition">Home</a>
          <a href="#how-it-works" className="text-white uppercase text-sm hover:text-black transition">How It Works</a>
          <a href="#mission" className="text-white uppercase text-sm hover:text-black transition">Mission</a>
          <a href="#impact" className="text-white uppercase text-sm hover:text-black transition">Impact</a>

          <button className="border-2 border-white text-white px-6 py-2 text-xs uppercase tracking-wide hover:bg-white hover:text-[#7ab800] transition">
            Register Your Club
          </button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="min-h-screen bg-gradient-to-b from-[#6DA704] to-[#6a9f00] pt-32 pb-20 px-12 flex flex-col md:flex-row items-center gap-20">
        <div className="flex-1 text-black">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3D4F22] mb-2 leading-tight">GROW TREES</h2>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 leading-tight">MOTIVATE STUDENTS</h1>
          <h3 className="text-4xl md:text-5xl font-bold text-[#3D4F22] mb-8 leading-tight">REWARD SUCCESS</h3>

          <p className="text-lg leading-relaxed mb-10 text-gray-100">
            EcoKuza helps schools track tree planting, monitor growth, and compete
            nationally so students and 4K Clubs stay motivated and recognized.
          </p>

          <button className="border-2 border-[#3D4F22] text-[#3D4F22] px-8 py-3 font-semibold hover:bg-[#3D4F22] hover:text-white transition bg-transparent">
            Get Started
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <img
            className="rounded-xl max-w-full shadow-lg"
            src={HeroImg}
            alt="Students planting trees"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-black text-white px-12 py-28">
        <h2 className="text-center text-4xl font-light mb-20 leading-snug">
          A simple process that helps schools plant, monitor, and<br />
          grow more surviving trees.
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="flex flex-col">
            <img
              src={PlantingImg}
              alt="Plant and Record"
              className="w-full h-72 object-cover rounded-t"
            />
            <div className="bg-gradient-to-b from-[#6DA704] to-[#6a9f00] text-center text-white py-6 px-4 rounded-b">
              <h3 className="font-bold text-lg mb-3">Plant and Record</h3>
              <p className="text-sm leading-relaxed">
                The Club Mentor uploads tree photos with GPS using the EcoKuza App.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col">
            <img
              src={VerificationImg}
              alt="AI Verifies Growth"
              className="w-full h-72 object-cover rounded-t"
            />
            <div className="bg-gradient-to-b from-[#6DA704] to-[#6a9f00] text-center text-white py-6 px-4 rounded-b">
              <h3 className="font-bold text-lg mb-3">AI Verifies Growth</h3>
              <p className="text-sm leading-relaxed">
                AI and satellite confirm the trees are real and growing.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col">
            <img
              src={RewardsImg}
              alt="Earn Points and Rewards"
              className="w-full h-72 object-cover rounded-t"
            />
            <div className="bg-gradient-to-b from-[#6DA704] to-[#6a9f00] text-center text-white py-6 px-4 rounded-b">
              <h3 className="font-bold text-lg mb-3">Earn Points and Rewards</h3>
              <p className="text-sm leading-relaxed">
                Schools climb leaderboards and receive recognition from NGOs and Government Partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="bg-black text-white px-12 py-28">
        <div className="grid md:grid-cols-2 gap-20 max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl mb-8 font-light leading-relaxed">
              Empowering Schools to Grow and Protect Trees, <span className="border-b-4 border-white-400">Together</span>
            </h2>
            <p className="text-gray-300 mb-6">
              EcoKuza helps schools build active 4K clubs by making tree planting simple and exciting.
            </p>
            <p className="text-gray-300">
              We believe every school can become a leader in environmental action when given the right tools.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-transparent border-2 border-gray-600 p-6 rounded-lg">
              <Sprout color="white" size={28} className="mb-3" />
              <h3 className="text-lg font-semibold text-white mb-3">
                Strong Environmental Clubs
              </h3>
              <div className="border-b border-gray-600 mb-3"></div>
              <p className="text-gray-300 text-sm">
                Activities, challenges, and mentorship built-in.
              </p>
            </div>

            <div className="bg-transparent border-2 border-gray-600 p-6 rounded-lg">
              <Wrench color="white" size={28} className="mb-3" />
              <h3 className="text-lg font-semibold text-white mb-3">
                Simple Tools for Real Impact
              </h3>
              <div className="border-b border-gray-600 mb-3"></div>
              <p className="text-gray-300 text-sm">
                Easy tree tracking for teachers and students.
              </p>
            </div>

            <div className="bg-transparent border-2 border-gray-600 p-6 rounded-lg">
              <Link color="white" size={28} className="mb-3" />
              <h3 className="text-lg font-semibold text-white mb-3">
                Collaboration That Works
              </h3>
              <div className="border-b border-gray-600 mb-3"></div>
              <p className="text-gray-300 text-sm">
                Schools, NGOs, and government aligned on one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="bg-gradient-to-b from-[#6DA704] to-[#6a9f00] text-white px-12 py-28">
        <h2 className="text-center text-4xl font-light mb-20">
          Real Environment Action That Can Be Seen and Measured
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="bg-white text-black p-12 flex flex-col gap-6 text-center rounded-xl">
            <TreePine color="#6DA704" size={28} className="mx-auto" />
            <h3 className="font-bold text-xl">More Trees Surviving</h3>
            <p className="text-gray-600 text-sm">
              Tree growth verified through AI, photos, and satellite.
            </p>
          </div>

          <div className="bg-white text-black p-12 flex flex-col gap-6 text-center rounded-xl">
            <Trophy color="#6DA704" size={28} className="mx-auto" />
            <h3 className="font-bold text-xl">Active & Motivated Schools</h3>
            <p className="text-gray-600 text-sm">
              Leaderboards and rewards drive engagement.
            </p>
          </div>

          <div className="bg-white text-black p-12 flex flex-col gap-6 text-center rounded-xl">
            <Globe color="#6DA704" size={28} className="mx-auto" />
            <h3 className="font-bold text-xl">Trusted Environmental Data</h3>
            <p className="text-gray-600 text-sm">
              NGOs and government receive verified reports.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t-2 border-[#6DA704] py-16 text-white">
        <div className="flex flex-col items-center gap-10">
          <nav className="flex flex-col gap-4 text-center">
            <a href="#home" className="uppercase text-sm hover:text-[#6DA704]">Home</a>
            <a href="#how-it-works" className="uppercase text-sm hover:text-[#6DA704]">How It Works</a>
            <a href="#mission" className="uppercase text-sm hover:text-[#6DA704]">Mission</a>
            <a href="#impact" className="uppercase text-sm hover:text-[#7ab800]">Impact</a>
          </nav>

          <div>
            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
              <path d="M19 0h-14c-3 0-5 2-5 5v14c0 3 2 5 5 5h14c3 0 5-2 5-5v-14c0-3-2-5-5-5zm-11 19h-3v-11h3zm-1.5-12c-1 0-1.75-.8-1.75-1.8s.75-1.7 1.75-1.7 1.75.8 1.75 1.7-.75 1.8-1.75 1.8zm13.5 12h-3v-6c0-3.4-4-3.1-4 0v6h-3v-11h3v2c1.4-2.6 7-2.8 7 2.5z" />
            </svg>
          </div>

          <div className="text-sm text-gray-400">NAIROBI, KENYA</div>

          <div className="w-full h-px bg-gray-800"></div>

          <div className="text-xs tracking-widest text-gray-500">
            © 2025 ECOKUZA. ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
import React from 'react';
import AboutRentMate, { FooterCTA } from '../../components/home/AboutRentMate.jsx';

export default function About() {
  return (
    <div className="space-y-12 pb-12">
      {/* Visual Header for the About page */}
      <section className="relative rounded-3xl overflow-hidden brand-gradient text-white py-16 px-6 sm:px-12 text-center shadow-xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
            About RentMate
          </h1>
          <p className="text-base sm:text-lg text-slate-100 max-w-xl mx-auto font-medium">
            Learn more about our mission to make co-living and rental accommodations seamless and direct.
          </p>
        </div>
      </section>

      {/* Main Content Component */}
      <AboutRentMate />

      {/* Action Footer */}
      <FooterCTA />
    </div>
  );
}

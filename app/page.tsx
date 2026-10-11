'use client';

import { useState, useEffect, useRef } from 'react';
import DriverDetection from '@/components/DriverDetection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Driver Safety Monitor
          </h1>
          <p className="text-lg text-purple-200">
            AI-powered drowsiness and distraction detection
          </p>
        </header>
        <DriverDetection />
      </div>
    </div>
  );
}

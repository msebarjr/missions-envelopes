'use client';

import React, { useState } from 'react';
import './animated-envelope.css'; // see CSS below, or include as module styles

export default function AnimatedEnvelope() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`animated-envelope ${!open ? 'open' : ''}`}
      onClick={() => setOpen((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
      }}
      role='button'
      tabIndex={0}
      aria-pressed={open}
      aria-label={open ? 'Envelope open' : 'Envelope closed'}
      title={open ? 'Click to close' : 'Click to open'}
    >
      {/* Inline SVG for envelope.
          Structure:
           - group .letter for the paper inside (we'll animate translateY)
           - group .body for the body of envelope
           - group .flap for the top flap (we'll rotate it around its hinge)
      */}
      <svg
        viewBox='0 0 200 140'
        width='200'
        height='140'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
      >
        {/* envelope body */}
        <g className='body'>
          <path
            d='M20 50 L100 98 L180 50 L180 108 L20 108 Z'
            fill='#5282b8f9'
            stroke={open ? '#d8e0f5' : ''}
            strokeWidth={open ? '1' : 0}
          />
          {/* lower flap shading */}
          <path
            d='M20 48 L100 98 L180 48'
            fill={open ? '#fff' : '#5282b8f9'}
            opacity='0.9'
          />
        </g>

        {/* top flap (the one that opens) - make sure transform-origin matches hinge */}
        <g className='flap'>
          <path
            d='M20 50 L100 8 L180 50 L100 80 Z'
            fill={open ? '#5282b8f9' : '#fff'}
            stroke='#d8e0f5'
            strokeWidth={open ? '1' : 0}
          />
        </g>

        {/* Paper/letter - rendered after flap so we can animate it above the flap when open */}
        <g className='letter' transform='translate(0,0)'>
          <rect
            x='30'
            y='34'
            rx='4'
            ry='4'
            width='140'
            height='82'
            fill='#fffbe6'
            stroke='#e3dcb2'
          />
          {/* optional lines to look like a letter */}
          <g fill='#e4d9b4' opacity='0.6'>
            <rect x='46' y='52' width='108' height='6' rx='3' />
            <rect x='46' y='66' width='88' height='6' rx='3' />
            <rect x='46' y='80' width='68' height='6' rx='3' />
          </g>
        </g>
      </svg>
    </div>
  );
}

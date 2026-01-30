'use client';

import React from 'react';
import { FaRegEnvelope, FaRegEnvelopeOpen } from 'react-icons/fa6';
import './icon-envelope.css';

// IconEnvelope: controlled component. Parent can pass `isOpen`, `onChangeOpen`,
// and an optional `rootRef` to read the DOM rect from outside.
export default function IconEnvelope({
  num,
  isOpen = false,
  onChangeOpen,
  onRequestOpen,
  rootRef,
}: {
  num?: number;
  isOpen?: boolean;
  onChangeOpen?: (next: boolean) => void;
  onRequestOpen?: (info: { num?: number; rect: DOMRect }) => void;
  rootRef?: (el: HTMLDivElement | null) => void;
}) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  function toggleOpen() {
    const next = !isOpen;
    if (next && onRequestOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      onRequestOpen({ num, rect });
    }
    if (onChangeOpen) onChangeOpen(next);
  }

  return (
    <div
      className={`icon-envelope ${isOpen ? 'open' : ''}`}
      role='button'
      tabIndex={0}
      aria-pressed={isOpen}
      aria-label={isOpen ? 'Envelope open' : 'Envelope closed'}
      onClick={toggleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleOpen();
        }
      }}
    >
      <div
        className='icons'
        ref={(el) => {
          wrapperRef.current = el;
          if (typeof rootRef === 'function') rootRef(el);
        }}
      >
        {/* numeric badge shown above the icon */}
        {typeof num === 'number' && (
          <div className='badge' aria-hidden='true'>
            {num}
          </div>
        )}

        {/* closed icon (visible when not open) */}
        <FaRegEnvelope className='closed-icon' size={70} aria-hidden='true' />

        {/* open icon (fades in when open) */}
        <FaRegEnvelopeOpen className='open-icon' size={70} aria-hidden='true' />

        {/* letter (paper) that pops out when open */}
        <div className='letter' aria-hidden='true'>
          <div className='letter-lines' />
        </div>
      </div>
    </div>
  );
}

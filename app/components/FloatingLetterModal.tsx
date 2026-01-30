'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import './floating-letter.css';

export default function FloatingLetterModal({
  onClose,
  num,
  donateUrl = 'https://gofund.me/7770fe14a',
}: {
  onClose: () => void;
  num?: number;
  donateUrl?: string;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);

  // show with a tiny fade-in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // lock body scroll while modal is open (important for mobile)
  useEffect(() => {
    const prev =
      typeof document !== 'undefined'
        ? document.body.style.overflow
        : undefined;
    if (typeof document !== 'undefined')
      document.body.style.overflow = 'hidden';
    return () => {
      if (typeof document !== 'undefined')
        document.body.style.overflow = prev || '';
    };
  }, []);

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // focus the close button when the modal opens
  useEffect(() => {
    if (closeBtnRef.current) closeBtnRef.current.focus();
  }, []);

  return (
    <div
      ref={overlayRef}
      className={`floating-modal-overlay ${visible ? 'visible' : ''}`}
      onMouseDown={(e) => {
        // only close when clicking the backdrop itself (not the modal)
        if (e.target === e.currentTarget) onClose();
      }}
      role='presentation'
    >
      <div
        className='modal-container'
        role='dialog'
        aria-modal='true'
        aria-label='Envelope details'
      >
        <button
          ref={closeBtnRef}
          className='floating-close'
          aria-label='Close'
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>

        <div className='modal-inner-placeholder'>
          <div className='top-icon' aria-hidden='true'>
            <FaMoneyBillWave className='money-icon' size={48} />
          </div>

          <div className='choice-text'>
            {typeof num === 'number'
              ? `You chose $${num} donation.`
              : 'You chose a donation.'}
          </div>

          <a
            className='donate-btn'
            href={donateUrl}
            target='_blank'
            rel='noopener noreferrer'
          >
            Donate on GoFundMe
          </a>
        </div>
      </div>
    </div>
  );
}

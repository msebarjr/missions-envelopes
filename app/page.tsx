'use client';

import { useState, useRef } from 'react';
import IconEnvelope from './components/IconEnvelope';
import FloatingLetterModal from './components/FloatingLetterModal';

export default function Home() {
  const [modalInfo, setModalInfo] = useState<null | {
    num?: number;
    rect: DOMRect;
  }>(null);
  // track which envelope number is currently shown as open (only one at a time)
  const [openNum, setOpenNum] = useState<number | null>(null);
  // refs to each envelope DOM element so we can read bounding rects for random open
  const iconElsRef = useRef<Array<HTMLDivElement | null>>([]);

  function handleRequestOpen(info: { num?: number; rect: DOMRect }) {
    setModalInfo(info);
  }

  function handleRandomOpen() {
    const idx = Math.floor(Math.random() * 100);
    setOpenNum(idx + 1);
    // read rect on next frame to ensure DOM updated
    requestAnimationFrame(() => {
      const el = iconElsRef.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        handleRequestOpen({ num: idx + 1, rect });
      }
    });
  }

  return (
    <main>
      <h1>Mission Envelopes</h1>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 6,
        }}
      >
        <p style={{ margin: 0 }}>Click the envelope to open it.</p>
        <button
          onClick={handleRandomOpen}
          style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
          aria-label='Open a random envelope'
        >
          Open Random Envelope
        </button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <b>
          **Once you open an envelope, you can choose to donate to the cause
          inside. Upon receiving the donation, Michael & Eric will update this
          site to reflect the changes**
        </b>
      </div>
      <div style={{ marginTop: 24 }}>
        {/* Render 100 envelopes in a responsive grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 30,
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconEnvelope
                num={i + 1}
                isOpen={openNum === i + 1}
                onChangeOpen={(next) => {
                  // ensure only one open at a time
                  if (next) setOpenNum(i + 1);
                  else setOpenNum((prev) => (prev === i + 1 ? null : prev));
                }}
                // provide a callback ref so parent can read the element for random open
                rootRef={(el) => (iconElsRef.current[i] = el)}
                onRequestOpen={(info) => {
                  // parent still shows the floating modal for animation
                  handleRequestOpen(info);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {modalInfo && (
        <FloatingLetterModal
          num={modalInfo.num}
          onClose={() => {
            setModalInfo(null);
            setOpenNum(null); // also close the envelope visual when modal closes
          }}
        />
      )}
    </main>
  );
}

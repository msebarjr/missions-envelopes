'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const envelopesLeft = useMemo(() => {
    const total = 100;
    const keys = Object.keys(availability);
    if (keys.length === 0) return total;
    const unavailableCount = Object.values(availability).filter(
      (value) => value === false
    ).length;
    return Math.max(total - unavailableCount, 0);
  }, [availability]);
  const totalRaised = useMemo(() => {
    const ids = Object.keys(availability).map((id) => Number(id));
    if (ids.length === 0) return 0;
    return ids.reduce((sum, id) => {
      if (availability[id] === false) return sum + id;
      return sum;
    }, 0);
  }, [availability]);

  function handleRequestOpen(info: { num?: number; rect: DOMRect }) {
    setModalInfo(info);
  }

  function handleRandomOpen() {
    const keys = Object.keys(availability).map((id) => Number(id));
    const hasAvailability = keys.length > 0;
    const pool = hasAvailability
      ? keys.filter((id) => availability[id])
      : Array.from({ length: 100 }, (_, i) => i + 1);

    if (pool.length === 0) return;

    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    setOpenNum(chosen);
    // read rect on next frame to ensure DOM updated
    requestAnimationFrame(() => {
      const el = iconElsRef.current[chosen - 1];
      if (el) {
        const rect = el.getBoundingClientRect();
        handleRequestOpen({ num: chosen, rect });
      }
    });
  }

  useEffect(() => {
    async function loadAvailability() {
      try {
        const res = await fetch('/api/envelopes', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          id: number;
          available: boolean;
        }>;
        const next: Record<number, boolean> = {};
        data.forEach((item) => {
          next[item.id] = item.available;
        });
        setAvailability(next);
      } catch {
        // ignore for now; admin page is the source of truth
      }
    }

    loadAvailability();
  }, []);

  return (
    <main>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{}}>
          <h1 style={{ margin: 0 }}>Mission Envelopes</h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span
              style={{ color: '#0f766e', fontWeight: 600, fontSize: '2.5rem' }}
            >
              ${totalRaised} raised
            </span>
            <span style={{ color: '#6b7280', fontWeight: 600 }}>
              {envelopesLeft} Envelopes Left
            </span>
          </div>
        </div>
        <a
          href='/admin'
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
          }}
        >
          Admin
        </a>
      </div>
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
                isUnavailable={availability[i + 1] === false}
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

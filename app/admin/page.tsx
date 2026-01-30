'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Envelope = {
  id: number;
  available: boolean;
};

type Filter = 'all' | 'available' | 'used';

export default function AdminPage() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const hasKey = adminKey.trim().length > 0;

  useEffect(() => {
    const stored = window.localStorage.getItem('adminKey');
    if (stored) setAdminKey(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('adminKey', adminKey);
  }, [adminKey]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/envelopes', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load envelopes');
      const data = (await res.json()) as Envelope[];
      setEnvelopes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(envelope: Envelope) {
    setError(null);
    try {
      const trimmedKey = adminKey.trim();
      if (!trimmedKey) {
        throw new Error('Enter your admin key first.');
      }
      const res = await fetch(`/api/envelopes/${envelope.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': trimmedKey,
        },
        body: JSON.stringify({ available: !envelope.available }),
      });

      if (res.status === 401) {
        throw new Error('Invalid admin key.');
      }
      if (!res.ok) {
        const message = await res.text();
        throw new Error(
          message
            ? `Failed to update envelope: ${message}`
            : 'Failed to update envelope.'
        );
      }

      const updated = (await res.json()) as Envelope;
      setEnvelopes((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'available') return envelopes.filter((e) => e.available);
    if (filter === 'used') return envelopes.filter((e) => !e.available);
    return envelopes;
  }, [envelopes, filter]);

  return (
    <main style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Admin Panel</h1>
        <Link
          href='/'
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
          }}
        >
          ← Back to Home
        </Link>
      </div>
      <p>Use your admin key to mark envelopes as used or available.</p>
      <p style={{ marginTop: 8, color: '#6b7280' }}>
        Tip: set <code>ADMIN_KEY</code> in your <code>.env</code> file and
        restart the dev server after changing it.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          margin: '12px 0 20px',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Admin key
          <input
            type='password'
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder='Enter admin key'
            style={{ padding: '6px 10px', borderRadius: 6 }}
          />
        </label>
        <button
          onClick={load}
          style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
        >
          Refresh
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Filter
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            style={{ padding: '6px 10px', borderRadius: 6 }}
          >
            <option value='all'>All</option>
            <option value='available'>Available</option>
            <option value='used'>Used</option>
          </select>
        </label>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>
      )}

      {loading ? (
        <div>Loading envelopes…</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((envelope) => (
            <div
              key={envelope.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 12,
                background: envelope.available ? '#f0fdf4' : '#fef2f2',
              }}
            >
              <div style={{ fontWeight: 700 }}>Envelope #{envelope.id}</div>
              <div style={{ marginTop: 6 }}>
                Status: {envelope.available ? 'Available' : 'Used'}
              </div>
              <button
                onClick={() => toggle(envelope)}
                disabled={!hasKey}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  opacity: hasKey ? 1 : 0.6,
                }}
              >
                Mark {envelope.available ? 'Used' : 'Available'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

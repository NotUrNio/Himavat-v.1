import { useEffect, useState } from 'react';

const PACK_STORAGE_KEY = 'himavat_pack_checked_v2';

const PACK_ITEMS = [
  { id: 'boots', label: 'High-ankle waterproof broken-in trekking boots' },
  { id: 'shell', label: '3-layer waterproof breathable shell jacket + rain cover' },
  { id: 'down', label: 'Down or synthetic insulated jacket (-10°C summit rating)' },
  { id: 'mid', label: 'Thermal merino/fleece base & mid-layer + 3 pairs wool socks' },
  { id: 'poles', label: 'Adjustable trekking poles + microspikes for snow crossings' },
  { id: 'light', label: '200+ lumen headlamp with spare cold-resistant batteries' },
  { id: 'water', label: '2–3 L insulated water bottles + filtration/purification tablets' },
  { id: 'sun', label: 'UV-400 wraparound glacier sunglasses + SPF 50 sunscreen & lip balm' },
  { id: 'med', label: 'Personal first-aid kit, blister tape, pulse oximeter, oral rehydration' },
  { id: 'docs', label: 'Govt photo ID + printed permit copies + emergency offline cash (INR)' },
];

const CONDITIONING_WEEKS = [
  { week: 'Week 1–2', target: 'Base Aerobic Endurance', plan: '35–45 min brisk jog or cycling 4×/week + core plank circuits' },
  { week: 'Week 3–4', target: 'Loaded Climb Strength', plan: '45 min stair climbing or uphill walk with 6–8 kg backpack, 3×/week' },
  { week: 'Week 5', target: 'Peak Vertical Volume', plan: '60+ min back-to-back stair/hill intervals with 10 kg pack + squats/lunges' },
  { week: 'Week 6', target: 'Taper & Gear Check', plan: 'Light 30 min recovery walks, boot lace test, rest 72h prior to departure' },
];

function readInitialChecked(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

export function SafetySection() {
  const [checkedIds, setCheckedIds] = useState<string[]>(readInitialChecked);

  useEffect(() => {
    try {
      localStorage.setItem(PACK_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore storage write failures
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="wrap">
      <p className="micro">08 — SAFETY, PERMITS &amp; WMS 2024 PREP</p>
      <h2>COME HOME SAFE</h2>

      <div className="warn" style={{ marginTop: '20px' }}>
        <strong>Active Status Notices (Verified Nov 2026):</strong>{' '}
        <strong>Stok Kangri (Ladakh):</strong> Summit closed since Jan 2020 — Base Camp (~5,060 m) only; do not pay for summit bookings. ·{' '}
        <strong>Roopkund (Uttarakhand):</strong> Verify Chamoli Forest Division single-window approval before deposit. ·{' '}
        <strong>Kheerganga (HP):</strong> Meadow overnight camping banned since Jul 2024; stay in Kalga/Pulga/Nakthan/Tosh homestays. ·{' '}
        <strong>Goecha La (Sikkim):</strong> Trekkers stop at Viewpoint 1 (~4,600 m); true pass (4,940 m) remains restricted.
      </div>

      <div className="safety-grid">
        <div className="panel panel-filled">
          <p className="micro">WILDERNESS MEDICAL SOCIETY 2024</p>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: 0 }}>
            ALTITUDE SICKNESS (AMS)
          </h3>
          <p style={{ lineHeight: 1.65 }}>
            Above <strong>3,000 m</strong>, keep sleeping elevation gain under <strong>~500 m per night</strong> and schedule a rest/acclimatization night every <strong>3–4 days</strong> or 1,000 m gained. Never ascend to sleep higher with headache, nausea, or dizziness. Descending 300–1,000 m is the definitive treatment. Physical fitness does <em>not</em> protect against AMS. Consult a physician before departure — no medication dosage is prescribed here.
          </p>
        </div>

        <div className="panel panel-filled">
          <p className="micro">HELPLINES — INDIA</p>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: 0 }}>
            EMERGENCY NUMBERS
          </h3>
          <p style={{ lineHeight: 2, fontSize: '1.06rem', margin: 0 }}>
            <strong>112</strong> — Unified National Emergency
            <br />
            <strong>100</strong> — Police · <strong>101</strong> — Fire
            <br />
            <strong>102 / 108</strong> — Medical / Ambulance
            <br />
            <strong>1078</strong> — NDMA Disaster Management
          </p>
        </div>

        <div className="panel panel-filled">
          <p className="micro">DOCUMENTATION &amp; CHECKPOSTS</p>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: 0 }}>
            PERMIT PORTALS
          </h3>
          <p style={{ lineHeight: 1.65 }}>
            Most trails require district Forest Department or National Park permits. Confirm current tariffs locally or via official portals:
          </p>
          <ul style={{ lineHeight: 1.7, paddingLeft: '18px', marginBottom: 0 }}>
            <li>Uttarakhand Single Window: <strong>ukfdonline.com</strong></li>
            <li>Sikkim RAP / PAP &amp; KNP: Registered agent required for foreigners (min. group of 2)</li>
            <li>Himachal: Barshaini / DFO checkposts (ID + Eco fee)</li>
            <li>Ladakh: Hemis NP + LAHDC Environment Fee</li>
          </ul>
        </div>

        <div className="panel panel-filled">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <p className="micro" style={{ margin: 0 }}>
              GEAR CHECKLIST ({checkedIds.length}/{PACK_ITEMS.length})
            </p>
            {checkedIds.length > 0 && (
              <button
                type="button"
                className="btn"
                style={{ padding: '4px 10px', minHeight: '32px' }}
                onClick={() => setCheckedIds([])}
              >
                <span>RESET</span>
              </button>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: '8px' }}>
            INTERACTIVE PACKING LIST
          </h3>
          <div>
            {PACK_ITEMS.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.65 : 1 }}>
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="panel panel-filled" style={{ gridColumn: 'span 1' }}>
          <p className="micro">TRAIL CONDITIONING</p>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: 0 }}>
            6-WEEK PREP SCHEDULE
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {CONDITIONING_WEEKS.map((w) => (
              <div key={w.week} style={{ borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
                <strong style={{ color: 'var(--accent)' }}>{w.week} · {w.target}</strong>
                <div style={{ fontSize: '0.92rem' }}>{w.plan}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-filled">
          <p className="micro">ALPINE ECOLOGY</p>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: 0 }}>
            LEAVE NO TRACE
          </h3>
          <p style={{ lineHeight: 1.65 }}>
            Carry down every non-biodegradable wrapper and exhausted canister you pack up. Avoid single-use plastics in fragile meadows like Dayara Bugyal and Valley of Flowers. No open wood fires above treeline; camp strictly inside designated zones.
          </p>
        </div>
      </div>
    </div>
  );
}

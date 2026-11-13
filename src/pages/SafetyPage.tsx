import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, PhoneCall, CheckSquare, FileText, HeartPulse, Recycle } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

interface GearItem {
  id: string;
  category: string;
  item: string;
  weightG: number;
  note: string;
}

const PACKING_LIST: GearItem[] = [
  { id: 'boots', category: 'Footwear', item: 'Ankle-support Vibram/grip trekking boots', weightG: 1150, note: 'Break in at least 3 weeks before trailhead' },
  { id: 'shell', category: 'Layers', item: '3-layer waterproof/windproof hardshell jacket', weightG: 390, note: 'Critical for sudden pass squalls above tree line' },
  { id: 'puffy', category: 'Layers', item: 'Sub-zero down / synthetic insulated jacket', weightG: 480, note: 'Evening camp & pre-dawn summit pushes drop below -8°C' },
  { id: 'thermals', category: 'Layers', item: 'Merino or synthetic base layer top & bottom', weightG: 320, note: 'Strictly avoid cotton on high ridges' },
  { id: 'socks', category: 'Footwear', item: '3x merino wool socks + 1 spare thermal sleeping pair', weightG: 260, note: 'Dry sleeping socks prevent frostbite risk overnight' },
  { id: 'headlamp', category: 'Safety', item: 'LED headlamp + spare alkaline/lithium cells', weightG: 110, note: 'Batteries drain 2x faster in cold summit mornings' },
  { id: 'bottles', category: 'Hydration', item: 'Two 1 L wide-mouth insulated/BPA-free bottles', weightG: 290, note: 'Target 3.5–4 L fluid daily above 3,000 m' },
  { id: 'sun', category: 'Protection', item: 'UV400 category-3 sunglasses + SPF 50 sunscreen', weightG: 95, note: 'Snow glare causes painful photokeratitis in hours' },
  { id: 'meds', category: 'Medical', item: 'Personal first aid + blister tape + pulse oximeter', weightG: 210, note: 'Consult physician regarding Acetazolamide prophylaxis' },
  { id: 'poles', category: 'Hardware', item: 'Pair of collapsible trekking poles', weightG: 460, note: 'Cuts knee joint load ~25% on steep glacial descents' },
];

const PACK_STORAGE_KEY = 'himavat_packing_checked';

export default function SafetyPage() {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PACK_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['boots', 'bottles', 'headlamp'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(PACK_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // ignore
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the maximum safe daily sleeping altitude gain in the Himalayas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'According to Wilderness Medical Society (2024) guidelines, once ascending above 3,000 m, cap sleeping altitude gain at no more than 500 m per 24 hours and insert an extra acclimatization rest day every 3–4 days or every 1,000 m gained.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which permits are required for Sikkim, Ladakh, and Uttarakhand treks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sikkim treks like Goecha La require Forest + Protected Area Permits (foreigners must be groups of 2+ via registered operators). Ladakh restricts Nubra, Pangong, and Hanle sectors via Inner Line Permits for foreigners while Indians carry govt ID and pay environment fees. Uttarakhand National Parks (Valley of Flowers, Nanda Devi fringes, Govind Sanctuary) issue Forest Department day/trek permits.',
          },
        },
        {
          '@type': 'Question',
          name: 'What symptoms mandate immediate descent on a Himalayan trek?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Loss of balance or gait ataxia, confusion, extreme resting breathlessness, pink frothy sputum, or severe headache unresponsive to hydration/analgesics indicate HAPE or HACE. Descend immediately by at least 300–1,000 m; never leave an unwell trekker unattended.',
          },
        },
      ],
    }),
    [],
  );

  usePageSeo({
    title: 'Himalayan Safety, AMS Protocol, Permits & Emergency Guide | HIMAVAT',
    description:
      'Conservative alpine medical guidance (WMS 2024 AMS/HAPE/HACE), interactive packing checklist, 6-week prep plan, ILP/PAP permits, and verified rescue numbers.',
    jsonLdId: 'safety-faq-jsonld',
    jsonLd: faqJsonLd,
  });

  const packedCount = checkedIds.length;

  return (
    <div className="page-shell">
      <div className="container" style={{ display: 'grid', gap: '2.5rem' }}>
        <header>
          <span className="eyebrow-coord" style={{ color: 'var(--accent-warn)' }}>
            <ShieldAlert size={14} aria-hidden="true" />
            CONSERVATIVE ALPINE MEDICINE &amp; STATUTORY COMPLIANCE
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
            Safety, Acclimatization &amp; Permits Hub
          </h1>
          <p style={{ maxWidth: '68ch', color: 'var(--ink-secondary)' }}>
            Mountains do not negotiate with flight tickets. Every figure below aligns with Wilderness Medical Society (2024)
            clinical guidelines and state disaster/forest authorities—medical notes are educational only; consult a travel physician prior to high-altitude departures.
          </p>
        </header>

        {/* Emergency Directory */}
        <section id="emergency" className="surface-panel" style={{ borderColor: 'rgba(224,100,88,0.45)', background: 'rgba(26, 15, 17, 0.72)' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem', color: '#ffb4ac' }}>
            <PhoneCall size={20} /> Verified Indian Mountain Rescue &amp; Disaster Numbers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 8, background: 'rgba(0,0,0,0.28)' }}>
              <span className="field-label">Pan-India Emergency &amp; SDRF</span>
              <strong className="tabular-nums" style={{ fontSize: '1.35rem', display: 'block', marginTop: '0.2rem' }}>112 / 108 / 102</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>National Single Emergency &amp; Ambulance across HP, UK, JK, SK</span>
            </div>
            <div style={{ padding: '0.85rem', borderRadius: 8, background: 'rgba(0,0,0,0.28)' }}>
              <span className="field-label">Tourist Helpline (24×7 Toll-Free)</span>
              <strong className="tabular-nums" style={{ fontSize: '1.35rem', display: 'block', marginTop: '0.2rem' }}>1363</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>Ministry of Tourism multilingual crisis desk</span>
            </div>
            <div style={{ padding: '0.85rem', borderRadius: 8, background: 'rgba(0,0,0,0.28)' }}>
              <span className="field-label">Leh DC Control &amp; SNM Hospital</span>
              <strong className="tabular-nums" style={{ fontSize: '1.1rem', display: 'block', marginTop: '0.2rem' }}>01982-257416 / 252014</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>Ladakh Police HQ: 01982-260887 · High-altitude HBOT wing at SNM Leh</span>
            </div>
            <div style={{ padding: '0.85rem', borderRadius: 8, background: 'rgba(0,0,0,0.28)' }}>
              <span className="field-label">HMI Darjeeling Rescue / SDRF</span>
              <strong className="tabular-nums" style={{ fontSize: '1.1rem', display: 'block', marginTop: '0.2rem' }}>+91-76022-15312</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>Himalayan Mountaineering Institute SAR Wing (Singalila / Sikkim belt)</span>
            </div>
          </div>
        </section>

        {/* AMS / HAPE / HACE Conservative Guide */}
        <section className="surface-panel" aria-labelledby="ams-heading">
          <h2 id="ams-heading" style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
            <HeartPulse size={20} style={{ color: 'var(--accent-dawn)' }} />
            AMS, HAPE &amp; HACE Acclimatization Protocol (WMS 2024)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--accent-glacier)' }}>1. Climb High, Sleep Conservative</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)', display: 'grid', gap: '0.4rem' }}>
                <li>Above 3,000 m, limit sleeping altitude gain to <strong>&le; 500 m per 24 hours</strong>.</li>
                <li>Take a mandatory acclimatization rest day every 3–4 days or 1,000 m gain.</li>
                <li>Fly-in Leh arrivals (3,500 m) require <strong>48 full hours of low-effort rest</strong> before crossing passes or starting Markha Valley.</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--accent-ember)' }}>2. Lake Louise AMS Signals</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)', display: 'grid', gap: '0.4rem' }}>
                <li>Moderate-to-severe headache PLUS nausea/vomiting, persistent dizziness, or marked fatigue means <strong>STOP ascending immediately</strong>.</li>
                <li>Never carry a trekking partner higher hoping symptoms clear overnight.</li>
                <li>Hydrate steadily (clear urine), rest at same camp if mild, or descend if worsening after 12 hours.</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(224,100,88,0.08)', border: '1px solid rgba(224,100,88,0.3)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: '#ff9c92' }}>3. HAPE / HACE Red Flags (Emergency)</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem', color: '#ffd9d5', display: 'grid', gap: '0.4rem' }}>
                <li><strong>HACE:</strong> Ataxia (staggering walk like intoxication), slurred speech, drowsiness, or confusion.</li>
                <li><strong>HAPE:</strong> Breathless while resting flat, crackling chest sounds, extreme blue lip fatigue, or pink frothy cough.</li>
                <li><strong>Mandatory Action:</strong> Descend immediately 300–1,000 m right away + oxygen if carried.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Packing Checklist + 6-Week Conditioning */}
        <div className="editorial-split" style={{ alignItems: 'start' }}>
          <section className="surface-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={19} style={{ color: 'var(--accent-forest)' }} /> Interactive Trail Pack List
              </h2>
              <span className="status-badge status-open tabular-nums">
                {packedCount}/{PACKING_LIST.length} Packed
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Check off items below (saved automatically on your device). Keep total base rucksack under 10–11 kg without tents.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem' }}>
              {PACKING_LIST.map((gear) => {
                const isDone = checkedIds.includes(gear.id);
                return (
                  <li key={gear.id}>
                    <label
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        padding: '0.68rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isDone ? 'rgba(113,168,126,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isDone ? 'rgba(113,168,126,0.4)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleItem(gear.id)}
                        style={{ marginTop: 4, accentColor: '#71a87e', width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <strong style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--ink-secondary)' : 'var(--ink-primary)' }}>
                            {gear.item}
                          </strong>
                          <span className="tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                            ~{gear.weightG}g
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{gear.note}</span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>6-Week Himalayan Conditioning Plan</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
              Target cardiovascular readiness benchmark: jogging/brisk walking 5 km within 35–40 minutes plus carrying an 8–10 kg daypack up stairs comfortably before leaving home.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { wk: 'Weeks 1–2', focus: 'Zone-2 Base', detail: '4 days/wk 40 min brisk run or cycle + 2x bodyweight squats/lunges & planks.' },
                { wk: 'Weeks 3–4', focus: 'Hill & Stair Load', detail: 'Add 20–30 flights of stairs or 6 km trail walks with a 5 kg rucksack.' },
                { wk: 'Week 5', focus: 'Back-to-Back Load', detail: '7 km endurance run/hike + weighted stair session (8 kg pack) + deep calf stretching.' },
                { wk: 'Week 6', focus: 'Taper & Gear Check', detail: 'Light mobility only 4 days prior; hydrate well and break in boots/socks zero friction.' },
              ].map((block) => (
                <div key={block.wk} style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-glacier)' }}>{block.wk} · {block.focus}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>{block.detail}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Permits Matrix */}
        <section id="permits" className="surface-panel">
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-glacier)' }} />
            Indian Himalayan Permits Guide (ILP, PAP, RAP &amp; Forest Single-Window)
          </h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>State / Region</th>
                  <th>Permit Type &amp; Key Rules</th>
                  <th>Mandatory Documents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Uttarakhand</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Valley of Flowers, Har Ki Dun, Roopkund</span></td>
                  <td>State Forest Entry via DFO Single-Window (`ukfdonline.com`) or park gate. High Court bars bugyal night camping on Roopkund/alpine meadows.</td>
                  <td>Original Govt Photo ID (Aadhaar/Passport) + medical fitness self-declaration/certificate at forest gate.</td>
                </tr>
                <tr>
                  <td><strong>Sikkim &amp; Darjeeling</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Goecha La, Sandakphu</span></td>
                  <td>Indians need Khangchendzonga/Singalila Forest tickets + mandatory registered local guide (Sandakphu). Foreign nationals need Restricted Area Permit (RAP/PAP) for min group of 2 via agency.</td>
                  <td>2 passport photos + ID photocopies + Foreign Passport/Visa copies (mandatory Sikkim RAP renewal free at Melli/Rangpo).</td>
                </tr>
                <tr>
                  <td><strong>Himachal Pradesh</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Triund, Kheerganga, Pin Parvati, Buran</span></td>
                  <td>Triund enforces strict 400-hiker daily limit via HP Forest portal. Kheerganga overnight camping banned (2024 Forest order). Spiti/Kinnaur transit requires foreign PAP beyond Jangi/Sumdo.</td>
                  <td>Online Forest slot receipt + Govt ID. No personal plastic bottles permitted past Triund Gallu Devi checkpoint.</td>
                </tr>
                <tr>
                  <td><strong>Ladakh &amp; J&amp;K</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Markha Valley, KGL</span></td>
                  <td>Ladakh environmental green tax (LAHDC) + Protected Area Permits (for foreigners in restricted border corridors). J&amp;K Kashmir Great Lakes needs registered Sonamarg Police + Wildlife pass.</td>
                  <td>2–3 Govt ID / Passport copies + Sonamarg police verification slip prior to Nichnai ascent.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Responsible Leave No Trace */}
        <section className="surface-panel" style={{ borderColor: 'rgba(113,168,126,0.35)' }}>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Recycle size={19} style={{ color: 'var(--accent-forest)' }} /> Responsible High-Altitude Etiquette
          </h2>
          <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'grid', gap: '0.45rem', color: 'var(--ink-secondary)', fontSize: '0.92rem' }}>
            <li><strong>Pack out 100% of wet wipes, wrapper foil, and micro-plastics:</strong> Decomposition slows virtually to zero above 3,200 m.</li>
            <li><strong>Carry a refillable steel/hard flask + iodine/chlorine tabs or UV filter:</strong> Never buy single-use mineral water bottles in trail villages.</li>
            <li><strong>Protect alpine bugyals &amp; glacial tarns:</strong> Wash at least 60 m away from streams using no soap; camp only on barren rock or designated homestay sites.</li>
            <li><strong>Hire local porters &amp; homestays fairly:</strong> Pay district union daily rates without excessive baggage overload (&le; 15–18 kg total porter limit).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

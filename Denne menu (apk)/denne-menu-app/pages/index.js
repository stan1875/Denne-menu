import { useState, useEffect } from 'react'
import Head from 'next/head'

const TIER_LABELS = {
  top: '⭐ Top nabídka',
  ok: 'OK nabídka',
  ostatni: 'Ostatní',
}

const DAYS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

function getDateStr() {
  const d = new Date()
  return `${DAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function RestaurantCard({ r, loading }) {
  const s = styles

  if (r.type === 'closed') {
    return (
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <p style={s.name}>{r.name}</p>
            <p style={s.domain}>{new URL(r.url).hostname.replace('www.', '')}</p>
          </div>
          <a href={r.url} target="_blank" rel="noreferrer" style={s.link}>↗ Otevřít</a>
        </div>
        <div style={s.divider} />
        <p style={s.closedBadge}>Dočasně zavřeno</p>
      </div>
    )
  }

  if (r.type === 'link') {
    return (
      <div style={s.card}>
        <div style={{ ...s.cardHeader, paddingBottom: 0 }}>
          <div>
            <p style={s.name}>{r.name}</p>
            <p style={s.domain}>{new URL(r.url).hostname.replace('www.', '')}</p>
          </div>
          <a href={r.url} target="_blank" rel="noreferrer" style={s.link}>↗ Otevřít</a>
        </div>
        <div style={s.divider} />
        <p style={s.noScrape}>Menu nelze načíst automaticky — otevři stránku</p>
      </div>
    )
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div>
          <p style={s.name}>{r.name}</p>
          <p style={s.domain}>{new URL(r.url).hostname.replace('www.', '')}</p>
        </div>
        <a href={r.url} target="_blank" rel="noreferrer" style={s.link}>↗ Otevřít</a>
      </div>
      <div style={s.divider} />
      {loading ? (
        <p style={s.loadingText}>Načítám…</p>
      ) : r.menu && r.menu.length > 0 ? (
        <ul style={s.menuList}>
          {r.menu.map((item, i) => (
            <li key={i} style={s.menuItem}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={s.noScrape}>Menu se nepodařilo načíst — zkus otevřít stránku</p>
      )}
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastLoaded, setLastLoaded] = useState(null)

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/menus')
      const json = await res.json()
      setData(json)
      setLastLoaded(getTimeStr())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchMenus() }, [])

  const byTier = (tier) => (data || []).filter(r => r.tier === tier)

  return (
    <>
      <Head>
        <title>Denní menu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <p style={styles.dateStr}>{getDateStr()}</p>
            <h1 style={styles.title}>Denní menu</h1>
          </div>
          <button onClick={fetchMenus} style={styles.refreshBtn} disabled={loading}>
            {loading ? '…' : '↻ Načíst znovu'}
          </button>
        </div>

        {['top', 'ok', 'ostatni'].map(tier => (
          <div key={tier} style={styles.section}>
            <p style={styles.tierLabel}>{TIER_LABELS[tier]}</p>
            {byTier(tier).map(r => (
              <RestaurantCard key={r.id} r={r} loading={loading} />
            ))}
          </div>
        ))}

        {lastLoaded && (
          <p style={styles.footer}>Naposledy načteno dnes v {lastLoaded}</p>
        )}
      </div>
    </>
  )
}

const styles = {
  page: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '1rem 1rem 3rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#1a1a1a',
    background: '#fff',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingTop: '0.5rem',
  },
  dateStr: { margin: 0, fontSize: 13, color: '#888' },
  title: { margin: '2px 0 0', fontSize: 22, fontWeight: 500 },
  refreshBtn: {
    fontSize: 14,
    padding: '8px 14px',
    background: 'transparent',
    border: '0.5px solid #ccc',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  section: { marginBottom: '1.5rem' },
  tierLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#aaa',
    margin: '0 0 10px',
  },
  card: {
    background: '#fff',
    border: '0.5px solid #e0e0e0',
    borderRadius: 12,
    padding: '0.9rem 1.1rem',
    marginBottom: 10,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: { margin: 0, fontSize: 15, fontWeight: 500 },
  domain: { margin: '2px 0 0', fontSize: 12, color: '#999' },
  link: {
    fontSize: 13,
    color: '#0066cc',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    paddingLeft: 8,
  },
  divider: { borderTop: '0.5px solid #f0f0f0', marginBottom: 10 },
  menuList: { margin: 0, padding: 0, listStyle: 'none' },
  menuItem: {
    fontSize: 14,
    color: '#333',
    padding: '4px 0',
    borderBottom: '0.5px solid #f5f5f5',
    lineHeight: 1.5,
  },
  loadingText: { margin: 0, fontSize: 14, color: '#bbb', fontStyle: 'italic' },
  noScrape: {
    margin: 0,
    fontSize: 13,
    color: '#aaa',
    background: '#fafafa',
    borderRadius: 6,
    padding: '7px 10px',
  },
  closedBadge: {
    margin: 0,
    fontSize: 13,
    color: '#e07000',
    background: '#fff8f0',
    borderRadius: 6,
    padding: '7px 10px',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    marginTop: '1.5rem',
  },
}

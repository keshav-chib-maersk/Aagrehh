import { useEffect, useState } from 'react'
import { authApi, invitationApi } from './api'

const STORE_KEY = 'aagrehh-invitations-v2'

const templates = [
  { id: 'jaipur', name: 'Jaipur palace edit', label: 'PASTEL · RAJASTHANI', description: 'Soft blush arches, hand-painted florals, and a sunlit palace mood.', bg: '#f2ddd7', ink: '#8a4f49', accent: '#c68572', motif: '✦', style: 'jaipur' },
  { id: 'royal', name: 'Midnight royal affair', label: 'REGAL · EVENING', description: 'Deep jewel tones, gilded detail, and a dramatic night celebration.', bg: '#273a58', ink: '#f5ead1', accent: '#d9b968', motif: '✦', style: 'royal' },
  { id: 'mehendi', name: 'Floral mehendi story', label: 'FESTIVE · JOYFUL', description: 'Marigold warmth and lively botanicals for every colourful ritual.', bg: '#f1d779', ink: '#6b5530', accent: '#d78043', motif: '❀', style: 'mehendi' },
  { id: 'temple', name: 'Sacred temple edition', label: 'TRADITIONAL · SOUTH INDIAN', description: 'Ivory, vermilion, and sacred lotus detail for a timeless ceremony.', bg: '#f3ead8', ink: '#7c3329', accent: '#bd7653', motif: '✦', style: 'temple' },
]

const seedInvites = [
  {
    id: 'ananya-rohan', hosts: 'Ananya & Rohan', date: '2026-11-24', time: '5:30 PM onwards', venue: 'The Grand Garden', city: 'Bengaluru', deadline: '2026-11-05', template: 'jaipur', message: 'Together with our families, we invite you to share in the joy of our wedding celebration.', createdAt: '2026-08-01',
    rsvps: [
      { id: 'r1', name: 'Neha Sharma', attendance: 'attending', guests: 2, meal: 'Vegetarian', note: 'Cannot wait to celebrate!', at: '2026-08-02T10:00:00.000Z' },
      { id: 'r2', name: 'Vikram & family', attendance: 'attending', guests: 4, meal: 'Vegetarian', note: '', at: '2026-08-02T09:10:00.000Z' },
      { id: 'r3', name: 'Priya Mehta', attendance: 'declined', guests: 0, meal: '', note: 'Sending all our love.', at: '2026-08-01T16:30:00.000Z' },
    ],
  },
]

const blankDraft = (template = 'jaipur') => ({ hosts: '', date: '', time: '6:00 PM onwards', venue: '', city: '', deadline: '', template, message: 'Together with our families, we invite you to share in the joy of our wedding celebration.' })

function getTemplate(id) {
  return templates.find((template) => template.id === id) || templates[0]
}

function readInvites() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORE_KEY))
    return Array.isArray(saved) && saved.length ? saved : seedInvites
  } catch {
    return seedInvites
  }
}

function formatDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!value) return 'Choose a date'
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(`${value}T12:00:00`))
}

function guestRoute() {
  const hash = window.location.hash
  const match = hash.match(/^#\/invite\/([^?]+)/)
  if (!match) return { id: null, invite: null }
  return { id: decodeURIComponent(match[1]), invite: null }
}

function invitationUrl(invite) {
  return `${window.location.origin}${window.location.pathname}#/invite/${encodeURIComponent(invite.id)}`
}

function TemplateArtwork({ invite, compact = false }) {
  const template = getTemplate(invite.template)
  const [first = 'Your', second = 'Celebration'] = (invite.hosts || 'Your celebration').split(' & ')
  return <div className={`template-art ${template.style} ${compact ? 'compact' : ''}`} style={{ '--paper': template.bg, '--ink': template.ink, '--accent': template.accent }}>
    <span className="art-corner art-corner-left">{template.motif}</span><span className="art-corner art-corner-right">{template.motif}</span>
    <span className="art-logo">aagrehh</span>
    <p>THE WEDDING OF</p>
    <h3>{first} <i>&amp;</i> {second}</h3>
    <span className="art-rule" />
    <b>{formatDate(invite.date, { day: 'numeric', month: 'short', year: 'numeric' })}</b>
  </div>
}

function Toast({ message }) {
  return message ? <div className="toast">{message}</div> : null
}

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } })
    }, { threshold: 0.14 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function GuestInvitation({ invite, onRSVP }) {
  useScrollReveal()
  const [attendance, setAttendance] = useState('attending')
  const [form, setForm] = useState({ name: '', guests: '1', meal: 'Vegetarian', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const template = getTemplate(invite?.template)

  if (!invite) return <main className="guest-page missing"><span className="guest-logo">aagrehh</span><section><p className="eyebrow">INVITATION NOT FOUND</p><h1>This invitation is unavailable.</h1><p>Please ask your host for a fresh invitation link.</p></section></main>

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const eventDate = new Date(`${invite.date}T12:00:00`)
  const dayBefore = new Date(eventDate); dayBefore.setDate(dayBefore.getDate() - 1)
  const ceremonySchedule = [
    { tag: 'WELCOME', name: 'Mehendi & sundowner', date: formatDate(dayBefore.toISOString().slice(0, 10), { weekday: 'short', day: 'numeric', month: 'short' }), time: '4:00 PM onwards', icon: '✦' },
    { tag: 'CELEBRATION', name: 'Sangeet evening', date: formatDate(dayBefore.toISOString().slice(0, 10), { weekday: 'short', day: 'numeric', month: 'short' }), time: '8:00 PM onwards', icon: '♪' },
    { tag: 'THE WEDDING', name: 'Pheras & blessings', date: formatDate(invite.date, { weekday: 'short', day: 'numeric', month: 'short' }), time: invite.time, icon: '❋' },
  ]
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    try {
      await onRSVP({ name: form.name.trim(), attendance, guests: attendance === 'attending' ? Number(form.guests) : 0, meal: attendance === 'attending' ? form.meal : '', note: form.note.trim() })
      setSubmitted(true)
    } catch {
      window.alert('We could not send your RSVP. Please try again.')
    }
  }

  return <main className={`guest-site ${template.style}`} style={{ '--paper': template.bg, '--ink': template.ink, '--accent': template.accent }}>
    <header className="guest-site-nav"><button className="guest-logo" onClick={() => scrollTo('welcome')}>aagrehh</button><nav><button onClick={() => scrollTo('celebrations')}>Celebrations</button><button onClick={() => scrollTo('venue')}>Venue</button><button onClick={() => scrollTo('rsvp')}>RSVP</button></nav></header>
    <section className="guest-hero" id="welcome"><div className="hero-ornament top">{template.motif}</div><p>WITH THE BLESSINGS OF OUR FAMILIES</p><span className="hero-little">we invite you to celebrate</span><h1>{invite.hosts.split(' & ')[0]} <i>&amp;</i> {invite.hosts.split(' & ')[1]}</h1><span className="hero-divider" /><div className="hero-date"><b>{formatDate(invite.date, { day: 'numeric', month: 'long', year: 'numeric' })}</b><span>{invite.time} · {invite.city}</span></div><button className="scroll-prompt" onClick={() => scrollTo('celebrations')}>Discover our celebrations <span>↓</span></button><div className="hero-ornament bottom">{template.motif}</div></section>
    <section className="guest-note-section" data-reveal><p className="eyebrow">A CELEBRATION OF LOVE</p><h2>{invite.message}</h2><span>{template.motif}</span></section>
    <section className="celebrations-section" id="celebrations" data-reveal><div className="section-intro"><p className="eyebrow">SAVE THE DATES</p><h2>Come celebrate<br />with us.</h2><p>From haldi-hued afternoons to moonlit vows, every gathering is better with you in it.</p></div><div className="ceremony-list">{ceremonySchedule.map((ceremony, index) => <article key={ceremony.name} style={{ '--reveal-delay': `${index * 110}ms` }}><span className="ceremony-number">0{index + 1}</span><span className="ceremony-icon">{ceremony.icon}</span><div><small>{ceremony.tag}</small><h3>{ceremony.name}</h3><p>{ceremony.date} · {ceremony.time}</p></div></article>)}</div></section>
    <section className="venue-section" id="venue" data-reveal><div className="venue-visual"><span>{template.motif}</span><div className="arch arch-one" /><div className="arch arch-two" /></div><div className="venue-copy"><p className="eyebrow">THE VENUE</p><h2>Meet us<br />under the stars.</h2><p>{invite.venue}<br />{invite.city}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${invite.venue}, ${invite.city}`)}`} target="_blank" rel="noreferrer">Get directions <span>↗</span></a></div></section>
    <section className="guest-rsvp-section" id="rsvp" data-reveal><div className="rsvp-card"><p className="eyebrow">WE WOULD BE DELIGHTED</p><h2>Will you join us?</h2><p>Kindly reply by {formatDate(invite.deadline, { day: 'numeric', month: 'long' })}</p>{!submitted ? <form className="rsvp-form" onSubmit={submit}><div className="response-choice"><button type="button" className={attendance === 'attending' ? 'chosen' : ''} onClick={() => setAttendance('attending')}>Joyfully accepts</button><button type="button" className={attendance === 'declined' ? 'chosen' : ''} onClick={() => setAttendance('declined')}>Regretfully declines</button></div><label>Your name<input name="name" value={form.name} onChange={update} placeholder="e.g. Priya Mehta" required /></label>{attendance === 'attending' && <div className="form-row"><label>Guests<select name="guests" value={form.guests} onChange={update}><option value="1">Just me</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><label>Meal preference<select name="meal" value={form.meal} onChange={update}><option>Vegetarian</option><option>Non-vegetarian</option><option>Vegan</option><option>No preference</option></select></label></div>}<label>A note for the couple <span className="optional">optional</span><textarea name="note" value={form.note} onChange={update} placeholder="Write a little something…" rows="2" /></label><button className="submit-rsvp">Send RSVP <span>→</span></button></form> : <div className="guest-thanks"><span>{attendance === 'attending' ? '♥' : template.motif}</span><h2>{attendance === 'attending' ? 'We cannot wait to celebrate with you.' : 'Thank you for letting us know.'}</h2><p>Your response has been sent to {invite.hosts}.</p></div>}</div></section>
    <footer className="guest-site-footer"><span>{template.motif}</span><p>{invite.hosts}</p><small>Made with care by aagrehh</small></footer>
  </main>
}

function Builder({ initial, onClose, onSave }) {
  const [step, setStep] = useState(initial?.id ? 2 : 1)
  const [draft, setDraft] = useState(initial?.id ? { ...blankDraft(initial.template), ...initial } : blankDraft(initial?.template))
  const template = getTemplate(draft.template)
  const update = (event) => setDraft({ ...draft, [event.target.name]: event.target.value })

  return <div className="modal-wrap"><div className="builder-modal">
    <div className="builder-top"><div><p className="eyebrow">{initial ? 'EDIT INVITATION' : 'NEW INVITATION'}</p><h2>{step === 1 ? 'Choose your invitation style' : 'Make it beautifully yours'}</h2></div><button onClick={onClose} className="close">×</button></div>
    <div className="steps"><span className={step >= 1 ? 'done' : ''}>1 <b>Choose a template</b></span><i /><span className={step >= 2 ? 'done' : ''}>2 <b>Add your details</b></span></div>
    {step === 1 ? <><div className="template-picker">{templates.map((item) => <button key={item.id} className={`template-option ${draft.template === item.id ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, template: item.id })}><TemplateArtwork invite={{ ...draft, template: item.id, hosts: 'Mira & Dev', date: '2026-12-11' }} compact /><span><b>{item.name}</b><small>{item.label}</small></span></button>)}</div><div className="builder-actions"><button className="text-action" onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => setStep(2)}>Continue <span>→</span></button></div></> : <div className="details-step"><div className="form-fields"><label>Couple’s names<input name="hosts" value={draft.hosts} onChange={update} placeholder="e.g. Aisha & Kabir" autoFocus /></label><div className="form-row"><label>Wedding date<input name="date" type="date" value={draft.date} onChange={update} /></label><label>Time<input name="time" value={draft.time} onChange={update} placeholder="6:00 PM onwards" /></label></div><label>Venue<input name="venue" value={draft.venue} onChange={update} placeholder="e.g. The Grand Garden" /></label><label>City<input name="city" value={draft.city} onChange={update} placeholder="e.g. Bengaluru" /></label><label>RSVP deadline<input name="deadline" type="date" value={draft.deadline} onChange={update} /></label><label>Invitation message<textarea name="message" value={draft.message} onChange={update} rows="3" /></label></div><div className="builder-preview"><p>LIVE PREVIEW</p><TemplateArtwork invite={draft} /><span>{template.name}</span></div></div>}
    {step === 2 && <div className="builder-actions"><button className="text-action" onClick={() => setStep(1)}>← Back</button><button className="primary-action" disabled={!draft.hosts || !draft.date || !draft.venue} onClick={() => onSave(draft)}>{initial ? 'Save changes' : 'Create invitation'} <span>→</span></button></div>}
  </div></div>
}

function EventCard({ invite, selected, onSelect, onShare, onEdit }) {
  const confirmed = invite.rsvps.filter((rsvp) => rsvp.attendance === 'attending').reduce((sum, rsvp) => sum + rsvp.guests, 0)
  const responses = invite.rsvps.length
  return <article className={`event-card ${selected ? 'selected' : ''}`} onClick={onSelect}><TemplateArtwork invite={invite} /><div className="event-card-body"><div><h3>{invite.hosts}</h3><p>{formatDate(invite.date, { day: 'numeric', month: 'short', year: 'numeric' })} · {invite.venue}</p></div><button className="card-menu" onClick={(event) => { event.stopPropagation(); onEdit() }}>Edit</button></div><div className="event-metrics"><span><b>{confirmed}</b> attending</span><span><b>{responses}</b> replies</span><button onClick={(event) => { event.stopPropagation(); onShare() }}>Share link ↗</button></div></article>
}

function RSVPTable({ invite }) {
  const [filter, setFilter] = useState('all')
  const items = invite?.rsvps || []
  const rows = filter === 'all' ? items : items.filter((item) => item.attendance === filter)
  if (!invite) return null
  return <section className="rsvp-table-section"><div className="section-heading"><div><p className="eyebrow">GUEST RESPONSES</p><h2>RSVPs for {invite.hosts}</h2><p>{items.length} guest responses received</p></div><div className="filters">{[['all', 'All'], ['attending', 'Attending'], ['declined', 'Declined']].map(([key, label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div></div><div className="rsvp-table"><div className="table-head"><span>GUEST</span><span>RESPONSE</span><span>PARTY</span><span>MEAL</span><span>MESSAGE</span></div>{rows.length ? rows.map((rsvp) => <div className="table-row" key={rsvp.id}><span><b>{rsvp.name}</b><small>{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(rsvp.at))}</small></span><span><i className={`status-dot ${rsvp.attendance}`} />{rsvp.attendance === 'attending' ? 'Attending' : 'Declined'}</span><span>{rsvp.guests || '—'}</span><span>{rsvp.meal || '—'}</span><span className="guest-note">{rsvp.note || '—'}</span></div>) : <div className="empty-table">No RSVP responses in this view yet.</div>}</div></section>
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await (isLogin ? authApi.login(form) : authApi.register(form))
      onAuthenticated(response)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  const fillDemo = () => { setForm({ name: '', email: 'demo@aagrehh.com', password: 'password123' }); setMode('login'); setError('') }

  return <main className="auth-page"><section className="auth-panel"><button className="auth-brand" onClick={() => setMode('login')}><span className="monogram">A</span><span>aagrehh</span></button><div className="auth-copy"><p className="eyebrow">YOUR WEDDING STUDIO</p><h1>Begin the story<br />beautifully.</h1><p>Create invitations your guests will adore, then hold every heartfelt response in one place.</p><div className="auth-quote"><span>“</span><p>Every celebration deserves a beautiful beginning.</p></div></div><div className="auth-art"><span className="auth-art-left">✦</span><span>TOGETHER IS A BEAUTIFUL PLACE TO BE</span><span className="auth-art-right">✦</span></div></section><section className="auth-form-wrap"><div className="auth-form"><div className="auth-mobile-brand"><span className="monogram">A</span> aagrehh</div><p className="eyebrow">{isLogin ? 'WELCOME BACK' : 'CREATE YOUR STUDIO'}</p><h2>{isLogin ? 'Sign in to your studio' : 'Start creating memories'}</h2><p className="auth-subtitle">{isLogin ? 'Enter your details to manage your celebrations.' : 'A few details and your invitation studio is ready.'}</p><div className="auth-toggle"><button className={isLogin ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button><button className={!isLogin ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button></div><form onSubmit={submit}>{!isLogin && <label>Your name<input name="name" value={form.name} onChange={update} placeholder="e.g. Shreya Kapoor" required /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" minLength="6" required /></label>{error && <p className="auth-error">{error}</p>}<button className="auth-submit" disabled={loading}>{loading ? 'Please wait…' : isLogin ? 'Sign in to aagrehh' : 'Create my studio'} <span>→</span></button></form>{isLogin && <div className="demo-account"><div><b>Try the demo</b><span>demo@aagrehh.com · password123</span></div><button onClick={fillDemo}>Use demo</button></div>}<p className="auth-terms">By continuing, you agree to our Terms of service and Privacy policy.</p></div></section></main>
}

function App() {
  const [invites, setInvites] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState('Overview')
  const [builder, setBuilder] = useState(null)
  const [toast, setToast] = useState('')
  const [guestRouteState, setGuestRouteState] = useState(guestRoute)
  const [guestInvite, setGuestInvite] = useState(null)
  const [user, setUser] = useState(() => { try { return JSON.parse(window.localStorage.getItem('aagrehh-demo-session')) } catch { return null } })
  const selected = invites.find((item) => item.id === selectedId) || invites[0]

  useEffect(() => {
    if (!user?.token) return
    invitationApi.list(user.token)
      .then((items) => { setInvites(items); setSelectedId((current) => current || items[0]?.id || null) })
      .catch(() => { window.localStorage.removeItem('aagrehh-demo-session'); setUser(null) })
  }, [user?.token])
  useEffect(() => { const route = () => setGuestRouteState(guestRoute()); window.addEventListener('hashchange', route); return () => window.removeEventListener('hashchange', route) }, [])
  useEffect(() => { if (selected && !invites.some((item) => item.id === selectedId)) setSelectedId(selected.id) }, [invites, selected, selectedId])
  useEffect(() => {
    if (!guestRouteState.id) { setGuestInvite(null); return }
    setGuestInvite(null)
    invitationApi.getPublic(guestRouteState.id).then(setGuestInvite).catch(() => setGuestInvite(null))
  }, [guestRouteState.id])

  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2800) }
  const saveInvite = async (draft) => {
    try {
      const saved = builder?.id ? await invitationApi.update(user.token, builder.id, draft) : await invitationApi.create(user.token, draft)
      setInvites((current) => builder?.id ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current])
      setSelectedId(saved.id)
      notify(builder?.id ? 'Invitation changes saved.' : 'Invitation created and ready to share.')
      setBuilder(null)
    } catch (error) {
      notify(error.message)
    }
  }
  const copyLink = async (invite = selected) => {
    const url = invitationUrl(invite)
    try { await navigator.clipboard.writeText(url); notify('Guest invitation link copied to your clipboard.') } catch { window.prompt('Copy this guest invitation link:', url) }
  }
  if (guestRouteState.id) return <GuestInvitation invite={guestInvite} onRSVP={(rsvp) => invitationApi.submitRsvp(guestRouteState.id, rsvp)} />

  if (!user?.token) return <AuthPage onAuthenticated={(account) => { const session = { ...account.user, token: account.token }; window.localStorage.setItem('aagrehh-demo-session', JSON.stringify(session)); setUser(session) }} />

  const totalReplies = invites.reduce((sum, invite) => sum + invite.rsvps.length, 0)
  const attendees = invites.reduce((sum, invite) => sum + invite.rsvps.filter((rsvp) => rsvp.attendance === 'attending').reduce((inner, rsvp) => inner + rsvp.guests, 0), 0)
  const navItems = ['Overview', 'Invitations', 'Guests & RSVP', 'Templates']

  return <div className="app-shell"><aside className="sidebar"><button className="brand" onClick={() => setPage('Overview')}><span className="monogram">A</span><span>aagrehh</span></button><div className="workspace"><span className="workspace-mark">M</span><div><b>My studio</b><small>Wedding planner</small></div><span>⌄</span></div><nav>{navItems.map((item) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => setPage(item)}><span>{item === 'Overview' ? '▦' : item === 'Invitations' ? '◇' : item === 'Guests & RSVP' ? '♧' : '▱'}</span>{item}</button>)}</nav><div className="sidebar-bottom"><button className="help-link">Need a hand? <b>Read the guide →</b></button><div className="profile"><span className="avatar">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><b>{user.name}</b><small>{user.email}</small></div><button className="sign-out" onClick={() => { window.localStorage.removeItem('aagrehh-demo-session'); setUser(null) }}>Sign out</button></div></div></aside>
    <main className="content"><header className="dashboard-header"><div><span className="live-dot" /> Studio dashboard <b>/</b> {page}</div><div><button className="header-help">?</button><button className="header-avatar">SK</button></div></header>
      {page === 'Overview' && <><section className="hero"><div><p className="eyebrow">WELCOME BACK, SHREYA</p><h1>Make every<br />yes feel special.</h1><p>Beautiful invitations, joyful guest lists, and every RSVP in one peaceful place.</p></div><button className="create-button" onClick={() => setBuilder({})}>＋ Create invitation</button></section><section className="metric-grid"><article><span className="metric-icon green">◇</span><div><small>ACTIVE INVITATIONS</small><strong>{invites.length}</strong><em>All celebrations</em></div></article><article><span className="metric-icon peach">♧</span><div><small>GUESTS ATTENDING</small><strong>{attendees}</strong><em>Across all events</em></div></article><article><span className="metric-icon gold">✓</span><div><small>RSVP RESPONSES</small><strong>{totalReplies}</strong><em>{totalReplies ? 'Coming in beautifully' : 'Ready to receive'}</em></div></article></section><section className="section-heading"><div><h2>Your celebrations</h2><p>Select an invitation to share or review its guest responses.</p></div><button className="text-link" onClick={() => setPage('Invitations')}>View all →</button></section><div className="event-grid">{invites.slice(0, 3).map((invite) => <EventCard key={invite.id} invite={invite} selected={selected?.id === invite.id} onSelect={() => setSelectedId(invite.id)} onShare={() => copyLink(invite)} onEdit={() => setBuilder(invite)} />)}<button className="new-card" onClick={() => setBuilder({})}><span>＋</span><b>Create another celebration</b><small>Choose from four timeless styles</small></button></div><RSVPTable invite={selected} /></>}
      {page === 'Invitations' && <><section className="page-intro"><div><p className="eyebrow">YOUR COLLECTION</p><h1>Invitation studio</h1><p>Create a wedding invitation, share a single guest-ready link, and make every response count.</p></div><button className="create-button" onClick={() => setBuilder({})}>＋ Create invitation</button></section><div className="event-grid full">{invites.map((invite) => <EventCard key={invite.id} invite={invite} selected={selected?.id === invite.id} onSelect={() => setSelectedId(invite.id)} onShare={() => copyLink(invite)} onEdit={() => setBuilder(invite)} />)}<button className="new-card" onClick={() => setBuilder({})}><span>＋</span><b>Start a new invitation</b><small>Four reusable templates available</small></button></div></>}
      {page === 'Guests & RSVP' && <><section className="page-intro"><div><p className="eyebrow">GUEST MANAGEMENT</p><h1>Every reply, beautifully organised.</h1><p>Guest responses are updated as invitations are answered.</p></div><div className="event-select"><span>Viewing</span><select value={selected?.id} onChange={(event) => setSelectedId(event.target.value)}>{invites.map((invite) => <option key={invite.id} value={invite.id}>{invite.hosts}</option>)}</select></div></section><section className="rsvp-summary"><article><span>ATTENDING</span><b>{selected?.rsvps.filter((rsvp) => rsvp.attendance === 'attending').reduce((sum, rsvp) => sum + rsvp.guests, 0)}</b><small>Guests joining the celebration</small></article><article><span>RESPONSES</span><b>{selected?.rsvps.length}</b><small>Guest RSVP forms received</small></article><article><span>DIETARY NOTES</span><b>{selected?.rsvps.filter((rsvp) => rsvp.meal && rsvp.meal !== 'No preference').length}</b><small>Meal choices to review</small></article><button onClick={() => copyLink(selected)}>Copy guest link ↗</button></section><RSVPTable invite={selected} /></>}
      {page === 'Templates' && <><section className="page-intro"><div><p className="eyebrow">REUSABLE DESIGNS</p><h1>Four styles, made to feel like yours.</h1><p>Start with a beautiful foundation and customise every wedding detail.</p></div></section><div className="template-library">{templates.map((template) => <article key={template.id}><TemplateArtwork invite={{ template: template.id, hosts: 'Mira & Dev', date: '2026-12-11' }} /><div><small>{template.label}</small><h2>{template.name}</h2><p>{template.description}</p><button onClick={() => setBuilder({ template: template.id })}>Use this template →</button></div></article>)}</div></>}
    </main>{builder !== null && <Builder initial={builder} onClose={() => setBuilder(null)} onSave={saveInvite} />}<Toast message={toast} /></div>
}

export default App

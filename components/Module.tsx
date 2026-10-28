'use client'
import { useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
import type { Mod } from '@/lib/modules'
export default function Module({ m }: { m: Mod }) {
  const [rows, setRows] = useState<any[]>([]), [users, setUsers] = useState<any[]>([]), [cons, setCons] = useState<any[]>([])
  const [f, setF] = useState<any>(m.defaults || {}), [err, setErr] = useState(''), [open, setOpen] = useState(false), [q, setQ] = useState('')
  const load = async () => {
    const [r, u, c] = await Promise.all([sb.from(m.table).select('*').order('created_at', { ascending: false }),
      sb.from('profiles').select('id,full_name'), sb.from('contacts').select('id,name,email,phone')])
    setRows(r.data || []); setUsers(u.data || []); setCons(c.data || [])
  }
  useEffect(() => { load() }, [])
  const clean = () => Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== '' && v != null && m.fields.find(x => x.k === k && (!x.when || x.when(f)))))
  const save = async () => {
    const miss = m.fields.find(x => x.req && (!x.when || x.when(f)) && !f[x.k]); if (miss) return setErr(`${miss.l} is required.`)
    if (m.table === 'contacts' && !f.email && !f.phone) return setErr('Enter an email address or a phone number.')
    const { error } = await sb.from(m.table).insert(clean())
    if (error) return setErr(error.code === '23505' ? 'A contact with this email or phone already exists.' : error.message)
    setErr(''); setF(m.defaults || {}); setOpen(false); load()
  }
  const quick = async () => { // create a contact directly from the form
    const name = prompt('Contact name'); if (!name) return
    const email = prompt('Email (leave blank if phone given)') || null, phone = prompt('Phone (leave blank if email given)') || null
    const { data, error } = await sb.from('contacts').insert({ kind: f.kind || 'individual', name, email, phone }).select().single()
    if (error) return setErr(error.code === '23505' ? 'That email or phone already exists.' : error.message)
    await load(); setF({ ...f, contact_id: data.id })
  }
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  return <section>
    <header className="bar"><h1>{m.title}</h1><input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 240 }} />
      <button onClick={() => setOpen(!open)}>{open ? 'Close' : `New ${m.title.replace(/s$/, '').toLowerCase()}`}</button></header>
    {open && <div className="panel">
      {m.fields.filter(x => !x.when || x.when(f)).map(x => <label key={x.k} className={x.t === 'textarea' ? 'wide' : ''}>{x.l}{x.req && ' *'}
        {x.t === 'select' ? <select value={f[x.k] || ''} onChange={set(x.k)}><option value="">Select</option>{x.o!.map(o => <option key={o}>{o}</option>)}</select>
        : x.t === 'user' ? <select value={f[x.k] || ''} onChange={set(x.k)}><option value="">Select</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select>
        : x.t === 'contact' ? <span className="row"><select value={f[x.k] || ''} onChange={set(x.k)}><option value="">Select contact</option>{cons.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || c.phone})</option>)}</select><button type="button" className="ghost" onClick={quick}>New contact</button></span>
        : x.t === 'textarea' ? <textarea rows={3} value={f[x.k] || ''} onChange={set(x.k)} />
        : <input type={x.t} value={f[x.k] || ''} onChange={set(x.k)} />}</label>)}
      {err && <p className="err wide">{err}</p>}<button className="wide" onClick={save}>Save {m.title.replace(/s$/, '').toLowerCase()}</button></div>}
    <div className="scroll"><table><thead><tr>{m.cols.map(c => <th key={c}>{c.replace(/_/g, ' ')}</th>)}</tr></thead>
      <tbody>{shown.map(r => <tr key={r.id}>{m.cols.map(c => <td key={c}>{c.endsWith('_at') && r[c] ? new Date(r[c]).toLocaleString() : String(r[c] ?? '')}</td>)}</tr>)}
        {!shown.length && <tr><td colSpan={m.cols.length}>Nothing here yet. Use the button above to add the first record.</td></tr>}</tbody></table></div>
  </section>
}

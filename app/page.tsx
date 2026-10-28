'use client'
import { useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
const money = (n: number) => Math.round(n).toLocaleString()
const Meter = ({ a, t }: { a: number; t: number }) => { const p = t ? (a / t) * 100 : 0
  return <><div className="meter"><i className={p > 100 ? 'over' : ''} style={{ width: Math.min(p, 100) + '%' }} /></div><small>{money(a)} of {money(t)} · {p.toFixed(0)}%{p > 100 ? ' (overachieved)' : ''}</small></> }
export default function Dashboard() {
  const [per, setPer] = useState<'monthly' | 'quarterly' | 'annual'>('monthly'), [y, setY] = useState(new Date().getFullYear())
  const [mo, setMo] = useState(new Date().getMonth()), [d, setD] = useState<any>({ p: [], m: [], a: [], t: [], at: [], u: [] })
  useEffect(() => { (async () => { const g = async (t: string) => (await sb.from(t).select('*')).data || []
    setD({ p: await g('pipelines'), m: await g('meetings'), a: await g('activities'), t: await g('targets'), at: await g('annual_targets'), u: await g('profiles') }) })() }, [])
  const q = Math.floor(mo / 3) + 1
  const [from, to] = per === 'monthly' ? [new Date(y, mo, 1), new Date(y, mo + 1, 1)] : per === 'quarterly' ? [new Date(y, (q - 1) * 3, 1), new Date(y, q * 3, 1)] : [new Date(y, 0, 1), new Date(y + 1, 0, 1)]
  const inR = (v: string) => v && new Date(v) >= from && new Date(v) < to
  const qt = d.t.filter((t: any) => t.year === y && (per === 'annual' || t.quarter === q))
  const tgt = (uid?: string) => qt.filter((t: any) => !uid || t.member_id === uid).reduce((s: number, t: any) => s + +t.amount, 0) / (per === 'monthly' ? 3 : 1)
  const won = d.p.filter((p: any) => p.stage === 'Won' && inR(p.won_at || p.created_at))
  const ach = (uid?: string, v?: string) => won.filter((p: any) => (!uid || p.focal_person === uid) && (!v || p.vertical === v)).reduce((s: number, p: any) => s + +(p.confirmed_amount || 0), 0)
  const per_p = d.p.filter((p: any) => inR(p.created_at)), mt = d.m.filter((m: any) => inR(m.meeting_at)), ac = d.a.filter((a: any) => inR(a.occurred_at))
  const cnt = (rows: any[], k: string) => Object.entries(rows.reduce((o: any, r: any) => ({ ...o, [r[k]]: (o[r[k]] || 0) + 1 }), {}))
  const annual = d.at.find((a: any) => a.year === y)
  return <section>
    <header className="bar"><h1>Dashboard</h1></header>
    <div className="tabs">{(['monthly', 'quarterly', 'annual'] as const).map(p => <button key={p} className={per === p ? 'on' : ''} onClick={() => setPer(p)}>{p}</button>)}
      <input type="number" value={y} onChange={e => setY(+e.target.value)} style={{ width: 90 }} />
      {per !== 'annual' && <select value={mo} onChange={e => setMo(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>)}</select>}</div>
    <h2>Monetary fundraising performance</h2>
    <div className="grid"><div className="card lens"><b>Target vs achievement{per === 'annual' && annual ? ` (annual target ${money(annual.amount)})` : ''}</b><Meter a={ach()} t={per === 'annual' && annual ? +annual.amount : tgt()} /></div>
      <div className="card lens"><b>By vertical</b>{['DSP', 'VBD', 'Project'].map(v => { const pct = annual?.vertical_pct?.[v] || 0
        return <div key={v}>{v} ({pct}%)<Meter a={ach(undefined, v)} t={(per === 'annual' && annual ? +annual.amount : tgt()) * pct / 100} /></div> })}</div>
      <div className="card lens"><b>By employee</b>{d.u.map((u: any) => <div key={u.id}>{u.full_name}<Meter a={ach(u.id)} t={tgt(u.id)} /></div>)}</div>
      <div className="card lens"><b>Pipeline by stage (count)</b>{cnt(per_p, 'stage').map(([s, c]: any) => <div key={s}>{s}: {c} · {money(per_p.filter((p: any) => p.stage === s).reduce((a: number, p: any) => a + +p.expected_fund, 0))}</div>)}</div>
      <div className="card lens"><b>Cash vs in-kind (won)</b>{['cash', 'in_kind'].map(t => <div key={t}>{t}: {money(won.filter((p: any) => p.contribution_type === t).reduce((a: number, p: any) => a + +(p.confirmed_amount || 0), 0))}</div>)}</div></div>
    <h2>Non-monetary work performance</h2>
    <div className="grid"><div className="card lens nm"><b>Meetings</b><div>Total {mt.length} · Done {mt.filter((m: any) => m.status === 'Done').length} · Scheduled {mt.filter((m: any) => m.status === 'Scheduled').length}</div></div>
      <div className="card lens nm"><b>Activities by type</b>{cnt(ac, 'type').map(([t, c]: any) => <div key={t}>{t.replace(/_/g, ' ')}: {c}</div>)}</div>
      <div className="card lens nm"><b>Stewardship / prospects / independent</b>{cnt(ac, 'class').map(([t, c]: any) => <div key={t}>{t.replace(/_/g, ' ')}: {c}</div>)}</div>
      <div className="card lens nm"><b>Work by team member</b>{d.u.map((u: any) => <div key={u.id}>{u.full_name}: {ac.filter((a: any) => a.owner === u.id).length} activities · {mt.filter((m: any) => m.owner === u.id && m.status === 'Done').length} meetings done</div>)}</div></div>
  </section>
}

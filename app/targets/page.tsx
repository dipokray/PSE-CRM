'use client'
import { useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
export default function Targets() {
  const [y, setY] = useState(new Date().getFullYear()), [amt, setAmt] = useState(0), [qs, setQs] = useState([0, 0, 0, 0]), [pct, setPct] = useState({ DSP: 40, VBD: 30, Project: 30 })
  const [users, setUsers] = useState<any[]>([]), [mem, setMem] = useState<any>({}), [msg, setMsg] = useState(''), [locked, setLocked] = useState(false), [rows, setRows] = useState<any[]>([])
  const load = async () => { setUsers((await sb.from('profiles').select('*')).data || []); const a = (await sb.from('annual_targets').select('*').eq('year', y)).data || []
    setLocked(!!a.length); setRows((await sb.from('targets').select('*').eq('year', y)).data || []) }
  useEffect(() => { load() }, [y])
  const save = async () => {
    if (qs.reduce((a, b) => a + b, 0) !== amt) return setMsg('Quarterly targets must total the annual target.')
    if (Object.values(pct).reduce((a, b) => a + b, 0) !== 100) return setMsg('Vertical percentages must total 100.')
    for (let i = 0; i < 4; i++) { const s = users.reduce((a, u) => a + (+mem[i + '|' + u.id] || 0), 0); if (s !== qs[i]) return setMsg(`Q${i + 1} member targets must total ${qs[i]}.`) }
    const a = await sb.from('annual_targets').insert({ year: y, amount: amt, vertical_pct: pct }); if (a.error) return setMsg(a.error.message)
    const r = await sb.from('targets').insert(users.flatMap(u => [0, 1, 2, 3].map(i => ({ year: y, quarter: i + 1, member_id: u.id, amount: +mem[i + '|' + u.id] || 0 }))))
    setMsg(r.error ? r.error.message : 'Targets saved and locked.'); load()
  }
  return <section><header className="bar"><h1>Targets</h1><input type="number" value={y} onChange={e => setY(+e.target.value)} style={{ width: 100 }} /></header>
    {locked ? <div className="scroll"><table><thead><tr><th>Member</th><th>Quarter</th><th>Target</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{users.find(u => u.id === r.member_id)?.full_name}</td><td>Q{r.quarter}</td><td>{r.amount}</td></tr>)}</tbody></table>
      <p style={{ padding: 14 }}>Targets for {y} are fixed. Only an authorized manager can create them, and they cannot be edited afterwards.</p></div>
    : <div className="panel"><label className="wide">Annual team target<input type="number" value={amt} onChange={e => setAmt(+e.target.value)} /></label>
      {qs.map((v, i) => <label key={i}>Q{i + 1} target<input type="number" value={v} onChange={e => setQs(qs.map((x, j) => j === i ? +e.target.value : x))} /></label>)}
      {Object.keys(pct).map(k => <label key={k}>{k} share (%)<input type="number" value={(pct as any)[k]} onChange={e => setPct({ ...pct, [k]: +e.target.value })} /></label>)}
      {users.map(u => <div key={u.id} className="wide"><b>{u.full_name}</b><div className="row">{[0, 1, 2, 3].map(i => <input key={i} type="number" placeholder={`Q${i + 1}`} value={mem[i + '|' + u.id] || ''} onChange={e => setMem({ ...mem, [i + '|' + u.id]: e.target.value })} />)}</div></div>)}
      {msg && <p className="err wide">{msg}</p>}<button className="wide" onClick={save}>Save and lock targets</button></div>}
    {locked && msg && <p>{msg}</p>}</section>
}

'use client'
import { useState } from 'react'
import { sb } from '@/lib/supabase'
export default function Login() {
  const [e, setE] = useState(''), [p, setP] = useState(''), [m, setM] = useState('')
  const go = async () => { const { error } = await sb.auth.signInWithPassword({ email: e, password: p }); if (error) setM(error.message); else location.href = '/' }
  return <div className="panel" style={{ maxWidth: 360 }}><h1>Sign in</h1><label>Email<input value={e} onChange={x => setE(x.target.value)} /></label>
    <label>Password<input type="password" value={p} onChange={x => setP(x.target.value)} /></label>{m && <p className="err">{m}</p>}<button onClick={go}>Sign in</button></div>
}

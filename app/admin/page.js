'use client';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [password,setPassword]=useState(''); const [rows,setRows]=useState(null); const [error,setError]=useState('');
  async function load(){ const r=await fetch('/api/admin/results',{cache:'no-store'}); if(r.status===401){setRows(null);return;} const d=await r.json(); setRows(d.results||[]); }
  useEffect(()=>{load()},[]);
  async function login(e){e.preventDefault(); const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})}); const d=await r.json(); if(!r.ok)return setError(d.error||'Ошибка'); setPassword('');setError('');load();}
  async function reset(){ if(!confirm('Освободить все ячейки и заново перемешать номера?'))return; const r=await fetch('/api/admin/reset',{method:'POST'}); const d=await r.json(); if(!r.ok)return alert(d.error||'Ошибка'); load(); alert('Новый раунд создан'); }
  async function logout(){await fetch('/api/admin/logout',{method:'POST'});setRows(null)}
  if(rows===null) return <main className="shell"><section className="card admincard"><div className="brand">LUCKY SEAT</div><h1>Админ-панель</h1><form className="authbox" onSubmit={login}><input type="password" placeholder="ADMIN_PASSWORD" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="primary">Войти</button>{error&&<div className="message">{error}</div>}</form><a className="adminlink" href="/">← На сайт</a></section></main>;
  return <main className="shell"><section className="card admincard"><div className="adminhead"><div><div className="brand">LUCKY SEAT</div><h1>Результаты</h1></div><div><button onClick={reset} className="danger">Новый раунд</button><button onClick={logout}>Выйти</button></div></div><div className="results">{rows.length===0?<p>Пока никто не выбрал ячейку.</p>:rows.map(r=><div className="resultrow" key={r.position}><b>{r.username}</b><span>ячейка {r.position}</span><strong>номер {r.hidden_number}</strong><small>{r.claimed_at?new Date(r.claimed_at).toLocaleString('ru-RU'):''}</small></div>)}</div><a className="adminlink" href="/">← На сайт</a></section></main>
}

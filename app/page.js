'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [grid, setGrid] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/grid', { cache: 'no-store' });
    const d = await r.json();
    setGrid(d.cells || []); setMe(d.me || null); setLoading(false);
  }
  useEffect(() => { load(); const id=setInterval(load,4000); return()=>clearInterval(id); }, []);

  async function auth(e) {
    e.preventDefault(); setMessage('');
    const r = await fetch(`/api/auth/${mode}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) return setMessage(d.error || 'Ошибка');
    setForm({username:'',password:''}); await load();
  }

  async function claim(position) {
    if (!me || me.claimedPosition) return;
    setMessage('');
    const r = await fetch('/api/claim', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({position}) });
    const d = await r.json();
    if (!r.ok) setMessage(d.error || 'Не удалось выбрать');
    else setMessage(`Твой номер: ${d.number}`);
    await load();
  }

  async function logout() { await fetch('/api/auth/logout',{method:'POST'}); setMessage(''); await load(); }

  return <main className="shell">
    <section className="card">
      <div className="brand">LUCKY SEAT</div>
      <h1>Выбери свою ячейку</h1>
      <p className="sub">Как в кинотеатре: синяя — свободна, серая — уже занята. Номер скрыт до выбора.</p>

      {!me ? <div className="authbox">
        <div className="tabs"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Вход</button><button className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Регистрация</button></div>
        <form onSubmit={auth}>
          <input placeholder="Логин" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required minLength={3}/>
          <input type="password" placeholder="Пароль" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={4}/>
          <button className="primary">{mode==='login'?'Войти':'Создать аккаунт'}</button>
        </form>
      </div> : <div className="userbar"><span>Ты вошёл как <b>{me.username}</b></span><button onClick={logout}>Выйти</button></div>}

      {loading ? <p>Загрузка…</p> : <div className="grid">
        {grid.map(c => {
          const mine = me && me.claimedPosition === c.position;
          return <button key={c.position} className={`seat ${c.claimed?'taken':'free'} ${mine?'mine':''}`} disabled={!me || c.claimed || !!me?.claimedPosition} onClick={()=>claim(c.position)} title={`Ячейка ${c.position}`}>
            {mine ? me.number : ''}
          </button>
        })}
      </div>}
      <div className="legend"><span><i className="dot free"></i>Свободно</span><span><i className="dot taken"></i>Занято</span><span><i className="dot mine"></i>Твой выбор</span></div>
      {me?.claimedPosition && <div className="result">Ты выбрал ячейку <b>№{me.claimedPosition}</b>. Твой скрытый номер: <strong>{me.number}</strong></div>}
      {message && <div className="message">{message}</div>}
      <a className="adminlink" href="/admin">Админ</a>
    </section>
  </main>
}

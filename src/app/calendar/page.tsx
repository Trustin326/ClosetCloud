"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Piece = { id: string; name: string; category: string; color?: string };
type Look = { id: string; name: string; occasion: string; pieces: Piece[]; createdAt: string };
type Plan = { id: string; date: string; lookId: string; title: string; note: string };
const LOOKS_KEY = "cc-studio-looks";
const PLANS_KEY = "cc-outfit-plans-v1";
const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
export default function OutfitCalendarPage() {
  const today = isoDate(new Date());
  const [looks, setLooks] = useState<Look[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [lookId, setLookId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const rawLooks = localStorage.getItem(LOOKS_KEY);
      const rawPlans = localStorage.getItem(PLANS_KEY);
      if (rawLooks) { const parsed = JSON.parse(rawLooks); if (Array.isArray(parsed)) setLooks(parsed); }
      if (rawPlans) { const parsed = JSON.parse(rawPlans); if (Array.isArray(parsed)) setPlans(parsed); }
    } catch { setMessage("Some saved calendar data could not be read. Your existing data has been left untouched."); }
    finally { setReady(true); }
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); }, [plans, ready]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startOffset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - startOffset + 1;
    return day > 0 && day <= daysInMonth ? isoDate(new Date(month.getFullYear(), month.getMonth(), day)) : "";
  });
  const byDate = useMemo(() => plans.reduce<Record<string, Plan[]>>((acc, p) => { (acc[p.date] ||= []).push(p); return acc; }, {}), [plans]);
  const selectedPlans = (byDate[selectedDate] || []).slice().sort((a,b) => a.title.localeCompare(b.title));
  const upcoming = plans.filter(p => p.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 8);
  const chosenLook = looks.find(l => l.id === lookId);
  function addPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!chosenLook) { setMessage("Choose a saved look before adding it to your calendar."); return; }
    setPlans(old => [...old, { id: crypto.randomUUID(), date: selectedDate, lookId: chosenLook.id, title: title.trim() || chosenLook.name, note: note.trim() }]);
    setTitle(""); setNote(""); setMessage("Your outfit is planned."); 
  }
  function removePlan(id: string) { setPlans(old => old.filter(p => p.id !== id)); setMessage("Calendar entry removed."); }
  function moveMonth(amount: number) { setMonth(d => new Date(d.getFullYear(), d.getMonth()+amount, 1)); }
  return <main className="site-shell">
    <header className="nav"><Link className="brand" href="/">closet<span>cloud</span>™</Link><nav className="nav-links"><Link href="/closet">My Closet</Link><Link href="/outfits">Outfit Studio</Link><Link href="/wear-tracker">Wear Tracker</Link><Link href="/discover">Discover</Link></nav><span className="studio-local-tag">STYLE PLANNER</span></header>
    <div className="calendar-wrap">
      <div className="studio-heading"><div><div className="eyebrow">A little look ahead</div><h1 className="serif">The outfit calendar.</h1><p>Plan what you’ll wear for the moments that matter, using looks from your own style archive.</p></div><Link className="pill secondary" href="/outfits">＋ Create a look</Link></div>
      <div className="calendar-layout">
        <section className="content-card calendar-month">
          <div className="calendar-month-head"><button onClick={()=>moveMonth(-1)} aria-label="Previous month">‹</button><div><div className="eyebrow">Your plans</div><h2 className="serif">{monthLabel(month)}</h2></div><button onClick={()=>moveMonth(1)} aria-label="Next month">›</button></div>
          <div className="calendar-grid">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span className="calendar-weekday" key={d}>{d}</span>)}{cells.map((date,i)=>date?<button key={date} onClick={()=>{setSelectedDate(date);setMessage("");}} className={["calendar-day",selectedDate===date?"selected":"",date===today?"today":""].filter(Boolean).join(" ")}><span>{Number(date.slice(-2))}</span>{byDate[date]?.length?<i>{byDate[date].length} planned</i>:null}</button>:<span key={"blank-"+i} className="calendar-blank"/>)}</div>
          <div className="calendar-legend"><span><i/> Planned outfit</span><span><b/> Today</span></div>
        </section>
        <section className="content-card calendar-planner">
          <div className="eyebrow">Your selected day</div><h2 className="serif">{new Date(selectedDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</h2>
          {!selectedPlans.length?<p className="wear-muted">Nothing planned yet. Give this day a look.</p>:<div className="planned-list">{selectedPlans.map(p=>{const look=looks.find(l=>l.id===p.lookId);return <article key={p.id}><div><small>{look?.occasion || "Planned look"}</small><h3 className="serif">{p.title}</h3><p>{look?look.pieces.map(x=>x.name).join(" · "):"This saved look is no longer in your outfit archive."}</p>{p.note&&<p>{p.note}</p>}</div><button onClick={()=>removePlan(p.id)} aria-label={"Remove "+p.title}>×</button></article>;})}</div>}
          {!looks.length?<div className="calendar-empty"><p>You haven’t saved any looks yet. Create an outfit first, then come back to plan it.</p><Link className="pill" href="/outfits">Open Outfit Studio</Link></div>:<form className="calendar-form" onSubmit={addPlan}><label>Choose a saved look<select required value={lookId} onChange={e=>setLookId(e.target.value)}><option value="">Select a look</option>{looks.map(l=><option key={l.id} value={l.id}>{l.name} · {l.occasion}</option>)}</select></label><label>Event or plan name<input maxLength={70} value={title} onChange={e=>setTitle(e.target.value)} placeholder={chosenLook?.name || "e.g. Birthday dinner"}/></label><label>Notes (optional)<textarea rows={2} maxLength={220} value={note} onChange={e=>setNote(e.target.value)} placeholder="Venue, dress code, accessories to remember…"/></label><button className="pill" type="submit">＋ Add to this day</button></form>}
          {message&&<p className="calendar-message" role="status">{message}</p>}
        </section>
      </div>
      <section className="content-card calendar-upcoming"><div className="eyebrow">Coming up</div><h2 className="serif">On the horizon.</h2>{!upcoming.length?<p className="wear-muted">Your upcoming outfit plans will appear here.</p>:<div className="upcoming-list">{upcoming.map(p=><button key={p.id} onClick={()=>{setSelectedDate(p.date);setMonth(new Date(p.date+"T12:00:00"));}}><span>{new Date(p.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span><b>{p.title}</b><small>{looks.find(l=>l.id===p.lookId)?.occasion || "Outfit plan"}</small></button>)}</div>}</section>
      <p className="local-note">Your outfit plans are stored in this browser on this device. They are not synced or backed up online yet. Removing a saved look from Outfit Studio does not erase its calendar entry.</p>
    </div>
  </main>;
}

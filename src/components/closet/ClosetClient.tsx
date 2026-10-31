"use client";
import { FormEvent, useState } from "react";
type Item = { id: string; name: string; category: string; image_url: string | null; color: string | null; brand: string | null };
export function ClosetClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    const form = e.currentTarget; const fd = new FormData(form);
    try {
      const r = await fetch("/api/closet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to add item.");
      setItems([d.item, ...items]); form.reset(); setMessage("Added to your closet.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Unable to add item."); }
    finally { setBusy(false); }
  }
  return <><div className="content-card"><h2 className="serif">Add a piece</h2><form onSubmit={add}><input className="field" name="name" placeholder="Item name" required /><select className="field" name="category"><option value="tops">Tops</option><option value="bottoms">Bottoms</option><option value="dresses">Dresses</option><option value="shoes">Shoes</option><option value="bags">Bags</option><option value="accessories">Accessories</option><option value="outerwear">Outerwear</option><option value="other">Other</option></select><input className="field" name="brand" placeholder="Brand (optional)" /><input className="field" name="color" placeholder="Color (optional)" /><button className="pill" disabled={busy}>{busy ? "Saving…" : "Add to closet"}</button></form>{message && <p role="status">{message}</p>}</div><section className="tiles">{items.map(item => <article className="tile" key={item.id}><small>{item.category}</small><h3>{item.name}</h3><p>{[item.brand, item.color].filter(Boolean).join(" · ")}</p></article>)}</section></>;
}
"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");try{const f=new FormData(e.currentTarget);const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email:String(f.get("email")),password:String(f.get("password"))});if(error)throw error;window.location.href="/closet";}catch(err){setMessage(err instanceof Error?err.message:"Unable to sign in.");}finally{setBusy(false);}}
  return <form onSubmit={submit}><label className="label">Email address</label><input className="field" type="email" name="email" autoComplete="email" required/><label className="label">Password</label><input className="field" type="password" name="password" autoComplete="current-password" required/><button className="pill" style={{width:"100%"}} disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{message&&<p role="alert" style={{fontSize:12,color:"#a34f45"}}>{message}</p>}</form>;
}

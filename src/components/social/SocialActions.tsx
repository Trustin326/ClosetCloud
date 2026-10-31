"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Comment = { id: string; body: string; created_at: string; user_id: string; profiles?: { display_name?: string | null; username?: string | null; avatar_url?: string | null } | null };

export function SocialActions({ outfitId, creatorId }: { outfitId: string; creatorId: string }) {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/social?outfitId=${encodeURIComponent(outfitId)}`, { cache: "no-store" }),
      fetch(`/api/social?creatorId=${encodeURIComponent(creatorId)}`, { cache: "no-store" })
    ]).then(async ([outfitResponse, creatorResponse]) => {
      if (!outfitResponse.ok || !creatorResponse.ok) throw new Error("Sign in to join the conversation.");
      const [outfit, creator] = await Promise.all([outfitResponse.json(), creatorResponse.json()]);
      if (active) { setLiked(outfit.isLiked); setLikes(outfit.likeCount); setComments(outfit.comments || []); setFollowing(creator.isFollowing); }
    }).catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [outfitId, creatorId]);

  async function send(payload: Record<string, string>) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "That action could not be completed.");
      return data;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      return null;
    } finally { setBusy(false); }
  }

  async function toggleLike() {
    const next = !liked;
    const result = await send({ action: next ? "like" : "unlike", outfitId });
    if (result) { setLiked(next); setLikes((count) => Math.max(0, count + (next ? 1 : -1))); }
  }
  async function toggleFollow() {
    const next = !following;
    const result = await send({ action: next ? "follow" : "unfollow", creatorId });
    if (result) setFollowing(next);
  }
  async function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = body.trim();
    if (!clean) return;
    const result = await send({ action: "comment", outfitId, body: clean });
    if (result?.comment) { setComments((items) => [...items, result.comment]); setBody(""); }
  }

  return <div className="social-actions">
    <div className="social-action-row">
      <button className="social-button" type="button" onClick={toggleLike} disabled={loading || busy} aria-pressed={liked}>{liked ? "♥ Liked" : "♡ Like"} · {likes}</button>
      <button className="social-button" type="button" onClick={toggleFollow} disabled={loading || busy}>{following ? "Following" : "＋ Follow creator"}</button>
      <Link className="social-button" href="/sign-in">Sign in</Link>
    </div>
    <div className="social-comments">
      <strong>Conversation</strong>
      {comments.map((comment) => <p className="social-comment" key={comment.id}><b>{comment.profiles?.display_name || comment.profiles?.username || "Member"}</b> {comment.body}</p>)}
      <form onSubmit={addComment} className="social-comment-form">
        <input value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} placeholder="Add a thoughtful comment…" aria-label="Comment" />
        <button type="submit" disabled={busy || !body.trim()}>Post</button>
      </form>
      {message && <p className="social-message" role="status">{message}</p>}
    </div>
  </div>;
}

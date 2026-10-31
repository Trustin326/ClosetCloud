"use client";

import { useEffect, useState } from "react";

export function CreatorFollow({ creatorId }: { creatorId: string }) {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/social?creatorId=${encodeURIComponent(creatorId)}`, { cache: "no-store" }),
      fetch(`/api/social?followerCountFor=${encodeURIComponent(creatorId)}`, { cache: "no-store" })
    ]).then(async ([statusResponse, countResponse]) => {
      if (!statusResponse.ok) throw new Error("Sign in to follow creators.");
      const status = await statusResponse.json();
      const count = countResponse.ok ? await countResponse.json() : { followerCount: 0 };
      if (active) { setFollowing(Boolean(status.isFollowing)); setFollowers(count.followerCount || 0); }
    }).catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [creatorId]);

  async function toggle() {
    setBusy(true); setMessage("");
    try {
      const next = !following;
      const response = await fetch("/api/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: next ? "follow" : "unfollow", creatorId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update follow status.");
      setFollowing(next);
      setFollowers((count) => Math.max(0, count + (next ? 1 : -1)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update follow status.");
    } finally { setBusy(false); }
  }

  return <div className="creator-follow">
    <button className="social-button" type="button" onClick={toggle} disabled={loading || busy}>{following ? "Following" : "＋ Follow"}</button>
    <span>{followers} {followers === 1 ? "follower" : "followers"}</span>
    {message && <small>{message} <a href="/sign-in">Sign in</a></small>}
  </div>;
}

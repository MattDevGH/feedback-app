"use client";

import { useState } from "react";
import type { ReviewToken } from "@/lib/repositories/token.repository";

type Props = {
  tokens: ReviewToken[];
  adminKey: string;
};

export default function TokenPanel({ tokens: initialTokens, adminKey }: Props) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function createToken(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/tokens?key=${adminKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create token");

      const newToken = await res.json();
      setTokens([newToken, ...tokens]);
      setName("");
    } catch {
      // Silently fail — the UI state stays unchanged
    } finally {
      setCreating(false);
    }
  }

  function getInviteUrl(token: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/f/${token}`;
  }

  async function copyLink(token: ReviewToken) {
    const url = getInviteUrl(token.token);
    await navigator.clipboard.writeText(url);
    setCopiedId(token.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getStatus(token: ReviewToken): { label: string; style: string } {
    if (token.submissionId) {
      return { label: "Submitted", style: "bg-emerald-100 text-emerald-700" };
    }
    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return { label: "Expired", style: "bg-gray-100 text-gray-500" };
    }
    return { label: "Pending", style: "bg-amber-100 text-amber-700" };
  }

  return (
    <div>
      {/* Create token form */}
      <form onSubmit={createToken} className="flex gap-3 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Colleague's name"
          aria-label="Name for the invite link"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="shrink-0 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "Creating…" : "Create invite"}
        </button>
      </form>

      {/* Token list */}
      {tokens.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No invite links created yet.</p>
      ) : (
        <ul className="space-y-3">
          {tokens.map((token) => {
            const status = getStatus(token);
            return (
              <li
                key={token.id}
                className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{token.name}</p>
                  <p className="text-xs text-gray-400">
                    Created{" "}
                    {new Date(token.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.style}`}>
                    {status.label}
                  </span>

                  {!token.submissionId && (
                    <button
                      onClick={() => copyLink(token)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                      aria-label={`Copy invite link for ${token.name}`}
                    >
                      {copiedId === token.id ? "Copied!" : "Copy link"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

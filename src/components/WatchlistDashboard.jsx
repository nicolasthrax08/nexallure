import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase.js";

export default function WatchlistDashboard({ userId }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.warn(
        "Watchlist Dashboard loaded without a valid authenticated user session token profile ID."
      );
      setLoading(false);
      return;
    }

    async function fetchWatchlist() {
      try {
        const { data, error } = await supabase
          .from("watched_markets")
          .select(
            `id, industry, region, is_active,
            market_snapshots ( volatility_score, opportunity_score, updated_at )`
          )
          .eq("user_id", userId)
          .eq("is_active", true);

        if (error) {
          console.error("Watchlist fetch error:", error);
        } else if (data) {
          setMarkets(data);
        }
      } catch (err) {
        console.error("Watchlist fetch exception:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, [userId]);

  async function handleRemove(id) {
    // Optimistic update
    setMarkets((prev) => prev.filter((m) => m.id !== id));

    await supabase
      .from("watched_markets")
      .update({ is_active: false })
      .eq("id", id);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-[#C9A84C]/40 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pt-24 selection:bg-[#C9A84C]/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6">
          <h1 className="font-serif text-3xl tracking-tight mb-2 text-white">
            Market Monitor
          </h1>
          <p className="font-mono text-[10px] tracking-widest text-white/50 uppercase">
            LIVE INTELLIGENCE WATCHLISTS FOR ACTIVE SUPPLIERS
          </p>
        </header>

        {markets.length === 0 ? (
          <div className="border border-white/5 bg-[#141820] p-12 text-center">
            <p className="text-white/40 font-mono text-sm uppercase tracking-wider mb-4">
              Your Watchlist is Empty
            </p>
            <p className="text-white/60 text-xs max-w-md mx-auto mb-6 font-sans">
              Monitor active industries from any Market Guide report to stream
              real-time operational shifts, raw material movements, and direct
              capability signals here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => {
              const latestSnapshot =
                Array.isArray(market.market_snapshots) &&
                market.market_snapshots.length > 0
                  ? market.market_snapshots[0]
                  : null;

              return (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#141820] border border-white/10 p-5 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-[9px] bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-2 py-0.5 tracking-widest uppercase">
                        LIVE MONITOR
                      </span>
                      <button
                        onClick={() => handleRemove(market.id)}
                        className="font-mono text-[10px] text-white/30 hover:text-red-400 uppercase tracking-wider transition-colors"
                      >
                        [ REMOVE ]
                      </button>
                    </div>

                    <h3 className="font-serif text-xl mb-1 text-white capitalize">
                      {market.industry || "—"}
                    </h3>
                    <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase mb-6">
                      REGION: {market.region || "—"}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-mono text-[9px] text-white/40 block uppercase tracking-wider">
                        VOLATILITY
                      </span>
                      <span className="text-sm font-mono text-white">
                        {latestSnapshot?.volatility_score ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-white/40 block uppercase tracking-wider">
                        OPPORTUNITY
                      </span>
                      <span className="text-sm font-mono text-[#C9A84C]">
                        {latestSnapshot?.opportunity_score ?? "—"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

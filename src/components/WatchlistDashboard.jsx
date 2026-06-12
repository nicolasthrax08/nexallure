import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase.js";
import { toast } from "react-hot-toast";

export default function WatchlistDashboard({ userId }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMonitoredMarkets() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monitored_markets")
        .select("id, category, region, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMarkets(data || []);
    } catch (err) {
      console.error("Failed to fetch monitored markets:", err);
      toast.error("Could not load your monitored markets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonitoredMarkets();
  }, [userId]);

  async function handleRemove(id) {
    // Optimistic update
    const previousMarkets = [...markets];
    setMarkets((prev) => prev.filter((m) => m.id !== id));

    try {
      const { error } = await supabase
        .from("monitored_markets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Market removed from Monitor");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove market");
      setMarkets(previousMarkets); // rollback
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-[#C9A84C]/40 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6">
          <h1 className="font-serif text-3xl tracking-tight mb-2">Market Monitor</h1>
          <p className="font-mono text-[10px] tracking-widest text-white/50 uppercase">
            YOUR MONITORED MARKETS
          </p>
        </header>

        {markets.length === 0 ? (
          <div className="border border-white/5 bg-[#141820] p-12 text-center">
            <p className="text-white/40 font-mono text-sm uppercase tracking-wider mb-4">
              No markets monitored yet
            </p>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Go to any Market Guide report and click <strong>"MONITOR THIS MARKET"</strong> to start tracking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141820] border border-white/10 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[9px] bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-2 py-0.5 tracking-widest">
                      MONITORED
                    </span>
                    <button
                      onClick={() => handleRemove(market.id)}
                      className="font-mono text-[10px] text-white/30 hover:text-red-400 uppercase tracking-wider transition-colors"
                    >
                      REMOVE
                    </button>
                  </div>

                  <h3 className="font-serif text-xl mb-1 text-white capitalize">
                    {market.category}
                  </h3>
                  <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase mb-6">
                    {market.region || "Global"}
                  </p>
                </div>

                <div className="text-[10px] text-white/40 font-mono pt-4 border-t border-white/10">
                  Added {new Date(market.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

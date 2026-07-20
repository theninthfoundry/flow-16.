import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Activity, ShieldAlert, Cpu, CheckSquare } from "lucide-react";

export default function RoadmapHUD({ done, setExp, audioEnabled }) {
  const [cockpitTime, setCockpitTime] = useState("");
  const [temperature, setTemperature] = useState(34.2);
  const [missions, setMissions] = useState(() => {
    // Restore or initialize custom mini-missions
    try {
      const stored = localStorage.getItem("rmx_hud_missions");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: "m1", text: "Study Computer Arch (Month 1)", done: false },
      { id: "m2", text: "Code a Heap Allocator (Month 2)", done: false },
      { id: "m3", text: "Build a Raft Consensus Node (Month 7)", done: false },
      { id: "m4", text: "Analyze Causal Attention Weights (Month 10)", done: false }
    ];
  });

  // Sound triggers
  const playClick = () => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  // Clock ticks
  useEffect(() => {
    const updateHUD = () => {
      const now = new Date();
      setCockpitTime(now.toUTCString().replace("GMT", "UTC"));
      // Simulate minor ambient spacecraft temperature changes
      setTemperature(prev => +(prev + (Math.random() - 0.5) * 0.1).toFixed(1));
    };
    updateHUD();
    const interval = setInterval(updateHUD, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync missions to localStorage
  const toggleMission = (id) => {
    playClick();
    const updated = missions.map(m => m.id === id ? { ...m, done: !m.done } : m);
    setMissions(updated);
    localStorage.setItem("rmx_hud_missions", JSON.stringify(updated));
  };

  // Quick phase shortcuts
  const phases = [
    { id: 1, name: "Phase I", label: "Foundations", month: 1, color: "#FF2D78" },
    { id: 2, name: "Phase II", label: "Systems Depth", month: 5, color: "#7C3AED" },
    { id: 3, name: "Phase III", label: "AI Mastery", month: 9, color: "#F97316" }
  ];

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(16, 36, 66, 0.4), rgba(10, 22, 40, 0.2))",
      border: "1.5px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "18px",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)"
    }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Telemetry Status Column */}
        <div className="space-y-2 border-r border-white/5 pr-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#22D3EE] uppercase">
            <Cpu className="w-4 h-4 text-[#22D3EE] animate-pulse" />
            COCKPIT TELEMETRY
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">SYSTEM TIME:</span>
              <span>{cockpitTime || "FETCHING CONSTELLATION..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">REACTOR TEMPERATURE:</span>
              <span className={temperature > 35 ? "text-amber-400" : "text-[#10F5A0]"}>
                {temperature}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SHIELD STATUS:</span>
              <span className="text-[#10F5A0] font-bold flex items-center gap-1">
                ONLINE <span className="inline-block w-1.5 h-1.5 bg-[#10F5A0] rounded-full animate-ping" />
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Micro-Missions Tracker */}
        <div className="space-y-2 px-2 border-r border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#FF2D78] uppercase">
            <Activity className="w-4 h-4 text-[#FF2D78] animate-pulse" />
            ACTIVE COCKPIT OPERATIONS
          </div>
          <div className="space-y-1.5">
            {missions.map(m => (
              <div 
                key={m.id} 
                onClick={() => toggleMission(m.id)}
                className="flex items-center gap-2 cursor-pointer group select-none text-[11px] font-sans"
              >
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  border: `1.2px solid ${m.done ? '#10F5A0' : '#475569'}`,
                  background: m.done ? '#10F5A0' : 'transparent',
                  transition: "all 0.2s"
                }} className="flex items-center justify-center">
                  {m.done && <span className="text-[8px] text-slate-950 font-black">✓</span>}
                </div>
                <span className={`transition-colors duration-200 ${m.done ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Jump Controls */}
        <div className="space-y-2 pl-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#FBBF24] uppercase">
            <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            WARP DRIVE NAVIGATION
          </div>
          <div className="flex flex-wrap gap-2">
            {phases.map(ph => (
              <button
                key={ph.id}
                onClick={() => {
                  playClick();
                  setExp(ph.month);
                }}
                style={{
                  background: `${ph.color}15`,
                  border: `1px solid ${ph.color}35`,
                  color: ph.color,
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "10.5px",
                  fontWeight: "700"
                }}
                className="hover:scale-105 active:scale-95 transition-all duration-200 flex-1 min-w-[70px] text-center"
              >
                {ph.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

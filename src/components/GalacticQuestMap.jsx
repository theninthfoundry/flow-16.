import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, Award, Zap, Compass, Shield, Rocket, Activity } from "lucide-react";

export default function GalacticQuestMap({ 
  done, 
  bkm, 
  setTab, 
  setExp, 
  audioEnabled, 
  starSpeed, 
  setStarSpeed 
}) {
  // Sound triggers
  const playBeep = () => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playWarp = () => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Systems and Phases data matching App.jsx logic
  const systems = [
    { m: 1, name: "Core Terminal", phase: 1, milestone: "Linux kernel interfaces, system calls & core shell mastery.", color: "#FF2D78" },
    { m: 2, name: "Assembly & Pointer Heap", phase: 1, milestone: "Deep memory alignment, pointer arithmetic & custom malloc block allocator.", color: "#FF2D78" },
    { m: 3, name: "Concurrency Reactor", phase: 1, milestone: "Epoll loops, POSIX multi-threading & synchronization primitives.", color: "#FF2D78" },
    { m: 4, name: "Socket Protocol Suite", phase: 1, milestone: "Handshakes, raw sockets, congestion window & protocol parsing.", color: "#FF2D78" },
    { m: 5, name: "High-Freq DB Shard", phase: 2, milestone: "Indexing strategies, query planners, write-ahead logs & MVCC.", color: "#7C3AED" },
    { m: 6, name: "Load Balancer Proxy", phase: 2, milestone: "Dynamic reverse proxying, connection pooling & health probe clusters.", color: "#7C3AED" },
    { m: 7, name: "Raft Consensus Cluster", phase: 2, milestone: "Distributed state machines, replication logs, election timers & vector clocks.", color: "#7C3AED" },
    { m: 8, name: "Microservice Gateway", phase: 2, milestone: "Rate limiting algorithms, circuit breakers & telemetry trace logs.", color: "#7C3AED" },
    { m: 9, name: "Matrix Tensor Math", phase: 3, milestone: "Forward propagation, gradient descent vectorization & autodiff compilers.", color: "#F97316" },
    { m: 10, name: "Transformer Attention", phase: 3, milestone: "Queries, keys, values weights, multi-head causal attention maps.", color: "#F97316" },
    { m: 11, name: "HNSW Vector Search", phase: 3, milestone: "Hierarchical Navigable Small World clustering graphs & Cosine metrics.", color: "#F97316" },
    { m: 12, name: "Cognitive Multi-Agent", phase: 3, milestone: "Tool definitions, ReAct execution loops, reflexions & state graph supervisor.", color: "#F97316" }
  ];

  // Helper: calculate total items completed
  // App.jsx done keys format: `m${m.month}_t${ti}_i${ii}`
  const countDoneForMonth = (mNum) => {
    return Object.keys(done).filter(key => key.startsWith(`m${mNum}_`) && done[key]).length;
  };

  // Estimate progress based on actual checks
  const totalCompletedItems = Object.keys(done).filter(k => done[k]).length;
  const currentLevel = Math.floor(totalCompletedItems / 4) + 1;
  const currentXP = totalCompletedItems * 180;
  const nextLevelXP = currentLevel * 720;
  const levelProgressPct = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  // Determine current Rank based on Level
  const getRankName = (lvl) => {
    if (lvl >= 15) return "1% Systems Master Architect";
    if (lvl >= 10) return "Distributed High-Fleet Commander";
    if (lvl >= 7) return "Core System Kernel Knight";
    if (lvl >= 4) return "Outer Rim Systems Tech";
    return "Foundation Sector Cadet";
  };

  // Find currently active month (first month that has < 100% completion or the 12th)
  // Let's assume each month has roughly 15 topics/items
  const monthCompletionPcts = systems.map(sys => {
    // Check key prefixes to count total checks for that month
    const completedCount = countDoneForMonth(sys.m);
    // Rough estimate of average items per month is ~15-20
    const estTotalItems = 15; // Just for visual purposes
    const pct = Math.min(100, Math.round((completedCount / estTotalItems) * 100));
    return { ...sys, pct, completedCount };
  });

  const activeSystemIndex = monthCompletionPcts.findIndex(s => s.pct < 100);
  const currentActiveMonth = activeSystemIndex !== -1 ? activeSystemIndex + 1 : 12;

  // Unlocked Badges based on accomplishments
  const badges = [
    { id: "cadet", name: "Sector Cadet", desc: "Initiated your systems journey", icon: Shield, cond: () => totalCompletedItems >= 1, color: "#38BDF8" },
    { id: "asm", name: "Kernel Squire", desc: "Foundation Phase Complete", icon: Zap, cond: () => countDoneForMonth(1) >= 4 && countDoneForMonth(2) >= 4, color: "#FF2D78" },
    { id: "net", name: "Nebula Pilot", desc: "Network socket layer unlocked", icon: Compass, cond: () => countDoneForMonth(4) >= 4, color: "#22D3EE" },
    { id: "raft", name: "Consensus Knight", desc: "Conquered Raft replication logic", icon: Trophy, cond: () => countDoneForMonth(7) >= 3, color: "#A78BFA" },
    { id: "tensor", name: "Causal Jedi", desc: "Multi-Head Attention calculated", icon: Sparkles, cond: () => countDoneForMonth(10) >= 3, color: "#FBBF24" },
    { id: "grandmaster", name: "1% Grandmaster", desc: "Mastered all 12 modules", icon: Award, cond: () => totalCompletedItems >= 100, color: "#10F5A0" }
  ];

  // System map planet positions (sine wave curve for nice cosmic flow path)
  const getPlanetPos = (idx) => {
    const x = 5 + (idx * 8.2); // 0 to 12
    const y = 50 + Math.sin(idx * 1.5) * 26; // Sinusoidal vertical path
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* 1. HUD Level Panel */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16, 36, 66, 0.45), rgba(10, 22, 40, 0.25))",
        border: "1.5px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Spinning Hexagonal Aura */}
              <div className="absolute inset-0 rounded-full animate-pulse blur-[8px] bg-gradient-to-r from-purple-500 to-pink-500 opacity-60" />
              <div style={{
                background: "rgba(13, 27, 49, 0.85)",
                border: "2px solid #A78BFA",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "900",
                color: "#F8FAFC",
                position: "relative",
                zIndex: 10
              }}>
                L{currentLevel}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#FF2D78] uppercase">Vessel Pilot Rank</span>
                <span className="text-[11px] bg-[#FF2D78]/15 text-[#FF2D78] border border-[#FF2D78]/25 px-2 py-0.5 rounded-full text-xs font-mono">
                  Active
                </span>
              </div>
              <h2 className="text-lg font-bold font-sans text-slate-100 tracking-tight mt-0.5">
                {getRankName(currentLevel)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completed {totalCompletedItems} deep first-principle engineering skills
              </p>
            </div>
          </div>

          <div className="flex-1 md:max-w-md">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-mono text-slate-400">XP METRICS: {currentXP} / {nextLevelXP}</span>
              <span className="font-bold text-[#10F5A0]">{levelProgressPct}% to next rank</span>
            </div>
            <div className="w-full bg-slate-950/75 rounded-full h-2.5 p-0.5 border border-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 via-pink-500 to-[#10F5A0]"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Galactic Journey Starmap */}
      <div style={{
        background: "rgba(10, 22, 40, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Deep starry space backgrounds */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-widest text-[#22D3EE] uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#22D3EE] animate-spin" />
              GALACTIC STAR SYSTEM SECTOR MAP
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any planet to jump directly into its respective monthly curriculum module
            </p>
          </div>

          {/* Warp Hyperdrive velocity toggle */}
          <div className="flex items-center gap-3 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono font-bold text-[#FBBF24]">HYPERDRIVE:</span>
            <input 
              type="range" 
              min="0.2" 
              max="5" 
              step="0.2"
              value={starSpeed}
              onChange={(e) => {
                setStarSpeed(parseFloat(e.target.value));
                localStorage.setItem("rmx_star_speed", e.target.value);
                playWarp();
              }}
              className="w-20 accent-[#FBBF24] h-1" 
            />
            <span className="text-[10px] font-mono text-slate-300 w-8">{starSpeed}x</span>
          </div>
        </div>

        {/* Constellation Canvas View */}
        <div className="relative overflow-x-auto no-scrollbar py-6 select-none min-h-[220px]">
          <div className="relative w-[1100px] h-[160px] mx-auto">
            {/* SVG Connecting Path Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <path 
                d={`M ${systems.map((_, idx) => {
                  const { x, y } = getPlanetPos(idx);
                  return `${(x * 11)} ${y * 1.6}`;
                }).join(" L ")}`}
                fill="none" 
                stroke="url(#constellation-grad)" 
                strokeWidth="2" 
                strokeDasharray="4 6"
              />
              <defs>
                <linearGradient id="constellation-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF2D78" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Individual Star Systems (Planet Nodes) */}
            {systems.map((sys, idx) => {
              const { x, y } = getPlanetPos(idx);
              const compInfo = monthCompletionPcts[idx];
              const isActive = sys.m === currentActiveMonth;
              const isCompleted = compInfo.pct === 100;

              return (
                <div 
                  key={sys.m}
                  style={{
                    position: "absolute",
                    left: `${x * 11}px`,
                    top: `${y * 1.6}px`,
                    transform: "translate(-50%, -50%)",
                    zIndex: isActive ? 20 : 10
                  }}
                  className="group cursor-pointer"
                  onClick={() => {
                    playBeep();
                    setTab("roadmap");
                    setExp(sys.m);
                  }}
                >
                  {/* Planet Visual Representation */}
                  <div className="relative flex flex-col items-center">
                    {/* Ring aura for currently active system */}
                    {isActive && (
                      <div className="absolute -inset-4 rounded-full border border-[#22D3EE]/60 animate-ping opacity-75" />
                    )}

                    {/* Outer spinning dash ring */}
                    <div 
                      className="absolute -inset-2.5 rounded-full border border-dashed opacity-40 transition-transform duration-1000 group-hover:rotate-180"
                      style={{ 
                        borderColor: isCompleted ? "#10F5A0" : isActive ? "#22D3EE" : "rgba(255,255,255,0.15)",
                        animation: isActive ? "spin 8s linear infinite" : "none"
                      }}
                    />

                    {/* Planet Circle */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 group-hover:scale-110 shadow-lg"
                      style={{
                        background: isCompleted 
                          ? "radial-gradient(circle, #022c22 0%, #064e3b 100%)" 
                          : isActive 
                            ? "radial-gradient(circle, #083344 0%, #155e75 100%)" 
                            : "radial-gradient(circle, #0f172a 0%, #1e293b 100%)",
                        border: `2px solid ${isCompleted ? "#10F5A0" : isActive ? "#22D3EE" : sys.color}`,
                        boxShadow: isActive ? "0 0 16px rgba(34,211,238,0.5)" : isCompleted ? "0 0 12px rgba(16,245,160,0.25)" : "none",
                        color: isCompleted ? "#10F5A0" : isActive ? "#22D3EE" : "#F1F5F9"
                      }}
                    >
                      {sys.m}
                    </div>

                    {/* Mini Starship Avatar floating exactly on the current active node */}
                    {isActive && (
                      <div className="absolute -top-7 pointer-events-none animate-bounce">
                        <Rocket className="w-5 h-5 text-[#22D3EE] rotate-[45deg]" />
                      </div>
                    )}

                    {/* Tooltip detail block */}
                    <div className="absolute top-12 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none bg-slate-950/95 border border-white/10 rounded-lg p-2.5 w-52 text-center shadow-2xl z-50">
                      <div className="flex items-center justify-between gap-1 border-b border-white/5 pb-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-300">SYSTEM {sys.m}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-white/5 rounded text-slate-400 font-bold">{compInfo.pct}% DONE</span>
                      </div>
                      <h4 className="text-xs font-bold font-sans text-slate-100 truncate">{sys.name}</h4>
                      <p className="text-[9px] text-slate-400 leading-tight mt-1 text-left">{sys.milestone}</p>
                    </div>

                    {/* Simple under-node text label */}
                    <span 
                      className="text-[9px] font-mono font-bold tracking-tight mt-2 text-center max-w-[70px] truncate"
                      style={{ color: isCompleted ? "#10F5A0" : isActive ? "#22D3EE" : "rgba(255,255,255,0.45)" }}
                    >
                      {sys.name.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Medal Room & Badges showcase */}
      <div style={{
        background: "rgba(10, 22, 40, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "16px",
        padding: "20px"
      }}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-xs font-bold font-mono tracking-widest text-[#FBBF24] uppercase flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FBBF24]" />
            COSMIC FLEET FLEET DECORATIONS
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {badges.filter(b => b.cond()).length} of {badges.length} badges earned
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map(badge => {
            const unlocked = badge.cond();
            const Icon = badge.icon;

            return (
              <div 
                key={badge.id}
                style={{
                  background: unlocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                  border: `1.5px solid ${unlocked ? badge.color + "30" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: "12px",
                  padding: "12px 10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  boxShadow: unlocked ? `0 0 12px ${badge.color}0B` : "none"
                }}
                className={`group relative hover:border-${unlocked ? 'opacity-80' : 'none'}`}
              >
                {/* Glowing status */}
                {unlocked && (
                  <div 
                    className="absolute inset-0 rounded-xl filter blur-[12px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                    style={{ background: badge.color }}
                  />
                )}

                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{
                    background: unlocked ? `${badge.color}15` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${unlocked ? badge.color + "35" : "rgba(255,255,255,0.05)"}`,
                    color: unlocked ? badge.color : "rgba(255,255,255,0.15)"
                  }}
                >
                  <Icon className={`w-5 h-5 ${unlocked ? 'animate-pulse' : ''}`} />
                </div>

                <div className="text-[10px] font-bold tracking-tight text-slate-100">
                  {badge.name}
                </div>
                <div className="text-[8.5px] text-slate-400 leading-tight mt-1 max-w-[95px] truncate" title={badge.desc}>
                  {unlocked ? badge.desc : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

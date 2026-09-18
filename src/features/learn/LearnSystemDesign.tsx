import React, { useState } from 'react';
import {
  COMPONENTS_DATA,
  ComponentInfo,
} from '../../content/componentsData';
import {
  Globe,
  Layers,
  Server,
  HardDrive,
  Database,
  MessageSquare,
  Shield,
  Smartphone,
  Cpu,
  Archive,
  Network,
  Radio,
  BookOpen,
  Boxes,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';

const ICON_MAP: Record<string, React.ElementType> = {
  Network,
  Globe,
  Layers,
  Shield,
  Server,
  HardDrive,
  Database,
  Cpu,
  MessageSquare,
  Archive,
  Radio,
  Smartphone,
};

export const LearnSystemDesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'catalog'>('concepts');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectedComponent, setInspectedComponent] = useState<ComponentInfo | null>(
    COMPONENTS_DATA[0] || null
  );

  const selectArchitecture = useArchStore((s) => s.selectArchitecture);

  const categories = [
    'All',
    'Network & Ingress',
    'Compute & Logic',
    'Storage & Caching',
    'Messaging & Reliability',
  ];

  const filteredComponents =
    selectedCategory === 'All'
      ? COMPONENTS_DATA
      : COMPONENTS_DATA.filter((c) => c.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col bg-[#131313] text-white overflow-y-auto select-none">
      {/* Sub-header Navigation */}
      <div className="border-b border-[#313131] bg-[#131313] sticky top-0 z-20 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold block">
              Architectural Pedagogy & Encyclopedia
            </span>
            <h1 className="text-2xl font-display font-black tracking-wider text-white mt-0.5">
              LEARN SYSTEM DESIGN
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[#181818] p-1 rounded-12px border border-[#313131]">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3.5 py-1.5 rounded-12px text-xs font-mono uppercase tracking-verge-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'concepts'
                  ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
                  : 'text-[#949494] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>What is System Design?</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-12px text-xs font-mono uppercase tracking-verge-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
                  : 'text-[#949494] hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Component Catalog ({COMPONENTS_DATA.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {/* ============================================================ */}
        {/* TAB 1: WHAT IS SYSTEM DESIGN? (BEGINNER VISUAL GUIDE)        */}
        {/* ============================================================ */}
        {activeTab === 'concepts' && (
          <div className="space-y-12">
            {/* Hero Introduction */}
            <div className="bg-[#181818] border border-[#313131] rounded-24px p-8 relative overflow-hidden">
              <div className="max-w-3xl">
                <span className="bg-[#131313] text-[#3cffd0] text-[10px] font-mono uppercase tracking-verge-nano font-bold px-2.5 py-1 rounded-12px border border-[#3cffd0]/30 inline-block mb-3">
                  Core Engineering Concept
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wider leading-tight">
                  SYSTEM DESIGN IS THE ART OF HANDLING MASSIVE CONCURRENCY.
                </h2>
                <p className="text-[#e9e9e9] text-sm leading-relaxed mt-4">
                  When you develop on localhost, 1 person is testing it. Everything is instantaneous. 
                  But what happens when <strong className="text-white">10 million concurrent users</strong> attempt to purchase 
                  train tickets at the exact same millisecond, or stream live cricket at the final over? 
                  A single node exhausts memory, enters queue starvation, and drops transactions.
                </p>
                <p className="text-[#949494] text-xs leading-relaxed mt-2">
                  System design is orchestrating <strong className="text-white">servers, caches, message queues, and partitioned databases</strong> so the distributed topology satisfies strict Service Level Objectives (p95 latency &lt; 300ms, error rate &lt; 1%).
                </p>
              </div>

              {/* Quick Action CTA */}
              <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-verge-mono">
                <button
                  onClick={() => selectArchitecture('simple-app')}
                  className="bg-[#3cffd0] hover:bg-white text-black font-bold px-5 py-2.5 rounded-24px transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Try Live Architecture Simulation
                </button>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-[#131313] hover:bg-[#202020] text-white border border-[#313131] font-semibold px-5 py-2.5 rounded-24px transition-all flex items-center gap-2"
                >
                  Explore Component Catalog
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* The 4 Core Pillars */}
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold block">
                  The Four Pillars
                </span>
                <h3 className="text-2xl font-display font-black text-white tracking-wider mt-0.5">
                  SYSTEM MEASUREMENT &amp; OBSERVABILITY
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pillar 1: Latency */}
                <div className="bg-[#181818] border border-[#313131] rounded-20px p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#3cffd0] mb-3">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">1. Latency (Speed)</h4>
                    <p className="text-xs text-[#949494] mt-2 leading-relaxed">
                      Elapsed time before receiving a response. Under 100ms feels instantaneous; over 1,000ms creates user abandonment.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313131] text-[11px] font-mono text-[#3cffd0]">
                    Goal: p95 &lt; 200ms
                  </div>
                </div>

                {/* Pillar 2: Throughput */}
                <div className="bg-[#181818] border border-[#313131] rounded-20px p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#5200ff] mb-3">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">2. Throughput (Volume)</h4>
                    <p className="text-xs text-[#949494] mt-2 leading-relaxed">
                      Request handling capacity per second (RPS). High-concurrency systems must sustain surges of 50,000+ RPS.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313131] text-[11px] font-mono text-[#3cffd0]">
                    Goal: High sustained RPS
                  </div>
                </div>

                {/* Pillar 3: Availability */}
                <div className="bg-[#181818] border border-[#313131] rounded-20px p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#3cffd0] mb-3">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">3. Availability (Uptime)</h4>
                    <p className="text-xs text-[#949494] mt-2 leading-relaxed">
                      Percentage of operational time. Four nines (99.99%) allows only 52 minutes of total downtime per year.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313131] text-[11px] font-mono text-[#3cffd0]">
                    Target: 99.99% uptime
                  </div>
                </div>

                {/* Pillar 4: Scalability */}
                <div className="bg-[#181818] border border-[#313131] rounded-20px p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#ffb703] mb-3">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">4. Scalability</h4>
                    <p className="text-xs text-[#949494] mt-2 leading-relaxed">
                      Linear capacity expansion via horizontal scaling (adding worker replicas) rather than vertical scaling (larger CPU).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313131] text-[11px] font-mono text-[#ffb703]">
                    Horizontal &gt; Vertical
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Step-by-Step Scaling Journey */}
            <div className="bg-[#181818] border border-[#313131] rounded-24px p-8">
              <div className="mb-6">
                <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold block">
                  The Evolutionary Path
                </span>
                <h3 className="text-2xl font-display font-black text-white tracking-wider mt-0.5">
                  SYSTEM EVOLUTION: 1 TO 100 MILLION USERS
                </h3>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-16px bg-[#131313] border border-[#313131]">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-8px bg-[#181818] border border-[#313131] text-[#3cffd0] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      01
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">Single Server Monolith (1 – 1,000 Users)</h4>
                      <p className="text-xs text-[#949494] mt-1">
                        Application compute and database run on a single host. Zero redundancy; susceptible to single points of failure.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectArchitecture('simple-app')}
                    className="text-xs text-[#3cffd0] hover:underline font-mono uppercase tracking-verge-mono shrink-0 flex items-center gap-1"
                  >
                    View Architecture &rarr;
                  </button>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-16px bg-[#131313] border border-[#313131]">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-8px bg-[#181818] border border-[#313131] text-[#3cffd0] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      02
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">Load Balancer + Cache (1,000 – 100,000 Users)</h4>
                      <p className="text-xs text-[#949494] mt-1">
                        Dedicated database tier. Reverse-proxy load balancing over stateless app servers with Redis cache absorbing 85% of read volume.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectArchitecture('scaled-app')}
                    className="text-xs text-[#3cffd0] hover:underline font-mono uppercase tracking-verge-mono shrink-0 flex items-center gap-1"
                  >
                    View Architecture &rarr;
                  </button>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-16px bg-[#131313] border border-[#313131]">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-8px bg-[#181818] border border-[#313131] text-[#3cffd0] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      03
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">Microservices &amp; Event Queues (Amazon Scale)</h4>
                      <p className="text-xs text-[#949494] mt-1">
                        Decoupled bounded contexts (Catalog, Cart, Orders). Kafka message streams buffer checkout spikes, while NoSQL powers partition tolerance.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectArchitecture('amazon')}
                    className="text-xs text-[#3cffd0] hover:underline font-mono uppercase tracking-verge-mono shrink-0 flex items-center gap-1"
                  >
                    View Architecture &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: COMPONENT VISUAL CATALOG                              */}
        {/* ============================================================ */}
        {activeTab === 'catalog' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Components Grid */}
            <div className="flex-1 space-y-6">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-12px text-xs font-mono uppercase tracking-verge-mono transition-all border ${
                      selectedCategory === cat
                        ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border-[#3cffd0]/40'
                        : 'bg-[#181818] text-[#949494] hover:text-white border-[#313131]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredComponents.map((component) => {
                  const Icon = ICON_MAP[component.iconName] || Server;
                  const isSelected = inspectedComponent?.id === component.id;

                  return (
                    <div
                      key={component.id}
                      onClick={() => setInspectedComponent(component)}
                      className={`p-5 rounded-20px border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#3cffd0] bg-[#181818]'
                          : 'border-[#313131] bg-[#181818] hover:border-[#3cffd0]/40 hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <div>
                        {/* Header: Icon & Category */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#3cffd0]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#949494] bg-[#131313] px-2 py-0.5 rounded-12px border border-[#313131]">
                            {component.category}
                          </span>
                        </div>

                        {/* Name & One-Liner */}
                        <h4 className="font-bold text-white text-base tracking-tight mb-1 font-mono uppercase tracking-verge-mono">
                          {component.name}
                        </h4>
                        <p className="text-xs text-[#949494] leading-relaxed line-clamp-2">
                          {component.oneLiner}
                        </p>
                      </div>

                      {/* Footer: Click to explore */}
                      <div className="mt-4 pt-3 border-t border-[#313131]/60 flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono">
                        <span className="text-[#3cffd0] flex items-center gap-1 font-bold">
                          Inspect &rarr;
                        </span>
                        <span className="text-[10px] text-[#777777]">
                          {component.realWorldExample.company.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Component Detail Inspector Drawer */}
            {inspectedComponent && (
              <div className="w-full lg:w-[480px] bg-[#181818] border border-[#313131] rounded-24px p-6 sticky top-24 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[#313131] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-14px bg-[#131313] border border-[#3cffd0]/40 flex items-center justify-center text-[#3cffd0]">
                      {React.createElement(ICON_MAP[inspectedComponent.iconName] || Server, {
                        className: 'w-6 h-6',
                      })}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold">
                        {inspectedComponent.category}
                      </span>
                      <h3 className="text-lg font-display font-black text-white tracking-wider">
                        {inspectedComponent.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Plain English Definition */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-verge-mono text-[#3cffd0] font-bold mb-1.5">
                    What is it in Plain English?
                  </h4>
                  <p className="text-xs text-[#e9e9e9] leading-relaxed bg-[#131313] p-3 rounded-12px border border-[#313131]">
                    {inspectedComponent.simpleExplanation}
                  </p>
                </div>

                {/* Visual Architecture Diagram Representation */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-verge-mono text-[#3cffd0] font-bold mb-1.5">
                    Visual Data Flow &amp; Symbol
                  </h4>
                  <pre className="text-[11px] font-mono text-[#3cffd0] bg-[#131313] p-3 rounded-12px border border-[#313131] overflow-x-auto leading-relaxed">
                    {inspectedComponent.symbolDiagramText}
                  </pre>
                </div>

                {/* How It Works (Step by Step) */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-verge-mono text-[#3cffd0] font-bold mb-2">
                    How it Works Step-by-Step
                  </h4>
                  <ol className="space-y-2">
                    {inspectedComponent.howItWorksSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#949494]">
                        <span className="w-4 h-4 rounded-4px bg-[#131313] text-[#3cffd0] font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-[#313131]">
                          {idx + 1}
                        </span>
                        <span className="text-[#e9e9e9]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Real-World Spotlight */}
                <div className="bg-[#131313] border border-[#313131] rounded-16px p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1 font-mono uppercase tracking-verge-mono">
                    <ExternalLink className="w-3.5 h-3.5 text-[#3cffd0]" />
                    Spotlight: {inspectedComponent.realWorldExample.company}
                  </div>
                  <div className="text-[11px] font-mono text-[#3cffd0] mb-1">
                    {inspectedComponent.realWorldExample.architectureTitle}
                  </div>
                  <p className="text-xs text-[#949494] leading-relaxed">
                    {inspectedComponent.realWorldExample.description}
                  </p>
                </div>

                {/* When to Use vs Not to Use */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#131313] border border-[#313131] rounded-12px p-3">
                    <div className="font-bold text-[#3cffd0] mb-1 flex items-center gap-1 uppercase tracking-verge-nano text-[10px]">
                      <CheckCircle className="w-3.5 h-3.5" /> When to Use
                    </div>
                    <ul className="text-[11px] text-[#cccccc] space-y-1">
                      {inspectedComponent.whenToUse.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#131313] border border-[#313131] rounded-12px p-3">
                    <div className="font-bold text-[#ff3366] mb-1 flex items-center gap-1 uppercase tracking-verge-nano text-[10px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> When NOT to Use
                    </div>
                    <ul className="text-[11px] text-[#cccccc] space-y-1">
                      {inspectedComponent.whenNotToUse.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

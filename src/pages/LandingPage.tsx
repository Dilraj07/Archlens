import React from 'react';
import { VergeBadge, VergeButton } from '../components/ui/VergePrimitives';
import {
  ArrowRight,
  Layers,
  BookOpen,
  Palette,
  Target,
} from 'lucide-react';
import { useArchStore } from '../store/useArchStore';
import { PredictBreakLoopSection } from '../features/landing/PredictBreakLoopSection';
import { CompanyLogo } from '../components/ui/CompanyLogo';

export const LandingPage: React.FC = () => {
  const selectArchitecture = useArchStore((s) => s.selectArchitecture);
  const setView = useArchStore((s) => s.setView);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 space-y-16 select-none">
      {/* HERO SECTION */}
      <div className="space-y-6 text-left">
        <div className="flex items-center gap-3">
          <VergeBadge variant="mint">CODE MY FYP 2026</VergeBadge>
          <span className="text-xs font-mono text-[#949494] uppercase tracking-verge-nano">
            CHALLENGE 01: AI FOR LEARNING
          </span>
        </div>

        {/* Spacious, clean, non-sticky headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-wider leading-[1.1]">
          EVERY TOOL LETS YOU BREAK A SYSTEM.
          <br />
          ARCHLENS TEACHES YOU TO <span className="text-[#3cffd0]">DEBUG ONE</span>.
        </h1>

        <p className="text-base sm:text-lg text-[#d1d1d1] max-w-2xl leading-relaxed font-sans font-light">
          An intuitive visual platform to understand system architecture. Simulate real-world traffic surges from Amazon to IRCTC, predict bottlenecks, and design custom systems with interactive drag-and-drop components.
        </p>

        {/* 3 Clean, Clear, Intuitive Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <VergeButton
            variant="primary"
            size="lg"
            onClick={() => selectArchitecture('amazon')}
          >
            <Layers className="w-4 h-4 mr-2" />
            Simulate Architectures
          </VergeButton>

          <VergeButton
            variant="secondary"
            size="lg"
            onClick={() => setView('studio')}
          >
            <Palette className="w-4 h-4 mr-2 text-[#3cffd0]" />
            Design Studio Sandbox
          </VergeButton>

          <VergeButton
            variant="secondary"
            size="lg"
            onClick={() => setView('learn')}
          >
            <BookOpen className="w-4 h-4 mr-2 text-[#3cffd0]" />
            Learn System Design
          </VergeButton>
        </div>
      </div>

      {/* SECTION 1: POPULAR SYSTEM ARCHITECTURES */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold">
            Popular Real-World Architectures
          </span>
          <span className="text-xs font-mono text-[#949494]">
            Click to launch live simulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Tatkal Rush (Jelly Mint) */}
          <div
            onClick={() => selectArchitecture('tatkal')}
            className="bg-[#3cffd0] text-black rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-verge-mono uppercase mb-3">
                <span>CONCURRENCY</span>
                <CompanyLogo name="irctc" size="md" />
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2 tracking-wide">
                IRCTC TATKAL AT 10:00 AM
              </h3>
              <p className="text-xs font-medium leading-relaxed text-black/80">
                Millions of users search and book simultaneously. See what happens when database row contention spikes and queues fill up.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/20 flex items-center justify-between text-xs font-mono font-bold">
              <span>SIMULATE ARCHITECTURE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tile 2: Amazon E-Commerce (Ultraviolet) */}
          <div
            onClick={() => selectArchitecture('amazon')}
            className="bg-[#5200ff]/90 text-white rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all border border-[#5200ff] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono tracking-verge-mono uppercase mb-3">
                <span>MICROSERVICES</span>
                <CompanyLogo name="amazon" size="md" />
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2 tracking-wide">
                AMAZON E-COMMERCE
              </h3>
              <p className="text-xs text-[#e9e9e9] leading-relaxed">
                Distributed order processing with CloudFront CDN, DynamoDB product catalog, Redis cart caching, and Kafka streaming.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-mono">
              <span>SIMULATE ARCHITECTURE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tile 3: Netflix Video Streaming (Dark Slate with Mint Border) */}
          <div
            onClick={() => selectArchitecture('netflix')}
            className="bg-[#181818] text-white rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all border border-[#313131] hover:border-[#3cffd0] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#3cffd0] tracking-verge-mono uppercase mb-3 font-bold">
                <span>HIGH THROUGHPUT</span>
                <CompanyLogo name="netflix" size="md" />
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2 tracking-wide group-hover:text-[#3cffd0] transition-colors">
                NETFLIX VIDEO STREAMING
              </h3>
              <p className="text-xs text-[#949494] leading-relaxed">
                Open Connect CDN appliances delivering video chunks to millions of concurrent viewers, backed by Cassandra NoSQL.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-[#3cffd0] font-bold">
              <span>SIMULATE ARCHITECTURE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 3 CORE LEARNING & DESIGN TOOLS */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold">
            Interactive Learning Tools
          </span>
          <span className="text-xs font-mono text-[#949494]">
            Easy-to-use visual interfaces
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Learn Guide */}
          <div
            onClick={() => setView('learn')}
            className="bg-[#181818] border border-[#313131] hover:border-[#3cffd0] rounded-24px p-6 cursor-pointer hover:bg-[#1f1f1f] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold mb-3">
                <span>01 · GUIDE</span>
                <BookOpen className="w-4 h-4 text-[#3cffd0]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#3cffd0] transition-colors tracking-wide">
                COMPONENT ENCYCLOPEDIA
              </h3>
              <p className="text-xs text-[#949494] leading-relaxed">
                Step-by-step scaling guide from 1 to 100M users. Browse 12 system components (DNS, CDN, Redis, Kafka, Load Balancers) with plain-English definitions and company case studies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-[#3cffd0] font-bold">
              <span>EXPLORE GUIDE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Design Studio Sandbox */}
          <div
            onClick={() => setView('studio')}
            className="bg-[#181818] border border-[#313131] hover:border-[#3cffd0] rounded-24px p-6 cursor-pointer hover:bg-[#1f1f1f] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold mb-3">
                <span>02 · BUILDER</span>
                <Palette className="w-4 h-4 text-[#3cffd0]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#3cffd0] transition-colors tracking-wide">
                DESIGN STUDIO BUILDER
              </h3>
              <p className="text-xs text-[#949494] leading-relaxed">
                Drag-and-drop sandbox. Add Load Balancers, Servers, Redis caches, and SQL databases. Wire them together and simulate traffic loads live.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-[#3cffd0] font-bold">
              <span>LAUNCH BUILDER</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Hands-On Challenges */}
          <div
            onClick={() => setView('challenges')}
            className="bg-[#181818] border border-[#313131] hover:border-[#3cffd0] rounded-24px p-6 cursor-pointer hover:bg-[#1f1f1f] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold mb-3">
                <span>03 · TASKS</span>
                <Target className="w-4 h-4 text-[#3cffd0]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#3cffd0] transition-colors tracking-wide">
                PREDICT &amp; FIX CHALLENGES
              </h3>
              <p className="text-xs text-[#949494] leading-relaxed">
                Predict where the system breaks before running the simulation. Learn distributed systems by seeing exactly where bottlenecks form and applying real fixes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-[#3cffd0] font-bold">
              <span>START A CHALLENGE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THE 6-STEP LEARNING LOOP */}
      <PredictBreakLoopSection />

      {/* FOOTER CITATIONS & INFO */}
      <div className="pt-8 border-t border-[#313131] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#949494]">
        <div>
          <span>ArchLens · Built for CodeMyFYP Hackathon 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('learn')} className="hover:text-white transition-colors">
            Component Guide
          </button>
          <button onClick={() => selectArchitecture('amazon')} className="hover:text-white transition-colors">
            Amazon Architecture
          </button>
          <button onClick={() => setView('studio')} className="hover:text-white transition-colors">
            Design Studio
          </button>
          <button onClick={() => setView('challenges')} className="hover:text-[#3cffd0] transition-colors">
            Challenges
          </button>
        </div>
      </div>
    </div>
  );
};

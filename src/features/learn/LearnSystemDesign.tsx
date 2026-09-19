import React, { useState, useRef } from 'react';
import {
  COMPONENTS_DATA,
  ComponentInfo,
  ArchNode,
  ArchEdge,
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
  Link2,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';

// Icon map kept for future use
const _ICON_MAP: Record<string, React.ElementType> = {
  Network, Globe, Layers, Shield, Server, HardDrive,
  Database, Cpu, MessageSquare, Archive, Radio, Smartphone,
};
void _ICON_MAP;

// ─── Per-Component SVG Illustrations ─────────────────────────────────────────

const ILLUSTRATIONS: Record<string, React.FC> = {
  dns: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="dns-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3cffd0" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#131313" stopOpacity="0" />
        </radialGradient>
        <filter id="dns-blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="400" height="200" fill="#0e0e0e" />
      <circle cx="200" cy="100" r="65" fill="url(#dns-glow)" />
      {/* Globe outline */}
      <circle cx="200" cy="100" r="55" fill="none" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.5" />
      <ellipse cx="200" cy="100" rx="30" ry="55" fill="none" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="145" y1="100" x2="255" y2="100" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="200" y1="45" x2="200" y2="155" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.3" />
      {/* Glowing center dot */}
      <circle cx="200" cy="100" r="4" fill="#3cffd0" filter="url(#dns-blur)" />
      <circle cx="200" cy="100" r="2.5" fill="#3cffd0" />
      {/* Server nodes */}
      {[{x:60,y:55},{x:340,y:55},{x:60,y:150},{x:340,y:150}].map((n,i)=>(
        <g key={i}>
          <line x1={n.x} y1={n.y} x2="200" y2="100" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 3" />
          <rect x={n.x-14} y={n.y-8} width="28" height="16" rx="4" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.7" />
          <rect x={n.x-10} y={n.y-4} width="6" height="8" rx="1" fill="#3cffd0" fillOpacity="0.5" />
          <rect x={n.x-2} y={n.y-4} width="6" height="3" rx="1" fill="#3cffd0" fillOpacity="0.3" />
          <circle cx={n.x+8} cy={n.y} r="2.5" fill="#3cffd0" fillOpacity="0.8" />
        </g>
      ))}
      {/* Label */}
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.6" letterSpacing="3">DNS RESOLVER</text>
    </svg>
  ),

  cdn: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="cdn-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5200ff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#131313" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="200" fill="#0e0e0e" />
      <ellipse cx="200" cy="100" rx="80" ry="80" fill="url(#cdn-glow)" />
      {/* Globe */}
      <circle cx="200" cy="100" r="60" fill="none" stroke="#5200ff" strokeWidth="1" strokeOpacity="0.4" />
      <ellipse cx="200" cy="100" rx="35" ry="60" fill="none" stroke="#5200ff" strokeWidth="0.7" strokeOpacity="0.25" />
      {/* Edge PoPs */}
      {[
        {x:90,y:50,color:'#3cffd0'},{x:310,y:50,color:'#3cffd0'},
        {x:75,y:145,color:'#ffb703'},{x:325,y:145,color:'#ffb703'},
        {x:200,y:30,color:'#3cffd0'},{x:200,y:175,color:'#3cffd0'},
      ].map((p,i)=>(
        <g key={i}>
          <line x1={p.x} y1={p.y} x2="200" y2="100" stroke={p.color} strokeWidth="0.8" strokeOpacity="0.35" />
          <circle cx={p.x} cy={p.y} r="7" fill="#131313" stroke={p.color} strokeWidth="1.2" strokeOpacity="0.9" />
          <circle cx={p.x} cy={p.y} r="3" fill={p.color} fillOpacity="0.8" />
          <circle cx={p.x} cy={p.y} r="10" fill="none" stroke={p.color} strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
      ))}
      {/* Origin */}
      <circle cx="200" cy="100" r="12" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      <circle cx="200" cy="100" r="5" fill="#3cffd0" />
      <text x="200" y="185" textAnchor="middle" fill="#5200ff" fontSize="9" fontFamily="monospace" opacity="0.6" letterSpacing="3">CDN EDGE NETWORK</text>
    </svg>
  ),

  load_balancer: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Traffic stream on left */}
      {[0,1,2].map(i=>(
        <g key={i}>
          <rect x={20 + i*14} y="88" width="10" height="24" rx="2" fill="#3cffd0" fillOpacity={0.15 + i*0.15} />
        </g>
      ))}
      <text x="44" y="130" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" opacity="0.5">TRAFFIC</text>
      {/* Center LB node */}
      <rect x="140" y="70" width="120" height="60" rx="10" fill="#161616" stroke="#3cffd0" strokeWidth="1.5" />
      <text x="200" y="96" textAnchor="middle" fill="#3cffd0" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">LOAD</text>
      <text x="200" y="110" textAnchor="middle" fill="#3cffd0" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">BALANCER</text>
      {/* Glow */}
      <rect x="140" y="70" width="120" height="60" rx="10" fill="none" stroke="#3cffd0" strokeWidth="6" strokeOpacity="0.05" />
      {/* Flow lines left */}
      <line x1="73" y1="100" x2="140" y2="100" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.6" markerEnd="url(#arr)" />
      {/* Flow lines right to 3 servers */}
      {[50, 100, 155].map((y,i)=>(
        <g key={i}>
          <line x1="260" y1="100" x2="310" y2={y} stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="5 3" />
          <rect x="310" y={y-15} width="60" height="30" rx="6" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.6" />
          <text x="340" y={y+4} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace">SERVER {i+1}</text>
        </g>
      ))}
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">L7 DISTRIBUTION</text>
    </svg>
  ),

  api_gateway: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Clients */}
      {[{y:55,label:'iOS'},{y:100,label:'WEB'},{y:148,label:'API'}].map((c,i)=>(
        <g key={i}>
          <rect x="20" y={c.y-14} width="44" height="28" rx="5" fill="#181818" stroke="#5200ff" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="42" y={c.y+4} textAnchor="middle" fill="#5200ff" fontSize="7" fontFamily="monospace">{c.label}</text>
          <line x1="64" y1={c.y} x2="130" y2="100" stroke="#5200ff" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3" />
        </g>
      ))}
      {/* Hexagon shield */}
      <polygon points="200,62 228,78 228,110 200,126 172,110 172,78" fill="#161616" stroke="#3cffd0" strokeWidth="1.5" />
      <polygon points="200,62 228,78 228,110 200,126 172,110 172,78" fill="#3cffd0" fillOpacity="0.04" />
      <text x="200" y="92" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" fontWeight="bold">API</text>
      <text x="200" y="103" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" fontWeight="bold">GATEWAY</text>
      {/* Services */}
      {[{y:55,label:'ORDERS'},{y:100,label:'USERS'},{y:148,label:'SEARCH'}].map((s,i)=>(
        <g key={i}>
          <line x1="228" y1="94" x2="310" y2={s.y} stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.6" />
          <rect x="310" y={s.y-12} width="68" height="24" rx="4" fill="#181818" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="344" y={s.y+4} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace">{s.label}</text>
        </g>
      ))}
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">CENTRALIZED INGRESS</text>
    </svg>
  ),

  app_server: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="srv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3cffd0" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0e0e0e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Three server racks */}
      {[110,200,290].map((x,i)=>(
        <g key={i}>
          <rect x={x-30} y="40" width="60" height="120" rx="6" fill="#141414" stroke="#3cffd0" strokeWidth={i===1?1.8:0.8} strokeOpacity={i===1?0.9:0.4} />
          {/* Rack units */}
          {[0,1,2,3,4].map(u=>(
            <g key={u}>
              <rect x={x-24} y={55+u*20} width="48" height="12" rx="2" fill="#1e1e1e" stroke="#3cffd0" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx={x+18} cy={55+u*20+6} r="2.5" fill="#3cffd0" fillOpacity={0.4 + u*0.1} />
              <rect x={x-22} y={57+u*20} width="24" height="4" rx="1" fill="#3cffd0" fillOpacity="0.2" />
            </g>
          ))}
          {/* Status LED */}
          <circle cx={x+18} cy="47" r="3" fill={i===1?"#3cffd0":"#3cffd0"} fillOpacity={i===1?1:0.4} />
        </g>
      ))}
      {/* Circuit traces under middle server */}
      <ellipse cx="200" cy="170" rx="80" ry="8" fill="url(#srv-glow)" />
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">STATELESS REPLICAS</text>
    </svg>
  ),

  cache: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* RAM chip outline */}
      <rect x="110" y="45" width="180" height="110" rx="8" fill="#141414" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* Chip label */}
      <text x="200" y="75" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2">REDIS</text>
      <text x="200" y="88" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" opacity="0.5">IN-MEMORY</text>
      {/* Memory cell grid */}
      {[0,1,2,3].map(row=>(
        [0,1,2,3,4].map(col=>(
          <rect key={`${row}-${col}`}
            x={125 + col*28} y={98 + row*13}
            width="22" height="9" rx="2"
            fill="#3cffd0" fillOpacity={Math.random()*0.3 + 0.1}
            stroke="#3cffd0" strokeWidth="0.5" strokeOpacity="0.4"
          />
        ))
      ))}
      {/* Pin connections */}
      {[0,1,2,3,4,5,6,7].map(i=>(
        <g key={i}>
          <line x1={125+i*22} y1="45" x2={125+i*22} y2="35" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.4" />
          <line x1={125+i*22} y1="155" x2={125+i*22} y2="165" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.4" />
        </g>
      ))}
      {/* Speed bolt */}
      <text x="87" y="108" textAnchor="middle" fill="#ffb703" fontSize="22" opacity="0.8">⚡</text>
      <text x="313" y="108" textAnchor="middle" fill="#ffb703" fontSize="22" opacity="0.8">⚡</text>
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">{"< 1ms LATENCY"}</text>
    </svg>
  ),

  sql_db: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Primary cylinder */}
      <ellipse cx="160" cy="65" rx="55" ry="15" fill="#161616" stroke="#3cffd0" strokeWidth="1.3" strokeOpacity="0.9" />
      <rect x="105" y="65" width="110" height="75" fill="#141414" stroke="#3cffd0" strokeWidth="1.3" strokeOpacity="0.7" />
      <ellipse cx="160" cy="140" rx="55" ry="15" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="1.3" strokeOpacity="0.9" />
      {/* Table rows inside */}
      {[0,1,2].map(i=>(
        <g key={i}>
          <line x1="115" y1={85+i*18} x2="205" y2={85+i*18} stroke="#3cffd0" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="117" y={88+i*18} width="30" height="7" rx="1" fill="#3cffd0" fillOpacity="0.15" />
          <rect x="152" y={88+i*18} width="20" height="7" rx="1" fill="#3cffd0" fillOpacity="0.1" />
        </g>
      ))}
      <text x="160" y="108" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" opacity="0.6">PRIMARY</text>
      {/* Replica cylinders */}
      {[{cx:310, label:'REPLICA 1'},{cx:310, label:'REPLICA 2'}].map((r,i)=>(
        <g key={i}>
          <ellipse cx={r.cx} cy={55+i*80} rx="38" ry="10" fill="#181818" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.6" />
          <rect x={r.cx-38} y={55+i*80} width="76" height="50" fill="#181818" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.5" />
          <ellipse cx={r.cx} cy={105+i*80} rx="38" ry="10" fill="#181818" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.6" />
          <text x={r.cx} y={82+i*80} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" opacity="0.6">{r.label}</text>
          <line x1="215" y1={100+i*40} x2={r.cx-38} y2={82+i*60} stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="5 3" />
        </g>
      ))}
      <text x="200" y="188" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">ACID TRANSACTIONS</text>
    </svg>
  ),

  nosql_db: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Ring of nodes */}
      {[0,1,2,3,4,5].map(i=>{
        const angle = (i/6)*Math.PI*2 - Math.PI/2;
        const r = 68;
        const cx = 200 + Math.cos(angle)*r;
        const cy = 100 + Math.sin(angle)*r;
        return (
          <g key={i}>
            <line x1="200" y1="100" x2={cx} y2={cy} stroke="#5200ff" strokeWidth="0.8" strokeOpacity="0.3" />
            {/* inter-ring connections */}
            {i < 5 && (() => {
              const a2 = ((i+1)/6)*Math.PI*2 - Math.PI/2;
              const cx2 = 200 + Math.cos(a2)*r;
              const cy2 = 100 + Math.sin(a2)*r;
              return <line x1={cx} y1={cy} x2={cx2} y2={cy2} stroke="#3cffd0" strokeWidth="0.6" strokeOpacity="0.3" />;
            })()}
            <polygon
              points={`${cx},${cy-12} ${cx+10},${cy-6} ${cx+10},${cy+6} ${cx},${cy+12} ${cx-10},${cy+6} ${cx-10},${cy-6}`}
              fill="#181818" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.8"
            />
            <text x={cx} y={cy+3} textAnchor="middle" fill="#3cffd0" fontSize="6" fontFamily="monospace">NODE</text>
          </g>
        );
      })}
      {/* Center */}
      <circle cx="200" cy="100" r="22" fill="#141414" stroke="#5200ff" strokeWidth="1.2" strokeOpacity="0.7" />
      <text x="200" y="96" textAnchor="middle" fill="#5200ff" fontSize="7" fontFamily="monospace">HASH</text>
      <text x="200" y="107" textAnchor="middle" fill="#5200ff" fontSize="7" fontFamily="monospace">RING</text>
      <text x="200" y="185" textAnchor="middle" fill="#5200ff" fontSize="9" fontFamily="monospace" opacity="0.6" letterSpacing="3">DISTRIBUTED CLUSTER</text>
    </svg>
  ),

  message_queue: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Producer */}
      <rect x="15" y="75" width="60" height="50" rx="6" fill="#181818" stroke="#ffb703" strokeWidth="1" strokeOpacity="0.7" />
      <text x="45" y="97" textAnchor="middle" fill="#ffb703" fontSize="7" fontFamily="monospace">PRODUCER</text>
      <text x="45" y="110" textAnchor="middle" fill="#ffb703" fontSize="6" fontFamily="monospace">APP SERVER</text>
      {/* Queue pipe */}
      <rect x="90" y="75" width="185" height="50" rx="6" fill="#141414" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      <text x="182" y="93" textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" fontWeight="bold">KAFKA / QUEUE</text>
      {/* Messages in pipe */}
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x={100+i*32} y="100" width="26" height="14" rx="3"
          fill="#3cffd0" fillOpacity={0.08 + i*0.04}
          stroke="#3cffd0" strokeWidth="0.8" strokeOpacity={0.4+i*0.1}
        />
      ))}
      {/* Consumers */}
      {[{y:58,label:'WORKER 1'},{y:110,label:'WORKER 2'}].map((w,i)=>(
        <g key={i}>
          <line x1="275" y1="100" x2="310" y2={w.y+12} stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="4 3" />
          <rect x="310" y={w.y} width="72" height="28" rx="5" fill="#181818" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="346" y={w.y+14} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace">{w.label}</text>
        </g>
      ))}
      {/* Arrow from producer */}
      <line x1="75" y1="100" x2="90" y2="100" stroke="#ffb703" strokeWidth="1.5" strokeOpacity="0.7" />
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">ASYNC DECOUPLING</text>
    </svg>
  ),

  object_storage: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Bucket outline */}
      <path d="M130,50 L270,50 L255,155 L145,155 Z" fill="#141414" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.8" />
      <ellipse cx="200" cy="50" rx="70" ry="14" fill="#181818" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* Object tiles inside bucket */}
      {[
        {x:155,y:75,w:35,h:22,icon:'🖼',label:'IMG'},
        {x:200,y:75,w:35,h:22,icon:'🎥',label:'VID'},
        {x:157,y:105,w:32,h:22,icon:'📄',label:'PDF'},
        {x:196,y:105,w:40,h:22,icon:'💾',label:'BAK'},
      ].map((o,i)=>(
        <g key={i}>
          <rect x={o.x} y={o.y} width={o.w} height={o.h} rx="3" fill="#1e1e1e" stroke="#3cffd0" strokeWidth="0.6" strokeOpacity="0.5" />
          <text x={o.x+o.w/2} y={o.y+14} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace" opacity="0.7">{o.label}</text>
        </g>
      ))}
      {/* Eleven 9s label */}
      <text x="200" y="175" textAnchor="middle" fill="#3cffd0" fontSize="8" fontFamily="monospace" opacity="0.6">99.999999999%</text>
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">OBJECT STORAGE</text>
    </svg>
  ),

  worker: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Queue on left */}
      <rect x="18" y="70" width="70" height="60" rx="5" fill="#181818" stroke="#5200ff" strokeWidth="1" strokeOpacity="0.7" />
      {[0,1,2].map(i=>(
        <rect key={i} x="26" y={80+i*15} width="52" height="10" rx="2" fill="#5200ff" fillOpacity={0.1+i*0.08} stroke="#5200ff" strokeWidth="0.5" strokeOpacity="0.5" />
      ))}
      <text x="53" y="143" textAnchor="middle" fill="#5200ff" fontSize="7" fontFamily="monospace">QUEUE</text>
      {/* Gear / worker */}
      {[0,1,2,3,4,5,6,7].map(i=>{
        const a = (i/8)*Math.PI*2;
        const r1=35, r2=42;
        const x1=200+Math.cos(a)*r1, y1=100+Math.sin(a)*r1;
        const x2=200+Math.cos(a)*r2, y2=100+Math.sin(a)*r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3cffd0" strokeWidth="5" strokeOpacity="0.8" strokeLinecap="round" />;
      })}
      <circle cx="200" cy="100" r="33" fill="#141414" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      <circle cx="200" cy="100" r="14" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="1" strokeOpacity="0.6" />
      <text x="200" y="104" textAnchor="middle" fill="#3cffd0" fontSize="8" fontFamily="monospace" fontWeight="bold">WORK</text>
      {/* Outputs */}
      {[{y:65,label:'S3 FILE'},{y:108,label:'DB ROW'},{y:148,label:'EMAIL'}].map((o,i)=>(
        <g key={i}>
          <line x1="237" y1="100" x2="295" y2={o.y} stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3" />
          <rect x="295" y={o.y-10} width="72" height="22" rx="4" fill="#181818" stroke="#3cffd0" strokeWidth="0.7" strokeOpacity="0.6" />
          <text x="331" y={o.y+4} textAnchor="middle" fill="#3cffd0" fontSize="7" fontFamily="monospace">{o.label}</text>
        </g>
      ))}
      <line x1="88" y1="100" x2="163" y2="100" stroke="#5200ff" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="4 3" />
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">ASYNC WORKER POOL</text>
    </svg>
  ),

  rate_limiter: () => (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="200" fill="#0e0e0e" />
      {/* Blocked requests on left */}
      {[0,1,2].map(i=>(
        <g key={i}>
          <rect x="18" y={58+i*35} width="55" height="22" rx="4" fill="#ff3366" fillOpacity="0.08" stroke="#ff3366" strokeWidth="0.8" strokeOpacity="0.6" />
          <text x="45" y={73+i*35} textAnchor="middle" fill="#ff3366" fontSize="6" fontFamily="monospace">REQUEST</text>
          <line x1="73" y1={69+i*35} x2="115" y2={100} stroke="#ff3366" strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="3 2" />
        </g>
      ))}
      {/* Shield */}
      <path d="M200,45 L240,65 L240,120 L200,145 L160,120 L160,65 Z" fill="#141414" stroke="#3cffd0" strokeWidth="1.5" strokeOpacity="0.9" />
      <path d="M200,45 L240,65 L240,120 L200,145 L160,120 L160,65 Z" fill="#3cffd0" fillOpacity="0.03" />
      {/* Token bucket inside */}
      <rect x="175" y="78" width="50" height="40" rx="4" fill="#1a1a1a" stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.5" />
      {[0,1,2].map(i=>(
        <rect key={i} x="180" y={84+i*11} width="40" height="7" rx="2" fill="#3cffd0" fillOpacity={0.5-i*0.1} />
      ))}
      <text x="200" y="130" textAnchor="middle" fill="#3cffd0" fontSize="6" fontFamily="monospace">TOKEN BUCKET</text>
      {/* Allowed on right */}
      {[{y:75,color:'#3cffd0',label:'ALLOW'},{y:130,color:'#ff3366',label:'BLOCK'}].map((r,i)=>(
        <g key={i}>
          <line x1="240" y1="95" x2="295" y2={r.y} stroke={r.color} strokeWidth="1" strokeOpacity="0.7" />
          <rect x="295" y={r.y-12} width="72" height="24" rx="4" fill="#181818" stroke={r.color} strokeWidth="0.8" strokeOpacity="0.8" />
          <text x="331" y={r.y+4} textAnchor="middle" fill={r.color} fontSize="7" fontFamily="monospace">{r.label}</text>
        </g>
      ))}
      <text x="200" y="185" textAnchor="middle" fill="#3cffd0" fontSize="9" fontFamily="monospace" opacity="0.5" letterSpacing="3">RATE LIMITING</text>
    </svg>
  ),
};

// ─── Architecture Diagram (Canvas-style SVG renderer) ─────────────────────────

interface ArchDiagramProps {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

const NODE_W = 96;
const NODE_H = 38;

function getCenterX(n: ArchNode) { return n.x + NODE_W / 2; }
function getCenterY(n: ArchNode) { return n.y + NODE_H / 2; }

const ArchDiagram: React.FC<ArchDiagramProps> = ({ nodes, edges }) => {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Compute viewBox to fit all nodes
  const padX = 20, padY = 24;
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - padX;
  const minY = Math.min(...ys) - padY;
  const maxX = Math.max(...xs) + NODE_W + padX;
  const maxY = Math.max(...ys) + NODE_H + padY;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      className="w-full rounded-12px"
      style={{ background: '#0d0d0d', minHeight: '180px', maxHeight: '260px' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id="arr-g" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 Z" fill="#3cffd0" fillOpacity="0.8" />
        </marker>
        <marker id="arr-d" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 Z" fill="#3cffd0" fillOpacity="0.45" />
        </marker>
        <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => {
        const from = nodeMap[e.from];
        const to = nodeMap[e.to];
        if (!from || !to) return null;
        const x1 = getCenterX(from), y1 = getCenterY(from);
        const x2 = getCenterX(to), y2 = getCenterY(to);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        // Slight curve
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);
        const curvature = Math.min(len * 0.2, 28);
        const cx = midX - dy / len * curvature;
        const cy = midY + dx / len * curvature;

        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke="#3cffd0"
              strokeWidth={e.dashed ? 0.8 : 1.2}
              strokeOpacity={e.dashed ? 0.35 : 0.65}
              strokeDasharray={e.dashed ? '5 4' : undefined}
              markerEnd={e.dashed ? 'url(#arr-d)' : 'url(#arr-g)'}
            />
            {e.label && (
              <text
                x={cx}
                y={cy - 5}
                textAnchor="middle"
                fill="#3cffd0"
                fontSize="7"
                fontFamily="monospace"
                opacity="0.55"
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const iconColor = n.highlight ? '#3cffd0' : '#6b6b6b';
        const ICON_PATHS: Record<string, string> = {
          monitor:   'M2 3h20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm11 15v2m-4 1h8',
          user:      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
          smartphone:'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01',
          globe:     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0c-2.76 3.33-4 6.9-4 10s1.24 6.67 4 10m0-20c2.76 3.33 4 6.9 4 10s-1.24 6.67-4 10M2 12h20',
          zap:       'M13 2L4.09 12.96A1 1 0 0 0 5 14.5h6V22l8.91-10.96A1 1 0 0 0 19 9.5h-6V2z',
          scale:     'M12 3v18M3 6l9-3 9 3M3 18l9-3 9 3',
          database:  'M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 0c5.52 0 10 1.79 10 4M2 10c0 2.21 4.48 4 10 4s10-1.79 10-4M2 14c0 2.21 4.48 4 10 4s10-1.79 10-4',
          hardDrive: 'M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 17.76 4H6.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01',
          shield:    'M12 2 3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z',
          mail:      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
          clipboard: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 4 0h-4z',
          cpu:       'M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 9h6v6H9z',
          shuffle:   'M16 3h5v5M4 20 21 3m0 13v5h-5M15 15l6 6M4 4l5 5',
          package:   'M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
          ban:       'M18.36 6.64A9 9 0 0 1 5.64 19.36M12 3a9 9 0 1 1 0 18A9 9 0 0 1 12 3zM5.64 5.64l12.72 12.72',
          settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.93-1H21m-18 0h2.07M12 3v2.07M12 21v-2.07M18.36 5.64l-1.46 1.46M7.1 16.9 5.64 18.36M18.36 18.36l-1.46-1.46M7.1 7.1 5.64 5.64',
        };
        const iconKey = n.icon as string | undefined;
        const pathD = iconKey ? ICON_PATHS[iconKey] : undefined;
        const ICON_SIZE = 10;
        const ix = n.x + 11;
        const iy = n.y + NODE_H / 2 - ICON_SIZE / 2;
        return (
          <g key={n.id}>
            {n.highlight && (
              <rect
                x={n.x - 3} y={n.y - 3}
                width={NODE_W + 6} height={NODE_H + 6}
                rx="12"
                fill="#3cffd0" fillOpacity="0.06"
                stroke="#3cffd0" strokeWidth="0.8" strokeOpacity="0.3"
              />
            )}
            <rect
              x={n.x} y={n.y}
              width={NODE_W} height={NODE_H}
              rx="9"
              fill={n.highlight ? '#162420' : '#181818'}
              stroke={n.highlight ? '#3cffd0' : '#3a3a3a'}
              strokeWidth={n.highlight ? 1.5 : 0.9}
              strokeOpacity={n.highlight ? 1 : 0.7}
              filter={n.highlight ? 'url(#node-glow)' : undefined}
            />
            {pathD && (
              <g transform={`translate(${ix},${iy}) scale(${ICON_SIZE / 24})`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={iconColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
            <text
              x={n.x + (pathD ? 26 : NODE_W / 2)}
              y={n.y + NODE_H / 2 + 4}
              fontSize="8.5"
              fontFamily="monospace"
              fill={n.highlight ? '#3cffd0' : '#b0b0b0'}
              fontWeight={n.highlight ? 'bold' : 'normal'}
              textAnchor={pathD ? 'start' : 'middle'}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};


// ─── Category Color Map ───────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  'Network & Ingress': '#3cffd0',
  'Compute & Logic': '#5200ff',
  'Storage & Caching': '#ffb703',
  'Messaging & Reliability': '#ff3366',
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const LearnSystemDesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'catalog'>('concepts');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectedComponent, setInspectedComponent] = useState<ComponentInfo | null>(
    COMPONENTS_DATA[0] || null
  );

  const drawerRef = useRef<HTMLDivElement>(null);
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

  const handleSelectComponent = (component: ComponentInfo) => {
    setInspectedComponent(component);
    // Scroll drawer to top on new selection
    setTimeout(() => drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#131313] text-white overflow-y-auto select-none">
      {/* Sub-header */}
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
              <span>Component Catalog</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#2d2d2d] text-[#949494] border border-[#404040] leading-none">
                {COMPONENTS_DATA.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">

        {/* ─── TAB 1: CONCEPTS ─────────────────────────────────────────────── */}
        {activeTab === 'concepts' && (
          <div className="space-y-12">
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
                  className="bg-white hover:bg-[#f0f0f0] text-black font-bold px-5 py-2.5 rounded-24px transition-all flex items-center gap-2"
                >
                  <Boxes className="w-4 h-4" />
                  Explore Component Catalog
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold block">The Four Pillars</span>
                <h3 className="text-2xl font-display font-black text-white tracking-wider mt-0.5">SYSTEM MEASUREMENT &amp; OBSERVABILITY</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Zap className="w-4 h-4" />, color: '#3cffd0', num: '1', title: 'Latency (Speed)', desc: 'Elapsed time before receiving a response. Under 100ms feels instantaneous; over 1,000ms creates user abandonment.', goal: 'Goal: p95 < 200ms' },
                  { icon: <Activity className="w-4 h-4" />, color: '#5200ff', num: '2', title: 'Throughput (Volume)', desc: 'Request handling capacity per second (RPS). High-concurrency systems must sustain surges of 50,000+ RPS.', goal: 'Goal: High sustained RPS' },
                  { icon: <CheckCircle className="w-4 h-4" />, color: '#3cffd0', num: '3', title: 'Availability (Uptime)', desc: 'Percentage of operational time. Four nines (99.99%) allows only 52 minutes of total downtime per year.', goal: 'Target: 99.99% uptime' },
                  { icon: <Layers className="w-4 h-4" />, color: '#ffb703', num: '4', title: 'Scalability', desc: 'Linear capacity expansion via horizontal scaling (adding worker replicas) rather than vertical scaling (larger CPU).', goal: 'Horizontal > Vertical' },
                ].map((p, i) => (
                  <div key={i} className="bg-[#181818] border border-[#313131] rounded-20px p-5 flex flex-col justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-12px bg-[#131313] border border-[#313131] flex items-center justify-center mb-3" style={{ color: p.color }}>{p.icon}</div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">{p.num}. {p.title}</h4>
                      <p className="text-xs text-[#949494] mt-2 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#313131] text-[11px] font-mono" style={{ color: p.color }}>{p.goal}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#181818] border border-[#313131] rounded-24px p-8">
              <div className="mb-6">
                <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold block">The Evolutionary Path</span>
                <h3 className="text-2xl font-display font-black text-white tracking-wider mt-0.5">SYSTEM EVOLUTION: 1 TO 100 MILLION USERS</h3>
              </div>
              <div className="space-y-4">
                {[
                  { num:'01', arch:'simple-app', title:'Single Server Monolith (1 – 1,000 Users)', desc:'Application compute and database run on a single host. Zero redundancy; susceptible to single points of failure.' },
                  { num:'02', arch:'scaled-app', title:'Load Balancer + Cache (1,000 – 100,000 Users)', desc:'Dedicated database tier. Reverse-proxy load balancing over stateless app servers with Redis cache absorbing 85% of read volume.' },
                  { num:'03', arch:'amazon', title:'Microservices & Event Queues (Amazon Scale)', desc:'Decoupled bounded contexts (Catalog, Cart, Orders). Kafka message streams buffer checkout spikes, while NoSQL powers partition tolerance.' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-16px bg-[#131313] border border-[#313131]">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-8px bg-[#181818] border border-[#313131] text-[#3cffd0] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">{s.num}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">{s.title}</h4>
                        <p className="text-xs text-[#949494] mt-1">{s.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => selectArchitecture(s.arch)} className="text-xs text-[#3cffd0] hover:underline font-mono uppercase tracking-verge-mono shrink-0 flex items-center gap-1">
                      View Architecture &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Component Library Discovery Banner ──────────────────────── */}
            <div
              className="relative rounded-24px overflow-hidden border border-[#3cffd0]/25 bg-[#0e1a17] p-8"
              style={{ background: 'linear-gradient(135deg, #0b1f1a 0%, #131313 60%, #0d0d1f 100%)' }}
            >
              {/* Decorative glow blobs */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#3cffd0] opacity-[0.06] blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#5200ff] opacity-[0.07] blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Left: headline */}
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 bg-[#3cffd0]/10 text-[#3cffd0] text-[10px] font-mono uppercase tracking-verge-nano font-bold px-2.5 py-1 rounded-12px border border-[#3cffd0]/25 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3cffd0]" />
                    Interactive Reference
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wider leading-tight">
                    EXPLORE THE
                    <span className="text-[#3cffd0]"> COMPONENT</span> LIBRARY
                  </h3>
                  <p className="text-[#949494] text-sm mt-2 leading-relaxed max-w-lg">
                    Deep-dive into every building block — DNS, CDN, Load Balancers, Databases, Caches, Message Queues and more.
                    Each entry includes diagrams, hyperparameters, and real-world examples from companies like Amazon &amp; Netflix.
                  </p>

                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-5 inline-flex items-center gap-2 bg-[#3cffd0] hover:bg-white text-black font-black font-mono text-xs uppercase tracking-verge-mono px-5 py-2.5 rounded-24px transition-all"
                  >
                    <Boxes className="w-4 h-4" />
                    Browse {COMPONENTS_DATA.length} Components
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: category pills */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {([
                    { label: 'Network & Ingress',       color: '#3cffd0', icon: <Globe className="w-4 h-4" />,          count: COMPONENTS_DATA.filter(c => c.category === 'Network & Ingress').length },
                    { label: 'Compute & Logic',          color: '#5200ff', icon: <Cpu className="w-4 h-4" />,            count: COMPONENTS_DATA.filter(c => c.category === 'Compute & Logic').length },
                    { label: 'Storage & Caching',        color: '#ffb703', icon: <HardDrive className="w-4 h-4" />,      count: COMPONENTS_DATA.filter(c => c.category === 'Storage & Caching').length },
                    { label: 'Messaging & Reliability',  color: '#ff6b35', icon: <MessageSquare className="w-4 h-4" />,  count: COMPONENTS_DATA.filter(c => c.category === 'Messaging & Reliability').length },
                  ] as { label: string; color: string; icon: React.ReactNode; count: number }[]).map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => { setActiveTab('catalog'); }}
                      className="flex flex-col items-start gap-2 bg-[#181818] hover:bg-[#202020] border border-[#313131] hover:border-[#404040] rounded-16px p-3.5 transition-all text-left"
                    >
                      <div className="w-7 h-7 rounded-8px bg-[#131313] border border-[#313131] flex items-center justify-center" style={{ color: cat.color }}>
                        {cat.icon}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-verge-nano font-bold leading-tight" style={{ color: cat.color }}>{cat.label}</span>
                      <span className="text-[11px] text-[#949494] font-mono">{cat.count} components</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 2: COMPONENT CATALOG ────────────────────────────────────── */}
        {activeTab === 'catalog' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: Component Cards Grid */}
            <div className="flex-1 space-y-6">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const color = cat === 'All' ? '#3cffd0' : CAT_COLOR[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-12px text-xs font-mono uppercase tracking-verge-mono transition-all border ${
                        selectedCategory === cat
                          ? 'bg-[#2d2d2d] font-bold'
                          : 'bg-[#181818] text-[#949494] hover:text-white border-[#313131]'
                      }`}
                      style={selectedCategory === cat ? { color, borderColor: `${color}55` } : {}}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredComponents.map((component) => {
                  const IllustrationSvg = ILLUSTRATIONS[component.illustrationKey];
                  const isSelected = inspectedComponent?.id === component.id;
                  const accentColor = CAT_COLOR[component.category] || '#3cffd0';

                  return (
                    <div
                      key={component.id}
                      onClick={() => handleSelectComponent(component)}
                      className={`rounded-20px border transition-all cursor-pointer select-none flex flex-col overflow-hidden group ${
                        isSelected
                          ? 'border-[#3cffd0] bg-[#181818] shadow-[0_0_24px_rgba(60,255,208,0.08)]'
                          : 'border-[#313131] bg-[#181818] hover:border-[#3cffd0]/30 hover:bg-[#1c1c1c]'
                      }`}
                    >
                      {/* Illustration Banner */}
                      <div className="relative w-full overflow-hidden" style={{ height: '150px', background: '#0e0e0e' }}>
                        {IllustrationSvg && <IllustrationSvg />}
                        {/* Category badge overlay */}
                        <span
                          className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-verge-nano px-2 py-0.5 rounded-full font-bold"
                          style={{ color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}44` }}
                        >
                          {component.category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h4 className="font-bold text-white text-[13px] tracking-tight mb-1 font-mono leading-snug">
                            {component.name}
                          </h4>
                          <p className="text-xs text-[#777] leading-relaxed line-clamp-2">
                            {component.oneLiner}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#313131]/60 flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono">
                          <span className="flex items-center gap-1 font-bold" style={{ color: accentColor }}>
                            Inspect →
                          </span>
                          <span className="text-[10px] text-[#555]">
                            {component.realWorldExample.company.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Inspector Drawer */}
            {inspectedComponent && (() => {
              const IllustrationSvg = ILLUSTRATIONS[inspectedComponent.illustrationKey];
              const accentColor = CAT_COLOR[inspectedComponent.category] || '#3cffd0';

              return (
                <div
                  ref={drawerRef}
                  className="w-full lg:w-[500px] bg-[#181818] border border-[#313131] rounded-24px sticky top-24 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 7rem)' }}
                >
                  {/* Hero illustration banner */}
                  <div className="relative w-full overflow-hidden rounded-t-24px" style={{ height: '180px', background: '#0e0e0e' }}>
                    {IllustrationSvg && <IllustrationSvg />}
                    {/* Gradient fade at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-12" style={{ background: 'linear-gradient(to top, #181818, transparent)' }} />
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Name / Category header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className="text-[9px] font-mono uppercase tracking-verge-nano font-bold px-2 py-0.5 rounded-full"
                          style={{ color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}44` }}
                        >
                          {inspectedComponent.category}
                        </span>
                        <h3 className="text-xl font-display font-black text-white tracking-wider mt-1.5 leading-tight">
                          {inspectedComponent.name}
                        </h3>
                        <p className="text-xs text-[#666] mt-1 font-mono">{inspectedComponent.oneLiner}</p>
                      </div>
                    </div>

                    <div className="h-px bg-[#262626]" />

                    {/* 1. What is it? */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-verge-nano font-bold mb-2 flex items-center gap-1.5" style={{ color: accentColor }}>
                        <BookOpen className="w-3.5 h-3.5" /> What Is It?
                      </h4>
                      <p className="text-xs text-[#c8c8c8] leading-relaxed bg-[#131313] p-3 rounded-12px border border-[#252525]">
                        {inspectedComponent.simpleExplanation}
                      </p>
                    </div>

                    {/* 2. System Role */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-verge-nano font-bold mb-2 flex items-center gap-1.5" style={{ color: accentColor }}>
                        <Activity className="w-3.5 h-3.5" /> System Role & Position
                      </h4>
                      <p className="text-xs text-[#c8c8c8] leading-relaxed bg-[#131313] p-3 rounded-12px border border-[#252525]">
                        {inspectedComponent.systemRole}
                      </p>
                    </div>

                    {/* 3. Connections */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-verge-nano font-bold mb-2.5 flex items-center gap-1.5" style={{ color: accentColor }}>
                        <Link2 className="w-3.5 h-3.5" /> Connections to Other Components
                      </h4>
                      <div className="space-y-2">
                        {inspectedComponent.connections.map((conn, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-[#131313] rounded-10px p-2.5 border border-[#252525]">
                            <div
                              className="shrink-0 mt-0.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                              style={{ color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, whiteSpace: 'nowrap' }}
                            >
                              → {conn.to}
                            </div>
                            <p className="text-[11px] text-[#949494] leading-snug">{conn.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Architecture Diagram */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-verge-nano font-bold mb-2 flex items-center gap-1.5" style={{ color: accentColor }}>
                        <Boxes className="w-3.5 h-3.5" /> Architecture Example
                      </h4>
                      <div className="rounded-12px overflow-hidden border border-[#252525]">
                        <ArchDiagram
                          nodes={inspectedComponent.exampleArchitecture.nodes}
                          edges={inspectedComponent.exampleArchitecture.edges}
                        />
                      </div>
                      <p className="text-[10px] text-[#555] font-mono mt-1.5 text-center">
                        Highlighted node = <span style={{ color: accentColor }}>{inspectedComponent.name.split(' ')[0]}</span> · Dashed = optional/async path
                      </p>
                    </div>

                    <div className="h-px bg-[#262626]" />

                    {/* 5. How It Works */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-verge-nano font-bold mb-2 flex items-center gap-1.5" style={{ color: accentColor }}>
                        <Zap className="w-3.5 h-3.5" /> How It Works Step-by-Step
                      </h4>
                      <ol className="space-y-2">
                        {inspectedComponent.howItWorksSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#949494]">
                            <span
                              className="w-5 h-5 rounded-4px font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold"
                              style={{ color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-[#d4d4d4]">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 6. Real-World Spotlight */}
                    <div className="bg-[#131313] border border-[#252525] rounded-16px p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1 font-mono uppercase tracking-verge-mono">
                        <ExternalLink className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        Spotlight: {inspectedComponent.realWorldExample.company}
                      </div>
                      <div className="text-[11px] font-mono mb-1" style={{ color: accentColor }}>
                        {inspectedComponent.realWorldExample.architectureTitle}
                      </div>
                      <p className="text-xs text-[#949494] leading-relaxed">
                        {inspectedComponent.realWorldExample.description}
                      </p>
                    </div>

                    {/* 7. When to Use */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-[#131313] border border-[#252525] rounded-12px p-3">
                        <div className="font-bold mb-2 flex items-center gap-1 uppercase tracking-verge-nano text-[10px] text-[#3cffd0]">
                          <CheckCircle className="w-3.5 h-3.5" /> When to Use
                        </div>
                        <ul className="text-[11px] text-[#b0b0b0] space-y-1.5">
                          {inspectedComponent.whenToUse.map((w, i) => (
                            <li key={i} className="leading-snug">• {w}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#131313] border border-[#252525] rounded-12px p-3">
                        <div className="font-bold mb-2 flex items-center gap-1 uppercase tracking-verge-nano text-[10px] text-[#ff3366]">
                          <AlertTriangle className="w-3.5 h-3.5" /> When NOT to Use
                        </div>
                        <ul className="text-[11px] text-[#b0b0b0] space-y-1.5">
                          {inspectedComponent.whenNotToUse.map((w, i) => (
                            <li key={i} className="leading-snug">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="h-2" />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

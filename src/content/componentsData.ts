import { NodeType } from '../engine/types';

export interface ArchNode {
  id: string;
  label: string;
  x: number;
  y: number;
  highlight?: boolean;
  icon?: string; // emoji shorthand for the node
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface ComponentInfo {
  id: string;
  type: NodeType | 'dns' | 'storage' | 'microservice';
  name: string;
  category: 'Network & Ingress' | 'Compute & Logic' | 'Storage & Caching' | 'Messaging & Reliability';
  iconName: string;
  illustrationKey: string; // maps to inline SVG in the UI
  oneLiner: string;
  simpleExplanation: string;
  systemRole: string;
  connections: { to: string; description: string }[];
  howItWorksSteps: string[];
  keyHyperparameters: {
    name: string;
    description: string;
    typicalValues: string;
  }[];
  whenToUse: string[];
  whenNotToUse: string[];
  realWorldExample: {
    company: string;
    architectureTitle: string;
    description: string;
  };
  symbolDiagramText: string;
  exampleArchitecture: {
    nodes: ArchNode[];
    edges: ArchEdge[];
  };
}

export const COMPONENTS_DATA: ComponentInfo[] = [
  {
    id: 'dns',
    type: 'dns',
    name: 'DNS (Domain Name System)',
    category: 'Network & Ingress',
    iconName: 'Network',
    illustrationKey: 'dns',
    oneLiner: 'The phonebook of the internet that maps human domain names to server IP addresses.',
    simpleExplanation:
      'When you type "amazon.com" into your browser, your computer doesn\'t know where that is. DNS looks up the domain name and returns the exact IP address of the closest server. It also routes users to the nearest data center based on their geography (Geo-DNS).',
    systemRole:
      'DNS sits at the very edge of every distributed system — it is the first component any user request touches before any other infrastructure is involved. It performs macro-level traffic routing across geographic regions, directing users to the closest data center before a single byte of application code runs.',
    connections: [
      { to: 'CDN', description: 'DNS CNAME records point domains to CDN edge endpoints for static asset delivery.' },
      { to: 'Load Balancer', description: 'DNS A/Alias records resolve to load balancer IPs for application traffic.' },
      { to: 'API Gateway', description: 'DNS routes API subdomains (api.myapp.com) directly to the API Gateway cluster.' },
    ],
    howItWorksSteps: [
      'User browser sends a query: "Where is myapp.com?"',
      'The DNS Resolver checks its local cache; if missing, it asks Root and TLD nameservers.',
      'Authoritative DNS nameserver returns the closest IP address with a TTL (Time To Live).',
      'Browser connects directly to that server IP and caches the address locally.',
    ],
    keyHyperparameters: [
      { name: 'TTL (Time to Live)', description: 'How long DNS resolvers cache the IP address before asking again.', typicalValues: '60s to 86400s' },
      { name: 'Routing Policy', description: 'Strategy to pick IP: Geolocation, Latency-based, or Weighted Round-Robin.', typicalValues: 'Latency-based' },
    ],
    whenToUse: [
      'Every web application needs DNS to be reachable by a domain name.',
      'Directing users worldwide to the closest regional cloud data center (US-East, EU-Central, AP-South).',
    ],
    whenNotToUse: [
      'Do not use DNS for fine-grained, instantaneous server load balancing (DNS caching prevents fast failover).',
    ],
    realWorldExample: {
      company: 'AWS Route 53 & Cloudflare',
      architectureTitle: 'Global Traffic Latency Routing',
      description: 'Routes users in Mumbai to AWS ap-south-1 and users in London to eu-west-1 in less than 20ms.',
    },
    symbolDiagramText: 'User Browser ──(resolves "app.com")──▶ DNS Server ──(returns IP: 198.51.100.1)──▶ Client',
    exampleArchitecture: {
      nodes: [
        { id: 'user', label: 'User Browser', x: 60, y: 100, icon: 'monitor' },
        { id: 'dns', label: 'DNS Server', x: 220, y: 100, highlight: true, icon: 'globe' },
        { id: 'cdn', label: 'CDN Edge', x: 380, y: 60, icon: 'zap' },
        { id: 'lb', label: 'Load Balancer', x: 380, y: 140, icon: 'scale' },
      ],
      edges: [
        { from: 'user', to: 'dns', label: 'resolve domain' },
        { from: 'dns', to: 'cdn', label: 'static assets' },
        { from: 'dns', to: 'lb', label: 'app traffic' },
      ],
    },
  },
  {
    id: 'cdn',
    type: 'cdn',
    name: 'CDN (Content Delivery Network)',
    category: 'Network & Ingress',
    iconName: 'Globe',
    illustrationKey: 'cdn',
    oneLiner: 'A global network of edge servers that cache and serve content close to the user.',
    simpleExplanation:
      'Instead of every user across the globe fetching videos, images, and HTML from a single server in Virginia, a CDN keeps a copy in hundreds of cities worldwide. Users in Tokyo get content from Tokyo; users in Delhi get it from Delhi.',
    systemRole:
      'The CDN forms the outermost layer of a distributed system, absorbing 85–99% of all static content traffic before it ever reaches origin servers. It dramatically reduces global latency, shields the backend from traffic spikes, and provides the first line of DDoS mitigation.',
    connections: [
      { to: 'DNS', description: 'DNS CNAME records point the domain to the CDN\'s Anycast entry point.' },
      { to: 'Object Storage', description: 'CDN pulls static files (images, videos) from S3/Blob origin and caches them at edge.' },
      { to: 'Load Balancer', description: 'Cache misses fall through to the origin load balancer for dynamic content.' },
    ],
    howItWorksSteps: [
      'User requests a static file (e.g. image, video chunk, CSS/JS).',
      'Request hits the geographically closest CDN Edge Point-of-Presence (PoP).',
      'Cache Hit: If the file is already cached at the edge, it returns immediately in ~5–15ms.',
      'Cache Miss: If not cached, the CDN fetches it once from the Origin Server, caches it, and returns it.',
    ],
    keyHyperparameters: [
      { name: 'Cache Hit Rate (h)', description: 'Percentage of requests served directly by the edge without hitting your origin.', typicalValues: '85% – 98%' },
      { name: 'Edge Latency', description: 'Base round-trip time from user to the local edge node.', typicalValues: '5ms – 20ms' },
    ],
    whenToUse: [
      'Delivering static assets: images, video chunks, JavaScript bundles, stylesheets.',
      'Absorbing traffic spikes and mitigating DDoS attacks before they reach your backend.',
    ],
    whenNotToUse: [
      'Highly dynamic, non-cacheable data with user-specific mutations (e.g., banking transactions, stock trades).',
    ],
    realWorldExample: {
      company: 'Netflix (Open Connect CDN)',
      architectureTitle: 'Global Edge Video Delivery',
      description: 'Netflix places custom CDN appliances inside internet service providers worldwide, absorbing >95% of streaming bandwidth.',
    },
    symbolDiagramText: 'User in Delhi ──▶ CDN Edge (Delhi Cache) ──[95% Hit]──▶ Instant 10ms Response\n                                         └──[5% Miss]──▶ Origin Server (US)',
    exampleArchitecture: {
      nodes: [
        { id: 'user', label: 'User (Delhi)', x: 50, y: 100, icon: 'user' },
        { id: 'cdn', label: 'CDN Edge (Delhi)', x: 210, y: 100, highlight: true, icon: 'zap' },
        { id: 's3', label: 'Object Storage', x: 390, y: 60, icon: 'hardDrive' },
        { id: 'lb', label: 'Load Balancer', x: 390, y: 150, icon: 'scale' },
      ],
      edges: [
        { from: 'user', to: 'cdn', label: 'request' },
        { from: 'cdn', to: 's3', label: 'cache miss (5%)' , dashed: true },
        { from: 'cdn', to: 'lb', label: 'dynamic miss', dashed: true },
      ],
    },
  },
  {
    id: 'load_balancer',
    type: 'load_balancer',
    name: 'Load Balancer (L4 / L7)',
    category: 'Network & Ingress',
    iconName: 'Layers',
    illustrationKey: 'load_balancer',
    oneLiner: 'A traffic cop that distributes incoming requests evenly across healthy backend servers.',
    simpleExplanation:
      'If you have 10 servers and 100,000 users, you don\'t want all 100,000 hitting Server #1 while the other 9 sit idle. The Load Balancer evenly distributes the load so no single server gets overwhelmed. If a server crashes, the load balancer automatically stops sending traffic to it.',
    systemRole:
      'The Load Balancer is the horizontal scaling enabler — it makes a fleet of identical stateless servers appear as a single resilient endpoint. It provides health-check-driven automatic failover, enabling zero-downtime deployments and server maintenance without user impact.',
    connections: [
      { to: 'DNS', description: 'DNS resolves the app domain to the load balancer\'s IP or Alias record.' },
      { to: 'API Gateway', description: 'The API Gateway often sits behind a load balancer for HA of the gateway itself.' },
      { to: 'App Server', description: 'Routes verified traffic to a pool of stateless application server replicas.' },
    ],
    howItWorksSteps: [
      'Incoming client request arrives at the Load Balancer IP address.',
      'The Load Balancer performs health checks to know which backend servers are alive.',
      'Selects a target server using an algorithm: Round-Robin, Least Connections, or IP Hash.',
      'Forwards the request, receives the response from the server, and returns it to the client.',
    ],
    keyHyperparameters: [
      { name: 'Balancing Algorithm', description: 'How requests are split across backend replicas.', typicalValues: 'Round-Robin / Least Connections' },
      { name: 'Health Check Frequency', description: 'Interval in seconds between health probes to backends.', typicalValues: '5s – 15s' },
      { name: 'Connection Capacity', description: 'Max concurrent TCP connections the balancer can sustain.', typicalValues: '50,000 – 1,000,000 RPS' },
    ],
    whenToUse: [
      'Whenever you have more than 1 backend server replica.',
      'To provide High Availability: seamlessly take servers offline for deployments without downtime.',
    ],
    whenNotToUse: [
      'Extremely simple internal microservice scripts where a direct service discovery call suffices.',
    ],
    realWorldExample: {
      company: 'AWS ALB & NGINX',
      architectureTitle: 'Layer 7 HTTP Request Distribution',
      description: 'AWS Application Load Balancer inspects HTTP paths (/api/checkout vs /api/search) and routes to dedicated auto-scaling target groups.',
    },
    symbolDiagramText: 'Traffic In ──▶ [ LOAD BALANCER ] ──┬──▶ App Server 1 (Healthy)\n                                   ├──▶ App Server 2 (Healthy)\n                                   └──▶ App Server 3 (Healthy)',
    exampleArchitecture: {
      nodes: [
        { id: 'cdn', label: 'CDN', x: 50, y: 100, icon: 'zap' },
        { id: 'lb', label: 'Load Balancer', x: 210, y: 100, highlight: true, icon: 'scale' },
        { id: 'app1', label: 'App Server 1', x: 390, y: 50, icon: 'monitor' },
        { id: 'app2', label: 'App Server 2', x: 390, y: 110, icon: 'monitor' },
        { id: 'app3', label: 'App Server 3', x: 390, y: 170, icon: 'monitor' },
      ],
      edges: [
        { from: 'cdn', to: 'lb', label: 'traffic in' },
        { from: 'lb', to: 'app1', label: '33%' },
        { from: 'lb', to: 'app2', label: '33%' },
        { from: 'lb', to: 'app3', label: '33%' },
      ],
    },
  },
  {
    id: 'api_gateway',
    type: 'rate_limiter',
    name: 'API Gateway & Rate Limiter',
    category: 'Network & Ingress',
    iconName: 'Shield',
    illustrationKey: 'api_gateway',
    oneLiner: 'The single front door for all clients that handles authentication, routing, and rate limiting.',
    simpleExplanation:
      'Instead of mobile apps calling 20 different microservices directly, they call one API Gateway. The Gateway verifies user login tokens, blocks spam/DDoS bots, routes requests to the right service, and collects analytics.',
    systemRole:
      'The API Gateway enforces the security perimeter of the entire backend. It centralizes cross-cutting concerns — authentication, authorization, rate limiting, SSL termination — so individual microservices don\'t each need to implement them. It\'s the single point through which all external traffic enters the internal service mesh.',
    connections: [
      { to: 'Load Balancer', description: 'A load balancer distributes external traffic across multiple gateway instances for HA.' },
      { to: 'App Server', description: 'Routes authenticated requests to the appropriate downstream microservice.' },
      { to: 'Cache', description: 'Reads rate-limit counters and session tokens from Redis at sub-millisecond speed.' },
    ],
    howItWorksSteps: [
      'Client sends an authenticated request: GET /api/v1/orders.',
      'Gateway checks rate limit (e.g. max 100 requests per minute per IP using a Token Bucket).',
      'Validates JWT auth token; rejects unauthorized requests with HTTP 401/429 immediately.',
      'Routes the request to the internal microservice endpoint.',
    ],
    keyHyperparameters: [
      { name: 'Rate Limit (RPS)', description: 'Max allowed requests per second before throttling.', typicalValues: '100 – 10,000 req/sec' },
      { name: 'Timeout Limit', description: 'Max time to wait for a microservice before returning HTTP 504 Gateway Timeout.', typicalValues: '2,000ms – 10,000ms' },
    ],
    whenToUse: [
      'Microservice architectures with multiple client platforms (iOS, Android, Web).',
      'Enforcing centralized authentication, SSL termination, and DDoS rate limits.',
    ],
    whenNotToUse: [
      'Monolithic applications where the monolith can handle its own authentication directly without another hop.',
    ],
    realWorldExample: {
      company: 'Kong / AWS API Gateway / Netflix Zuul',
      architectureTitle: 'Centralized Microservice Ingress',
      description: 'Netflix Zuul handles tens of billions of requests daily, routing traffic dynamically while securing backend services.',
    },
    symbolDiagramText: 'Clients (iOS/Web) ──▶ [ API GATEWAY ] ──┬──(auth ok)──▶ Order Service\n                                          ├──(auth ok)──▶ User Service\n                                          └──(over limit)──▶ 429 Too Many Requests',
    exampleArchitecture: {
      nodes: [
        { id: 'mobile', label: 'Mobile App', x: 50, y: 70, icon: 'smartphone' },
        { id: 'web', label: 'Web Client', x: 50, y: 140, icon: 'monitor' },
        { id: 'gw', label: 'API Gateway', x: 210, y: 100, highlight: true, icon: 'shield' },
        { id: 'redis', label: 'Redis Cache', x: 210, y: 190, icon: 'zap' },
        { id: 'orders', label: 'Orders Service', x: 390, y: 60, icon: 'package' },
        { id: 'users', label: 'Users Service', x: 390, y: 140, icon: 'user' },
      ],
      edges: [
        { from: 'mobile', to: 'gw', label: 'HTTPS' },
        { from: 'web', to: 'gw', label: 'HTTPS' },
        { from: 'gw', to: 'redis', label: 'rate check', dashed: true },
        { from: 'gw', to: 'orders', label: '/api/orders' },
        { from: 'gw', to: 'users', label: '/api/users' },
      ],
    },
  },
  {
    id: 'app_server',
    type: 'service',
    name: 'Application Server (Compute)',
    category: 'Compute & Logic',
    iconName: 'Server',
    illustrationKey: 'app_server',
    oneLiner: 'The brain of the system that executes business logic, calculations, and orchestrations.',
    simpleExplanation:
      'The App Server receives user requests, executes your code (processing payments, computing recommendations, validating forms), reads and writes data to databases, and returns responses. You scale it by adding more replicas (horizontal scaling).',
    systemRole:
      'Application servers are the core compute layer — every business rule, data transformation, and service orchestration runs here. They must be kept stateless so that any request can be handled by any replica, enabling seamless horizontal scaling and zero-downtime rolling deployments.',
    connections: [
      { to: 'Load Balancer', description: 'Receives traffic from the load balancer as one of many stateless replicas.' },
      { to: 'Cache', description: 'Queries Redis for hot data before touching the database to minimize latency.' },
      { to: 'SQL Database', description: 'Reads and writes persistent, transactional business data.' },
      { to: 'Message Queue', description: 'Publishes async events to Kafka/RabbitMQ for background processing.' },
    ],
    howItWorksSteps: [
      'Receives HTTP/gRPC request forwarded from the load balancer.',
      'Executes business code: queries cache, computes business rules, validates user permissions.',
      'Sends queries to databases or publishes messages to event queues.',
      'Assembles final JSON/HTML payload and sends HTTP response.',
    ],
    keyHyperparameters: [
      { name: 'Replicas (N)', description: 'Number of parallel server instances running in the cluster.', typicalValues: '2 to 100+ instances' },
      { name: 'Service Rate (μ)', description: 'Requests per second a single replica can process before saturating.', typicalValues: '500 – 5,000 RPS/replica' },
      { name: 'Base Latency', description: 'Execution time of code without queueing delays.', typicalValues: '10ms – 50ms' },
    ],
    whenToUse: [
      'Every dynamic application requires compute servers to run code.',
      'Keep servers stateless so any server can handle any incoming request.',
    ],
    whenNotToUse: [
      'Do not store in-memory user sessions on the server instance (use Redis so servers remain stateless).',
    ],
    realWorldExample: {
      company: 'Uber & Airbnb',
      architectureTitle: 'Stateless Microservice Clusters',
      description: 'Stateless Go & Java microservices deployed across Kubernetes clusters auto-scale from 50 to 500 replicas based on CPU load.',
    },
    symbolDiagramText: 'Load Balancer ──▶ [ APP SERVER (Replica ×3) ] ──▶ Reads Redis Cache ──▶ Writes SQL DB',
    exampleArchitecture: {
      nodes: [
        { id: 'lb', label: 'Load Balancer', x: 50, y: 100, icon: 'scale' },
        { id: 'app', label: 'App Server ×N', x: 210, y: 100, highlight: true, icon: 'monitor' },
        { id: 'cache', label: 'Redis Cache', x: 390, y: 55, icon: 'zap' },
        { id: 'db', label: 'SQL Database', x: 390, y: 145, icon: 'database' },
        { id: 'queue', label: 'Message Queue', x: 390, y: 200, icon: 'mail' },
      ],
      edges: [
        { from: 'lb', to: 'app', label: 'request' },
        { from: 'app', to: 'cache', label: 'read hot data' },
        { from: 'app', to: 'db', label: 'persist' },
        { from: 'app', to: 'queue', label: 'async event' },
      ],
    },
  },
  {
    id: 'cache',
    type: 'cache',
    name: 'In-Memory Cache (Redis / Memcached)',
    category: 'Storage & Caching',
    iconName: 'HardDrive',
    illustrationKey: 'cache',
    oneLiner: 'Lightning-fast in-memory storage for frequently accessed data to relieve the database.',
    simpleExplanation:
      'Databases write to disk, which takes 5–50 milliseconds. An in-memory cache stores hot data in RAM, returning it in under 1 millisecond. By storing popular data (product details, user sessions) in cache, 90%+ of queries never need to touch the slow database.',
    systemRole:
      'The cache is the performance multiplier of the entire stack — it short-circuits the expensive disk I/O path for the most frequent read queries. A well-tuned cache absorbs 85–99% of all read traffic, enabling a small database cluster to serve millions of concurrent users without being overwhelmed.',
    connections: [
      { to: 'App Server', description: 'App servers query the cache first (Cache-Aside pattern) before falling back to the database.' },
      { to: 'SQL Database', description: 'Cache populates itself from the database on cache misses, then serves future reads from RAM.' },
      { to: 'API Gateway', description: 'API Gateway reads rate-limit token buckets and session tokens from Redis.' },
    ],
    howItWorksSteps: [
      'App Server checks cache: "Do you have user 123 profile?" (Cache-Aside pattern).',
      'Cache Hit: Cache returns the data in < 1ms. Database is never touched.',
      'Cache Miss: Data is not in cache; server queries database (20ms), stores result in cache with a TTL, and returns it.',
    ],
    keyHyperparameters: [
      { name: 'Hit Rate (h)', description: 'Fraction of read queries satisfied by cache.', typicalValues: '80% – 98%' },
      { name: 'Eviction Policy', description: 'What to delete when RAM fills up: LRU (Least Recently Used), LFU.', typicalValues: 'LRU (Allkeys-LRU)' },
      { name: 'Memory Size', description: 'Allocated RAM capacity for key-value storage.', typicalValues: '16GB – 512GB' },
    ],
    whenToUse: [
      'Read-heavy workloads with repetitive queries (e.g. 95% reads, 5% writes).',
      'Session storage, leaderboards, rate-limiting counters, and precomputed feeds.',
    ],
    whenNotToUse: [
      'Write-heavy workloads where data changes every millisecond and cache misses dominate.',
      'Primary source of truth where data loss cannot be tolerated (unless using Redis persistence/AOF).',
    ],
    realWorldExample: {
      company: 'Twitter / X',
      architectureTitle: 'Home Timeline In-Memory Caching',
      description: 'Twitter caches the latest 800 tweet IDs for every active user in Redis RAM, enabling instant feed loading for 200M+ users.',
    },
    symbolDiagramText: 'App Server ──1. Check Cache──▶ [ REDIS RAM ] ──(Hit <1ms)──▶ Return to Server\n     │                                                ▲\n     └──2. (Miss) Query DB──▶ [ PostgreSQL ] ──3. Populate Cache ─┘',
    exampleArchitecture: {
      nodes: [
        { id: 'app', label: 'App Server', x: 50, y: 100, icon: 'monitor' },
        { id: 'cache', label: 'Redis Cache', x: 230, y: 60, highlight: true, icon: 'zap' },
        { id: 'db', label: 'SQL Database', x: 230, y: 160, icon: 'database' },
        { id: 'client', label: 'Client', x: 400, y: 100, icon: 'user' },
      ],
      edges: [
        { from: 'app', to: 'cache', label: '1. check (hit <1ms)' },
        { from: 'app', to: 'db', label: '2. miss → query DB', dashed: true },
        { from: 'db', to: 'cache', label: '3. populate', dashed: true },
        { from: 'cache', to: 'client', label: 'response' },
      ],
    },
  },
  {
    id: 'sql_db',
    type: 'database',
    name: 'Relational Database (SQL)',
    category: 'Storage & Caching',
    iconName: 'Database',
    illustrationKey: 'sql_db',
    oneLiner: 'ACID-compliant structured storage for mission-critical transactional data.',
    simpleExplanation:
      'When accuracy and transactions matter—like taking money from Account A and adding it to Account B—you need a relational database (like PostgreSQL or MySQL). It guarantees data consistency through tables, foreign keys, and strict transactions.',
    systemRole:
      'The relational database is the source of truth for all structured, transactional business data. Its ACID guarantees ensure that partial writes and race conditions never corrupt critical records like financial transactions, user accounts, or inventory levels — making it irreplaceable for systems where correctness is non-negotiable.',
    connections: [
      { to: 'App Server', description: 'App servers write and read structured business data through connection pools.' },
      { to: 'Cache', description: 'Cache stores frequently-read query results from the database to reduce load.' },
      { to: 'Message Queue', description: 'DB changes trigger outbox events published to the message queue for downstream services.' },
    ],
    howItWorksSteps: [
      'Receives structured SQL query (SELECT, INSERT, UPDATE).',
      'Uses B-Tree indexes to rapidly locate rows on disk storage.',
      'Enforces ACID: Atomicity (all or nothing), Consistency, Isolation, Durability.',
      'Writes to Write-Ahead-Log (WAL) and persists data to disk.',
    ],
    keyHyperparameters: [
      { name: 'Connection Pool Size', description: 'Max concurrent database connections before queueing.', typicalValues: '50 – 500 connections' },
      { name: 'Read Replicas', description: 'Secondary read-only database copies to offload SELECT queries.', typicalValues: '1 Primary + 2–5 Replicas' },
      { name: 'IOPS Capacity', description: 'Disk read/write input-output operations per second.', typicalValues: '3,000 – 64,000 IOPS' },
    ],
    whenToUse: [
      'Transactional financial systems, order management, user billing accounts.',
      'Complex relational queries requiring JOINs across multiple structured tables.',
    ],
    whenNotToUse: [
      'Unstructured or semi-structured data with massive petabyte write volume (e.g. raw IoT telemetry logs).',
    ],
    realWorldExample: {
      company: 'Stripe & Shopify',
      architectureTitle: 'Financial Transaction Ledger',
      description: 'Shopify uses heavily sharded MySQL clusters with read-replicas to guarantee zero data loss on millions of checkout orders.',
    },
    symbolDiagramText: 'Writes (INSERT/UPDATE) ──▶ [ PRIMARY SQL DB ] ──(Replication)──▶ [ READ REPLICA 1 ] ──▶ SELECTs\n                                                              └──▶ [ READ REPLICA 2 ] ──▶ SELECTs',
    exampleArchitecture: {
      nodes: [
        { id: 'app', label: 'App Server', x: 50, y: 100, icon: 'monitor' },
        { id: 'primary', label: 'Primary DB', x: 220, y: 100, highlight: true, icon: 'database' },
        { id: 'replica1', label: 'Read Replica 1', x: 400, y: 60, icon: 'database' },
        { id: 'replica2', label: 'Read Replica 2', x: 400, y: 155, icon: 'database' },
      ],
      edges: [
        { from: 'app', to: 'primary', label: 'writes' },
        { from: 'primary', to: 'replica1', label: 'replicate' },
        { from: 'primary', to: 'replica2', label: 'replicate' },
        { from: 'replica1', to: 'app', label: 'SELECTs', dashed: true },
        { from: 'replica2', to: 'app', label: 'SELECTs', dashed: true },
      ],
    },
  },
  {
    id: 'nosql_db',
    type: 'database',
    name: 'NoSQL Database (Key-Value / Document / Wide-Column)',
    category: 'Storage & Caching',
    iconName: 'Cpu',
    illustrationKey: 'nosql_db',
    oneLiner: 'Horizontally scalable distributed database designed for massive write volume and flexible schemas.',
    simpleExplanation:
      'Traditional SQL databases struggle when scaled across 50 separate servers. NoSQL databases (like Cassandra, DynamoDB, MongoDB) are built from day one to partition data across hundreds of machines, providing fast reads and writes at massive scale.',
    systemRole:
      'NoSQL databases provide the horizontal write scalability that relational databases fundamentally cannot achieve past a single machine. They sacrifice cross-row ACID guarantees in exchange for the ability to partition data across thousands of nodes, making them essential for internet-scale telemetry, social graphs, and catalog data.',
    connections: [
      { to: 'App Server', description: 'App servers query NoSQL by partition key for single-digit millisecond responses at any scale.' },
      { to: 'Message Queue', description: 'Kafka consumers write high-throughput event streams directly into NoSQL stores.' },
      { to: 'Object Storage', description: 'NoSQL stores metadata and references while large blobs live in object storage.' },
    ],
    howItWorksSteps: [
      'Data is partitioned across cluster nodes using a Hash of the Partition Key.',
      'Writes write to a memory commit log and memtable before flushing to SSTables.',
      'Nodes replicate data to N peer nodes based on configurable consistency levels (e.g. Eventual Consistency).',
    ],
    keyHyperparameters: [
      { name: 'Partition Key', description: 'Key used to distribute records evenly across cluster nodes.', typicalValues: 'userId, orderId, deviceId' },
      { name: 'Consistency Level', description: 'Trade-off between speed and freshness (Strong vs Eventual).', typicalValues: 'Eventual / Quorum' },
    ],
    whenToUse: [
      'Massive scale: terabytes to petabytes of data with high write throughput.',
      'Data models with flexible or rapidly evolving schemas (JSON documents, sensor logs).',
    ],
    whenNotToUse: [
      'Applications requiring complex multi-table JOINs and distributed ACID transactions across multiple entities.',
    ],
    realWorldExample: {
      company: 'Amazon (DynamoDB) & Discord (Cassandra/ScyllaDB)',
      architectureTitle: 'Billion-Scale Message & Product Storage',
      description: 'Amazon DynamoDB handles over 100 million requests per second during Prime Day with single-digit millisecond latency.',
    },
    symbolDiagramText: 'Write Request ──▶ [ Partition Hash ] ──┬──▶ Node 1 (Storage Partition A)\n                                       ├──▶ Node 2 (Storage Partition B)\n                                       └──▶ Node 3 (Storage Partition C)',
    exampleArchitecture: {
      nodes: [
        { id: 'app', label: 'App Server', x: 50, y: 110, icon: 'monitor' },
        { id: 'hash', label: 'Partition Router', x: 200, y: 110, highlight: true, icon: 'shuffle' },
        { id: 'n1', label: 'Node A', x: 380, y: 50, icon: 'database' },
        { id: 'n2', label: 'Node B', x: 380, y: 115, icon: 'database' },
        { id: 'n3', label: 'Node C', x: 380, y: 180, icon: 'database' },
      ],
      edges: [
        { from: 'app', to: 'hash', label: 'write' },
        { from: 'hash', to: 'n1', label: 'partition A' },
        { from: 'hash', to: 'n2', label: 'partition B' },
        { from: 'hash', to: 'n3', label: 'partition C' },
      ],
    },
  },
  {
    id: 'message_queue',
    type: 'queue',
    name: 'Message Queue & Event Stream (Kafka / RabbitMQ)',
    category: 'Messaging & Reliability',
    iconName: 'MessageSquare',
    illustrationKey: 'message_queue',
    oneLiner: 'A buffer that temporarily stores tasks and events so systems can process work asynchronously.',
    simpleExplanation:
      'Imagine ordering food at a restaurant: you get a ticket, and the kitchen prepares it while the cashier immediately takes the next customer. A Message Queue decouples fast producers (like your checkout button) from slower consumers (like payment processing or sending email receipts).',
    systemRole:
      'The message queue is the system\'s shock absorber and temporal decoupler — it allows high-speed producers to operate at their natural throughput without being throttled by slower downstream consumers. It also provides replay, fan-out, and guaranteed delivery semantics that make distributed workflows resilient to partial failures.',
    connections: [
      { to: 'App Server', description: 'App servers publish events to the queue immediately after processing a user request.' },
      { to: 'Worker', description: 'Background workers subscribe to queue topics and consume tasks at their own rate.' },
      { to: 'NoSQL Database', description: 'Consumers write processed results into NoSQL stores for high-throughput event persistence.' },
    ],
    howItWorksSteps: [
      'Producer (App Server) pushes an event: "OrderPlaced #9842" to the queue in < 5ms.',
      'The queue safely stores the message on an append-only log disk.',
      'Consumer Workers pull messages at their own sustainable speed.',
      'Worker finishes processing, confirms completion (ACK), and the message is committed.',
    ],
    keyHyperparameters: [
      { name: 'Queue Capacity / Retention', description: 'How many messages or hours of data the queue can hold before dropping.', typicalValues: '7 days retention' },
      { name: 'Consumer Draining Rate', description: 'Aggregate messages per second consumed by worker pool.', typicalValues: '1,000 – 100,000 msg/sec' },
      { name: 'Backlog Depth', description: 'Current count of unconsumed pending messages waiting in line.', typicalValues: '0 (ideal) to 500,000' },
    ],
    whenToUse: [
      'Async background jobs: image resizing, video encoding, email notifications, invoice generation.',
      'Traffic peak smoothing: absorbing huge bursts of requests without crashing downstream systems.',
    ],
    whenNotToUse: [
      'Synchronous request-response flows where the user is waiting on the screen for the immediate result.',
    ],
    realWorldExample: {
      company: 'LinkedIn & Uber (Apache Kafka)',
      architectureTitle: 'Real-Time Event Streaming Bus',
      description: 'Uber uses Apache Kafka to ingest trillions of location updates, fare calculations, and ride events daily across microservices.',
    },
    symbolDiagramText: 'Checkout API ──(Push Event in 2ms)──▶ [ KAFKA QUEUE (Buffer) ] ──▶ Worker 1 (Charge Card)\n                                                                 └──▶ Worker 2 (Send Email)',
    exampleArchitecture: {
      nodes: [
        { id: 'app', label: 'App Server', x: 50, y: 100, icon: 'monitor' },
        { id: 'queue', label: 'Kafka / Queue', x: 220, y: 100, highlight: true, icon: 'mail' },
        { id: 'w1', label: 'Worker: Payments', x: 400, y: 60, icon: 'settings' },
        { id: 'w2', label: 'Worker: Emails', x: 400, y: 140, icon: 'settings' },
      ],
      edges: [
        { from: 'app', to: 'queue', label: 'publish event' },
        { from: 'queue', to: 'w1', label: 'consume' },
        { from: 'queue', to: 'w2', label: 'fan-out' },
      ],
    },
  },
  {
    id: 'object_storage',
    type: 'storage',
    name: 'Object Storage (AWS S3 / Blob Store)',
    category: 'Storage & Caching',
    iconName: 'Archive',
    illustrationKey: 'object_storage',
    oneLiner: 'Virtually infinite, cost-effective storage for unstructured files like images, videos, and backups.',
    simpleExplanation:
      'Databases are meant for text and numbers, not 500MB video files or high-res photos. Object Storage stores files as "objects" identified by a simple URL, offering 99.999999999% durability at extremely low cost.',
    systemRole:
      'Object storage provides the blob persistence layer of the system — it offloads all binary, unstructured data (media, datasets, logs, backups) from both relational databases and file systems into infinitely scalable, infinitely durable cold storage. The relational database only stores a URL string reference, keeping database rows lean.',
    connections: [
      { to: 'CDN', description: 'CDN pulls assets directly from object storage and caches them at edge PoPs globally.' },
      { to: 'App Server', description: 'App servers generate presigned upload URLs so clients upload directly to S3, bypassing the server.' },
      { to: 'Worker', description: 'Background workers process objects (transcode videos, resize images) that were uploaded to storage.' },
    ],
    howItWorksSteps: [
      'Client uploads file directly to Object Storage via a presigned URL.',
      'Object Storage shards and replicates the file across multiple physical data centers.',
      'Returns a permanent URL (e.g. https://bucket.s3.amazonaws.com/profile.png).',
      'The URL is saved as a simple string in the relational database.',
    ],
    keyHyperparameters: [
      { name: 'Durability', description: 'Probability that stored data will not be lost over a year.', typicalValues: '99.999999999% (11 9s)' },
      { name: 'Storage Tiering', description: 'Standard (instant access) vs Glacier (cold backup storage).', typicalValues: 'Standard / Intelligent-Tiering' },
    ],
    whenToUse: [
      'User-uploaded content: images, videos, PDFs, audio files, documents.',
      'Big data lake files, machine learning training datasets, and automated system backups.',
    ],
    whenNotToUse: [
      'Relational transactional tables or frequently modified random byte ranges (objects are immutable).',
    ],
    realWorldExample: {
      company: 'Instagram & YouTube',
      architectureTitle: 'Petabyte-Scale Media Vault',
      description: 'Instagram stores billions of photos and reels in object storage, served through edge CDNs to millions of daily users.',
    },
    symbolDiagramText: 'Client Upload ──▶ [ AWS S3 OBJECT STORE ] ──▶ CDN Edge ──▶ Served to Viewers\n      │\n      └──(Save URL only)──▶ [ SQL Database: { id: 1, avatarUrl: "s3://.../img.jpg" } ]',
    exampleArchitecture: {
      nodes: [
        { id: 'client', label: 'Client', x: 50, y: 100, icon: 'user' },
        { id: 's3', label: 'Object Storage', x: 220, y: 100, highlight: true, icon: 'hardDrive' },
        { id: 'cdn', label: 'CDN Edge', x: 400, y: 60, icon: 'zap' },
        { id: 'db', label: 'SQL DB (URL ref)', x: 400, y: 160, icon: 'clipboard' },
      ],
      edges: [
        { from: 'client', to: 's3', label: 'presigned upload' },
        { from: 's3', to: 'cdn', label: 'serve via CDN' },
        { from: 's3', to: 'db', label: 'save URL string', dashed: true },
      ],
    },
  },
  {
    id: 'worker',
    type: 'worker',
    name: 'Background Worker / Microservice',
    category: 'Compute & Logic',
    iconName: 'Cpu',
    illustrationKey: 'worker',
    oneLiner: 'Background processing units that consume tasks from queues and perform heavy computations.',
    simpleExplanation:
      'When an operation takes 10 seconds (like generating a PDF receipt or compressing a 4K video), you never run it on your web server while the user waits. You push it to a queue, and a dedicated Background Worker picks it up and finishes it silently.',
    systemRole:
      'Background workers decouple heavy, long-running operations from the synchronous user request path, keeping web server latency consistently under 200ms. They form the async processing backbone of the system, handling everything from media transcoding to payment reconciliation and machine learning inference.',
    connections: [
      { to: 'Message Queue', description: 'Workers continuously poll or stream tasks from Kafka/RabbitMQ topics.' },
      { to: 'Object Storage', description: 'Workers read source files (e.g. raw video) and write processed outputs back to object storage.' },
      { to: 'SQL Database', description: 'Workers update job status records in the database on task completion or failure.' },
    ],
    howItWorksSteps: [
      'Worker continuously polls or streams events from the message queue.',
      'Executes CPU-intensive, long-running, or third-party API tasks.',
      'Updates the database when completed and optionally sends a notification to the user.',
    ],
    keyHyperparameters: [
      { name: 'Worker Concurrency', description: 'Number of parallel threads/processes per worker node.', typicalValues: '4 – 32 workers' },
      { name: 'Retry Policy', description: 'Exponential backoff strategy when an external third-party API fails.', typicalValues: '3 retries with jitter' },
    ],
    whenToUse: [
      'Heavy operations: PDF rendering, credit card processing, batch data indexing, video transcoding.',
    ],
    whenNotToUse: [
      'Fast synchronous web requests (< 100ms) that the user needs immediately on screen.',
    ],
    realWorldExample: {
      company: 'Airbnb',
      architectureTitle: 'Asynchronous Booking Confirmation Pipeline',
      description: 'Airbnb uses background workers to calculate host payouts, generate travel itineraries, and sync calendar availability.',
    },
    symbolDiagramText: 'Message Queue ──▶ [ BACKGROUND WORKER POOL ] ──▶ Call Bank API ──▶ Write Invoice to S3',
    exampleArchitecture: {
      nodes: [
        { id: 'queue', label: 'Message Queue', x: 50, y: 100, icon: 'mail' },
        { id: 'worker', label: 'Worker Pool', x: 220, y: 100, highlight: true, icon: 'settings' },
        { id: 's3', label: 'Object Storage', x: 400, y: 55, icon: 'hardDrive' },
        { id: 'db', label: 'SQL Database', x: 400, y: 145, icon: 'database' },
      ],
      edges: [
        { from: 'queue', to: 'worker', label: 'consume task' },
        { from: 'worker', to: 's3', label: 'write output' },
        { from: 'worker', to: 'db', label: 'update status' },
      ],
    },
  },
  {
    id: 'rate_limiter',
    type: 'rate_limiter',
    name: 'Rate Limiter / WAF (Firewall)',
    category: 'Messaging & Reliability',
    iconName: 'Radio',
    illustrationKey: 'rate_limiter',
    oneLiner: 'Protective shield that restricts request frequency to prevent abuse, bots, and server crashes.',
    simpleExplanation:
      'If a malicious bot tries to submit a login form 10,000 times a second or scrape your catalog, the Rate Limiter counts their requests and blocks them with HTTP 429 "Too Many Requests". This protects your servers from falling over.',
    systemRole:
      'The Rate Limiter is the system\'s abuse prevention layer — it enforces fair usage policies and protects every downstream component from being overwhelmed by a single misbehaving client. It operates at the edge with sub-millisecond latency using in-memory counters, ensuring malicious traffic never reaches application servers or databases.',
    connections: [
      { to: 'API Gateway', description: 'Often co-located with or embedded directly inside the API Gateway logic.' },
      { to: 'Cache', description: 'Reads and atomically decrements token bucket counters stored in Redis for speed.' },
      { to: 'App Server', description: 'Approved requests pass through to app servers; rejected requests return 429 immediately.' },
    ],
    howItWorksSteps: [
      'Incoming request arrives with client IP or User ID token.',
      'Rate limiter checks counter in fast in-memory Redis using Token Bucket or Leaky Bucket algorithm.',
      'If tokens remain: decrements token and allows request to proceed to application.',
      'If bucket is empty: rejects request immediately with HTTP 429 in < 1ms.',
    ],
    keyHyperparameters: [
      { name: 'Algorithm', description: 'Mathematical rate limiting algorithm.', typicalValues: 'Token Bucket / Sliding Window' },
      { name: 'Limit Threshold', description: 'Max allowed requests per time window.', typicalValues: '60 requests / minute' },
    ],
    whenToUse: [
      'Protecting login endpoints from brute-force password guessing.',
      'Protecting costly third-party API integrations (e.g. OpenAI calls, SMS verification APIs).',
      'Preventing web scraping and accidental client infinite loops.',
    ],
    whenNotToUse: [
      'Internal communication between trusted high-throughput microservices inside the same VPC.',
    ],
    realWorldExample: {
      company: 'GitHub & Twitter APIs',
      architectureTitle: 'Developer Tier Rate Limiting',
      description: 'GitHub enforces 5,000 requests per hour for authenticated API tokens and 60 requests per hour for anonymous users.',
    },
    symbolDiagramText: 'Client Requests ──▶ [ RATE LIMITER ] ──┬──(Under Limit)──▶ Backend Servers\n                                      └──(Exceeded)──▶ HTTP 429 "Too Many Requests"',
    exampleArchitecture: {
      nodes: [
        { id: 'client', label: 'Client / Bot', x: 50, y: 100, icon: 'user' },
        { id: 'rl', label: 'Rate Limiter', x: 220, y: 100, highlight: true, icon: 'shield' },
        { id: 'redis', label: 'Redis (counters)', x: 220, y: 195, icon: 'zap' },
        { id: 'app', label: 'App Server', x: 400, y: 60, icon: 'monitor' },
        { id: 'reject', label: 'HTTP 429', x: 400, y: 155, icon: 'ban' },
      ],
      edges: [
        { from: 'client', to: 'rl', label: 'request' },
        { from: 'rl', to: 'redis', label: 'check bucket', dashed: true },
        { from: 'rl', to: 'app', label: 'allow (<limit)' },
        { from: 'rl', to: 'reject', label: 'block (>limit)' },
      ],
    },
  },
];

import { NodeType } from '../engine/types';

export interface ComponentInfo {
  id: string;
  type: NodeType | 'dns' | 'storage' | 'microservice';
  name: string;
  category: 'Network & Ingress' | 'Compute & Logic' | 'Storage & Caching' | 'Messaging & Reliability';
  iconName: string;
  oneLiner: string;
  simpleExplanation: string;
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
}

export const COMPONENTS_DATA: ComponentInfo[] = [
  {
    id: 'dns',
    type: 'dns',
    name: 'DNS (Domain Name System)',
    category: 'Network & Ingress',
    iconName: 'Network',
    oneLiner: 'The phonebook of the internet that maps human domain names to server IP addresses.',
    simpleExplanation:
      'When you type "amazon.com" into your browser, your computer doesn\'t know where that is. DNS looks up the domain name and returns the exact IP address of the closest server. It also routes users to the nearest data center based on their geography (Geo-DNS).',
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
  },
  {
    id: 'cdn',
    type: 'cdn',
    name: 'CDN (Content Delivery Network)',
    category: 'Network & Ingress',
    iconName: 'Globe',
    oneLiner: 'A global network of edge servers that cache and serve content close to the user.',
    simpleExplanation:
      'Instead of every user across the globe fetching videos, images, and HTML from a single server in Virginia, a CDN keeps a copy in hundreds of cities worldwide. Users in Tokyo get content from Tokyo; users in Delhi get it from Delhi.',
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
  },
  {
    id: 'load_balancer',
    type: 'load_balancer',
    name: 'Load Balancer (L4 / L7)',
    category: 'Network & Ingress',
    iconName: 'Layers',
    oneLiner: 'A traffic cop that distributes incoming requests evenly across healthy backend servers.',
    simpleExplanation:
      'If you have 10 servers and 100,000 users, you don\'t want all 100,000 hitting Server #1 while the other 9 sit idle. The Load Balancer evenly distributes the load so no single server gets overwhelmed. If a server crashes, the load balancer automatically stops sending traffic to it.',
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
  },
  {
    id: 'api_gateway',
    type: 'rate_limiter',
    name: 'API Gateway & Rate Limiter',
    category: 'Network & Ingress',
    iconName: 'Shield',
    oneLiner: 'The single front door for all clients that handles authentication, routing, and rate limiting.',
    simpleExplanation:
      'Instead of mobile apps calling 20 different microservices directly, they call one API Gateway. The Gateway verifies user login tokens, blocks spam/DDoS bots, routes requests to the right service, and collects analytics.',
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
  },
  {
    id: 'app_server',
    type: 'service',
    name: 'Application Server (Compute)',
    category: 'Compute & Logic',
    iconName: 'Server',
    oneLiner: 'The brain of the system that executes business logic, calculations, and orchestrations.',
    simpleExplanation:
      'The App Server receives user requests, executes your code (processing payments, computing recommendations, validating forms), reads and writes data to databases, and returns responses. You scale it by adding more replicas (horizontal scaling).',
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
  },
  {
    id: 'cache',
    type: 'cache',
    name: 'In-Memory Cache (Redis / Memcached)',
    category: 'Storage & Caching',
    iconName: 'HardDrive',
    oneLiner: 'Lightning-fast in-memory storage for frequently accessed data to relieve the database.',
    simpleExplanation:
      'Databases write to disk, which takes 5–50 milliseconds. An in-memory cache stores hot data in RAM, returning it in under 1 millisecond. By storing popular data (product details, user sessions) in cache, 90%+ of queries never need to touch the slow database.',
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
  },
  {
    id: 'sql_db',
    type: 'database',
    name: 'Relational Database (SQL)',
    category: 'Storage & Caching',
    iconName: 'Database',
    oneLiner: 'ACID-compliant structured storage for mission-critical transactional data.',
    simpleExplanation:
      'When accuracy and transactions matter—like taking money from Account A and adding it to Account B—you need a relational database (like PostgreSQL or MySQL). It guarantees data consistency through tables, foreign keys, and strict transactions.',
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
  },
  {
    id: 'nosql_db',
    type: 'database',
    name: 'NoSQL Database (Key-Value / Document / Wide-Column)',
    category: 'Storage & Caching',
    iconName: 'Cpu',
    oneLiner: 'Horizontally scalable distributed database designed for massive write volume and flexible schemas.',
    simpleExplanation:
      'Traditional SQL databases struggle when scaled across 50 separate servers. NoSQL databases (like Cassandra, DynamoDB, MongoDB) are built from day one to partition data across hundreds of machines, providing fast reads and writes at massive scale.',
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
  },
  {
    id: 'message_queue',
    type: 'queue',
    name: 'Message Queue & Event Stream (Kafka / RabbitMQ)',
    category: 'Messaging & Reliability',
    iconName: 'MessageSquare',
    oneLiner: 'A buffer that temporarily stores tasks and events so systems can process work asynchronously.',
    simpleExplanation:
      'Imagine ordering food at a restaurant: you get a ticket, and the kitchen prepares it while the cashier immediately takes the next customer. A Message Queue decouples fast producers (like your checkout button) from slower consumers (like payment processing or sending email receipts).',
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
  },
  {
    id: 'object_storage',
    type: 'storage',
    name: 'Object Storage (AWS S3 / Blob Store)',
    category: 'Storage & Caching',
    iconName: 'Archive',
    oneLiner: 'Virtually infinite, cost-effective storage for unstructured files like images, videos, and backups.',
    simpleExplanation:
      'Databases are meant for text and numbers, not 500MB video files or high-res photos. Object Storage stores files as "objects" identified by a simple URL, offering 99.999999999% durability at extremely low cost.',
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
  },
  {
    id: 'worker',
    type: 'worker',
    name: 'Background Worker / Microservice',
    category: 'Compute & Logic',
    iconName: 'Cpu',
    oneLiner: 'Background processing units that consume tasks from queues and perform heavy computations.',
    simpleExplanation:
      'When an operation takes 10 seconds (like generating a PDF receipt or compressing a 4K video), you never run it on your web server while the user waits. You push it to a queue, and a dedicated Background Worker picks it up and finishes it silently.',
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
  },
  {
    id: 'rate_limiter',
    type: 'rate_limiter',
    name: 'Rate Limiter / WAF (Firewall)',
    category: 'Messaging & Reliability',
    iconName: 'Radio',
    oneLiner: 'Protective shield that restricts request frequency to prevent abuse, bots, and server crashes.',
    simpleExplanation:
      'If a malicious bot tries to submit a login form 10,000 times a second or scrape your catalog, the Rate Limiter counts their requests and blocks them with HTTP 429 "Too Many Requests". This protects your servers from falling over.',
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
  },
];

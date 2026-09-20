export interface ArchitectureTourStep {
  stepNumber: number;
  levelName: string;
  title: string;
  nodeIds: string[];
  oneLiner: string;
  explanation: string;
  underTheHood: string;
  bottleneckRisk: string;
  narrationText: string;
}

export interface ArchitectureTour {
  architectureId: string;
  title: string;
  overview: string;
  steps: ArchitectureTourStep[];
}

export const ARCHITECTURE_TOURS: Record<string, ArchitectureTour> = {
  'simple-app': {
    architectureId: 'simple-app',
    title: 'Level 1: Simple Web Application',
    overview: 'A classic 2-tier architecture with a monolithic app server and a single PostgreSQL database.',
    steps: [
      {
        stepNumber: 1,
        levelName: 'Level 1: Client Ingestion',
        title: 'User Browsers & Mobile Apps',
        nodeIds: ['client'],
        oneLiner: 'Direct HTTP traffic originating from client browsers and mobile apps.',
        explanation: 'Users send unbuffered HTTP requests directly over the public internet into the web host.',
        underTheHood: 'Every new user initiates a full TCP handshake and TLS negotiation directly against the server, with zero CDN edge offload.',
        bottleneckRisk: 'High internet latency for distant users and zero DDoS protection against sudden request floods.',
        narrationText: 'Level 1. Clients send direct HTTP requests over the internet. Without a CDN or edge buffer, every request travels the full network distance directly to your origin server.'
      },
      {
        stepNumber: 2,
        levelName: 'Level 2: Compute Monolith',
        title: 'Single Web Server Host',
        nodeIds: ['app_server'],
        oneLiner: 'One compute instance executing all business logic, routing, and database queries.',
        explanation: 'A monolithic Node.js, Python, or Ruby app parses the request, executes business logic, renders templates, and queries the database.',
        underTheHood: 'Runs on a single CPU machine with a fixed thread pool. As requests pile up, worker threads saturate, leading to queuing and high CPU usage.',
        bottleneckRisk: 'Single Point of Failure (SPOF). If this single server runs out of memory or crashes, the entire application goes completely offline.',
        narrationText: 'Level 2. The Monolithic Web Server handles all incoming traffic on a single machine. It executes routing, validation, and template rendering. If traffic surges past 2,500 requests per second, its CPU saturates and response times skyrocket.'
      },
      {
        stepNumber: 3,
        levelName: 'Level 3: Database Storage',
        title: 'Single PostgreSQL Database',
        nodeIds: ['postgres_db'],
        oneLiner: 'All reads and writes compete for single-disk I/O with no caching layer.',
        explanation: 'Every user click triggers disk reads and relational joins directly on the database.',
        underTheHood: 'With no caching, every read hits disk storage. Heavy table locks and connection limits cause thread exhaustion quickly.',
        bottleneckRisk: 'Database connection exhaustion. Once maximum client connections are reached, incoming queries are rejected, causing 500 server errors.',
        narrationText: 'Level 3. The PostgreSQL Database. Because there is no caching layer, every single request forces a disk read. When traffic spikes, database connections exhaust and the site fails completely.'
      }
    ]
  },

  'scaled-app': {
    architectureId: 'scaled-app',
    title: 'Level 2: Production 3-Tier Scaled App',
    overview: 'Production architecture featuring Edge CDN, Load Balancer, stateless app server cluster, and Redis in-memory cache.',
    steps: [
      {
        stepNumber: 1,
        levelName: 'Level 1: Global Edge Tier',
        title: 'Edge CDN & Static Asset Caching',
        nodeIds: ['client', 'cdn_edge'],
        oneLiner: 'Edge locations absorb 85% of static asset traffic close to the user.',
        explanation: 'Incoming requests first hit Cloudflare or CloudFront edge Points of Presence. Images, CSS, and JS bundles are served directly from cache in under 10 milliseconds.',
        underTheHood: 'Edge caches terminate TLS connections close to the user, performing DNS routing, DDoS filtering, and HTTP/3 multiplexing.',
        bottleneckRisk: 'Cache stampedes if TTLs expire simultaneously on un-warmed viral content.',
        narrationText: 'Level 1. The Edge CDN. Global edge servers intercept client traffic and serve static files in under 10 milliseconds. This absorbs 85% of total requests before they ever reach your servers.'
      },
      {
        stepNumber: 2,
        levelName: 'Level 2: Traffic Routing',
        title: 'Application Load Balancer (ALB)',
        nodeIds: ['load_balancer'],
        oneLiner: 'Distributes dynamic HTTP traffic evenly across backend application servers.',
        explanation: 'The load balancer acts as a reverse proxy, inspecting health checks and balancing dynamic API traffic across the compute pool.',
        underTheHood: 'Uses round-robin or least-connections algorithms. Performs SSL termination so backend servers only handle clear HTTP traffic.',
        bottleneckRisk: 'Misconfigured health check timeouts can prematurely mark healthy servers dead, causing cascading failures.',
        narrationText: 'Level 2. The Application Load Balancer. It acts as a smart reverse proxy, terminating SSL and distributing requests evenly across backend app servers so no single server gets overwhelmed.'
      },
      {
        stepNumber: 3,
        levelName: 'Level 3: Stateless Compute',
        title: 'Stateless App Server Cluster',
        nodeIds: ['app_cluster'],
        oneLiner: 'Horizontally scalable worker nodes with zero local session storage.',
        explanation: 'Because session state is kept in Redis, any app server can handle any user request. You can scale from 3 to 30 servers horizontally without downtime.',
        underTheHood: 'Stateless services handle business logic and interact with the cache before querying the database.',
        bottleneckRisk: 'Memory leaks or synchronous downstream blocking can cause worker thread exhaustion.',
        narrationText: 'Level 3. The Stateless App Server Cluster. Because servers do not store user sessions on local disk, you can scale them horizontally during peak hours to handle thousands of concurrent API calls.'
      },
      {
        stepNumber: 4,
        levelName: 'Level 4: In-Memory Caching',
        title: 'Redis In-Memory Cache',
        nodeIds: ['redis_cache'],
        oneLiner: 'Sub-millisecond RAM caching absorbing 80% of database read volume.',
        explanation: 'Hot user feeds, sessions, and catalog items are kept in RAM. Queries are served in 1 millisecond, preventing heavy SQL queries from touching disk.',
        underTheHood: 'Employs a Cache-Aside pattern with LRU eviction and atomic operations.',
        bottleneckRisk: 'Cache penetration or failure can unleash a thundering herd of queries onto the SQL database.',
        narrationText: 'Level 4. Redis In-Memory Cache. By keeping hot queries in fast RAM, Redis absorbs 80% of database read queries in under 1 millisecond, acting as a high-speed protective shield.'
      },
      {
        stepNumber: 5,
        levelName: 'Level 5: Transactional Database',
        title: 'PostgreSQL Primary Database',
        nodeIds: ['sql_primary'],
        oneLiner: 'Relational ACID storage dedicated exclusively to durable writes and cache misses.',
        explanation: 'With static files absorbed by the CDN and reads absorbed by Redis, the primary database handles only critical transactional writes.',
        underTheHood: 'Uses write-ahead logging (WAL) and connection pooling to ensure strict data consistency and durability.',
        bottleneckRisk: 'Slow unindexed joins and lock contention during bulk write operations.',
        narrationText: 'Level 5. The Database Tier. Because the CDN and Redis have absorbed the vast majority of traffic, the relational database only handles essential writes with guaranteed ACID durability.'
      }
    ]
  },

  'amazon': {
    architectureId: 'amazon',
    title: 'Level 3: Amazon E-Commerce Hyperscale',
    overview: 'Amazon-inspired microservices architecture with DynamoDB catalog, Redis cart cache, Kafka order pipeline, and Aurora DB.',
    steps: [
      {
        stepNumber: 1,
        levelName: 'Level 1: Global Edge Delivery',
        title: 'CloudFront CDN & Web Application Firewall',
        nodeIds: ['client', 'cloudfront_cdn'],
        oneLiner: 'Terabit-scale edge network filtering malicious traffic and caching product media.',
        explanation: 'Millions of shoppers connect to nearby AWS edge locations. Product images, thumbnails, and storefront bundles are served at wire speed.',
        underTheHood: 'Employs automated WAF rules to block scraper bots, terminate TLS 1.3, and route dynamic API calls over AWS private backbone cables.',
        bottleneckRisk: 'Cache invalidation latency across 400+ worldwide edge locations during flash sales.',
        narrationText: 'Level 1. Amazon CloudFront CDN and WAF. Global edge locations cache product media and filter out bot traffic before it reaches backend services.'
      },
      {
        stepNumber: 2,
        levelName: 'Level 2: API Gateway & Router',
        title: 'API Gateway & Rate Limiting',
        nodeIds: ['api_gateway'],
        oneLiner: 'Centralized token validation, rate-limiting, and request routing to microservices.',
        explanation: 'The gateway validates user JWT tokens, enforces customer throttling limits, and dispatches requests to dedicated bounded microservices.',
        underTheHood: 'Translates external REST requests into internal gRPC calls and handles distributed tracing headers for observability.',
        bottleneckRisk: 'Token validation latency spikes if authentication services experience backpressure.',
        narrationText: 'Level 2. The API Gateway. It authenticates shopper credentials, enforces fair-use rate limits, and routes incoming requests to dedicated microservices.'
      },
      {
        stepNumber: 3,
        levelName: 'Level 3: Decoupled Microservices',
        title: 'Domain Microservices (Catalog, Cart, Orders)',
        nodeIds: ['product_service', 'cart_service', 'order_service'],
        oneLiner: 'Independent services scaled autonomously according to workload characteristics.',
        explanation: 'Browsing products, updating shopping carts, and placing checkout orders are handled by completely separate services so a surge in checkout does not impact product browsing.',
        underTheHood: 'Stateless Docker containers on AWS ECS/EKS with independent auto-scaling policies based on CPU and request latency.',
        bottleneckRisk: 'Inter-service cascade latency if synchronous dependencies block on downstream calls.',
        narrationText: 'Level 3. Domain Microservices. Amazon decouples browsing, shopping carts, and order checkout into separate services. If checkout is under heavy load, shoppers can still browse products seamlessly.'
      },
      {
        stepNumber: 4,
        levelName: 'Level 4: High-Speed Queuing & Caching',
        title: 'Kafka Order Stream & Redis Cart Cache',
        nodeIds: ['redis_cart', 'kafka_orders'],
        oneLiner: 'Sub-millisecond cart RAM cache and persistent streaming log for zero lost orders.',
        explanation: 'When a user clicks Place Order, the Order Service does not process the credit card synchronously; it writes the order into an Apache Kafka topic in 3 milliseconds and confirms receipt immediately.',
        underTheHood: 'Kafka partitions order events across cluster brokers with disk-persisted replicas, absorbing huge checkout surges like Prime Day.',
        bottleneckRisk: 'Consumer lag building up in Kafka partitions if downstream payment workers slow down.',
        narrationText: 'Level 4. Redis Cart Cache and Kafka Event Streaming. When you click Buy Now, the order is immediately written into a durable Kafka stream in 3 milliseconds, guaranteeing zero lost orders.'
      },
      {
        stepNumber: 5,
        levelName: 'Level 5: Polyglot Persistence',
        title: 'DynamoDB Product Store & Aurora Inventory',
        nodeIds: ['dynamodb_catalog', 'aurora_inventory', 'payment_worker'],
        oneLiner: 'Single-digit millisecond NoSQL for catalog scale, ACID Aurora for inventory truth.',
        explanation: 'NoSQL DynamoDB handles infinite product lookups with single-digit millisecond latency. Aurora PostgreSQL maintains transactional inventory counts, while asynchronous workers charge cards.',
        underTheHood: 'DynamoDB uses SSD hash partitions. Asynchronous workers consume Kafka records in batches to process payments without stalling the checkout UI.',
        bottleneckRisk: 'Hot partition keys in DynamoDB on trending deals or inventory row locking in Aurora.',
        narrationText: 'Level 5. Polyglot Storage. DynamoDB delivers instant single-digit millisecond product details at massive scale, while Aurora handles strict inventory tracking and async workers process payments in the background.'
      }
    ]
  },

  'netflix': {
    architectureId: 'netflix',
    title: 'Level 4: Netflix Video Streaming',
    overview: 'Netflix-inspired streaming architecture with Open Connect CDN, Zuul gateway, Cassandra cluster, and S3 video segment store.',
    steps: [
      {
        stepNumber: 1,
        levelName: 'Level 1: Client Devices',
        title: 'Smart TVs, Browsers & Mobile Viewers',
        nodeIds: ['client'],
        oneLiner: 'Millions of client video players requesting 4-second video chunk segments.',
        explanation: 'Client video players request encrypted video chunks every 4 seconds, adapting bitrate on-the-fly based on network bandwidth.',
        underTheHood: 'Adaptive Bitrate Streaming (HLS/DASH) selects chunk resolution dynamically from 480p to 4K Dolby Vision.',
        bottleneckRisk: 'Bandwidth throttling or high latency causing video buffering and user drop-off.',
        narrationText: 'Level 1. The Viewers. Video players on smart TVs and phones request 4-second video segments continuously, adjusting video quality dynamically to match internet speed.'
      },
      {
        stepNumber: 2,
        levelName: 'Level 2: Open Connect CDN',
        title: 'Custom ISP Edge Cache Appliances',
        nodeIds: ['open_connect_cdn'],
        oneLiner: 'Custom storage appliances deployed inside internet service provider networks worldwide.',
        explanation: 'Instead of streaming videos across the global internet, Netflix installs custom storage hardware directly inside local ISPs (like Comcast, Airtel, and Vodafone). 96% of video chunks are delivered locally.',
        underTheHood: 'Solid-state storage servers capable of streaming over 100 Gigabits per second per appliance directly over ISP local fiber.',
        bottleneckRisk: 'Cache misses on rare, long-tail content requiring origin fallback to Amazon S3.',
        narrationText: 'Level 2. Netflix Open Connect CDN. Netflix deploys custom storage appliances directly inside local internet providers worldwide. Over 96% of video streaming comes straight from your local ISP, avoiding long-distance internet lag.'
      },
      {
        stepNumber: 3,
        levelName: 'Level 3: Zuul Edge Gateway',
        title: 'Intelligent Routing & Security Gateway',
        nodeIds: ['api_gateway'],
        oneLiner: 'Filters, decrypts, and routes all non-video API traffic from all client devices.',
        explanation: 'Handles login, profile switching, viewing history sync, search queries, and recommendations routing.',
        underTheHood: 'Non-blocking async Netty router supporting canary deployments, device-specific payload transformation, and crypto token verification.',
        bottleneckRisk: 'Sudden regional outages causing gateway connection limits to saturate.',
        narrationText: 'Level 3. Zuul API Gateway. While video streams come from local CDN appliances, all account logins, search queries, and recommendations pass through the Zuul edge gateway.'
      },
      {
        stepNumber: 4,
        levelName: 'Level 4: Playback Services & Telemetry',
        title: 'Playback Entitlement & Kafka Telemetry',
        nodeIds: ['playback_service', 'kafka_telemetry'],
        oneLiner: 'Verifies active subscriptions, DRM decryption keys, and ingests live playback metrics.',
        explanation: 'Validates that the user has an active plan, dispenses DRM decryption keys, and logs streaming quality telemetry every second.',
        underTheHood: 'Kafka ingests billions of real-time client telemetry events per day to detect ISP congestion and optimize routing algorithms.',
        bottleneckRisk: 'DRM key server latency causing playback startup delay.',
        narrationText: 'Level 4. Playback Entitlement and Telemetry. This tier verifies your subscription, delivers DRM decryption keys to start the video, and streams live playback quality data into Kafka.'
      },
      {
        stepNumber: 5,
        levelName: 'Level 5: Distributed Storage Tier',
        title: 'Apache Cassandra & AWS S3 Object Storage',
        nodeIds: ['cassandra_db', 's3_video_store'],
        oneLiner: 'Master video files stored on S3; user profiles and viewing history stored on Cassandra.',
        explanation: 'Master video encodes across all bitrates reside durably in AWS S3 buckets. User bookmarks, watch history, and bookmarks are stored across a global multi-region Cassandra cluster.',
        underTheHood: 'Cassandra offers linear write scalability across multiple AWS regions with tunable consistency and zero single points of failure.',
        bottleneckRisk: 'Cross-region replication lag during network partition events.',
        narrationText: 'Level 5. Distributed Storage. Master 4K video segments are stored durably in Amazon S3, while millions of user bookmarks and watch history are synchronized in real time using a global Cassandra cluster.'
      }
    ]
  },

  'tatkal': {
    architectureId: 'tatkal',
    title: 'Level 5: IRCTC Tatkal (10:00 AM Rush)',
    overview: 'IRCTC-inspired ticket booking under extreme 10:00:00 AM rush. High concurrency, seat cache lock contention, and payment gateways.',
    steps: [
      {
        stepNumber: 1,
        levelName: 'Level 1: 10:00:00 AM Rush',
        title: 'Millions of Simultaneous Booking Requests',
        nodeIds: ['client', 'cdn'],
        oneLiner: 'Over 2 million concurrent passengers click Book precisely at 10:00:00 AM.',
        explanation: 'Traffic jumps from baseline to 500,000 requests per second in under 5 seconds. The CDN absorbs static forms, captchas, and CSS, but dynamic booking requests must proceed to the backend.',
        underTheHood: 'Huge concurrent TCP connections flood edge nodes. Without a virtual waiting queue, backend infrastructure would face an instantaneous denial of service.',
        bottleneckRisk: 'TCP connection starvation and bot scripts executing sub-millisecond automated form submits.',
        narrationText: 'Level 1. The 10 AM Rush. At exactly 10:00:00 AM, millions of passengers click Book simultaneously. Traffic surges by 50 times in five seconds. Edge CDNs cache static assets, but booking transactions head straight for the backend.'
      },
      {
        stepNumber: 2,
        levelName: 'Level 2: Traffic Surge Protection',
        title: 'Layer 7 Load Balancer & Virtual Waiting Room',
        nodeIds: ['lb', 'waiting_room'],
        oneLiner: 'Token bucket rate-limiting and virtual waiting room to prevent server collapse.',
        explanation: 'The load balancer inspects traffic and routes excess users into a tokenized virtual waiting room, ensuring only manageable batches of requests reach the booking application servers.',
        underTheHood: 'Enforces cryptographically signed queue tokens. Drop policies shed rogue bot traffic and maintain predictable backend response times.',
        bottleneckRisk: 'If the waiting room is disabled, backend servers instantly crash under a massive connection wave.',
        narrationText: 'Level 2. Load Balancing and Virtual Waiting Room. To prevent total server crash, the system places excess passengers in a virtual waiting room, releasing them in controlled batches into the booking engine.'
      },
      {
        stepNumber: 3,
        levelName: 'Level 3: Core Booking Engine',
        title: 'Stateless Booking Application Servers',
        nodeIds: ['booking_service'],
        oneLiner: 'Validates passenger details, seat quotas, concessions, and coach availability.',
        explanation: 'Stateless compute instances handle passenger name record (PNR) generation, quota validation (Tatkal vs General), and coordinate seat lock requests.',
        underTheHood: 'Clustered application servers connected to Redis via high-performance connection pools to minimize lock hold times.',
        bottleneckRisk: 'CPU exhaustion if complex train schedule algorithms are recalculated synchronously per request.',
        narrationText: 'Level 3. Core Booking Engine. This application cluster validates passenger details, calculates fares, and requests temporary seat reservations before taking you to the payment gateway.'
      },
      {
        stepNumber: 4,
        levelName: 'Level 4: In-Memory Seat Locks',
        title: 'Redis Distributed Seat Cache & Lock',
        nodeIds: ['redis_seats'],
        oneLiner: 'Sub-millisecond inventory reservation with distributed locks and automatic expiration.',
        explanation: 'When a passenger enters the booking flow, their selected seat is locked in Redis for 8 minutes using atomic operations. If payment is not completed within 8 minutes, the lock expires and the seat returns to the open pool.',
        underTheHood: 'Uses Redis Redlock algorithm or single-threaded Redis Lua scripts to prevent double-booking of the exact same train berth.',
        bottleneckRisk: 'Extreme lock contention when thousands of users compete for the last remaining 10 Tatkal seats on a popular train.',
        narrationText: 'Level 4. Redis Seat Locks. To prevent two people from booking the same berth, the seat is locked in fast Redis memory for 8 minutes. If payment succeeds, the ticket is confirmed; if not, the lock expires automatically.'
      },
      {
        stepNumber: 5,
        levelName: 'Level 5: Master Ledger & Payments',
        title: 'Oracle RAC Database & Payment Gateways',
        nodeIds: ['oracle_db', 'payment_gateway'],
        oneLiner: 'Strict ACID relational ledger for final PNR issuance and bank settlement.',
        explanation: 'Once bank payment confirmation arrives from external banking gateways, the final PNR is committed to the relational database cluster.',
        underTheHood: 'Active-active relational database cluster maintaining multi-version concurrency control (MVCC) and audit logs.',
        bottleneckRisk: 'Third-party payment gateway timeouts or database row locking during final commit spikes.',
        narrationText: 'Level 5. Master Database and Payment Gateways. Once the bank confirms payment, the booking is permanently written to the master database and your confirmed PNR ticket is generated.'
      }
    ]
  }
};

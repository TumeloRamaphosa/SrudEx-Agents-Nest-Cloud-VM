# 🏢 Rwanda Data Centre Landscape

> Current infrastructure, capacity, providers, and opportunities

---

## Current Data Centres

### 1. Rwanda Data Centre (RDC) — Kigali
- **Operator:** Government / Private partnership
- **Location:** Kigali
- **Tier:** Tier II (estimated)
- **Capacity:** Small — primarily government colocation
- **Connectivity:** National fibre backbone, RINEX peering
- **Status:** Operational but limited commercial capacity

### 2. Liquid Telecom / Cassava Data Centre
- **Operator:** Liquid Intelligent Technologies (formerly Liquid Telecom)
- **Pan-African presence:** 13 countries, 60,000km fibre network
- **Rwanda presence:** Fibre connectivity, cloud services
- **Data centre:** Regional hub in Nairobi (not Kigali)
- **Relevance:** Potential connectivity partner for our data centre

### 3. Kigali Innovation City (KIC) — Planned
- **Status:** Under development
- **Focus:** Tech park with data centre capacity
- **Incentives:** Tax breaks for tech companies
- **Target:** Startup and innovation ecosystem hub
- **Relevance:** Potential location for our regional AI hub

---

## Connectivity Infrastructure

### Terrestrial Fibre
- **National fibre backbone:** 3,000+ km (government-sponsored)
- **4G LTE coverage:** 97%+ of population (2024)
- **RINEX** (Rwanda Internet Exchange): ~15 connected members
- **ISPs:** MTN Rwanda, Airtel Rwanda, local providers

### Submarine Cable Access (via terrestrial links)
Rwanda is landlocked — international connectivity is via terrestrial fibre to:

| Cable System | Landing Point | Capacity | Rwanda Access |
|-------------|---------------|----------|---------------|
| **EASSy** | Mtunzini, SA / Dar es Salaam | 10+ Tbps | Via terrestrial fibre |
| **SEACOM** | Mombasa, Kenya / Dar es Salaam | 12 Tbps | Via terrestrial fibre |
| **Equiano (Google)** | Swakopmund, Namibia / Cape Town | 144 Tbps | Via terrestrial fibre |
| **2Africa (Meta)** | Multiple African landings | 180 Tbps | Via terrestrial fibre |
| **Djibouti Africa Regional Express (DARE)** | Multiple | — | Via terrestrial fibre |

### Key Insight
Rwanda's connectivity is **good for a landlocked country** but adds ~10-20ms latency vs coastal locations. Fine for AI inference and agent workloads. Not ideal for latency-sensitive gaming (competitive FPS).

---

## Power Infrastructure

| Source | Capacity | Status |
|--------|----------|--------|
| Hydro | ~200 MW | Operational |
| Methane (Lake Kivu) | ~80 MW extracted / **700 MW potential** | Underutilised |
| Peat | ~100 MW | Operational |
| Solar | ~15 MW | Growing |
| **National Grid Total** | **~470 MW** | Strained at peak |

### Lake Kivu Methane — The Game Changer
- **700 MW** untapped potential
- Only **80 MW** currently extracted
- Carbon-neutral (methane would escape naturally)
- Can power a **dedicated 5-10 MW AI data centre** independently of national grid
- Cheaper and more reliable than diesel backup

---

## Service Providers

| Provider | Service | Relevance |
|----------|---------|-----------|
| **MTN Rwanda** | Mobile, fibre, data | Connectivity partner, edge nodes |
| **Airtel Rwanda** | Mobile, fibre, data | Connectivity partner |
| **Liquid Intelligent Tech** | Fibre, cloud, data centres | Fibre backbone, cloud services |
| **RINEX** | Internet exchange | Local peering, reduced latency |
| **RURA** | Regulatory | Licensing, compliance |
| **RISA** | Government ICT | Infrastructure partnership |
| **REG** (Rwanda Energy Group) | Power | Grid connection, methane licensing |

---

## Opportunities for Studex

### 1. Regional AI Data Centre (5-10 MW)
- **Location:** Bugesha SEZ or Kigali Innovation City
- **Power:** Dedicated methane mini-grid
- **Capacity:** 5-10 MW — suitable for AI inference, agent hosting, edge compute
- **Services:** VM hosting, agent orchestration, AI inference, cloud storage

### 2. Edge Compute Nodes
- **Locations:** Kigali, secondary cities
- **Purpose:** Low-latency agent execution, Arcade gaming servers
- **Model:** Distributed edge nodes connected to central data centre

### 3. Colocation Partnership
- **Partner:** Liquid Telecom or RDC
- **Model:** Lease rack space in existing facility
- **Timeline:** 3-6 months (faster than building)
- **Cost:** ~$1,000-3,000/rack/month

---

## Cost Estimates

| Option | Capex | Timeline | Risk |
|--------|-------|----------|------|
| **Colocation** (lease racks) | $50K-100K | 3-6 months | Low |
| **Edge node** (containerised) | $200K-500K | 6-12 months | Medium |
| **Full data centre** (5-10 MW) | $5M-15M | 18-36 months | High |
| **Methane mini-grid** (dedicated) | $2M-5M | 12-24 months | Medium |

---

## Investment Structure

### Who Invests
| Investor Type | Examples | Role |
|--------------|----------|------|
| **DFIs** | IFC, AfDB, DEG | Project finance, concessional loans |
| **Strategic partners** | SVHQ/Chris, ART Engineering | Co-investment, technology |
| **Government** | RDB, MINICT | Land, incentives, tax breaks |
| **Private equity** | Family offices, impact funds | Growth capital |
| **Studex** | Studex Group | Operating partner, anchor tenant |

### Structure
```
Rwanda AI Data Centre SPV
├── DFI debt (60%) — 7-10 year terms
├── Strategic equity (25%) — SVHQ, ART, Pharmasyntez
├── Government incentives (10%) — land, tax holidays
└── Studex operating partner (5%) — management fee + upside
```

### Timeline
- **Months 1-3:** Feasibility study, partner commitments, RDB application
- **Months 3-6:** SPV formation, financing, site selection
- **Months 6-12:** Construction (colocation or edge node)
- **Months 12-18:** Phase 1 operational
- **Months 18-36:** Full build-out

---

## CTO Engagement

### Dark Factory (CTO)
- **Focus:** Technical architecture, VM provisioning, agent deployment
- **Data centre role:** Design the infrastructure, specify hardware, manage deployment
- **Open to:** Working with Liquid Telecom, RDC, equipment vendors

### Super Agents (CTO)
- **Focus:** Local delivery, enterprise sales, government contracts
- **Data centre role:** Manage local operations, customer onboarding, support
- **Open to:** Working with RDB, MINICT, local partners

### Both CTOs should engage:
- Liquid Telecom — fibre and colocation
- RDC — existing data centre operations
- RINEX — peering and connectivity
- REG — power and methane licensing
- Equipment vendors — Dell, HPE, Supermicro for hardware procurement

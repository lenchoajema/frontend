Priority
Task
Details
Proposed Schedule
Reason
Status
Comments
1
User Authentication & RBAC
Implement JWT-based authentication with role-based access control.
Week 1
Foundation for securing the platform.
Completed
Addition: Add rate limiting (e.g., Redis) to prevent brute-force attacks.
2
CI/CD Pipeline Setup
Set up automated pipelines (e.g., GitHub Actions/Jenkins) with linting, unit, and integration tests.
Week 1-2
Ensures code quality and controlled deployments.
Completed (Backend CI Added)
Addition: Add security scanning (npm audit, Snyk) & coverage badge upload.
3
Security Audits & Penetration Testing (NEW)
Perform OWASP Top 10 vulnerability scans and third-party security audits.
Week 2
Protect sensitive data (payment info, user credentials).
Not Started
Critical Addition: Ensure compliance before handling payments.
4
GDPR Compliance Tools
Implement data export, deletion, and cookie consent management.
Week 3 (Moved up)
Legal requirement for EU users and global trust.
Not Started
Reprioritized: Moved earlier to align with launch readiness.
5
Automated Testing Framework
Implement unit, integration, and end-to-end tests (Jest, Cypress).
Week 2
Reduce regressions and speed up development.
In Progress (Backend Jest + Supertest: 43 tests, ~69% lines)
Addition: Add Cypress E2E + load tests (k6/JMeter) + Mongo Memory Server for DB assertions.
6
Product Management APIs
Create APIs for product CRUD, filtering, sorting, and pagination.
Week 2
Core functionality for sellers and customers.
Completed
Addition: Add database indexing and query optimization.
7
Shopping Cart
Add, update, and remove items. Store cart data in Redis for performance.
Week 2
Essential for purchases.
Completed
Addition: Guest checkout optimization to reduce abandonment.
8
Performance Monitoring (NEW)
Integrate APM tools (New Relic, Datadog) for real-time insights.
Week 3
Proactively resolve API/database bottlenecks.
Not Started
Critical for Scalability: Add early to track performance trends.
Update: Logging & basic request tracing in place; next add OpenTelemetry exporter.
9
Order Management
Place orders, view history, and track statuses.
Week 3
Completes purchasing workflow.
Completed
Addition: Self-service returns portal for users.
10
Checkout Process
Build checkout with order summary, shipping, and payment options.
Week 4
Seamless purchasing experience.
Completed
Addition: Payment failure simulation & user-facing retry messaging (pending).
11
Payment Gateway Integration
Integrate Stripe and PayPal securely.
Week 5
Critical for transactions.
In Progress (Stripe intents + webhook + idempotency + structured error codes)
Addition: Add PayPal stub, map payment lifecycle to order timeline, PCI-DSS checklist.
12
API Gateway Setup (NEW)
Implement Kong/AWS API Gateway for microservices.
Week 5
Centralize auth, rate limiting, and routing.
Not Started
Architecture Addition: Prepares for microservices split.
Planned: Provide declarative Kong config & Docker compose service.
13
Two-Factor Authentication (2FA)
Add SMS/email-based 2FA for all users.
Week 6
Extra security layer.
Not Started
Addition: Use time-based OTP (e.g., Google Authenticator).
14
Seller Registration Approval
Admin approval after document verification.
Week 6
Platform integrity.
Not Started
Addition: Tax ID validation for sellers.
15
Fee Collection Method
Calculate fees based on seller subscription tiers.
Week 7
Revenue scalability.
Not Started
Addition: Integrate Stripe Billing for recurring payments.
Prereq: Need Seller plans model & Stripe product/price mapping.
16
Shipping API Integration (NEW)
Connect FedEx/DHL for real-time shipping rates.
Week 7
Accurate shipping cost calculations.
Not Started
Logistics Addition: Critical for global sellers.
Next: Abstract shipping provider interface before concrete integration.
17
Navbar & Footer
Role-based links and mobile responsiveness.
Week 8
Improved navigation.
Completed
Addition: Accessibility audit (WCAG 2.1 compliance).
18
Dynamic Sidebars
Role-specific admin/seller/customer dashboards.
Week 8
Enhanced UX.
Not Started
Addition: Include in-app notifications for updates.
Backend Support Needed: Notification model + WebSocket channel.
19
SEO Audit (NEW)
Optimize product schema markup, URLs, and sitemaps.
Week 8
Improve search engine rankings.
Not Started
Marketing Addition: Essential for organic traffic.
20
Microservices Readiness
Refactor monolithic components into service boundaries.
Week 8-9
Scalability preparation.
Not Started
Addition: Add service mesh (Istio) for inter-service communication.
Current State: Architecture notes drafted; extraction boundaries identified (auth, payments, catalog, orders).
21
Personalized Recommendations
Suggest products via browsing/purchase history.
Week 9
Boost cross-selling.
Not Started
Addition: Use collaborative filtering (machine learning).
Data Needed: Event collection pipeline (view, add_to_cart, purchase) TBD.
22
Advanced Product Filters
Add rating, shipping time, and material filters.
Week 9
Better discoverability.
Not Started
Addition: Cache filter results in Redis for performance.
Indexing: Add composite indexes (price, rating, updatedAt) before release.
23
Analytics Dashboard for Sellers
Sales trends, product performance, and customer insights.
Week 10
Data-driven decisions.
Not Started
Addition: Export reports to CSV/PDF.
Foundation: Order timeline/events already capturing payment stages (extend for analytics).
24
Dynamic Pricing
Adjust prices based on demand and stock.
Week 10
Revenue optimization.
Not Started
Addition: Competitor price monitoring integration.
Dependency: Inventory & sales velocity metrics pipeline.
25
Inventory Forecasting
AI-driven stock predictions.
Week 11
Prevent stockouts.
Not Started
Addition: Integrate with ERP systems (e.g., SAP).
Prereq: Historical order + inventory delta store; add stock movement audit log.
26
Abandoned Cart Recovery
Email/SMS reminders for abandoned carts.
Week 12
Recover lost sales.
Not Started
Addition: Offer discounts for cart recovery.
Need: Cart lastActivity timestamp + notification scheduling worker.
27
Disaster Recovery Plan (NEW)
Backup strategies and failover mechanisms.
Week 12
Ensure business continuity.
Not Started
Critical Addition: Test backup restoration processes.
Add: Automated Mongo & Redis snapshot scripts + restore drills doc.
28
Containerization & Orchestration
Docker Compose and Kubernetes manifests.
Week 12-13
Scalable deployments.
Not Started
Addition: Use Helm charts for Kubernetes.
Next: Author base k8s manifests (Deployment, Service, Ingress) then Helm-ify.
29
CMS for Blogs/Banners
Manage content via rich-text editor.
Week 13
Marketing flexibility.
Not Started
Addition: Add SEO-friendly metadata fields.
30
Loyalty Rewards System
Earn points for purchases and referrals.
Week 14
Customer retention.
Not Started
Addition: Tiered rewards (e.g., silver/gold/platinum).
Design: Points ledger + accrual rules engine required.
31
Live Chat with Sellers
Real-time chat using WebSocket.
Week 14
Build trust.
Not Started
Addition: Save chat transcripts for dispute resolution.
Infra: WebSocket gateway or Socket.io service planned.
32
Interactive Map
Show nearby sellers via Google Maps.
Week 15
Local discovery.
Not Started
Addition: Geofencing for location-based promotions.
Need: Seller geolocation fields & spatial index.
33
Referral Program
Reward users for inviting friends.
Week 16
User acquisition.
Not Started
Addition: Track referrals via unique codes.
34
A/B Testing Framework (NEW)
Integrate Optimizely/VWO for UI/UX testing.
Week 17
Optimize conversion rates.
Not Started
Marketing Addition: Test checkout flow variations.
Prep: Feature flag service baseline required.
35
User-Generated Content (UGC)
Allow photo/video uploads for products.
Week 18
Authenticity boost.
Not Started
Addition: Moderation tools to block inappropriate content.
36
Push Notifications
Order updates and promotions via browser/APNs.
Week 19
Engagement tool.
Not Started
Addition: Preference center for notification settings.
Backend: Subscription tokens store + topic grouping.
37
Multilingual & Currency Support
Localize language, date formats, and pricing.
Week 20
Global expansion.
Not Started
Addition: Integrate regional payment methods (e.g., Alipay).
Plan: Currency conversion service & i18n resource pipeline.
38
Gamification Elements
Badges, points, and achievements.
Week 21
Increase engagement.
Not Started
Addition: Leaderboards for competitive users.
39
API Marketplace
Expose APIs for third-party integrations.
Week 22
Platform extensibility.
Not Started
Addition: Developer portal with documentation.
40
Headless Commerce Support
Decouple frontend/backend for custom storefronts.
Week 23
Enterprise scalability.
Not Started
Addition: GraphQL API for flexible queries.
Incremental: Introduce GraphQL gateway after API Gateway baseline.
41
Affiliate Marketing (NEW)
Enable sellers to create affiliate programs.
Week 24
Drive sales via partners.
Not Started
Monetization Addition: Use Post Affiliate Pro.
42
Social Login & Sharing (NEW)
Allow Google/Facebook login and product sharing.
Week 25
Reduce signup friction and boost marketing.
Not Started
UX Addition: Increase social proof.
Add: OAuth2 provider abstraction + token linking table.


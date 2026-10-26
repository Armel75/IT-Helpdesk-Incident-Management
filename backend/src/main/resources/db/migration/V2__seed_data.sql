-- Flyway Migration V2: Development & Demonstration Seed Data
-- Passwords below are hashed with BCrypt (12 rounds) for password: "Password123!"
-- $2a$12$e8Z4wZ7eYxT2y4L5o7y1..Q/0z5T8sA6p3L0uX9eJ5h8j4w0t.7y2

-- 1. USERS
INSERT INTO users (id, email, password_hash, full_name, role, department, active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'System Administrator', 'ROLE_ADMIN', 'IT Operations', TRUE),
('22222222-2222-2222-2222-222222222222', 'manager.sarah@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'Sarah Connor (IT Manager)', 'ROLE_IT_MANAGER', 'Service Delivery', TRUE),
('33333333-3333-3333-3333-333333333333', 'agent.marcus@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'Marcus Vance (Senior Agent)', 'ROLE_IT_AGENT', 'Tier 2 Support', TRUE),
('44444444-4444-4444-4444-444444444444', 'agent.elena@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'Elena Rostova (Support Agent)', 'ROLE_IT_AGENT', 'Tier 1 Service Desk', TRUE),
('55555555-5555-5555-5555-555555555555', 'employee.alex@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'Alex Rivera (Engineer)', 'ROLE_EMPLOYEE', 'Engineering', TRUE),
('66666666-6666-6666-6666-666666666666', 'employee.chloe@resolveit.internal', '$2a$12$K8Z0u/jX3g2bM7.kL6oZ5.qF2n4Y5t8u0v1w2x3y4z5a6b7c8d9e0', 'Chloe Bennett (Marketing)', 'ROLE_EMPLOYEE', 'Growth & Marketing', TRUE);

-- 2. TEAMS
INSERT INTO teams (id, name, description, lead_user_id, active) VALUES
('a1111111-0000-0000-0000-000000000001', 'Service Desk Tier 1', 'Frontline incident intake and rapid resolution team', '22222222-2222-2222-2222-222222222222', TRUE),
('a1111111-0000-0000-0000-000000000002', 'Infrastructure & Networks', 'Core network routing, VPN, firewalls, and cloud connectivity', '33333333-3333-3333-3333-333333333333', TRUE),
('a1111111-0000-0000-0000-000000000003', 'Workplace & End-User Compute', 'Laptops, peripherals, OS provisioning, and local hardware repairs', '44444444-4444-4444-4444-444444444444', TRUE);

INSERT INTO team_memberships (team_id, user_id) VALUES
('a1111111-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444'),
('a1111111-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333'),
('a1111111-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444');

-- 3. CATEGORIES
INSERT INTO categories (id, name, code, description, active) VALUES
('c1111111-0000-0000-0000-000000000001', 'Hardware & Peripherals', 'HW', 'Physical laptops, docking stations, monitors, and accessories', TRUE),
('c1111111-0000-0000-0000-000000000002', 'Network & Connectivity', 'NET', 'Wi-Fi, VPN gateways, DNS, and office firewall issues', TRUE),
('c1111111-0000-0000-0000-000000000003', 'Software & Applications', 'SW', 'Productivity tools, IDEs, SaaS access, and OS bugs', TRUE),
('c1111111-0000-0000-0000-000000000004', 'Identity & Access Management', 'IAM', 'SSO, MFA reset, email accounts, and privilege escalations', TRUE);

-- 4. SLA POLICIES
INSERT INTO sla_policies (id, name, priority, ticket_type, response_time_hours, resolution_time_hours, active) VALUES
('s1111111-0000-0000-0000-000000000001', 'Critical Incident Policy', 'CRITICAL', 'INCIDENT', 1, 4, TRUE),
('s1111111-0000-0000-0000-000000000002', 'High Incident Policy', 'HIGH', 'INCIDENT', 2, 8, TRUE),
('s1111111-0000-0000-0000-000000000003', 'Medium Incident Policy', 'MEDIUM', 'INCIDENT', 4, 24, TRUE),
('s1111111-0000-0000-0000-000000000004', 'Low Incident Policy', 'LOW', 'INCIDENT', 8, 48, TRUE),
('s1111111-0000-0000-0000-000000000005', 'Critical Service Request', 'CRITICAL', 'SERVICE_REQUEST', 2, 8, TRUE),
('s1111111-0000-0000-0000-000000000006', 'High Service Request', 'HIGH', 'SERVICE_REQUEST', 4, 16, TRUE),
('s1111111-0000-0000-0000-000000000007', 'Medium Service Request', 'MEDIUM', 'SERVICE_REQUEST', 8, 48, TRUE),
('s1111111-0000-0000-0000-000000000008', 'Low Service Request', 'LOW', 'SERVICE_REQUEST', 16, 72, TRUE);

-- 5. ASSETS
INSERT INTO assets (id, asset_tag, name, asset_type, status, owner_id, serial_number) VALUES
('b1111111-0000-0000-0000-000000000001', 'AST-LP-0192', 'ThinkPad X1 Carbon Gen 11', 'LAPTOP', 'ACTIVE', '55555555-5555-5555-5555-555555555555', 'SN-TP882910X'),
('b1111111-0000-0000-0000-000000000002', 'AST-LP-0205', 'MacBook Pro 16 M3 Max', 'LAPTOP', 'ACTIVE', '66666666-6666-6666-6666-666666666666', 'SN-MBP992011M'),
('b1111111-0000-0000-0000-000000000003', 'AST-MON-0044', 'Dell UltraSharp 32 4K USB-C Hub', 'MONITOR', 'ACTIVE', '55555555-5555-5555-5555-555555555555', 'SN-DL440019A');

-- 6. KNOWLEDGE ARTICLES
INSERT INTO knowledge_articles (id, title, content, category_id, author_id, status, view_count, published_at) VALUES
('k1111111-0000-0000-0000-000000000001', 'Troubleshooting Corporate WireGuard VPN Connectivity', 'If your VPN fails to handshake after sleep mode: 1. Disconnect tunnel. 2. Verify Wi-Fi network allows UDP 51820. 3. Restart WireGuard daemon. 4. Re-authenticate via corporate SSO portal.', 'c1111111-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'PUBLISHED', 142, CURRENT_TIMESTAMP - INTERVAL '10 days'),
('k1111111-0000-0000-0000-000000000002', 'Standard macOS & Windows Developer Toolchain Setup', 'Complete guide to installing Homebrew, Docker Desktop, OpenJDK 21, and GitHub Enterprise SSH keys according to company security guidelines.', 'c1111111-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'PUBLISHED', 89, CURRENT_TIMESTAMP - INTERVAL '15 days');

-- 7. TICKETS & SLAs
INSERT INTO tickets (id, ticket_number, title, description, ticket_type, priority, severity, status, requester_id, assigned_agent_id, assigned_team_id, category_id, asset_id, resolution_summary, first_response_at, resolved_at, created_at, updated_at) VALUES
('t1111111-0000-0000-0000-000000000001', 'INC-2026-00101', 'Core VPN Gateway Connection Dropping Intermittently', 'When connected from remote office networks, WireGuard sessions terminate abruptly every 15-20 minutes with handshake timeout errors.', 'INCIDENT', 'CRITICAL', 'SEV1', 'IN_PROGRESS', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'a1111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('t1111111-0000-0000-0000-000000000002', 'INC-2026-00102', 'Dual 4K Monitor Display Flickering via Thunderbolt Dock', 'The secondary external display flickers black intermittently when compiling code or running GPU-intensive graphics workloads.', 'INCIDENT', 'MEDIUM', 'SEV3', 'OPEN', '66666666-6666-6666-6666-666666666666', NULL, 'a1111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000002', NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('t1111111-0000-0000-0000-000000000003', 'SRQ-2026-00103', 'Request Provisioning for JetBrains All Products Pack License', 'Need license assignment for IntelliJ IDEA Ultimate and DataGrip for incoming backend migration sprint.', 'SERVICE_REQUEST', 'LOW', 'SEV4', 'RESOLVED', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'a1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000003', NULL, 'License allocated from corporate enterprise pool and invitation sent to employee corporate email.', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- SLAs for Seed Tickets
INSERT INTO ticket_sla (id, ticket_id, policy_id, response_deadline, resolution_deadline, response_breached, resolution_breached) VALUES
('l1111111-0000-0000-0000-000000000001', 't1111111-0000-0000-0000-000000000001', 's1111111-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '1 hour', FALSE, FALSE),
('l1111111-0000-0000-0000-000000000002', 't1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000003', CURRENT_TIMESTAMP + INTERVAL '3 hours', CURRENT_TIMESTAMP + INTERVAL '23 hours', FALSE, FALSE),
('l1111111-0000-0000-0000-000000000003', 't1111111-0000-0000-0000-000000000003', 's1111111-0000-0000-0000-000000000008', CURRENT_TIMESTAMP + INTERVAL '10 hours', CURRENT_TIMESTAMP + INTERVAL '66 hours', FALSE, FALSE);

-- COMMENTS (Including public replies and shielded internal notes)
INSERT INTO comments (id, ticket_id, author_id, content, comment_type, created_at) VALUES
('m1111111-0000-0000-0000-000000000001', 't1111111-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Investigating server-side packet drops on Frankfurt gateway node gw-eu-02. Increased keepalive interval to 25s.', 'INTERNAL_NOTE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('m1111111-0000-0000-0000-000000000002', 't1111111-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Hello Alex, we are diagnosing the VPN gateway termination issue. Can you confirm if you are on corporate Wi-Fi or home ISP?', 'PUBLIC', CURRENT_TIMESTAMP - INTERVAL '90 minutes'),
('m1111111-0000-0000-0000-000000000003', 't1111111-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'I am currently on home optical fiber connection (Vodafone Germany).', 'PUBLIC', CURRENT_TIMESTAMP - INTERVAL '70 minutes');

-- TICKET HISTORY
INSERT INTO ticket_history (id, ticket_id, actor_id, event_type, field_changed, old_value, new_value, created_at) VALUES
('h1111111-0000-0000-0000-000000000001', 't1111111-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'TICKET_CREATED', 'status', NULL, 'OPEN', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('h1111111-0000-0000-0000-000000000001', 't1111111-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'ASSIGNED', 'assigned_agent', NULL, 'Marcus Vance', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('h1111111-0000-0000-0000-000000000001', 't1111111-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'STATUS_CHANGE', 'status', 'OPEN', 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- =============================================================================
-- JAANCH DATABASE SCHEMA MIGRATION 0003: SEED ORGANIZATIONS
-- =============================================================================
-- Seeds ≈ 40 verified organizations and official portals.
-- Authoritative Decision D10: Every row has `needs_team_review = true`.
-- Authoritative Decision D10: Includes clearly labelled demo row.
-- =============================================================================

INSERT INTO organizations (name, kind, primary_domain, domains, official_portal_url, is_verified, needs_team_review)
VALUES
  -- 1. Demo Row (Clearly Labelled per Decision D10)
  ('Jaanch Demo Verified Corporation', 'corporation', 'demo-verified.jaanch.ai', ARRAY['demo-verified.jaanch.ai', 'careers.demo-verified.jaanch.ai'], 'https://demo-verified.jaanch.ai/careers', true, true),

  -- 2. Major Indian IT & Services (Widely Impersonated)
  ('Tata Consultancy Services', 'corporation', 'tcs.com', ARRAY['tcs.com', 'careers.tcs.com', 'nextstep.tcs.com'], 'https://www.tcs.com/careers', true, true),
  ('Infosys Limited', 'corporation', 'infosys.com', ARRAY['infosys.com', 'careers.infosys.com', 'infytq.onwingspan.com'], 'https://www.infosys.com/careers.html', true, true),
  ('Wipro Limited', 'corporation', 'wipro.com', ARRAY['wipro.com', 'careers.wipro.com'], 'https://careers.wipro.com', true, true),
  ('HCLTech', 'corporation', 'hcltech.com', ARRAY['hcltech.com', 'hcl.com', 'careers.hcltech.com'], 'https://www.hcltech.com/careers', true, true),
  ('Cognizant Technology Solutions', 'corporation', 'cognizant.com', ARRAY['cognizant.com', 'careers.cognizant.com'], 'https://careers.cognizant.com/global/en', true, true),
  ('Tech Mahindra', 'corporation', 'techmahindra.com', ARRAY['techmahindra.com', 'careers.techmahindra.com'], 'https://careers.techmahindra.com', true, true),
  ('LTIMindtree', 'corporation', 'ltimindtree.com', ARRAY['ltimindtree.com', 'careers.ltimindtree.com'], 'https://www.ltimindtree.com/careers', true, true),
  ('Capgemini India', 'corporation', 'capgemini.com', ARRAY['capgemini.com', 'careers.capgemini.com'], 'https://www.capgemini.com/in-en/careers', true, true),
  ('Accenture India', 'corporation', 'accenture.com', ARRAY['accenture.com', 'careers.accenture.com'], 'https://www.accenture.com/in-en/careers', true, true),
  ('IBM India', 'corporation', 'ibm.com', ARRAY['ibm.com', 'careers.ibm.com'], 'https://www.ibm.com/employment', true, true),
  ('Mphasis', 'corporation', 'mphasis.com', ARRAY['mphasis.com', 'careers.mphasis.com'], 'https://www.mphasis.com/home/careers.html', true, true),
  ('Persistent Systems', 'corporation', 'persistent.com', ARRAY['persistent.com', 'careers.persistent.com'], 'https://www.persistent.com/careers', true, true),
  ('Larsen & Toubro', 'corporation', 'larsentoubro.com', ARRAY['larsentoubro.com', 'lntecc.com'], 'https://www.larsentoubro.com/corporate/careers', true, true),

  -- 3. Global Technology Leaders
  ('Google India', 'corporation', 'google.com', ARRAY['google.com', 'careers.google.com'], 'https://careers.google.com', true, true),
  ('Microsoft India', 'corporation', 'microsoft.com', ARRAY['microsoft.com', 'careers.microsoft.com'], 'https://careers.microsoft.com', true, true),
  ('Amazon India', 'corporation', 'amazon.com', ARRAY['amazon.com', 'amazon.jobs'], 'https://amazon.jobs', true, true),
  ('Apple India', 'corporation', 'apple.com', ARRAY['apple.com', 'jobs.apple.com'], 'https://jobs.apple.com/en-in', true, true),
  ('Meta India', 'corporation', 'meta.com', ARRAY['meta.com', 'metacareers.com'], 'https://www.metacareers.com', true, true),
  ('Oracle India', 'corporation', 'oracle.com', ARRAY['oracle.com', 'careers.oracle.com'], 'https://www.oracle.com/corporate/careers', true, true),
  ('Cisco Systems India', 'corporation', 'cisco.com', ARRAY['cisco.com', 'jobs.cisco.com'], 'https://jobs.cisco.com', true, true),
  ('Intel India', 'corporation', 'intel.com', ARRAY['intel.com', 'jobs.intel.com'], 'https://jobs.intel.com', true, true),
  ('Adobe India', 'corporation', 'adobe.com', ARRAY['adobe.com', 'adobe.com/careers'], 'https://www.adobe.com/careers.html', true, true),
  ('Salesforce India', 'corporation', 'salesforce.com', ARRAY['salesforce.com'], 'https://www.salesforce.com/company/careers', true, true),

  -- 4. Professional Services & Management Consulting
  ('Deloitte India', 'corporation', 'deloitte.com', ARRAY['deloitte.com', 'deloitte.com/in'], 'https://jobs2.deloitte.com', true, true),
  ('PwC India', 'corporation', 'pwc.in', ARRAY['pwc.in', 'pwc.com'], 'https://www.pwc.in/careers.html', true, true),
  ('Ernst & Young (EY) India', 'corporation', 'ey.com', ARRAY['ey.com', 'ey.com/en_in'], 'https://www.ey.com/en_in/careers', true, true),
  ('KPMG India', 'corporation', 'kpmg.com', ARRAY['kpmg.com', 'home.kpmg/in'], 'https://kpmg.com/in/en/home/careers.html', true, true),
  ('McKinsey & Company India', 'corporation', 'mckinsey.com', ARRAY['mckinsey.com'], 'https://www.mckinsey.com/careers', true, true),
  ('Boston Consulting Group (BCG) India', 'corporation', 'bcg.com', ARRAY['bcg.com'], 'https://www.bcg.com/careers', true, true),

  -- 5. Indian Banking & Financial Services
  ('State Bank of India', 'corporation', 'sbi.co.in', ARRAY['sbi.co.in', 'bank.sbi'], 'https://sbi.co.in/web/careers', true, true),
  ('HDFC Bank', 'corporation', 'hdfcbank.com', ARRAY['hdfcbank.com'], 'https://www.hdfcbank.com/personal/about-us/careers', true, true),
  ('ICICI Bank', 'corporation', 'icicibank.com', ARRAY['icicibank.com'], 'https://www.icicicareers.com', true, true),
  ('Axis Bank', 'corporation', 'axisbank.com', ARRAY['axisbank.com'], 'https://www.axisbank.com/careers', true, true),

  -- 6. Indian Conglomerates & Consumer Giants
  ('Tata Group', 'corporation', 'tata.com', ARRAY['tata.com'], 'https://www.tata.com/careers', true, true),
  ('Reliance Industries', 'corporation', 'ril.com', ARRAY['ril.com', 'jio.com'], 'https://www.ril.com/careers', true, true),
  ('Mahindra & Mahindra', 'corporation', 'mahindra.com', ARRAY['mahindra.com'], 'https://www.mahindra.com/careers', true, true),
  ('Flipkart', 'corporation', 'flipkart.com', ARRAY['flipkart.com', 'flipkartcareers.com'], 'https://www.flipkartcareers.com', true, true),
  ('Swiggy', 'corporation', 'swiggy.com', ARRAY['swiggy.com'], 'https://careers.swiggy.com', true, true),
  ('Zomato', 'corporation', 'zomato.com', ARRAY['zomato.com'], 'https://www.zomato.com/careers', true, true),

  -- 7. Verified Government & Apex Educational Portals
  ('AICTE Internship Portal', 'government', 'aicte-india.org', ARRAY['aicte-india.org', 'internship.aicte-india.org'], 'https://internship.aicte-india.org', true, true),
  ('National Scholarship Portal (NSP)', 'government', 'scholarships.gov.in', ARRAY['scholarships.gov.in'], 'https://scholarships.gov.in', true, true),
  ('National Career Service (NCS)', 'government', 'ncs.gov.in', ARRAY['ncs.gov.in'], 'https://www.ncs.gov.in', true, true),
  ('University Grants Commission (UGC)', 'government', 'ugc.gov.in', ARRAY['ugc.gov.in', 'ugc.ac.in'], 'https://www.ugc.gov.in', true, true),
  ('National Cyber Crime Reporting Portal', 'government', 'cybercrime.gov.in', ARRAY['cybercrime.gov.in'], 'https://cybercrime.gov.in', true, true)
ON CONFLICT (primary_domain) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind,
  domains = EXCLUDED.domains,
  official_portal_url = EXCLUDED.official_portal_url,
  is_verified = EXCLUDED.is_verified,
  needs_team_review = EXCLUDED.needs_team_review;


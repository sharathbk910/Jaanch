import type { VerificationStatus, AnalyzeRequestInput } from '../../schemas/index.js';

export interface CorpusFixture {
  id: string;
  name: string;
  category: 'illustrative_synthetic';
  language: 'en' | 'hi' | 'kn' | 'hinglish';
  request: AnalyzeRequestInput;
  expectedStatus: VerificationStatus;
  description: string;
}

export const CORPUS_FIXTURES: CorpusFixture[] = [
  {
    id: 'F01',
    name: 'TechCorp Deposit Trap',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Demands upfront refundable security deposit for laptop and onboarding kit.',
    request: {
      text: 'Congratulations! You are selected as Software Engineering Intern at TechCorp. A refundable security deposit of ₹4,999 is required for your laptop courier kit. Pay upfront to secure your seat.',
      domain: 'internship',
    },
  },
  {
    id: 'F02',
    name: 'Scholarship KYC Trap',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Demands bank password and OTP verification to release scholarship funds.',
    request: {
      text: 'Your National Merit Scholarship of ₹50,000 is approved. Share OTP sent to your phone and provide your bank password for immediate direct debit transfer.',
      domain: 'scholarship',
    },
  },
  {
    id: 'F03',
    name: 'Genuine TCS Clean Invite',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Official TCS interview invitation with non-fee recruitment policy disclaimer.',
    request: {
      text: 'Dear Candidate, We are pleased to invite you for an interview at Tata Consultancy Services for the graduate trainee role. Please note that TCS does not charge any fee at any stage of the recruitment process.',
      domain: 'job',
      sender: {
        organization: 'Tata Consultancy Services',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F04',
    name: 'Infosys Official Portal Listing',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Genuine Infosys offer containing corporate career portal and no-fee notice.',
    request: {
      text: 'Infosys campus hiring team invites you to complete your technical round on our official portal. We do not solicit any money or processing fee for student hiring.',
      domain: 'job',
      sender: {
        organization: 'Infosys',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F05',
    name: 'Wipro Genuine with Disclaimer',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Official Wipro communication with verified career domain and clear disclaimer.',
    request: {
      text: 'Wipro Limited welcomes you to the Elite National Talent Hunt. Our recruitment is free of charge and we never ask for fee or security deposit.',
      domain: 'job',
      sender: {
        organization: 'Wipro',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F06',
    name: 'Govt PMKVY Registration Fee Trap',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Fraudulent scheme impersonating PMKVY requesting registration fee.',
    request: {
      text: 'Under PMKVY Government Scheme, 100% placement guaranteed after 1 month course. Mandatory registration fee of ₹1,200 must be deposited to register.',
      domain: 'internship',
    },
  },
  {
    id: 'F07',
    name: 'Lookalike Micros0ft Typosquat',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Phishing email using micros0ft-careers.com typo domain.',
    request: {
      text: 'Microsoft hiring committee has reviewed your resume. View your offer letter at http://micros0ft-careers.com/offer. Submit your details today.',
      domain: 'job',
    },
  },
  {
    id: 'F08',
    name: 'Lookalike TCS Careers Net',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Impersonation domain tcs-jobs-india.net with brand keyword.',
    request: {
      text: 'Apply for entry level engineering roles at http://tcs-jobs-india.net/apply and receive fast-track onboarding.',
      domain: 'job',
    },
  },
  {
    id: 'F09',
    name: 'Hindi Panjikaran Shulk Scam',
    category: 'illustrative_synthetic',
    language: 'hi',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Hindi upfront registration fee scam.',
    request: {
      text: 'बधाई हो! आपका चयन डाटा एंट्री इंटर्नशिप के लिए हुआ है। अपना पद पक्का करने के लिए ₹1500 का panjikaran shulk तुरंत जमा करें।',
      domain: 'internship',
    },
  },
  {
    id: 'F10',
    name: 'Kannada Deposit Scam',
    category: 'illustrative_synthetic',
    language: 'kn',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Kannada training fee demand.',
    request: {
      text: 'ನಿಮ್ಮನ್ನು ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಟರ್ನ್‌ಶಿಪ್‌ಗೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಆರಂಭಿಕ nondani shulka ₹2000 pavatisi ana kodabeku.',
      domain: 'internship',
    },
  },
  {
    id: 'F11',
    name: 'Hinglish Coercive Deadline Double',
    category: 'illustrative_synthetic',
    language: 'hinglish',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Combined coercive deadline pressure plus free email claiming corporate brand.',
    request: {
      text: 'Aapka selection Google Technologies me confirm ho gaya hai. Kewal 2 ghante bache hai confirmation ke liye. Contact recruiter on hr.google.careers@gmail.com immediately.',
      domain: 'job',
    },
  },
  {
    id: 'F12',
    name: 'Cheque Overpayment Scam',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Classic cheque overpayment scam for virtual student assistant.',
    request: {
      text: 'We are sending you a corporate cashier cheque of ₹85,000 for office supplies. Deposit cheque and return part of money back to our vendor via wire transfer.',
      domain: 'freelance',
    },
  },
  {
    id: 'F13',
    name: 'Debit Card PIN Phish',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'Asking for debit card details and PIN for salary bank account.',
    request: {
      text: 'To activate your corporate salary account, provide your debit card number and debit card pin for verification.',
      domain: 'job',
    },
  },
  {
    id: 'F14',
    name: 'AICTE Unofficial Fee Trap',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'HIGH_CONCERN',
    description: 'AICTE scheme soliciting mandatory kit fee on private link.',
    request: {
      text: 'AICTE student internship portal shortlist announced. Mandatory kit fee of ₹1,999 required for study materials. Visit http://aicte-portal-india.org/pay.',
      domain: 'internship',
    },
  },
  {
    id: 'F15',
    name: 'Informal Startup Unverified',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Early stage startup offering internship without fees or official listing.',
    request: {
      text: 'Hey! We loved your GitHub portfolio and want to offer you an internship at NexaAI. Stipend is ₹20,000 per month for 3 months. Let us know when you can join a call.',
      domain: 'internship',
    },
  },
  {
    id: 'F16',
    name: 'Freelance Content Writer',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Benign freelance writing gig with no upfront fees, unverified client.',
    request: {
      text: 'Looking for a student content writer to draft 5 technical articles on Web3. Budget is ₹15,000. Payment upon milestone completion. No fees required.',
      domain: 'freelance',
    },
  },
  {
    id: 'F17',
    name: 'Single Coercive Deadline',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Single urgency pressure notice without fees or corporate free-mail impersonation.',
    request: {
      text: 'Design Hackathon shortlisting in progress. Immediate response required within 2 hours to confirm your team attendance link.',
      domain: 'competition',
    },
  },
  {
    id: 'F18',
    name: 'Single Free Email No Org Claim',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Individual researcher reaching out from personal webmail with no corporate brand claim.',
    request: {
      text: 'Hi, I saw your research paper on solar cells. I have an open research assistant position. Email me at professor.rao@gmail.com with your resume.',
      domain: 'job',
    },
  },
  {
    id: 'F19',
    name: 'Vague Scholarship Notice',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Generic scholarship circular with missing sponsor identification.',
    request: {
      text: 'State talent scholarship notice for undergraduate engineering students. Merit based grants up to ₹30,000. Submit marksheets to college placement office.',
      domain: 'scholarship',
    },
  },
  {
    id: 'F20',
    name: 'Hackathon Invitation Clean',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Clean college hackathon invite without official domain validation.',
    request: {
      text: 'Join the annual Inter-College Innovation Challenge. Win cash prizes of ₹50,000. Free participation for all enrolled engineering students.',
      domain: 'competition',
    },
  },
  {
    id: 'F21',
    name: 'Negation Fee Disclaimer Clean',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Explicit clause-level negation explaining no fees are charged.',
    request: {
      text: 'Cognizant GenC recruitment drive. Please be aware: We do not charge any fee at any stage of our interview process. Selection is purely on merit.',
      domain: 'job',
      sender: {
        organization: 'Cognizant',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F22',
    name: 'Hindi Negation Shulk Nahi',
    category: 'illustrative_synthetic',
    language: 'hi',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Hindi recruitment message with negation disclaimer.',
    request: {
      text: 'टाटा कंसल्टेंसी सर्विसेज में आपका स्वागत है। हमारे चयन में kisi bhi shulk ki mang nahi ki jati hai. Recruitment is free of charge.',
      domain: 'job',
      sender: {
        organization: 'Tata Consultancy Services',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F23',
    name: 'Kannada Negation Shulkavilla',
    category: 'illustrative_synthetic',
    language: 'kn',
    expectedStatus: 'LIKELY_GENUINE',
    description: 'Kannada recruitment announcement with negation disclaimer.',
    request: {
      text: 'ವಿಪ್ರೋ ಕ್ಯಾಂಪಸ್ ಸಂದರ್ಶನಕ್ಕೆ ಸ್ವಾಗತ. ಅಭ್ಯರ್ಥಿಗಳಿಂದ yavude shulkavilla ಮತ್ತು ನೇಮಕಾತಿ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿರುತ್ತದೆ. We do not charge any fee.',
      domain: 'job',
      sender: {
        organization: 'Wipro',
        isOfficialCorporateDomain: true,
      },
    },
  },
  {
    id: 'F24',
    name: 'Campus Placement Notice',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Internal college campus drive announcement awaiting official portal verification.',
    request: {
      text: 'Department Notice: Campus placement drive for final year B.Tech students will commence on Monday. Keep your resumes and college ID cards ready.',
      domain: 'job',
    },
  },
  {
    id: 'F25',
    name: 'Research Assistantship Benign',
    category: 'illustrative_synthetic',
    language: 'en',
    expectedStatus: 'NEEDS_REVIEW',
    description: 'Benign academic lab assistantship proposal with no official portal match yet.',
    request: {
      text: 'We are inviting applications for a graduate research assistantship in robotics lab. Monthly stipend is ₹25,000. Send statement of purpose by Friday.',
      domain: 'internship',
    },
  },
];

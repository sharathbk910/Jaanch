export interface TranslationDictionary {
  navigation: {
    brand: string;
    tagline: string;
    verifyOffer: string;
    linkCheck: string;
    resources: string;
    about: string;
    history: string;
    login: string;
    signup: string;
    logout: string;
    settings: string;
    menu: string;
    close: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
    notice: string;
  };
  features: {
    zeroFeesTitle: string;
    zeroFeesDesc: string;
    noOtpTitle: string;
    noOtpDesc: string;
    officialDomainsTitle: string;
    officialDomainsDesc: string;
  };
  submissionCard: {
    title: string;
    placeholder: string;
    sampleOffer1: string;
    sampleOffer2: string;
    sampleOffer3: string;
    charCount: string;
    charMin: string;
    analyzeBtn: string;
    analyzing: string;
    dropPdf: string;
    aiConsent: string;
    shareIndicators: string;
  };
  auditSteps: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  guidelines: {
    title: string;
    rule1: string;
    rule2: string;
    rule3: string;
  };
  footer: {
    helplineTitle: string;
    helplineDesc: string;
    copyright: string;
    privacy: string;
    terms: string;
    about: string;
  };
  auth: {
    signInTitle: string;
    signUpTitle: string;
    emailLabel: string;
    passwordLabel: string;
    signInBtn: string;
    signUpBtn: string;
    guestNotice: string;
    signOut: string;
    googleBtn: string;
    noAccount: string;
    haveAccount: string;
  };
  history: {
    eyebrow: string;
    title: string;
    subtitle: string;
    unauthTitle: string;
    unauthDesc: string;
    filterAll: string;
    emptyTitle: string;
    emptyDesc: string;
    checkOfferBtn: string;
    viewAudit: string;
    deleteAudit: string;
    deleteConfirm: string;
    prevPage: string;
    nextPage: string;
    pageOf: string;
  };
  settings: {
    eyebrow: string;
    title: string;
    subtitle: string;
    profileTitle: string;
    preferencesTitle: string;
    langSelectLabel: string;
    dangerTitle: string;
    dangerDesc: string;
    eraseBtn: string;
    eraseConfirm: string;
    eraseSuccess: string;
  };
  errors: {
    networkError: string;
    validationError: string;
    serverError: string;
    genericError: string;
  };
  statusLabels: {
    likelyGenuine: string;
    likelyGenuineDesc: string;
    needsReview: string;
    needsReviewDesc: string;
    highConcern: string;
    highConcernDesc: string;
    confirmedScam: string;
    confirmedScamDesc: string;
  };
  analyzer: {
    title: string;
    subtitle: string;
    badge: string;
    tabPaste: string;
    tabUpload: string;
    textLabel: string;
    textPlaceholder: string;
    charCounter: string;
    charMinAlert: string;
    domainLabel: string;
    domainHelp: string;
    domains: {
      job: string;
      internship: string;
      scholarship: string;
      freelance: string;
      competition: string;
      general_message: string;
      other: string;
    };
    senderToggle: string;
    senderEmail: string;
    senderEmailPlaceholder: string;
    senderPhone: string;
    senderPhonePlaceholder: string;
    senderDomain: string;
    senderDomainPlaceholder: string;
    senderOrg: string;
    senderOrgPlaceholder: string;
    headersToggle: string;
    headersPlaceholder: string;
    consentAi: string;
    consentAiSub: string;
    consentShare: string;
    consentShareSub: string;
    consentHistory: string;
    consentHistorySub: string;
    channelLabel: string;
    channels: {
      email: string;
      whatsapp: string;
      telegram: string;
      sms: string;
      linkedin: string;
      website: string;
      other: string;
    };
    claimedOrgLabel: string;
    claimedOrgPlaceholder: string;
    redactionPreviewTitle: string;
    redactionPreviewSub: string;
    redactionPreviewCount: string;
    redactionPreviewZero: string;
    ocrLanguageLabel: string;
    ocrCancelBtn: string;
    ocrScannedPdfNotice: string;
    privacyNotice: string;
    dropzoneTitle: string;
    dropzoneSub: string;
    dropzoneSupported: string;
    extractingPdf: string;
    extractedFile: string;
    removeFile: string;
    samplesPrompt: string;
    sampleGenuine: string;
    sampleFeeScam: string;
    sampleOtpScam: string;
    verifyBtn: string;
    verifyingBtn: string;
    clearBtn: string;
    progressStep1: string;
    progressStep2: string;
    progressStep3: string;
    progressStep4: string;
    pasteClipboard: string;
    copiedNotice: string;
  };
  results: {
    eyebrow: string;
    verdictLabel: string;
    meterLabel: string;
    confidenceLabel: string;
    paymentAlertTitle: string;
    paymentAlertDesc: string;
    paymentAlertCall1930: string;
    whyTitle: string;
    signalsTitle: string;
    signalsEmpty: string;
    evidenceQuote: string;
    whyItMatters: string;
    unverifiedTitle: string;
    unverifiedDesc: string;
    entitiesTitle: string;
    upiLabel: string;
    phonesLabel: string;
    domainsLabel: string;
    amountsLabel: string;
    orgLabel: string;
    nextStepsTitle: string;
    stepCheckedTitle: string;
    stepYourTurnTitle: string;
    stepProtectTitle: string;
    iPaidToggle: string;
    iPaidNotice: string;
    exportPdf: string;
    exportPrint: string;
    exportJson: string;
    checkAnother: string;
    sampleWalkthroughTitle: string;
    sampleWalkthroughSubtitle: string;
    sampleTabGenuine: string;
    sampleTabReview: string;
    sampleTabConcern: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
  };

  // Compatibility and short-key aliases
  nav: {
    brand: string;
    tagline: string;
    checkOffer: string;
    linkInspector: string;
    verificationGuide: string;
    about: string;
    login: string;
    signup: string;
    history: string;
    settings: string;
    logout: string;
    openMenu: string;
    closeMenu: string;
  };
  feedback: {
    pillQuestion: string;
    yes: string;
    no: string;
    thanks: string;
  };
  skipLink: string;
  languages: {
    en: string;
    hi: string;
    kn: string;
  };
}

export const translations: Record<'en' | 'hi' | 'kn', TranslationDictionary> = {
  en: {
    navigation: {
      brand: 'JAANCH.',
      tagline: 'Digital Trust & Safety for Indian Students',
      verifyOffer: 'Verify Offer',
      linkCheck: 'Link Check',
      resources: 'Verification Guide',
      about: 'About',
      history: 'History',
      login: 'Sign In',
      signup: 'Sign Up',
      logout: 'Sign Out',
      settings: 'Settings',
      menu: 'Menu',
      close: 'Close',
    },
    hero: {
      title: 'Never pay upfront for an internship, job, or scholarship.',
      subtitle: 'Instant, free, and privacy-preserving offer verification for Indian students. Run deterministic checks before you transfer money or share private documents.',
      cta: 'Audit an Offer',
      secondaryCta: 'Check a Link',
      notice: 'Official Indian government recruitments (UPSC, SSC, Railways, State PSCs) are conducted exclusively on their official .gov.in or .nic.in portals.',
    },
    features: {
      zeroFeesTitle: 'Zero Upfront Fees',
      zeroFeesDesc: 'Legitimate employers never demand training fees, laptop security deposits, or background check costs.',
      noOtpTitle: 'No Banking OTPs',
      noOtpDesc: 'Never share OTPs, UPI PINs, or bank account credentials. A real job pays you, never debits you.',
      officialDomainsTitle: 'Check Official Domains',
      officialDomainsDesc: 'Government and top tech firms recruit only from their verified corporate domains, never @gmail.com or @telegram.',
    },
    submissionCard: {
      title: 'Paste your offer message, letter, or job communication',
      placeholder: 'Paste the email body, WhatsApp text, appointment letter, or offer description (minimum 20 characters)...',
      sampleOffer1: 'Demo Genuine Offer',
      sampleOffer2: 'Demo Suspicious Offer',
      sampleOffer3: 'Demo Fee Scam',
      charCount: 'characters',
      charMin: 'Minimum 20 characters required',
      analyzeBtn: 'Verify Offer Now',
      analyzing: 'Running 8 deterministic checks...',
      dropPdf: 'Drop offer letter PDF or click to browse',
      aiConsent: 'Allow AI-assisted deep reasoning (optional, zero PII transmitted)',
      shareIndicators: 'Contribute anonymized scam signals to student safety database',
    },
    auditSteps: {
      step1Title: '1. Input & Redaction',
      step1Desc: 'Your text is sanitized on your machine. Phone numbers, emails, and sensitive PII are scrubbed before analysis.',
      step2Title: '2. Deterministic Rules',
      step2Desc: '8 automated heuristics test for upfront fees, banking OTP demands, lookalike domains, and urgency traps.',
      step3Title: '3. Evidence & Next Steps',
      step3Desc: 'Receive a transparent verdict (Likely Genuine, Needs Review, or High Concern) with concrete action items.',
    },
    guidelines: {
      title: 'Student Safety Guidelines',
      rule1: 'Never transfer money via UPI to receive an appointment letter.',
      rule2: 'Always verify company domain whois records and official contact listings.',
      rule3: 'Government recruitment exam fees are paid only through authorized SBI Collect / Bharatkosh gateways.',
    },
    footer: {
      helplineTitle: 'National Cybercrime Helpline: 1930',
      helplineDesc: 'Dial 1930 immediately or lodge an online complaint at cybercrime.gov.in if you have lost money to fraud.',
      copyright: 'JAANCH – Free public service for Indian students. Built with privacy-first architecture.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      about: 'About Us',
    },
    auth: {
      signInTitle: 'Sign In to Jaanch',
      signUpTitle: 'Create a Free Account',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      signInBtn: 'Sign In',
      signUpBtn: 'Create Account',
      guestNotice: 'You can audit offers without creating an account. Accounts provide private history persistence.',
      signOut: 'Sign Out',
      googleBtn: 'Continue with Google',
      noAccount: "Don't have an account? Sign up",
      haveAccount: 'Already have an account? Sign in',
    },
    history: {
      eyebrow: 'AUDIT LOG',
      title: 'Saved Offer Analyses',
      subtitle: 'Your private history of analyzed offers, detection results, and student safety checklists.',
      unauthTitle: 'Sign in to access your saved audit history',
      unauthDesc: 'Saved history allows you to revisit past analyses, view checklists, and track patterns.',
      filterAll: 'All Categories',
      emptyTitle: 'No saved analyses yet',
      emptyDesc: 'Check an offer using the analyzer and opt-in to save it to your private history.',
      checkOfferBtn: 'Check an Offer Now',
      viewAudit: 'View Audit',
      deleteAudit: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this saved audit?',
      prevPage: 'Previous',
      nextPage: 'Next',
      pageOf: 'Page {current} of {total}',
    },
    settings: {
      eyebrow: 'ACCOUNT PREFERENCES',
      title: 'Settings & Privacy',
      subtitle: 'Manage your profile, preferred language, privacy defaults, and account data.',
      profileTitle: 'User Profile',
      preferencesTitle: 'Language & Privacy Defaults',
      langSelectLabel: 'Display Language',
      dangerTitle: 'Danger Zone: Account Data Erasure',
      dangerDesc: "Permanently delete all your submission records, saved audits, and personal history. Under India's Digital Personal Data Protection Act, this permanently removes all data.",
      eraseBtn: 'Delete All My Data',
      eraseConfirm: 'Type "DELETE" to confirm permanent account data erasure:',
      eraseSuccess: 'All your account submissions and history have been permanently erased.',
    },
    errors: {
      networkError: 'Unable to reach the analysis server. Please check your connection and try again.',
      validationError: 'Please provide at least 20 characters of offer text.',
      serverError: 'An error occurred while analyzing the offer. Please try again.',
      genericError: 'Something went wrong. Please refresh the page.',
    },
    statusLabels: {
      likelyGenuine: 'Likely Genuine',
      likelyGenuineDesc: 'No hard scam indicators detected; corroborated by positive evidence.',
      needsReview: 'Needs Review',
      needsReviewDesc: 'Incomplete information or unverified contact channels. Exercise caution.',
      highConcern: 'High Concern',
      highConcernDesc: 'Hard disqualifiers found (upfront fee, OTP request, lookalike domain).',
      confirmedScam: 'Confirmed Fraud',
      confirmedScamDesc: 'Matched a verified fraudulent entity in the student safety database.',
    },
    analyzer: {
      title: 'Verify Offer Legitimacy',
      subtitle: 'Inspect appointment letters, WhatsApp recruitment messages, and scholarships before you pay or share documents.',
      badge: 'ANALYSIS ENGINE',
      tabPaste: 'Paste Message Text',
      tabUpload: 'Upload Document',
      textLabel: 'Offer Message or Email Text',
      textPlaceholder: 'Paste the full message, email body, job description, or WhatsApp message here (minimum 25 characters)...',
      charCounter: 'characters',
      charMinAlert: 'Minimum 25 characters required to analyze reliably',
      domainLabel: 'Opportunity Category',
      domainHelp: 'Select the type of offer for targeted heuristic checks',
      domains: {
        job: 'Job Offer',
        internship: 'Internship Program',
        scholarship: 'Scholarship / Grant',
        freelance: 'Freelance / Gig Work',
        competition: 'Hackathon / Competition',
        general_message: 'General Message / SMS',
        other: 'Other Opportunity',
      },
      senderToggle: 'Add Sender & Contact Details (Optional)',
      senderEmail: 'Recruiter / Sender Email',
      senderEmailPlaceholder: 'e.g. hr@company-careers.org',
      senderPhone: 'Recruiter Phone / WhatsApp',
      senderPhonePlaceholder: 'e.g. +91 98765 43210',
      senderDomain: 'Company Website / Domain',
      senderDomainPlaceholder: 'e.g. company.com',
      senderOrg: 'Claimed Organization',
      senderOrgPlaceholder: 'e.g. Infosys, TCS, Wipro',
      headersToggle: 'Raw Email Headers (Optional, for SPF/DKIM inspection)',
      headersPlaceholder: 'Paste RFC 822 email headers (Received, From, Return-Path, DKIM-Signature)...',
      consentAi: 'Allow AI Deep Analysis (Zero PII transmitted)',
      consentAiSub: 'Runs secondary linguistic nuance evaluation with personal details redacted client-side.',
      consentShare: 'Contribute Anonymous Threat Indicators',
      consentShareSub: 'Shares non-PII salted cryptographic hashes of scam phone numbers, domains, or UPI IDs to warn other students.',
      consentHistory: 'Save Audit to Private History',
      consentHistorySub: 'Saves your audit in your personal dashboard for later review (requires login).',
      channelLabel: 'Communication Channel',
      channels: {
        email: 'Email',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        sms: 'SMS / Text Message',
        linkedin: 'LinkedIn / Social Media',
        website: 'Job Board / Website',
        other: 'Other Channel',
      },
      claimedOrgLabel: 'Claimed Organization',
      claimedOrgPlaceholder: 'Select or type organization name (e.g. TCS, Infosys, AICTE)...',
      redactionPreviewTitle: 'Client Redaction Preview',
      redactionPreviewSub: 'What will be sent to the server. Your raw personal identifiers are masked locally before transmission.',
      redactionPreviewCount: 'personal details redacted client-side (phones, Aadhaar, handles)',
      redactionPreviewZero: 'No personal PII detected in message body',
      ocrLanguageLabel: 'OCR Document Language',
      ocrCancelBtn: 'Cancel OCR',
      ocrScannedPdfNotice: 'Scanned image-only PDF detected. Extracted text using local OCR fallback.',
      privacyNotice: 'Privacy Guarantee: All text is sanitized and all personal information (names, phones, emails, Aadhaar) is redacted before evaluation. Uploaded documents are read strictly in your browser and never sent to a server.',
      dropzoneTitle: 'Drop your PDF or TXT offer document here',
      dropzoneSub: 'or click to browse your device',
      dropzoneSupported: 'Supports PDF (.pdf) and text (.txt) up to 10MB',
      extractingPdf: 'Extracting text locally in browser...',
      extractedFile: 'Document loaded',
      removeFile: 'Remove file',
      samplesPrompt: 'Or test with a sample scenario:',
      sampleGenuine: 'Genuine Internship',
      sampleFeeScam: 'Upfront Fee Scam',
      sampleOtpScam: 'OTP Phishing Scam',
      verifyBtn: 'Verify Offer Now',
      verifyingBtn: 'Running Safety Analysis...',
      clearBtn: 'Clear',
      progressStep1: 'Redacting sensitive student PII locally...',
      progressStep2: 'Scanning 8 deterministic scam detection rules...',
      progressStep3: 'Analyzing URLs, punycode & lookalike domains...',
      progressStep4: 'Synthesizing transparent evidence assessment...',
      pasteClipboard: 'Paste from Clipboard',
      copiedNotice: 'Pasted from clipboard',
    },
    results: {
      eyebrow: 'VERIFICATION RESULT',
      verdictLabel: 'Verification Status',
      meterLabel: 'Independent checks evaluated',
      confidenceLabel: 'Assessment Confidence',
      paymentAlertTitle: 'Payment & Banking Security Advisory',
      paymentAlertDesc: 'This communication demands an upfront fee, deposit, or banking OTP. Legitimate employers and scholarship bodies never ask for money or OTPs.',
      paymentAlertCall1930: 'Dial 1930 immediately or file a complaint at cybercrime.gov.in if you have already sent funds.',
      whyTitle: 'Why this status was reached',
      signalsTitle: 'Observed Risk Indicators & Signals',
      signalsEmpty: 'No hard scam indicators detected in the submitted communication.',
      evidenceQuote: 'Extracted Evidence',
      whyItMatters: 'Why it matters',
      unverifiedTitle: 'Pending & Unverified Details',
      unverifiedDesc: 'The following critical details could not be corroborated from official sources. Exercise caution until independently verified:',
      entitiesTitle: 'Extracted Opportunity Indicators',
      upiLabel: 'UPI / Payment Handles',
      phonesLabel: 'Phone & WhatsApp Numbers',
      domainsLabel: 'Websites & Links',
      amountsLabel: 'Mentioned Amounts',
      orgLabel: 'Claimed Organization',
      nextStepsTitle: 'Actionable Next Steps',
      stepCheckedTitle: '1. What Jaanch Checked',
      stepYourTurnTitle: '2. Your Turn: Student Verification Checklist',
      stepProtectTitle: '3. Emergency & Fraud Prevention',
      iPaidToggle: 'I already transferred money or shared sensitive documents',
      iPaidNotice: 'Emergency Action: Call 1930 (National Cyber Crime Helpline) within the golden hour to freeze the beneficiary account. Lodge an official complaint at cybercrime.gov.in and block the recruiter on all platforms.',
      exportPdf: 'Download PDF Report',
      exportPrint: 'Print Report',
      exportJson: 'Export JSON',
      checkAnother: 'Audit Another Offer',
      sampleWalkthroughTitle: 'Sample Report Walkthrough',
      sampleWalkthroughSubtitle: 'Interactive reference reports illustrating the four-verdict model and evidence architecture.',
      sampleTabGenuine: 'Genuine Offer Sample',
      sampleTabReview: 'Needs Review Sample',
      sampleTabConcern: 'Fee Scam Sample',
      emptyTitle: 'No Audit Result Loaded',
      emptyDesc: 'Please enter offer text on the Analyze page to view deterministic verification results.',
      emptyCta: 'Audit an Offer',
    },

    // Compatibility aliases
    nav: {
      brand: 'JAANCH',
      tagline: 'Digital Trust & Safety',
      checkOffer: 'Check Offer',
      linkInspector: 'Link Inspector',
      verificationGuide: 'Verification Guide',
      about: 'About',
      login: 'Sign In',
      signup: 'Sign Up',
      history: 'History',
      settings: 'Settings',
      logout: 'Sign Out',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    feedback: {
      pillQuestion: 'Was this page helpful?',
      yes: 'Yes',
      no: 'No',
      thanks: 'Thank you for helping keep Indian students safe!',
    },
    skipLink: 'Skip to main content',
    languages: {
      en: 'English',
      hi: 'हिंदी',
      kn: 'ಕನ್ನಡ',
    },
  },
  hi: {
    navigation: {
      brand: 'जांच.',
      tagline: 'भारतीय छात्रों के लिए डिजिटल सुरक्षा और विश्वास',
      verifyOffer: 'ऑफर की जांच करें',
      linkCheck: 'लिंक जांच',
      resources: 'सत्यापन मार्गदर्शिका',
      about: 'हमारे बारे में',
      history: 'इतिहास',
      login: 'साइन इन करें',
      signup: 'खाता बनाएं',
      logout: 'साइन आउट',
      settings: 'सेटिंग्स',
      menu: 'मेनू',
      close: 'बंद करें',
    },
    hero: {
      title: 'इंटर्नशिप, नौकरी या स्कॉलरशिप के लिए कभी अग्रिम शुल्क न दें।',
      subtitle: 'भारतीय छात्रों के लिए तत्काल, निःशुल्क और गोपनीयता-सुरक्षित ऑफर सत्यापन। पैसे ट्रांसफर करने या निजी दस्तावेज साझा करने से पहले स्वचालित जांच चलाएं।',
      cta: 'ऑफर की जांच करें',
      secondaryCta: 'संदिग्ध लिंक जांचें',
      notice: 'भारत सरकार की सभी आधिकारिक भर्तियां (UPSC, SSC, रेलवे, राज्य PSC) केवल उनके आधिकारिक .gov.in या .nic.in पोर्टल पर ही आयोजित की जाती हैं।',
    },
    features: {
      zeroFeesTitle: 'शून्य अग्रिम शुल्क',
      zeroFeesDesc: 'वैध नियोक्ता कभी भी प्रशिक्षण शुल्क, लैपटॉप सुरक्षा जमा या पृष्ठभूमि सत्यापन के पैसे नहीं मांगते।',
      noOtpTitle: 'कोई बैंकिंग OTP नहीं',
      noOtpDesc: 'कभी भी OTP, UPI पिन या बैंक खाता विवरण साझा न करें। वास्तविक नौकरी आपको वेतन देती है, पैसे नहीं काटती।',
      officialDomainsTitle: 'आधिकारिक डोमेन जांचें',
      officialDomainsDesc: 'सरकारी और शीर्ष तकनीकी कंपनियां केवल अपने सत्यापित कॉर्पोरेट डोमेन से भर्ती करती हैं, कभी @gmail.com या @telegram से नहीं।',
    },
    submissionCard: {
      title: 'अपना ऑफर संदेश, पत्र या ईमेल यहां पेस्ट करें',
      placeholder: 'ईमेल सामग्री, व्हाट्सएप संदेश, नियुक्ति पत्र या ऑफर विवरण यहां पेस्ट करें (न्यूनतम 20 अक्षर)...',
      sampleOffer1: 'डेमो वास्तविक ऑफर',
      sampleOffer2: 'डेमो संदिग्ध ऑफर',
      sampleOffer3: 'डेमो फर्जी शुल्क ऑफर',
      charCount: 'अक्षर',
      charMin: 'कम से कम 20 अक्षर आवश्यक हैं',
      analyzeBtn: 'अभी ऑफर की जांच करें',
      analyzing: '8 स्वचालित सुरक्षा जांच जारी हैं...',
      dropPdf: 'ऑफर पत्र PDF यहां छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
      aiConsent: 'AI-सहायता प्राप्त गहन विश्लेषण की अनुमति दें (वैकल्पिक, कोई व्यक्तिगत डेटा साझा नहीं)',
      shareIndicators: 'छात्र सुरक्षा डेटाबेस में अज्ञात संकेत योगदान करें',
    },
    auditSteps: {
      step1Title: '1. इनपुट और गोपनीयता शोधन',
      step1Desc: 'आपका टेक्स्ट आपकी डिवाइस पर ही साफ किया जाता है। विश्लेषण से पहले फोन नंबर, ईमेल और निजी पहचान हटा दिए जाते हैं।',
      step2Title: '2. स्वचालित नियम',
      step2Desc: '8 स्वचालित नियम अग्रिम शुल्क, बैंकिंग OTP मांगों, नकली डोमेन और जल्दबाजी के दबाव की जांच करते हैं।',
      step3Title: '3. साक्ष्य और अगला कदम',
      step3Desc: 'एक स्पष्ट निर्णय (संभावित वास्तविक, समीक्षा आवश्यक, या उच्च चिंता) और सुरक्षा के ठोस कदमों के साथ प्राप्त करें।',
    },
    guidelines: {
      title: 'छात्र सुरक्षा दिशानिर्देश',
      rule1: 'नियुक्ति पत्र प्राप्त करने के लिए कभी भी UPI द्वारा पैसे न भेजें।',
      rule2: 'हमेशा कंपनी के डोमेन whois रिकॉर्ड और आधिकारिक संपर्क सूची सत्यापित करें।',
      rule3: 'सरकारी भर्ती परीक्षा शुल्क केवल अधिकृत SBI Collect / Bharatkosh गेटवे के माध्यम से लिया जाता है।',
    },
    footer: {
      helplineTitle: 'राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930',
      helplineDesc: 'यदि आपके साथ धोखाधड़ी हुई है, तो तुरंत 1930 डायल करें या cybercrime.gov.in पर ऑनलाइन शिकायत दर्ज करें।',
      copyright: 'जांच – भारतीय छात्रों के लिए निःशुल्क जनसेवा। गोपनीयता-प्रथम वास्तुकला के साथ निर्मित।',
      privacy: 'गोपनीयता नीति',
      terms: 'उपयोग की शर्तें',
      about: 'हमारे बारे में',
    },
    auth: {
      signInTitle: 'जांच में साइन इन करें',
      signUpTitle: 'निःशुल्क खाता बनाएं',
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड',
      signInBtn: 'साइन इन करें',
      signUpBtn: 'खाता बनाएं',
      guestNotice: 'आप बिना खाता बनाए भी ऑफर की जांच कर सकते हैं। खाता आपके निजी इतिहास को सुरक्षित रखता है।',
      signOut: 'साइन आउट',
      googleBtn: 'गूगल से जारी रखें',
      noAccount: 'खाता नहीं है? साइन अप करें',
      haveAccount: 'पहले से खाता है? साइन इन करें',
    },
    history: {
      eyebrow: 'ऑडिट लॉग',
      title: 'सहेजे गए ऑफ़र विश्लेषण',
      subtitle: 'आपके विश्लेषित ऑफ़र, सुरक्षा परिणाम और छात्र चेकलिस्ट का निजी इतिहास।',
      unauthTitle: 'अपने सहेजे गए ऑडिट देखने के लिए साइन इन करें',
      unauthDesc: 'सहेजा गया इतिहास आपको पिछले विश्लेषणों को फिर से देखने और ट्रैक करने की अनुमति देता है।',
      filterAll: 'सभी श्रेणियाँ',
      emptyTitle: 'अभी तक कोई सहेजा गया विश्लेषण नहीं है',
      emptyDesc: 'एनालाइज़र से ऑफ़र की जाँच करें और इसे अपने निजी इतिहास में सुरक्षित करें।',
      checkOfferBtn: 'अभी ऑफ़र जाँचें',
      viewAudit: 'ऑडिट देखें',
      deleteAudit: 'हटाएं',
      deleteConfirm: 'क्या आप वाकई इस सहेजे गए ऑडिट को हटाना चाहते हैं?',
      prevPage: 'पिछला',
      nextPage: 'अगला',
      pageOf: 'पृष्ठ {current} का {total}',
    },
    settings: {
      eyebrow: 'खाता प्राथमिकताएं',
      title: 'सेटिंग्स और गोपनीयता',
      subtitle: 'अपनी प्रोफ़ाइल, पसंदीदा भाषा, गोपनीयता विकल्प और खाता डेटा प्रबंधित करें।',
      profileTitle: 'उपयोगकर्ता प्रोफ़ाइल',
      preferencesTitle: 'भाषा और गोपनीयता प्राथमिकताएं',
      langSelectLabel: 'प्रदर्शन भाषा',
      dangerTitle: 'खतरे का क्षेत्र: खाता डेटा हटाना',
      dangerDesc: 'अपने सभी सबमिशन रिकॉर्ड, सहेजे गए ऑडिट और व्यक्तिगत इतिहास को हमेशा के लिए हटाएं। यह क्रिया पूर्ववत नहीं की जा सकती।',
      eraseBtn: 'मेरा सभी डेटा हटाएं',
      eraseConfirm: 'स्थायी रूप से डेटा हटाने की पुष्टि के लिए "DELETE" लिखें:',
      eraseSuccess: 'आपके सभी सबमिशन और इतिहास को हमेशा के लिए हटा दिया गया है।',
    },
    errors: {
      networkError: 'विश्लेषण सर्वर से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
      validationError: 'कृपया ऑफर टेक्स्ट के कम से कम 20 अक्षर दर्ज करें।',
      serverError: 'ऑफर का विश्लेषण करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।',
      genericError: 'कुछ गड़बड़ हुई। कृपया पृष्ठ को रीफ्रेश करें।',
    },
    statusLabels: {
      likelyGenuine: 'संभावित वास्तविक',
      likelyGenuineDesc: 'कोई धोखाधड़ी संकेत नहीं मिला; सकारात्मक साक्ष्यों द्वारा समर्थित।',
      needsReview: 'समीक्षा आवश्यक',
      needsReviewDesc: 'अधूरी जानकारी या असत्यापित संपर्क माध्यम। सावधानी बरतें।',
      highConcern: 'उच्च चिंता',
      highConcernDesc: 'गंभीर जोखिम संकेत मिले (अग्रिम शुल्क, OTP मांग, या नकली डोमेन)।',
      confirmedScam: 'पुष्टि किया गया धोखा',
      confirmedScamDesc: 'छात्र सुरक्षा डेटाबेस में पुष्टि किए गए फर्जी रिकॉर्ड से मेल खाता है।',
    },
    analyzer: {
      title: 'ऑफ़र की प्रामाणिकता जाँचें',
      subtitle: 'पैसे देने या दस्तावेज़ साझा करने से पहले नियुक्ति पत्र, व्हाट्सएप संदेश या छात्रवृत्ति की जाँच करें।',
      badge: 'विश्लेषण इंजन',
      tabPaste: 'संदेश टेक्स्ट पेस्ट करें',
      tabUpload: 'दस्तावेज़ अपलोड करें',
      textLabel: 'ऑफ़र संदेश या ईमेल टेक्स्ट',
      textPlaceholder: 'पूरा संदेश, ईमेल सामग्री या व्हाट्सएप संदेश यहाँ पेस्ट करें (कम से कम 25 अक्षर)...',
      charCounter: 'अक्षर',
      charMinAlert: 'सटीक विश्लेषण के लिए कम से कम 25 अक्षर आवश्यक हैं',
      domainLabel: 'अवसर की श्रेणी',
      domainHelp: 'लक्षित सुरक्षा जाँच के लिए अवसर का प्रकार चुनें',
      domains: {
        job: 'नौकरी का ऑफ़र',
        internship: 'इंटर्नशिप कार्यक्रम',
        scholarship: 'छात्रवृत्ति / अनुदान',
        freelance: 'फ्रीलांस / प्रोजेक्ट',
        competition: 'प्रतियोगिता / हैकाथॉन',
        general_message: 'सामान्य संदेश / एसएमएस',
        other: 'अन्य अवसर',
      },
      senderToggle: 'प्रेषक और संपर्क विवरण जोड़ें (वैकल्पिक)',
      senderEmail: 'भर्तीकर्ता / प्रेषक ईमेल',
      senderEmailPlaceholder: 'उदा. hr@company-careers.org',
      senderPhone: 'भर्तीकर्ता फोन / व्हाट्सएप',
      senderPhonePlaceholder: 'उदा. +91 98765 43210',
      senderDomain: 'कंपनी वेबसाइट / डोमेन',
      senderDomainPlaceholder: 'उदा. company.com',
      senderOrg: 'संबंधित संस्था / कंपनी',
      senderOrgPlaceholder: 'उदा. Infosys, TCS, Wipro',
      headersToggle: 'कच्चा ईमेल हेडर (वैकल्पिक, SPF/DKIM जाँच के लिए)',
      headersPlaceholder: 'RFC 822 ईमेल हेडर यहाँ पेस्ट करें...',
      consentAi: 'AI गहन विश्लेषण की अनुमति दें (शून्य PII साझा)',
      consentAiSub: 'निजी जानकारी हटाने के बाद भाषा विश्लेषण की अनुमति दें।',
      consentShare: 'अज्ञात धोखाधड़ी संकेतक साझा करें',
      consentShareSub: 'अन्य छात्रों की सुरक्षा के लिए केवल फ़ोन या डोमेन का कूटबद्ध हैश साझा करें।',
      consentHistory: 'ऑडिट को निजी इतिहास में सहेजें',
      consentHistorySub: 'बाद में देखने के लिए आपके व्यक्तिगत डैशबोर्ड में ऑडिट सहेजता है (लॉगिन आवश्यक)।',
      channelLabel: 'संचार माध्यम',
      channels: {
        email: 'ईमेल',
        whatsapp: 'व्हाट्सएप',
        telegram: 'टेलीग्राम',
        sms: 'एसएमएस / संदेश',
        linkedin: 'लिंक्डइन / सोशल मीडिया',
        website: 'जॉब पोर्टल / वेबसाइट',
        other: 'अन्य माध्यम',
      },
      claimedOrgLabel: 'दावा किया गया संगठन',
      claimedOrgPlaceholder: 'संगठन का नाम चुनें या लिखें (उदा. टीसीएस, इन्फोसिस, एआईसीटीई)...',
      redactionPreviewTitle: 'क्लाइंट रिडेक्शन पूर्वावलोकन',
      redactionPreviewSub: 'सर्वर को क्या भेजा जाएगा। आपके व्यक्तिगत विवरण भेजने से पहले ब्राउज़र में सुरक्षित किए जाते हैं।',
      redactionPreviewCount: 'व्यक्तिगत विवरण ब्राउज़र में सुरक्षित किए गए (फ़ोन, आधार, यूपीआई)',
      redactionPreviewZero: 'संदेश में कोई संवेदनशील व्यक्तिगत विवरण नहीं मिला',
      ocrLanguageLabel: 'दस्तावेज़ की भाषा (OCR)',
      ocrCancelBtn: 'OCR रद्द करें',
      ocrScannedPdfNotice: 'स्कैन किया गया पीडीएफ मिला। स्थानीय ओसीआर द्वारा टेक्स्ट निकाला गया।',
      privacyNotice: 'गोपनीयता सुरक्षा: विश्लेषण से पहले सभी व्यक्तिगत जानकारी (नाम, फोन, आधार) हटा दी जाती है। दस्तावेज़ केवल आपके ब्राउज़र में पढ़े जाते हैं और सर्वर पर कभी नहीं भेजे जाते।',
      dropzoneTitle: 'अपनी PDF या TXT फ़ाइल यहाँ छोड़ें',
      dropzoneSub: 'या अपने डिवाइस से चुनने के लिए क्लिक करें',
      dropzoneSupported: 'PDF (.pdf) और टेक्स्ट (.txt) 10MB तक समर्थित',
      extractingPdf: 'ब्राउज़र में टेक्स्ट निकाला जा रहा है...',
      extractedFile: 'दस्तावेज़ लोड किया गया',
      removeFile: 'फ़ाइल हटाएं',
      samplesPrompt: 'या नमूना परिदृश्य आज़माएँ:',
      sampleGenuine: 'वास्तविक इंटर्नशिप',
      sampleFeeScam: 'अग्रिम शुल्क धोखा',
      sampleOtpScam: 'OTP फ़िशिंग धोखा',
      verifyBtn: 'अभी ऑफ़र जाँचें',
      verifyingBtn: 'सुरक्षा विश्लेषण जारी है...',
      clearBtn: 'साफ़ करें',
      progressStep1: 'निजी जानकारी का स्थानीय शोधन किया जा रहा है...',
      progressStep2: '8 स्वचालित सुरक्षा नियमों की जाँच जारी है...',
      progressStep3: 'लिंक और नकली डोमेन का विश्लेषण किया जा रहा है...',
      progressStep4: 'पारदर्शी साक्ष्य रिपोर्ट तैयार की जा रही है...',
      pasteClipboard: 'क्लिपबोर्ड से पेस्ट करें',
      copiedNotice: 'क्लिपबोर्ड से पेस्ट किया गया',
    },
    results: {
      eyebrow: 'सत्यापन परिणाम',
      verdictLabel: 'सत्यापन स्थिति',
      meterLabel: 'स्वतंत्र सुरक्षा परीक्षण',
      confidenceLabel: 'मूल्यांकन विश्वसनीयता',
      paymentAlertTitle: 'भुगतान और बैंकिंग सुरक्षा चेतावनी',
      paymentAlertDesc: 'इस संदेश में अग्रिम शुल्क, जमा राशि या बैंक OTP मांगा गया है। वैध नियोक्ता कभी पैसे या OTP नहीं मांगते।',
      paymentAlertCall1930: 'यदि आपने पहले ही पैसे भेजे हैं, तो तुरंत 1930 डायल करें या cybercrime.gov.in पर शिकायत दर्ज करें।',
      whyTitle: 'इस निर्णय का आधार',
      signalsTitle: 'पहचाने गए जोखिम संकेत',
      signalsEmpty: 'सबमिट किए गए संदेश में कोई धोखाधड़ी संकेत नहीं मिला।',
      evidenceQuote: 'निकाला गया साक्ष्य',
      whyItMatters: 'यह क्यों महत्वपूर्ण है',
      unverifiedTitle: 'लंबित और असत्यापित विवरण',
      unverifiedDesc: 'निम्नलिखित महत्वपूर्ण विवरण आधिकारिक स्रोतों से सत्यापित नहीं हो सके। स्वयं पुष्टि करने तक सावधानी बरतें:',
      entitiesTitle: 'पहचाने गए अवसर संकेतक',
      upiLabel: 'UPI / भुगतान पते',
      phonesLabel: 'फ़ोन और व्हाट्सएप नंबर',
      domainsLabel: 'वेबसाइट और लिंक',
      amountsLabel: 'उल्लिखित राशियाँ',
      orgLabel: 'दावा किया गया संगठन',
      nextStepsTitle: 'कार्रवाई योग्य अगले कदम',
      stepCheckedTitle: '1. जांच द्वारा परखे गए नियम',
      stepYourTurnTitle: '2. आपकी बारी: छात्र सत्यापन चेकलिस्ट',
      stepProtectTitle: '3. आपातकालीन धोखाधड़ी रोकथाम',
      iPaidToggle: 'मैंने पहले ही पैसे भेजे हैं या संवेदनशील दस्तावेज़ साझा किए हैं',
      iPaidNotice: 'आपातकालीन कार्रवाई: लाभार्थी खाते को फ्रीज कराने के लिए 1930 (राष्ट्रीय साइबर हेल्पलाइन) पर तुरंत कॉल करें। cybercrime.gov.in पर औपचारिक शिकायत दर्ज करें।',
      exportPdf: 'PDF रिपोर्ट डाउनलोड करें',
      exportPrint: 'रिपोर्ट प्रिंट करें',
      exportJson: 'JSON निर्यात करें',
      checkAnother: 'अन्य ऑफ़र की जांच करें',
      sampleWalkthroughTitle: 'नमूना रिपोर्ट वॉकथ्रू',
      sampleWalkthroughSubtitle: 'चार-निर्णय मॉडल और साक्ष्य वास्तुकला को समझाने वाली संदर्भ रिपोर्टें।',
      sampleTabGenuine: 'वास्तविक ऑफ़र नमूना',
      sampleTabReview: 'समीक्षा आवश्यक नमूना',
      sampleTabConcern: 'शुल्क धोखाधड़ी नमूना',
      emptyTitle: 'कोई ऑडिट परिणाम लोड नहीं हुआ',
      emptyDesc: 'सत्यापन परिणाम देखने के लिए कृपया जांच पृष्ठ पर ऑफ़र विवरण दर्ज करें।',
      emptyCta: 'ऑफ़र की जांच करें',
    },

    // Compatibility aliases
    nav: {
      brand: 'जाँच',
      tagline: 'डिजिटल विश्वास और सुरक्षा',
      checkOffer: 'ऑफ़र जाँचें',
      linkInspector: 'लिंक निरीक्षक',
      verificationGuide: 'सत्यापन मार्गदर्शिका',
      about: 'परिचय',
      login: 'साइन इन',
      signup: 'खाता बनाएँ',
      history: 'इतिहास',
      settings: 'सेटिंग्स',
      logout: 'साइन आउट',
      openMenu: 'मेनू खोलें',
      closeMenu: 'मेनू बंद करें',
    },
    feedback: {
      pillQuestion: 'क्या यह पृष्ठ मददगार था?',
      yes: 'हाँ',
      no: 'नहीं',
      thanks: 'भारतीय छात्रों को सुरक्षित रखने में मदद के लिए धन्यवाद!',
    },
    skipLink: 'मुख्य सामग्री पर जाएँ',
    languages: {
      en: 'English',
      hi: 'हिंदी',
      kn: 'ಕನ್ನಡ',
    },
  },
  kn: {
    navigation: {
      brand: 'ಜಾಂಚ್.',
      tagline: 'ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ನಂಬಿಕೆ ಮತ್ತು ಸುರಕ್ಷತೆ',
      verifyOffer: 'ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      linkCheck: 'ಲಿಂಕ್ ಪರಿಶೀಲನೆ',
      resources: 'ಪರಿಶೀಲನಾ ಮಾರ್ಗದರ್ಶಿ',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
      history: 'ಇತಿಹಾಸ',
      login: 'ಸೈನ್ ಇನ್',
      signup: 'ಖಾತೆ ತೆರೆಯಿರಿ',
      logout: 'ಸೈನ್ ಔಟ್',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      menu: 'ಮೆನು',
      close: 'ಮುಚ್ಚಿ',
    },
    hero: {
      title: 'ಇಂಟರ್ನ್‌ಶಿಪ್, ಉದ್ಯೋಗ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕಾಗಿ ಮುಂಗಡ ಹಣವನ್ನು ಎಂದಿಗೂ ಪಾವತಿಸಬೇಡಿ.',
      subtitle: 'ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತ್ವರಿತ, ಉಚಿತ ಮತ್ತು ಗೌಪ್ಯತೆ-ರಕ್ಷಿತ ಆಫರ್ ಪರಿಶೀಲನೆ. ಹಣ ವರ್ಗಾಯಿಸುವ ಅಥವಾ ದಾಖಲೆ ಹಂಚಿಕೊಳ್ಳುವ ಮುನ್ನ ಸ್ವಯಂಚಾಲಿತ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
      cta: 'ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      secondaryCta: 'ಲಿಂಕ್ ಪರಿಶೀಲಿಸಿ',
      notice: 'ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ನೇಮಕಾತಿಗಳು (UPSC, SSC, ರೈಲ್ವೆ, KPSC) ಕೇವಲ ಅಧಿಕೃತ .gov.in ಅಥವಾ .nic.in ಪೋರ್ಟಲ್‌ಗಳ ಮೂಲಕವೇ ನಡೆಯುತ್ತವೆ.',
    },
    features: {
      zeroFeesTitle: 'ಶೂನ್ಯ ಮುಂಗಡ ಶುಲ್ಕ',
      zeroFeesDesc: 'ನಿಜವಾದ ಉದ್ಯೋಗದಾತರು ತರಬೇತಿ ಶುಲ್ಕ, ಲ್ಯಾಪ್‌ಟಾಪ್ ಠೇವಣಿ ಅಥವಾ ಹಿನ್ನೆಲೆ ಪರಿಶೀಲನಾ ವೆಚ್ಚವನ್ನು ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.',
      noOtpTitle: 'ಬ್ಯಾಂಕಿಂಗ್ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ',
      noOtpDesc: 'ಯಾವುದೇ ಕಾರಣಕ್ಕೂ OTP, UPI ಪಿನ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ನೈಜ ಉದ್ಯೋಗ ನಿಮಗೆ ಸಂಬಳ ನೀಡುತ್ತದೆ, ಹಣ ಕಳೆಯುವುದಿಲ್ಲ.',
      officialDomainsTitle: 'ಅಧಿಕೃತ ಡೊಮೇನ್ ಪರಿಶೀಲಿಸಿ',
      officialDomainsDesc: 'ಸರ್ಕಾರಿ ಮತ್ತು ಪ್ರಮುಖ ಕಂಪನಿಗಳು ತಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಪೊರೇಟ್ ಡೊಮೇನ್‌ಗಳಿಂದ ಮಾತ್ರ ನೇಮಕಾತಿ ಮಾಡುತ್ತವೆ, @gmail.com ಅಥವಾ ಟೆಲಿಗ್ರಾಮ್ ಮೂಲಕ ಅಲ್ಲ.',
    },
    submissionCard: {
      title: 'ನಿಮ್ಮ ಆಫರ್ ಸಂದೇಶ, ನೇಮಕಾತಿ ಪತ್ರ ಅಥವಾ ಇಮೇಲ್ ಇಲ್ಲಿ ಅಂಟಿಸಿ',
      placeholder: 'ಇಮೇಲ್ ಪಠ್ಯ, ವಾಟ್ಸಾಪ್ ಸಂದೇಶ, ನೇಮಕಾತಿ ಪತ್ರ ಅಥವಾ ಆಫರ್ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ (ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳು)...',
      sampleOffer1: 'ಡೆಮೊ ನೈಜ ಆಫರ್',
      sampleOffer2: 'ಡೆಮೊ ಅನುಮಾನಾಸ್ಪದ ಆಫರ್',
      sampleOffer3: 'ಡೆಮೊ ವಂಚನೆ ಶುಲ್ಕ ಆಫರ್',
      charCount: 'ಅಕ್ಷರಗಳು',
      charMin: 'ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳು ಅಗತ್ಯವಿದೆ',
      analyzeBtn: 'ಈಗಲೇ ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      analyzing: '8 ಸ್ವಯಂಚಾಲಿತ ನಿಯಮಗಳ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ...',
      dropPdf: 'ಆಫರ್ ಪತ್ರದ PDF ಇಲ್ಲಿ ಡ್ರಾಪ್ ಮಾಡಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
      aiConsent: 'AI-ಸಹಾಯದ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಗೆ ಅನುಮತಿಸಿ (ಐಚ್ಛಿಕ, ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ)',
      shareIndicators: 'ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ಡೇಟಾಬೇಸ್‌ಗೆ ಅನಾಮಧೇಯ ಸಂಕೇತಗಳನ್ನು ನೀಡಿ',
    },
    auditSteps: {
      step1Title: '1. ಇನ್‌ಪುಟ್ ಮತ್ತು ಗೌಪ್ಯತೆ ಶುದ್ಧೀಕರಣ',
      step1Desc: 'ನಿಮ್ಮ ಪಠ್ಯವನ್ನು ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಸುರಕ್ಷಿತಗೊಳಿಸಲಾಗುತ್ತದೆ. ಫೋನ್ ಸಂಖ್ಯೆ, ಇಮೇಲ್ ಮತ್ತು ವೈಯಕ್ತಿಕ ಗುರುತನ್ನು ವಿಶ್ಲೇಷಣೆಗೆ ಮುನ್ನ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
      step2Title: '2. ಸ್ವಯಂಚಾಲಿತ ನಿಯಮಗಳು',
      step2Desc: '8 ಸ್ವಯಂಚಾಲಿತ ನಿಯಮಗಳು ಮುಂಗಡ ಶುಲ್ಕ, ಬ್ಯಾಂಕಿಂಗ್ OTP ಬೇಡಿಕೆಗಳು, ನಕಲಿ ಡೊಮೇನ್‌ಗಳು ಮತ್ತು ಒತ್ತಡದ ಸಂದೇಶಗಳನ್ನು ಪರೀಕ್ಷಿಸುತ್ತವೆ.',
      step3Title: '3. ಸಾಕ್ಷ್ಯ ಮತ್ತು ಮುಂದಿನ ಕ್ರಮಗಳು',
      step3Desc: 'ಸ್ಪಷ್ಟ ತೀರ್ಪು (ಬಹುಶಃ ನೈಜ, ಪರಿಶೀಲನೆ ಅಗತ್ಯ, ಅಥವಾ ತೀವ್ರ ಕಳವಳ) ಮತ್ತು ನಿಖರ ಸುರಕ್ಷತಾ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    },
    guidelines: {
      title: 'ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು',
      rule1: 'ನೇಮಕಾತಿ ಪತ್ರ ಪಡೆಯಲು ಎಂದಿಗೂ UPI ಮೂಲಕ ಹಣ ವರ್ಗಾಯಿಸಬೇಡಿ.',
      rule2: 'ಯಾವಾಗಲೂ ಕಂಪನಿಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      rule3: 'ಸರ್ಕಾರಿ ನೇಮಕಾತಿ ಪರೀಕ್ಷಾ ಶುಲ್ಕಗಳನ್ನು ಅಧಿಕೃತ SBI Collect / Bharatkosh ಮೂಲಕ ಮಾತ್ರ ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    },
    footer: {
      helplineTitle: 'ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ: 1930',
      helplineDesc: 'ನೀವು ಆನ್‌ಲೈನ್ ವಂಚನೆಗೆ ಒಳಗಾಗಿದ್ದರೆ, ತಕ್ಷಣವೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.',
      copyright: 'ಜಾಂಚ್ – ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಉಚಿತ ಸಾರ್ವಜನಿಕ ಸೇವೆ. ಗೌಪ್ಯತೆ-ಮೊದಲ ವಿನ್ಯಾಸ.',
      privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
      terms: 'ಬಳಕೆಯ ನಿಯಮಗಳು',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    },
    auth: {
      signInTitle: 'ಜಾಂಚ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      signUpTitle: 'ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ',
      emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
      passwordLabel: 'ಗುಪ್ತಪದ (ಪಾಸ್‌ವರ್ಡ್)',
      signInBtn: 'ಸೈನ್ ಇನ್',
      signUpBtn: 'ಖಾತೆ ತೆರೆಯಿರಿ',
      guestNotice: 'ಖಾತೆ ಇಲ್ಲದೆಯೂ ನೀವು ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು. ಖಾತೆಯು ನಿಮ್ಮ ಖಾಸಗಿ ಇತಿಹಾಸವನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ನೆರವಾಗುತ್ತದೆ.',
      signOut: 'ಸೈನ್ ಔಟ್',
      googleBtn: 'ಗೂಗಲ್ ಮೂಲಕ ಮುಂದುವರಿಯಿರಿ',
      noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ',
      haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ',
    },
    history: {
      eyebrow: 'ಆಡಿಟ್ ಲಾಗ್',
      title: 'ಉಳಿಸಲಾದ ಆಫರ್ ವಿಶ್ಲೇಷಣೆಗಳು',
      subtitle: 'ನಿಮ್ಮ ವಿಶ್ಲೇಷಿತ ಆಫರ್‌ಗಳು, ಫಲಿತಾಂಶಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ಚೆಕ್‌ಲಿಸ್ಟ್‌ಗಳ ಖಾಸಗಿ ಇತಿಹಾಸ.',
      unauthTitle: 'ಉಳಿಸಲಾದ ಆಡಿಟ್ ಇತಿಹಾಸವನ್ನು ನೋಡಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
      unauthDesc: 'ಉಳಿಸಲಾದ ಇತಿಹಾಸವು ಹಿಂದಿನ ಪರಿಶೀಲನೆಗಳನ್ನು ಮರುಪರಿಶೀಲಿಸಲು ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಅನುಮತಿಸುತ್ತದೆ.',
      filterAll: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು',
      emptyTitle: 'ಇನ್ನೂ ಯಾವುದೇ ಉಳಿಸಿದ ವಿಶ್ಲೇಷಣೆಗಳಿಲ್ಲ',
      emptyDesc: 'ವಿಶ್ಲೇಷಕ ಬಳಸಿ ಆಫರ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅದನ್ನು ನಿಮ್ಮ ಖಾಸಗಿ ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಸಿ.',
      checkOfferBtn: 'ಈಗ ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      viewAudit: 'ಆಡಿಟ್ ವೀಕ್ಷಿಸಿ',
      deleteAudit: 'ಅಳಿಸಿ',
      deleteConfirm: 'ಈ ಉಳಿಸಲಾದ ಆಡಿಟ್ ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?',
      prevPage: 'ಹಿಂದಿನ',
      nextPage: 'ಮುಂದಿನ',
      pageOf: 'ಪುಟ {current} ರ {total}',
    },
    settings: {
      eyebrow: 'ಖಾತೆ ಆದ್ಯತೆಗಳು',
      title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಗೌಪ್ಯತೆ',
      subtitle: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಆದ್ಯತೆಯ ಭಾಷೆ, ಗೌಪ್ಯತೆ ಆಯ್ಕೆಗಳು ಮತ್ತು ಖಾತೆ ಡೇಟಾವನ್ನು ನಿರ್ವಹಿಸಿ.',
      profileTitle: 'ಬಳಕೆದಾರ ಪ್ರೊಫೈಲ್',
      preferencesTitle: 'ಭಾಷೆ ಮತ್ತು ಗೌಪ್ಯತೆ ಆದ್ಯತೆಗಳು',
      langSelectLabel: 'ಪ್ರದರ್ಶನ ಭಾಷೆ',
      dangerTitle: 'ಅಪಾಯಕಾರಿ ವಲಯ: ಖಾತೆ ಡೇಟಾ ಅಳಿಸುವಿಕೆ',
      dangerDesc: 'ನಿಮ್ಮ ಎಲ್ಲಾ ಸಲ್ಲಿಕೆ ದಾಖಲೆಗಳು, ಉಳಿಸಲಾದ ಆಡಿಟ್‌ಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಇತಿಹಾಸವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ.',
      eraseBtn: 'ನನ್ನ ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಅಳಿಸಿ',
      eraseConfirm: 'ಶಾಶ್ವತವಾಗಿ ಡೇಟಾ ಅಳಿಸಲು "DELETE" ಎಂದು ಟೈಪ್ ಮಾಡಿ:',
      eraseSuccess: 'ನಿಮ್ಮ ಎಲ್ಲಾ ಸಲ್ಲಿಕೆಗಳು ಮತ್ತು ಇತಿಹಾಸವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗಿದೆ.',
    },
    errors: {
      networkError: 'ಸರ್ವರ್ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      validationError: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳ ಆಫರ್ ವಿವರವನ್ನು ನಮೂದಿಸಿ.',
      serverError: 'ಆಫರ್ ವಿಶ್ಲೇಷಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      genericError: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.',
    },
    statusLabels: {
      likelyGenuine: 'ಬಹುಶಃ ನೈಜ',
      likelyGenuineDesc: 'ಯಾವುದೇ ವಂಚನೆಯ ಸಂಕೇತಗಳು ಕಂಡುಬಂದಿಲ್ಲ; ಸಕಾರಾತ್ಮಕ ಸಾಕ್ಷ್ಯಗಳಿಂದ ದೃಢಪಟ್ಟಿದೆ.',
      needsReview: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯ',
      needsReviewDesc: 'ಅಪೂರ್ಣ ಮಾಹಿತಿ ಅಥವಾ ಅಪ್ರಮಾಣಿತ ಸಂಪರ್ಕ ಮಾರ್ಗಗಳು. ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.',
      highConcern: 'ತೀವ್ರ ಕಳವಳ',
      highConcernDesc: 'ಗಂಭೀರ ಅಪಾಯದ ಸಂಕೇತಗಳು ಪತ್ತೆಯಾಗಿವೆ (ಮುಂಗಡ ಶುಲ್ಕ, OTP ಬೇಡಿಕೆ ಅಥವಾ ನಕಲಿ ಡೊಮೇನ್).',
      confirmedScam: 'ಖಚಿತ ವಂಚನೆ',
      confirmedScamDesc: 'ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಖಚಿತಪಡಿಸಲಾದ ವಂಚನೆಯ ದಾಖಲೆಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
    },
    analyzer: {
      title: 'ಆಫರ್ ಅಧಿಕೃತತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
      subtitle: 'ಹಣ ಪಾವತಿಸುವ ಅಥವಾ ದಾಖಲೆ ಹಂಚಿಕೊಳ್ಳುವ ಮುನ್ನ ನೇಮಕಾತಿ ಪತ್ರ, ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನವನ್ನು ಪರೀಕ್ಷಿಸಿ.',
      badge: 'ವಿಶ್ಲೇಷಣಾ ಎಂಜಿನ್',
      tabPaste: 'ಸಂದೇಶ ಪಠ್ಯ ಅಂಟಿಸಿ',
      tabUpload: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      textLabel: 'ಆಫರ್ ಸಂದೇಶ ಅಥವಾ ಇಮೇಲ್ ಪಠ್ಯ',
      textPlaceholder: 'ಸಂಪೂರ್ಣ ಸಂದೇಶ, ಇಮೇಲ್ ವಿವರ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ (ಕನಿಷ್ಠ 25 ಅಕ್ಷರಗಳು)...',
      charCounter: 'ಅಕ್ಷರಗಳು',
      charMinAlert: 'ವಿಶ್ವಾಸಾರ್ಹ ವಿಶ್ಲೇಷಣೆಗೆ ಕನಿಷ್ಠ 25 ಅಕ್ಷರಗಳು ಅಗತ್ಯವಿದೆ',
      domainLabel: 'ಅವಕಾಶದ ವರ್ಗ',
      domainHelp: 'ಉದ್ದೇಶಿತ ಪರಿಶೀಲನೆಗಾಗಿ ಅವಕಾಶದ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      domains: {
        job: 'ಉದ್ಯೋಗ ಆಫರ್',
        internship: 'ಇಂಟರ್ನ್‌ಶಿಪ್ ಪ್ರೋಗ್ರಾಂ',
        scholarship: 'ವಿದ್ಯಾರ್ಥಿವೇತನ / ಅನುದಾನ',
        freelance: 'ಫ್ರೀಲ್ಯಾನ್ಸ್ / ಗಿಗ್ ಕೆಲಸ',
        competition: 'ಸ್ಪರ್ಧೆ / ಹ್ಯಾಕಥಾನ್',
        general_message: 'ಸಾಮಾನ್ಯ ಸಂದೇಶ / SMS',
        other: 'ಇತರ ಅವಕಾಶ',
      },
      senderToggle: 'ಕಳುಹಿಸುವವರ ವಿವರಗಳು (ಐಚ್ಛಿಕ)',
      senderEmail: 'ಕಳುಹಿಸಿದವರ ಇಮೇಲ್',
      senderEmailPlaceholder: 'ಉದಾ. hr@company-careers.org',
      senderPhone: 'ಕಳುಹಿಸಿದವರ ಫೋನ್ / ವಾಟ್ಸಾಪ್',
      senderPhonePlaceholder: 'ಉದಾ. +91 98765 43210',
      senderDomain: 'ಕಂಪನಿ ವೆಬ್‌ಸೈಟ್ / ಡೊಮೇನ್',
      senderDomainPlaceholder: 'ಉದಾ. company.com',
      senderOrg: 'ಸಂಬಂಧಿತ ಸಂಸ್ಥೆ / ಕಂಪನಿ',
      senderOrgPlaceholder: 'ಉದಾ. Infosys, TCS, Wipro',
      headersToggle: 'ಕಚ್ಚಾ ಇಮೇಲ್ ಹೆಡರ್‌ಗಳು (ಐಚ್ಛಿಕ, SPF/DKIM ಗಾಗಿ)',
      headersPlaceholder: 'RFC 822 ಇಮೇಲ್ ಹೆಡರ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...',
      consentAi: 'AI ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಗೆ ಅನುಮತಿಸಿ (ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ)',
      consentAiSub: 'ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ತೆಗೆದುಹಾಕಿದ ನಂತರ ಭಾಷಾ ವಿಶ್ಲೇಷಣೆ ನಡೆಸಲಾಗುತ್ತದೆ.',
      consentShare: 'ಅನಾಮಧೇಯ ವಂಚನೆ ಸಂಕೇತಗಳನ್ನು ನೀಡಿ',
      consentShareSub: 'ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಎಚ್ಚರಿಸಲು ವಂಚನೆ ಫೋನ್ ಅಥವಾ ಡೊಮೇನ್ ಹ್ಯಾಶ್ ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ.',
      consentHistory: 'ಆಡಿಟ್ ಅನ್ನು ಖಾಸಗಿ ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಸಿ',
      consentHistorySub: 'ನಂತರದ ಪರಿಶೀಲನೆಗಾಗಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್ನಲ್ಲಿ ಆಡಿಟ್ ಉಳಿಸುತ್ತದೆ (ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ).',
      channelLabel: 'ಸಂವಹನ ಮಾಧ್ಯಮ',
      channels: {
        email: 'ಇಮೇಲ್',
        whatsapp: 'ವಾಟ್ಸಾಪ್',
        telegram: 'ಟೆಲಿಗ್ರಾಂ',
        sms: 'ಎಸ್ಎಂಎಸ್ / ಸಂದೇಶ',
        linkedin: 'ಲಿಂಕ್ಡ್ಇನ್ / ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ',
        website: 'ಉದ್ಯೋಗ ಪೋರ್ಟಲ್ / ವೆಬ್ಸೈಟ್',
        other: 'ಇತರ ಮಾಧ್ಯಮ',
      },
      claimedOrgLabel: 'ಘೋಷಿಸಿದ ಸಂಸ್ಥೆ',
      claimedOrgPlaceholder: 'ಸಂಸ್ಥೆಯ ಹೆಸರನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಮೂದಿಸಿ (ಉದಾ. ಟಿಸಿಎಸ್, ಇನ್ಫೋಸಿಸ್)...',
      redactionPreviewTitle: 'ಕ್ಲೈಂಟ್ ಮರೆಮಾಚುವಿಕೆ ಪೂರ್ವವೀಕ್ಷಣೆ',
      redactionPreviewSub: 'ಸರ್ವರ್ಗೆ ಏನನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಕಳುಹಿಸುವ ಮೊದಲು ಮರೆಮಾಡಲಾಗುತ್ತದೆ.',
      redactionPreviewCount: 'ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ (ಫೋನ್, ಆಧಾರ್, ಯುಪಿಐ)',
      redactionPreviewZero: 'ಸಂದೇಶದಲ್ಲಿ ಯಾವುದೇ ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ',
      ocrLanguageLabel: 'ದಾಖಲೆಯ ಭಾಷೆ (OCR)',
      ocrCancelBtn: 'OCR ರದ್ದುಮಾಡಿ',
      ocrScannedPdfNotice: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಪಿಡಿಎಫ್ ಕಂಡುಬಂದಿದೆ. ಸ್ಥಳೀಯ ಓಸಿಆರ್ ಮೂಲಕ ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲಾಗಿದೆ.',
      privacyNotice: 'ಗೌಪ್ಯತೆ ಗ್ಯಾರಂಟಿ: ವಿಶ್ಲೇಷಣೆಗೆ ಮುನ್ನ ಎಲ್ಲಾ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು (ಹೆಸರು, ಫೋನ್, ಆಧಾರ್) ರಕ್ಷಿಸಲಾಗುತ್ತದೆ. ದಾಖಲೆಗಳನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಓದಲಾಗುತ್ತದೆ ಮತ್ತು ಎಂದಿಗೂ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸುವುದಿಲ್ಲ.',
      dropzoneTitle: 'ನಿಮ್ಮ PDF ಅಥವಾ TXT ಫೈಲ್ ಇಲ್ಲಿ ಡ್ರಾಪ್ ಮಾಡಿ',
      dropzoneSub: 'ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
      dropzoneSupported: 'PDF (.pdf) ಮತ್ತು ಪಠ್ಯ (.txt) 10MB ವರೆಗೆ ಬೆಂಬಲಿತವಾಗಿದೆ',
      extractingPdf: 'ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...',
      extractedFile: 'ದಾಖಲೆ ಲೋಡ್ ಆಗಿದೆ',
      removeFile: 'ಫೈಲ್ ತೆಗೆದುಹಾಕಿ',
      samplesPrompt: 'ಅಥವಾ ಮಾದರಿಯೊಂದಿಗೆ ಪರೀಕ್ಷಿಸಿ:',
      sampleGenuine: 'ನೈಜ ಇಂಟರ್ನ್‌ಶಿಪ್',
      sampleFeeScam: 'ಮುಂಗಡ ಶುಲ್ಕ ವಂಚನೆ',
      sampleOtpScam: 'OTP ಫಿಶಿಂಗ್ ವಂಚನೆ',
      verifyBtn: 'ಈಗಲೇ ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      verifyingBtn: 'ಸುರಕ್ಷತಾ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...',
      clearBtn: 'ಅಳಿಸಿ',
      progressStep1: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
      progressStep2: '8 ಸ್ವಯಂಚಾಲಿತ ನಿಯಮಗಳ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ...',
      progressStep3: 'ಲಿಂಕ್‌ಗಳು ಮತ್ತು ನಕಲಿ ಡೊಮೇನ್‌ಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      progressStep4: 'ಪಾರದರ್ಶಕ ಸಾಕ್ಷ್ಯ ವರದಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      pasteClipboard: 'ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ನಿಂದ ಅಂಟಿಸಿ',
      copiedNotice: 'ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ನಿಂದ ಅಂಟಿಸಲಾಗಿದೆ',
    },
    results: {
      eyebrow: 'ದೃಢೀಕರಣ ಫಲಿತಾಂಶ',
      verdictLabel: 'ಪರಿಶೀಲನಾ ಸ್ಥಿತಿ',
      meterLabel: 'ಸ್ವತಂತ್ರ ತಪಾಸಣೆಗಳು',
      confidenceLabel: 'ಮೌಲ್ಯಮಾಪನ ವಿಶ್ವಾಸಾರ್ಹತೆ',
      paymentAlertTitle: 'ಪಾವತಿ ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ',
      paymentAlertDesc: 'ಈ ಸಂದೇಶದಲ್ಲಿ ಮುಂಗಡ ಶುಲ್ಕ, ಠೇವಣಿ ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ OTP ಕೇಳಲಾಗಿದೆ. ಅಧಿಕೃತ ಉದ್ಯೋಗದಾತರು ಎಂದಿಗೂ ಹಣ ಅಥವಾ OTP ಕೇಳುವುದಿಲ್ಲ.',
      paymentAlertCall1930: 'ನೀವು ಈಗಾಗಲೇ ಹಣ ಪಾವತಿಸಿದ್ದರೆ ತಕ್ಷಣವೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.',
      whyTitle: 'ಈ ನಿರ್ಧಾರಕ್ಕೆ ಕಾರಣಗಳು',
      signalsTitle: 'ಪತ್ತೆಯಾದ ಅಪಾಯಕಾರಿ ಸಂಕೇತಗಳು',
      signalsEmpty: 'ಸಲ್ಲಿಸಲಾದ ಸಂದೇಶದಲ್ಲಿ ಯಾವುದೇ ವಂಚನೆ ಸಂಕೇತಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      evidenceQuote: 'ಪಡೆಯಲಾದ ಸಾಕ್ಷ್ಯ',
      whyItMatters: 'ಇದು ಏಕೆ ಮುಖ್ಯ',
      unverifiedTitle: 'ಬಾಕಿ ಉಳಿದಿರುವ ಮತ್ತು ಪರಿಶೀಲಿಸದ ವಿವರಗಳು',
      unverifiedDesc: 'ಕೆಳಗಿನ ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸುವವರೆಗೆ ಎಚ್ಚರವಹಿಸಿ:',
      entitiesTitle: 'ಪತ್ತೆಯಾದ ಅವಕಾಶದ ವಿವರಗಳು',
      upiLabel: 'UPI / ಪಾವತಿ ಖಾತೆಗಳು',
      phonesLabel: 'ಫೋನ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆಗಳು',
      domainsLabel: 'ವೆಬ್‌ಸೈಟ್‌ಗಳು ಮತ್ತು ಲಿಂಕ್‌ಗಳು',
      amountsLabel: 'ಉಲ್ಲೇಖಿಸಲಾದ ಮೊತ್ತ',
      orgLabel: 'ಸಂಬಂಧಿತ ಸಂಸ್ಥೆ',
      nextStepsTitle: 'ಮುಂದಿನ ನಿರ್ಣಾಯಕ ಕ್ರಮಗಳು',
      stepCheckedTitle: '1. ಜಾಂಚ್ ಪರಿಶೀಲಿಸಿದ ನಿಯಮಗಳು',
      stepYourTurnTitle: '2. ನಿಮ್ಮ ಸರದಿ: ವಿದ್ಯಾರ್ಥಿ ಪರಿಶೀಲನಾ ಚೆಕ್‌ಲಿಸ್ಟ್',
      stepProtectTitle: '3. ತುರ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ',
      iPaidToggle: 'ನಾನು ಈಗಾಗಲೇ ಹಣ ವರ್ಗಾಯಿಸಿದ್ದೇನೆ ಅಥವಾ ಸೂಕ್ಷ್ಮ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದೇನೆ',
      iPaidNotice: 'ತುರ್ತು ಕ್ರಮ: ಖಾತೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲು 1930 (ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್) ಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ. cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.',
      exportPdf: 'PDF ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      exportPrint: 'ವರದಿ ಪ್ರಿಂಟ್ ಮಾಡಿ',
      exportJson: 'JSON ರಫ್ತು ಮಾಡಿ',
      checkAnother: 'ಇನ್ನೊಂದು ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      sampleWalkthroughTitle: 'ಮಾದರಿ ವರದಿ ಪರಿಶೀಲನೆ',
      sampleWalkthroughSubtitle: 'ನಾಲ್ಕು-ತೀರ್ಪು ಮಾದರಿ ಮತ್ತು ಸಾಕ್ಷ್ಯ ರಚನೆಯನ್ನು ವಿವರಿಸುವ ಉಲ್ಲೇಖ ವರದಿಗಳು.',
      sampleTabGenuine: 'ನೈಜ ಆಫರ್ ಮಾದರಿ',
      sampleTabReview: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಮಾದರಿ',
      sampleTabConcern: 'ವಂಚನೆ ಆಫರ್ ಮಾದರಿ',
      emptyTitle: 'ಯಾವುದೇ ಫಲಿತಾಂಶ ಲಭ್ಯವಿಲ್ಲ',
      emptyDesc: 'ಪರಿಶೀಲನಾ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ವಿಶ್ಲೇಷಣಾ ಪುಟದಲ್ಲಿ ಆಫರ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
      emptyCta: 'ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
    },

    // Compatibility aliases
    nav: {
      brand: 'ಜಾಂಚ್',
      tagline: 'ಡಿಜಿಟಲ್ ನಂಬಿಕೆ ಮತ್ತು ಸುರಕ್ಷತೆ',
      checkOffer: 'ಆಫರ್ ಪರಿಶೀಲಿಸಿ',
      linkInspector: 'ಲಿಂಕ್ ತಪಾಸಕ',
      verificationGuide: 'ಪರಿಶೀಲನಾ ಮಾರ್ಗದರ್ಶಿ',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
      login: 'ಸೈನ್ ಇನ್',
      signup: 'ಖಾತೆ ರಚಿಸಿ',
      history: 'ಇತಿಹಾಸ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      logout: 'ಸೈನ್ ಔಟ್',
      openMenu: 'ಮೆನು ತೆರೆಯಿರಿ',
      closeMenu: 'ಮೆನು ಮುಚ್ಚಿ',
    },
    feedback: {
      pillQuestion: 'ಈ ಪುಟವು ಉಪಯುಕ್ತವಾಗಿದೆಯೇ?',
      yes: 'ಹೌದು',
      no: 'ಇಲ್ಲ',
      thanks: 'ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಲು ಸಹಾಯ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!',
    },
    skipLink: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ',
    languages: {
      en: 'English',
      hi: 'हिंदी',
      kn: 'ಕನ್ನಡ',
    },
  },
};

/**
 * Helper to retrieve a translated string using dot notation.
 * Falls back gracefully to English if key is missing in the target locale.
 */
export function getTranslation(
  lang: 'en' | 'hi' | 'kn',
  path: string
): string {
  const parts = path.split('.');
  const dict = translations[lang] || translations.en;

  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallback: any = translations.en;
      for (const fallbackPart of parts) {
        if (fallback && typeof fallback === 'object' && fallbackPart in fallback) {
          fallback = fallback[fallbackPart];
        } else {
          return path;
        }
      }
      return typeof fallback === 'string' ? fallback : path;
    }
  }

  return typeof current === 'string' ? current : path;
}

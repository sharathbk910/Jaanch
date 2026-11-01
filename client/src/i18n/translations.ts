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

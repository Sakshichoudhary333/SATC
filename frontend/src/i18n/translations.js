export const LANGUAGES = [
  { code: 'en', label: 'English',    short: 'EN' },
  { code: 'hi', label: 'हिन्दी',      short: 'हि' },
  { code: 'gu', label: 'ગુજરાતી',    short: 'ગુ' },
  { code: 'mr', label: 'मराठी',       short: 'म'  },
  { code: 'ta', label: 'தமிழ்',       short: 'த'  },
  { code: 'te', label: 'తెలుగు',      short: 'తె' },
  { code: 'kn', label: 'ಕನ್ನಡ',       short: 'ಕ'  },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',     short: 'ਪੰ' },
];

const en = {
  common: {
    chooseLanguage: 'Language',
    logout: 'Logout',
    notifications: 'Notifications',
    logisticsControl: 'Logistics control',
    truckManagementSystem: 'Truck Management System',
  },
  roles: {
    admin: 'Admin', driver: 'Driver', customer: 'Customer',
    tmsAdmin: 'TMS ADMIN', tmsDriver: 'TMS DRIVER', tmsCustomer: 'TMS CUSTOMER',
  },
  roleDesc: {
    driver: 'Manage your trips, expenses,\nand share live location.',
    customer: 'Place orders, track trucks,\nand review deliveries.',
    admin: 'Manage fleet, orders, drivers,\nand monitor operations.',
  },
  nav: {
    billing: 'Billing', dashboard: 'Dashboard', liveTrack: 'Live Track',
    users: 'Users', trucks: 'Trucks', drivers: 'Drivers',
    assignTruck: 'Assign Truck', orders: 'Orders', trips: 'Trips',
    expenses: 'Expenses', reports: 'Reports', myTrips: 'My Trips',
    track: 'Track', myOrders: 'My Orders', placeOrder: 'Place Order',
    trackTruck: 'Track Truck',
  },
  pages: {
    adminDashboard: 'Admin Dashboard', users: 'Users', orders: 'Orders',
    trucks: 'Trucks', drivers: 'Drivers', assignTruck: 'Assign Truck',
    trips: 'Trips', expenses: 'Expenses', reports: 'Reports',
    billing: 'Billing', myOrders: 'My Orders', placeOrder: 'Place Order',
    trackTruck: 'Track Truck', driverDashboard: 'Driver Dashboard',
  },
};

const hi = {
  common: {
    chooseLanguage: 'भाषा', logout: 'लॉग आउट',
    notifications: 'सूचनाएँ', logisticsControl: 'लॉजिस्टिक्स नियंत्रण',
    truckManagementSystem: 'ट्रक प्रबंधन प्रणाली',
  },
  roles: {
    admin: 'प्रशासक', driver: 'चालक', customer: 'ग्राहक',
    tmsAdmin: 'TMS प्रशासक', tmsDriver: 'TMS चालक', tmsCustomer: 'TMS ग्राहक',
  },
  roleDesc: {
    driver: 'अपनी यात्राएँ, खर्च प्रबंधित करें\nऔर लाइव स्थान साझा करें।',
    customer: 'ऑर्डर दें, ट्रक ट्रैक करें\nऔर डिलीवरी की समीक्षा करें।',
    admin: 'फ्लीट, ऑर्डर, चालक प्रबंधित करें\nऔर संचालन की निगरानी करें।',
  },
  nav: {
    billing: 'बिलिंग', dashboard: 'डैशबोर्ड', liveTrack: 'लाइव ट्रैक',
    users: 'उपयोगकर्ता', trucks: 'ट्रक', drivers: 'चालक',
    assignTruck: 'ट्रक असाइन करें', orders: 'ऑर्डर', trips: 'यात्राएँ',
    expenses: 'खर्च', reports: 'रिपोर्ट', myTrips: 'मेरी यात्राएँ',
    track: 'ट्रैक', myOrders: 'मेरे ऑर्डर', placeOrder: 'ऑर्डर दें',
    trackTruck: 'ट्रक ट्रैक करें',
  },
  pages: {
    adminDashboard: 'प्रशासक डैशबोर्ड', users: 'उपयोगकर्ता', orders: 'ऑर्डर',
    trucks: 'ट्रक', drivers: 'चालक', assignTruck: 'ट्रक असाइन करें',
    trips: 'यात्राएँ', expenses: 'खर्च', reports: 'रिपोर्ट',
    billing: 'बिलिंग', myOrders: 'मेरे ऑर्डर', placeOrder: 'ऑर्डर दें',
    trackTruck: 'ट्रक ट्रैक करें', driverDashboard: 'चालक डैशबोर्ड',
  },
};

const gu = {
  common: {
    chooseLanguage: 'ભાષા', logout: 'લૉગ આઉટ',
    notifications: 'સૂચનાઓ', logisticsControl: 'લૉજિસ્ટિક્સ નિયંત્રણ',
    truckManagementSystem: 'ટ્રક મેનેજમેન્ટ સિસ્ટમ',
  },
  roles: {
    admin: 'વ્યવસ્થાપક', driver: 'ચાલક', customer: 'ગ્રાહક',
    tmsAdmin: 'TMS વ્યવસ્થાપક', tmsDriver: 'TMS ચાલક', tmsCustomer: 'TMS ગ્રાહક',
  },
  roleDesc: {
    driver: 'તમારી યાત્રાઓ, ખર્ચ મેનેજ કરો\nઅને લાઇવ સ્થાન શેર કરો.',
    customer: 'ઓર્ડર આપો, ટ્રક ટ્રૅક કરો\nઅને ડિલિવરીની સમીક્ષા કરો.',
    admin: 'ફ્લીટ, ઓર્ડર, ચાલક મેનેજ કરો\nઅને ઓપરેશન્સ મૉનિટર કરો.',
  },
  nav: {
    billing: 'બિલિંગ', dashboard: 'ડૅશબોર્ડ', liveTrack: 'લાઇવ ટ્રૅક',
    users: 'વપરાશકર્તા', trucks: 'ટ્રક', drivers: 'ચાલક',
    assignTruck: 'ટ્રક સોંપો', orders: 'ઓર્ડર', trips: 'યાત્રાઓ',
    expenses: 'ખર્ચ', reports: 'રિપોર્ટ', myTrips: 'મારી યાત્રાઓ',
    track: 'ટ્રૅક', myOrders: 'મારા ઓર્ડર', placeOrder: 'ઓર્ડર આપો',
    trackTruck: 'ટ્રક ટ્રૅક',
  },
  pages: {
    adminDashboard: 'વ્યવસ્થાપક ડૅશબોર્ડ', users: 'વપરાશકર્તા', orders: 'ઓર્ડર',
    trucks: 'ટ્રક', drivers: 'ચાલક', assignTruck: 'ટ્રક સોંપો',
    trips: 'યાત્રાઓ', expenses: 'ખર્ચ', reports: 'રિપોર્ટ',
    billing: 'બિલિંગ', myOrders: 'મારા ઓર્ડર', placeOrder: 'ઓર્ડર આપો',
    trackTruck: 'ટ્રક ટ્રૅક', driverDashboard: 'ચાલક ડૅશબોર્ડ',
  },
};

const mr = {
  common: {
    chooseLanguage: 'भाषा', logout: 'लॉग आउट',
    notifications: 'सूचना', logisticsControl: 'लॉजिस्टिक्स नियंत्रण',
    truckManagementSystem: 'ट्रक व्यवस्थापन प्रणाली',
  },
  roles: {
    admin: 'प्रशासक', driver: 'चालक', customer: 'ग्राहक',
    tmsAdmin: 'TMS प्रशासक', tmsDriver: 'TMS चालक', tmsCustomer: 'TMS ग्राहक',
  },
  roleDesc: {
    driver: 'तुमच्या सहली, खर्च व्यवस्थापित करा\nआणि थेट स्थान सामायिक करा.',
    customer: 'ऑर्डर द्या, ट्रक ट्रॅक करा\nआणि डिलिव्हरीचे पुनरावलोकन करा.',
    admin: 'ताफा, ऑर्डर, चालक व्यवस्थापित करा\nआणि ऑपरेशन्सवर लक्ष ठेवा.',
  },
  nav: {
    billing: 'बिलिंग', dashboard: 'डॅशबोर्ड', liveTrack: 'थेट ट्रॅक',
    users: 'वापरकर्ते', trucks: 'ट्रक', drivers: 'चालक',
    assignTruck: 'ट्रक नियुक्त करा', orders: 'ऑर्डर', trips: 'सहली',
    expenses: 'खर्च', reports: 'अहवाल', myTrips: 'माझ्या सहली',
    track: 'ट्रॅक', myOrders: 'माझे ऑर्डर', placeOrder: 'ऑर्डर द्या',
    trackTruck: 'ट्रक ट्रॅक',
  },
  pages: {
    adminDashboard: 'प्रशासक डॅशबोर्ड', users: 'वापरकर्ते', orders: 'ऑर्डर',
    trucks: 'ट्रक', drivers: 'चालक', assignTruck: 'ट्रक नियुक्त करा',
    trips: 'सहली', expenses: 'खर्च', reports: 'अहवाल',
    billing: 'बिलिंग', myOrders: 'माझे ऑर्डर', placeOrder: 'ऑर्डर द्या',
    trackTruck: 'ट्रक ट्रॅक', driverDashboard: 'चालक डॅशबोर्ड',
  },
};

const ta = {
  common: {
    chooseLanguage: 'மொழி', logout: 'வெளியேறு',
    notifications: 'அறிவிப்புகள்', logisticsControl: 'லாஜிஸ்டிக்ஸ் கட்டுப்பாடு',
    truckManagementSystem: 'டிரக் மேலாண்மை அமைப்பு',
  },
  roles: {
    admin: 'நிர்வாகி', driver: 'ஓட்டுனர்', customer: 'வாடிக்கையாளர்',
    tmsAdmin: 'TMS நிர்வாகி', tmsDriver: 'TMS ஓட்டுனர்', tmsCustomer: 'TMS வாடிக்கையாளர்',
  },
  roleDesc: {
    driver: 'உங்கள் பயணங்கள், செலவுகளை நிர்வகிக்கவும்\nமற்றும் நேரடி இருப்பிடம் பகிரவும்.',
    customer: 'ஆர்டர் செய்யுங்கள், டிரக் கண்காணிக்கவும்\nமற்றும் டெலிவரியை மதிப்பாய்வு செய்யுங்கள்.',
    admin: 'கடற்கணம், ஆர்டர்கள், ஓட்டுனர்களை நிர்வகிக்கவும்\nமற்றும் செயல்பாடுகளை கண்காணிக்கவும்.',
  },
  nav: {
    billing: 'பில்லிங்', dashboard: 'டாஷ்போர்டு', liveTrack: 'நேரடி கண்காணிப்பு',
    users: 'பயனர்கள்', trucks: 'டிரக்குகள்', drivers: 'ஓட்டுனர்கள்',
    assignTruck: 'டிரக் ஒதுக்கவும்', orders: 'ஆர்டர்கள்', trips: 'பயணங்கள்',
    expenses: 'செலவுகள்', reports: 'அறிக்கைகள்', myTrips: 'என் பயணங்கள்',
    track: 'கண்காணி', myOrders: 'என் ஆர்டர்கள்', placeOrder: 'ஆர்டர் செய்',
    trackTruck: 'டிரக் கண்காணி',
  },
  pages: {
    adminDashboard: 'நிர்வாக டாஷ்போர்டு', users: 'பயனர்கள்', orders: 'ஆர்டர்கள்',
    trucks: 'டிரக்குகள்', drivers: 'ஓட்டுனர்கள்', assignTruck: 'டிரக் ஒதுக்கவும்',
    trips: 'பயணங்கள்', expenses: 'செலவுகள்', reports: 'அறிக்கைகள்',
    billing: 'பில்லிங்', myOrders: 'என் ஆர்டர்கள்', placeOrder: 'ஆர்டர் செய்',
    trackTruck: 'டிரக் கண்காணி', driverDashboard: 'ஓட்டுனர் டாஷ்போர்டு',
  },
};

const te = {
  common: {
    chooseLanguage: 'భాష', logout: 'లాగ్ అవుట్',
    notifications: 'నోటిఫికేషన్లు', logisticsControl: 'లాజిస్టిక్స్ నియంత్రణ',
    truckManagementSystem: 'ట్రక్ నిర్వహణ వ్యవస్థ',
  },
  roles: {
    admin: 'నిర్వాహకుడు', driver: 'డ్రైవర్', customer: 'కస్టమర్',
    tmsAdmin: 'TMS నిర్వాహకుడు', tmsDriver: 'TMS డ్రైవర్', tmsCustomer: 'TMS కస్టమర్',
  },
  roleDesc: {
    driver: 'మీ యాత్రలు, ఖర్చులు నిర్వహించండి\nమరియు లైవ్ లొకేషన్ పంచుకోండి.',
    customer: 'ఆర్డర్ చేయండి, ట్రక్ ట్రాక్ చేయండి\nమరియు డెలివరీని సమీక్షించండి.',
    admin: 'ఫ్లీట్, ఆర్డర్లు, డ్రైవర్లను నిర్వహించండి\nమరియు కార్యకలాపాలను పర్యవేక్షించండి.',
  },
  nav: {
    billing: 'బిల్లింగ్', dashboard: 'డాష్‌బోర్డ్', liveTrack: 'లైవ్ ట్రాక్',
    users: 'వినియోగదారులు', trucks: 'ట్రక్కులు', drivers: 'డ్రైవర్లు',
    assignTruck: 'ట్రక్ కేటాయించు', orders: 'ఆర్డర్లు', trips: 'యాత్రలు',
    expenses: 'ఖర్చులు', reports: 'నివేదికలు', myTrips: 'నా యాత్రలు',
    track: 'ట్రాక్', myOrders: 'నా ఆర్డర్లు', placeOrder: 'ఆర్డర్ చేయి',
    trackTruck: 'ట్రక్ ట్రాక్',
  },
  pages: {
    adminDashboard: 'నిర్వాహకుడి డాష్‌బోర్డ్', users: 'వినియోగదారులు', orders: 'ఆర్డర్లు',
    trucks: 'ట్రక్కులు', drivers: 'డ్రైవర్లు', assignTruck: 'ట్రక్ కేటాయించు',
    trips: 'యాత్రలు', expenses: 'ఖర్చులు', reports: 'నివేదికలు',
    billing: 'బిల్లింగ్', myOrders: 'నా ఆర్డర్లు', placeOrder: 'ఆర్డర్ చేయి',
    trackTruck: 'ట్రక్ ట్రాక్', driverDashboard: 'డ్రైవర్ డాష్‌బోర్డ్',
  },
};

const kn = {
  common: {
    chooseLanguage: 'ಭಾಷೆ', logout: 'ಲಾಗ್ ಔಟ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು', logisticsControl: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್ ನಿಯಂತ್ರಣ',
    truckManagementSystem: 'ಟ್ರಕ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ',
  },
  roles: {
    admin: 'ನಿರ್ವಾಹಕ', driver: 'ಚಾಲಕ', customer: 'ಗ್ರಾಹಕ',
    tmsAdmin: 'TMS ನಿರ್ವಾಹಕ', tmsDriver: 'TMS ಚಾಲಕ', tmsCustomer: 'TMS ಗ್ರಾಹಕ',
  },
  roleDesc: {
    driver: 'ನಿಮ್ಮ ಪ್ರಯಾಣಗಳು, ವೆಚ್ಚ ನಿರ್ವಹಿಸಿ\nಮತ್ತು ಲೈವ್ ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ.',
    customer: 'ಆರ್ಡರ್ ನೀಡಿ, ಟ್ರಕ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ\nಮತ್ತು ಡೆಲಿವರಿ ಪರಿಶೀಲಿಸಿ.',
    admin: 'ಫ್ಲೀಟ್, ಆರ್ಡರ್‌ಗಳು, ಚಾಲಕರನ್ನು ನಿರ್ವಹಿಸಿ\nಮತ್ತು ಕಾರ್ಯಾಚರಣೆ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
  },
  nav: {
    billing: 'ಬಿಲ್ಲಿಂಗ್', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', liveTrack: 'ಲೈವ್ ಟ್ರ್ಯಾಕ್',
    users: 'ಬಳಕೆದಾರರು', trucks: 'ಟ್ರಕ್‌ಗಳು', drivers: 'ಚಾಲಕರು',
    assignTruck: 'ಟ್ರಕ್ ನಿಯೋಜಿಸಿ', orders: 'ಆರ್ಡರ್‌ಗಳು', trips: 'ಪ್ರಯಾಣಗಳು',
    expenses: 'ವೆಚ್ಚಗಳು', reports: 'ವರದಿಗಳು', myTrips: 'ನನ್ನ ಪ್ರಯಾಣಗಳು',
    track: 'ಟ್ರ್ಯಾಕ್', myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು', placeOrder: 'ಆರ್ಡರ್ ನೀಡಿ',
    trackTruck: 'ಟ್ರಕ್ ಟ್ರ್ಯಾಕ್',
  },
  pages: {
    adminDashboard: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', users: 'ಬಳಕೆದಾರರು', orders: 'ಆರ್ಡರ್‌ಗಳು',
    trucks: 'ಟ್ರಕ್‌ಗಳು', drivers: 'ಚಾಲಕರು', assignTruck: 'ಟ್ರಕ್ ನಿಯೋಜಿಸಿ',
    trips: 'ಪ್ರಯಾಣಗಳು', expenses: 'ವೆಚ್ಚಗಳು', reports: 'ವರದಿಗಳು',
    billing: 'ಬಿಲ್ಲಿಂಗ್', myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು', placeOrder: 'ಆರ್ಡರ್ ನೀಡಿ',
    trackTruck: 'ಟ್ರಕ್ ಟ್ರ್ಯಾಕ್', driverDashboard: 'ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  },
};

const pa = {
  common: {
    chooseLanguage: 'ਭਾਸ਼ਾ', logout: 'ਲੌਗ ਆਉਟ',
    notifications: 'ਸੂਚਨਾਵਾਂ', logisticsControl: 'ਲੌਜਿਸਟਿਕਸ ਕੰਟਰੋਲ',
    truckManagementSystem: 'ਟਰੱਕ ਪ੍ਰਬੰਧਨ ਪ੍ਰਣਾਲੀ',
  },
  roles: {
    admin: 'ਪ੍ਰਬੰਧਕ', driver: 'ਡਰਾਈਵਰ', customer: 'ਗਾਹਕ',
    tmsAdmin: 'TMS ਪ੍ਰਬੰਧਕ', tmsDriver: 'TMS ਡਰਾਈਵਰ', tmsCustomer: 'TMS ਗਾਹਕ',
  },
  roleDesc: {
    driver: 'ਆਪਣੀਆਂ ਯਾਤਰਾਵਾਂ, ਖਰਚੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ\nਅਤੇ ਲਾਈਵ ਟਿਕਾਣਾ ਸਾਂਝਾ ਕਰੋ।',
    customer: 'ਆਰਡਰ ਦਿਓ, ਟਰੱਕ ਟਰੈਕ ਕਰੋ\nਅਤੇ ਡਿਲਿਵਰੀ ਦੀ ਸਮੀਖਿਆ ਕਰੋ।',
    admin: 'ਫਲੀਟ, ਆਰਡਰ, ਡਰਾਈਵਰਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ\nਅਤੇ ਓਪਰੇਸ਼ਨਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।',
  },
  nav: {
    billing: 'ਬਿਲਿੰਗ', dashboard: 'ਡੈਸ਼ਬੋਰਡ', liveTrack: 'ਲਾਈਵ ਟਰੈਕ',
    users: 'ਉਪਭੋਗਤਾ', trucks: 'ਟਰੱਕ', drivers: 'ਡਰਾਈਵਰ',
    assignTruck: 'ਟਰੱਕ ਨਿਯੁਕਤ ਕਰੋ', orders: 'ਆਰਡਰ', trips: 'ਯਾਤਰਾਵਾਂ',
    expenses: 'ਖਰਚੇ', reports: 'ਰਿਪੋਰਟਾਂ', myTrips: 'ਮੇਰੀਆਂ ਯਾਤਰਾਵਾਂ',
    track: 'ਟਰੈਕ', myOrders: 'ਮੇਰੇ ਆਰਡਰ', placeOrder: 'ਆਰਡਰ ਦਿਓ',
    trackTruck: 'ਟਰੱਕ ਟਰੈਕ',
  },
  pages: {
    adminDashboard: 'ਪ੍ਰਬੰਧਕ ਡੈਸ਼ਬੋਰਡ', users: 'ਉਪਭੋਗਤਾ', orders: 'ਆਰਡਰ',
    trucks: 'ਟਰੱਕ', drivers: 'ਡਰਾਈਵਰ', assignTruck: 'ਟਰੱਕ ਨਿਯੁਕਤ ਕਰੋ',
    trips: 'ਯਾਤਰਾਵਾਂ', expenses: 'ਖਰਚੇ', reports: 'ਰਿਪੋਰਟਾਂ',
    billing: 'ਬਿਲਿੰਗ', myOrders: 'ਮੇਰੇ ਆਰਡਰ', placeOrder: 'ਆਰਡਰ ਦਿਓ',
    trackTruck: 'ਟਰੱਕ ਟਰੈਕ', driverDashboard: 'ਡਰਾਈਵਰ ਡੈਸ਼ਬੋਰਡ',
  },
};

export const translations = { en, hi, gu, mr, ta, te, kn, pa };

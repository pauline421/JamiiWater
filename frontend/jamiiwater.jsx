import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Map, Droplet, Zap, MessageCircle, BarChart3, Menu, X, LocateFixed, Sun, Moon, LogOut, User, Mail, Lock, Languages } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'jamiiwater_auth_token';
const USER_ID_KEY = 'jamiiwater_user_id';
const USER_EMAIL_KEY = 'jamiiwater_user_email';

// --- Translation Map (English and Swahili) ---

const languageMap = {
    en: {
        appName: 'JamiiWater',
        authTitle: (isSignUp) => isSignUp ? 'Create Your Account' : 'Sign In to Dashboard',
        signIn: 'Sign In', signUp: 'Sign Up',
        alreadyAccount: 'Already have an account? Sign In',
        needAccount: 'Need an account? Sign Up',
        processing: 'Processing...',
        theme: (darkMode) => darkMode ? 'Light Theme' : 'Dark Theme',
        signOut: 'Sign Out',
        status: 'Status', authenticated: 'Authenticated',
        initializing: 'Connecting to JamiiWater Server...',
        lang: 'Swahili', // Button text to switch to Swahili
        // Nav Items
        nav: [
            { id: 'tracking', icon: Droplet, title: 'Water Levels', description: 'Monitor tank levels and usage' },
            { id: 'locate', icon: Map, title: 'Find Water Source', description: 'Locate the nearest clean source' },
            { id: 'report', icon: AlertTriangle, title: 'Report Issue', description: 'Report broken pumps or empty sources' },
            { id: 'alerts', icon: Zap, title: 'Rationing Alerts', description: 'View service disruptions & advisories' },
            { id: 'ai', icon: BarChart3, title: 'AI Prediction', description: 'Rainfall and demand forecasts' },
            { id: 'community', icon: MessageCircle, title: 'Community Hub', description: 'Discuss, share, and connect' },
        ],
        // Water Level Tracker
        levelTitle: 'My Water Levels & Usage Dashboard',
        tank1: 'Rooftop Tank', tank2: 'Ground Cistern', pot: 'Clay Pot Sensor',
        decrease: 'Decrease', increase: 'Increase', loading: 'Loading data...',
        privateData: '*Levels are stored privately on the server, authenticated by token.',
        // AI Prediction
        aiTitle: 'AI Insights: Rainfall, Demand, and Quality',
        aiForecast1: "Next 7 Days Rainfall (mm)", aiForecast2: "Community Demand Forecast", aiForecast3: "Water Quality Index",
        aiRecTitle: "AI Recommendation:",
        aiRecContent: "Based on the stable demand and upcoming moderate rainfall, the system recommends maintaining the current rationing schedule but increasing reservoir recharge rates by 5% over the next 48 hours to secure future supply.",
        // Geolocation
        locateTitle: 'Nearest Clean Water Sources',
        currentLocation: (loc) => `Your Current Location: ${loc} (Simulated)`,
        functional: 'Functional', maintenance: 'Maintenance Scheduled', accessRestricted: 'Access Restricted',
        getDirections: 'Get Directions',
        locateNote: 'Note: Real-time geolocation services for clean water sources are active and verified by the JamiiWater team.',
        // Report
        reportTitle: 'Report Infrastructure Issue', issueType: 'Issue Type', brokenPump: 'Broken Pump / Tap', emptySource: 'Empty/Blocked Source',
        locationLabel: 'Exact Location (e.g., Near XYZ School, Pump #3)', locationPlaceholder: 'Street name or landmark',
        detailsLabel: 'Additional Details', detailsPlaceholder: 'Describe the issue',
        submitReport: 'Submit Report', sendingReport: 'Sending Report...',
        reportSuccess: 'Report submitted successfully! The maintenance team has been notified.',
        reportError: 'Please fill in the location and details.',
        // Alerts
        alertsTitle: 'Water Rationing & System Alerts', ussdTitle: 'USSD Service:',
        ussdContent: (code) => `Feature phone users can check the latest alerts by dialing ${code} on their device.`,
        ussdMenu: 'USSD Menu:',
        // Community
        communityTitle: 'Community Dashboard: Discuss & Connect',
        postPlaceholder: 'Share your water conservation tips, ask a question, or report local issues...',
        postButton: 'Post to Community', posting: 'Posting...',
        noPosts: 'No community posts yet. Be the first to start a discussion!',
        publicData: '*Community posts are public data and stored on the server.',
    },
    sw: {
        appName: 'JamiiWater',
        authTitle: (isSignUp) => isSignUp ? 'Fungua Akaunti Yako' : 'Ingia Kwenye Dashibodi',
        signIn: 'Ingia', signUp: 'Jisajili',
        alreadyAccount: 'Tayari una akaunti? Ingia',
        needAccount: 'Unahitaji akaunti? Jisajili',
        processing: 'Inachakata...',
        theme: (darkMode) => darkMode ? 'Mandhari Meupe' : 'Mandhari Meusi',
        signOut: 'Toka',
        status: 'Hali', authenticated: 'Umeidhinishwa',
        initializing: 'Inaunganisha na Seva ya JamiiWater...',
        lang: 'English', // Button text to switch to English
        // Nav Items
        nav: [
            { id: 'tracking', icon: Droplet, title: 'Viwango vya Maji', description: 'Fuatilia viwango vya tanki na matumizi' },
            { id: 'locate', icon: Map, title: 'Pata Chanzo', description: 'Tafuta chanzo cha karibu cha maji safi' },
            { id: 'report', icon: AlertTriangle, title: 'Ripoti Tatizo', description: 'Ripoti pampu zilizovunjika au vyanzo vitupu' },
            { id: 'alerts', icon: Zap, title: 'Tahadhari za Mgao', description: 'Angalia usumbufu wa huduma & ushauri' },
            { id: 'ai', icon: BarChart3, title: 'Utabiri wa AI', description: 'Utabiri wa mvua na mahitaji' },
            { id: 'community', icon: MessageCircle, title: 'Jumuiya', description: 'Jadili, shiriki, na ungana' },
        ],
        // Water Level Tracker
        levelTitle: 'Dashibodi ya Viwango vya Maji na Matumizi',
        tank1: 'Tangi la Juu', tank2: 'Mifereji ya Chini', pot: 'Sensorer ya Mtungi',
        decrease: 'Punguza', increase: 'Ongeza', loading: 'Inapakia data...',
        privateData: '*Viwango vimehifadhiwa faraghani kwenye seva, vimethibitishwa kwa tokeni.',
        // AI Prediction
        aiTitle: 'Maarifa ya AI: Mvua, Mahitaji, na Ubora',
        aiForecast1: "Mvua ya Siku 7 Zijazo (mm)", aiForecast2: "Utabiri wa Mahitaji ya Jumuiya", aiForecast3: "Kielezo cha Ubora wa Maji",
        aiRecTitle: "Mapendekezo ya AI:",
        aiRecContent: "Kulingana na mahitaji thabiti na mvua ya wastani inayokuja, mfumo unapendekeza kuendeleza ratiba ya mgao lakini kuongeza viwango vya kuchaji hifadhi kwa 5% katika masaa 48 yajayo ili kupata usambazaji wa baadaye.",
        // Geolocation
        locateTitle: 'Vyanzo vya Maji Safi Vilivyo Karibu',
        currentLocation: (loc) => `Mahali Ulipo Sasa: ${loc} (Imeigizwa)`,
        functional: 'Inafanya Kazi', maintenance: 'Ratiba ya Matengenezo', accessRestricted: 'Ufikiaji Umezuiwa',
        getDirections: 'Pata Maelekezo',
        locateNote: 'Kumbuka: Huduma za eneo la wakati halisi kwa vyanzo vya maji safi ni hai na zimethibitishwa na timu ya JamiiWater.',
        // Report
        reportTitle: 'Ripoti Tatizo la Miundombinu', issueType: 'Aina ya Tatizo', brokenPump: 'Pampu / Bomba Iliyovunjika', emptySource: 'Chanzo Kitupu/Kilichoziba',
        locationLabel: 'Mahali Halisi (k.m., Karibu na Shule ya XYZ, Pampu #3)', locationPlaceholder: 'Jina la barabara au alama ya ardhi',
        detailsLabel: 'Maelezo ya Ziada', detailsPlaceholder: 'Elezea tatizo',
        submitReport: 'Tuma Ripoti', sendingReport: 'Inatuma Ripoti...',
        reportSuccess: 'Ripoti imetumwa kwa mafanikio! Timu ya matengeneza imearifiwa.',
        reportError: 'Tafadhali jaza eneo na maelezo.',
        // Alerts
        alertsTitle: 'Tahadhari za Mgao wa Maji na Mfumo', ussdTitle: 'Huduma ya USSD:',
        ussdContent: (code) => `Watumiaji wa simu za kawaida wanaweza kuangalia tahadhari za hivi karibuni kwa kupiga ${code} kwenye kifaa chao.`,
        ussdMenu: 'Menyu ya USSD:',
        // Community
        communityTitle: 'Dashibodi ya Jumuiya: Jadili & Ungana',
        postPlaceholder: 'Shiriki vidokezo vyako vya uhifadhi wa maji, uliza swali, au ripoti matatizo ya hapa...',
        postButton: 'Tuma kwa Jumuiya', posting: 'Inatuma...',
        noPosts: 'Hakuna machapisho ya jumuiya bado. Kuwa wa kwanza kuanzisha mjadala!',
        publicData: '*Machapisho ya jumuiya ni data ya umma na yamehifadhiwa kwenye seva.',
    },
};

// --- API Utility (Replaces Firebase Calls) ---

const apiRequest = async (endpoint, method = 'GET', data = null, needsAuth = true) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
        'Content-Type': 'application/json',
    };

    if (needsAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.message || `API Error: ${response.status}`);
    }

    return responseData;
};


// --- Auth Context/Provider (Replaces Firebase Auth) ---

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(localStorage.getItem(USER_ID_KEY));
    const [userEmail, setUserEmail] = useState(localStorage.getItem(USER_EMAIL_KEY));
    const [isAuthReady, setIsAuthReady] = useState(true); // Always ready for local auth

    const handleAuthResponse = (token, id, email) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_ID_KEY, id);
        localStorage.setItem(USER_EMAIL_KEY, email);
        setUserId(id);
        setUserEmail(email);
    };

    const login = async (email, password) => {
        const data = await apiRequest('/api/auth/login', 'POST', { email, password }, false);
        handleAuthResponse(data.token, data.userId, data.email);
    };

    const register = async (email, password) => {
        const data = await apiRequest('/api/auth/register', 'POST', { email, password }, false);
        handleAuthResponse(data.token, data.userId, data.email);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(USER_EMAIL_KEY);
        setUserId(null);
        setUserEmail(null);
    };

    const isLoggedIn = !!userId;

    const authContextValue = useMemo(() => ({
        userId,
        userEmail,
        isAuthReady,
        isLoggedIn,
        login,
        register,
        logout,
    }), [userId, userEmail, isAuthReady, isLoggedIn]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Custom Hook to use Auth Context ---
const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- UI Components ---

const FeatureCard = ({ icon: Icon, title, description, onClick, className = '' }) => (
    <div
        className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center border-t-4 border-teal-500 dark:border-teal-400 ${className}`}
        onClick={onClick}
    >
        <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{description}</p>
    </div>
);

const SectionTitle = ({ children }) => (
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 mb-6 border-teal-100 dark:border-gray-700">
        {children}
    </h2>
);

// --- Auth Screen Component ---

const AuthScreen = ({ onLoginSuccess, t }) => {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            onLoginSuccess();
        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.message || 'Authentication failed. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ icon: Icon, type, value, onChange, placeholder }) => (
        <div className="relative mb-4">
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition duration-200"
                required
            />
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">{t.appName}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                        {t.authTitle(isSignUp)}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <InputField 
                        icon={Mail} 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder={t.emailPlaceholder || "Email Address"} 
                    />
                    <InputField 
                        icon={Lock} 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder={t.passwordPlaceholder || "Password"} 
                    />

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm dark:bg-red-900 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                    >
                        {loading ? t.processing : isSignUp ? t.signUp : t.signIn}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition"
                    >
                        {isSignUp ? t.alreadyAccount : t.needAccount}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Core Feature Components (API & Translation Adapted) ---

const WaterLevelTracker = ({ t, userId }) => {
    const [waterData, setWaterData] = useState({ tank1: 0, tank2: 0, pot: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchWaterData = useCallback(async () => {
        try {
            const data = await apiRequest('/api/levels');
            setWaterData(data);
        } catch (error) {
            console.error("Error fetching water data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaterData();
    }, [fetchWaterData]);

    const updateLevel = async (key, delta) => {
        setWaterData(prev => {
            const newLevel = parseFloat(Math.min(100, Math.max(0, prev[key] + delta)).toFixed(1));
            return { ...prev, [key]: newLevel };
        });

        const newLevelValue = parseFloat(Math.min(100, Math.max(0, waterData[key] + delta)).toFixed(1));
        const update = { [key]: newLevelValue };

        try {
            // Send update to the backend
            await apiRequest('/api/levels', 'POST', update);
        } catch (error) {
            console.error("Error updating water data:", error);
            // Optionally revert local state on failure
            fetchWaterData(); 
        }
    };

    const LevelDisplay = ({ name, keyName, icon: Icon }) => {
        const level = waterData[keyName];
        let colorClass, iconColorClass;

        if (level > 75) {
            colorClass = 'bg-green-500';
            iconColorClass = 'text-green-500';
        } else if (level > 25) {
            colorClass = 'bg-yellow-500';
            iconColorClass = 'text-yellow-500';
        } else {
            colorClass = 'bg-red-500';
            iconColorClass = 'text-red-500';
        }

        return (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <Icon className={`w-7 h-7 ${iconColorClass}`} />
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{name}</h4>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative mb-4">
                    <div
                        className={`h-6 rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${level}%` }}
                    ></div>
                    <span className="absolute right-3 top-0 text-sm font-bold text-gray-900 dark:text-white leading-6">{level}%</span>
                </div>

                <div className="flex justify-center mt-3 space-x-3">
                    <button
                        onClick={() => updateLevel(keyName, -5)}
                        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
                    >{t.decrease}</button>
                    <button
                        onClick={() => updateLevel(keyName, 5)}
                        className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-full hover:bg-teal-700 transition shadow-md"
                    >{t.increase}</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>{t.levelTitle}</SectionTitle>
            {isLoading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.loading}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LevelDisplay name={t.tank1} keyName="tank1" icon={Droplet} />
                    <LevelDisplay name={t.tank2} keyName="tank2" icon={Droplet} />
                    <LevelDisplay name={t.pot} keyName="pot" icon={Zap} />
                </div>
            )}
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold">User ID:</span> {userId || 'N/A'}
                <br />
                {t.privateData}
            </p>
        </div>
    );
};

const AIPrediction = ({ t }) => {
    const aiData = useMemo(() => [
        { label: t.aiForecast1, value: "15 mm", trend: "Up 30%", forecast: t.aiForecast1.includes('Rainfall') ? "Moderate rains expected Tue-Thu." : "Mvua ya wastani inatarajiwa Jumanne-Alhamisi." },
        { label: t.aiForecast2, value: "85%", trend: "Stable", forecast: t.aiForecast2.includes('Demand') ? "High demand persists. Peak usage 6-9 AM." : "Mahitaji makubwa yanaendelea. Matumizi ya kilele 6-9 AM." },
        { label: t.aiForecast3, value: "92/100 (Good)", trend: "Stable", forecast: t.aiForecast3.includes('Quality') ? "Microbial count is low. Filtration systems operating effectively." : "Kiwango cha vijidudu ni kidogo. Mifumo ya uchujaji inafanya kazi vizuri." },
    ], [t]);

    return (
        <div>
            <SectionTitle>{t.aiTitle}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiData.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500 dark:border-blue-400">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">{item.label}</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">{item.value}</h3>
                        <p className={`text-sm mt-2 ${item.trend.startsWith('Up') ? 'text-green-600 dark:text-green-400' : item.trend.startsWith('Down') ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {item.trend}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 border-t dark:border-gray-700 pt-2">{item.forecast}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-md">
                <h4 className="font-bold">{t.aiRecTitle}</h4>
                <p className="text-sm">{t.aiRecContent}</p>
            </div>
        </div>
    );
};

const GeolocatingSource = ({ t }) => {
    const sources = useMemo(() => [
        { name: "Community Borehole A", distance: "0.5 km", status: t.functional, color: "text-green-600", icon: "🟢" },
        { name: "Public Tap Stand (Market)", distance: "1.2 km", status: t.functional, color: "text-green-600", icon: "🟢" },
        { name: "River Intake Point", distance: "2.5 km", status: t.maintenance, color: "text-yellow-600", icon: "🟡" },
        { name: "School Rain Harvest Tank", distance: "0.8 km", status: t.accessRestricted, color: "text-red-600", icon: "🔴" },
    ], [t]);

    return (
        <div>
            <SectionTitle>{t.locateTitle}</SectionTitle>
            <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-inner mb-6">
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                    <LocateFixed className="w-6 h-6 mr-2" />
                    {t.currentLocation('Lavington Estate, Nairobi')}
                </p>
            </div>

            <div className="space-y-4">
                {sources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition border dark:border-gray-700">
                        <div className="flex items-center">
                            <span className={`text-2xl mr-3 ${source.color}`}>{source.icon}</span>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{source.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{source.status}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{source.distance}</p>
                            <button className="text-xs text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100 mt-1 font-medium">{t.getDirections}</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <p>{t.locateNote}</p>
            </div>
        </div>
    );
};

const ReportFeature = ({ t }) => {
    const [reportType, setReportType] = useState('pump');
    const [location, setLocation] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!location || !details) {
            setMessage({ type: 'error', text: t.reportError });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        // This is a simulated local report submission, not hitting the server.
        setTimeout(() => {
            console.log(`Report Submitted: Type=${reportType}, Location=${location}, Details=${details}`);
            setMessage({ type: 'success', text: t.reportSuccess });
            setLocation('');
            setDetails('');
            setIsSubmitting(false);
        }, 1500);
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition duration-200";

    return (
        <div>
            <SectionTitle>{t.reportTitle}</SectionTitle>
            {message && (
                <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.issueType}</label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center text-gray-800 dark:text-gray-200">
                            <input
                                type="radio"
                                name="reportType"
                                value="pump"
                                checked={reportType === 'pump'}
                                onChange={() => setReportType('pump')}
                                className="form-radio text-teal-600 dark:bg-gray-600 border-gray-400"
                            />
                            <span className="ml-2">{t.brokenPump}</span>
                        </label>
                        <label className="inline-flex items-center text-gray-800 dark:text-gray-200">
                            <input
                                type="radio"
                                name="reportType"
                                value="source"
                                checked={reportType === 'source'}
                                onChange={() => setReportType('source')}
                                className="form-radio text-teal-600 dark:bg-gray-600 border-gray-400"
                            />
                            <span className="ml-2">{t.emptySource}</span>
                        </label>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.locationLabel}</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={inputClass}
                        placeholder={t.locationPlaceholder}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.detailsLabel}</label>
                    <textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows="3"
                        className={inputClass}
                        placeholder={t.detailsPlaceholder}
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl shadow-md text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition"
                >
                    {isSubmitting ? t.sendingReport : t.submitReport}
                </button>
            </form>
        </div>
    );
};

const RationingAlerts = ({ t }) => {
    const alerts = useMemo(() => [
        { id: 1, type: 'critical', title: 'Phase 3 Rationing in Effect', details: t.alertsTitle.includes('Mgao') ? 'Maeneo yote yenye shinikizo la chini yatapata kukatwa maji kutoka 10 PM hadi 4 AM kila siku kuanzia kesho.' : 'All low-pressure zones will experience water shutdown from 10 PM to 4 AM daily starting tomorrow.', date: '2025-11-20' },
        { id: 2, type: 'warning', title: 'Maintenance Notice: Central Pipeline', details: t.alertsTitle.includes('Mgao') ? 'Mabadiliko ya shinikizo yanatarajiwa katika sekta ya kaskazini kati ya 9 AM - 1 PM mnamo 2025-11-23.' : 'Pressure fluctuations expected in the northern sector between 9 AM - 1 PM on 2025-11-23.', date: '2025-11-19' },
        { id: 3, type: 'info', title: 'High Usage Advisory', details: t.alertsTitle.includes('Mgao') ? 'Tafadhali hifadhi maji wakati wa masaa ya kilele cha asubuhi (6 AM - 9 AM).' : 'Please conserve water during the morning peak hours (6 AM - 9 AM).', date: '2025-11-15' },
    ], [t]);

    const alertStyles = {
        critical: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
        info: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
    };

    return (
        <div>
            <SectionTitle>{t.alertsTitle}</SectionTitle>
            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 border-l-4 rounded-lg shadow-md ${alertStyles[alert.type]}`}>
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg">{alert.title}</h4>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{alert.date}</span>
                        </div>
                        <p className="mt-1 text-sm">{alert.details}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-md">
                <h4 className="font-bold text-lg">{t.ussdTitle}</h4>
                <p className="text-sm">{t.ussdContent('*847#')}</p>
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg max-w-sm mx-auto sm:mx-0">
                    <p className="text-center font-mono text-sm text-gray-800 dark:text-gray-200">
                        <span className="text-green-600 dark:text-green-400 font-bold">{t.ussdMenu}</span><br/>
                        {t.nav.map(item => item.id).map((id, index) => {
                            const navItem = t.nav.find(item => item.id === id);
                            return <span key={id} className="block">{index + 1}. {navItem.title}</span>;
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

const CommunityDashboard = ({ t, userId }) => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchPosts = useCallback(async () => {
        try {
            const fetchedPosts = await apiRequest('/api/community');
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching community posts:", error);
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        // Since we are using an in-memory server, we simulate real-time by polling.
        // In a real app, this would be a WebSocket or long-polling connection.
        fetchPosts();
        const interval = setInterval(fetchPosts, 5000); 
        return () => clearInterval(interval);
    }, [fetchPosts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || isPosting) return;

        setIsPosting(true);
        try {
            await apiRequest('/api/community', 'POST', { content: newPostContent.trim() });
            setNewPostContent('');
            fetchPosts(); // Refresh posts immediately after posting
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsPosting(false);
        }
    };

    const PostItem = ({ post }) => (
        <div className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-teal-600 dark:text-teal-400">{post.username}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-200">{post.content}</p>
        </div>
    );

    return (
        <div>
            <SectionTitle>{t.communityTitle}</SectionTitle>

            <form onSubmit={handlePostSubmit} className="mb-8 p-4 bg-teal-50 dark:bg-gray-800 rounded-xl shadow-inner border border-teal-100 dark:border-gray-700">
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows="3"
                    placeholder={t.postPlaceholder}
                    className="w-full p-3 border border-teal-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition duration-200"
                    disabled={isPosting}
                ></textarea>
                <button
                    type="submit"
                    className="mt-3 py-2 px-4 bg-teal-600 text-white font-medium rounded-xl shadow-md hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:opacity-50 transition"
                    disabled={!newPostContent.trim() || isPosting}
                >
                    {isPosting ? t.posting : t.postButton}
                </button>
            </form>

            <div className="space-y-4">
                {isFetching ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.loading}</div>
                ) : posts.length > 0 ? (
                    posts.map(post => <PostItem key={post.id} post={post} />)
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.noPosts}</div>
                )}
            </div>
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                {t.publicData}
            </p>
        </div>
    );
};


// --- Main Application Component ---
const AppContent = () => {
    const { userId, userEmail, isLoggedIn, logout } = useAuth();
    const [activeFeature, setActiveFeature] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false); 
    const [language, setLanguage] = useState('en'); 

    const t = languageMap[language]; 
    const navItems = t.nav;

    const handleSignOut = () => {
        logout();
    };
    
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);


    if (!isLoggedIn) {
        return <AuthScreen onLoginSuccess={() => setActiveFeature('tracking')} t={t} />;
    }

    const renderFeature = () => {
        const featureProps = { t, userId };
        switch (activeFeature) {
            case 'home':
            case 'tracking':
                return <WaterLevelTracker {...featureProps} />;
            case 'locate':
                return <GeolocatingSource {...featureProps} />;
            case 'report':
                return <ReportFeature {...featureProps} />;
            case 'alerts':
                return <RationingAlerts {...featureProps} />;
            case 'ai':
                return <AIPrediction {...featureProps} />;
            case 'community':
                return <CommunityDashboard {...featureProps} />;
            default:
                return <WaterLevelTracker {...featureProps} />;
        }
    };

    const Sidebar = () => (
        <div className="flex flex-col h-full">
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 w-64 z-30 lg:relative lg:translate-x-0 lg:shadow-none shadow-xl border-r border-gray-200 dark:border-gray-800`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{t.appName}</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveFeature(item.id); setIsSidebarOpen(false); }}
                            className={`w-full text-left flex items-center p-3 rounded-xl transition-all duration-200 
                                ${activeFeature === item.id 
                                    ? 'bg-teal-600 text-white shadow-lg' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${activeFeature === item.id ? 'text-white' : 'text-teal-500 dark:text-teal-400'}`} />
                            <span className="font-medium">{item.title}</span>
                        </button>
                    ))}
                </nav>

                {/* User, Dark Mode, and Language Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <User className="w-6 h-6 mr-3 text-teal-600 dark:text-teal-400" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{userEmail || t.authenticated}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">ID: {userId}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                            className="flex items-center justify-center w-full py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl shadow-md hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200 font-medium"
                        >
                            <Languages className="w-5 h-5 mr-2" />
                            {t.lang}
                        </button>

                        <div className="flex justify-between items-center space-x-2">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="flex items-center justify-center w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 font-medium"
                            >
                                {darkMode ? <Sun className="w-5 h-5 mr-2 text-yellow-500" /> : <Moon className="w-5 h-5 mr-2 text-gray-500" />}
                                {t.theme(darkMode)}
                            </button>
                            {/* Sign Out Button */}
                            <button
                                onClick={handleSignOut}
                                title={t.signOut}
                                className="p-3 bg-red-100 dark:bg-red-900 rounded-xl text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition shadow-md"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile Header */}
                    <header className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center lg:hidden border-b border-gray-200 dark:border-gray-800">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <h1 className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{t.appName}</h1>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
                            >
                                <Languages className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => setDarkMode(!darkMode)} 
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                            >
                                {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6" />}
                            </button>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Feature Cards for large screens */}
                            <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                                {navItems.map((item) => (
                                    <FeatureCard
                                        key={item.id}
                                        icon={item.icon}
                                        title={item.title}
                                        description={item.description}
                                        onClick={() => setActiveFeature(item.id)}
                                        className={activeFeature === item.id ? 'border-teal-600 dark:border-teal-400 ring-2 ring-teal-300 dark:ring-teal-500' : ''}
                                    />
                                ))}
                            </div>
                            
                            {renderFeature()}

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// --- App Wrapper ---
const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
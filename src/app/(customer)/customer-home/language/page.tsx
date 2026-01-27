"use client";
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
    Globe, 
    Check,
    ArrowLeft,
    Volume2,
    Loader2
} from 'lucide-react';

type Language = {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    isRTL?: boolean;
};

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', isRTL: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

const LanguageCustomer = () => {
    const { user } = useUser();
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
    const [loading, setLoading] = useState(false);

    const handleLanguageChange = async (languageCode: string) => {
        setLoading(true);
        setSelectedLanguage(languageCode);
        
        // Mock API call to save language preference
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoading(false);
        
        // You would typically update the app's language context here
        alert(`Language changed to ${languages.find(l => l.code === languageCode)?.name}. The app will reload to apply changes.`);
    };

    const playPronunciation = (languageCode: string) => {
        // Mock pronunciation - in real app, you'd play actual audio
        const language = languages.find(l => l.code === languageCode);
        alert(`Playing pronunciation: "${language?.nativeName}"`);
    };

    if (!user) {
        return <div className="p-4">Please sign in</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 backdrop-blur-sm">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-8 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-3 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-orange-600" />
                    </button>
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg">
                        <Globe className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Language</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">Choose your preferred language</p>
                    </div>
                </div>
            </div>

            {/* Current Language Display */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-8 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                        {languages.find(l => l.code === selectedLanguage)?.flag}
                    </div>
                    <div>
                        <p className="font-extrabold text-white text-lg">Current Language</p>
                        <p className="text-white/90 text-xl font-semibold">
                            {languages.find(l => l.code === selectedLanguage)?.nativeName} 
                            ({languages.find(l => l.code === selectedLanguage)?.name})
                        </p>
                    </div>
                </div>
            </div>

            {/* Language List */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Available Languages</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {languages.map((language) => (
                        <div
                            key={language.code}
                            className={`p-6 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 ${
                                selectedLanguage === language.code ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-l-4 border-l-orange-500' : ''
                            }`}
                            onClick={() => handleLanguageChange(language.code)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">{language.flag}</div>
                                    <div className={language.isRTL ? 'text-right' : ''}>
                                        <p className="font-medium text-gray-900">
                                            {language.name}
                                        </p>
                                        <p 
                                            className="text-gray-600"
                                            style={{ direction: language.isRTL ? 'rtl' : 'ltr' }}
                                        >
                                            {language.nativeName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playPronunciation(language.code);
                                        }}
                                        className="p-2 hover:bg-gray-200 rounded-lg"
                                        title="Play pronunciation"
                                    >
                                        <Volume2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                    {selectedLanguage === language.code && (
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl font-extrabold shadow-lg">
                                            <Check className="w-5 h-5" />
                                            <span className="text-sm">Selected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Info */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-green-500 p-6 mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Language Support</h3>
                <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Full interface translation available for English and Bengali</li>
                    <li>• Partial translation available for Hindi and Urdu</li>
                    <li>• Right-to-left (RTL) layout support for Arabic and Urdu</li>
                    <li>• More languages coming soon based on user demand</li>
                </ul>
            </div>

            {/* App Restart Notice */}
            {loading && (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-xl mb-6">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                        <p className="text-white font-semibold">
                            Applying language changes... The app may reload to apply the new language.
                        </p>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-amber-500 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-3">
                    <p>If you encounter issues with language display:</p>
                    <ul className="list-disc list-inside ml-2">
                        <li>Ensure your device supports the selected language fonts</li>
                        <li>Try restarting the app after changing language</li>
                        <li>Contact support if text appears incorrectly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LanguageCustomer;
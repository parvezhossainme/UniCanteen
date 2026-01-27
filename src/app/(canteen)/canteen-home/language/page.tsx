"use client";
import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Globe, 
  Check, 
  Save, 
  RefreshCw,
  Info,
  Settings,
  ChevronRight
} from 'lucide-react';

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isAvailable: boolean;
  completionPercentage: number;
};

type RegionSettings = {
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: string;
};

const LanguageSettingsPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [regionSettings, setRegionSettings] = useState<RegionSettings>({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'BDT',
    numberFormat: 'en-US'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const languages: Language[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      isAvailable: true,
      completionPercentage: 100
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '🇧🇩',
      isAvailable: true,
      completionPercentage: 95
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      isAvailable: true,
      completionPercentage: 90
    },
    {
      code: 'ur',
      name: 'Urdu',
      nativeName: 'اردو',
      flag: '🇵🇰',
      isAvailable: true,
      completionPercentage: 85
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      isAvailable: true,
      completionPercentage: 80
    },
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      isAvailable: false,
      completionPercentage: 60
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      isAvailable: false,
      completionPercentage: 40
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      isAvailable: false,
      completionPercentage: 35
    }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: '03/15/2024 (MM/DD/YYYY)' },
    { value: 'DD/MM/YYYY', label: '15/03/2024 (DD/MM/YYYY)' },
    { value: 'YYYY-MM-DD', label: '2024-03-15 (YYYY-MM-DD)' },
    { value: 'DD MMM YYYY', label: '15 Mar 2024 (DD MMM YYYY)' }
  ];

  const timeFormats = [
    { value: '12h', label: '12:30 PM (12-hour)' },
    { value: '24h', label: '12:30 (24-hour)' }
  ];

    const currencyOptions = [
    { value: 'BDT', label: '৳ (Bangladeshi Taka)', symbol: '৳' },
    { value: 'USD', label: '৳ (US Dollar)', symbol: '৳' },
    { value: 'EUR', label: '৳ (Euro)', symbol: '৳' },
    { value: 'GBP', label: '৳ (British Pound)', symbol: '৳' },
    { value: 'JPY', label: '৳ (Japanese Yen)', symbol: '৳' },
  ];

  useEffect(() => {
    // Load saved language and region settings
    const savedLanguage = localStorage.getItem('canteen-language') || 'en';
    const savedRegionSettings = localStorage.getItem('canteen-region-settings');
    
    setCurrentLanguage(savedLanguage);
    if (savedRegionSettings) {
      setRegionSettings(JSON.parse(savedRegionSettings));
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language && language.isAvailable) {
      setCurrentLanguage(languageCode);
    }
  };

  const handleRegionSettingChange = (setting: keyof RegionSettings, value: string) => {
    setRegionSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in a real app, you'd save to backend)
      localStorage.setItem('canteen-language', currentLanguage);
      localStorage.setItem('canteen-region-settings', JSON.stringify(regionSettings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setCurrentLanguage('en');
    setRegionSettings({
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'BDT',
      numberFormat: 'en-US'
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10 -left-4 -right-4"></div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
                <Languages className="w-6 h-6 text-white" />
              </div>
              Language & Regional Settings
            </h1>
            <p className="text-gray-700 font-semibold mt-1">
              Customize your language preferences and regional formats
            </p>
          </div>
        </div>
        
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-5"></div>
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-blue-500">
          <div className="p-6 border-b">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              Interface Language
            </h2>
            <p className="text-gray-700 font-semibold mt-1">
              Choose your preferred language for the canteen management interface
            </p>
          </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((language) => (
              <div
                key={language.code}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentLanguage === language.code
                    ? 'border-blue-500 bg-blue-50'
                    : language.isAvailable
                    ? 'border-gray-200 hover:border-gray-300 bg-white'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{language.name}</h3>
                      <p className="text-sm text-gray-600">{language.nativeName}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {currentLanguage === language.code && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                    
                    <div className="text-right">
                      <div className={`text-xs font-medium ${getCompletionColor(language.completionPercentage)}`}>
                        {language.completionPercentage}% complete
                      </div>
                      {!language.isAvailable && (
                        <div className="text-xs text-gray-500 mt-1">
                          Coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {!language.isAvailable && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">Not Available</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Regional Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure date, time, currency, and number formats
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dateFormats.map((format) => (
                <div
                  key={format.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    regionSettings.dateFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRegionSettingChange('dateFormat', format.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{format.label}</span>
                    {regionSettings.dateFormat === format.value && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Time Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timeFormats.map((format) => (
                <div
                  key={format.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    regionSettings.timeFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRegionSettingChange('timeFormat', format.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{format.label}</span>
                    {regionSettings.timeFormat === format.value && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Currency
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currencyOptions.map((currency) => (
                <div
                  key={currency.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    regionSettings.currency === currency.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRegionSettingChange('currency', currency.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{currency.label}</span>
                    {regionSettings.currency === currency.value && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h3 className="font-medium mb-2">About Language Settings</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Language changes will apply immediately to the interface</li>
              <li>• Regional settings affect date, time, and currency display formats</li>
              <li>• Some languages may have limited translation coverage</li>
              <li>• Settings are saved automatically and persist across sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={resetToDefault}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Default
        </button>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default LanguageSettingsPage;  
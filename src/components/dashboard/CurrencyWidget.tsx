import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Loader2,
    RefreshCw,
    Settings,
    Check,
} from 'lucide-react';

interface CurrencyRate {
    code: string;
    rate: number;
    change: number;
    up: boolean;
}

interface WidgetSettings {
    enabledCurrencies: string[];
    updateInterval: number; // ms
}

const DEFAULT_SETTINGS: WidgetSettings = {
    enabledCurrencies: ['USD', 'EUR', 'GBP', 'CNY'],
    updateInterval: 5 * 60 * 1000,
};

export function CurrencyWidget() {
    const { t, i18n } = useTranslation();

    const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [settings, setSettings] = useState<WidgetSettings>(() => {
        try {
            const saved = localStorage.getItem('currency-widget-settings');
            return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const saveSettings = (newSettings: WidgetSettings) => {
        setSettings(newSettings);
        localStorage.setItem('currency-widget-settings', JSON.stringify(newSettings));
    };

    const fetchRates = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
            const data = await response.json();

            const prevRates = JSON.parse(localStorage.getItem('prev-currency-rates') || '{}');

            const rates: CurrencyRate[] = settings.enabledCurrencies.map((code) => {
                const rate = 1 / data.rates[code];
                const prevRate = prevRates[code] || rate;
                const change = ((rate - prevRate) / prevRate) * 100;

                return {
                    code: code.toLowerCase(),
                    rate: Math.round(rate * 100) / 100,
                    change: Math.round(change * 100) / 100,
                    up: change >= 0,
                };
            });

            const currentRates: Record<string, number> = {};
            settings.enabledCurrencies.forEach((code) => {
                currentRates[code] = 1 / data.rates[code];
            });
            localStorage.setItem('prev-currency-rates', JSON.stringify(currentRates));

            setCurrencies(rates);
            setLastUpdate(new Date());
            setError(null);
        } catch {
            setError('Failed to load rates');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, settings.updateInterval);
        return () => clearInterval(interval);
    }, [settings]);

    const currencyNames: Record<string, { en: string; ru: string }> = {
        usd: { en: 'US Dollar', ru: 'Доллар США' },
        eur: { en: 'Euro', ru: 'Евро' },
        gbp: { en: 'British Pound', ru: 'Фунт стерлингов' },
        cny: { en: 'Chinese Yuan', ru: 'Юань' },
    };

    const toggleCurrency = (code: string) => {
        const updated = settings.enabledCurrencies.includes(code)
            ? settings.enabledCurrencies.filter((c) => c !== code)
            : [...settings.enabledCurrencies, code];

        saveSettings({ ...settings, enabledCurrencies: updated });
    };

    const updateIntervals = [
        { label: t('interval1'), value: 60_000 },
        { label: t('interval5'), value: 300_000 },
        { label: t('interval10'), value: 600_000 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="widget-icon" style={{ background: 'var(--currency-gradient)' }}>
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{t('currency')}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={fetchRates}
                        disabled={loading}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowSettings(!showSettings)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <Settings className="h-4 w-4" />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showSettings ? (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {i18n.language === 'ru' ? 'Настройки виджета' : 'Widget settings'}
                        </h3>

                        {/* Валюты */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                {i18n.language === 'ru' ? 'Отображаемые валюты' : 'Displayed currencies'}
                            </p>

                            {['USD', 'EUR', 'GBP', 'CNY'].map((code) => (
                                <button
                                    key={code}
                                    onClick={() => toggleCurrency(code)}
                                    className="flex w-full items-center justify-between rounded-lg bg-secondary/40 p-2 hover:bg-secondary"
                                >
                                    <span>{code}</span>
                                    {settings.enabledCurrencies.includes(code) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Интервал обновления */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                {i18n.language === 'ru' ? 'Интервал обновления' : 'Update interval'}
                            </p>

                            {updateIntervals.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => saveSettings({ ...settings, updateInterval: opt.value })}
                                    className="flex w-full items-center justify-between rounded-lg bg-secondary/40 p-2 hover:bg-secondary"
                                >
                                    <span>{opt.label}</span>
                                    {settings.updateInterval === opt.value && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : loading && currencies.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {currencies.map((currency, index) => (
                                <motion.div
                                    key={currency.code}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 * index }}
                                    className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-all hover:bg-secondary"
                                >
                                    <div className="flex flex-col">
                    <span className="text-sm font-medium uppercase text-foreground">
                      {currency.code}
                    </span>
                                        <span className="text-xs text-muted-foreground">
                      {currencyNames[currency.code]?.[i18n.language === 'ru' ? 'ru' : 'en']}
                    </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {currency.rate.toFixed(2)} ₽
                    </span>
                                        <div
                                            className={`flex items-center gap-1 text-xs ${
                                                currency.up ? 'text-green-500' : 'text-red-500'
                                            }`}
                                        >
                                            {currency.up ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            <span>
                        {currency.change > 0 ? '+' : ''}
                                                {currency.change.toFixed(2)}%
                      </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {lastUpdate && (
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                {i18n.language === 'ru' ? 'Обновлено' : 'Updated'}:{' '}
                                {lastUpdate.toLocaleTimeString()}
                            </p>
                        )}
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

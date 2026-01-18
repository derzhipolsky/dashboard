import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    Droplets,
    CloudSun,
    Loader2,
    MapPin,
    Settings,
    Search,
    X
} from 'lucide-react';

interface WeatherData {
    temp: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    wind: number;
    city: string;
}

interface DailyForecast {
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
}

interface SavedLocation {
    lat: number;
    lon: number;
    name: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
    clear: <Sun className="h-12 w-12" />,
    sunny: <Sun className="h-12 w-12" />,
    cloudy: <Cloud className="h-12 w-12" />,
    partlyCloudy: <CloudSun className="h-12 w-12" />,
    rain: <CloudRain className="h-12 w-12" />,
    snow: <Snowflake className="h-12 w-12" />,
};

const getWeatherCondition = (weatherCode: number): string => {
    if (weatherCode === 0) return 'clear';
    if (weatherCode <= 3) return 'partlyCloudy';
    if (weatherCode <= 49) return 'cloudy';
    if (weatherCode <= 69) return 'rain';
    if (weatherCode <= 79) return 'snow';
    if (weatherCode <= 99) return 'rain';
    return 'cloudy';
};

const loadSavedLocation = (): SavedLocation | null => {
    try {
        const saved = localStorage.getItem('dashboard-weather-location');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

export function WeatherWidget() {
    const { t, i18n } = useTranslation();

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<DailyForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<
        Array<{ name: string; lat: number; lon: number; country: string }>
    >([]);
    const [searching, setSearching] = useState(false);

    const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(loadSavedLocation);

    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
        try {
            setLoading(true);

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
            );

            const data = await response.json();

            setWeather({
                temp: Math.round(data.current.temperature_2m),
                feelsLike: Math.round(data.current.apparent_temperature),
                condition: getWeatherCondition(data.current.weather_code),
                humidity: data.current.relative_humidity_2m,
                wind: Math.round(data.current.wind_speed_10m * 10) / 10,
                city: cityName,
            });

            const daily = data.daily;
            const next3 = [1, 2, 3].map((i) => ({
                date: daily.time[i],
                tempMax: Math.round(daily.temperature_2m_max[i]),
                tempMin: Math.round(daily.temperature_2m_min[i]),
                condition: getWeatherCondition(daily.weather_code[i]),
            }));

            setForecast(next3);
            setError(null);
        } catch {
            setError(i18n.language === 'ru' ? 'Ошибка загрузки' : 'Failed to load');
        }

        setLoading(false);
    };

    const searchCities = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);

        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                    query
                )}&count=5&language=${i18n.language}`
            );
            const data = await response.json();

            setSearchResults(
                data.results?.map((r: any) => ({
                    name: r.name,
                    lat: r.latitude,
                    lon: r.longitude,
                    country: r.country || '',
                })) || []
            );
        } catch {
            setSearchResults([]);
        }

        setSearching(false);
    };

    const selectCity = (city: { name: string; lat: number; lon: number }) => {
        const location: SavedLocation = { lat: city.lat, lon: city.lon, name: city.name };
        setSavedLocation(location);
        localStorage.setItem('dashboard-weather-location', JSON.stringify(location));
        fetchWeather(city.lat, city.lon, city.name);
        setShowSettings(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) return;

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const geoResponse = await fetch(
                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${i18n.language}`
                    );
                    const geoData = await geoResponse.json();
                    const cityName =
                        geoData.results?.[0]?.name ||
                        (i18n.language === 'ru' ? 'Ваше местоположение' : 'Your Location');

                    const location: SavedLocation = { lat: latitude, lon: longitude, name: cityName };
                    setSavedLocation(location);
                    localStorage.setItem('dashboard-weather-location', JSON.stringify(location));

                    fetchWeather(latitude, longitude, cityName);
                } catch {
                    fetchWeather(
                        latitude,
                        longitude,
                        i18n.language === 'ru' ? 'Ваше местоположение' : 'Your Location'
                    );
                }
            },
            () => {
                setError(i18n.language === 'ru' ? 'Нет доступа к геолокации' : 'No geolocation access');
                setLoading(false);
            }
        );

        setShowSettings(false);
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            searchCities(searchQuery);
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    useEffect(() => {
        if (savedLocation) {
            fetchWeather(savedLocation.lat, savedLocation.lon, savedLocation.name);
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        const geoResponse = await fetch(
                            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${i18n.language}`
                        );
                        const geoData = await geoResponse.json();
                        const cityName = geoData.results?.[0]?.name || 'Unknown';
                        fetchWeather(latitude, longitude, cityName);
                    } catch {
                        fetchWeather(latitude, longitude, 'Your Location');
                    }
                },
                () => {
                    fetchWeather(55.7558, 37.6173, i18n.language === 'ru' ? 'Москва' : 'Moscow');
                }
            );
        } else {
            fetchWeather(55.7558, 37.6173, i18n.language === 'ru' ? 'Москва' : 'Moscow');
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="widget-icon" style={{ background: 'var(--weather-gradient)' }}>
                        <Cloud className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{t('weather')}</h2>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    {showSettings ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {showSettings ? (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={i18n.language === 'ru' ? 'Поиск города...' : 'Search city...'}
                                className="glass-input pl-10"
                            />
                        </div>

                        {searching && (
                            <div className="flex justify-center py-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-1">
                                {searchResults.map((city, index) => (
                                    <motion.button
                                        key={`${city.name}-${city.lat}-${index}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => selectCity(city)}
                                        className="flex w-full items-center gap-2 rounded-xl bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary"
                                    >
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{city.name}</span>
                                        <span className="text-xs text-muted-foreground">{city.country}</span>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={useCurrentLocation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/20 p-3 text-primary transition-colors hover:bg-primary/30"
                        >
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">
                {i18n.language === 'ru' ? 'Использовать геолокацию' : 'Use current location'}
              </span>
                        </motion.button>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-32 items-center justify-center"
                    >
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-32 items-center justify-center text-muted-foreground"
                    >
                        {error}
                    </motion.div>
                ) : weather ? (
                    <motion.div
                        key="weather"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{weather.city}</span>
                                </div>
                                <p className="text-5xl font-light text-foreground">{weather.temp}°</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t('feelsLike')} {weather.feelsLike}°
                                </p>
                            </div>

                            <motion.div
                                className="text-primary"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {weatherIcons[weather.condition] || weatherIcons.cloudy}
                            </motion.div>
                        </div>

                        <div className="mt-6 flex gap-6">
                            <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-primary" />
                                <span className="text-sm text-muted-foreground">
                  {t('humidity')}: {weather.humidity}%
                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-primary" />
                                <span className="text-sm text-muted-foreground">
                  {t('wind')}: {weather.wind} {t('ms')}
                </span>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-border pt-4">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                {i18n.language === 'ru' ? 'Прогноз на 3 дня' : '3‑day forecast'}
                            </h3>

                            <div className="grid grid-cols-3 gap-3">
                                {forecast.map((day, index) => (
                                    <motion.div
                                        key={day.date}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="rounded-xl bg-secondary/40 p-3 text-center"
                                    >
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(day.date).toLocaleDateString(i18n.language, {
                                                weekday: 'short',
                                            })}
                                        </p>

                                        <div className="my-2 flex justify-center text-primary">
                                            {weatherIcons[day.condition] || weatherIcons.cloudy}
                                        </div>

                                        <p className="text-sm font-medium text-foreground">
                                            {day.tempMax}° / {day.tempMin}°
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
}

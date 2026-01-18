import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Shuffle,
    Repeat,
    List,
    X,
    Plus,
    Trash2
} from 'lucide-react';

import { parseBlob } from 'music-metadata-browser';

import {
    saveTrackFile,
    loadTrackFile,
    deleteTrackFile,
    saveCoverFile,
    loadCoverFile,
    deleteCoverFile
} from '../musicStorage.ts';

interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover?: string;
    coverId?: string;
    duration: number;
    fileId?: string;
}

const defaultTracks: Track[] = [
    {
        id: 'demo-1',
        title: 'Искры',
        artist: 'Амура',
        url: '/dashboard/music/Amura_-_Iskry.mp3',
        duration: 122,
        cover: '/dashboard/covers/ab67616d00001e021efa666bee6e2a538d85cd38.jpeg',
        fileId: undefined,
        coverId: undefined,
    },
];

const loadTracksFromStorage = (): Track[] => {
    try {
        const stored = localStorage.getItem('dashboard-music-tracks');
        if (stored) {
            const userTracks = JSON.parse(stored);
            return [...defaultTracks, ...userTracks];
        }
    } catch {}

    return defaultTracks;
};

export function MusicPlayer() {
    const { i18n } = useTranslation();

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tracks, setTracks] = useState<Track[]>(loadTracksFromStorage);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);

    const currentTrack = tracks[currentTrackIndex] || tracks[0];

    useEffect(() => {
        const userTracks = tracks.filter(t => t.fileId); // только загруженные
        const safe = userTracks.map(t => ({
            ...t,
            url: '',
            cover: '',
        }));

        localStorage.setItem('dashboard-music-tracks', JSON.stringify(safe));
    }, [tracks]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        const handleEnded = () => {
            if (isRepeating) {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextTrack();
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isRepeating, currentTrackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!audio.src) {
            setTimeout(togglePlay, 50);
            return;
        }

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                await audio.play();
                setIsPlaying(true);
            }
        } catch (err) {
            console.error("Play error:", err);
        }
    };

    useEffect(() => {
        async function restore() {
            const restored = await Promise.all(
                tracks.map(async (t) => {
                    if (!t.fileId) return t;

                    let url = t.url;
                    let cover = t.cover;

                    const blob = await loadTrackFile(t.fileId);
                    if (blob) url = URL.createObjectURL(blob);

                    if (t.coverId) {
                        const coverBlob = await loadCoverFile(t.coverId);
                        if (coverBlob) cover = URL.createObjectURL(coverBlob);
                    }

                    return { ...t, url, cover };
                })
            );

            setTracks(restored);
        }

        restore();
    }, []);

    const nextTrack = () => {
        if (tracks.length === 0) return;

        setCurrentTime(0);

        setCurrentTrackIndex(prev => {
            if (isShuffled) {
                return Math.floor(Math.random() * tracks.length);
            }
            return (prev + 1) % tracks.length;
        });

        if (isPlaying && audioRef.current) {
            setTimeout(() => audioRef.current?.play(), 50);
        }
    };

    const prevTrack = () => {
        if (tracks.length === 0) return;

        if (currentTime > 3) {
            if (audioRef.current) audioRef.current.currentTime = 0;
            setCurrentTime(0);
            return;
        }

        setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
        setCurrentTime(0);

        if (isPlaying && audioRef.current) {
            setTimeout(() => audioRef.current?.play(), 50);
        }
    };

    const extractMetadata = async (file: File) => {
        try {
            const metadata = await parseBlob(file);
            const common = metadata.common;

            let coverId: string | undefined;
            let coverUrl: string | undefined;

            if (common.picture && common.picture.length > 0) {
                const { data, format } = common.picture[0];
                const uint8 = new Uint8Array(data);
                const blob = new Blob([uint8], { type: format });

                coverId = `cover-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                await saveCoverFile(coverId, blob);

                coverUrl = URL.createObjectURL(blob);
            }

            return {
                title: common.title,
                artist: common.artist,
                coverId,
                coverUrl,
            };
        } catch (err) {
            console.error("Metadata error:", err);
            return {};
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('audio/')) continue;

            const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;

            await saveTrackFile(fileId, file);

            const audioBlob = await loadTrackFile(fileId);
            const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : "";

            const tempAudio = new Audio(audioUrl);
            await new Promise<void>((resolve) => {
                tempAudio.onloadedmetadata = () => resolve();
                tempAudio.onerror = () => resolve();
            });

            const meta = await extractMetadata(file);
            let coverUrl = "";
            if (meta.coverId) {
                const coverBlob = await loadCoverFile(meta.coverId);
                if (coverBlob) {
                    coverUrl = URL.createObjectURL(coverBlob);
                }
            }

            const fileName = file.name.replace(/\.[^/.]+$/, '');

            const newTrack: Track = {
                id: `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title: meta.title || fileName,
                artist: meta.artist || (i18n.language === 'ru' ? 'Неизвестный' : 'Unknown'),
                duration: tempAudio.duration || 0,
                url: audioUrl,        // ← теперь есть сразу
                cover: coverUrl,      // ← теперь есть сразу
                fileId,
                coverId: meta.coverId,
            };

            setTracks(prev => [...prev, newTrack]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const deleteTrack = async (trackId: string) => {
        const index = tracks.findIndex(t => t.id === trackId);
        if (index === -1) return;

        const track = tracks[index];

        if (index === currentTrackIndex) {
            setIsPlaying(false);
            audioRef.current?.pause();
        }

        if (track.fileId) {
            await deleteTrackFile(track.fileId);
        }

        if (track.coverId) {
            await deleteCoverFile(track.coverId);
        }

        setCurrentTrackIndex(prev => {
            if (index < prev) return prev - 1;
            if (index === prev && index === tracks.length - 1) {
                return Math.max(0, prev - 1);
            }
            return prev;
        });

        setTracks(prev => prev.filter(t => t.id !== trackId));
    };

    const handleCoverUpload = (trackId: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const coverId = `cover-${Date.now()}-${Math.random().toString(36).slice(2)}`;

            await saveCoverFile(coverId, file);

            const coverUrl = URL.createObjectURL(file);

            setTracks(prev =>
                prev.map(t =>
                    t.id === trackId
                        ? { ...t, cover: coverUrl, coverId }
                        : t
                )
            );
        };

        input.click();
    };


    const selectTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setCurrentTime(0);
        setShowPlaylist(false);

        setTimeout(() => {
            if (audioRef.current?.src) {
                audioRef.current.play().then(() => setIsPlaying(true));
            }
        }, 150);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);

        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        setIsMuted(vol === 0);

        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card relative overflow-hidden p-6 min-h-[450px]"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <audio ref={audioRef} src={currentTrack?.url} preload="metadata" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="widget-icon bg-gradient-to-br from-pink-500 to-purple-600">
              <Music className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {i18n.language === 'ru' ? 'Музыка' : 'Music'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title={i18n.language === 'ru' ? 'Добавить музыку' : 'Add music'}
            >
              <Plus className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {showPlaylist ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showPlaylist ? (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-64 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex w-full items-center justify-between rounded-xl p-3 transition-all ${
                    index === currentTrackIndex 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  <button
                    onClick={() => selectTrack(index)}
                    className="flex flex-1 items-center gap-3"
                  >
                    {track.cover ? (
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : index === currentTrackIndex && isPlaying ? (
                      <div className="flex h-10 w-10 items-center justify-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 rounded-full bg-primary"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center text-center text-sm text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </span>
                    {!track.id.startsWith('demo') && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentTrack && (
                <div className="mb-4 text-center">
                  <motion.button
                    key={currentTrack.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleCoverUpload(currentTrack.id)}
                    className="mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 transition-all hover:scale-105"
                    title={i18n.language === 'ru' ? 'Загрузить обложку' : 'Upload cover'}
                  >
                    {currentTrack.cover ? (
                      <img
                        src={currentTrack.cover}
                        alt={currentTrack.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-10 w-10 text-primary" />
                    )}
                  </motion.button>
                  <h3 className="font-semibold text-foreground">{currentTrack.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                </div>
              )}

              <div className="mb-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="progress-slider w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`rounded-lg p-2 transition-colors ${
                    isShuffled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shuffle className="h-4 w-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTrack}
                  className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary"
                >
                  <SkipBack className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="ml-1 h-6 w-6" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary"
                >
                  <SkipForward className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsRepeating(!isRepeating)}
                  className={`rounded-lg p-2 transition-colors ${
                    isRepeating ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </motion.button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider w-24"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

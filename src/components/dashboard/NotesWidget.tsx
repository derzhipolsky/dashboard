import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface Note {
  id: number;
  text: string;
  color: string;
  createdAt: string;
}

const noteColors = [
  'bg-yellow-100 dark:bg-yellow-900/30',
  'bg-blue-100 dark:bg-blue-900/30',
  'bg-green-100 dark:bg-green-900/30',
  'bg-pink-100 dark:bg-pink-900/30',
  'bg-purple-100 dark:bg-purple-900/30',
];

export function NotesWidget() {
  const { t, i18n } = useTranslation();
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('dashboard-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('dashboard-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now(),
      text: newNote.trim(),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      createdAt: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    setNotes(notes.map(n => 
      n.id === editingId ? { ...n, text: editText.trim() } : n
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="widget-icon" style={{ background: 'var(--notes-gradient)' }}>
          <StickyNote className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t('notes')}</h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('addNote')}
          className="glass-input flex-1 text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addNote}
          className="glass-button flex items-center justify-center px-3 text-primary"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence>
          {notes.length > 0 ? (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`group rounded-xl p-3 transition-all ${note.color}`}
              >
                {editingId === note.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="glass-input min-h-[60px] resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={cancelEdit}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={saveEdit}
                        className="rounded-lg bg-primary p-1.5 text-primary-foreground"
                      >
                        <Check className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{note.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEdit(note)}
                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteNote(note.id)}
                        className="rounded-lg p-1 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              {t('noNotes')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

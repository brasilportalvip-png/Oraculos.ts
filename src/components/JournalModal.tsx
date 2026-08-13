import React, { useState } from 'react';
import { ReadingEntry } from '../types/oracle';
import { sound } from '../utils/audio';
import { BookOpen, X, Trash2, Download, Search, Sparkles } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: ReadingEntry[];
  onDeleteReading: (id: string) => void;
  onClearJournal: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  readings,
  onDeleteReading,
  onClearJournal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReading, setSelectedReading] = useState<ReadingEntry | null>(null);

  if (!isOpen) return null;

  const filteredReadings = readings.filter(
    r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJournal = () => {
    sound.playSingingBowl(440);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(readings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `oraculos-diario-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-amber-200 text-lg">
              Diário Oracular Sagrado
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({readings.length} Registros)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Global Actions */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar registros..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {readings.length > 0 && (
              <>
                <button
                  onClick={handleExportJournal}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar JSON</span>
                </button>

                <button
                  onClick={onClearJournal}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Tudo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Content / Reading List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredReadings.length > 0 ? (
            filteredReadings.map(reading => (
              <div
                key={reading.id}
                className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      {reading.oracleType}
                    </span>
                    <h4 className="font-serif font-bold text-amber-100 text-sm">
                      {reading.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(reading.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => onDeleteReading(reading.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {reading.summary}
                </p>

                {reading.notes && (
                  <div className="text-[11px] text-amber-200/80 italic pt-1 border-t border-slate-900">
                    📝 Note: {reading.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">
                Nenhum registro encontrado no diário.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

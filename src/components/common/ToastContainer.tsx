import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info' || !toast.type;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl backdrop-blur-md border transition-all ${
                isSuccess
                  ? 'bg-white/95 text-slate-800 border-emerald-500/40 shadow-emerald-500/10'
                  : isError
                  ? 'bg-white/95 text-slate-800 border-rose-500/40 shadow-rose-500/10'
                  : isWarning
                  ? 'bg-white/95 text-slate-800 border-amber-500/40 shadow-amber-500/10'
                  : 'bg-white/95 text-slate-800 border-indigo-500/40 shadow-indigo-500/10'
              }`}
            >
              {/* Status Icon */}
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-600'
                    : isError
                    ? 'bg-rose-100 text-rose-600'
                    : isWarning
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isError && <AlertCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {isInfo && <Info className="w-4 h-4" />}
              </div>

              {/* Toast Text */}
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed break-words mt-0.5">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                id={`btn-dismiss-toast-${toast.id}`}
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Tutup pemberitahuan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

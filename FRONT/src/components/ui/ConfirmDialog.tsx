interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const ConfirmDialog = ({ open, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel, danger = false }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease_both]" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-[scaleIn_0.2s_ease_both]">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-error/10' : 'bg-primary/10'}`}>
            <span className={`material-symbols-outlined text-[24px] ${danger ? 'text-error' : 'text-primary'}`}>
              {danger ? 'warning' : 'help'}
            </span>
          </div>
          <h3 className="font-headline text-headline-sm text-on-surface">{title}</h3>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 ml-16">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md font-bold transition-colors ${
              danger
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary hover:bg-primary-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

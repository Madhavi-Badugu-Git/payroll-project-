'use client';

import { useCallback, useState } from 'react';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  severity?: 'warning' | 'error' | 'info';
}

interface UseConfirmDialogReturn {
  confirmDialog: ConfirmDialogState;
  showConfirmDialog: (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    severity?: 'warning' | 'error' | 'info';
  }) => void;
  hideConfirmDialog: () => void;
}

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    severity: 'warning',
  });

  const showConfirmDialog = useCallback(
    (options: {
      title: string;
      message: string;
      onConfirm: () => void;
      severity?: 'warning' | 'error' | 'info';
    }) => {
      setConfirmDialog({
        open: true,
        title: options.title,
        message: options.message,
        onConfirm: options.onConfirm,
        severity: options.severity || 'warning',
      });
    },
    []
  );

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  }, []);

  return {
    confirmDialog,
    showConfirmDialog,
    hideConfirmDialog,
  };
};

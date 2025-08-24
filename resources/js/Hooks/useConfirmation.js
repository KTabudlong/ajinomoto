import { useState, useCallback } from "react";

/**
 * Custom hook for managing confirmation modals
 * Follows SOLID principles for reusability and separation of concerns
 */
const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmVariant: "danger",
    onConfirm: () => {},
  });

  const showConfirmation = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      confirmVariant = "danger",
      onConfirm,
    }) => {
      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        confirmVariant,
        onConfirm: onConfirm || (() => {}),
      });
      setIsOpen(true);
    },
    [],
  );

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    config.onConfirm();
    hideConfirmation();
  }, [config, hideConfirmation]);

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
};

export default useConfirmation;

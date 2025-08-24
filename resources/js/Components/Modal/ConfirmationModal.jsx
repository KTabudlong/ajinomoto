import React from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
  disabled = false,
}) => {
  const handleConfirm = () => {
    if (!disabled && !isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal show={isOpen} onClose={handleClose} maxWidth="md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {typeof message === "string" ? (
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          ) : (
            <div className="mt-2 text-sm text-gray-600">{message}</div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <SecondaryButton onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

import React, { forwardRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Button } from '../button';

const modalVariants = cva(
  'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all',
  {
    variants: {
      size: {
        xs: 'sm:max-w-xs sm:w-full',
        sm: 'sm:max-w-sm sm:w-full',
        md: 'sm:max-w-md sm:w-full',
        lg: 'sm:max-w-lg sm:w-full',
        xl: 'sm:max-w-xl sm:w-full',
        '2xl': 'sm:max-w-2xl sm:w-full',
        '3xl': 'sm:max-w-3xl sm:w-full',
        '4xl': 'sm:max-w-4xl sm:w-full',
        '5xl': 'sm:max-w-5xl sm:w-full',
        '6xl': 'sm:max-w-6xl sm:w-full',
        '7xl': 'sm:max-w-7xl sm:w-full',
        full: 'sm:max-w-full sm:w-full sm:h-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps
  extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      footer,
      size = 'md',
      closable = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
      overlayClassName,
      initialFocus,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    return (
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeOnOverlayClick ? onClose : () => {}}
          initialFocus={initialFocus}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={cn(
                'fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm',
                overlayClassName
              )}
            />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  ref={ref}
                  className={cn(modalVariants({ size }), className)}
                  {...props}
                >
                  {/* Header */}
                  {(title || description || closable) && (
                    <div className="flex items-start justify-between p-6 border-b border-gray-200">
                      <div className="flex-1">
                        {title && (
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                          >
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <Dialog.Description className="mt-1 text-sm text-gray-500">
                            {description}
                          </Dialog.Description>
                        )}
                      </div>
                      {closable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md p-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onClick={onClose}
                          aria-label="Close modal"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className={cn(
                    'p-6',
                    (title || description) && 'pt-6',
                    footer && 'pb-0'
                  )}>
                    {children}
                  </div>

                  {/* Footer */}
                  {footer && (
                    <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                      {footer}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
);

Modal.displayName = 'Modal';

// Confirmation Modal
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(
  (
    {
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
      onClose,
      variant = 'info',
      loading = false,
      ...props
    },
    ref
  ) => {
    const handleConfirm = async () => {
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        // Keep modal open if confirm action fails
        console.error('Confirm action failed:', error);
      }
    };

    const handleCancel = () => {
      onCancel?.();
      onClose();
    };

    const variantColors = {
      danger: 'danger',
      warning: 'warning',
      info: 'primary',
    } as const;

    return (
      <Modal
        ref={ref}
        onClose={onClose}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variantColors[variant]}
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </>
        }
        {...props}
      >
        <div className="text-sm text-gray-600">
          {message}
        </div>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

// Form Modal
export interface FormModalProps extends Omit<ModalProps, 'footer'> {
  onSubmit?: (event: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
}

const FormModal = forwardRef<HTMLDivElement, FormModalProps>(
  (
    {
      onSubmit,
      submitText = 'Save',
      cancelText = 'Cancel',
      onCancel,
      onClose,
      loading = false,
      submitDisabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit?.(event);
    };

    const handleCancel = () => {
      onCancel?.();
      onClose();
    };

    return (
      <Modal
        ref={ref}
        onClose={onClose}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              form="modal-form"
              loading={loading}
              disabled={submitDisabled}
            >
              {submitText}
            </Button>
          </>
        }
        {...props}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
          {children}
        </form>
      </Modal>
    );
  }
);

FormModal.displayName = 'FormModal';

export {
  Modal,
  ConfirmModal,
  FormModal,
  modalVariants,
};

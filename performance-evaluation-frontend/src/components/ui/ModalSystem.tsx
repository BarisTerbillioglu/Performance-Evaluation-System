import React from 'react';
import { useUIStore } from '@/stores';
import { Modal } from '@/stores/types/ui';

const ModalOverlay: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClick}
    >
      <div className="w-full max-h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const ModalContent: React.FC<{ modal: Modal }> = ({ modal }) => {
  const hideModal = useUIStore(state => state.hideModal);
  
  const getSizeClass = () => {
    switch (modal.size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  };
  
  const handleOverlayClick = () => {
    if (modal.closable !== false) {
      hideModal(modal.id);
    }
  };
  
  const handleClose = () => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    hideModal(modal.id);
  };
  
  const handleConfirm = async () => {
    if (modal.onConfirm) {
      try {
        await modal.onConfirm();
        hideModal(modal.id);
      } catch (error) {
        // Keep modal open if confirmation fails
        console.error('Modal confirmation failed:', error);
      }
    } else {
      hideModal(modal.id);
    }
  };
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <div 
        className={`
          bg-white rounded-lg shadow-xl mx-auto relative
          ${getSizeClass()}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {modal.title}
          </h2>
          {modal.closable !== false && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {modal.type === 'custom' && modal.component ? (
            <modal.component {...(modal.props || {})} />
          ) : (
            <div className="text-gray-700">
              {modal.content}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {(modal.type === 'confirm' || modal.onConfirm) && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
};

export const ModalSystem: React.FC = () => {
  const modals = useUIStore(state => state.modals);
  
  if (modals.length === 0) {
    return null;
  }
  
  return (
    <>
      {modals.map(modal => (
        <ModalContent key={modal.id} modal={modal} />
      ))}
    </>
  );
};

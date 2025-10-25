import React from 'react';
import { useResponsive } from '../utils/responsive';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) => {
  const { isMobile, getTextSize } = useResponsive();
  
  if (!isOpen) return null;

  const getSizeClasses = () => {
    if (isMobile) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }
    
    switch (size) {
      case 'small':
        return 'max-w-md';
      case 'large':
        return 'max-w-4xl';
      case 'medium':
      default:
        return 'max-w-2xl';
    }
  };

  return (
    <div 
        className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 ${isMobile ? 'p-0' : 'p-4'}`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className={`bg-card-bg shadow-xl w-full ${getSizeClasses()} ${isMobile ? 'h-full' : 'max-h-[80vh] rounded-lg'} flex flex-col`}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className={`flex justify-between items-center ${isMobile ? 'p-6' : 'p-4'} border-b border-slate-600`}>
          <h2 id="modal-title" className={`${getTextSize('text-xl')} font-bold text-accent-blue`}>{title}</h2>
          {showCloseButton && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-moonlight transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>
        <main className={`${isMobile ? 'p-6' : 'p-6'} overflow-y-auto text-slate-300 leading-relaxed flex-1`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;
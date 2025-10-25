import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal Component Integration', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles backdrop click', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('prevents close when clicking modal content', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Small Modal" size="small">
        <p>Small content</p>
      </Modal>
    );

    let modalDialog = screen.getByRole('dialog').firstElementChild;
    expect(modalDialog).toHaveClass('max-w-md');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Medium Modal" size="medium">
        <p>Medium content</p>
      </Modal>
    );

    modalDialog = screen.getByRole('dialog').firstElementChild;
    expect(modalDialog).toHaveClass('max-w-2xl');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Large Modal" size="large">
        <p>Large content</p>
      </Modal>
    );

    modalDialog = screen.getByRole('dialog').firstElementChild;
    expect(modalDialog).toHaveClass('max-w-4xl');
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
  });

  it('shows close button by default', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('maintains responsive layout', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'flex', 'justify-center', 'items-center', 'p-4');

    const modalContent = backdrop.firstElementChild;
    expect(modalContent).toHaveClass('w-full', 'max-h-[80vh]', 'flex', 'flex-col');
  });

  it('handles complex content with proper scrolling', () => {
    const longContent = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join('\n');
    
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Long Content Modal">
        <div>{longContent}</div>
      </Modal>
    );

    const mainContent = screen.getByText(/Line 1/).closest('main');
    expect(mainContent).toHaveClass('overflow-y-auto');
  });

  it('renders religious event details correctly', () => {
    const religiousEventContent = (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-moonlight mb-2">Event Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400 mb-1">Date</p>
                <p className="text-moonlight font-medium">January 15, 2024</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Tradition</p>
                <p className="font-medium capitalize text-green-400">Islam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Eid al-Fitr" size="large">
        {religiousEventContent}
      </Modal>
    );

    expect(screen.getByText('Event Details')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Islam')).toBeInTheDocument();
  });
});
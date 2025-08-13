import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentChatbot from '../DocumentChatbot';

// Mock the huggingFaceService
vi.mock('../../utils/huggingFaceService', () => ({
  default: {
    generateResponse: vi.fn(),
    isAvailable: vi.fn(),
    getStatus: vi.fn()
  }
}));

// Mock the service
let mockHuggingFaceService;

describe('DocumentChatbot', () => {
  const mockDocumentData = {
    documentType: 'land ownership contract',
    owner: 'John Doe',
    surveyNumber: '123',
    area: '2 acres',
    district: 'Test District',
    taluk: 'Test Taluk',
    village: 'Test Village'
  };

  const mockDocumentText = 'This is a sample land contract document for testing purposes.';

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked service
    const module = await import('../../utils/huggingFaceService');
    mockHuggingFaceService = module.default;
    
    // Default mock implementations
    mockHuggingFaceService.generateResponse.mockResolvedValue('This is a test response from the AI.');
    mockHuggingFaceService.isAvailable.mockReturnValue(true);
    mockHuggingFaceService.getStatus.mockReturnValue({
      available: true,
      configured: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should render welcome message when chat is opened', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat to see welcome message
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText(/Hello! I'm your AI document assistant/)).toBeInTheDocument();
        expect(screen.getByText(/land ownership contract/)).toBeInTheDocument();
      });
    });

    it('should show floating chat button', () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      expect(screen.getByLabelText('Open AI Document Assistant')).toBeInTheDocument();
      expect(screen.getByText('ASK')).toBeInTheDocument();
    });
  });

  describe('Chat Interface', () => {
    it('should open chat interface when ASK button is clicked', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });
    });

    it('should close chat interface when close button is clicked', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close chat');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('AI Document Assistant')).not.toBeInTheDocument();
      });
    });
  });

  describe('Message Handling', () => {
    it('should send user message and receive AI response', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Type and send message
      const input = screen.getByPlaceholderText('Ask about this document...');
      fireEvent.change(input, { target: { value: 'What are the key terms?' } });
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Check that user message appears
      await waitFor(() => {
        expect(screen.getByText('What are the key terms?')).toBeInTheDocument();
      });

      // Check that AI response appears
      await waitFor(() => {
        expect(screen.getByText('This is a test response from the AI.')).toBeInTheDocument();
      });

      // Verify service was called
      expect(mockHuggingFaceService.generateResponse).toHaveBeenCalledWith(
        'What are the key terms?',
        mockDocumentData,
        mockDocumentText
      );
    });

    it('should handle empty message input', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Try to send empty message
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should not call the service
      expect(mockHuggingFaceService.generateResponse).not.toHaveBeenCalled();
    });
  });

  describe('Suggested Questions', () => {
    it('should display suggested questions for land ownership contract', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Check for suggested questions
      expect(screen.getByText(/What are the key terms of this contract/)).toBeInTheDocument();
      expect(screen.getByText(/What are the payment terms and conditions/)).toBeInTheDocument();
    });

    it('should auto-send suggested question when clicked', async () => {
      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Click on suggested question
      const suggestedQuestion = screen.getByText(/What are the key terms of this contract/);
      fireEvent.click(suggestedQuestion);

      // Wait for the question to be processed
      await waitFor(() => {
        expect(mockHuggingFaceService.generateResponse).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockHuggingFaceService.generateResponse.mockRejectedValue(new Error('API Error'));

      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Send message
      const input = screen.getByPlaceholderText('Ask about this document...');
      fireEvent.change(input, { target: { value: 'Test question' } });
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/I apologize, but I encountered an error/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while processing', async () => {
      // Mock slow response
      mockHuggingFaceService.generateResponse.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('Response'), 100))
      );

      render(
        <DocumentChatbot 
          documentData={mockDocumentData} 
          documentText={mockDocumentText} 
        />
      );

      // Open chat
      const askButton = screen.getByLabelText('Open AI Document Assistant');
      fireEvent.click(askButton);

      await waitFor(() => {
        expect(screen.getByText('AI Document Assistant')).toBeInTheDocument();
      });

      // Send message
      const input = screen.getByPlaceholderText('Ask about this document...');
      fireEvent.change(input, { target: { value: 'Test question' } });
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should show loading indicator
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });
  });
});

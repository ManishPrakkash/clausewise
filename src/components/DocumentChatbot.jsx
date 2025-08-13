import { useState, useEffect } from 'react';
import huggingFaceService from '../utils/huggingFaceService';

const DocumentChatbot = ({ documentData, documentText }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const documentType = documentData?.documentType || 'document';
    const owner = documentData?.owner || 'the property';
    const location = documentData?.district || 'the specified location';
    
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello! I'm your AI document assistant. I've analyzed your ${documentType} for ${owner} located in ${location}. I can help you understand the content, terms, risks, and legal implications. What would you like to know about this document?`,
        timestamp: new Date()
      }
    ]);
  }, [documentData]);

  const suggestedQuestions = {
    'land ownership contract': [
      'What are the key terms of this contract?',
      'What are the payment terms and conditions?',
      'What are the termination conditions?',
      'What are the main risks and obligations?',
      'What is the property description?',
      'What are the dispute resolution procedures?',
      'What are the confidentiality terms?'
    ],
    'patta': [
      'What is the survey number mentioned?',
      'What is the land area and classification?',
      'Who is the current owner?',
      'What are the land boundaries?',
      'What are the tax obligations?',
      'What is the land use pattern?',
      'What are the revenue details?'
    ],
    'chitta': [
      'What is the land classification?',
      'What are the revenue details?',
      'Who are the landowners?',
      'What is the land use pattern?',
      'What are the survey details?',
      'What are the cultivation details?',
      'What are the ownership rights?'
    ],
    'title deed': [
      'What is the property description?',
      'Who are the legal owners?',
      'What are the encumbrances?',
      'What is the registration date?',
      'What are the terms and conditions?',
      'What are the transfer restrictions?',
      'What are the legal obligations?'
    ],
    'default': [
      'What are the main points in this document?',
      'What are the key terms and conditions?',
      'What are the potential risks or issues?',
      'What are the obligations mentioned?',
      'What are the important dates or deadlines?',
      'What are the legal implications?',
      'What are the compliance requirements?'
    ]
  };

  const getDocumentType = () => {
    return documentData?.documentType?.toLowerCase() || 'default';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await huggingFaceService.generateResponse(inputMessage, documentData, documentText);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question) => {
    setInputMessage(question);
    // Auto-send the suggested question
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const getFallbackResponse = (question) => {
    const questionLower = question.toLowerCase();
    
    // Extract actual content from document text for more dynamic responses
    const docText = documentText || '';
    const hasPaymentTerms = docText.toLowerCase().includes('payment') || docText.toLowerCase().includes('amount') || docText.toLowerCase().includes('price');
    const hasTermination = docText.toLowerCase().includes('termination') || docText.toLowerCase().includes('end') || docText.toLowerCase().includes('expire');
    const hasRisks = docText.toLowerCase().includes('risk') || docText.toLowerCase().includes('liability') || docText.toLowerCase().includes('penalty');
    
    const responses = {
      'key terms': `Based on the document analysis, here are the key terms:\n• Document Type: ${documentData?.documentType || 'Unknown'}\n• Owner: ${documentData?.owner || 'Unknown'}\n• Survey Number: ${documentData?.surveyNumber || 'Unknown'}\n• Area: ${documentData?.area || 'Unknown'}\n• Location: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`,
      'payment': hasPaymentTerms ? 'The document contains payment terms that should be reviewed carefully. Please check the specific amounts, schedules, and conditions mentioned in the document.' : 'Payment terms are not clearly defined in this document. This is an important area that needs attention and clarification.',
      'termination': hasTermination ? 'The document includes termination conditions that should be carefully reviewed. Please examine the specific terms and notice periods mentioned.' : 'Termination conditions are not clearly defined in this document. This is a critical area that requires clarification.',
      'risks': hasRisks ? 'The document mentions several risk factors and liability considerations. Please review these carefully to understand your obligations and protections.' : 'Risk factors and liability terms are not clearly outlined in this document. This is an important area that needs attention.',
      'obligations': 'The document outlines various obligations for both parties. Key obligations include proper documentation, timely payments, and compliance with local regulations.',
      'survey': `The survey number mentioned in this document is: ${documentData?.surveyNumber || 'Not specified'}`,
      'area': `The land area covered in this document is: ${documentData?.area || 'Not specified'}`,
      'owner': `The owner mentioned in this document is: ${documentData?.owner || 'Not specified'}`,
      'location': `The property is located in: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`,
      'property': `Based on the document, this property is located at ${documentData?.surveyNumber || 'the specified survey number'} covering ${documentData?.area || 'the specified area'} in ${documentData?.district || 'the district'}.`,
      'description': `The document describes a ${documentData?.documentType || 'property'} with the following details: Survey Number: ${documentData?.surveyNumber || 'Not specified'}, Area: ${documentData?.area || 'Not specified'}, Owner: ${documentData?.owner || 'Not specified'}.`
    };

    for (const [key, response] of Object.entries(responses)) {
      if (questionLower.includes(key)) {
        return response;
      }
    }

    // More dynamic response based on actual document content
    if (docText.length > 100) {
      const firstSentence = docText.split(/[.!?]/)[0];
      return `Based on the document analysis, I can see this is a ${documentData?.documentType || 'document'} for ${documentData?.owner || 'the owner'}. The document begins with: "${firstSentence}..." The property is located at ${documentData?.surveyNumber || 'the specified survey number'} covering ${documentData?.area || 'the specified area'} in ${documentData?.district || 'the district'}. Please ask me specific questions about terms, risks, or obligations for more detailed information.`;
    }

    return `Based on the document analysis, I can see this is a ${documentData?.documentType || 'document'} for ${documentData?.owner || 'the owner'}. The property is located at ${documentData?.surveyNumber || 'the specified survey number'} covering ${documentData?.area || 'the specified area'} in ${documentData?.district || 'the district'}. Please ask me specific questions about terms, risks, or obligations for more detailed information.`;
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:shadow-4xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center animate-float"
          aria-label="Open AI Document Assistant"
        >
          {/* ASK Text */}
          <span className="text-white font-bold text-sm tracking-wide relative z-10">ASK</span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
          
          {/* Icon Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* Enhanced Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-glow"></div>
          
          {/* Notification Dot */}
          {messages.length > 1 && !isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
          )}
        </button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-lg">AI Document Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedQuestions[getDocumentType()].slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  {question.length > 30 ? question.substring(0, 30) + '...' : question}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about this document..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentChatbot;

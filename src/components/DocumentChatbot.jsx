import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaLightbulb, FaSpinner } from 'react-icons/fa';
import huggingFaceService from '../utils/huggingFaceService';

const DocumentChatbot = ({ documentData, documentText }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = {
    'land ownership contract': [
      'What are the key terms of this contract?',
      'What are the payment terms?',
      'What are the termination conditions?',
      'What are the main risks?'
    ],
    'patta': [
      'What is the survey number?',
      'What is the land area?',
      'Who is the owner?',
      'What are the boundaries?'
    ],
    'default': [
      'What are the main points?',
      'What are the key terms?',
      'What are the risks?',
      'What are the obligations?'
    ]
  };

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello! I'm your document assistant. I can help you understand the ${documentData?.documentType || 'document'} you've uploaded. Ask me anything about the content, terms, or any concerns you might have.`,
        timestamp: new Date()
      }
    ]);
  }, [documentData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSuggestedQuestions = () => {
    const docType = documentData?.documentType?.toLowerCase() || 'default';
    return suggestedQuestions[docType] || suggestedQuestions.default;
  };

  const generateResponse = async (question) => {
    try {
      // Try to use Hugging Face service first
      if (huggingFaceService.isAvailable()) {
        return await huggingFaceService.generateResponse(question, documentData, documentText);
      } else {
        // Fallback to rule-based responses
        return getFallbackResponse(question);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return getFallbackResponse(question);
    }
  };

  const getFallbackResponse = (question) => {
    const questionLower = question.toLowerCase();
    
    const responses = {
      'key terms': `Based on the document analysis, here are the key terms:\n• Document Type: ${documentData?.documentType || 'Unknown'}\n• Owner: ${documentData?.owner || 'Unknown'}\n• Survey Number: ${documentData?.surveyNumber || 'Unknown'}\n• Area: ${documentData?.area || 'Unknown'}\n• Location: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`,
      'payment': 'The payment terms in this document need to be reviewed carefully. Based on the analysis, payment schedule details may be missing or unclear.',
      'termination': 'Termination conditions should be clearly defined. The current document may have ambiguous termination clauses that need attention.',
      'risks': 'Potential risks identified include unclear payment terms, ambiguous termination conditions, and missing dispute resolution procedures.',
      'obligations': 'The document outlines various obligations for both parties. Key obligations include proper documentation, timely payments, and compliance with local regulations.',
      'survey': `The survey number mentioned in this document is: ${documentData?.surveyNumber || 'Not specified'}`,
      'area': `The land area covered in this document is: ${documentData?.area || 'Not specified'}`,
      'owner': `The owner mentioned in this document is: ${documentData?.owner || 'Not specified'}`,
      'location': `The property is located in: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`
    };

    for (const [key, response] of Object.entries(responses)) {
      if (questionLower.includes(key)) {
        return response;
      }
    }

    return `Based on the document analysis, I can see this is a ${documentData?.documentType || 'document'} for ${documentData?.owner || 'the owner'}. The property is located at ${documentData?.surveyNumber || 'the specified survey number'} covering ${documentData?.area || 'the specified area'} in ${documentData?.district || 'the district'}. Please ask me specific questions about terms, risks, or obligations for more detailed information.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(async () => {
      const botResponse = await generateResponse(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-96 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center">
          <FaRobot className="mr-2" />
          <h3 className="font-semibold">Document Assistant</h3>
        </div>
        <p className="text-sm text-primary-100 mt-1">
          Ask me anything about your {documentData?.documentType || 'document'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start">
                {message.type === 'bot' && (
                  <FaRobot className="mr-2 mt-1 text-primary-600 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <FaUser className="mr-2 mt-1 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <FaSpinner className="mr-2 animate-spin text-primary-600" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-2">
          <FaLightbulb className="text-yellow-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {getSuggestedQuestions().slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              disabled={isLoading}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your document..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentChatbot;

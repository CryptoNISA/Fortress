
import * as React from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AssistantContextType {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AssistantContext = React.createContext<AssistantContextType | undefined>(undefined);

// A simple in-memory history store for the demo.
// In a real app, you might persist this.
let chatHistory: Message[] = [];

export const AssistantProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = React.useState<Message[]>(chatHistory);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const chatRef = React.useRef<Chat | null>(null);

  React.useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a friendly and knowledgeable AI assistant for the Fortress Investment Group trading app. You specialize in cryptocurrency trading. You can explain complex topics, analyze market trends, and provide insights. You must never give direct financial advice. Always include a disclaimer at the end of your responses that you are an AI and your information should not be considered financial advice and users should do their own research.',
        },
        // Load previous history if it exists
        history: chatHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });
    } catch (e) {
      console.error("Failed to initialize Gemini AI:", e);
      setError("Failed to initialize AI Assistant. Please check your API key.");
    }
  }, []);

  const sendMessage = async (message: string) => {
    if (!chatRef.current) {
      setError("AI Assistant is not initialized.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    chatHistory.push(userMessage);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message });
      
      let fullResponse = '';
      let firstChunk = true;
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        if (firstChunk) {
            // Add the model's message placeholder on the first chunk
            setMessages(prev => [...prev, { role: 'model', text: fullResponse }]);
            firstChunk = false;
        } else {
            // Update the last message (the model's response)
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = fullResponse;
                return newMessages;
            });
        }
      }
      
      // Update the final history state once the stream is complete
      if (!firstChunk) { // check if model responded at all
        chatHistory.push({ role: 'model', text: fullResponse });
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Error sending message:", e);
      setError(`Error: ${errorMessage}`);
      const errorResponseMessage: Message = { role: 'model', text: `Sorry, I encountered an error. ${errorMessage}` };
      setMessages(prev => [...prev, errorResponseMessage]);
      chatHistory.push(errorResponseMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = { messages, sendMessage, isLoading, error };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = React.useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

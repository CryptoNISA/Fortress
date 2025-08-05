
import * as React from 'react';
import { useAssistant } from '../contexts/AssistantContext.tsx';
import { ArrowLeft, Send, Bot, User, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatMessage = ({ message }: { message: { role: 'user' | 'model', text: string } }) => {
    const isModel = message.role === 'model';
    const messageContainerClass = isModel
        ? 'flex items-start gap-3'
        : 'flex items-start gap-3 flex-row-reverse';
    const messageBubbleClass = isModel
        ? 'bg-secondary text-secondary-foreground rounded-r-xl rounded-bl-xl'
        : 'bg-primary text-primary-foreground rounded-l-xl rounded-br-xl';
    
    // A simple markdown-to-html converter
    const formatText = (text: string) => {
        // Replace **text** with <strong>text</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace *text* with <em>text</em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Replace newlines with <br>
        text = text.replace(/\n/g, '<br />');
        return text;
    };

    return (
        <div className={messageContainerClass}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-secondary' : 'bg-primary'}`}>
                {isModel ? <Bot size={20} className="text-secondary-foreground" /> : <User size={20} className="text-primary-foreground" />}
            </div>
            <div className={`p-4 max-w-lg ${messageBubbleClass}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
            </div>
        </div>
    );
};


const AssistantScreen = () => {
    const navigate = useNavigate();
    const { messages, sendMessage, isLoading, error } = useAssistant();
    const [input, setInput] = React.useState('');
    const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground animate-fade-in">
            <header className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">AI Assistant</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && !isLoading && (
                     <div className="text-center text-muted-foreground p-8">
                        <Bot size={48} className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Welcome to the AI Assistant!</h2>
                        <p className="mt-2">Ask me anything about crypto, trading strategies, or market analysis.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-start gap-3">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                            <Bot size={20} className="text-secondary-foreground" />
                        </div>
                        <div className="p-4 bg-secondary text-secondary-foreground rounded-r-xl rounded-bl-xl">
                            <Loader size={20} className="animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-border bg-background">
                {error && (
                    <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about crypto..."
                        className="flex-1 w-full bg-secondary border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary text-primary-foreground rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {isLoading ? <Loader size={24} className="animate-spin" /> : <Send size={24} />}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default AssistantScreen;

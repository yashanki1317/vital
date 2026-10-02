import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareText, Send, Sparkles, User, Bot, Plus, Trash2, Edit2, Check, ShieldAlert } from 'lucide-react';
import type { AIChatMessageItem, ChatConversationItem } from '../types';
import { api } from '../services/api';

export const AskAIView: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversationItem[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AIChatMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    "How has my sleep changed this month?",
    "Why has my energy been lower recently?",
    "What is my average resting heart rate?",
    "How has my stress changed over the last 30 days?",
    "Show me the relationship between my sleep and energy.",
    "What are my most consistent habits?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations || []);
      if (res.conversations && res.conversations.length > 0 && !currentConvId) {
        selectConversation(res.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat conversations', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectConversation = async (convId: number) => {
    setCurrentConvId(convId);
    setLoading(true);
    try {
      const res = await api.getConversationMessages(convId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Error fetching conversation messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConvId(null);
    setMessages([]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsgText = text.trim();
    const tempUserMsg: AIChatMessageItem = {
      id: Date.now(),
      conversation_id: currentConvId || undefined,
      role: 'user',
      message: userMsgText,
      content: userMsgText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userMsgText, currentConvId || undefined);
      setMessages(prev => [...prev, res.reply]);
      if (res.conversation) {
        setCurrentConvId(res.conversation.id);
        loadConversations();
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        message: err.message || "Sorry, I had trouble processing your question right now. Please try again.",
        content: err.message || "Sorry, I had trouble processing your question right now.",
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await api.deleteConversation(convId);
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (currentConvId === convId) {
        if (updated.length > 0) {
          selectConversation(updated[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {
      alert("Failed to delete conversation.");
    }
  };

  const handleRenameConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!renameTitle.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await api.renameConversation(convId, renameTitle.trim());
      setRenamingId(null);
      loadConversations();
    } catch (err) {
      alert("Failed to rename conversation.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] gap-4 animate-fade-in">
      
      {/* Conversations Sidebar */}
      <div className="w-full md:w-64 glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-48 md:h-full flex-shrink-0">
        <button
          onClick={handleNewConversation}
          className="w-full py-2.5 px-4 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft flex items-center justify-center space-x-2 transition-all mb-3"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
          Recent Discussions
        </h3>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-2 py-3">No past conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between group cursor-pointer transition-all ${
                  currentConvId === c.id
                    ? 'bg-vital-50 dark:bg-vital-950/80 text-vital-700 dark:text-vital-300 font-bold border border-vital-200 dark:border-vital-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {renamingId === c.id ? (
                  <div className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-vital-500"
                      autoFocus
                    />
                    <button onClick={(e) => handleRenameConversation(c.id, e)} className="p-1 text-vital-600">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate pr-2">{c.title}</span>
                    <div className="hidden group-hover:flex items-center space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingId(c.id); setRenameTitle(c.title); }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(c.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-card p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
        
        {/* Title Header */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5 text-vital-500" />
              <span>VITAL AI — Ask Your Data</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversational analysis grounded strictly in your personal historical database logs.
            </p>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-vital-100 dark:bg-vital-950 text-vital-600 dark:text-vital-400 flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask VITAL AI anything about your logs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                VITAL AI analyzes your self-logged sleep, resting heart rate, blood pressure, mood, energy, and symptoms.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const msgText = m.message || m.content || '';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-3 ${
                    m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm ${
                    m.role === 'user'
                      ? 'bg-slate-800 dark:bg-slate-200 text-slate-100 dark:text-slate-900'
                      : 'bg-vital-600'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-vital-600 text-white rounded-tr-none'
                      : 'glass-card border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msgText}</p>
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-vital-600 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl text-xs text-slate-400">
                Analyzing your logged database context...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap hover:bg-vital-100 dark:hover:bg-vital-950 hover:text-vital-700 dark:hover:text-vital-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
            >
              "{chip}"
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your sleep, energy, stress, or vitals..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-vital-500 shadow-soft dark:text-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="absolute right-2 p-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Medical Disclaimer */}
          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 mt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>VITAL provides health tracking and informational insights. It does not replace professional medical advice.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

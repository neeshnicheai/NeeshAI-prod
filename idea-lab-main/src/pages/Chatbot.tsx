import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Send,
  Settings,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";
import { NeeshLogo } from "@/components/NeeshLogo";
import { supabase } from "@/integrations/supabase/client";
import chatbotAvatar from "@/assets/chatbot-avatar.png";

import { useFAQs, type FAQ } from "@/hooks/useFAQs";
import {
  useApiKeys,
  validateApiKeyFormat,
  getProviderDisplayName,
  PROVIDER_CATEGORIES,
  type LlmProvider,
} from "@/hooks/useApiKeys";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const Chatbot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { faqs, loading: faqsLoading, createFAQ, updateFAQ, deleteFAQ: removeFAQ } = useFAQs(id);
  const {
    savedProviders,
    loading: apiKeysLoading,
    saving: apiKeySaving,
    error: apiKeyError,
    saveApiKey: saveApiKeyToBackend,
    deleteApiKey: deleteApiKeyFromBackend,
  } = useApiKeys();

  console.log(`[Chatbot] Component mounted/updated with project ID: ${id}`);
  console.log(`[Chatbot] FAQs loading: ${faqsLoading}, FAQ count: ${faqs.length}`);

  const [activeTab, setActiveTab] = useState<"chat" | "faq" | "settings">("chat");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingAnswer, setEditingAnswer] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bot",
      content: "Hello! I'm your AI assistant. How can I help you today? I've been trained on your project's knowledge base and can answer questions about it.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Chatbot settings
  const [botName, setBotName] = useState("Health Blog Assistant");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! I'm your AI assistant. How can I help you today? I've been trained on your project's knowledge base and can answer questions about it.");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");

  // API Key settings
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider>("OPENROUTER");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValidationError, setApiKeyValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validate API key format when input or provider changes
  useEffect(() => {
    if (apiKeyInput.trim()) {
      const error = validateApiKeyFormat(selectedProvider, apiKeyInput);
      setApiKeyValidationError(error);
    } else {
      setApiKeyValidationError(null);
    }
  }, [apiKeyInput, selectedProvider]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSaveApiKey = async () => {
    const error = validateApiKeyFormat(selectedProvider, apiKeyInput);
    if (error) {
      setApiKeyValidationError(error);
      return;
    }

    const success = await saveApiKeyToBackend(selectedProvider, apiKeyInput.trim());
    if (success) {
      setApiKeyInput("");
      setShowApiKey(false);
      setSaveSuccess(true);
    }
  };

  const handleDeleteApiKey = async (provider: LlmProvider) => {
    if (confirm(`Are you sure you want to remove the ${getProviderDisplayName(provider)} API key?`)) {
      await deleteApiKeyFromBackend(provider);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) {
      console.warn('[Chatbot] Cannot send message - empty input or already loading');
      return;
    }

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    console.group(`[Chatbot] 💬 Sending message to project ${id}`);
    console.log('  User message:', userMessage.content);
    console.log('  Message ID:', userMessage.id);
    console.log('  Timestamp:', userMessage.timestamp.toISOString());

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log('  🚀 API call starting...');
      const response = await apiClient.post<any>(`/api/projects/${id}/chat`, {
        query: userMessage.content,
      });

      console.log('  ✅ Response received from API');
      console.log('  Response data:', response);
      console.log('  Answer:', response?.answer);
      console.log('  Confidence:', response?.confidence);

      const botMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: "bot",
        content: response?.answer || "I couldn't generate a response.",
        timestamp: new Date(),
      };

      console.log('  Bot reply:', botMessage.content.substring(0, 100) + (botMessage.content.length > 100 ? '...' : ''));
      console.groupEnd();

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.group('[Chatbot] ❌ Chat error');
      console.error('  Error object:', err);
      console.error('  Error message:', err?.message);
      console.error('  Error status:', err?.status);
      console.groupEnd();

      // Show provider-specific error messages in the chat
      const errorContent = err?.message?.includes('API key') ||
        err?.message?.includes('rate limit') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('not configured')
        ? `⚠️ ${err.message}`
        : "I'm sorry, something went wrong. Please try again.";

      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: "bot",
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqClick = (faq: FAQ) => {
    setInputMessage(faq.question);
  };

  const startEditingFaq = (faq: FAQ) => {
    setEditingFaqId(faq.id);
    setEditingQuestion(faq.question);
    setEditingAnswer(faq.answer);
  };

  const saveFaqEdit = async () => {
    if (editingFaqId && editingQuestion.trim() && editingAnswer.trim()) {
      await updateFAQ(editingFaqId, {
        question: editingQuestion.trim(),
        answer: editingAnswer.trim(),
      });
      setEditingFaqId(null);
      setEditingQuestion("");
      setEditingAnswer("");
    }
  };

  const cancelEdit = () => {
    setEditingFaqId(null);
    setEditingQuestion("");
    setEditingAnswer("");
  };

  const deleteFaq = async (faqId: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      await removeFAQ(faqId);
    }
  };

  const addNewFaq = async () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      await createFAQ({
        question: newFaqQuestion.trim(),
        answer: newFaqAnswer.trim(),
      });
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setShowAddFaq(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        role: "bot",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  };

  const hasConfiguredKey = savedProviders.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <NeeshLogo size="sm" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display font-semibold text-lg">Chatbot Testing</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-2"
          onClick={() => navigate(`/project/${id}`)}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Project
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat Interface */}
        <div className="flex-1 flex flex-col bg-muted/20">
          {/* Chat Header */}
          <div className="p-4 bg-card border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={chatbotAvatar}
                alt="Chatbot"
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-1"
              />
              <div>
                <h2 className="font-semibold text-foreground">{botName}</h2>
                <p className="text-sm text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={resetChat}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* No API Key Banner */}
          {!apiKeysLoading && !hasConfiguredKey && (
            <div className="px-6 pt-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500">API Key Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please configure your LLM API key in the{" "}
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="text-primary underline hover:no-underline"
                    >
                      Settings tab
                    </button>{" "}
                    to start chatting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {message.role === "bot" ? (
                    <img
                      src={chatbotAvatar}
                      alt="Bot"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-0.5 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : message.isError
                        ? "bg-destructive/10 border border-destructive/30 rounded-tl-md"
                        : "bg-card border border-border/50 rounded-tl-md"
                      }`}
                  >
                    {message.role === "bot" ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>ul]:pl-4 [&>ol]:pl-4 [&>li]:mb-1">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <img
                    src={chatbotAvatar}
                    alt="Bot"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-0.5 flex-shrink-0"
                  />
                  <div className="bg-card border border-border/50 rounded-2xl rounded-tl-md p-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick FAQs */}
          <div className="p-4 bg-card border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {faqs.slice(0, 3).map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleFaqClick(faq)}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  {faq.question.length > 40 ? faq.question.slice(0, 40) + "..." : faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-card border-t border-border/50">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} className="rounded-xl px-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-96 bg-card border-l border-border/50 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border/50">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "chat"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <MessageCircle className="w-4 h-4 inline-block mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "faq"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <HelpCircle className="w-4 h-4 inline-block mr-2" />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "settings"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <ScrollArea className="flex-1">
            {activeTab === "chat" && (
              <div className="p-6 space-y-4">
                <div className="text-center py-8">
                  <img
                    src={chatbotAvatar}
                    alt="Chatbot"
                    className="w-24 h-24 mx-auto mb-4"
                  />
                  <h3 className="font-display font-semibold text-lg mb-2">Test Your Chatbot</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the chat interface to test how your chatbot responds to user queries.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium">Tips for Testing</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Try asking questions from your FAQs</li>
                    <li>• Test edge cases and unusual queries</li>
                    <li>• Check response accuracy and tone</li>
                    <li>• Verify knowledge base integration</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Frequently Asked Questions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={() => setShowAddFaq(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </Button>
                </div>

                {/* Add New FAQ Form */}
                {showAddFaq && (
                  <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-primary/30">
                    <Input
                      placeholder="Question"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer"
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-xl flex-1" onClick={addNewFaq}>
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => {
                          setShowAddFaq(false);
                          setNewFaqQuestion("");
                          setNewFaqAnswer("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* FAQ List */}
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-muted/30 rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      {editingFaqId === faq.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingQuestion}
                            onChange={(e) => setEditingQuestion(e.target.value)}
                            placeholder="Question"
                          />
                          <Textarea
                            value={editingAnswer}
                            onChange={(e) => setEditingAnswer(e.target.value)}
                            placeholder="Answer"
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-xl flex-1" onClick={saveFaqEdit}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-sm">{faq.question}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg"
                                onClick={() => startEditingFaq(faq)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                                onClick={() => deleteFaq(faq.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="p-6 space-y-6">
                {/* LLM Provider & API Key Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">LLM Provider & API Key</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Provider Dropdown */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Provider
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          setSelectedProvider(e.target.value as LlmProvider);
                          setApiKeyInput("");
                          setApiKeyValidationError(null);
                        }}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        id="llm-provider-select"
                      >
                        {PROVIDER_CATEGORIES.map((category) => (
                          <optgroup key={category.category} label={category.category}>
                            {category.providers.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* API Key Input */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        API Key
                      </label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={`Enter your ${getProviderDisplayName(selectedProvider)} API key`}
                          className={`pr-10 ${apiKeyValidationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          id="api-key-input"
                          style={{
                            // Use bullet character for password masking
                            fontFamily: showApiKey ? "inherit" : "text-security-disc, monospace",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          id="toggle-api-key-visibility"
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Validation Error */}
                      {apiKeyValidationError && (
                        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {apiKeyValidationError}
                        </p>
                      )}
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={handleSaveApiKey}
                      className="w-full rounded-xl"
                      disabled={apiKeySaving || !apiKeyInput.trim() || !!apiKeyValidationError}
                      id="save-api-key-btn"
                    >
                      {apiKeySaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Save API Key
                    </Button>

                    {/* Success Message */}
                    {saveSuccess && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        API key saved successfully!
                      </p>
                    )}

                    {/* Backend Error */}
                    {apiKeyError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {apiKeyError}
                      </p>
                    )}
                  </div>

                  {/* Saved Providers List */}
                  {savedProviders.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Configured Providers:</p>
                      {savedProviders.map((sp) => (
                        <div
                          key={sp.provider}
                          className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">{getProviderDisplayName(sp.provider)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                            onClick={() => handleDeleteApiKey(sp.provider)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50" />

                {/* Existing Chatbot Settings */}
                <div>
                  <h3 className="font-semibold mb-4">Chatbot Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Bot Name
                      </label>
                      <Input
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="Enter bot name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Welcome Message
                      </label>
                      <Textarea
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="Enter welcome message"
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Primary Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-12 rounded-xl border border-border cursor-pointer"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium mb-3">Bot Avatar</h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={chatbotAvatar}
                      alt="Bot Avatar"
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-2"
                    />
                    <div>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG (max 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-xl">
                  <Check className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

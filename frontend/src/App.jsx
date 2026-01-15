import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Upload, Send, FileText, Loader2, Bot, User } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! Upload a PDF to start chatting." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("uploading...")
      await axios.post("http://35.208.135.178/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      console.log("done")
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Successfully indexed: ${file.name}. Ask me anything about it!` },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Failed to upload/index the file. Please try again." },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://35.208.135.178/api/chat", { query: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat failed:", error);
      const errorMessage = error.response?.data?.detail || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm hidden md:flex">
        <h1 className="text-2xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
          <Bot className="w-8 h-8" /> SimpleRAG
        </h1>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Document</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors cursor-pointer relative bg-gray-50/50">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploading ? (
              <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Indexing...</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Click to upload PDF</span>
                <span className="text-xs text-gray-400 mt-1">.pdf files only</span>
              </>
            )}
          </div>
          {fileName && !uploading && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
              <FileText className="w-4 h-4" />
              <span className="truncate font-medium">{fileName}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <p className="text-xs text-gray-400 text-center">
            Powered by FastAPI & LlamaIndex
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white border-b flex items-center justify-between shadow-sm z-10">
          <h1 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
            <Bot className="w-6 h-6" /> SimpleRAG
          </h1>
          <div className="relative overflow-hidden w-8 h-8">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
                }`}>
                {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>

              <div
                className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
              >
                {msg.role === "bot" && loading && idx === messages.length - 1 ? (
                  <span className="flex items-center gap-2">Thinking <Loader2 className="w-3 h-3 animate-spin" /></span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 md:p-6 border-t border-gray-200">
          <div className="max-w-4xl mx-auto relative flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask something about your document..."
                disabled={loading}
                className="w-full pl-5 pr-14 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

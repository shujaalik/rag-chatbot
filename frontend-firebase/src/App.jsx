
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Upload, Send, FileText, Loader2, Bot, User, Zap, Terminal } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "System Online. Upload data stream for analysis." },
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
      // Pointing to the Secure Custom Domain
      await axios.post("https://rag-chatbot-temp.shujaalik.com/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Data acknowledged: ${file.name}. Ready for queries.` },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "ERROR: Upload sequence failed." },
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
      const response = await axios.post("https://rag-chatbot-temp.shujaalik.com/api/chat", { query: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "ERROR: Connection interrupted." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-cyan-400 font-mono overflow-hidden selection:bg-cyan-900 selection:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, .3) 25%, rgba(0, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .3) 75%, rgba(0, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, .3) 25%, rgba(0, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .3) 75%, rgba(0, 255, 255, .3) 76%, transparent 77%, transparent)", backgroundSize: "50px 50px" }}></div>

      {/* Sidebar */}
      <div className="w-80 bg-black/80 border-r border-cyan-900/50 p-6 flex flex-col backdrop-blur-md z-10 hidden md:flex">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-cyan-400" /> NEXUS_RAG
        </h1>

        <div className="mb-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black border border-cyan-900 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-900 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
                <span className="text-xs tracking-widest uppercase">Initializing...</span>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-cyan-600 mb-3 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm font-bold tracking-widest uppercase">Inject Data</span>
                <span className="text-[10px] text-cyan-700 mt-1">.PDF FORMAT REQ</span>
              </>
            )}
          </div>
        </div>

        {fileName && !uploading && (
          <div className="flex items-center gap-3 p-3 border border-cyan-900/50 bg-cyan-950/30 rounded-lg text-xs tracking-wide">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="truncate">{fileName}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto"></div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 text-[10px] text-cyan-800 uppercase tracking-widest border-t border-cyan-900/30 pt-4">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            System Status: Online
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-black">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-12 h-12 rounded-none border border-cyan-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm ${msg.role === "user" ? "bg-blue-900/20 text-blue-400" : "bg-cyan-900/20 text-cyan-400"
                }`}>
                {msg.role === "user" ? <User className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>

              <div className={`max-w-[85%] md:max-w-[70%] p-6 border ${msg.role === "user"
                ? "border-blue-500/30 bg-blue-950/10 text-blue-100 rounded-bl-xl"
                : "border-cyan-500/30 bg-cyan-950/10 text-cyan-100 rounded-br-xl"
                }`}>
                {msg.role === "bot" && loading && idx === messages.length - 1 ? (
                  <span className="flex items-center gap-2 text-xs uppercase tracking-widest animate-pulse">Processing <span className="text-cyan-500">...</span></span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-black/90 border-t border-cyan-900/50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto relative flex items-center gap-4">
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-none opacity-20 group-hover:opacity-50 transition duration-500 blur-sm"></div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="ENTER COMMAND..."
                disabled={loading}
                className="relative w-full pl-6 pr-16 py-4 bg-black border border-cyan-900/50 text-cyan-100 placeholder-cyan-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-white text-cyan-500 disabled:opacity-20 transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

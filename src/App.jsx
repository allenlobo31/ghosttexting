import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function App() {
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [status, setStatus] = useState('Ready');
  
  const textAreaRef = useRef(null);
  const ghostRef = useRef(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (text.trim().length < 5) {
        setSuggestion('');
        return;
      }

      try {
        setStatus('Generating...');
        const prompt = `Task: Autocomplete. 
        Context: "${text}"
        Instruction: Provide ONLY the next 5 to 10 words to continue the sentence.
        use Internet search results fill the next words.
        let the AI provide only information relevat to the Engineering, Technological, Scientific and IT fields.
        give information about latest technologies and trends.
        Do not repeat the context. No punctuation at the start.
        You must use proper grammar and punctuation.
        Start and end with emojis
        You must use capitalization where necessary.
        End the sentence naturally.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generated = response.text().trim();
        
        const cleanSuggestion = generated.replace(/["']/g, "");
        setSuggestion(cleanSuggestion);
        setStatus('Ready');
      } catch (err) {
        console.error("AI Error:", err);
        setStatus('API Error - Check Console');
      }
    };

    const timeoutId = setTimeout(fetchPrediction, 700);
    return () => clearTimeout(timeoutId);
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      const needsSpace = text.length > 0 && !text.endsWith(' ');
      setText(prev => prev + (needsSpace ? ' ' : '') + suggestion);
      setSuggestion('');
    }
  };

  const syncLayers = () => {
    if (ghostRef.current && textAreaRef.current) {
      ghostRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#050505] overflow-hidden relative font-mono selection:bg-blue-500/30">
      
      <div className="absolute top-4 right-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 z-50">
        {status} • <span className="text-blue-500">Tab to accept</span>
      </div>

      <div 
        ref={ghostRef}
        className="absolute inset-0 p-12 text-2xl leading-[1.6] whitespace-pre-wrap break-words pointer-events-none"
        style={{ zIndex: 1, fontFamily: 'monospace' }}
      >
        <span className="text-transparent">{text}</span>
        <span className="text-slate-700"> {suggestion}</span>
      </div>

      <textarea
        ref={textAreaRef}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncLayers}
        spellCheck="false"
        placeholder="Start typing..."
        className="absolute inset-0 w-full h-full p-12 text-2xl leading-[1.6] bg-transparent text-slate-200 outline-none resize-none caret-blue-500"
        style={{ zIndex: 2, border: 'none', fontFamily: 'monospace' }}
      />
    </div>
  );
}
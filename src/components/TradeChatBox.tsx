/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CambagStore } from '../store';
import { TradeChatMessage, UniversityAccount } from '../types';
import { Send, Sparkles, MessageSquare, Clock } from 'lucide-react';

interface TradeChatBoxProps {
  offerId: string;
  currentUser: UniversityAccount;
  otherPartyName: string;
  otherPartyDept: string;
}

export default function TradeChatBox({ offerId, currentUser, otherPartyName, otherPartyDept }: TradeChatBoxProps) {
  const [messages, setMessages] = useState<TradeChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    const allChats = CambagStore.getChats();
    const filtered = allChats.filter(c => c.offerId === offerId);
    setMessages(filtered);
  };

  useEffect(() => {
    loadMessages();
    window.addEventListener('cambag_state_change', loadMessages);
    return () => window.removeEventListener('cambag_state_change', loadMessages);
  }, [offerId]);

  // Scroll to bottom when messsages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    await CambagStore.sendChatMessage(offerId, text);
    setInputText('');
    loadMessages();
  };

  const SUGGESTED_TEMPLATES = [
    '중앙도서관 앞에서 뵐까요?',
    '학생회관 1층 편의점 앞입니다!',
    '도착했습니다! 검은색 백팩 매고 있어요.',
    '학우님, 혹시 10분 정도 늦을 것 같습니다 😭',
    '물건 꼼꼼히 챙겨왔습니다!'
  ];

  return (
    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col overflow-hidden shadow-xs mt-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="font-bold text-slate-800 text-xs">
              {otherPartyName} 학우님 <span className="font-normal text-slate-400">({otherPartyDept})</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>캠백 안심 직거래 톡</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 flex flex-col">
        {messages.length === 0 ? (
          <div className="my-auto text-center space-y-2 py-4">
            <span className="inline-flex p-2 bg-indigo-50 text-indigo-600 rounded-full">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              거래 메세지를 시작해 보세요!<br />
              전화 통화 없이 실시간 타임라인으로 대화할 수 있습니다.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Sender Name if not me */}
                {!isMe && (
                  <span className="text-[9px] text-slate-400 font-semibold mb-0.5 ml-1">
                    {msg.senderName}
                  </span>
                )}
                
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-normal shadow-2xs whitespace-pre-line ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-850 rounded-tl-none border border-slate-100'
                  }`}
                >
                  {msg.message}
                </div>
                
                <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5 text-slate-300" />
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended Quick templates */}
      <div className="px-3 py-2 bg-slate-100 border-t border-slate-200/60 overflow-x-auto flex gap-1.5 scrollbar-thin">
        {SUGGESTED_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(tmpl)}
            className="shrink-0 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 transition-colors text-[10px] text-slate-600 py-1 px-2.5 rounded-full font-medium shadow-3xs cursor-pointer"
          >
            {tmpl}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-2.5 bg-white border-t border-slate-200 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="공강 시간에 만날 정확한 장소를 학우님과 조율하세요..."
          className="flex-1 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-350 text-xs py-2 px-3 rounded-xl outline-hidden font-normal"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

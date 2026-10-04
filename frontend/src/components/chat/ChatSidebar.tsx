/**
 * ASTROWORLD AI V2 — Chat Sidebar Component
 * Left navigation panel with New Consultation, thread history, memory inspector,
 * and birth chart settings.
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Brain,
  Compass,
  ChevronRight,
  X,
  Settings,
} from 'lucide-react';
import { ConversationSummary } from '../../services/aiV2ApiClient.ts';
import { BirthProfile } from '../../engine/types.ts';

interface ChatSidebarProps {
  conversations: ConversationSummary[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenMemoryModal: () => void;
  onOpenProfileModal: () => void;
  memoryCount: number;
  birthProfile: BirthProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenMemoryModal,
  onOpenProfileModal,
  memoryCount,
  birthProfile,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-50 border-r border-slate-200/90 text-slate-800 select-none">
      {/* Top Header & Actions */}
      <div className="p-3.5 space-y-3">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between lg:hidden mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
            Consultations
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Consultation Button */}
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#162058] hover:bg-[#1f2c7a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>New Consultation</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono opacity-80 group-hover:opacity-100">
            Ctrl+N
          </span>
        </button>

        {/* Search Conversations */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search consultations..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#162058] transition-colors"
          />
        </div>
      </div>

      {/* Middle Thread History Stream */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
        <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          Recent Consultations
        </div>

        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-600">
            {searchQuery ? 'No matching consultations found' : 'No previous consultations yet'}
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isActive = conv.conversationId === activeConversationId;
            return (
              <div
                key={conv.conversationId}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#162058] font-medium shadow-sm border border-slate-200/80'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
                onClick={() => {
                  onSelectConversation(conv.conversationId);
                  onCloseMobile();
                }}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    size={14}
                    className={`mt-0.5 shrink-0 ${isActive ? 'text-[#162058]' : 'text-slate-400'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans font-medium text-slate-900">
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                      <span className="capitalize">{conv.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span>{conv.turnCount} turns</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  title="Delete conversation"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteConversation(conv.conversationId);
                  }}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-1 cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Controls: Memory & Birth Chart */}
      <div className="p-3 border-t border-slate-200/90 bg-white/70 space-y-1.5">
        {/* Memory Inspector Button */}
        <button
          type="button"
          onClick={() => {
            onOpenMemoryModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-sans"
        >
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-amber-700" />
            <span className="font-medium">What AstroWorld Remembers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-600 font-mono">
              {memoryCount} facts
            </span>
            <ChevronRight size={13} className="text-slate-400" />
          </div>
        </button>

        {/* Active Birth Profile Summary */}
        <button
          type="button"
          onClick={() => {
            onOpenProfileModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-sans border border-slate-100"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Compass size={15} className="text-[#162058] shrink-0" />
            <div className="text-left min-w-0">
              <p className="truncate font-medium text-slate-900">{birthProfile.name}</p>
              <p className="truncate text-[10px] text-slate-600">
                {birthProfile.day}/{birthProfile.month}/{birthProfile.year} · {birthProfile.timezone || 'UTC'}
              </p>
            </div>
          </div>
          <Settings size={13} className="text-slate-400 shrink-0 ml-1" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

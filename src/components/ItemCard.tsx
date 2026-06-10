/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Listing } from '../types';
import { BookOpen, HelpCircle, AlertCircle, FileText, CheckCircle, RefreshCcw, Tag, Coins } from 'lucide-react';

interface ItemCardProps {
  key?: string | number;
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

export default function ItemCard({ listing, onSelect }: ItemCardProps) {
  // Format price
  const formattedPrice = listing.price.toLocaleString('ko-KR');

  // Condition icons getter
  const getHighlightingInfo = (val: string) => {
    switch (val) {
      case 'none':
        return { label: '필기 없음', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'light':
        return { label: '가벼운 필기', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'heavy':
        return { label: '필기 흔적 많은 편', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      default:
        return { label: '일반', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getBindingInfo = (val: string) => {
    switch (val) {
      case 'original':
        return { label: '정품 도서', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'spring':
        return { label: '스프링 제본', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'photocopy':
        return { label: '흑백 제본북', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: '일반 제본', color: 'bg-slate-50 text-slate-700' };
    }
  };

  const getMissingInfo = (val: string) => {
    switch (val) {
      case 'none':
        return { label: '구성물 완비', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'some':
        return { label: '일부 구성물 유실', color: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return { label: '정상', color: 'bg-slate-50 text-slate-700' };
    }
  };

  const highlight = getHighlightingInfo(listing.condition.highlighting);
  const binding = getBindingInfo(listing.condition.binding);
  const missing = getMissingInfo(listing.condition.missingParts);

  return (
    <div
      onClick={() => onSelect(listing)}
      id={`item-card-${listing.id}`}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-300 cursor-pointer transition-all duration-300 flex flex-col group h-full"
    >
      {/* Visual Header / Thumbnail Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={listing.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Absolute type badge (Sell/Rent) */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm text-white ${
            listing.type === 'sell' ? 'bg-amber-500 text-amber-950' : 'bg-emerald-500 text-white'
          }`}>
            {listing.type === 'sell' ? '도서 판매' : '수업 대여'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm bg-slate-900/80 backdrop-blur-xs text-white">
            {listing.category === 'textbook' ? '전공도서' : listing.category === 'supply' ? '준비물/교구' : '패키지'}
          </span>
        </div>

        {/* Verification Checkmark badge showing seller trust */}
        {listing.sellerVerified && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
            <CheckCircle className="w-3 h-3 fill-emerald-100 text-emerald-600" />
            <span>학번인증완료</span>
          </div>
        )}

        {/* Status cover for completed / match-making status */}
        {listing.status === 'completed' && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center backdrop-blur-xs">
            <span className="border-2 border-white text-white font-extrabold px-5 py-2 rounded-lg rotate-12 uppercase tracking-wider text-sm">
              거래 완료 👍
            </span>
          </div>
        )}
        {listing.status === 'matching' && (
          <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center backdrop-blur-xs">
            <span className="border border-indigo-200 bg-indigo-950/80 text-indigo-200 font-extrabold px-4 py-1.5 rounded-full text-xs tracking-wider">
              매칭 검토 중 ⏳
            </span>
          </div>
        )}
      </div>

      {/* Card Content details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Subject name (과목명), Instructor (교수) */}
          <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mb-1.5 text-xs font-medium text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 max-w-[130px] truncate" title={listing.courseName}>
              📚 {listing.courseName}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 truncate max-w-[100px]">{listing.professor}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 mb-2" title={listing.title}>
            {listing.title}
          </h3>

          {/* Status certification tags (상태 인증제) - Transparent Visual Badges! */}
          <div className="flex flex-wrap gap-1 mb-4">
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${highlight.color}`}>
              ✏️ {highlight.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${binding.color}`}>
              📖 {binding.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${missing.color}`}>
              📦 {missing.label}
            </span>
          </div>
        </div>

        {/* Lower row: price and student department details */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-slate-900">{formattedPrice}</span>
            <span className="text-xs text-slate-500">원 {listing.type === 'rent' ? '/학기' : ''}</span>
          </div>

          <div className="text-[11px] text-slate-400 text-right">
            <div className="font-medium text-slate-600 truncate max-w-[100px]">{listing.sellerName}</div>
            <div className="truncate max-w-[100px]">{listing.sellerDept.split(' ')[0]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

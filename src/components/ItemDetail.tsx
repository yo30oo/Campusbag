/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import { CambagStore } from '../store';
import { BookOpen, Check, ShieldCheck, MapPin, BadgePercent, MessageSquare, PhoneCall, ArrowLeft, Layers, ShoppingBag, Info } from 'lucide-react';

interface ItemDetailProps {
  listing: Listing;
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
  onRequestTrade: (listing: Listing) => void;
}

export default function ItemDetail({ listing, onBack, onSelectListing, onRequestTrade }: ItemDetailProps) {
  const [relatedSupplies, setRelatedSupplies] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState(CambagStore.getCurrentUser());

  useEffect(() => {
    // Look up associated supplies for the course matching system
    const allListings = CambagStore.getListings();
    
    // Find listings that are in the same course, but are supplies, or listed in listing.relatedSupplyIds
    const matched = allListings.filter(l => {
      if (l.id === listing.id) return false;
      
      // Explicit ID mapping OR course name correlation
      const isRelatedId = listing.relatedSupplyIds?.includes(l.id);
      const isSameCourseSupply = l.category === 'supply' && l.courseName.trim().toLowerCase() === listing.courseName.trim().toLowerCase();
      
      return (isRelatedId || isSameCourseSupply) && l.status === 'available';
    });

    setRelatedSupplies(matched);
  }, [listing]);

  // Handle pricing presentation
  const formattedPrice = listing.price.toLocaleString('ko-KR');

  // Condition mapping
  const highlightLabels = {
    none: { title: '필기 없음', desc: '낙서 및 밑줄이 전혀 없는 새 책 상태', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    light: { title: '가벼운 필기', desc: '일부 서술 연필 낙서 또는 가벼운 형광펜 밑줄', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    heavy: { title: '필기 흔적 많은 편', desc: '강의 보충 필기, 중요 표시, 사용감 다수 포함', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  };

  const bindingLabels = {
    original: { title: '출판사 정품 도서', desc: '제본이 아닌 오리지널 종이 인쇄 형태', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    spring: { title: '스프링 분철 도서', desc: '공부 시 필기가 용이한 나선형 스프링 스프릿 분철', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    photocopy: { title: '인쇄 제본본', desc: '수업 보조 교재 혹은 복사 가공 제본 제본본', color: 'text-slate-700 bg-slate-100 border-slate-300' },
  };

  const missingLabels = {
    none: { title: '구성물 완전 소지', desc: '교재 안 부록 악보, 소고 채, CD 등 유실 없음', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    some: { title: '일부 부속 제외됨', desc: '일부 카드, 교구 보조 구성 부속품 유실 있음', color: 'text-red-600 bg-red-50 border-red-100' },
  };

  const isSellerSelf = currentUser.uid === listing.sellerId;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Upper Navigation Action row */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6 group cursor-pointer text-left"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>캠퍼스 전체 장터 목록 구경하기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Real photo proof indicators */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={listing.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
              alt={listing.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              인증된 실물 원본 대조필
            </div>
          </div>

          {/* Multiple Proof Cards Thumbnails showing the textbook details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 tracking-wide uppercase">📖 실물 증빙 상세 사진 컷 (필수 첨부)</h4>
            <div className="grid grid-cols-3 gap-2">
              {listing.images && listing.images.length > 0 ? (
                listing.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={img} alt="proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))
              ) : (
                <div className="aspect-square rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                  추가 사진 없음
                </div>
              )}
              <div className="aspect-square rounded-lg bg-emerald-50/50 border border-dashed border-emerald-300 flex flex-col items-center justify-center p-2 text-center text-[9px] text-emerald-700">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                <span>체크 완료</span>
              </div>
            </div>
          </div>

          {/* Student Trust Information Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">🔒 판매 학우 실명 및 거래 약관</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
                {listing.sellerName[0]}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{listing.sellerName} 선후배</span>
                  {listing.sellerVerified && (
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm text-[8px] font-extrabold">학교 무사 회원</span>
                  )}
                </div>
                <div className="text-slate-500">{listing.sellerDept}</div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 bg-white p-2.5 rounded-lg border border-slate-100 leading-normal">
              캠백 플랫폼의 '개인정보 보호 에스코트'에 따라, 거래 조건이 수락되는 시점까지 판매자-구매자 양방향의 전화번호 및 학번은 안전 마스킹되어 서로에게 노출되지 않습니다.
            </p>
          </div>
        </div>

        {/* Right Column: Descriptions & Package Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                📚 {listing.courseName}
              </span>
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-md">
                 교수: {listing.professor}
              </span>
              {listing.isbn && (
                <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2.5 py-0.5 rounded-md">
                  ISBN: {listing.isbn}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{formattedPrice}</span>
              <span className="text-sm font-semibold text-slate-500">원 {listing.type === 'rent' ? ' (한 학기 통대여료)' : ''}</span>
              <span className="ml-3 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                거래 확정 시 신용 포인트 100P 추가 적립!
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Condition indicators (상태 인증제 자세히 표시) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">🕵️ 거래 상태 정밀 인증</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Highlight status info */}
              <div className="border border-slate-150 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">✏️ 필기 흔적 상태</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 ${highlightLabels[listing.condition.highlighting].color}`}>
                    {highlightLabels[listing.condition.highlighting].title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {highlightLabels[listing.condition.highlighting].desc}
                </p>
              </div>

              {/* Binding status info */}
              <div className="border border-slate-150 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">📖 분철 및 제본 상태</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 ${bindingLabels[listing.condition.binding].color}`}>
                    {bindingLabels[listing.condition.binding].title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {bindingLabels[listing.condition.binding].desc}
                </p>
              </div>

              {/* Missing elements info */}
              <div className="border border-slate-150 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">📦 부형 교구 유실 여부</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 ${missingLabels[listing.condition.missingParts].color}`}>
                    {missingLabels[listing.condition.missingParts].title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {missingLabels[listing.condition.missingParts].desc}
                </p>
              </div>

            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800">📄 판매 학우 설명글</h3>
            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-normal">
              {listing.description}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* COURSE MATCHING PACKAGE RECOMMENDATIONS SYSTEM! (핵심 기능 1) */}
          <div className="space-y-3 bg-gradient-to-tr from-emerald-50/50 via-teal-50/30 to-indigo-50/20 p-5 rounded-2xl border border-emerald-100/70">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>과목 매칭 수업 교구 세트 일괄 추천</span>
                <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wide">원스톱 추천</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">동일 전공 과목 매칭</span>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              학기 초 교재 구매 시, <strong>{listing.courseName} ({listing.professor})</strong> 수업 활동 중 필수로 소지해야 하는 악기, 무용 신발, 전공 실험가운 등 관련 연관 자재를 함께 패키지 형태로 보여드립니다.
            </p>

            {relatedSupplies.length === 0 ? (
              <div className="text-center p-4 bg-white/70 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-normal">
                현재 매칭된 추가 수업 준비물이 거래 장터에 등록되어 있지 않습니다.
                <div className="text-[10px] text-slate-300 mt-0.5">후배를 위해 가방 속 교구를 제일 먼저 기증/판매해 보세요!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {relatedSupplies.map(supply => (
                  <div
                    key={supply.id}
                    onClick={() => onSelectListing(supply)}
                    className="bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-emerald-300 p-3 rounded-xl cursor-pointer transition-all flex gap-3 items-center"
                  >
                    <img
                      src={supply.imageUrl}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                      alt={supply.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded-sm inline-block mb-1">
                        {supply.type === 'sell' ? '판매용' : '단기 대여'}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{supply.title}</h4>
                      <p className="text-[11px] font-extrabold text-slate-900 mt-1">{supply.price.toLocaleString('ko-KR')}원</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer Button based on trading conditions */}
          <div className="pt-2">
            {listing.status !== 'available' ? (
              <button
                disabled
                className="w-full bg-slate-300 text-slate-500 text-sm font-bold py-4 px-6 rounded-2xl cursor-not-allowed justify-center flex items-center gap-2"
              >
                이미 요청 수락 진행중이거나 거래가 마무리된 리소스로 거래 신청을 하실 수 없습니다
              </button>
            ) : isSellerSelf ? (
              <div className="bg-slate-105 p-4 rounded-xl border border-slate-200 text-slate-600 text-xs text-center font-normal">
                💡 본인이 등록한 장터 자산입니다. 매칭 신청 관리는 우측 상단 
                <strong> '나의 거래 내역'</strong> 에서 즉시 수락 대조 및 취소가 승인됩니다.
              </div>
            ) : (
              <button
                onClick={() => onRequestTrade(listing)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-700/10 hover:shadow-xl transition-all duration-300 justify-center flex items-center gap-2 cursor-pointer text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{listing.type === 'sell' ? '교내 직거래 구매 신청하기' : '소중한 교구 학기 대여 신청하기'}</span>
              </button>
            )}
            
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 mt-3 font-normal">
              <Info className="w-3.5 h-3.5" />
              <span>'캠백 거래 지연 보장 제도': 신청 전송 후 판매자가 24시간 미대기 및 반려 시 거래는 자동 철회 처리됩니다.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

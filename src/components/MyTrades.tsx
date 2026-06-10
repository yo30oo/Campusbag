/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TradeOffer, Listing } from '../types';
import { CambagStore } from '../store';
import { Check, X, ShieldAlert, BadgeCheck, Phone, HelpCircle, Coins, Clock, ArrowRightLeft, HandHelping, Landmark, CheckCircle } from 'lucide-react';

export default function MyTrades() {
  const [currentUser, setCurrentUser] = useState(CambagStore.getCurrentUser());
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  const loadData = () => {
    const user = CambagStore.getCurrentUser();
    setCurrentUser(user);
    
    const allOffers = CambagStore.getOffers();
    const allListings = CambagStore.getListings();

    setListings(allListings);
    
    // Sort offers:
    // (a) Sent by me
    // (b) Received by me (where listing belongs to me)
    setOffers(allOffers);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cambag_state_change', loadData);
    return () => window.removeEventListener('cambag_state_change', loadData);
  }, []);

  // Filter offers
  const sentOffers = offers.filter(o => o.buyerId === currentUser.uid);
  
  // Find listings belonging to current user
  const myListingIds = listings.filter(l => l.sellerId === currentUser.uid).map(l => l.id);
  const receivedOffers = offers.filter(o => myListingIds.includes(o.listingId));

  const handleAccept = (offerId: string) => {
    CambagStore.acceptOffer(offerId);
    loadData();
  };

  const handleDecline = (offerId: string) => {
    if (confirm('신청 사항을 거절하시겠습니까? 해당 매물은 다시 전체 장터에 공개됩니다.')) {
      CambagStore.declineOffer(offerId);
      loadData();
    }
  };

  // 24H Timeout fast simulator
  const handleSimulateTimeout = (offerId: string) => {
    CambagStore.simulateTimeout(offerId);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">대기 중 (24H 자동만료)</span>;
      case 'accepted':
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">매칭 성공 🎉</span>;
      case 'declined':
        return <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">거절 처리</span>;
      case 'timeout':
        return <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">24H 자동만료 만기</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Used Trading activity metrics dashboard */}
      <div className="bg-slate-850 text-slate-100 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950">
        {/* Abstract background graphics */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <ArrowRightLeft className="w-64 h-64" />
        </div>

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-1.5 opacity-90">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">나의 캠백 중고거래 매너 활동 포인트</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-baseline gap-1">
            <span>{currentUser.point.toLocaleString()}</span>
            <span className="text-sm font-semibold opacity-90">P (거래 포인트)</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-medium">
            전공 교재 장터에 물건을 올리거나 매칭을 완료할 때마다 매너 포인트가 지급됩니다. 매너 온도를 보증하는 신용 점수로 활용됩니다.
          </p>
        </div>

        <div className="z-10 bg-slate-800/60 backdrop-blur-xs p-3 rounded-2xl border border-slate-700 max-w-xs space-y-2 w-full md:w-auto">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>최신 획득 배지</span>
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-400 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
              {currentUser.point >= 300 ? '🥇 전설적인 쿨거래 학우' : currentUser.point >= 150 ? '🥈 모범 매너 선배' : '🥉 새싹 거래 학우'}
            </span>
            <span className="text-[10px] text-slate-300">
              {currentUser.point >= 300 ? '교내 최상위 매너왕' : '매너 최고 신뢰 등급'}
            </span>
          </div>
        </div>
      </div>

      {/* Two sided trades management layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Layout column: Offers received (판매자 신환 관리) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <HandHelping className="w-5 h-5 text-indigo-600" />
              <span>나에게 들어온 후배들의 신청 ({receivedOffers.length})</span>
            </h3>
            <span className="text-xs text-slate-400">판매자 관리 기능</span>
          </div>

          {receivedOffers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs font-normal">
              후배님들이 보낸 거래 신청 서류가 비어 있습니다.
              <div className="text-[10px] text-slate-300 mt-1">상단의 계정 토글러를 통해 다른 인물로 로그인하여 매칭을 가상 등록해 보세요.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedOffers.map(offer => {
                const targetDoc = listings.find(l => l.id === offer.listingId);
                return (
                  <div key={offer.id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs space-y-4 transition-all">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-slate-400">신청 과목: {targetDoc?.courseName}</div>
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={targetDoc?.title}>
                          {targetDoc?.title}
                        </h4>
                      </div>
                      {getStatusBadge(offer.status)}
                    </div>

                    {/* Buyer Message */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-normal">
                      <div className="font-bold text-slate-800 text-[10px] mb-1 flex items-center gap-1 text-indigo-700">
                        <span>💬 {offer.buyerName} 학우 ({offer.buyerDept})의 메시지:</span>
                      </div>
                      "{offer.buyerMsg}"
                      
                      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <div>⏱️ 희망 시간: <strong className="text-slate-800">{offer.proposedTime}</strong></div>
                        <div>📍 희망 장소: <strong className="text-slate-800">{offer.proposedLocation}</strong></div>
                      </div>
                    </div>

                    {/* Conditional: Unlock sensitive data ONLY when offer is accepted */}
                    {offer.status === 'accepted' ? (
                      <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                        <p className="font-extrabold flex items-center gap-1 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>보안 연락처 잠금 해제 완료</span>
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          후배 <strong>{offer.buyerName} ({offer.buyerDept})</strong> 님께 가방을 전달해 주세요.<br />
                          📞 모바일: <strong className="text-sm underline decoration-emerald-500 font-mono text-slate-900">{offer.buyerContact}</strong>
                        </p>
                      </div>
                    ) : offer.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(offer.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
                        >
                          거래 수락
                        </button>
                        <button
                          onClick={() => handleDecline(offer.id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-center"
                        >
                          거절
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 text-center font-normal">
                        해당 신청은 마감 종결 처리되었습니다.
                      </div>
                    )}

                    {/* Timeout manual Simulator button */}
                    {offer.status === 'pending' && (
                      <div className="pt-2 border-t border-dashed border-slate-100 flex justify-between items-center text-[9px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          24시간 이내 미답변 시 자동 폭파
                        </span>
                        <button
                          onClick={() => handleSimulateTimeout(offer.id)}
                          className="text-amber-600 hover:text-amber-800 font-bold underline cursor-pointer"
                        >
                          [데모] 24시간 타임아웃 강제 발동
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Layout column: My requests submitted (구매/대여 신청 내역) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 w-full">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>내가 보낸 구매/대여 신청 ({sentOffers.length})</span>
            </h3>
            <span className="text-xs text-slate-400 whitespace-nowrap">구매자 전용 관리</span>
          </div>

          {sentOffers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs font-normal">
              선배님들의 교재 교구에 보낸 대기 신청이 전무합니다.
              <div className="text-[10px] text-slate-300 mt-1">장터를 구경하면서 전공 서적을 클릭해 직거래 매칭을 제안해 보세요!</div>
            </div>
          ) : (
            <div className="space-y-4">
              {sentOffers.map(offer => {
                const targetDoc = listings.find(l => l.id === offer.listingId);
                return (
                  <div key={offer.id} className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs space-y-4 transition-all">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-slate-400">대상 전공과목: {targetDoc?.courseName}</div>
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={targetDoc?.title}>
                          {targetDoc?.title}
                        </h4>
                      </div>
                      {getStatusBadge(offer.status)}
                    </div>

                    {/* Meta */}
                    <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 space-y-1 leading-normal font-normal">
                      <div>📍 희망 장소: <strong className="text-slate-800">{offer.proposedLocation}</strong></div>
                      <div>⏱️ 거래 시간: <strong className="text-slate-800">{offer.proposedTime}</strong></div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-200/50 pt-1 mt-1 truncate">
                        전달 코멘트: "{offer.buyerMsg}"
                      </div>
                    </div>

                    {/* Sensitive Info masking until Accepted */}
                    {offer.status === 'accepted' ? (
                      <div className="bg-emerald-50 text-emerald-950 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                        <p className="font-extrabold flex items-center gap-1 text-emerald-800">
                          <BadgeCheck className="w-4 h-4" />
                          <span>선배 학우 매칭 승인 완료!</span>
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          매칭 상대가 구매 제의를 수락했습니다.<br />
                          📞 판매자 비공개 연락처: <strong className="text-sm underline decoration-emerald-400 font-mono text-slate-900">{offer.sellerContact}</strong>
                        </p>
                      </div>
                    ) : offer.status === 'pending' ? (
                      <div className="bg-amber-50/50 text-amber-900 border border-amber-200/40 p-3 rounded-xl text-[10px] flex items-start gap-1.5 leading-relaxed font-normal">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong>개인정보 하부 보호:</strong> 상대방이 거래 매칭에 수락하기 전까지는 판매자의 학번 정보와 양측의 전화번호 목록이 마스킹 쉴드 처리되어 보이지 않습니다.
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 text-center font-normal">
                        종료되었습니다. 상대가 반려했거나 다른 학우와 거래가 완료된 상태입니다.
                      </div>
                    )}

                    {/* Timeout manual Simulator button */}
                    {offer.status === 'pending' && (
                      <div className="pt-2 border-t border-dashed border-slate-100 text-right text-[9px]">
                        <button
                          onClick={() => handleSimulateTimeout(offer.id)}
                          className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                        >
                          [강제 만기 테스트] 24시간 미확인 타임아웃 시뮬레이션
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

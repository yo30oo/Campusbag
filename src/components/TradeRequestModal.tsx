/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Listing } from '../types';
import { CambagStore } from '../store';
import { X, Calendar, MapPin, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TradeRequestModalProps {
  listing: Listing;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const PRESETS_LOCATIONS = [
  '학생회관 로비 사물함 앞 🎒',
  '종합 교양강의동 동편 정문 파라솔 ☕',
  '우당 대강당 앞 1층 벤치 🌲',
  '본관 분수광장 앞 동상 기단 ⛲',
  '중앙 도서관 1층 로비 무인 무인반납기 앞 📖',
  '직접 입력'
];

const PRESETS_TIMES = [
  '공강 시간 (12:00 PM ~ 1:00 PM)',
  '수업 직후 (3:00 PM ~ 3:30 PM)',
  '하교 시간 (5:30 PM ~ 6:00 PM)',
  '상호 조율 (아무 때나 괜찮아요)'
];

export default function TradeRequestModal({ listing, onClose, onSubmitSuccess }: TradeRequestModalProps) {
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(PRESETS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState(PRESETS_TIMES[0]);
  const [buyerMsg, setBuyerMsg] = useState('');
  const [buyerContact, setBuyerContact] = useState('010-5555-5555'); // default simulated

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalLocation = selectedLocation === '직접 입력' ? customLocation : selectedLocation;
    
    // Call Store Action
    setTimeout(() => {
      try {
        CambagStore.submitOffer(listing.id, {
          proposedTime: selectedTime,
          proposedLocation: finalLocation || '캠퍼스 내 조율',
          buyerMsg: buyerMsg || '매너 있는 캠퍼스 직거래 희망합니다!',
          buyerContact: buyerContact
        });
        
        setIsSubmitting(false);
        onSubmitSuccess();
      } catch (err) {
        alert('신청 실패: ' + err);
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5">
              <span>🤝 캠버스 매칭 직거래 신청</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">개인정보 안심</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">상대가 수락하면 자동으로 무사 안심 번호가 상호 공개됩니다.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <img
              src={listing.imageUrl}
              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
              alt="target"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs">
              <div className="text-slate-400">대상과목: {listing.courseName} ({listing.professor})</div>
              <div className="font-bold text-slate-800 max-w-[280px] truncate mt-0.5" title={listing.title}>
                {listing.title}
              </div>
              <div className="font-extrabold text-slate-950 mt-1">거래 비용: {listing.price.toLocaleString()}원</div>
            </div>
          </div>

          {/* Place Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>교내 안전 직거래 희망 장소 (택 1)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS_LOCATIONS.map(loc => {
                const isSelected = selectedLocation === loc;
                return (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                    }}
                    className={`py-2 px-2.5 text-[11px] rounded-xl border text-left font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
            
            {selectedLocation === '직접 입력' && (
              <input
                type="text"
                placeholder="희망 물품 교환 장소를 입력해 주세요 (예: 사범관 서관 405호 앞)"
                required
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full mt-2 p-2.5 border border-emerald-300 bg-emerald-50/20 text-xs rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>

          {/* Time select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>거래 희망 일시 선택</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS_TIMES.map(tm => {
                const isSelected = selectedTime === tm;
                return (
                  <button
                    type="button"
                    key={tm}
                    onClick={() => setSelectedTime(tm)}
                    className={`py-2 px-2.5 text-[11px] rounded-xl border text-left font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {tm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message to student */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>선배 또는 후배에게 보낼 전공 매칭 정중한 메시지</span>
            </label>
            <textarea
              rows={3}
              placeholder="예: 선배님 책 깨끗하게 본 뒤 다음 세대에 꼭 환원 유산하겠습니다! 필기 지움 여부를 여쭤보고 싶습니다."
              value={buyerMsg}
              onChange={(e) => setBuyerMsg(e.target.value)}
              className="w-full p-3 border border-slate-200 text-xs rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>

          {/* Contact backup validation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              📞 승인 즉시 자동 공개할 정보확인용 본인 연락처
            </label>
            <input
              type="tel"
              placeholder="010-XXXX-XXXX"
              required
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
              className="w-full p-2.5 border border-slate-200 text-xs rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-50 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>알림톡 패키징 중...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>캠퍼스 안심 신청 완료</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

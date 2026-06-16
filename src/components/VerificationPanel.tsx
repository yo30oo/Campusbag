/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CambagStore } from '../store';
import { UniversityAccount } from '../types';
import { School, CheckCircle, ShieldAlert, Award, Send, RefreshCw, Smartphone, GraduationCap } from 'lucide-react';

export default function VerificationPanel() {
  const [currentUser, setCurrentUser] = useState<UniversityAccount | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedList, setVerifiedList] = useState<UniversityAccount[]>([]);

  useEffect(() => {
    const loadAccount = () => {
      const user = CambagStore.getCurrentUser();
      setCurrentUser(user);
      setEmailInput(user.email);
      setStudentIdInput(user.studentId);
      
      const allAccs = CambagStore.getAccounts();
      setVerifiedList(allAccs);
    };

    loadAccount();
    window.addEventListener('cambag_state_change', loadAccount);
    return () => window.removeEventListener('cambag_state_change', loadAccount);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Verification check for school domains
    setTimeout(() => {
      if (!emailInput.endsWith('.ac.kr')) {
        setErrorMsg('❌ 대학교 웹메일 형식(@domain.ac.kr)에 맞게 입력해 주세요. 본인 여부 안전 확인을 위한 규칙입니다.');
        setIsSubmitting(false);
        return;
      }

      const success = CambagStore.verifyUniversityEmail(emailInput, studentIdInput);
      if (success) {
        // Force state reload
        const accounts = CambagStore.getAccounts();
        const user = CambagStore.getCurrentUser();
        // Update local student ID
        const match = accounts.find(a => a.uid === user.uid);
        if (match) {
          match.studentId = studentIdInput || '202204104';
          CambagStore.saveAccounts(accounts);
        }
        
        alert('축하합니다! 대학교 이메일 직거래 실명 인증이 완료되었습니다. 든든한 거래 100포인트가 적립되었습니다! 🎓');
      } else {
        setErrorMsg('인증 처리에 실패했습니다. 도메인 철자를 다시 검핵해 주세요.');
      }
      setIsSubmitting(false);
    }, 1000);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      
      {/* Verification status header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
              <h2 className="text-xl font-extrabold text-slate-900">캠퍼스 든든 학번 및 대학교 웹메일 실명인증</h2>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              '캠백'은 대학 선후배 간의 믿을 수 있는 중고거래 교류를 매개하는 신뢰 네트워크 플랫폼입니다. 외부 업자의 무단 광고나 사기거래 침입을 제재하고, 안전한 단과대 앞 직거래를 수호하기 위해 철저한 <strong>대학 웹메일(.ac.kr) 연동</strong>을 필수로 권고하고 있습니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentUser.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser.verified ? '✓' : '?'}
                </div>
                <div className="text-xs font-normal">
                  <div className="text-slate-400">인증 등급</div>
                  <div className="font-bold text-slate-800">
                    {currentUser.verified ? '학번인증 학생회원' : '임시 미인증 신규회원'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <Award className="w-6 h-6 text-emerald-600" />
                <div className="text-xs font-normal">
                  <div className="text-slate-400">거래 활동 포인트</div>
                  <div className="font-bold text-slate-850">{currentUser.point} POINT</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-[#71885b]">🎖️ 학번인증 회원의 원스톱 혜택</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-500 font-normal leading-relaxed">
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>전공교재 및 학과 수업 준비물 등록 권한 활성화</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>매칭 신청 수락 시 상대방 대학교 인증 프로필 확인</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>안전 등급 상향 및 우수 거래자 전용 아이콘 부여</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Main interactive form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Verification Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            ✉️ 대학교 메일 연동 인증 신청 양식
          </h3>

          {currentUser.verified ? (
            <div className="bg-emerald-50 text-emerald-950 border border-emerald-200 p-6 rounded-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-emerald-900">실명 인증 통과 완료</h4>
                <p className="text-xs text-slate-600 font-normal">
                  현재 학우님은 대학교 공식 인증 정보가 대조 처리되었습니다.
                </p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border text-left text-xs font-mono space-y-1 text-slate-600">
                <div>• 성명: <strong className="text-slate-800 font-sans">{currentUser.name}</strong></div>
                <div>• 소속: <strong className="text-slate-800 font-sans">{currentUser.dept}</strong></div>
                <div>• 학번: <strong className="text-slate-800">{currentUser.studentId}</strong></div>
                <div>• 학교 웹메일: <strong className="text-slate-800">{currentUser.email}</strong></div>
              </div>

              <p className="text-[10px] text-slate-400 font-normal">
                학적이 변동되어 타 대학 도메인으로 정보 갱신이 필요하신 경우 과사무실에 증적 서류를 첨부해 메일로 신청해 지지 바랍니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="space-y-1.5Col">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">1. 대학교 소속 학번(8자리)</label>
                  <input
                    type="text"
                    placeholder="예: 20220410"
                    required
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">2. 대학교 공식 웹메일 주소 (.ac.kr)</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="student@univ.ac.kr"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-normal">
                  반드시 끝자리가 <strong>.ac.kr</strong>로 끝나는 국내 정규 단과대학 및 종합대학 이메일 계정만 직거래 보호 안전 조치에 따라 회원 자격이 승인됩니다. (예: user@kyunghee.ac.kr, name@snu.ac.kr)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">3. 개인 수발 휴대폰 인증 번호</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="010-XXXX-XXXX"
                    required
                    disabled
                    value={currentUser.contact}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    disabled
                    className="bg-slate-100 border text-[11px] px-3 py-2 rounded-xl text-slate-400 font-bold"
                  >
                    기연동됨
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-[10px] rounded-xl border border-red-200 font-normal leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>학교 정보망 대조 검토 중...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>학적 확인 및 1회 인증 요청</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* School community status tracker */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>🎓 캠백 안심 학우 실시간 인증 대장</span>
            <span className="text-[10px] text-slate-400 font-medium">데모 DB 현황</span>
          </h3>
          
          <div className="space-y-3.5">
            {verifiedList.map(acc => (
              <div key={acc.uid} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    acc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">{acc.name} 학우 
                      {acc.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{acc.dept} ({acc.verified ? '웹메일 주소 연계 승인완료' : '학번 대조 대기중'})</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-white border px-2 py-0.5 rounded-md font-mono text-slate-500">
                    {acc.point} POINT
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/60 text-[10px] text-amber-900 leading-normal font-normal">
            ⚙️ <strong>시뮬레이터 사용 안내:</strong> 위에서 데모 계정(이서연, 김민준 등) 성명을 클릭하면, 해당 학우 신분으로 즉시 우측 화면이나 상단 알림톡이 동기화 연동됩니다.
          </div>
        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CambagStore } from '../store';
import { UniversityAccount, Notification } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Send, 
  BellDot, 
  CheckCircle2, 
  ChevronRight, 
  X,
  UserPlus,
  LogIn,
  Lock,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RoleSimulator() {
  const [accounts, setAccounts] = useState<UniversityAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UniversityAccount | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationTray, setShowNotificationTray] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<Notification | null>(null);

  // Authentication configuration and states
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const loadState = () => {
      setAccounts(CambagStore.getAccounts());
      setCurrentUser(CambagStore.getCurrentUser());
      // Filter notifications that belong to the current logged-in simulated user
      const user = CambagStore.getCurrentUser();
      const allNotis = CambagStore.getNotifications();
      setNotifications(allNotis.filter(n => n.userId === user.uid));
    };

    loadState();
    window.addEventListener('cambag_state_change', loadState);
    return () => window.removeEventListener('cambag_state_change', loadState);
  }, []);

  // Listen for new notifications to trigger Kakao Talk style notification popups
  useEffect(() => {
    const handleNotificationAlert = () => {
      const allNotis = CambagStore.getNotifications();
      const user = CambagStore.getCurrentUser();
      const userNotis = allNotis.filter(n => n.userId === user.uid);
      
      if (userNotis.length > 0 && notifications.length > 0) {
        const latest = userNotis[0];
        const oldLatest = notifications[0];
        if (!oldLatest || latest.id !== oldLatest.id) {
          // Trigger toast
          setToastContent(latest);
          setIsToastOpen(true);
          setTimeout(() => {
            setIsToastOpen(false);
          }, 6500);
        }
      }
      setNotifications(userNotis);
    };

    window.addEventListener('cambag_state_change', handleNotificationAlert);
    return () => window.removeEventListener('cambag_state_change', handleNotificationAlert);
  }, [notifications]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regName || !regEmail || !regStudentId || !regDept || !regContact || !regPassword) {
      setAuthError('모든 입력란을 채워 주십시오.');
      return;
    }
    const res = await CambagStore.registerAccount({
      name: regName,
      email: regEmail,
      studentId: regStudentId,
      dept: regDept,
      contact: regContact,
      password: regPassword,
    });

    if (res.success) {
      setShowAuthModal(null);
      setRegName('');
      setRegEmail('');
      setRegStudentId('');
      setRegDept('');
      setRegContact('');
      setRegPassword('');
      showToast(`회원가입 완료! 🎉`, `${regName} 님의 진짜 계정으로 즉시 로그인 되었습니다!`);
    } else {
      setAuthError(res.message || '회원가입 처리에 실패했습니다.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginIdentifier || !loginPassword) {
      setAuthError('학번/이메일 연락처 및 비밀번호를 모두 입력해 주십시오.');
      return;
    }
    const res = await CambagStore.loginAccount(loginIdentifier, loginPassword);
    if (res.success) {
      setShowAuthModal(null);
      setLoginIdentifier('');
      setLoginPassword('');
      showToast(`로그인 성공! 🔑`, `${res.user?.name} 님으로 환영합니다.`);
    } else {
      setAuthError(res.message || '로그인을 진행할 수 없습니다.');
    }
  };

  const handleRoleToggle = (uid: string) => {
    CambagStore.setCurrentUser(uid);
    // Auto show a soft notification trigger for demo
    showToast(`시뮬레이션 계정이 변경되었습니다!`, `현재 신분: ${uid === 'user_kim' ? '김민준(판매자)' : uid === 'user_lee' ? '이서연(구매/판매자)' : '홍길동(미인증 신입생)'}`);
  };

  const showToast = (title: string, msg: string) => {
    const tempNoti: Notification = {
      id: `temp_${Date.now()}`,
      userId: currentUser?.uid || '',
      type: 'system',
      title,
      message: msg,
      timestamp: new Date().toISOString(),
      read: true
    };
    setToastContent(tempNoti);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  };

  const handleReset = () => {
    if (confirm('모든 직거래 기록 및 등록 상태를 초기 기본 데이터 값으로 리셋하시겠습니까?')) {
      CambagStore.clearAllData();
      showToast('초기화 완료', '모든 로컬 데이터가 리셋되었습니다.');
    }
  };

  const markAllAsRead = () => {
    const allNotis = CambagStore.getNotifications();
    allNotis.forEach(n => {
      if (n.userId === currentUser?.uid) {
        n.read = true;
      }
    });
    CambagStore.saveNotifications(allNotis);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Simulation Helper Bar on Top representing the Platform Scope */}
      <div id="role-simulator-bar" className="bg-slate-900 text-slate-100 border-b border-slate-800 py-3 px-4 z-40 sticky top-0 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-mono tracking-wider text-slate-400">
              [캠백 데모 시뮬레이터] 
            </p>
            <p className="text-xs text-slate-200 hidden sm:inline-block">
              신청-수락 매칭 과정 체험을 위해 자유롭게 역할을 교대해 보세요.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {accounts.map(acc => {
                const isActive = currentUser?.uid === acc.uid;
                return (
                  <button
                    key={acc.uid}
                    onClick={() => handleRoleToggle(acc.uid)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>{acc.name}</span>
                    <span className="text-[10px] opacity-75 hidden lg:inline">
                      ({acc.uid === 'user_kim' ? '판매 전문' : acc.uid === 'user_lee' ? '선배' : '미인증'})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Real Serverside Authentication Controls */}
            <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
            
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setShowAuthModal('register');
                }}
                className="px-2.5 py-1 text-[11px] text-emerald-400 font-extrabold hover:text-white hover:bg-emerald-900/40 rounded transition-all flex items-center gap-1"
                title="실제 학생 계정 가입"
              >
                <UserPlus className="w-3 h-3" />
                <span>진짜 가입하기</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setShowAuthModal('login');
                }}
                className="px-2.5 py-1 text-[11px] text-indigo-300 font-extrabold hover:text-white hover:bg-slate-700/50 rounded transition-all flex items-center gap-1"
                title="실제 계정 로그인"
              >
                <LogIn className="w-3 h-3" />
                <span>로그인</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
              title="데이터 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Kakao Announcement Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationTray(!showNotificationTray);
                  markAllAsRead();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg select-none transition-all ${
                  unreadCount > 0
                    ? 'bg-amber-500 text-slate-950 font-bold animate-ring-pulse duration-700'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <BellDot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">알림톡 ({unreadCount})</span>
                <span className="sm:hidden">{unreadCount}</span>
              </button>

              {/* Notification Tray Dropdown */}
              <AnimatePresence>
                {showNotificationTray && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-xl z-50 text-slate-800 overflow-hidden"
                  >
                    <div className="bg-amber-400 p-3 flex justify-between items-center text-slate-950 font-bold">
                      <div className="flex items-center gap-2">
                        <img src="https://t1.daumcdn.net/cfile/tistory/252CFB3954E20B8D07" className="w-5 h-5 rounded-md shadow-sm" alt="Kakao" />
                        <span className="text-sm">캠백 비즈니스 알림톡</span>
                      </div>
                      <button onClick={() => setShowNotificationTray(false)} className="hover:bg-amber-500/50 p-1 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          현재 신분({currentUser?.name})에게 도착한 알림이 없습니다.
                        </div>
                      ) : (
                        notifications.map(noti => (
                          <div key={noti.id} className={`p-4 hover:bg-slate-50 transition-colors text-xs ${!noti.read ? 'bg-amber-50/40 font-semibold' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                noti.type === 'kakao' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {noti.type === 'kakao' ? '알림톡 발송' : '캠퍼스 시스템'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(noti.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{noti.title}</h4>
                            <p className="text-slate-600 leading-relaxed font-normal whitespace-pre-line">{noti.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Real Serverside Authentication Overlay Modals */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl p-6 text-slate-800 z-10 overflow-hidden"
            >
              {/* Top Gradient Strip */}
              <div className={`h-2 absolute top-0 left-0 right-0 ${showAuthModal === 'register' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} />

              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                    {showAuthModal === 'register' ? (
                      <>
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                        <span>캠백 진짜 내 계정 만들기 (서버 연동)</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 text-indigo-600" />
                        <span>실제 계정으로 로그인 (서버 실명인증)</span>
                      </>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {showAuthModal === 'register' 
                      ? '시뮬레이터 임시 역할 대신 대학 선후배간 실제 직거래를 위한 계정을 신규 서버에 등록합니다.' 
                      : '등록 완료된 본인의 학번 및 비밀번호를 통해 안전하게 세션을 동기화합니다.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(null)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {showAuthModal === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">실명 (이름)</label>
                      <input
                        type="text"
                        placeholder="예: 홍길동"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">소속학과 및 학번</label>
                      <input
                        type="text"
                        placeholder="예: 국어교육과 22학번"
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">대학 웹메일 주소 (.ac.kr 권장)</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="user@university.ac.kr"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <p className="text-[9px] text-[#71885b] font-bold mt-1">
                      ※ .ac.kr 주소로 가입 시 학번인증 혜택 적용 및 직거래 100포인트 즉시 지급!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">실제 학번 (8자리)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="20221020"
                          value={regStudentId}
                          onChange={(e) => setRegStudentId(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          required
                        />
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">연락처 (HP)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="010-1234-5678"
                          value={regContact}
                          onChange={(e) => setRegContact(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          required
                        />
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">로그인 비밀번호</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="접속에 사용할 비밀번호 설정"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#71885b] hover:bg-[#5e714b] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>서버에 계정 등록 및 가입하기</span>
                    </button>
                  </div>

                  <div className="text-center pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setShowAuthModal('login');
                      }}
                      className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold transition-colors"
                    >
                      이미 가입된 계정이 있으신가요? 실제 계정 로그인
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">이메일 주소 또는 학번</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="아이디 혹은 학번 8자리를 입력하세요"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">계정 비밀번호</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="가입했던 비밀번호를 입력"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <div className="bg-slate-50 text-slate-500 text-[10px] leading-normal p-2.5 rounded-xl border border-slate-100 mt-2 font-normal">
                      💡 <strong>[데모 꿀팁]</strong> 가상의 기둥회원(김민준 <code>user_kim</code>, 이서연 <code>user_lee</code>)은 비밀번호 기입 없이 <strong>[로그인]</strong> 단추만 클릭해도 즉시 실시간 동기화로 체험이 가능합니다!
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>서버 실명 로그인 및 접속</span>
                    </button>
                  </div>

                  <div className="text-center pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setShowAuthModal('register');
                      }}
                      className="text-[10px] text-slate-400 hover:text-emerald-600 font-bold transition-colors"
                    >
                      아직 계정이 가입되어 있지 않은가요? 실제 회원가입
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating alert card simulation for real-time kakao push */}
      <AnimatePresence>
        {isToastOpen && toastContent && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-5 right-5 z-50 w-full max-w-sm bg-slate-900 border border-amber-500 shadow-2xl rounded-xl p-4 text-white overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
            <div className="flex justify-between items-start pl-2">
              <div className="flex gap-2">
                <img src="https://t1.daumcdn.net/cfile/tistory/252CFB3954E20B8D07" className="w-8 h-8 rounded-lg shadow-md" alt="Kakao" />
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">알림톡 실시간 전송 수신</div>
                  <h4 className="text-sm font-bold text-slate-100">{toastContent.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                    {toastContent.message}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsToastOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

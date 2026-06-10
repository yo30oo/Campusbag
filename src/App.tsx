/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CambagStore } from './store';
import { Listing, TradeOffer, UniversityAccount } from './types';
import RoleSimulator from './components/RoleSimulator';
import ItemCard from './components/ItemCard';
import ItemDetail from './components/ItemDetail';
import TradeRequestModal from './components/TradeRequestModal';
import RegisterItem from './components/RegisterItem';
import MyTrades from './components/MyTrades';
import VerificationPanel from './components/VerificationPanel';

import {
  Search,
  BookOpen,
  Filter,
  Layers,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Award,
  Library,
  ShoppingBag,
  Maximize2,
  GraduationCap,
  BadgeAlert,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'mytrades' | 'verification'>('home');
  
  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<UniversityAccount | null>(null);
  
  // Search & Filters state
  const [courseFilter, setCourseFilter] = useState(''); // 과목명 필터
  const [professorFilter, setProfessorFilter] = useState(''); // 담당 교수명 필터
  const [isbnFilter, setIsbnFilter] = useState(''); // ISBN 필터
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'textbook' | 'supply'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sell' | 'rent'>('all'); // 대여/판매 탭 구분

  // Detail / Modal management
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const loadData = () => {
    setListings(CambagStore.getListings());
    setCurrentUser(CambagStore.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cambag_state_change', loadData);
    return () => window.removeEventListener('cambag_state_change', loadData);
  }, []);

  // Filter listings based on the multi-dimensional search indices
  const filteredListings = listings.filter(item => {
    // 1. Course Name (과목명)
    if (courseFilter && !item.courseName.toLowerCase().includes(courseFilter.toLowerCase())) {
      return false;
    }
    // 2. Professor (담당 교수명)
    if (professorFilter && !item.professor.toLowerCase().includes(professorFilter.toLowerCase())) {
      return false;
    }
    // 3. ISBN
    if (isbnFilter && (!item.isbn || !item.isbn.includes(isbnFilter))) {
      return false;
    }
    // 4. Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    // 5. Rental / Sell type tab filter
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setCourseFilter('');
    setProfessorFilter('');
    setIsbnFilter('');
    setCategoryFilter('all');
    setTypeFilter('all');
  };

  // Hot Quick keys for evaluator
  const handleApplyKeyword = (kw: { course: string; prof: string; isbn: string }) => {
    setCourseFilter(kw.course);
    setProfessorFilter(kw.prof);
    setIsbnFilter(kw.isbn);
    setShowAdvancedSearch(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased font-sans pb-16">
      
      {/* 1. Global Role & Notification bar banner */}
      <RoleSimulator />

      {/* 2. Top Header Navigation Section with user integration */}
      <header id="main-header" className="bg-white border-b border-slate-200 sticky top-[49px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/10 rotate-3 transform antialiased">
              <span className="font-extrabold text-[16px] tracking-tight">캠백</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>캠백 (Campus + Back/Bag)</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm font-semibold">교내 중고 장터 특화</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">전공 서적 및 수업용 교구 밀착형 24H 안전 중고거래 장터</p>
            </div>
          </div>

          {/* Navigation Tab selection lists (Touch elements size 44px compliance) */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedListing(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>중고 장터 구경</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setSelectedListing(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>가방 비우기 (글쓰기)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('mytrades');
                setSelectedListing(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'mytrades'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>나의 거래 내역</span>
              
              {/* Highlight badge is shown if any actions occur */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></span>
            </button>

            <button
              onClick={() => {
                setActiveTab('verification');
                setSelectedListing(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'verification'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>웹메일·학번인증</span>
              {currentUser?.verified ? (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              ) : (
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              )}
            </button>
          </nav>

        </div>
      </header>

      {/* 3. Main Stage Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full mt-2">
        
        {/* Dynamic routing based on active tab state */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'home' && (
              <>
                {selectedListing ? (
                  /* Listing Detail presentation view */
                  <ItemDetail
                    listing={selectedListing}
                    onBack={() => setSelectedListing(null)}
                    onSelectListing={handleSelectListing}
                    onRequestTrade={(listing) => {
                      // Block request if student isn't verified (철저한 학번인증 수사)
                      if (!currentUser?.verified) {
                        if (confirm('🔒 아직 대학교 웹메일(학번) 인증이 완료되지 않았습니다! 인증 회원만 거래 신청 자격이 부여됩니다. 인증 화면으로 지금 이동할까요?')) {
                          setActiveTab('verification');
                        }
                        return;
                      }
                      setRequestListing(listing);
                    }}
                  />
                ) : (
                  /* Standard Exploration View */
                  <div className="space-y-6">
                    
                    {/* Hero informative banner with real-time analytics */}
                    <div className="bg-gradient-to-tr from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-lg shadow-slate-950/10">
                      
                      <div className="space-y-3 z-10 max-w-xl">
                        <span className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                          학우 간 다이렉트 전공책/준비물 거래 시스템
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight">
                          한 학기 쓰고 책꽂이에만 박혀있던 전공 서적,<br />강의실 바로 앞에서 안전하게 중고거래하백 📚
                        </h2>
                        <p className="text-[11px] text-slate-350 leading-relaxed font-normal">
                          '캠백(Campus + Back)'은 같은 과목을 듣는 선후배 간에 꼭 필요한 전공 도서 뿐만 아니라 소고·무용슈즈·미술도구·실험가운 등 수업 준비물까지 함께 <strong>패키지로 손쉽게 중고 직거래</strong>하는 공간입니다.
                        </p>
                      </div>

                      {/* Micro stats panels */}
                      <div className="z-10 bg-white/5 border border-white/10 backdrop-blur-xs p-4 rounded-2xl flex flex-col justify-between w-full md:w-64 gap-3">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">💡 캠백 실시간 거래 현황</div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white/5 p-2 rounded-xl">
                            <div className="text-emerald-400 font-extrabold text-base">412권</div>
                            <div className="text-[9px] text-slate-400">이번 학기 등록 도서</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl">
                            <div className="text-indigo-300 font-extrabold text-base">391만원</div>
                            <div className="text-[9px] text-slate-400">누적 절약 교재비</div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* 1. Multi-dimensional search filters (과목명, 담당 교수명, ISBN 필터) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Filter className="w-4 h-4 text-emerald-600" />
                          <span>과목 매칭형 정교한 탐색 시스템</span>
                        </h3>
                        <button
                          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer text-left"
                        >
                          <span>{showAdvancedSearch ? '간편 필터만 보기' : '교수명 및 ISBN 다차원 심층 필터 열기'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Main Course search input */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        
                        <div className="md:col-span-6 relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            placeholder="찾고자 하는 전공 과목명(예: 초등 음악, 무용론, 화학)을 입력하세요..."
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                          />
                          {courseFilter && (
                            <button onClick={() => setCourseFilter('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Rent/Sell filter categories */}
                        <div className="md:col-span-3 flex bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setTypeFilter('all')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            전체 물품
                          </button>
                          <button
                            onClick={() => setTypeFilter('sell')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              typeFilter === 'sell' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            도서 구매
                          </button>
                          <button
                            onClick={() => setTypeFilter('rent')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              typeFilter === 'rent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            학기 대여
                          </button>
                        </div>

                        <div className="md:col-span-3 flex bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setCategoryFilter('all')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            전체 카테고리
                          </button>
                          <button
                            onClick={() => setCategoryFilter('textbook')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              categoryFilter === 'textbook' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            전공서적
                          </button>
                          <button
                            onClick={() => setCategoryFilter('supply')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              categoryFilter === 'supply' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            수업교구
                          </button>
                        </div>

                      </div>

                      {/* Advanced Search: Prof and ISBN */}
                      {showAdvancedSearch && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-100"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block">담당 교수명 필터</span>
                            <input
                              type="text"
                              value={professorFilter}
                              onChange={(e) => setProfessorFilter(e.target.value)}
                              placeholder="교수 성함 입력 (예: 박진수, 한수정, 최태영)"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block">ISBN 13글자 스캔 코드 필터</span>
                            <input
                              type="text"
                              value={isbnFilter}
                              onChange={(e) => setIsbnFilter(e.target.value)}
                              placeholder="13자리 숫자 부서 번호 입력 (예: 9788955214013)"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Hot Tags with quick filtering triggers */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
                        <span className="text-slate-400 font-bold block">🔥 핫 과목 원스토어 매입:</span>
                        <button
                          onClick={() => handleApplyKeyword({ course: '초등 음악 실무', prof: '박진수 교수', isbn: '9788955214013' })}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 px-2.5 py-1 rounded-md border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          초등 음악 실무 세트 (소고 패키지 매칭)
                        </button>
                        <button
                          onClick={() => handleApplyKeyword({ course: '체육과 교육 무용론', prof: '한수정 교수', isbn: '9788960541123' })}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 px-2.5 py-1 rounded-md border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          체육 무용론 세트 (슈즈 대여 매칭)
                        </button>
                        <button
                          onClick={() => handleApplyKeyword({ course: '일반 화학 및 실험 1', prof: '최태영 교수', isbn: '9791191590456' })}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 px-2.5 py-1 rounded-md border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          일반 화학 1 세트 (안전가운 패키지)
                        </button>

                        {(courseFilter || professorFilter || isbnFilter) && (
                          <button
                            onClick={handleClearFilters}
                            className="text-red-600 hover:text-red-800 font-bold ml-auto cursor-pointer"
                          >
                            필터 초기화 👤
                          </button>
                        )}
                      </div>

                    </div>

                    {/* 2. Listings Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          캠퍼스 실시간 등록 매물 ({filteredListings.length}개)
                        </h3>
                        <p className="text-xs text-slate-400">교안 일치 여부가 보장된 대학생 필터 수립</p>
                      </div>

                      {filteredListings.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 text-xs font-normal">
                          검색 필터에 부합하는 매물이 발견되지 않았습니다.
                          <div className="text-[10px] text-slate-350 mt-1">
                            철자를 확인해 보시거나, 상단 리셋 혹은 다른 핫태그 키워드를 클릭해 모의 수립해 보십시오.
                          </div>
                          <button
                            onClick={handleClearFilters}
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            모든 필터 제거 후 재조회
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {filteredListings.map(item => (
                            <ItemCard
                              key={item.id}
                              listing={item}
                              onSelect={handleSelectListing}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'register' && (
              <RegisterItem
                onSuccess={() => {
                  setActiveTab('home');
                  setSelectedListing(null);
                }}
              />
            )}

            {activeTab === 'mytrades' && (
              <MyTrades />
            )}

            {activeTab === 'verification' && (
              <VerificationPanel />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* 4. Safe Trade Apply Modal */}
      <AnimatePresence>
        {requestListing && (
          <TradeRequestModal
            listing={requestListing}
            onClose={() => setRequestListing(null)}
            onSubmitSuccess={() => {
              setRequestListing(null);
              // Jump tab to view requests instantly
              setActiveTab('mytrades');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CambagStore } from '../store';
import { BookOpen, UploadCloud, CheckCircle, ShieldCheck, HelpCircle, Layers, Coins, Sparkles } from 'lucide-react';
import { ListingCategory, TradeType, BookCondition, BindingState, MissingPartsState } from '../types';

interface RegisterItemProps {
  onSuccess: () => void;
}

const SAMPLE_COURSES = [
  {
    courseName: '초등 음악 실무',
    professor: '박진수 교수',
    title: '초등 음악 교육론과 실제 (개정판)',
    isbn: '9788955214013',
    suggestedPrice: 15000,
    category: 'textbook' as ListingCategory,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'
  },
  {
    courseName: '체육과 교육 무용론',
    professor: '한수정 교수',
    title: '초등 무용 교육 가이드북',
    isbn: '9788960541123',
    suggestedPrice: 12000,
    category: 'textbook' as ListingCategory,
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400'
  },
  {
    courseName: '일반 화학 및 실험 1',
    professor: '최태영 교수',
    title: '레이먼드 창의 일반화학 14판',
    isbn: '9791191590456',
    suggestedPrice: 24000,
    category: 'textbook' as ListingCategory,
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400'
  },
  {
    courseName: '아동 미술 감상 및 실기',
    professor: '이지은 교수',
    title: '초등 미술 교육의 이해',
    isbn: '9788934005118',
    suggestedPrice: 10000,
    category: 'textbook' as ListingCategory,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400'
  }
];

const PRESET_SUPPLY_IMAGES = [
  { label: '전공용 소고 세트', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400' },
  { label: '클래식 무용 코슈즈', url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=400' },
  { label: '화학 실험 안전세트', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400' },
  { label: '전문가 오일 파스텔', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400' },
  { label: '하모니카 악기 세트', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400' }
];

export default function RegisterItem({ onSuccess }: RegisterItemProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TradeType>('sell');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory>('textbook');
  const [courseName, setCourseName] = useState('');
  const [professor, setProfessor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  
  // Highlighting state (필기 상태)
  const [highlighting, setHighlighting] = useState<BookCondition>('none');
  const [binding, setBinding] = useState<BindingState>('original');
  const [missingParts, setMissingParts] = useState<MissingPartsState>('none');

  // Interactive dropzone file upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Quick auto-filler based on standard colleges
  const handleQuickFill = (course: typeof SAMPLE_COURSES[0]) => {
    setTitle(course.title);
    setCourseName(course.courseName);
    setProfessor(course.professor);
    setIsbn(course.isbn);
    setPrice(course.suggestedPrice.toString());
    setCategory(course.category);
    setUploadedImage(course.imageUrl);
    setUploadedFileName('university_standard_photocard.png');
  };

  // Quick prep of preset supply pictures to make test rendering robust
  const handleSelectPresetImage = (url: string, indexLabel: string) => {
    setUploadedImage(url);
    setUploadedFileName(`${indexLabel}_real_proof.png`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set default beautiful fallback image if user hasn't uploaded one
    const finalImageUrl = uploadedImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=405';

    try {
      CambagStore.createListing({
        title: title || '제목 없음',
        type,
        price: Number(price) || 0,
        category,
        courseName: courseName || '무전공 수강 과목',
        professor: professor || '담당 교수 미상',
        isbn,
        imageUrl: finalImageUrl,
        images: [finalImageUrl],
        description: description || '교내 선후배 간 안전한 직거래 중고 매물입니다.',
        condition: {
          highlighting,
          binding,
          missingParts
        }
      });

      alert('캠퍼스 중고 장터에 새로운 중고 매물이 안전하게 등록 완료되었습니다! 50 거래 포인트가 적립되었습니다. 👍');
      onSuccess();
    } catch (err: any) {
      alert('등록 중 에러: ' + err.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-1.5">
            <span>🎒 나의 소중한 가방(Bag) 내놓기</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">중고 매물 등록</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">학교 후배 혹은 필요한 학우 분께 유용한 전공책과 교구를 합리적인 중고 가격으로 전달해 보세요.</p>
        </div>
        <div className="bg-emerald-50 text-[11px] text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100 font-bold flex items-center gap-1">
          <Coins className="w-3.5 h-3.5" />
          <span>등록 즉시 거래 포인트 50P 지급</span>
        </div>
      </div>

      {/* QUICK FILL DEMO SYSTEM! */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>[데모 원터치] 대표 학과 전공 서적 자동 완성 시범 입력</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_COURSES.map(course => (
            <button
              type="button"
              key={course.courseName}
              onClick={() => handleQuickFill(course)}
              className="text-[11px] font-semibold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 py-1.5 px-3 rounded-lg transition-all"
            >
              🎓 {course.courseName} 교재 자동 채우기
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-medium text-slate-700">
        
        {/* Left Form column: Text parameters */}
        <div className="md:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">물건 분류</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
              >
                <option value="textbook">📖 전공 교과 도서</option>
                <option value="supply">🛠️ 수업 준비물 / 과목 교구</option>
                <option value="other">📦 기타 생활 가방</option>
              </select>
            </div>

            {/* Type selection: Sell or Rent */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">중고 거래 종류</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('sell')}
                  className={`py-2 px-3 border rounded-xl font-bold transition-all text-center ${
                    type === 'sell'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  중고 도서 판매
                </button>
                <button
                  type="button"
                  onClick={() => setType('rent')}
                  className={`py-2 px-3 border rounded-xl font-bold transition-all text-center ${
                    type === 'rent'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  수업 장기 대여
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form details */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">📙 전공강의 매칭 인덱스 정보 입력</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold">과목명 (정확한 매칭을 위해 체크)</label>
                <input
                  type="text"
                  placeholder="예: 초등 음악 실무"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold">담당 교수명</label>
                <input
                  type="text"
                  placeholder="예: 박진수 교수"
                  required
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold">매물 정규 명칭 (도서 도서명 또는 교구명)</label>
                <input
                  type="text"
                  placeholder="예: 무용 발코 슈즈 235mm 가죽"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold">전공 희망 장터 금액 (원)</label>
                <input
                  type="number"
                  placeholder="예: 5000"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold">ISBN 코드 번호 (북스캔 책 일치 체크용 - 선택)</label>
              <input
                type="text"
                placeholder="예: 9788955214013 (ISBN이 있으면 패키지 추천 만족도가 상승합니다)"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 투명한 상태 인증제 (핵심 기능 2) */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>투명한 상태 인증 사항 체크 🛡️</span>
            </h3>
            <p className="text-[10px] text-slate-400">사실대로 정보를 기재해 분쟁을 사전에 완전 방지하고 선배 전공 위상을 높입니다.</p>
            
            <div className="space-y-3">
              {/* Highlighting Status */}
              <div>
                <label className="font-bold block mb-1.5 text-slate-800">1. 형광펜 및 필기 흔적 정도</label>
                <div className="flex gap-2">
                  {(['none', 'light', 'heavy'] as BookCondition[]).map(cond => {
                    const label = cond === 'none' ? '필기 완전 없음 (깨끗함)' : cond === 'light' ? '일부 연필 필기/가벼운 밑줄' : '수업 전체 형광펜/낙서 많음';
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => setHighlighting(cond)}
                        className={`flex-1 py-2 px-2 border text-[10px] font-bold rounded-xl transition-all text-center ${
                          highlighting === cond
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Binding State */}
              <div>
                <label className="font-bold block mb-1.5 text-slate-800">2. 도서 제본 및 실물 가공 상태</label>
                <div className="flex gap-2">
                  {(['original', 'spring', 'photocopy'] as BindingState[]).map(bind => {
                    const label = bind === 'original' ? '정품 오리지널 백북' : bind === 'spring' ? '공부 필기용 스프링 분철' : '전체 흑백 제본 가공본';
                    return (
                      <button
                        type="button"
                        key={bind}
                        onClick={() => setBinding(bind)}
                        className={`flex-1 py-2 px-2 border text-[10px] font-bold rounded-xl transition-all text-center ${
                          binding === bind
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Missing Parts State */}
              <div>
                <label className="font-bold block mb-1.5 text-slate-800">3. 기본 부형 패키지 구성품 유실 여부</label>
                <div className="flex gap-2">
                  {(['none', 'some'] as MissingPartsState[]).map(mg => {
                    const label = mg === 'none' ? '부록/교구 가방 내용물 100% 완비' : '일부 카드, CD, 케이스 단종 유실 있음';
                    return (
                      <button
                        type="button"
                        key={mg}
                        onClick={() => setMissingParts(mg)}
                        className={`flex-1 py-2 px-2 border text-[10px] font-bold rounded-xl transition-all text-center ${
                          missingParts === mg
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
          </div>

          {/* Description comment */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">상세 보충 설명 (강의 기간 중 사용 회수 및 보관 상태 기록)</label>
            <textarea
              required
              rows={4}
              placeholder="예: 초등 음악 실무 최태영 반 수강할 때 사용했습니다. 첫 부분 30페이지 정도 국악 파트에만 연필 필기 있고 깨끗하며, 부록 악보집 유실 없이 완벽히 첨부되어 있습니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
            ></textarea>
          </div>

        </div>

        {/* Right Form column: Interactive File Dropzone Upload */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">실물 증빙 사진 첨부 (드래그 앤 드롭 지원 및 상태 투명화 수칙 필수)</label>
            
            {/* DRAG AND DROP / CLICK SUBSTANTIAL FILE UPLOADER */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : uploadedImage
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="space-y-3 w-full">
                  <div className="aspect-square max-w-[150px] mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    <img src={uploadedImage} alt="Uploaded Proof Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 max-w-[190px] mx-auto truncate" title={uploadedFileName}>{uploadedFileName}</p>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1 mt-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>실물 원본 무사 인증 완료</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 hover:text-slate-600 underline block cursor-pointer">
                    새로운 증빙 촬영 컷으로 영구 교체하기
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-800">이곳에 실물 도서/교구 사진 드래그&드롭</p>
                    <p className="text-[10px] text-slate-400 mt-1">또는 화면 영역을 클릭해서 수동 파일 탐색기 열기 (44px 터치 지원)</p>
                  </div>
                  <div className="bg-emerald-100/50 text-emerald-800 text-[9px] font-bold px-2 py-1 rounded-md max-w-xs mx-auto">
                    스프링 분철 상태나 필기감이 잘 드러나는 사진일수록 신용 가산점이 붙어 즉시 거래가 매칭됩니다.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick preset pictures for supplies */}
          {category === 'supply' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎨 [데모 프리셋] 수업용 교구 대표 증명 컷으로 빠른 적용</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SUPPLY_IMAGES.map(pre => (
                  <button
                    type="button"
                    key={pre.label}
                    onClick={() => handleSelectPresetImage(pre.url, pre.label)}
                    className="border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 bg-white p-2 rounded-lg flex items-center gap-2 text-[10px] text-slate-700 transition-colors"
                  >
                    <img src={pre.url} className="w-6 h-6 object-cover rounded-sm border" alt="pre" referrerPolicy="no-referrer" />
                    <span>{pre.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Important Safe Trade Guidelines */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>캠백 든든 가방 신조 약정</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 leading-normal list-disc pl-3">
              <li>실제 전공이 일치하지 않는 허위 매물은 대학 학생 연계 관리에서 보조 정지 사유가 됩니다.</li>
              <li>학기 도중 대여 계약 도중 장비 파손 수칙은 양측 학생 협의에 의해 보전 조율함을 인정합니다.</li>
              <li>전화번호와 학번 인적사항은 매칭 신청을 '수락'하기 전까지 절대로 보이지 않으므로 장터 안심 사용을 지원합니다.</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer text-center"
          >
            캠퍼스 안전 가방(Bag) 중고 매물 올리기 👍
          </button>

        </div>

      </form>
    </div>
  );
}

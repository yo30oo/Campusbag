/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Listing, TradeOffer, UniversityAccount, Notification } from './types';

export const INITIAL_ACCOUNTS: UniversityAccount[] = [
  {
    uid: 'user_kim',
    name: '김민준',
    dept: '초등교육과 21학번',
    studentId: '202101034',
    email: 'minjun.kim@campus.ac.kr',
    verified: true,
    contact: '010-1234-5678',
    point: 320,
  },
  {
    uid: 'user_lee',
    name: '이서연',
    dept: '음악교육과 23학번',
    studentId: '202302012',
    email: 'seoyeon.lee@campus.ac.kr',
    verified: true,
    contact: '010-9876-5432',
    point: 150,
  },
  {
    uid: 'user_test',
    name: '홍길동',
    dept: '미술교육과 22학번',
    studentId: '202204104',
    email: 'gildong.hong@campus.ac.kr',
    verified: false,
    contact: '010-5555-5555',
    point: 80,
  }
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list_1',
    title: '초등 음악 교육론과 실제 (깨끗함)',
    type: 'sell',
    price: 15000,
    category: 'textbook',
    courseName: '초등 음악 실무',
    professor: '박진수 교수',
    isbn: '9788955214013',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=400'
    ],
    description: '초등 음악 실무 수업 필수 교재입니다. 앞부분 30페이지 정도 연필 필기 흔적이 있으나 깨끗하게 지웠습니다. 형광펜 밑줄은 5장 내외로 아주 적습니다. 부록 악보집도 손상 없이 그대로 포함되어 있습니다.',
    condition: {
      highlighting: 'light',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_lee',
    sellerName: '이서연',
    sellerDept: '음악교육과 23학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4h ago
    status: 'available',
    relatedSupplyIds: ['list_1_sup1', 'list_1_sup2']
  },
  {
    id: 'list_1_sup1',
    title: '[전공용] 국악 실습 초등 교육용 소고 세트 (소고채 포함)',
    type: 'sell',
    price: 3500,
    category: 'supply',
    courseName: '초등 음악 실무',
    professor: '박진수 교수',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400'],
    description: '음악 실무 수업 국악 파트에서 한 달간 사용했던 교육용 소고입니다. 소고채 포함되어 있고, 가죽 손상이나 뒤틀림 없습니다. 저렴하게 가져가세요.',
    condition: {
      highlighting: 'none',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_lee',
    sellerName: '이서연',
    sellerDept: '음악교육과 23학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    status: 'available'
  },
  {
    id: 'list_1_sup2',
    title: '엔젤 24홀 교육용 하모니카 C Major',
    type: 'sell',
    price: 5000,
    category: 'supply',
    courseName: '초등 음악 실무',
    professor: '박진수 교수',
    imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400'],
    description: '수업용으로 구입해 실착 2회 후 전용 소독 티슈로 보관했습니다. 케이스와 융 클리너 모두 다 드립니다.',
    condition: {
      highlighting: 'none',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_lee',
    sellerName: '이서연',
    sellerDept: '음악교육과 23학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    status: 'available'
  },
  {
    id: 'list_2',
    title: '초등 무용 교육 가이드북 및 레포트 정리본',
    type: 'sell',
    price: 12000,
    category: 'textbook',
    courseName: '체육과 교육 무용론',
    professor: '한수정 교수',
    isbn: '9788960541123',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400'],
    description: '체육 주임 교수님 기출 족보 및 강의 요약 스프링 제본 교재 포함한 패키지입니다. 전반적인 형광펜 흔적 있으나 필기 깔끔합니다.',
    condition: {
      highlighting: 'heavy',
      binding: 'spring',
      missingParts: 'none',
    },
    sellerId: 'user_kim',
    sellerName: '김민준',
    sellerDept: '초등교육과 21학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    status: 'available',
    relatedSupplyIds: ['list_2_sup1']
  },
  {
    id: 'list_2_sup1',
    title: '[대여] 한국 무용 슈즈 가죽 (발 길이 235~240mm 전용)',
    type: 'rent',
    price: 1500, // 일 단위가 아닌 한 학기 통대여 혹은 주 단위 대여
    category: 'supply',
    courseName: '체육과 교육 무용론',
    professor: '한수정 교수',
    imageUrl: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=400'],
    description: '체육과 교육 무용론 4주 동안만 필요한 무용코 가죽 슈즈입니다. 바닥 가죽 깨끗하고 밴딩 늘어남 없습니다. 대여 금액은 한 학기 통 대여 기준 1,500원입니다.',
    condition: {
      highlighting: 'none',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_kim',
    sellerName: '김민준',
    sellerDept: '초등교육과 21학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 7.5 * 3600000).toISOString(),
    status: 'available'
  },
  {
    id: 'list_3',
    title: '레이먼드 창의 일반화학 14판 (최신판)',
    type: 'sell',
    price: 24000,
    category: 'textbook',
    courseName: '일반 화학 및 실험 1',
    professor: '최태영 교수',
    isbn: '9791191590456',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400'],
    description: '학기 초에 구매하여 책 표지에 겉비닐 아스테이지 씌워두어 매우 깨끗합니다. 거의 불타는 의지로 구매했으나 앞부분만 조금 보아서 형광펜 가벼운 필기 3페이지 이내입니다.',
    condition: {
      highlighting: 'light',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_kim',
    sellerName: '김민준',
    sellerDept: '초등교육과 21학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    status: 'available',
    relatedSupplyIds: ['list_3_sup1']
  },
  {
    id: 'list_3_sup1',
    title: '화학 실험용 안전 고글(보안경) 및 순면 쉴드 가운 S사이즈',
    type: 'sell',
    price: 6000,
    category: 'supply',
    courseName: '일반 화학 및 실험 1',
    professor: '최태영 교수',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'],
    description: '화학 실험 안전 수칙 필수 준비물인 고글과 긴 장소매 흰색 면직 가운입니다. 고글에 미세 쓸림 외에는 흠집 전혀 없으며, 가운도 락스 소독 세탁 마쳐놓아 바로 실습실 입장이 가능합니다.',
    condition: {
      highlighting: 'none',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_kim',
    sellerName: '김민준',
    sellerDept: '초등교육과 21학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    status: 'available'
  },
  {
    id: 'list_4',
    title: '미술용 전문가 펜텔 49색 오일 파스텔 세트 (사용감 있음)',
    type: 'sell',
    price: 8000,
    category: 'supply',
    courseName: '아동 미술 감상 및 실기',
    professor: '이지은 교수',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400'],
    description: '아동 미술 수업 야외 사생 대회와 풍경 크로키때 3주간 사용한 오일 가루가 적은 펜텔 오일 파스텔입니다. 백색 및 황색 계열은 사용 감이 있어 80% 정도 남았고 다른 메인 컬러들은 거의 사용 안 한 신품 수준입니다. 개별 구성 유실 전혀 없이 49개 다 들어 있습니다.',
    condition: {
      highlighting: 'none',
      binding: 'original',
      missingParts: 'none',
    },
    sellerId: 'user_lee',
    sellerName: '이서연',
    sellerDept: '음악교육과 23학번',
    sellerVerified: true,
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
    status: 'available'
  }
];

export const INITIAL_OFFERS: TradeOffer[] = [
  {
    id: 'offer_1',
    listingId: 'list_2',
    buyerId: 'user_lee',
    buyerName: '이서연',
    buyerDept: '음악교육과 23학번',
    buyerContact: '010-9876-5432',
    sellerContact: '010-1234-5678', // seller is user_kim
    proposedTime: '목요일 4:30 PM (우당교육관 로비)',
    proposedLocation: '우당교육관 정문 파라솔 옆',
    buyerMsg: '선배님! 안녕하세요. 체육과 교육 무용론 전공서적 신청합니다. 제본이 구버전인지 교수님 수업 정리본과 맞는지 확인하고 싶습니다. 시간이 맞으면 정문 앞에서 직거래 하고 싶어요!',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    timeoutAt: new Date(Date.now() + 22 * 3600000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'noti_1',
    userId: 'user_kim',
    type: 'kakao',
    title: '[캠백 알림톡] 신규 구매 신청 도착!',
    message: '이서연 님께서 [초등 무용 교육 가이드북 및 레포트 정리본] 에 대한 구매 신청을 보냈습니다. 24시간 내 수락하지 않으시면 자동으로 신청이 취소됩니다.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    relatedListingId: 'list_2',
    read: false,
  }
];

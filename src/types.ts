/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ListingCategory = 'textbook' | 'supply' | 'package' | 'other';
export type TradeType = 'sell' | 'rent';
export type PostStatus = 'available' | 'matching' | 'completed';
export type BookCondition = 'none' | 'light' | 'heavy'; // 필기 흔적 (없음, 일부, 많음)
export type BindingState = 'original' | 'spring' | 'photocopy'; // 제본 여부 (정품, 스프링, 제본)
export type MissingPartsState = 'none' | 'some'; // 구성품 유실 (유실 없음, 유실 있음)

export interface ItemCondition {
  highlighting: BookCondition;
  binding: BindingState;
  missingParts: MissingPartsState;
}

export interface Listing {
  id: string;
  title: string;
  type: TradeType;
  price: number;
  category: ListingCategory;
  courseName: string; // 과목명
  professor: string;  // 담당 교수명
  isbn?: string;      // ISBN
  imageUrl: string;
  images: string[];
  description: string;
  condition: ItemCondition;
  sellerId: string;
  sellerName: string;
  sellerDept: string;
  sellerVerified: boolean;
  createdAt: string;
  status: PostStatus;
  relatedSupplyIds?: string[]; // 연관 매물 (수업물품 세트 추천용)
}

export interface TradeOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerDept: string;
  buyerContact: string; // 신청 수락 전에는 숨김 처리하며, 수락 후 공개
  sellerContact: string; // 신청 수락 후 공개되는 판매자 연락처
  proposedTime: string; // 희망 거래 시간
  proposedLocation: string; // 희망 거래 장소
  buyerMsg: string; // 구매자 전달 메세지
  status: 'pending' | 'accepted' | 'declined' | 'timeout';
  createdAt: string;
  timeoutAt: string; // 24시간 제한
}

export interface Notification {
  id: string;
  userId: string;
  type: 'kakao' | 'system';
  title: string;
  message: string;
  timestamp: string;
  relatedListingId?: string;
  read: boolean;
}

export interface UniversityAccount {
  uid: string;
  name: string;
  dept: string;
  studentId: string; // 학번
  email: string;
  verified: boolean;
  contact: string;
  point: number; // 거래 활동 신용 포인트
  password?: string; // 로그인용 비밀번호
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_LISTINGS, INITIAL_OFFERS, INITIAL_ACCOUNTS, INITIAL_NOTIFICATIONS } from './mockData';
import { Listing, TradeOffer, UniversityAccount, Notification } from './types';

export function getStoredData<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (err) {
    return initialValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
}

// Global actions to manipulate state with full Node/Express sync backend
export class CambagStore {
  // Sync all data elements from Express server backend
  static async syncFromServer(): Promise<void> {
    try {
      const [listingsRes, offersRes, accountsRes, notisRes] = await Promise.all([
        fetch('/api/listings').then(res => res.json()),
        fetch('/api/offers').then(res => res.json()),
        fetch('/api/accounts').then(res => res.json()),
        fetch('/api/notifications').then(res => res.json()),
      ]);

      if (listingsRes.success && listingsRes.data) {
        setStoredData('cambag_listings', listingsRes.data);
      }
      if (offersRes.success && offersRes.data) {
        setStoredData('cambag_offers', offersRes.data);
      }
      if (accountsRes.success && accountsRes.data) {
        setStoredData('cambag_accounts', accountsRes.data);
      }
      if (notisRes.success && notisRes.data) {
        setStoredData('cambag_notifications', notisRes.data);
      }

      window.dispatchEvent(new Event('cambag_state_change'));
    } catch (err) {
      console.warn('Failed to sync with backend server, using offline localStorage fallback:', err);
    }
  }

  static getListings(): Listing[] {
    return getStoredData('cambag_listings', INITIAL_LISTINGS);
  }

  static saveListings(listings: Listing[]): void {
    setStoredData('cambag_listings', listings);
    window.dispatchEvent(new Event('cambag_state_change'));
  }

  static getOffers(): TradeOffer[] {
    return getStoredData('cambag_offers', INITIAL_OFFERS);
  }

  static saveOffers(offers: TradeOffer[]): void {
    setStoredData('cambag_offers', offers);
    window.dispatchEvent(new Event('cambag_state_change'));
  }

  static getAccounts(): UniversityAccount[] {
    return getStoredData('cambag_accounts', INITIAL_ACCOUNTS);
  }

  static saveAccounts(accounts: UniversityAccount[]): void {
    setStoredData('cambag_accounts', accounts);
    window.dispatchEvent(new Event('cambag_state_change'));
  }

  static getNotifications(): Notification[] {
    return getStoredData('cambag_notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: Notification[]): void {
    setStoredData('cambag_notifications', notifications);
    window.dispatchEvent(new Event('cambag_state_change'));
  }

  static getCurrentUser(): UniversityAccount {
    const accounts = this.getAccounts();
    const storedUid = localStorage.getItem('cambag_current_uid') || 'user_test';
    const user = accounts.find(a => a.uid === storedUid);
    if (user) return user;
    return accounts[2] || INITIAL_ACCOUNTS[2]; // Default to user_test (Hong Gildong)
  }

  static setCurrentUser(uid: string): void {
    localStorage.setItem('cambag_current_uid', uid);
    window.dispatchEvent(new Event('cambag_state_change'));
  }

  // Business Action: Create a new listing (Synchronous optimistic update + Server replication)
  static createListing(data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerDept' | 'sellerVerified' | 'createdAt' | 'status'>): Listing {
    const user = this.getCurrentUser();
    const listings = this.getListings();

    const newListing: Listing = {
      ...data,
      id: `list_${Date.now()}`,
      sellerId: user.uid,
      sellerName: user.name,
      sellerDept: user.dept,
      sellerVerified: user.verified,
      createdAt: new Date().toISOString(),
      status: 'available',
    };

    // 1. Optimistic Update
    const updated = [newListing, ...listings];
    this.saveListings(updated);
    this.addPoints(user.uid, 50);

    if (data.category === 'supply' && data.courseName) {
      const parentBooks = updated.filter(l => l.category === 'textbook' && l.courseName.trim().toLowerCase() === data.courseName.trim().toLowerCase());
      if (parentBooks.length > 0) {
        parentBooks.forEach(book => {
          if (!book.relatedSupplyIds) book.relatedSupplyIds = [];
          if (!book.relatedSupplyIds.includes(newListing.id)) {
            book.relatedSupplyIds.push(newListing.id);
          }
        });
        this.saveListings(updated);
      }
    }

    // 2. Server Replication
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newListing,
        sellerId: user.uid,
      })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));

    return newListing;
  }

  // Business Action: Request trade (submit offer)
  static submitOffer(listingId: string, info: { proposedTime: string; proposedLocation: string; buyerMsg: string; buyerContact: string }): TradeOffer {
    const user = this.getCurrentUser();
    const listings = this.getListings();
    const offers = this.getOffers();

    const listing = listings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const sellerAccount = this.getAccounts().find(a => a.uid === listing.sellerId);
    const sellerContact = sellerAccount?.contact || '010-XXXX-XXXX';

    const newOffer: TradeOffer = {
      id: `offer_${Date.now()}`,
      listingId,
      buyerId: user.uid,
      buyerName: user.name,
      buyerDept: user.dept,
      buyerContact: info.buyerContact || user.contact,
      sellerContact: sellerContact,
      proposedTime: info.proposedTime,
      proposedLocation: info.proposedLocation,
      buyerMsg: info.buyerMsg,
      status: 'pending',
      createdAt: new Date().toISOString(),
      timeoutAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };

    // 1. Optimistic Update
    listing.status = 'matching';
    this.saveListings(listings);
    this.saveOffers([newOffer, ...offers]);

    this.sendNotification(
      listing.sellerId,
      'kakao',
      `[캠백 알림톡] 신규 매칭 신청 도착! ✨`,
      `${user.name} 님께서 [${listing.title}]에 대한 구매/대여 신청을 보냈습니다. 24시간 이내 수락하지 않으시면 거래 지연 방지 정책에 의해 신청이 자동 취소 조치됩니다. (장소: ${info.proposedLocation})`,
      listingId
    );

    // 2. Server Replication
    fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId,
        buyerId: user.uid,
        proposedTime: info.proposedTime,
        proposedLocation: info.proposedLocation,
        buyerMsg: info.buyerMsg,
        buyerContact: info.buyerContact || user.contact,
      })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));

    return newOffer;
  }

  // Business Action: Accept offer
  static acceptOffer(offerId: string): void {
    const offers = this.getOffers();
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    // 1. Optimistic Update
    offer.status = 'accepted';
    this.saveOffers(offers);

    const listings = this.getListings();
    const listing = listings.find(l => l.id === offer.listingId);
    if (listing) {
      listing.status = 'completed';
      this.saveListings(listings);
    }

    this.addPoints(offer.buyerId, 100);
    if (listing) {
      this.addPoints(listing.sellerId, 100);
    }

    this.sendNotification(
      offer.buyerId,
      'kakao',
      `[캠백 알림톡] 매칭 수락 완료! 🎉`,
      `축하합니다! 판매자 ${listing?.sellerName || '선후배'} 님이 거래 신청을 수락했습니다. 공강 시간 및 장소 조율을 위해 상대 연락처를 비공개 해제합니다. 📞상대 연락처: ${offer.sellerContact}. 매너 있는 거래 부탁드립니다!`,
      offer.listingId
    );

    if (listing) {
      this.sendNotification(
        listing.sellerId,
        'kakao',
        `[캠백 알림톡] 거래 매칭 확정 안내 🎯`,
        `신청을 수락하셨습니다. 매칭된 구매자 ${offer.buyerName} 님의 연락처를 공유합니다. 📞상대 연락처: ${offer.buyerContact}. 장소(${offer.proposedLocation}) 및 약속시간을 다시 한 번 조율하여 교외 유출 없이 든든한 학업 가방을 전달해 주세요!`,
        offer.listingId
      );
    }

    // 2. Server Replication
    fetch('/api/offers/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));
  }

  // Business Action: Decline offer
  static declineOffer(offerId: string): void {
    const offers = this.getOffers();
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    // 1. Optimistic Update
    offer.status = 'declined';
    this.saveOffers(offers);

    const listings = this.getListings();
    const listing = listings.find(l => l.id === offer.listingId);
    if (listing) {
      listing.status = 'available';
      this.saveListings(listings);
    }

    this.sendNotification(
      offer.buyerId,
      'kakao',
      `[캠백 알림톡] 안타깝게도 매칭이 불발되었습니다. 😢`,
      `제출하신 [${listing?.title || '신청 물품'}]에 대한 매칭 요청이 반려되어 매물이 다시 거래 가능 상태로 전환되었습니다. 다른 신규 매물을 탐색해 보거나 새로운 알림을 기다려 주세요.`,
      offer.listingId
    );

    // 2. Server Replication
    fetch('/api/offers/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));
  }

  // Business Action: Fast-travel time to test 24H timeout
  static simulateTimeout(offerId: string): void {
    const offers = this.getOffers();
    const offer = offers.find(o => o.id === offerId);
    if (!offer || offer.status !== 'pending') return;

    // 1. Optimistic Update
    offer.status = 'timeout';
    this.saveOffers(offers);

    const listings = this.getListings();
    const listing = listings.find(l => l.id === offer.listingId);
    if (listing) {
      listing.status = 'available';
      this.saveListings(listings);
    }

    this.sendNotification(
      offer.buyerId,
      'system',
      `[오류/지연] 24시간 타임아웃 안내`,
      `요청하신 [${listing?.title}]의 24시간 대기 한도가 경과되어 학생 안전 직거래 규칙에 따라 자동 취소되었습니다. 미응답 판매자 경고가 누적 반영됩니다.`,
      offer.listingId
    );

    if (listing) {
      this.sendNotification(
        listing.sellerId,
        'system',
        `[경고] 구매 요청 미확인 타임아웃`,
        `이서연 님이 보낸 전공 제안 건이 24시간 이내 응답되지 않아 자동 만료되었습니다. 캠백의 원활한 중고 매칭 거래를 위해 정기적인 사후 확인을 요망합니다.`,
        offer.listingId
      );
    }

    // 2. Server Replication
    fetch('/api/offers/timeout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));
  }

  // Verify Student email
  static verifyUniversityEmail(email: string, studentIdInput?: string): boolean {
    const user = this.getCurrentUser();
    const accounts = this.getAccounts();

    if (!email.includes('@') || !email.endsWith('.ac.kr')) {
      return false;
    }

    // 1. Optimistic Update
    const currentAcc = accounts.find(a => a.uid === user.uid);
    if (currentAcc) {
      currentAcc.email = email;
      currentAcc.verified = true;
      currentAcc.point += 100;
      if (studentIdInput) {
        currentAcc.studentId = studentIdInput;
      }
      this.saveAccounts(accounts);

      this.sendNotification(
        user.uid,
        'system',
        `학교 웹메일 인증 성공 🎉`,
        `인증 성공! 학생 번호와 소속 학과가 연계 등록되어 모든 거래 및 단기 대여 참여가 승인되었습니다. 인증 보너스 100포인트가 지급되었습니다.`
      );

      // 2. Server Replication
      fetch('/api/accounts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email,
          studentId: studentIdInput || user.studentId,
        })
      })
        .then(res => res.json())
        .then(() => this.syncFromServer())
        .catch(err => console.error('Write replication failure:', err));

      return true;
    }
    return false;
  }

  static addPoints(uid: string, value: number): void {
    const accounts = this.getAccounts();
    const acc = accounts.find(a => a.uid === uid);
    if (acc) {
      acc.point += value;
      this.saveAccounts(accounts);
    }

    // Replication
    fetch('/api/accounts/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, value })
    })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Write replication failure:', err));
  }

  static sendNotification(userId: string, type: 'kakao' | 'system', title: string, message: string, relatedListingId?: string): void {
    const notifications = this.getNotifications();
    const newNoti: Notification = {
      id: `noti_${Date.now()}`,
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      relatedListingId,
      read: false,
    };
    this.saveNotifications([newNoti, ...notifications]);

    // Send to server implicitly by doing a general sync check or let backend trigger its own during subroutines.
  }

  // Business Action: Register new real account
  static async registerAccount(data: { name: string; email: string; studentId: string; dept: string; contact: string; password?: string }): Promise<{ success: boolean; message?: string; data?: UniversityAccount }> {
    try {
      const res = await fetch('/api/accounts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        // Fetch fresh accounts on client and update
        await this.syncFromServer();
        // Log them in immediately
        this.setCurrentUser(result.data.uid);
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err: any) {
      return { success: false, message: '서버와 연결을 확인해 주세요. ' + err.message };
    }
  }

  // Business Action: Login with real account
  static async loginAccount(identifier: string, password?: string): Promise<{ success: boolean; message?: string; user?: UniversityAccount }> {
    try {
      const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await res.json();
      if (result.success) {
        this.setCurrentUser(result.user.uid);
        await this.syncFromServer();
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err: any) {
      return { success: false, message: '서버와 연결을 확인해 주세요. ' + err.message };
    }
  }

  static clearAllData(): void {
    localStorage.removeItem('cambag_listings');
    localStorage.removeItem('cambag_offers');
    localStorage.removeItem('cambag_accounts');
    localStorage.removeItem('cambag_notifications');
    localStorage.removeItem('cambag_current_uid');
    
    // Reset database on server
    fetch('/api/reset', { method: 'POST' })
      .then(res => res.json())
      .then(() => this.syncFromServer())
      .catch(err => console.error('Reset replication failure:', err));
  }
}

// Automatically sync states on module load
CambagStore.syncFromServer();

// Trigger background synchronization every 8 seconds for real-time collaboration multiplayer feel
setInterval(() => {
  CambagStore.syncFromServer().catch(() => {});
}, 8000);

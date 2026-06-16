/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

// In-Memory Database containing initial data
import { INITIAL_LISTINGS, INITIAL_OFFERS, INITIAL_ACCOUNTS, INITIAL_NOTIFICATIONS } from './src/mockData';
import { Listing, TradeOffer, UniversityAccount, Notification } from './src/types';

const LISTINGS_FILE = path.join(process.cwd(), 'current_listings.json');
const OFFERS_FILE = path.join(process.cwd(), 'current_offers.json');
const ACCOUNTS_FILE = path.join(process.cwd(), 'current_accounts.json');
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'current_notifications.json');

function loadJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.warn(`Failed to load ${filePath}:`, err);
  }
  return fallback;
}

function saveJSON<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to save ${filePath}:`, err);
  }
}

let listings: Listing[] = loadJSON(LISTINGS_FILE, JSON.parse(JSON.stringify(INITIAL_LISTINGS)));
let offers: TradeOffer[] = loadJSON(OFFERS_FILE, JSON.parse(JSON.stringify(INITIAL_OFFERS)));
let accounts: UniversityAccount[] = loadJSON(ACCOUNTS_FILE, JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)));
let notifications: Notification[] = loadJSON(NOTIFICATIONS_FILE, JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)));

const app = express();
app.use(express.json());

const PORT = 3000;

// HELPER: Send warning/notification to database
function createNotification(userId: string, type: 'kakao' | 'system', title: string, message: string, relatedListingId?: string) {
  const newNoti: Notification = {
    id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    relatedListingId,
    read: false,
  };
  notifications = [newNoti, ...notifications];
  saveJSON(NOTIFICATIONS_FILE, notifications);
  return newNoti;
}

// HELPER: Add points to an account
function addPointsToAccount(uid: string, value: number) {
  const acc = accounts.find(a => a.uid === uid);
  if (acc) {
    acc.point += value;
    saveJSON(ACCOUNTS_FILE, accounts);
  }
}

// REST API Endpoints
app.get('/api/listings', (req, res) => {
  res.json({ success: true, data: listings });
});

app.post('/api/listings', (req, res) => {
  const { title, type, price, category, courseName, professor, isbn, imageUrl, images, description, condition, sellerId } = req.body;
  
  const seller = accounts.find(a => a.uid === sellerId) || accounts[2]; // fallback to active user
  
  const newListing: Listing = {
    id: `list_${Date.now()}`,
    title,
    type,
    price: Number(price),
    category,
    courseName,
    professor,
    isbn,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    images: images || [],
    description,
    condition,
    sellerId: seller.uid,
    sellerName: seller.name,
    sellerDept: seller.dept,
    sellerVerified: seller.verified,
    createdAt: new Date().toISOString(),
    status: 'available',
  };

  listings = [newListing, ...listings];

  // Add 50 environmental points to seller
  addPointsToAccount(seller.uid, 50);

  // Auto-connect supply to textbook of the same course
  if (category === 'supply' && courseName) {
    listings.forEach(item => {
      if (item.category === 'textbook' && item.courseName.trim().toLowerCase() === courseName.trim().toLowerCase()) {
        if (!item.relatedSupplyIds) item.relatedSupplyIds = [];
        if (!item.relatedSupplyIds.includes(newListing.id)) {
          item.relatedSupplyIds.push(newListing.id);
        }
      }
    });
  }

  saveJSON(LISTINGS_FILE, listings);

  res.json({ success: true, data: newListing });
});

app.get('/api/offers', (req, res) => {
  res.json({ success: true, data: offers });
});

app.post('/api/offers', (req, res) => {
  const { listingId, buyerId, proposedTime, proposedLocation, buyerMsg, buyerContact } = req.body;

  const listing = listings.find(l => l.id === listingId);
  const buyer = accounts.find(a => a.uid === buyerId);

  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  if (!buyer) {
    return res.status(404).json({ success: false, message: 'Buyer account not found' });
  }

  const sellerAccount = accounts.find(a => a.uid === listing.sellerId);
  const sellerContact = sellerAccount?.contact || '010-XXXX-XXXX';

  const newOffer: TradeOffer = {
    id: `offer_${Date.now()}`,
    listingId,
    buyerId: buyer.uid,
    buyerName: buyer.name,
    buyerDept: buyer.dept,
    buyerContact: buyerContact || buyer.contact,
    sellerContact: sellerContact,
    proposedTime,
    proposedLocation,
    buyerMsg,
    status: 'pending',
    createdAt: new Date().toISOString(),
    timeoutAt: new Date(Date.now() + 24 * 3600000).toISOString(),
  };

  // Update listing item state
  listing.status = 'matching';
  offers = [newOffer, ...offers];

  saveJSON(LISTINGS_FILE, listings);
  saveJSON(OFFERS_FILE, offers);

  // Send Kakao Alert notification to Seller
  createNotification(
    listing.sellerId,
    'kakao',
    `[캠백 알림톡] 신규 매칭 신청 도착! ✨`,
    `${buyer.name} 님께서 [${listing.title}]에 대한 구매/대여 신청을 보냈습니다. 24시간 이내 수락하지 않으시면 거래 지연 방지 정책에 의해 신청이 자동 취소 조치됩니다. (장소: ${proposedLocation})`,
    listingId
  );

  res.json({ success: true, data: newOffer });
});

app.post('/api/offers/accept', (req, res) => {
  const { offerId } = req.body;
  const offer = offers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' });
  }

  offer.status = 'accepted';
  
  // Find associated listing
  const listing = listings.find(l => l.id === offer.listingId);
  if (listing) {
    listing.status = 'completed';
    // Reward points for recycling
    addPointsToAccount(listing.sellerId, 100);
  }

  // Reward points to buyer
  addPointsToAccount(offer.buyerId, 100);

  // Send Notifications
  createNotification(
    offer.buyerId,
    'kakao',
    `[캠백 알림톡] 매칭 수락 완료! 🎉`,
    `축하합니다! 판매자 ${listing?.sellerName || '선후배'} 님이 거래 신청을 수락했습니다. 공강 시간 및 장소 조율을 위해 상대 연락처를 비공개 해제합니다. 📞상대 연락처: ${offer.sellerContact}. 매너 있는 거래 부탁드립니다!`,
    offer.listingId
  );

  if (listing) {
    createNotification(
      listing.sellerId,
      'kakao',
      `[캠백 알림톡] 거래 매칭 확정 안내 🎯`,
      `신청을 수락하셨습니다. 매칭된 구매자 ${offer.buyerName} 님의 연락처를 공유합니다. 📞상대 연락처: ${offer.buyerContact}. 장소(${offer.proposedLocation}) 및 약속시간을 다시 한 번 조율하여 교외 유출 없이 든든한 학업 가방을 전달해 주세요!`,
      offer.listingId
    );
  }

  saveJSON(LISTINGS_FILE, listings);
  saveJSON(OFFERS_FILE, offers);

  res.json({ success: true, offers, listings, accounts, notifications });
});

app.post('/api/offers/decline', (req, res) => {
  const { offerId } = req.body;
  const offer = offers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' });
  }

  offer.status = 'declined';

  // Restore listing status
  const listing = listings.find(l => l.id === offer.listingId);
  if (listing) {
    listing.status = 'available';
  }

  createNotification(
    offer.buyerId,
    'kakao',
    `[캠백 알림톡] 안타깝게도 매칭이 불발되었습니다. 😢`,
    `제출하신 [${listing?.title || '신청 물품'}]에 대한 매칭 요청이 반려되어 매물이 다시 거래 가능 상태로 전환되었습니다. 다른 신규 매물을 탐색해 보거나 새로운 알림을 기다려 주세요.`,
    offer.listingId
  );

  saveJSON(LISTINGS_FILE, listings);
  saveJSON(OFFERS_FILE, offers);

  res.json({ success: true, offers, listings, notifications });
});

app.post('/api/offers/timeout', (req, res) => {
  const { offerId } = req.body;
  const offer = offers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Offer not found' });
  }

  offer.status = 'timeout';

  const listing = listings.find(l => l.id === offer.listingId);
  if (listing) {
    listing.status = 'available';

    // Warn both parties
    createNotification(
      listing.sellerId,
      'system',
      `[경고] 구매 요청 미확인 타임아웃`,
      `이서연 님이 보낸 전공 제안 건이 24시간 이내 응답되지 않아 자동 만료되었습니다. 캠백의 원활한 중고 매칭 거래를 위해 정기적인 사후 확인을 요망합니다.`,
      offer.listingId
    );
  }

  createNotification(
    offer.buyerId,
    'system',
    `[오류/지연] 24시간 타임아웃 안내`,
    `요청하신 [${listing?.title || '도서'}]의 24시간 대기 한도가 경과되어 학생 안전 직거래 규칙에 따라 자동 취소되었습니다. 미응답 판매자 경고가 누적 반영됩니다.`,
    offer.listingId
  );

  saveJSON(LISTINGS_FILE, listings);
  saveJSON(OFFERS_FILE, offers);

  res.json({ success: true, offers, listings, notifications });
});

app.get('/api/accounts', (req, res) => {
  const queryUids = req.query.uids ? (req.query.uids as string).split(',') : [];
  const defaultUids = ['user_kim', 'user_lee', 'user_test'];
  const allowedUids = new Set([...defaultUids, ...queryUids]);
  const filtered = accounts.filter(a => allowedUids.has(a.uid));
  res.json({ success: true, data: filtered });
});

app.post('/api/accounts/register', (req, res) => {
  const { name, email, studentId, dept, contact, password } = req.body;

  if (!name || !email || !studentId || !dept || !contact || !password) {
    return res.status(400).json({ success: false, message: '모든 입력 필수 필드를 기입해 주십시오.' });
  }

  const exists = accounts.find(a => a.email === email || a.studentId === studentId);
  if (exists) {
    return res.status(400).json({ success: false, message: '이미 등록된 이메일 또는 학번이 있습니다.' });
  }

  const uid = `user_${Date.now()}`;
  const isVerified = email.endsWith('.ac.kr');

  const newAccount: UniversityAccount = {
    uid,
    name,
    email,
    studentId,
    dept,
    verified: isVerified,
    contact,
    point: isVerified ? 180 : 80,
    password,
  };

  accounts.push(newAccount);
  saveJSON(ACCOUNTS_FILE, accounts);

  createNotification(
    uid,
    'system',
    `회원가입을 진심으로 환영합니다! 🎉`,
    `캠백 캠퍼스 직거래 중고 장터 가입이 성공적으로 완료되었습니다! ${isVerified ? '대학교 공식 도메인 메일 가입으로 인증이 즉시 승인되어 100 POINT 보너스가 적립되었습니다!' : '이후에 대학 웹메일(.ac.kr)인증을 하시면 정식 인증 스티커 및 100 POINT를 추가 수령하실 수 있습니다.'}`
  );

  res.json({ success: true, data: newAccount });
});

app.post('/api/accounts/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: '아이디(이메일 또는 학번)와 비밀번호를 입력해 주세요.' });
  }

  const acc = accounts.find(a => a.email === identifier || a.studentId === identifier || a.uid === identifier);
  if (!acc) {
    return res.status(404).json({ success: false, message: '일치하는 캠백 계정이 분류되지 않았습니다.' });
  }

  if (acc.password) {
    if (acc.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 정확하지 않습니다.' });
    }
  }

  res.json({ success: true, user: acc });
});

app.post('/api/accounts/verify', (req, res) => {
  const { uid, email, studentId } = req.body;
  const acc = accounts.find(a => a.uid === uid);
  
  if (!acc) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  acc.email = email;
  acc.verified = true;
  if (studentId) {
    acc.studentId = studentId;
  }
  acc.point += 100;

  saveJSON(ACCOUNTS_FILE, accounts);

  createNotification(
    uid,
    'system',
    `학교 웹메일 인증 성공 🎉`,
    `인증 성공! 학생 번호와 소속 학과가 연계 등록되어 모든 거래 및 단기 대여 참여가 승인되었습니다. 인증 보너스 100포인트가 지급되었습니다.`
  );

  res.json({ success: true, accounts, notifications });
});

app.post('/api/accounts/add-points', (req, res) => {
  const { uid, value } = req.body;
  addPointsToAccount(uid, value);
  res.json({ success: true, accounts });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

app.post('/api/notifications/read', (req, res) => {
  const { notiId } = req.body;
  const noti = notifications.find(n => n.id === notiId);
  if (noti) {
    noti.read = true;
    saveJSON(NOTIFICATIONS_FILE, notifications);
  }
  res.json({ success: true, notifications });
});

app.post('/api/reset', (req, res) => {
  listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
  offers = JSON.parse(JSON.stringify(INITIAL_OFFERS));
  accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
  notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

  saveJSON(LISTINGS_FILE, listings);
  saveJSON(OFFERS_FILE, offers);
  saveJSON(ACCOUNTS_FILE, accounts);
  saveJSON(NOTIFICATIONS_FILE, notifications);

  res.json({ success: true, listings, offers, accounts, notifications });
});

// Start server
async function startServer() {
  // Vite integration middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cambag] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server-side integration:', err);
});

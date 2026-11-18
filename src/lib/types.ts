export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface Member {
  id: string;
  userId: string | null;
  email: string | null;
  fullName: string;
  signCode: string;
  phone: string;
  wishlist: string;
  status: UserStatus;
  createdAt: number;
}

export interface Assignment {
  giverId: string;
  recipientId: string;
}

export interface EventDates {
  registration: string | null;
  draw: string | null;
  giftDay: string | null;
  drawDone: boolean;
}

export interface MonitaRecipient {
  fullName: string;
  signCode: string;
  wishlist: string;
}

export type Panel = 'home' | 'auth' | 'dashboard' | 'admin';

export const EMPTY_DATES: EventDates = {
  registration: null,
  draw: null,
  giftDay: null,
  drawDone: false,
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Хүлээгдэж буй',
  approved: 'Зөвшөөрсөн',
  rejected: 'Татгалзсан',
};

export const ADMIN_PIN = '0494';
export const ADMIN_SIGN_CODE = '1804MB';

export const DROP_OFF = {
  title: 'Ажлын гацуур модны доор',
  note: 'Бэлгээ Soilohгүй шүү! Бэлгээ өгөхөд хүлээн авагчийн нэр болон Sign code-ийг тод тэмдэглэсэн байхыг хүсье.',
};

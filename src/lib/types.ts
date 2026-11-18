export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface Member {
  id: string;
  fullName: string;
  signCode: string;
  phone: string;
  password: string;
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
}

export type Panel = 'home' | 'auth' | 'dashboard' | 'admin';

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Хүлээгдэж буй',
  approved: 'Зөвшөөрсөн',
  rejected: 'Татгалзсан',
};

export const ADMIN_PIN = '0494';
export const ADMIN_SIGN_CODE = '0001BJ';

export const DROP_OFF = {
  title: 'Ажлын гацуур модны доор',
  note: 'Бэлгээ Soilohгүй шүү! Бэлгээ өгөхөд хүлээн авагчийн нэр болон Sign code-ийг тод тэмдэглэсэн байхыг хүсье.',
};

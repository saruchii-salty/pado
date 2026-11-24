export interface CurrencyInfo {
  code: string;
  nameKo: string;
  rate: string;
  change: string;
  isUp: boolean;
  flagType: 'us' | 'jp' | 'eu' | 'gb' | 'ch' | 'ca' | 'au' | 'sg';
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: 'USD',
    nameKo: '미국 달러',
    rate: '1,384.20',
    change: '+0.35%',
    isUp: true,
    flagType: 'us',
  },
  {
    code: 'JPY',
    nameKo: '일본 엔',
    rate: '904.65',
    change: '-0.18%',
    isUp: false,
    flagType: 'jp',
  },
  {
    code: 'EUR',
    nameKo: '유로',
    rate: '1,492.80',
    change: '+0.24%',
    isUp: true,
    flagType: 'eu',
  },
  {
    code: 'GBP',
    nameKo: '영국 파운드',
    rate: '1,758.10',
    change: '+0.41%',
    isUp: true,
    flagType: 'gb',
  },
  {
    code: 'CHF',
    nameKo: '스위스 프랑',
    rate: '1,568.40',
    change: '-0.12%',
    isUp: false,
    flagType: 'ch',
  },
  {
    code: 'CAD',
    nameKo: '캐나다 달러',
    rate: '991.50',
    change: '+0.15%',
    isUp: true,
    flagType: 'ca',
  },
  {
    code: 'AUD',
    nameKo: '호주 달러',
    rate: '901.30',
    change: '-0.29%',
    isUp: false,
    flagType: 'au',
  },
  {
    code: 'SGD',
    nameKo: '싱가포르 달러',
    rate: '1,032.90',
    change: '+0.08%',
    isUp: true,
    flagType: 'sg',
  },
];

export interface ChapterNav {
  id: string;
  label: string;
}

export const NAV_ITEMS: ChapterNav[] = [
  { id: 'chapter-rates', label: '실시간 시세' },
  { id: 'chapter-exchange', label: '즉시 환전' },
  { id: 'chapter-auto', label: '자동 주문' },
  { id: 'chapter-wallet', label: '외화 지갑' },
];

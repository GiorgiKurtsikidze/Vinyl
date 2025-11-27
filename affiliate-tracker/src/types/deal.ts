import { Timestamp } from 'firebase/firestore';

export const DEAL_STATUSES = [
  'Prospecting',
  'Negotiating',
  'Onboarding',
  'Live',
  'Paused',
  'Rejected',
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export interface DealRecord {
  id: string;
  name: string;
  geo: string;
  source: string;
  model: string;
  status: DealStatus;
  details: string;
  next: string;
  createdAt?: Timestamp | { seconds?: number };
}

export type DealInput = Omit<DealRecord, 'id' | 'createdAt'> & {
  createdAt?: Timestamp;
};

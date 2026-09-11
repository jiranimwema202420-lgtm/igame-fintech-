export type WagerStatus = "pending" | "won" | "lost" | "cancelled";

export interface Wager {
  id: string;
  user_id: string;
  amount: number;
  payout: number;
  status: WagerStatus;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  balance: number;
}

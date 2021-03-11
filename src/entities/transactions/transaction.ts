import { ProtocolType } from '../protocolTypes';
import { ParsedAddressAsset } from '../tokens';
import { TransactionStatus } from './transactionStatus';
import { TransactionType } from './transactionType';

export interface RainbowTransaction {
  address: string;
  balance: {
    amount: string;
    display: string;
  } | null;
  dappName?: string; // for walletconnect
  description: string | null;
  from: string | null;
  gasLimit?: string | null;
  gasPrice?: string;
  hash: string | null;
  minedAt: number | null;
  name: string | null;
  native: {
    amount: string;
    display: string;
  };
  nonce: number | null;
  pending: boolean;
  protocol?: ProtocolType | null;
  sourceAmount?: string; // for purchases
  status: TransactionStatus;
  symbol: string | null;
  timestamp?: number; // for purchases
  title: string;
  to: string | null;
  transferId?: string; // for purchases
  type: TransactionType;
}

export interface NewTransaction {
  amount: string | null;
  asset: ParsedAddressAsset | null;
  dappName?: string; // for walletconnect
  from: string | null;
  gasLimit?: string | null;
  gasPrice?: string;
  hash: string | null;
  nonce: number | null;
  protocol?: ProtocolType | null;
  sourceAmount?: string; // for purchases
  status?: TransactionStatus;
  timestamp?: number; // for purchases
  to: string | null;
  transferId?: string; // for purchases
  type?: TransactionType;
}

export interface TokenPrice {
    currency: string;
    price: number;
    date: Date;
};

export enum SwapState {
    IDLE,
    SELECT_FROM_TOKEN,
    SELECT_TO_TOKEN,
    CALCULATING,
    SWAP,
    CONFIRM_SWAP,
    SWAPPING,
    SWAP_SUCCESS,
    SWAP_FAILED,
  }
  
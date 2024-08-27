import React from "react";

interface WalletRowProps {
    className: string;
    key: string;
    amount: number;
    usdValue: string;
    formattedAmount: string;
  }
const WalletRow = (props: WalletRowProps) => {
    return <div>{props.formattedAmount}</div>;
  };

  export default WalletRow;
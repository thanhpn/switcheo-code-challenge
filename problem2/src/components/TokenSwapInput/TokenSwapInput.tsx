import { TokenPrice } from "@/interfaces";
import { useEffect, useState } from "react";
import TokenImage from "../TokenImage/TokenImage";
import { formatCurrency } from "@/utils";

export enum TokenSide {
  FROM,
  TO,
}

interface TokenSwapInputProps {
  title: string;
  amount?: string;
  decimals: number;
  token?: TokenPrice;
  maxAmount: number;
  balance?: number;
  side: TokenSide;
  disable?: boolean; // disable input and select token
  onInputChange: (amount: string, side: TokenSide) => void;
  setIsShowSelectToken: (isShow: boolean) => void;
  onOpenSelectTokenModal: () => void;
}

const TokenSwapInput: React.FC<TokenSwapInputProps> = ({
  title,
  amount,
  decimals,
  token,
  maxAmount,
  balance,
  disable,
  side,
  onInputChange,
  setIsShowSelectToken,
  onOpenSelectTokenModal,
}) => {
  const [error, setError] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);

  // Handle input change event and validate input value
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // avoid default behavior
    e.preventDefault();
    const inputValue = e.target.value;

    // validate input is a positive number
    if (inputValue === "-") {
      e.preventDefault();
      return;
    }

    // Normalize value by replacing commas with dots
    const normalizedValue = inputValue.replace(",", ".");

    // avoid disable
    if (disable) return;

    const parsedValue = parseFloat(normalizedValue);
    // validate input is a number, smaller than maxAmount
    if (token && parsedValue > maxAmount) {
      setError("Amount exceeds balance");
    } else {
      setError("");
    }

    if (!isNaN(parsedValue) && token && parsedValue > 0) {
      setAmountUSD(parseFloat(normalizedValue) * token?.price);
    } else {
      setAmountUSD(0);
    }

    onInputChange(normalizedValue, side);
  };

  useEffect(() => {
    if (token && amount) {
      const amountNum = parseFloat(amount);
      setAmountUSD(amountNum * token.price);
    } else {
      setAmountUSD(0);
    }
  }, [amount, token]);

  // Open select token modal
  const handleOpenSelectToken = () => {
    if (disable) return;

    setError("");
    setIsShowSelectToken(true);
    onOpenSelectTokenModal();
  };

  return (
    <div className="flex flex-col items-center w-full p-3 bg-gray-100 m-1 rounded-2xl pb-6">
      <p className="ml-2 w-full mb-4 text-gray-500 text-sm">{title}</p>
      <div className="flex items-center justify-between w-full">
        <input
          type="number"
          value={amount}
          inputMode="decimal"
          min={"0"}
          placeholder="0"
          maxLength={20}
          disabled={disable}
          pattern="^[0-9]*[.,]?[0-9]*$"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-2/3 border-none text-zinc-900 outline-none text-3xl font-bold pl-2 pt-1 bg-transparent mr-1"
          onChange={handleInput}
        />

        <div
          className={`flex justify-between items-center cursor-pointer hover:opacity-80 py-2 px-3 rounded-3xl ${
            token ? "bg-white" : "bg-pink-600"
          } `}
          onClick={handleOpenSelectToken}
        >
          {token && <TokenImage currency={token?.currency} size={24} />}
          <p
            className={`ml-2 text-sm text-nowrap ${
              token ? "text-black" : "text-white"
            } `}
          >
            {token?.currency || "Select Token"}
          </p>
          <img
            className="ml-2 px-2"
            src={
              token
                ? "/assets/icons/chevron-down-black.svg"
                : "/assets/icons/chevron-down-white.svg"
            }
            alt="arrow-down"
            sizes="18px"
          />
        </div>
      </div>
      <div className="flex items-center justify-between w-full my-3">
        <p className="w-2/3 h-3 text-start text-gray-500 text-sm">
          {`${amountUSD ? formatCurrency(amountUSD) : " -"}`}
        </p>
        {token && balance ? (
          <p className="w-1/3 h-3 text-end text-gray-500 text-sm">
            {`Balance: ${balance ? balance.toFixed(2) : "0"}`}
          </p>
        ) : null}
      </div>
      {error && (
        <p className="w-full text-red-500 text-sm text-left mb-3">{error}</p>
      )}
    </div>
  );
};

export default TokenSwapInput;

import { SwapState, TokenPrice } from "@/interfaces";
import TokenImage from "../TokenImage/TokenImage";
import { use, useMemo } from "react";

interface ConfirmSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: TokenPrice;
  toToken: TokenPrice;
  fromAmount: number;
  toAmount: number;
  status: SwapState;
}

const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  status,
}) => {
  const swapStatus = useMemo(() => {
    switch (status) {
      case SwapState.SWAP:
        return "Swap";
      case SwapState.SWAPPING:
        return "Swapping tokens...";
      case SwapState.SWAP_SUCCESS:
        return `You have successfully swapped ${fromAmount} ${fromToken.currency} to ${toAmount} ${toToken.currency}`;
      case SwapState.SWAP_FAILED:
        return "Swap Failed";
      default:
        return "";
    }
  }, [status]);

  const handleClose = () => {
    if (status === SwapState.SWAPPING) {
      alert("Cannot close while swapping");
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (status === SwapState.CONFIRM_SWAP) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const buttonTitle = useMemo(() => {
    switch (status) {
      case SwapState.CONFIRM_SWAP:
        return "Confirm Swap";
      case SwapState.SWAP:
        return "Swapping";
      case SwapState.SWAPPING:
        return "Swapping";
      case SwapState.SWAP_SUCCESS:
        return "Close";
      case SwapState.SWAP_FAILED:
        return "Close";
      default:
        return "";
    }
  }, [status]);

  const confirmSwapView = () => {
    return (
      <div>
        <div className="flex items-center p-3 justify-between">
          <p className="text-lg font-bold text-black">Review Swap</p>
          <img
            className="hover:bg-gray-50"
            src={"/assets/icons/close.svg"}
            onClick={handleClose}
            alt="Close"
          />
        </div>
        <div className="flex flex-col items-center p-3">
          <div className="flex w-full flex-col">
            <p className="text-sm text-gray-500">Sell</p>
            <div className="flex w-full items-center justify-beween">
              <div className="flex w-full">
                <p className="text-2xl font-bold text-black mx-2">
                  {fromAmount?.toFixed(4)}
                </p>
                <p className="text-2xl font-bold text-black">
                  {fromToken?.currency}
                </p>
              </div>
              <TokenImage currency={fromToken?.currency} size={38} />
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl p-2 border-2 border-white cursor-pointer hover:bg-gray-200">
            <img
              src="/assets/icons/arrow-down.svg"
              alt="swap"
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="flex w-full flex-col">
              <p className="text-sm text-gray-500">Buy</p>
              <div className="flex w-full items-center justify-beween">
                <div className="flex w-full">
                  <p className="text-2xl font-bold text-black mx-2">
                    {toAmount?.toFixed(4)}
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {toToken.currency}
                  </p>
                </div>
                <TokenImage currency={toToken.currency} size={32} />
              </div>
            </div>
          </div>
          <div className="w-full border-t-1 border-gray-300 my-5">
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">Rate</p>
              <p className="text-sm text-black">
                {fromAmount && toAmount
                  ? `1 ${toToken.currency} = ${(toAmount / fromAmount).toFixed(
                      4
                    )} ${fromToken.currency}`
                  : "-"}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">Fee (0.25%)</p>
              <p className="text-sm text-black">$0.1</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">{swapStatus}</p>
          <button
            className={`w-full text-white rounded-xl px-3 py-2 mt-2 ${
              status === SwapState.SWAPPING ? "bg-gray-300" : "bg-blue-500"
            }`}
            onClick={handleConfirm}
          >
            {buttonTitle}
          </button>
        </div>
      </div>
    );
  };

  const swapView = () => {
    return (
      <div className="flex flex-col pb-7">
        <div className="flex items-center p-3 justify-between">
          <p className="text-lg font-bold text-black"></p>
          <img
            className="hover:bg-gray-50"
            src={"/assets/icons/close.svg"}
            onClick={handleClose}
            alt="Close"
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          {status === SwapState.SWAPPING && (
            <img
              src="/assets/icons/loading.svg"
              alt="swap"
              className="w-12 h-12 animate-spin"
            />
          )}
          {status === SwapState.SWAP_SUCCESS && (
            <img
              src="/assets/icons/success.svg"
              alt="swap"
              className="w-12 h-12"
            />
          )}
          {status === SwapState.SWAP_FAILED && (
            <img
              src="/assets/icons/failed.svg"
              alt="swap"
              className="w-12 h-12"
            />
          )}
          <p className="text-sm text-gray-500 mt-2 text-center">{swapStatus}</p>
        </div>
        <div className="flex items-center justify-center p-3">
          <div className="flex items-center justify-center">
            <TokenImage currency={fromToken?.currency} size={18} />
            <p className="text-sm font-bold text-black mx-2">
              {fromAmount?.toFixed(4)}
            </p>
            <p className="text-sm font-bold text-black">
              {fromToken?.currency}
            </p>
          </div>
          <div className="p-2">
            <img
              src="/assets/icons/arrow-down.svg"
              alt="swap"
              className="w-3 h-3 cursor-pointer rotate-[-90deg]"
            />
          </div>
          <div className="flex items-center justify-center">
            <TokenImage currency={toToken.currency} size={18} />
            <p className="text-sm font-bold text-black mx-2">
              {toAmount?.toFixed(4)}
            </p>
            <p className="text-sm font-bold text-black">{toToken.currency}</p>
          </div>
        </div>
        {status === SwapState.SWAPPING && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            {"Process in your wallet"}
          </p>
        )}

        {status === SwapState.SWAP_SUCCESS && (
          <p className="text-sm text-pink-500 mt-2 text-center cursor:pointer">
            {"View on explorer"}
          </p>
        )}
      </div>
    );
  };
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-xl w-96">
        {status === SwapState.CONFIRM_SWAP ? confirmSwapView() : swapView()}
      </div>
    </div>
  );
};

export default ConfirmSwapModal;

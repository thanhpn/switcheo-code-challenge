import {
  AUTO_SLIPPAGE_TOLERANCE,
  DEFAULT_SLIPPAGE_TOLERANCE,
} from "@/constants";
import { useState } from "react";

interface SwappSettingModalProps {
  transactionDeadline: number;
  slippageTolerance: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionDeadline: number, slippageTolerance: number) => void;
}

const SwappSettingModal: React.FC<SwappSettingModalProps> = ({
  transactionDeadline,
  slippageTolerance,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deadline, setDeadline] = useState<string>(
    transactionDeadline.toString()
  );
  const [slippage, setSlippage] = useState<number>(slippageTolerance);
  const [isEditTransactionDeadline, setIsEditTransactionDeadline] =
    useState<boolean>(false);
  const [isEditSlippageTolerance, setIsEditSlippageTolerance] =
    useState<boolean>(false);

  const handleConfirm = () => {
    onConfirm(parseInt(deadline), slippage);
  };

  const handleShowEditTransactionDeadline = () => {
    setIsEditTransactionDeadline(!isEditTransactionDeadline);
  };

  const handleShowEditSlippageTolerance = () => {
    setIsEditSlippageTolerance(!isEditSlippageTolerance);
  };

  const handleChangeSlippageMode = (slippageTolerance: number) => {
    setSlippage(slippageTolerance);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-xl w-96">
        <div className="flex items-center p-3 justify-between">
          <p className="text-lg font-bold text-black">Settings</p>
          <img
            className="hover:bg-gray-50 cursor-pointer"
            src={"/assets/icons/close.svg"}
            onClick={onClose}
          />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between text-gray-900">
            <p className="text-sm ">Transaction deadline</p>
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={handleShowEditTransactionDeadline}
            >
              <p className="text-sm ">{`${deadline}m`}</p>
              <img
                src={"/assets/icons/chevron-down-black.svg"}
                className={`w-3 h-3 m-2 ${
                  isEditTransactionDeadline ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          {isEditTransactionDeadline && (
            <div className="flex justify-end border rounded-2xl border-gray-300 text-black py-2 px-3 m-2">
              <input
                type="number"
                className="w-full focus:outline-none outline-none text-right mr-1"
                autoComplete="off"
                autoCorrect="off"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p>minutes</p>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between text-gray-900">
            <p className="text-sm">Slippage tolerance</p>
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={handleShowEditSlippageTolerance}
            >
              <p className="text-sm ">
                {slippage === AUTO_SLIPPAGE_TOLERANCE
                  ? "Auto"
                  : `${slippage}%`}
              </p>
              <img
                src={"/assets/icons/chevron-down-black.svg"}
                className={`w-3 h-3 m-2 ${
                  isEditSlippageTolerance ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
          {isEditSlippageTolerance && (
            <div className="flex my-2">
              <div className="flex w-1/2 h-10 p-2 border rounded-2xl justify-center items-center border-gray-300 mr-2">
                <div
                  className={`w-1/2 text-gray-900 items-center justify-center rounded-2xl cursor-pointer ${
                    slippage === AUTO_SLIPPAGE_TOLERANCE ? "bg-gray-200" : ""
                  }`}
                  onClick={() =>
                    handleChangeSlippageMode(AUTO_SLIPPAGE_TOLERANCE)
                  }
                >
                  <p className="text-center">Auto</p>
                </div>
                <div
                  className={`w-1/2 text-gray-900 items-center justify-center rounded-2xl cursor-pointer ${
                    slippage !== AUTO_SLIPPAGE_TOLERANCE ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleChangeSlippageMode(0)}
                >
                  <p className="text-center">Custom</p>
                </div>
              </div>
              <div className="flex w-1/2 h-10 justify-end border rounded-2xl border-gray-300 text-black py-2 px-3 ml-2">
                <input
                  type="number"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  min={"0"}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className={`w-1/2 focus:outline-none text-right ${slippage > 50 ? "text-red-500" : "text-gray-900"}`}
                  placeholder={DEFAULT_SLIPPAGE_TOLERANCE.toString()}
                  value={
                    slippage === AUTO_SLIPPAGE_TOLERANCE
                      ? ""
                      : slippage
                  }
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                />
                <p>%</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center p-3">
          <button
            className="w-full bg-pink-500 text-white rounded-xl px-4 py-3"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwappSettingModal;

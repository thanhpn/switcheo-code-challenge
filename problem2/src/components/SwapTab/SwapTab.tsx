export interface SwapTabInfo {
  id: string;
  title: string;
  active: boolean;
}

interface SwapTabProps {
  tab: SwapTabInfo;
  onClick: (tab: SwapTabInfo) => void;
}

const SwapTab: React.FC<SwapTabProps> = ({ tab, onClick }) => {
    const handleSelectTab = () => {
        onClick(tab);
    }
  return (
    <div
      key={tab.id}
      className={`py-1.5 px-3 mr-1 rounded-2xl cursor-pointer ${
        tab.active
          ? "bg-gray-200 opacity-100 text-gray-900"
          : "opacity-60 text-gray-500"
      }`}
      onClick={handleSelectTab}
    >
      {tab.title}
    </div>
  );
};

export default SwapTab;

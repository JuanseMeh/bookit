import { Dispatch, SetStateAction } from 'react';

type Tab = 'services' | 'create' | 'list';

interface TabNavProps {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
}

export default function TabNav({ activeTab, setActiveTab }: TabNavProps) {
  const tabs: Tab[] = ['services', 'create', 'list'];

  return (
    <div className="flex gap-4 mb-6 pb-2 border-b border-[#00aa00]">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-1 font-mono ${activeTab === tab ? 'tab-active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}


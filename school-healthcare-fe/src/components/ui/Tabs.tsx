import { useState, ReactNode } from "react";

export interface Tab {
  key: string;
  label: React.ReactNode; 
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultKey?: string;
  onChange?: (key: string) => void;
}

const Tabs = ({ tabs, defaultKey, onChange }: TabsProps) => {
  const [active, setActive] = useState(defaultKey || tabs[0]?.key);

  const handleClick = (key: string) => {
    setActive(key);
    onChange?.(key); // Gọi callback nếu có
  };

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex space-x-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleClick(tab.key)}
            className={`px-4 py-2 font-medium transition-colors duration-200 ${
              active === tab.key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {tabs.find((tab) => tab.key === active)?.content}
      </div>
    </div>
  );
};

export default Tabs;

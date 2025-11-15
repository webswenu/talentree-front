import { ReactNode } from "react";

interface Tab {
    id: string;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="py-6">{activeTabContent}</div>
        </div>
    );
};

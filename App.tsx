
import React from 'react';
import { useAppContext } from './AppContext.tsx';
import { Sidebar, Header } from './components.tsx';
import { Dashboard, TableManagement, OrderView, MenuManagement, CustomerManagement, StaffManagement, ReportsPage, AISpecials, Settings, DigitalQRMenu } from './pages.tsx';
import type { Page } from './types.ts';

const pageComponents: Record<Page, React.ComponentType<any>> = {
    Dashboard,
    Tables: TableManagement,
    Order: OrderView,
    Menu: MenuManagement,
    Customers: CustomerManagement,
    Staff: StaffManagement,
    Reports: ReportsPage,
    AI_Specials: AISpecials,
    Settings,
    QRMenu: DigitalQRMenu,
};

export default function App() {
    const { state } = useAppContext();
    const ActivePage = pageComponents[state.currentPage];

    if (!ActivePage) {
        return <div>Page not found</div>;
    }

    if (state.currentPage === 'QRMenu') {
        return <ActivePage {...state.activePageProps} />;
    }

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <ActivePage {...state.activePageProps} />
                </div>
            </main>
        </div>
    );
}

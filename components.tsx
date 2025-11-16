
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext.tsx';
import type { Page } from './types.ts';

// --- ICONS ---
const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {children}
    </svg>
);

export const HomeIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></IconWrapper>;
export const TableIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6ZM3.75 12h16.5" /></IconWrapper>;
export const MenuIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></IconWrapper>;
export const SparklesIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></IconWrapper>;
export const CogIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5" /></IconWrapper>;
export const PlusIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></IconWrapper>;
export const XMarkIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></IconWrapper>;
export const TrashIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></IconWrapper>;
export const CurrencyDollarIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.75 11 12 11c-.75 0-1.536.21-2.219.659-.563.42-1.055.966-1.483 1.582M12 6v12" /></IconWrapper>;
export const ClockIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></IconWrapper>;
export const UserCircleIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></IconWrapper>;
export const UsersIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372m-10.5-.372a9.38 9.38 0 0 1 2.625.372M12 18.75v-5.25m-6.938-4.062a9.38 9.38 0 0 1 13.876 0M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /></IconWrapper>;
export const UserGroupIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.75-5.455c.097-.534-.226-1.06-.75-1.282A11.47 11.47 0 0 0 12 12c-1.857 0-3.642-.305-5.25-.865-.524-.222-.847-.748-.75-1.282A9.094 9.094 0 0 0 6 18.72M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm-9 6c0-2.485 2.015-4.5 4.5-4.5h9c2.485 0 4.5 2.015 4.5 4.5v.243c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 18.963v-.243Z" /></IconWrapper>;
export const ChartBarIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></IconWrapper>;
export const BanknotesIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m18 0h-4.5M3.75 6h4.5" /></IconWrapper>;
export const PencilIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></IconWrapper>;
export const QrCodeIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v12A2.25 2.25 0 0 1 18 18.75H6A2.25 2.25 0 0 1 3.75 16.5v-12ZM12 12.75h.007v.008H12v-.008ZM12 9h.007v.008H12V9Zm.75 4.5h.007v.008h-.007v-.008Zm0-3.75h.007v.008h-.007v-.008Zm-3.75 3.75h.007v.008H9v-.008Zm0-3.75h.007v.008H9V9Zm-3.75 3.75h.007v.008H5.25v-.008Zm0-3.75h.007v.008H5.25V9Zm12-3h.007v.008h-.007V6Zm-3.75 0h.007v.008h-.007V6Zm0 3.75h.007v.008h-.007v-.008Zm0 3.75h.007v.008h-.007v-.008Z" /></IconWrapper>;
export const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.84 3.12 1.32 4.79 1.32h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.23 15.25c-.22-.12-.83-.41-1-.47-.15-.06-.26-.09-.38.09-.12.18-.38.47-.46.56-.09.09-.18.1-.33.03-.15-.06-1.28-.47-2.44-1.5-.9-1.15-1.5-2.17-1.75-2.55-.25-.38-.01-.58.09-.68.08-.08.18-.21.27-.31.09-.1.12-.18.18-.3.06-.12.03-.24 0-.33-.03-.09-.38-1.05-.52-1.44-.12-.36-.27-.3-.38-.3h-.38c-.12 0-.3.03-.46.18-.15.15-.58.56-.58 1.38 0 .83.6 1.6.68 1.71.09.12 1.17 1.8 2.83 2.5.38.18.69.28.92.36.4.12.64.1.88.06.27-.04.83-.34.95-.66.12-.33.12-.6.09-.66-.03-.06-.12-.09-.24-.18z"/></svg>;

// --- UI COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className, variant = 'primary', size = 'md', ...props }, ref) => {
        const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
        const variantClasses = {
            primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500',
            secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-sky-500',
        };
        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };
        return (
            <button ref={ref} className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
                {children}
            </button>
        );
    }
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
    <div onClick={onClick} className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg p-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-slate-700/70 hover:border-slate-600' : ''} ${className}`}>
        {children}
    </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 border border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                            <XMarkIcon />
                        </Button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => (
    <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
        <span className="text-white font-medium">{label}</span>
        <div className="relative">
            <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={() => onChange(!enabled)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-sky-500' : 'bg-slate-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </label>
);


// --- LAYOUT COMPONENTS ---

const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode }> = ({ page, label, icon }) => {
    const { state, dispatch } = useAppContext();
    const isActive = state.currentPage === page;
    return (
        <button
            onClick={() => dispatch({ type: 'SET_PAGE', payload: { page } })}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="mr-4">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
};

export const Sidebar: React.FC = () => (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-lg border-r border-slate-800 flex-shrink-0 p-4 flex flex-col justify-between">
        <div>
            <div className="flex items-center mb-8 px-2">
                <SparklesIcon />
                <h1 className="text-2xl font-bold ml-2 text-white">RMS Pro</h1>
            </div>
            <nav className="space-y-2">
                <NavItem page="Dashboard" label="Dashboard" icon={<HomeIcon />} />
                <NavItem page="Tables" label="Tables" icon={<TableIcon />} />
                <NavItem page="Menu" label="Menu" icon={<MenuIcon />} />
                <NavItem page="Customers" label="Customers" icon={<UsersIcon />} />
                <NavItem page="Staff" label="Staff" icon={<UserGroupIcon />} />
                <NavItem page="Reports" label="Reports" icon={<ChartBarIcon />} />
                <NavItem page="AI_Specials" label="AI Specials" icon={<SparklesIcon />} />
            </nav>
        </div>
        <div className="space-y-2">
             <NavItem page="Settings" label="Settings" icon={<CogIcon />} />
             <div className="px-4 py-3 flex items-center">
                <UserCircleIcon />
                <div className="ml-3">
                    <p className="font-semibold text-white">Admin User</p>
                    <p className="text-sm text-slate-400">admin@rmspro.io</p>
                </div>
             </div>
        </div>
    </aside>
);

export const Header: React.FC = () => {
    const { state } = useAppContext();
    const pageTitles: Record<Page, string> = {
        Dashboard: 'Dashboard Overview',
        Tables: 'Table Management',
        Order: 'Order & Billing',
        Menu: 'Menu Management',
        Customers: 'Customer Management',
        Staff: 'Staff Management',
        Reports: 'Reports & Analytics',
        AI_Specials: "Chef's AI Specials",
        Settings: 'System Settings',
        QRMenu: 'Digital Menu',
    };
    return (
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-4">
            <h1 className="text-2xl font-bold text-white">{pageTitles[state.currentPage]}</h1>
        </header>
    );
};

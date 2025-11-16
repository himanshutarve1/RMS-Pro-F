
import React, { createContext, useReducer, useContext, useMemo } from 'react';
import { AppState, AppAction, AppContextType, Table, MenuItem, Order, OrderItem, Category, Customer, Expense, ExpenseCategory, Staff, Tax } from './types.ts';

// --- MOCK DATA ---
const mockTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `T-${i + 1}`,
    capacity: (i % 4 + 1) * 2,
    status: 'Available',
}));

const mockCategories: Category[] = ['Appetizers', 'Soups', 'Salads', 'Main Course', 'Pasta', 'Grill', 'Seafood', 'Sides', 'Desserts', 'Beverages'];

const mockMenuItems: MenuItem[] = [
    { id: 'bev001', name: 'Classic Mojito', category: 'Beverages', price: 349, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1551538850-eff712b341fe?q=80&w=800' },
    { id: 'bev002', name: 'Espresso', category: 'Beverages', price: 149, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1599398054032-fe797479a1f3?q=80&w=800' },
    { id: 'app001', name: 'Bruschetta', category: 'Appetizers', price: 299, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1505253716362-af78f5d115de?q=80&w=800' },
    { id: 'app002', name: 'Garlic Bread', category: 'Appetizers', price: 229, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1627308595182-d721f451b315?q=80&w=800' },
    { id: 'main001', name: 'Margherita Pizza', category: 'Main Course', price: 499, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1598021680133-eb3a1283ad24?q=80&w=800' },
    { id: 'pasta001', name: 'Spaghetti Carbonara', category: 'Pasta', price: 549, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1608796319547-5b68dc454a25?q=80&w=800' },
    { id: 'grill001', name: 'Grilled Salmon', category: 'Grill', price: 899, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800' },
    { id: 'des001', name: 'Tiramisu', category: 'Desserts', price: 329, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800' },
    { id: 'des002', name: 'Chocolate Lava Cake', category: 'Desserts', price: 349, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1586985289933-60a92a525145?q=80&w=800' },
];

const mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'John Doe', phone: '1234567890', totalSpent: 12550, visits: 5, lastVisit: new Date('2024-05-10') },
    { id: 'cust-2', name: 'Jane Smith', phone: '0987654321', totalSpent: 5800, visits: 2, lastVisit: new Date('2024-05-15') },
];

const mockExpenses: Expense[] = [
    { id: 'exp-1', description: 'Electricity Bill', amount: 5000, category: 'Utilities', date: new Date() },
    { id: 'exp-2', description: 'Vegetable Purchase', amount: 8500, category: 'Supplies', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
];

const mockStaff: Staff[] = [
    { id: 'staff-1', name: 'Alice Johnson', role: 'Admin', phone: '555-0101', email: 'alice@rmspro.io', salary: 75000, isActive: true },
    { id: 'staff-2', name: 'Bob Williams', role: 'Cashier', phone: '555-0102', email: 'bob@rmspro.io', salary: 40000, isActive: true },
    { id: 'staff-3', name: 'Charlie Brown', role: 'Waiter', phone: '555-0103', email: 'charlie@rmspro.io', salary: 35000, isActive: false },
    { id: 'staff-4', name: 'Diana Prince', role: 'Kitchen Staff', phone: '555-0104', email: 'diana@rmspro.io', salary: 45000, isActive: true },
];

const mockTaxes: Tax[] = [
    { id: 'tax-1', name: 'GST', rate: 18, enabled: true },
    { id: 'tax-2', name: 'Service Charge', rate: 5, enabled: false },
];

// --- INITIAL STATE ---
const initialState: AppState = {
    currentPage: 'Dashboard',
    activePageProps: null,
    tables: mockTables,
    menu: mockMenuItems,
    menuCategories: mockCategories,
    taxes: mockTaxes,
    orders: [],
    completedOrders: [],
    creditRecords: [],
    customers: mockCustomers,
    staff: mockStaff,
    expenses: mockExpenses,
    activeOrderId: null,
    totalSales: 45250.50, // Some initial mock sales
};

const calculateTotals = (order: Order, taxes: Tax[]): Order => {
    const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    const totalTaxAmount = taxes
        .filter(tax => tax.enabled)
        .reduce((sum, tax) => sum + (subtotal * (tax.rate / 100)), 0);
        
    const total = subtotal + totalTaxAmount;
    
    return { ...order, subtotal, tax: totalTaxAmount, total };
};

// --- REDUCER ---
const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_PAGE': {
            const { page, orderId = null, props = null } = action.payload;
            return { ...state, currentPage: page, activeOrderId: orderId, activePageProps: props };
        }

        case 'UPDATE_TABLE_STATUS': {
            const { tableId, status } = action.payload;
            return {
                ...state,
                tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t),
            };
        }

        case 'ADD_ITEM_TO_ORDER': {
            if (!state.activeOrderId) return state;
            const activeOrder = state.orders.find(o => o.id === state.activeOrderId);
            if (!activeOrder) return state;

            const itemToAdd = state.menu.find(m => m.id === action.payload.itemId);
            if (!itemToAdd || itemToAdd.stock <= 0) return state;

            const existingItem = activeOrder.items.find(i => i.id === itemToAdd.id);
            let newItems: OrderItem[];

            if (existingItem) {
                newItems = activeOrder.items.map(i => i.id === itemToAdd.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newItems = [...activeOrder.items, { ...itemToAdd, quantity: 1 }];
            }
            
            const newMenu = state.menu.map(m => m.id === itemToAdd.id ? {...m, stock: m.stock - 1} : m);

            const updatedOrder = { ...activeOrder, items: newItems };
            const finalOrder = calculateTotals(updatedOrder, state.taxes);

            return {
                ...state,
                menu: newMenu,
                orders: state.orders.map(o => o.id === state.activeOrderId ? finalOrder : o),
            };
        }

        case 'UPDATE_ITEM_QUANTITY': {
            if (!state.activeOrderId) return state;
            const activeOrder = state.orders.find(o => o.id === state.activeOrderId);
            if (!activeOrder) return state;

            const { itemId, quantity } = action.payload;
            const itemInOrder = activeOrder.items.find(i => i.id === itemId);
            const itemInMenu = state.menu.find(m => m.id === itemId);
            if (!itemInOrder || !itemInMenu) return state;

            const quantityDiff = quantity - itemInOrder.quantity;
            if (itemInMenu.stock < quantityDiff) return state; // Not enough stock

            let newItems: OrderItem[];
            if (quantity <= 0) {
                newItems = activeOrder.items.filter(i => i.id !== itemId);
            } else {
                newItems = activeOrder.items.map(i => i.id === itemId ? { ...i, quantity } : i);
            }
            
            const newMenu = state.menu.map(m => m.id === itemId ? {...m, stock: m.stock - quantityDiff} : m);

            const updatedOrder = { ...activeOrder, items: newItems };
            const finalOrder = calculateTotals(updatedOrder, state.taxes);

            return {
                ...state,
                menu: newMenu,
                orders: state.orders.map(o => o.id === state.activeOrderId ? finalOrder : o),
            };
        }
        
        case 'REMOVE_ITEM_FROM_ORDER': {
            if (!state.activeOrderId) return state;
            const activeOrder = state.orders.find(o => o.id === state.activeOrderId);
            if (!activeOrder) return state;
            
            const itemToRemove = activeOrder.items.find(i => i.id === action.payload.itemId);
            if(!itemToRemove) return state;

            const newItems = activeOrder.items.filter(i => i.id !== action.payload.itemId);
            const newMenu = state.menu.map(m => m.id === action.payload.itemId ? {...m, stock: m.stock + itemToRemove.quantity} : m);

            const updatedOrder = { ...activeOrder, items: newItems };
            const finalOrder = calculateTotals(updatedOrder, state.taxes);

            return {
                ...state,
                menu: newMenu,
                orders: state.orders.map(o => o.id === state.activeOrderId ? finalOrder : o),
            };
        }

        case 'ADD_MENU_ITEM': {
            return {
                ...state,
                menu: [...state.menu, action.payload],
            };
        }

        case 'FINALIZE_BILL': {
            const order = state.orders.find(o => o.id === action.payload.orderId);
            if (!order) return state;

            let updatedCustomers = [...state.customers];
            if (order.customerPhone && order.customerName) {
                const existingCustomerIndex = state.customers.findIndex(c => c.phone === order.customerPhone);

                if (existingCustomerIndex > -1) {
                    const existingCustomer = state.customers[existingCustomerIndex];
                    const updatedCustomer = {
                        ...existingCustomer,
                        visits: existingCustomer.visits + 1,
                        totalSpent: existingCustomer.totalSpent + order.total,
                        lastVisit: new Date(),
                        name: order.customerName,
                    };
                    updatedCustomers[existingCustomerIndex] = updatedCustomer;
                } else {
                    const newCustomer: Customer = {
                        id: `cust-${Date.now()}`,
                        name: order.customerName,
                        phone: order.customerPhone,
                        visits: 1,
                        totalSpent: order.total,
                        lastVisit: new Date(),
                    };
                    updatedCustomers.push(newCustomer);
                }
            }

            return {
                ...state,
                totalSales: state.totalSales + order.total,
                orders: state.orders.filter(o => o.id !== action.payload.orderId),
                completedOrders: [...state.completedOrders, order],
                tables: state.tables.map(t => t.id === order.tableId ? { ...t, status: 'Available' } : t),
                activeOrderId: null,
                currentPage: 'Tables',
                customers: updatedCustomers,
            };
        }

        case 'MOVE_TO_CREDIT': {
            const order = state.orders.find(o => o.id === action.payload.orderId);
            if (!order) return state;

            let updatedCustomers = [...state.customers];
            if (order.customerPhone && order.customerName) {
                const existingCustomerIndex = state.customers.findIndex(c => c.phone === order.customerPhone);
                if (existingCustomerIndex > -1) {
                    const existingCustomer = state.customers[existingCustomerIndex];
                    const updatedCustomer = {
                        ...existingCustomer,
                        visits: existingCustomer.visits + 1,
                        lastVisit: new Date(),
                        name: order.customerName,
                    };
                    updatedCustomers[existingCustomerIndex] = updatedCustomer;
                } else {
                    const newCustomer: Customer = {
                        id: `cust-${Date.now()}`,
                        name: order.customerName,
                        phone: order.customerPhone,
                        visits: 1,
                        totalSpent: 0,
                        lastVisit: new Date(),
                    };
                    updatedCustomers.push(newCustomer);
                }
            }

            return {
                ...state,
                orders: state.orders.filter(o => o.id !== action.payload.orderId),
                creditRecords: [...state.creditRecords, order],
                tables: state.tables.map(t => t.id === order.tableId ? { ...t, status: 'Available' } : t),
                activeOrderId: null,
                currentPage: 'Tables',
                customers: updatedCustomers,
            };
        }

        case 'UPDATE_CUSTOMER_DETAILS': {
            if (!state.activeOrderId) return state;
            const { name, phone } = action.payload;
            return {
                ...state,
                orders: state.orders.map(o =>
                    o.id === state.activeOrderId
                        ? { ...o, customerName: name, customerPhone: phone }
                        : o
                ),
            };
        }

        case 'ADD_EXPENSE': {
            return {
                ...state,
                expenses: [action.payload, ...state.expenses],
            };
        }

        case 'ADD_CUSTOMER': {
            const { name, phone } = action.payload;
            if (state.customers.some(c => c.phone === phone)) {
                alert('A customer with this phone number already exists.');
                return state;
            }
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                name,
                phone,
                totalSpent: 0,
                visits: 0,
                lastVisit: new Date(),
            };
            return {
                ...state,
                customers: [newCustomer, ...state.customers],
            };
        }

        case 'ADD_STAFF': {
            const newStaffMember: Staff = {
                ...action.payload,
                id: `staff-${Date.now()}`,
                isActive: true,
            };
            return {
                ...state,
                staff: [newStaffMember, ...state.staff],
            };
        }

        case 'TOGGLE_STAFF_STATUS': {
            return {
                ...state,
                staff: state.staff.map(s =>
                    s.id === action.payload.staffId ? { ...s, isActive: !s.isActive } : s
                ),
            };
        }

        case 'ADD_CATEGORY': {
            const { categoryName } = action.payload;
            if (!categoryName || state.menuCategories.find(c => c.toLowerCase() === categoryName.toLowerCase())) {
                alert('Category already exists or is empty.');
                return state;
            }
            return {
                ...state,
                menuCategories: [...state.menuCategories, categoryName],
            };
        }

        case 'DELETE_CATEGORY': {
            const { categoryName } = action.payload;
            const isUsed = state.menu.some(item => item.category === categoryName);
            if (isUsed) {
                alert(`Cannot delete category "${categoryName}" as it is currently being used by menu items.`);
                return state;
            }
            return {
                ...state,
                menuCategories: state.menuCategories.filter(c => c !== categoryName),
            };
        }

        case 'ADD_TAX': {
            const { name, rate } = action.payload;
            if (!name || rate < 0) {
                alert('Invalid tax name or rate.');
                return state;
            }
            if (state.taxes.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                alert('A tax with this name already exists.');
                return state;
            }
            const newTax: Tax = {
                id: `tax-${Date.now()}`,
                name,
                rate,
                enabled: true,
            };
            return {
                ...state,
                taxes: [...state.taxes, newTax],
            };
        }
        case 'DELETE_TAX': {
            return {
                ...state,
                taxes: state.taxes.filter(t => t.id !== action.payload.taxId),
            };
        }
        case 'TOGGLE_TAX_STATUS': {
            return {
                ...state,
                taxes: state.taxes.map(t =>
                    t.id === action.payload.taxId ? { ...t, enabled: !t.enabled } : t
                ),
            };
        }
        
        case 'ADD_TABLE': {
            const { name, capacity } = action.payload;
            if (!name || capacity <= 0) {
                alert('Invalid table name or capacity.');
                return state;
            }
            if (state.tables.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                alert('A table with this name already exists.');
                return state;
            }
            const newTable: Table = {
                id: Date.now(), // simple unique id
                name,
                capacity,
                status: 'Available',
            };
            return {
                ...state,
                tables: [...state.tables, newTable],
            };
        }

        case 'DELETE_TABLE': {
            const tableToDelete = state.tables.find(t => t.id === action.payload.tableId);
            if (tableToDelete && tableToDelete.status !== 'Available') {
                alert('Cannot delete a table that is currently occupied or reserved.');
                return state;
            }
            return {
                ...state,
                tables: state.tables.filter(t => t.id !== action.payload.tableId),
            };
        }

        default:
            return state;
    }
};

// --- CONTEXT & PROVIDER ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Memoize dispatch to prevent re-renders of consumers that only use dispatch
    const memoizedDispatch = useMemo(() => {
        // This is a custom dispatch that can handle creating an order implicitly
        const customDispatch: React.Dispatch<AppAction> = (action) => {
            if (action.type === 'SET_PAGE' && action.payload.page === 'Order' && !action.payload.orderId) {
                // This case is for creating a new order from the table page
                // We need a tableId, which isn't in the action. This logic is now handled in TableManagement.
                // This is a safeguard.
                console.error("Order creation must be handled with a tableId.");
                return;
            }
            dispatch(action);
        };
        return customDispatch;
    }, []);

    const value = { state, dispatch };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

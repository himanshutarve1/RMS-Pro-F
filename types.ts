
export type Page = 'Dashboard' | 'Tables' | 'Order' | 'Menu' | 'Customers' | 'Staff' | 'Reports' | 'AI_Specials' | 'Settings' | 'QRMenu';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved';

export interface Table {
    id: number;
    name: string;
    capacity: number;
    status: TableStatus;
}

export type Category = string;

export interface MenuItem {
    id: string;
    name: string;
    category: Category;
    price: number;
    stock: number; // 0 means out of stock
    imageUrl: string;
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export interface Tax {
    id: string;
    name: string;
    rate: number; // as a percentage
    enabled: boolean;
}

export interface Order {
    id: string;
    tableId: number;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    createdAt: Date;
    customerName?: string;
    customerPhone?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    totalSpent: number;
    visits: number;
    lastVisit: Date;
}

export type ExpenseCategory = 'Utilities' | 'Rent' | 'Salaries' | 'Supplies' | 'Marketing' | 'Other';

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
}

export type StaffRole = 'Admin' | 'Cashier' | 'Waiter' | 'Kitchen Staff' | 'Inventory Manager';

export interface Staff {
    id: string;
    name: string;
    role: StaffRole;
    phone: string;
    email: string;
    salary: number;
    isActive: boolean;
}

export interface AppState {
    currentPage: Page;
    activePageProps: Record<string, any> | null;
    tables: Table[];
    menu: MenuItem[];
    menuCategories: string[];
    taxes: Tax[];
    orders: Order[];
    completedOrders: Order[];
    creditRecords: Order[];
    customers: Customer[];
    staff: Staff[];
    expenses: Expense[];
    activeOrderId: string | null;
    totalSales: number;
}

export type AppAction =
    | { type: 'SET_PAGE'; payload: { page: Page; orderId?: string | null; props?: Record<string, any> | null } }
    | { type: 'UPDATE_TABLE_STATUS'; payload: { tableId: number; status: TableStatus } }
    | { type: 'ADD_ITEM_TO_ORDER'; payload: { itemId: string } }
    | { type: 'UPDATE_ITEM_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'REMOVE_ITEM_FROM_ORDER'; payload: { itemId: string } }
    | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
    | { type: 'FINALIZE_BILL'; payload: { orderId: string } }
    | { type: 'UPDATE_CUSTOMER_DETAILS'; payload: { name: string; phone: string } }
    | { type: 'MOVE_TO_CREDIT'; payload: { orderId: string } }
    | { type: 'ADD_EXPENSE'; payload: Expense }
    | { type: 'ADD_CUSTOMER'; payload: { name: string; phone: string } }
    | { type: 'ADD_STAFF'; payload: Omit<Staff, 'id' | 'isActive'> }
    | { type: 'TOGGLE_STAFF_STATUS'; payload: { staffId: string } }
    | { type: 'ADD_CATEGORY'; payload: { categoryName: string } }
    | { type: 'DELETE_CATEGORY'; payload: { categoryName: string } }
    | { type: 'ADD_TAX'; payload: { name: string; rate: number } }
    | { type: 'DELETE_TAX'; payload: { taxId: string } }
    | { type: 'TOGGLE_TAX_STATUS'; payload: { taxId: string } }
    | { type: 'ADD_TABLE'; payload: { name: string; capacity: number } }
    | { type: 'DELETE_TABLE'; payload: { tableId: number } };

export interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

export interface SpecialDish {
    name: string;
    description: string;
    price: number;
    ingredients: string[];
}

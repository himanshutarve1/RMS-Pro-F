
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppContext } from './AppContext.tsx';
import { generateChefSpecials } from './GeminiService.ts';
import { Card, Button, Modal, PlusIcon, TrashIcon, CurrencyDollarIcon, ClockIcon, SparklesIcon, MenuIcon, WhatsAppIcon, BanknotesIcon, ToggleSwitch, QrCodeIcon } from './components.tsx';
import type { Table, MenuItem, Order, SpecialDish, Category, Customer, Expense, ExpenseCategory, Staff, StaffRole, AppAction, Tax } from './types.ts';

// --- DASHBOARD PAGE ---
export const Dashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState<{description: string; amount: number; category: ExpenseCategory}>({ description: '', amount: 0, category: 'Other' });

    const occupiedTables = state.tables.filter(t => t.status === 'Occupied').length;
    const activeOrders = state.orders.length;

    const today = new Date();
    const totalExpensesToday = state.expenses
        .filter(e => e.date.toDateString() === today.toDateString())
        .reduce((sum, e) => sum + e.amount, 0);

    const stats = [
        { label: 'Total Sales Today', value: `₹${state.totalSales.toFixed(2)}`, icon: <CurrencyDollarIcon /> },
        { label: 'Expenses Today', value: `₹${totalExpensesToday.toFixed(2)}`, icon: <BanknotesIcon /> },
        { label: 'Occupied Tables', value: `${occupiedTables} / ${state.tables.length}`, icon: <ClockIcon /> },
        { label: 'Active Orders', value: activeOrders, icon: <MenuIcon /> },
    ];

    const handleAddExpense = () => {
        if (newExpense.description && newExpense.amount > 0) {
            dispatch({
                type: 'ADD_EXPENSE',
                payload: {
                    ...newExpense,
                    id: `exp-${Date.now()}`,
                    date: new Date(),
                }
            });
            setExpenseModalOpen(false);
            setNewExpense({ description: '', amount: 0, category: 'Other' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="flex items-center p-6">
                        <div className={`p-3 rounded-lg ${index === 1 ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400'}`}>{stat.icon}</div>
                        <div className="ml-4">
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <p className="text-slate-400">Activity feed placeholder. Future implementation could show recent orders, low stock alerts, etc.</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center">
                     <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                     <Button onClick={() => setExpenseModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Expense
                     </Button>
                </Card>
            </div>
            <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add New Expense">
                <div className="space-y-4">
                    <input type="text" placeholder="Expense Description" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})} className="w-full bg-slate-700 rounded px-3 py-2 text-white">
                        <option>Utilities</option>
                        <option>Rent</option>
                        <option>Salaries</option>
                        <option>Supplies</option>
                        <option>Marketing</option>
                        <option>Other</option>
                    </select>
                    <input type="number" placeholder="Amount" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <Button onClick={handleAddExpense} className="w-full">Add Expense</Button>
                </div>
            </Modal>
        </motion.div>
    );
};

// --- TABLE MANAGEMENT PAGE ---
export const TableManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const openQrModal = (table: Table, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the table click handler
        setSelectedTable(table);
        setQrModalOpen(true);
    };

    const handleTableClick = (table: Table) => {
        let orderId = state.orders.find(o => o.tableId === table.id)?.id;

        if (table.status === 'Available') {
            orderId = `ord-${Date.now()}`;
            const newOrder: Order = {
                id: orderId,
                tableId: table.id,
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                createdAt: new Date(),
                customerName: '',
                customerPhone: '',
            };
            // This is a bit of a hack to add to state without a dedicated action
            // A proper implementation would have a CREATE_ORDER action
            state.orders.push(newOrder);
            dispatch({ type: 'UPDATE_TABLE_STATUS', payload: { tableId: table.id, status: 'Occupied' } });
        }
        
        if (orderId) {
            dispatch({ type: 'SET_PAGE', payload: { page: 'Order', orderId } });
        }
    };

    const getStatusClasses = (status: Table['status']) => {
        switch (status) {
            case 'Available': return 'border-green-500/50 bg-green-500/10 text-green-400';
            case 'Occupied': return 'border-red-500/50 bg-red-500/10 text-red-400';
            case 'Reserved': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {state.tables.map(table => (
                    <Card
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`relative aspect-square flex flex-col items-center justify-center text-center border-2 ${getStatusClasses(table.status)} hover:!border-sky-500`}
                    >
                        <button 
                            onClick={(e) => openQrModal(table, e)} 
                            className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/50 hover:bg-slate-700 transition-colors"
                            title="Show QR Code"
                        >
                            <QrCodeIcon className="h-5 w-5 text-slate-300" />
                        </button>
                        <p className="text-3xl font-bold text-white">{table.name}</p>
                        <p className="text-sm">{table.capacity} seats</p>
                        <p className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusClasses(table.status).replace('border-','bg-')}`}>{table.status}</p>
                    </Card>
                ))}
            </div>
             <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`QR Menu for ${selectedTable?.name}`}>
                {selectedTable && (
                    <div className="text-center">
                        <p className="text-slate-300 mb-4">Scan this code with your phone to view the menu for this table.</p>
                        <div className="flex justify-center bg-white p-4 rounded-lg">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + `?page=QRMenu&tableId=${selectedTable.id}`)}`} 
                                alt={`QR Code for ${selectedTable.name}`} 
                            />
                        </div>
                        <Button 
                            className="mt-6 w-full" 
                            onClick={() => {
                                dispatch({ type: 'SET_PAGE', payload: { page: 'QRMenu', props: { tableId: selectedTable.id } } });
                                setQrModalOpen(false);
                            }}
                        >
                            View Menu (Simulate Scan)
                        </Button>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};

const generateAndSendBill = (order: Order, table: Table, taxes: Tax[]) => {
    if (!order.customerName || !order.customerPhone) {
        alert("Please add customer name and phone number to send the bill via WhatsApp.");
        return false; // Indicate failure
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("RMS Pro - Tax Invoice", 14, 22);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 32);
    doc.text(`Table: ${table.name}`, 14, 38);
    doc.text(`Date: ${order.createdAt.toLocaleString()}`, 14, 44);
    
    doc.text(`Customer: ${order.customerName}`, 140, 38);
    doc.text(`Phone: ${order.customerPhone}`, 140, 44);

    // Table
    autoTable(doc, {
        startY: 50,
        head: [['Item', 'Qty', 'Rate', 'Amount']],
        body: order.items.map(item => [
            item.name,
            item.quantity,
            `₹${item.price.toFixed(2)}`,
            `₹${(item.price * item.quantity).toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] } // slate-800
    });

    // Totals
    let finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, 14, finalY + 10);
    finalY += 10;

    taxes.filter(t => t.enabled).forEach(tax => {
        const taxAmount = order.subtotal * (tax.rate / 100);
        doc.text(`${tax.name} (${tax.rate}%):`, 14, finalY + 6);
        doc.text(`₹${taxAmount.toFixed(2)}`, 150, finalY + 6, { align: 'right' });
        finalY += 6;
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ₹${order.total.toFixed(2)}`, 14, finalY + 8);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for dining with us!", 105, finalY + 24, { align: 'center' });

    // Simulate sending by opening the PDF in a new tab.
    doc.output('dataurlnewwindow');
    
    alert(`Bill for ${order.customerName} has been generated and sent via WhatsApp.`);
    return true; // Indicate success
};


// --- ORDER VIEW PAGE ---
export const OrderView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isBillModalOpen, setBillModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const activeOrder = useMemo(() => state.orders.find(o => o.id === state.activeOrderId), [state.orders, state.activeOrderId]);
    const table = useMemo(() => state.tables.find(t => t.id === activeOrder?.tableId), [state.tables, activeOrder]);

    const filteredMenu = useMemo(() => {
        return state.menu.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [state.menu, searchTerm]);

    const menuByCategory = useMemo(() => {
        return filteredMenu.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<Category, MenuItem[]>);
    }, [filteredMenu]);

    if (!activeOrder || !table) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-400">No active order selected. Please select a table first.</p>
                <Button className="mt-4" onClick={() => dispatch({ type: 'SET_PAGE', payload: { page: 'Tables' } })}>
                    Go to Tables
                </Button>
            </div>
        );
    }

    const BillModalContent: React.FC<{ order: Order; table: Table; onClose: () => void; dispatch: React.Dispatch<AppAction> }> = ({ order, table, onClose, dispatch }) => {
        const { state } = useAppContext();
        const [view, setView] = useState<'preview' | 'payment_options' | 'qr' | 'split'>('preview');
        const [splitWays, setSplitWays] = useState(2);

        const handleFinalize = () => {
            dispatch({ type: 'FINALIZE_BILL', payload: { orderId: order.id } });
            onClose();
        };

        const handleCredit = () => {
            dispatch({ type: 'MOVE_TO_CREDIT', payload: { orderId: order.id } });
            onClose();
        };
        
        const handleSendAndFinalize = () => {
            const success = generateAndSendBill(order, table, state.taxes);
            if (success) {
                handleFinalize();
            }
        };

        if (view === 'qr') {
            const upiLink = `upi://pay?pa=restaurant@example&pn=RMS%20Pro&am=${order.total.toFixed(2)}&cu=INR`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
            return (
                <div>
                    <h3 className="text-center font-bold text-white">Scan to Pay</h3>
                    <div className="flex justify-center my-4">
                        <img src={qrCodeUrl} alt="UPI QR Code" className="rounded-lg bg-white p-2" />
                    </div>
                    <p className="text-center text-2xl font-bold text-white">₹{order.total.toFixed(2)}</p>
                    <p className="text-center text-sm text-slate-400 mb-4">Scan using any UPI app</p>
                    <div className="flex flex-col space-y-2">
                        <Button onClick={handleFinalize} size="lg">Confirm Payment Received</Button>
                        <Button variant="secondary" onClick={() => setView('payment_options')}>Back to Options</Button>
                    </div>
                </div>
            );
        }

        if (view === 'split') {
            return (
                <div>
                    <div className="space-y-2 font-medium mb-4 text-center">
                        <p className="text-slate-400">Total Bill</p>
                        <p className="text-white text-3xl font-bold">₹{order.total.toFixed(2)}</p>
                    </div>
                     <div className="flex items-center justify-center gap-4 my-6">
                        <Button variant="secondary" onClick={() => setSplitWays(w => Math.max(2, w - 1))}>-</Button>
                        <span className="text-lg font-semibold">Split by {splitWays}</span>
                        <Button variant="secondary" onClick={() => setSplitWays(w => w + 1)}>+</Button>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg text-center">
                        <p className="text-slate-400">Each person pays</p>
                        <p className="text-2xl font-bold text-sky-400">₹{(order.total / splitWays).toFixed(2)}</p>
                    </div>
                    <div className="mt-6 space-y-2">
                        <Button onClick={handleFinalize} className="w-full">Confirm All Payments Received</Button>
                        <Button variant="ghost" className="w-full" onClick={() => setView('payment_options')}>Back to Payment Options</Button>
                    </div>
                </div>
            );
        }

        if (view === 'payment_options') {
            return (
                 <div>
                    <div className="space-y-2 font-medium mb-4">
                        <div className="flex justify-between text-white text-2xl font-bold"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
                    </div>
                    <div className="border-t border-slate-700 my-4"></div>
                    <h3 className="font-semibold text-white mb-3 text-center">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" onClick={handleFinalize}>Cash</Button>
                        <Button variant="secondary" onClick={handleFinalize}>Card</Button>
                        <Button variant="secondary" onClick={handleFinalize}>UPI</Button>
                        <Button variant="secondary" onClick={() => setView('qr')}>QR Code</Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                         <Button variant="secondary" onClick={() => setView('split')}>Split Bill</Button>
                         <Button variant="danger" onClick={handleCredit}>Move to Credit</Button>
                    </div>
                     <Button variant="ghost" className="w-full mt-4" onClick={() => setView('preview')}>Back to Preview</Button>
                </div>
            )
        }

        return (
            <div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6 max-h-96 overflow-y-auto">
                    <h3 className="text-center font-bold text-lg text-white mb-2">RMS Pro - Invoice</h3>
                    <div className="text-xs text-slate-400 mb-4 text-center">
                        <p>Order ID: {order.id}</p>
                        <p>Table: {table.name} | Date: {order.createdAt.toLocaleDateString()}</p>
                        <p>Customer: {order.customerName || 'N/A'} ({order.customerPhone || 'N/A'})</p>
                    </div>
                    <div className="border-t border-dashed border-slate-600 my-2"></div>
                    <div className="space-y-1 text-sm">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-slate-600 my-2"></div>
                    <div className="space-y-1 text-sm font-medium">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                        {state.taxes.filter(t => t.enabled).map(tax => {
                            const taxAmount = order.subtotal * (tax.rate / 100);
                            return (
                                <div key={tax.id} className="flex justify-between">
                                    <span>{tax.name} ({tax.rate}%)</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between text-white text-lg font-bold mt-1"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Button onClick={handleSendAndFinalize} className="w-full" size="lg">
                        <WhatsAppIcon /> <span className="ml-2">Send & Finalize</span>
                    </Button>
                    <Button variant="secondary" onClick={() => setView('payment_options')} className="w-full">
                        Settle Manually
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        Cancel
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-65px)]">
            {/* Menu Items */}
            <div className="lg:col-span-2 bg-slate-900/50 p-4 overflow-y-auto">
                <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 mb-4 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                />
                <div className="space-y-6">
                    {Object.entries(menuByCategory).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-xl font-semibold text-white mb-3">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {items.map(item => (
                                    <Card key={item.id} className="!p-0 flex flex-col">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-t-lg" />
                                        <div className="p-3 flex-grow flex flex-col">
                                            <h4 className="font-bold text-white flex-grow">{item.name}</h4>
                                            <p className="text-sm text-slate-400">₹{item.price.toFixed(2)}</p>
                                            <p className={`text-xs font-bold ${item.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                            </p>
                                            <Button
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={() => dispatch({ type: 'ADD_ITEM_TO_ORDER', payload: { itemId: item.id } })}
                                                disabled={item.stock <= 0}
                                            >
                                                <PlusIcon className="h-4 w-4 mr-1" /> Add
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Ticket */}
            <div className="lg:col-span-1 bg-slate-800/70 p-4 flex flex-col h-full border-l border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">Order for {table.name}</h2>
                
                <div className="bg-slate-700/30 p-3 rounded-lg mb-4">
                    <h3 className="font-semibold text-white mb-2">Customer Details</h3>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={activeOrder.customerName || ''}
                            onChange={(e) => dispatch({
                                type: 'UPDATE_CUSTOMER_DETAILS',
                                payload: { name: e.target.value, phone: activeOrder.customerPhone || '' }
                            })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                        />
                        <input
                            type="tel"
                            placeholder="Customer Phone"
                            value={activeOrder.customerPhone || ''}
                            onChange={(e) => dispatch({
                                type: 'UPDATE_CUSTOMER_DETAILS',
                                payload: { name: activeOrder.customerName || '', phone: e.target.value }
                            })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                    {activeOrder.items.length === 0 ? (
                        <p className="text-slate-400 text-center mt-8">No items added yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {activeOrder.items.map(item => (
                                <div key={item.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center">
                                    <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-md object-cover mr-3" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{item.name}</p>
                                        <p className="text-sm text-slate-300">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { itemId: item.id, quantity: parseInt(e.target.value) || 0 } })}
                                            className="w-14 bg-slate-800 text-center rounded-md border border-slate-600"
                                            min="0"
                                        />
                                        <Button variant="ghost" size="sm" className="ml-2 !p-1" onClick={() => dispatch({ type: 'REMOVE_ITEM_FROM_ORDER', payload: { itemId: item.id } })}>
                                            <TrashIcon className="h-5 w-5 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>₹{activeOrder.subtotal.toFixed(2)}</span></div>
                    {state.taxes.filter(t => t.enabled).map(tax => (
                         <div key={tax.id} className="flex justify-between text-slate-300">
                            <span>{tax.name} ({tax.rate}%)</span>
                            <span>₹{(activeOrder.subtotal * (tax.rate / 100)).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-white text-xl font-bold"><span>Total</span><span>₹{activeOrder.total.toFixed(2)}</span></div>
                    <Button className="w-full mt-4" size="lg" onClick={() => setBillModalOpen(true)} disabled={activeOrder.items.length === 0}>
                        Generate Bill
                    </Button>
                </div>
            </div>
            <Modal isOpen={isBillModalOpen} onClose={() => setBillModalOpen(false)} title={`Bill for ${table.name}`}>
                <BillModalContent order={activeOrder} table={table} onClose={() => setBillModalOpen(false)} dispatch={dispatch} />
            </Modal>
        </div>
    );
};

// --- CUSTOMER MANAGEMENT PAGE ---
export const CustomerManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isOfferModalOpen, setOfferModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBulkOfferModalOpen, setBulkOfferModalOpen] = useState(false);
    const [offerMessage, setOfferMessage] = useState('');
    const [bulkOfferMessage, setBulkOfferMessage] = useState("Hello! We're excited to announce our new special: [Your Offer Here]. Visit us soon to enjoy!");
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

    const handleSendOffer = () => {
        if (!selectedCustomer || !offerMessage) return;
        const whatsappUrl = `https://wa.me/${selectedCustomer.phone}?text=${encodeURIComponent(offerMessage)}`;
        window.open(whatsappUrl, '_blank');
        setOfferModalOpen(false);
        setOfferMessage('');
    };

    const openOfferModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setOfferMessage(`Hello ${customer.name}, we have a special offer for you at RMS Pro! Get 20% off on your next visit.`);
        setOfferModalOpen(true);
    };

    const handleAddCustomer = () => {
        if (newCustomer.name && newCustomer.phone) {
            dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
            setAddModalOpen(false);
            setNewCustomer({ name: '', phone: '' });
        } else {
            alert('Please enter both name and phone number.');
        }
    };

    const handleSendBulkOffer = () => {
        if (!bulkOfferMessage.trim()) {
            alert('Please enter an offer message.');
            return;
        }
        if (confirm(`Are you sure you want to send this offer to all ${state.customers.length} customers? This action cannot be undone.`)) {
            console.log("--- SIMULATING BULK WHATSAPP SEND ---");
            state.customers.forEach(customer => {
                console.log(`Sending to ${customer.name} (${customer.phone}): ${bulkOfferMessage}`);
            });
            console.log("--- BULK SEND COMPLETE ---");
            alert(`The offer has been queued for sending to all ${state.customers.length} customers. In a real application, this would be handled by a backend service.`);
            setBulkOfferModalOpen(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex justify-end gap-4 mb-4">
                 <Button variant="secondary" onClick={() => setBulkOfferModalOpen(true)}>
                    <WhatsAppIcon />
                    <span className="ml-2">Send Offer to All</span>
                </Button>
                <Button onClick={() => setAddModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Customer
                </Button>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Total Spent</th>
                            <th className="p-4">Visits</th>
                            <th className="p-4">Last Visit</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.customers.map(customer => (
                            <tr key={customer.id} className="border-b border-slate-700 last:border-b-0">
                                <td className="p-4 font-medium text-white">{customer.name}</td>
                                <td className="p-4 text-slate-300">{customer.phone}</td>
                                <td className="p-4 text-slate-300">₹{customer.totalSpent.toFixed(2)}</td>
                                <td className="p-4 text-slate-300">{customer.visits}</td>
                                <td className="p-4 text-slate-300">{customer.lastVisit.toLocaleDateString()}</td>
                                <td className="p-4">
                                    <Button variant="ghost" size="sm" onClick={() => openOfferModal(customer)}>
                                        <WhatsAppIcon />
                                        <span className="ml-2">Send Offer</span>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isOfferModalOpen} onClose={() => setOfferModalOpen(false)} title={`Send Offer to ${selectedCustomer?.name}`}>
                <div className="space-y-4">
                    <p className="text-slate-300">Compose a message to send via WhatsApp.</p>
                    <textarea
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                        placeholder="Enter your offer message..."
                    />
                    <Button onClick={handleSendOffer} className="w-full">
                        Send via WhatsApp
                    </Button>
                </div>
            </Modal>
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Customer">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                    />
                    <input
                        type="tel"
                        placeholder="Customer Phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                    />
                    <Button onClick={handleAddCustomer} className="w-full">
                        Save Customer
                    </Button>
                </div>
            </Modal>
            <Modal isOpen={isBulkOfferModalOpen} onClose={() => setBulkOfferModalOpen(false)} title={`Send Bulk Offer to ${state.customers.length} Customers`}>
                <div className="space-y-4">
                    <p className="text-slate-300">Compose a message to send to all customers via WhatsApp.</p>
                    <textarea
                        value={bulkOfferMessage}
                        onChange={(e) => setBulkOfferMessage(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                        placeholder="Enter your offer message..."
                    />
                    <Button onClick={handleSendBulkOffer} className="w-full">
                        <WhatsAppIcon /> <span className="ml-2">Queue Bulk Send</span>
                    </Button>
                </div>
            </Modal>
        </motion.div>
    );
};

// --- STAFF MANAGEMENT PAGE ---
export const StaffManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState<Omit<Staff, 'id' | 'isActive'>>({ name: '', email: '', phone: '', role: 'Waiter', salary: 0 });

    const handleAddStaff = () => {
        if (newStaff.name && newStaff.email && newStaff.phone && newStaff.salary > 0) {
            dispatch({ type: 'ADD_STAFF', payload: newStaff });
            setAddModalOpen(false);
            setNewStaff({ name: '', email: '', phone: '', role: 'Waiter', salary: 0 });
        } else {
            alert('Please fill all fields correctly.');
        }
    };

    const handlePaySalaries = () => {
        const totalSalaries = state.staff.filter(s => s.isActive).reduce((sum, s) => sum + s.salary, 0);
        if (totalSalaries > 0) {
            if (confirm(`This will create an expense of ₹${totalSalaries.toFixed(2)} for this month's salaries. Proceed?`)) {
                const month = new Date().toLocaleString('default', { month: 'long' });
                const year = new Date().getFullYear();
                dispatch({
                    type: 'ADD_EXPENSE',
                    payload: {
                        id: `exp-sal-${Date.now()}`,
                        description: `Staff Salaries for ${month} ${year}`,
                        amount: totalSalaries,
                        category: 'Salaries',
                        date: new Date(),
                    }
                });
                alert('Salary expense has been recorded.');
            }
        } else {
            alert('No active staff with salaries to pay.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={handlePaySalaries}>Pay All Salaries</Button>
                <Button onClick={() => setAddModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Staff
                </Button>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Salary</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.staff.map(staffMember => (
                            <tr key={staffMember.id} className="border-b border-slate-700 last:border-b-0">
                                <td className="p-4 font-medium text-white">{staffMember.name}</td>
                                <td className="p-4 text-slate-300">{staffMember.role}</td>
                                <td className="p-4 text-slate-300">{staffMember.phone}</td>
                                <td className="p-4 text-slate-300">₹{staffMember.salary.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${staffMember.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {staffMember.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'TOGGLE_STAFF_STATUS', payload: { staffId: staffMember.id } })}>
                                        {staffMember.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Staff Member">
                <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <input type="email" placeholder="Email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <input type="tel" placeholder="Phone Number" value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value as StaffRole })} className="w-full bg-slate-700 rounded px-3 py-2 text-white">
                        <option>Admin</option>
                        <option>Cashier</option>
                        <option>Waiter</option>
                        <option>Kitchen Staff</option>
                        <option>Inventory Manager</option>
                    </select>
                    <input type="number" placeholder="Monthly Salary" value={newStaff.salary || ''} onChange={e => setNewStaff({ ...newStaff, salary: parseFloat(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <Button onClick={handleAddStaff} className="w-full">Save Staff Member</Button>
                </div>
            </Modal>
        </motion.div>
    );
};


// --- REPORTS PAGE ---
type ReportType = 'sales' | 'inventory' | 'credit' | 'expenses';
type TimeFrame = 'today' | 'week' | 'month' | 'all';

const exportToCSV = (filename: string, headers: string[], data: (string | number)[][]) => {
    const csvRows = [
        headers.join(','),
        ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const ReportsPage: React.FC = () => {
    const { state } = useAppContext();
    const [activeReport, setActiveReport] = useState<ReportType>('sales');
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');

    const dateFilter = (date: Date) => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const todayReset = new Date();
        todayReset.setHours(0,0,0,0);

        switch (timeFrame) {
            case 'today':
                return date.toDateString() === new Date().toDateString();
            case 'week':
                return date >= startOfWeek;
            case 'month':
                return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
            case 'all':
            default:
                return true;
        }
    };

    const filteredSales = useMemo(() => state.completedOrders.filter(o => dateFilter(o.createdAt)), [state.completedOrders, timeFrame]);
    const filteredCredit = useMemo(() => state.creditRecords.filter(o => dateFilter(o.createdAt)), [state.creditRecords, timeFrame]);
    const filteredExpenses = useMemo(() => state.expenses.filter(e => dateFilter(e.date)), [state.expenses, timeFrame]);

    const handleExportSales = () => {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Phone', 'Subtotal', 'Tax', 'Total'];
        const data = filteredSales.map(o => [o.id, o.createdAt.toLocaleString(), o.customerName || 'N/A', o.customerPhone || 'N/A', o.subtotal, o.tax, o.total]);
        exportToCSV(`sales-report-${timeFrame}.csv`, headers, data);
    };

    const handleExportInventory = () => {
        const headers = ['Item ID', 'Name', 'Category', 'Price', 'Stock', 'Status'];
        const data = state.menu.map(item => [item.id, item.name, item.category, item.price, item.stock, item.stock === 0 ? 'Out of Stock' : item.stock <= 10 ? 'Low Stock' : 'In Stock']);
        exportToCSV('inventory-report.csv', headers, data);
    };

    const handleExportCredit = () => {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Phone', 'Credit Amount'];
        const data = filteredCredit.map(o => [o.id, o.createdAt.toLocaleString(), o.customerName || 'N/A', o.customerPhone || 'N/A', o.total]);
        exportToCSV(`credit-report-${timeFrame}.csv`, headers, data);
    };

    const handleExportExpenses = () => {
        const headers = ['Expense ID', 'Date', 'Description', 'Category', 'Amount'];
        const data = filteredExpenses.map(e => [e.id, e.date.toLocaleString(), e.description, e.category, e.amount]);
        exportToCSV(`expenses-report-${timeFrame}.csv`, headers, data);
    };

    const totalCredit = useMemo(() => filteredCredit.reduce((sum, order) => sum + order.total, 0), [filteredCredit]);
    const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0), [filteredExpenses]);
    const totalSales = useMemo(() => filteredSales.reduce((sum, order) => sum + order.total, 0), [filteredSales]);

    const renderReport = () => {
        switch (activeReport) {
            case 'sales':
                return (
                    <motion.div key="sales" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-4">
                             <div>
                                <h3 className="text-xl font-bold">Sales Report</h3>
                                <p className="text-slate-400">Total Sales: <span className="font-bold text-green-400">₹{totalSales.toFixed(2)}</span></p>
                            </div>
                            <Button onClick={handleExportSales} disabled={filteredSales.length === 0}>Export CSV</Button>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50">
                                    <tr><th className="p-4">Order ID</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Total</th></tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map(o => (
                                        <tr key={o.id} className="border-b border-slate-700 last:border-b-0">
                                            <td className="p-4 font-mono text-xs">{o.id}</td>
                                            <td className="p-4">{o.createdAt.toLocaleDateString()}</td>
                                            <td className="p-4">{o.customerName || 'N/A'}</td>
                                            <td className="p-4 font-semibold">₹{o.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'inventory':
                return (
                    <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Inventory Report</h3>
                            <Button onClick={handleExportInventory}>Export CSV</Button>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50">
                                    <tr><th className="p-4">Item</th><th className="p-4">Category</th><th className="p-4">Stock</th><th className="p-4">Status</th></tr>
                                </thead>
                                <tbody>
                                    {state.menu.map(item => (
                                        <tr key={item.id} className="border-b border-slate-700 last:border-b-0">
                                            <td className="p-4 font-medium text-white">{item.name}</td>
                                            <td className="p-4 text-slate-300">{item.category}</td>
                                            <td className="p-4 font-bold">{item.stock}</td>
                                            <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${item.stock === 0 ? 'bg-red-500/20 text-red-400' : item.stock <= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{item.stock === 0 ? 'Out of Stock' : item.stock <= 10 ? 'Low Stock' : 'In Stock'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'credit':
                 return (
                    <motion.div key="credit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Credit / Bad Debt Report</h3>
                                <p className="text-slate-400">Total Outstanding: <span className="font-bold text-red-400">₹{totalCredit.toFixed(2)}</span></p>
                            </div>
                            <Button onClick={handleExportCredit} disabled={filteredCredit.length === 0}>Export CSV</Button>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50">
                                    <tr><th className="p-4">Order ID</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Amount</th></tr>
                                </thead>
                                <tbody>
                                    {filteredCredit.map(o => (
                                        <tr key={o.id} className="border-b border-slate-700 last:border-b-0">
                                            <td className="p-4 font-mono text-xs">{o.id}</td>
                                            <td className="p-4">{o.createdAt.toLocaleDateString()}</td>
                                            <td className="p-4">{o.customerName || 'N/A'}</td>
                                            <td className="p-4 font-semibold text-red-400">₹{o.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'expenses':
                 return (
                    <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Expenses Report</h3>
                                <p className="text-slate-400">Total Expenses: <span className="font-bold text-red-400">₹{totalExpenses.toFixed(2)}</span></p>
                            </div>
                            <Button onClick={handleExportExpenses} disabled={filteredExpenses.length === 0}>Export CSV</Button>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50">
                                    <tr><th className="p-4">Date</th><th className="p-4">Description</th><th className="p-4">Category</th><th className="p-4">Amount</th></tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map(e => (
                                        <tr key={e.id} className="border-b border-slate-700 last:border-b-0">
                                            <td className="p-4">{e.date.toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-white">{e.description}</td>
                                            <td className="p-4 text-slate-300">{e.category}</td>
                                            <td className="p-4 font-semibold">₹{e.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-1 rounded-lg bg-slate-800 p-1">
                    {(['today', 'week', 'month', 'all'] as TimeFrame[]).map(frame => (
                        <button key={frame} onClick={() => setTimeFrame(frame)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeFrame === frame ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            {frame.charAt(0).toUpperCase() + frame.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex space-x-1 border-b border-slate-700">
                    <button onClick={() => setActiveReport('sales')} className={`px-4 py-2 font-medium ${activeReport === 'sales' ? 'border-b-2 border-sky-500 text-white' : 'text-slate-400'}`}>Sales</button>
                    <button onClick={() => setActiveReport('inventory')} className={`px-4 py-2 font-medium ${activeReport === 'inventory' ? 'border-b-2 border-sky-500 text-white' : 'text-slate-400'}`}>Inventory</button>
                    <button onClick={() => setActiveReport('credit')} className={`px-4 py-2 font-medium ${activeReport === 'credit' ? 'border-b-2 border-sky-500 text-white' : 'text-slate-400'}`}>Credit</button>
                    <button onClick={() => setActiveReport('expenses')} className={`px-4 py-2 font-medium ${activeReport === 'expenses' ? 'border-b-2 border-sky-500 text-white' : 'text-slate-400'}`}>Expenses</button>
                </div>
            </div>
            <AnimatePresence mode="wait">
                {renderReport()}
            </AnimatePresence>
        </motion.div>
    );
};


// --- MENU MANAGEMENT PAGE ---
export const MenuManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', category: state.menuCategories[0] || '', price: 0, stock: 0, imageUrl: '' });

    const handleAddItem = () => {
        if (newItem.name && newItem.price > 0 && newItem.category) {
            dispatch({ type: 'ADD_MENU_ITEM', payload: { ...newItem, id: `menu-${Date.now()}` } });
            setModalOpen(false);
            setNewItem({ name: '', category: state.menuCategories[0] || '', price: 0, stock: 0, imageUrl: '' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Menu Items</h2>
                <Button onClick={() => setModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" /> Add New Item
                </Button>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="p-4">Item</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.menu.map(item => (
                            <tr key={item.id} className="border-b border-slate-700 last:border-b-0">
                                <td className="p-4 flex items-center">
                                    <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover mr-4" />
                                    <span className="font-medium text-white">{item.name}</span>
                                </td>
                                <td className="p-4 text-slate-300">{item.category}</td>
                                <td className="p-4 text-slate-300">₹{item.price.toFixed(2)}</td>
                                <td className={`p-4 font-bold ${item.stock > 10 ? 'text-green-400' : item.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {item.stock}
                                </td>
                                <td className="p-4">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Menu Item">
                <div className="space-y-4">
                    <input type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as Category})} className="w-full bg-slate-700 rounded px-3 py-2 text-white">
                        {state.menuCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" placeholder="Price" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <input type="number" placeholder="Stock Quantity" value={newItem.stock || ''} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <input type="text" placeholder="Image URL" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2 text-white" />
                    <Button onClick={handleAddItem} className="w-full">Add Item</Button>
                </div>
            </Modal>
        </motion.div>
    );
};

// --- AI SPECIALS PAGE ---
export const AISpecials: React.FC = () => {
    const { state } = useAppContext();
    const [specials, setSpecials] = useState<SpecialDish[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSpecials([]);
        try {
            const result = await generateChefSpecials(state.menu);
            setSpecials(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <Card className="text-center p-8">
                <SparklesIcon className="h-12 w-12 mx-auto text-sky-400" />
                <h2 className="text-2xl font-bold mt-4 text-white">Chef's AI Assistant</h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Let Gemini analyze your current inventory and suggest creative, profitable daily specials to delight your customers and optimize stock.</p>
                <Button size="lg" className="mt-6" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Today\'s Specials'}
                </Button>
            </Card>

            {isLoading && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-8 bg-slate-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                            <div className="h-6 bg-slate-700 rounded w-1/4 mt-4"></div>
                        </Card>
                    ))}
                </div>
            )}

            {error && <p className="mt-8 text-center text-red-400">{error}</p>}

            {!isLoading && specials.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4 text-white">Generated Specials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specials.map((special, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                <Card className="h-full flex flex-col">
                                    <h4 className="text-xl font-bold text-sky-400">{special.name}</h4>
                                    <p className="text-slate-300 mt-2 flex-grow">{special.description}</p>
                                    <p className="text-2xl font-bold text-white mt-4">₹{special.price.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500 mt-2">Ingredients: {special.ingredients.join(', ')}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// --- SETTINGS PAGE ---
export const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [newCategory, setNewCategory] = useState('');
    const [newTax, setNewTax] = useState({ name: '', rate: 0 });
    const [newTable, setNewTable] = useState({ name: '', capacity: 0 });
    
    // Mock state for settings UI
    const [settingsState, setSettingsState] = useState({
        restaurantName: 'RMS Pro',
        contactEmail: 'contact@rmspro.io',
        theme: 'dark',
        billingFooter: 'Thank you for your visit!',
        enableBilling: true,
        enableWhatsApp: true,
        whatsappNumber: '910000000000',
        enableAI: true,
        enableQR: true,
        paytmEnabled: true,
        paytmMerchantId: 'your-merchant-id',
        upiEnabled: true,
        upiId: 'your-vpa@bank',
        language: 'en-IN',
        currency: 'INR',
    });

    const handleSettingChange = (key: keyof typeof settingsState, value: any) => {
        setSettingsState(prev => ({ ...prev, [key]: value }));
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            dispatch({ type: 'ADD_CATEGORY', payload: { categoryName: newCategory.trim() } });
            setNewCategory('');
        }
    };

    const handleAddTax = () => {
        if (newTax.name.trim() && newTax.rate >= 0) {
            dispatch({ type: 'ADD_TAX', payload: newTax });
            setNewTax({ name: '', rate: 0 });
        }
    };

    const handleAddTable = () => {
        if (newTable.name.trim() && newTable.capacity > 0) {
            dispatch({ type: 'ADD_TABLE', payload: newTable });
            setNewTable({ name: '', capacity: 0 });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1 */}
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-white">Restaurant Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400">Restaurant Name</label>
                                <input type="text" value={settingsState.restaurantName} onChange={e => handleSettingChange('restaurantName', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-400">Contact Email</label>
                                <input type="email" value={settingsState.contactEmail} onChange={e => handleSettingChange('contactEmail', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-400">Theme</label>
                                <select value={settingsState.theme} onChange={e => handleSettingChange('theme', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white">
                                    <option value="dark">Dark</option>
                                    <option value="light" disabled>Light (Coming Soon)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-white">Tax & Billing</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <input type="text" placeholder="Tax Name (e.g., VAT)" value={newTax.name} onChange={e => setNewTax({...newTax, name: e.target.value})} className="flex-grow bg-slate-700 rounded px-3 py-2 text-white" />
                                <input type="number" placeholder="Rate (%)" value={newTax.rate || ''} onChange={e => setNewTax({...newTax, rate: parseFloat(e.target.value)})} className="w-24 bg-slate-700 rounded px-3 py-2 text-white" />
                                <Button onClick={handleAddTax}>Add</Button>
                            </div>
                            <div className="space-y-2">
                                {state.taxes.map(tax => (
                                    <div key={tax.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                                        <span className="font-medium">{tax.name} ({tax.rate}%)</span>
                                        <div className="flex items-center gap-2">
                                            <ToggleSwitch enabled={tax.enabled} onChange={() => dispatch({ type: 'TOGGLE_TAX_STATUS', payload: { taxId: tax.id } })} label={`toggle-${tax.name}`} />
                                            <Button variant="ghost" size="sm" className="!p-1" onClick={() => dispatch({ type: 'DELETE_TAX', payload: { taxId: tax.id } })}>
                                                <TrashIcon className="h-5 w-5 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-400">Bill Footer Message</label>
                                <input type="text" value={settingsState.billingFooter} onChange={e => handleSettingChange('billingFooter', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" />
                            </div>
                        </div>
                    </Card>
                     <Card>
                        <h2 className="text-xl font-bold mb-4 text-white">Table Management</h2>
                        <div className="flex gap-4 mb-4">
                            <input type="text" placeholder="Table Name (e.g., T-13)" value={newTable.name} onChange={e => setNewTable({...newTable, name: e.target.value})} className="flex-grow bg-slate-700 rounded px-3 py-2 text-white" />
                            <input type="number" placeholder="Capacity" value={newTable.capacity || ''} onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})} className="w-24 bg-slate-700 rounded px-3 py-2 text-white" />
                            <Button onClick={handleAddTable}>Add</Button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {state.tables.map(table => (
                                <div key={table.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                                    <span className="font-medium">{table.name} (Seats: {table.capacity})</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="!p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                        onClick={() => dispatch({ type: 'DELETE_TABLE', payload: { tableId: table.id } })}
                                        disabled={table.status !== 'Available'}
                                        title={table.status !== 'Available' ? 'Cannot delete an occupied table' : 'Delete table'}
                                    >
                                        <TrashIcon className="h-5 w-5 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Column 2 */}
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-white">Menu Categories</h2>
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="New category name"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="flex-grow bg-slate-700 rounded px-3 py-2 text-white"
                            />
                            <Button onClick={handleAddCategory}>Add</Button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {state.menuCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                                    <span className="font-medium">{cat}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="!p-1"
                                        onClick={() => dispatch({ type: 'DELETE_CATEGORY', payload: { categoryName: cat } })}
                                    >
                                        <TrashIcon className="h-5 w-5 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-white">Feature Toggles & Integrations</h2>
                        <div className="space-y-4">
                            <ToggleSwitch label="Billing & Orders" enabled={settingsState.enableBilling} onChange={v => handleSettingChange('enableBilling', v)} />
                            <div className="space-y-4">
                                <ToggleSwitch label="WhatsApp Integration" enabled={settingsState.enableWhatsApp} onChange={v => handleSettingChange('enableWhatsApp', v)} />
                                <AnimatePresence>
                                {settingsState.enableWhatsApp && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="pl-8 pt-2">
                                            <label className="text-sm font-medium text-slate-400">WhatsApp Business Number</label>
                                            <input type="text" value={settingsState.whatsappNumber} onChange={e => handleSettingChange('whatsappNumber', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" placeholder="e.g., 91XXXXXXXXXX" />
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                            <ToggleSwitch label="AI Features (Gemini)" enabled={settingsState.enableAI} onChange={v => handleSettingChange('enableAI', v)} />
                            <ToggleSwitch label="QR Code Menus" enabled={settingsState.enableQR} onChange={v => handleSettingChange('enableQR', v)} />
                            <div className="border-t border-slate-700 my-4"></div>
                            <div className="space-y-4">
                                <ToggleSwitch label="Paytm Gateway" enabled={settingsState.paytmEnabled} onChange={v => handleSettingChange('paytmEnabled', v)} />
                                <AnimatePresence>
                                {settingsState.paytmEnabled && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="pl-8 pt-2">
                                            <label className="text-sm font-medium text-slate-400">Paytm Merchant ID</label>
                                            <input type="text" value={settingsState.paytmMerchantId} onChange={e => handleSettingChange('paytmMerchantId', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" />
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                             <div className="space-y-4">
                                <ToggleSwitch label="UPI Gateway" enabled={settingsState.upiEnabled} onChange={v => handleSettingChange('upiEnabled', v)} />
                                <AnimatePresence>
                                {settingsState.upiEnabled && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="pl-8 pt-2">
                                            <label className="text-sm font-medium text-slate-400">UPI ID (VPA)</label>
                                            <input type="text" value={settingsState.upiId} onChange={e => handleSettingChange('upiId', e.target.value)} className="w-full mt-1 bg-slate-700 rounded px-3 py-2 text-white" />
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

// --- DIGITAL QR MENU PAGE ---
export const DigitalQRMenu: React.FC<{ tableId?: number }> = ({ tableId }) => {
    const { state, dispatch } = useAppContext();
    const table = state.tables.find(t => t.id === tableId);

    const availableMenu = useMemo(() => {
        return state.menu.filter(item => item.stock > 0);
    }, [state.menu]);

    const menuByCategory = useMemo(() => {
        return availableMenu.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<Category, MenuItem[]>);
    }, [availableMenu]);

    if (!table) {
        return (
            <div className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-red-500 mb-4">Invalid Table</h1>
                <p className="text-xl text-slate-300">Please scan a valid QR code.</p>
                <Button className="mt-8" onClick={() => dispatch({ type: 'SET_PAGE', payload: { page: 'Dashboard' } })}>
                    Back to Admin Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <header className="bg-slate-800/50 backdrop-blur-sm p-4 text-center sticky top-0 z-10">
                <h1 className="text-3xl font-bold text-sky-400">RMS Pro</h1>
                <p className="text-lg text-slate-300 mt-1">Menu for Table {table.name}</p>
            </header>
            <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                {state.menuCategories.map(category => {
                    const items = menuByCategory[category];
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={category} className="mb-10">
                            <h2 className="text-3xl font-bold text-white mb-4 border-b-2 border-sky-500 pb-2">{category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {items.map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        className="bg-slate-800/50 rounded-lg flex items-center p-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover mr-4 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <p className="text-slate-400 text-sm mt-1">A delicious item from our kitchen.</p>
                                            <p className="text-lg font-bold text-sky-400 mt-2">₹{item.price.toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </main>
             <footer className="text-center p-4 text-slate-500">
                <p>Powered by RMS Pro</p>
                 <Button variant="ghost" size="sm" className="mt-2" onClick={() => dispatch({ type: 'SET_PAGE', payload: { page: 'Dashboard' } })}>
                    Admin Login
                </Button>
            </footer>
        </div>
    );
};

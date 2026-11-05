'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, MessageSquare, ShieldCheck, User, Truck, Store, Sparkles, CheckCheck, Clock } from 'lucide-react';
import type { Order } from '@/lib/casmikData';
import { 
  OrderChatMessage, 
  fetchOrderChatMessages, 
  sendOrderChatMessage, 
  addOrderChatListener, 
  ChatRole 
} from '@/lib/orderChat';

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  currentRole: 'delivery' | 'partner' | 'user' | 'admin';
  currentUserName: string;
  currentUserPhone?: string;
  onOpenCall?: (target: { name: string; phone: string; role: string }) => void;
}

export default function OrderChatModal({
  isOpen,
  onClose,
  order,
  currentRole,
  currentUserName,
  currentUserPhone,
  onOpenCall,
}: OrderChatModalProps) {
  // If delivery person: toggle between chatting with Partner vs chatting with Customer
  const [activeTab, setActiveTab] = useState<'partner' | 'user'>('user');
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Set default tab based on role
  useEffect(() => {
    if (currentRole === 'partner') {
      setActiveTab('partner');
    } else if (currentRole === 'user') {
      setActiveTab('user');
    }
  }, [currentRole]);

  // Load and listen to messages
  useEffect(() => {
    if (!isOpen || !order) return;

    setLoading(true);
    fetchOrderChatMessages(order.id, order.orderNumber).then((data) => {
      setMessages(data);
      setLoading(false);
    });

    const unsubscribe = addOrderChatListener(order.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, order]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  if (!isOpen || !order) return null;

  // Determine chat counterpart
  let recipientRole: 'delivery' | 'partner' | 'user' = 'user';
  let counterpartName = order.customerName || 'Customer';
  let counterpartPhone = order.customerPhone || '';
  let counterpartBadge = 'Customer';
  let counterpartIcon = User;

  if (currentRole === 'delivery') {
    if (activeTab === 'partner') {
      recipientRole = 'partner';
      counterpartName = order.partnerName || 'Partner Hub';
      counterpartPhone = (order as any).partnerPhone || '9845067890';
      counterpartBadge = 'Partner Hub';
      counterpartIcon = Store;
    } else {
      recipientRole = 'user';
      counterpartName = order.customerName || 'Customer';
      counterpartPhone = order.customerPhone || '';
      counterpartBadge = 'Customer';
      counterpartIcon = User;
    }
  } else if (currentRole === 'partner') {
    recipientRole = 'delivery';
    counterpartName = order.deliveryAgentName || 'Assigned Rider';
    counterpartPhone = order.deliveryAgentPhone || '9820123456';
    counterpartBadge = 'Delivery Executive';
    counterpartIcon = Truck;
  } else if (currentRole === 'user') {
    recipientRole = 'delivery';
    counterpartName = order.deliveryAgentName || 'Delivery Executive';
    counterpartPhone = order.deliveryAgentPhone || '9820123456';
    counterpartBadge = 'Delivery Executive';
    counterpartIcon = Truck;
  }

  // Filter messages relevant to this conversation thread
  const relevantMessages = messages.filter((m) => {
    if (currentRole === 'delivery') {
      if (activeTab === 'partner') {
        return (
          (m.senderRole === 'delivery' && m.recipientRole === 'partner') ||
          (m.senderRole === 'partner' && (m.recipientRole === 'delivery' || m.recipientRole === 'all'))
        );
      } else {
        return (
          (m.senderRole === 'delivery' && m.recipientRole === 'user') ||
          (m.senderRole === 'user' && (m.recipientRole === 'delivery' || m.recipientRole === 'all'))
        );
      }
    } else if (currentRole === 'partner') {
      return (
        (m.senderRole === 'partner' && m.recipientRole === 'delivery') ||
        (m.senderRole === 'delivery' && (m.recipientRole === 'partner' || m.recipientRole === 'all'))
      );
    } else {
      // user
      return (
        (m.senderRole === 'user' && m.recipientRole === 'delivery') ||
        (m.senderRole === 'delivery' && (m.recipientRole === 'user' || m.recipientRole === 'all'))
      );
    }
  });

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !order) return;

    if (!customText) setInputText('');

    const newMsg = await sendOrderChatMessage({
      orderId: order.id,
      orderNumber: order.orderNumber,
      senderRole: currentRole,
      senderName: currentUserName,
      senderPhone: currentUserPhone,
      recipientRole,
      text: textToSend,
    });

    setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
  };

  // Canned quick replies
  const quickReplies = currentRole === 'delivery' 
    ? activeTab === 'user'
      ? ['On the way to your address', 'Reaching your doorstep in 5 mins', 'Please keep the device and OTP ready', 'Diagnostic complete, please confirm payout']
      : ['Accepted the task, heading out', 'Customer doorstep reached', 'Diagnostics completed smoothly', 'Amount paid, closing task']
    : currentRole === 'partner'
      ? ['Please ensure 12-point inspection is recorded', 'Customer verified via phone call', 'Proceed with doorstep spot payment', 'Thank you for swift collection']
      : ['I am available at home', 'Device & accessories are packed', 'Please call when you reach gate', 'Thank you!'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col h-[640px] max-h-[92vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                {React.createElement(counterpartIcon, { size: 20 })}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">{counterpartName}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {counterpartBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  Order #{order.orderNumber} · {order.deviceName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {counterpartPhone && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenCall
                      ? onOpenCall({ name: counterpartName, phone: counterpartPhone, role: counterpartBadge })
                      : window.open(`tel:${counterpartPhone}`)
                  }
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
                  title={`Call ${counterpartName}`}
                >
                  <Phone size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Delivery Person Role: Dual Tabs (Partner vs Customer) */}
          {currentRole === 'delivery' && (
            <div className="mt-3 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'user' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User size={13} />
                <span>Chat with Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('partner')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'partner' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store size={13} />
                <span>Chat with Partner</span>
              </button>
            </div>
          )}
        </div>

        {/* Message Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading conversation...</div>
          ) : relevantMessages.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <MessageSquare size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">No messages in this chat yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Send an update or tap one of the quick suggestions below.
              </p>
            </div>
          ) : (
            relevantMessages.map((msg) => {
              const isMe = msg.senderRole === currentRole;
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-semibold">
                    <span>{isMe ? 'You' : msg.senderName}</span>
                    <span>·</span>
                    <span>{formattedTime}</span>
                  </div>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    <p className="break-words font-medium">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Canned Quick Replies */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(reply)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 shrink-0 transition-colors cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${counterpartName}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

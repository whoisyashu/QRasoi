import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Sparkles, UtensilsCrossed, RefreshCw, Search, Download, FileText, Bell, Volume2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate, getStatusConfig } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { triggerNotification, requestNotificationPermission } from '../utils/notificationSound';
import { socketClient } from '../services/socket';

export const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, fetchPublicOrder, fetchLiveOrders, checkExpiredOrders, initRealtimeSubscription } = useOrderStore();
  const { restaurant } = useAuthStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [manualIdInput, setManualIdInput] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const targetId = orderId ? (orderId.startsWith('QR-') ? orderId : `QR-${orderId}`) : '';

  const normalizeId = (str: string) => (str || '').toUpperCase().replace(/O/gi, '0');

  // Case-insensitive & Zero/Letter-O flexible order resolution (QR-CMZ0GQ, CMZOGQ, cmzogq)
  const order = orders.find(
    (o) =>
      normalizeId(o.id) === normalizeId(targetId) ||
      (orderId && normalizeId(o.id) === normalizeId(orderId)) ||
      (orderId && normalizeId(o.id).endsWith(normalizeId(orderId)))
  );

  const prevStatusRef = useRef<string | null>(null);

  // Join order real-time Socket.IO room for instant status progression alerts
  useEffect(() => {
    initRealtimeSubscription();
    if (targetId || orderId) {
      socketClient.joinOrder(targetId || orderId!);
    }
  }, [targetId, orderId, initRealtimeSubscription]);

  // Trigger sound effect and browser notification when order status progresses
  useEffect(() => {
    if (order) {
      if (prevStatusRef.current !== null && prevStatusRef.current !== order.status) {
        if (order.status === 'ready' || order.status === 'completed') {
          triggerNotification(
            '🍲 Food is Ready to Serve!',
            `Your order ${order.id} is ready! Please collect it from the counter.`
          );
        } else if (order.status === 'preparing') {
          triggerNotification(
            '👨‍🍳 Kitchen Started Preparing!',
            `Your order ${order.id} payment was verified and cooking has started.`
          );
        }
      }
      prevStatusRef.current = order.status;
    }
  }, [order?.status, order?.id]);

  // Request browser notification permissions on page mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Sync order status from live backend API / Supabase every 3 seconds
  useEffect(() => {
    let isMounted = true;

    const syncOrder = async () => {
      if (targetId || orderId) {
        await fetchPublicOrder(targetId || orderId!);
      }
      await fetchLiveOrders();
      checkExpiredOrders();
      if (isMounted) {
        setLastUpdated(new Date());
        setIsInitialLoading(false);
      }
    };

    syncOrder();

    const interval = setInterval(() => {
      syncOrder();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, targetId, fetchPublicOrder, fetchLiveOrders, checkExpiredOrders]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;
    const formatted = manualIdInput.trim().startsWith('QR-')
      ? manualIdInput.trim()
      : `QR-${manualIdInput.trim()}`;
    navigate(`/order-status/${formatted}`);
  };

  // Download PDF Bill Generator
  const handleDownloadBillPdf = async () => {
    if (!order) return;
    setIsGeneratingPdf(true);

    const restName =
      order.restaurantName &&
      order.restaurantName !== 'Mock Restaurant' &&
      order.restaurantName !== 'QRasoi Restaurant' &&
      order.restaurantName !== 'Your Restaurant Name'
        ? order.restaurantName
        : restaurant.name && restaurant.name !== 'Your Restaurant Name' && restaurant.name !== 'Mock Restaurant'
        ? restaurant.name
        : 'DineVerse Bistro';

    const restAddr = order.restaurantAddress || restaurant.address || 'Flat No. 13A, Bankey Bihari Enclave';
    const restPhone = order.restaurantPhone || restaurant.phone || '+91 9368967944';

    const invoiceContainer = document.createElement('div');
    invoiceContainer.style.position = 'fixed';
    invoiceContainer.style.left = '-9999px';
    invoiceContainer.style.top = '-9999px';
    invoiceContainer.style.width = '480px';
    invoiceContainer.style.padding = '28px';
    invoiceContainer.style.backgroundColor = '#ffffff';
    invoiceContainer.style.fontFamily = "'Courier New', Courier, monospace";

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px dotted #d1d5db;">
        <td style="padding: 8px 0; font-weight: 700; color: #0f172a; text-align: left; vertical-align: top;">
          ${item.menuItem?.name || 'Dish'}
          ${item.notes ? `<div style="font-size: 9.5px; color: #ea580c; font-style: italic; font-weight: 400; margin-top: 2px;">* ${item.notes}</div>` : ''}
        </td>
        <td style="padding: 8px 0; text-align: center; font-weight: 700; color: #0f172a; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; color: #475569; vertical-align: top;">Rs.${(item.menuItem?.price || 0)}</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a; vertical-align: top;">Rs.${((item.menuItem?.price || 0) * item.quantity)}</td>
      </tr>
    `
      )
      .join('');

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    invoiceContainer.innerHTML = `
      <div style="background-color: #ffffff; color: #000000; font-family: 'Courier New', Courier, monospace; line-height: 1.35; padding: 10px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px dashed #000000; padding-bottom: 14px; margin-bottom: 14px;">
          <h1 style="font-size: 22px; font-weight: 900; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: sans-serif;">${restName}</h1>
          <p style="font-size: 11px; color: #333333; margin: 5px 0 0 0; font-weight: 600;">${restAddr}</p>
          <p style="font-size: 11px; color: #333333; margin: 2px 0 0 0; font-weight: 600;">Contact: ${restPhone}</p>
        </div>

        <!-- Meta info -->
        <div style="border-bottom: 2px dashed #000000; padding-bottom: 10px; margin-bottom: 14px; font-size: 11.5px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>ORDER REF:</strong> ${order.id}</span>
            <span><strong>DATE:</strong> ${formattedDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>CUSTOMER:</strong> ${order.customerName}</span>
            <span><strong>TIME:</strong> ${formattedTime}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>TABLE:</strong> ${order.tableNumber || 'Table 1'}</span>
            ${order.customerPhone ? `<span><strong>MOBILE:</strong> ${order.customerPhone}</span>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; table-layout: fixed;">
          <thead>
            <tr style="border-bottom: 2px dashed #000000; text-align: left;">
              <th style="padding: 6px 0; width: 50%; color: #000000;">ITEM DESCRIPTION</th>
              <th style="padding: 6px 0; width: 14%; text-align: center; color: #000000;">QTY</th>
              <th style="padding: 6px 0; width: 18%; text-align: right; color: #000000;">RATE</th>
              <th style="padding: 6px 0; width: 18%; text-align: right; color: #000000;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="border-top: 2px dashed #000000; border-bottom: 2px dashed #000000; padding: 10px 0; margin-bottom: 16px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Item Subtotal</span>
            <span>Rs.${(order.subtotal || order.total || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>CGST (0%)</span>
            <span>Rs.0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>SGST (0%)</span>
            <span>Rs.0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: #000000; border-top: 1px dashed #000000; padding-top: 8px; margin-top: 4px;">
            <span>NET AMOUNT PAID</span>
            <span>Rs.${(order.total || order.subtotal || 0).toFixed(2)}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 11px;">
          <p style="font-weight: 700; color: #000000; margin: 0; font-family: sans-serif;">*** THANK YOU FOR DINING WITH US ***</p>
          <p style="margin: 4px 0 0 0; color: #444444;">Please Visit Again Soon!</p>

          <div style="margin-top: 16px; padding-top: 10px; border-top: 1px dashed #aaaaaa; text-align: center; font-size: 11px; color: #475569; font-family: sans-serif;">
            <span>Powered by <strong style="color: #ea580c; font-weight: 900;">QRasoi POS</strong> • www.qrasoi.app</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(invoiceContainer);

    try {
      const canvas = await html2canvas(invoiceContainer, { scale: 2, useCORS: true });
      document.body.removeChild(invoiceContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`QRasoi_Bill_${order.id}.pdf`);
      setIsGeneratingPdf(false);
    } catch (err) {
      if (document.body.contains(invoiceContainer)) {
        document.body.removeChild(invoiceContainer);
      }
      setIsGeneratingPdf(false);
      console.error('PDF Generation Error:', err);
    }
  };

  // Loading Screen
  if (isInitialLoading && !order) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <h2 className="text-lg font-bold text-slate-800">Locating Live Order...</h2>
        <p className="text-xs text-slate-500">Syncing real-time kitchen status for order {targetId || orderId}</p>
      </div>
    );
  }

  // Not Found State with Quick Lookup Box
  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-6 max-w-md mx-auto flex flex-col justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5">Order Not Found</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            We could not locate order <strong className="font-mono text-orange-600">{targetId || orderId}</strong> in the live queue.
          </p>
        </div>

        <form onSubmit={handleManualSearch} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
          <label className="block text-xs font-semibold text-slate-700">Track Different Order ID:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. QR-CMZOGQ or CMZOGQ"
              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-mono font-bold"
              value={manualIdInput}
              onChange={(e) => setManualIdInput(e.target.value)}
            />
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 rounded-xl">
              Track
            </Button>
          </div>
        </form>

        <div className="pt-2">
          <Button variant="outline" onClick={() => navigate('/')} className="w-full text-xs py-3 rounded-xl">
            Return to Digital Menu
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  // Timeline steps: Pending -> Preparing -> Ready -> Completed
  const timelineSteps = [
    { key: 'pending', label: 'Payment Verification', desc: 'Visit counter to pay & confirm' },
    { key: 'preparing', label: 'Kitchen Preparing', desc: 'Chef is preparing your food' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'Collect your order at counter' },
    { key: 'completed', label: 'Order Completed', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-8 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      {/* Keep Tab Open & Sound Alert Notification Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-amber-300 animate-bounce shrink-0" />
          <span>Keep this tab open to track your live order status and hear sound alerts when your food is ready!</span>
        </div>
        <button
          type="button"
          onClick={() => requestNotificationPermission()}
          className="bg-white text-orange-600 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-50 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Enable Sound Alerts</span>
        </button>
      </div>

      {/* Restaurant Header */}
      <div className="text-center space-y-1">
        <span className="bg-orange-50 text-orange-600 text-xs font-extrabold px-3.5 py-1 rounded-full border border-orange-200 inline-block">
          {order.restaurantName || restaurant.name || 'QRasoi Restaurant'}
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
          Live Order Status
        </h1>
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-orange-500 animate-spin" />
          <span>Auto-syncing • Last updated at {lastUpdated.toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Hero Order ID Card */}
      <Card className="bg-white border-2 border-orange-500/30 p-6 text-center space-y-4 shadow-lg relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Order ID</span>
          <h2 className="font-heading font-extrabold text-4xl text-orange-600 mt-1 font-mono tracking-wider">{order.id}</h2>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Customer: {order.customerName} ({order.tableNumber})
          </p>
        </div>

        <div className="inline-flex items-center justify-center gap-2">
          <Badge status={order.status}>{statusConfig.label}</Badge>
        </div>

        <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {order.status === 'pending' && 'Please visit the cashier counter to pay and confirm your order.'}
          {order.status === 'preparing' && 'Your food is being prepared with fresh ingredients by our chef.'}
          {order.status === 'ready' && 'Your order is ready! Please collect it from the pickup counter.'}
          {order.status === 'completed' && 'Order completed. Thank you for dining with us!'}
          {order.status === 'cancelled' && 'This order has been cancelled.'}
        </p>

        {/* Download PDF Bill Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownloadBillPdf}
            disabled={isGeneratingPdf}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                <span>Generating Tax Invoice PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-orange-400" />
                <span>Download Official Bill / Tax Invoice (PDF)</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Step Tracker Progress Bar */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
        <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-orange-500" /> Kitchen Preparation Progress
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {timelineSteps.map((step, idx) => {
            const isFinished = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    isFinished
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isFinished ? '✓' : idx + 1}
                </div>

                <div className="flex-1">
                  <h4
                    className={`text-xs font-extrabold transition-colors ${
                      isCurrent ? 'text-orange-600' : isFinished ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ordered Items Breakdown */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-slate-800 text-sm">Order Items Summary</h3>
          <span className="text-xs text-slate-500 font-semibold">{order.items.length} Dish(es)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{item.menuItem?.name || 'Dish'}</span>
                  <span className="text-slate-400 text-[11px]">× {item.quantity}</span>
                </div>
                {item.notes && <p className="text-[11px] text-orange-600 italic">Note: {item.notes}</p>}
              </div>

              <div className="font-extrabold text-slate-900 font-mono">
                {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm font-extrabold text-slate-900">
          <span>Total Paid / Payable:</span>
          <span className="text-orange-600 font-mono text-base">{formatCurrency(order.total || order.subtotal)}</span>
        </div>
      </Card>
    </div>
  );
};

import { format, parseISO } from 'date-fns';
import { OrderStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string, formatStr = 'dd MMM yyyy, hh:mm a', ..._rest: any[]): string => {
  try {
    if (!dateString) return '';
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    return dateString || '';
  }
};

export const generateOrderId = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `QR-${randomNum}`;
};

export const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Awaiting Payment Verification',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        dotBg: 'bg-amber-500',
        chefActionLabel: 'Awaiting Owner Verification',
      };
    case 'preparing':
      return {
        label: 'Preparing in Kitchen',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        dotBg: 'bg-blue-500',
        chefActionLabel: 'Mark Ready',
      };
    case 'ready':
      return {
        label: 'Ready for Pickup',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotBg: 'bg-emerald-500',
        chefActionLabel: 'Mark Completed',
      };
    case 'completed':
      return {
        label: 'Completed',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        dotBg: 'bg-slate-400',
        chefActionLabel: 'Completed',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        dotBg: 'bg-red-500',
        chefActionLabel: 'Cancelled',
      };
    case 'expired':
      return {
        label: 'Expired',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        dotBg: 'bg-red-500',
        chefActionLabel: 'Expired',
      };
    default:
      return {
        label: status || 'Unknown',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        dotBg: 'bg-slate-400',
        chefActionLabel: status || 'Unknown',
      };
  }
};

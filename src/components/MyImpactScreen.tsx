import React, { useEffect } from 'react';
import { useFoodRescue, getDefaultHomeScreen } from '../context/FoodRescueContext';
import {
  ChevronLeft,
  Utensils,
  CheckCircle2,
  Scale,
  HeartHandshake,
  Package,
  BarChart3,
} from 'lucide-react';

function parseKg(quantityText: string): number {
  const match = quantityText.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function formatKg(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export const MyImpactScreen: React.FC = () => {
  const { currentUser, foodListings, requests, setActiveScreen } = useFoodRescue();

  const role = currentUser?.userType;
  const isNonAdminAuthorized = role === 'donor' || role === 'receiver' || role === 'ngo';

  useEffect(() => {
    if (!currentUser || !isNonAdminAuthorized) {
      setActiveScreen(getDefaultHomeScreen(role));
    }
  }, [currentUser, isNonAdminAuthorized, role, setActiveScreen]);

  if (!currentUser || !isNonAdminAuthorized) {
    return null;
  }

  const isDonor = role === 'donor';

  // Strictly personal metrics scoped to currentUser.id only (no platform-wide data)
  const myDonations = isDonor
    ? foodListings.filter((f) => f.donorId === currentUser.id)
    : [];
  const myDonorRequests = isDonor
    ? requests.filter((r) => r.donorId === currentUser.id)
    : [];
  const donorCollected = myDonorRequests.filter((r) => r.requestStatus === 'collected');
  const donorKgDonated = donorCollected.reduce(
    (sum, r) => sum + parseKg(r.quantityRequested),
    0
  );
  const donorMealsProvided = Math.round(donorKgDonated / 0.4);

  const myReceiverRequests = !isDonor
    ? requests.filter((r) => r.receiverId === currentUser.id)
    : [];
  const receiverCollected = myReceiverRequests.filter(
    (r) => r.requestStatus === 'collected'
  );
  const receiverKgReceived = receiverCollected.reduce(
    (sum, r) => sum + parseKg(r.quantityRequested),
    0
  );
  const receiverMealsReceived = Math.round(receiverKgReceived / 0.4);

  const cards = isDonor
    ? [
        {
          label: 'Donations Posted',
          value: String(myDonations.length),
          icon: <Utensils className="w-4 h-4" />,
          iconBg: 'bg-orange-50 text-orange-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Successful Collections',
          value: String(donorCollected.length),
          icon: <CheckCircle2 className="w-4 h-4" />,
          iconBg: 'bg-emerald-50 text-emerald-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Total kg Donated',
          value: `${formatKg(donorKgDonated)} kg`,
          icon: <Scale className="w-4 h-4" />,
          iconBg: 'bg-sky-50 text-sky-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Meals Provided',
          value: String(donorMealsProvided),
          icon: <HeartHandshake className="w-4 h-4" />,
          iconBg: 'bg-emerald-50 text-[#087A28]',
          valueColor: 'text-[#087A28]',
        },
      ]
    : [
        {
          label: 'Food Requests',
          value: String(myReceiverRequests.length),
          icon: <Package className="w-4 h-4" />,
          iconBg: 'bg-amber-50 text-amber-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Successful Collections',
          value: String(receiverCollected.length),
          icon: <CheckCircle2 className="w-4 h-4" />,
          iconBg: 'bg-emerald-50 text-emerald-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Total kg Received',
          value: `${formatKg(receiverKgReceived)} kg`,
          icon: <Scale className="w-4 h-4" />,
          iconBg: 'bg-sky-50 text-sky-600',
          valueColor: 'text-slate-900',
        },
        {
          label: 'Meals Received',
          value: String(receiverMealsReceived),
          icon: <HeartHandshake className="w-4 h-4" />,
          iconBg: 'bg-emerald-50 text-[#087A28]',
          valueColor: 'text-[#087A28]',
        },
      ];

  const chartBars = isDonor
    ? [
        { label: 'Posted', count: myDonations.length, color: 'from-[#087A28] to-[#66BB6A]' },
        {
          label: 'Requested',
          count: myDonorRequests.filter((r) => r.requestStatus === 'requested').length,
          color: 'from-sky-500 to-sky-400',
        },
        {
          label: 'In Pickup',
          count: myDonorRequests.filter((r) => r.requestStatus === 'pickup_in_progress').length,
          color: 'from-amber-500 to-amber-400',
        },
        {
          label: 'Collected',
          count: donorCollected.length,
          color: 'from-emerald-700 to-emerald-500',
        },
      ]
    : [
        {
          label: 'Requested',
          count: myReceiverRequests.filter((r) => r.requestStatus === 'requested').length,
          color: 'from-sky-500 to-sky-400',
        },
        {
          label: 'In Pickup',
          count: myReceiverRequests.filter((r) => r.requestStatus === 'pickup_in_progress').length,
          color: 'from-amber-500 to-amber-400',
        },
        {
          label: 'Collected',
          count: receiverCollected.length,
          color: 'from-[#087A28] to-[#66BB6A]',
        },
        {
          label: 'Cancelled',
          count: myReceiverRequests.filter((r) => r.requestStatus === 'cancelled').length,
          color: 'from-slate-400 to-slate-300',
        },
      ];

  const maxBarCount = Math.max(1, ...chartBars.map((b) => b.count));

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-100">
        <button
          onClick={() => setActiveScreen(getDefaultHomeScreen(role))}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center min-w-0">
          <h2 className="text-sm font-extrabold text-slate-900 font-heading truncate">
            My Impact
          </h2>
          <p className="text-[10px] font-semibold text-[#087A28] truncate">
            {isDonor
              ? 'Your Personal Donation Summary'
              : role === 'ngo'
              ? 'Your NGO Collection Summary'
              : 'Your Personal Collection Summary'}
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* 4 Simple Personal Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${card.iconBg}`}
            >
              {card.icon}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block leading-snug">
                {card.label}
              </span>
              <span className={`text-xl font-black font-heading mt-0.5 block ${card.valueColor}`}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* One Small Personal Activity Chart */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-800 font-heading flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#087A28]" />
            <span>{isDonor ? 'My Donation Activity' : 'My Request Activity'}</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            {isDonor ? `${myDonations.length} listings` : `${myReceiverRequests.length} requests`}
          </span>
        </div>

        <div className="h-36 flex items-end justify-around gap-3 pt-4 px-2 pb-1 border-b border-slate-100">
          {chartBars.map((bar) => {
            const heightPct =
              bar.count > 0 ? Math.max(14, Math.round((bar.count / maxBarCount) * 100)) : 6;
            return (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-700">{bar.count}</span>
                <div
                  className={`w-7 rounded-t-lg transition-all duration-500 ${
                    bar.count > 0 ? `bg-gradient-to-t ${bar.color}` : 'bg-slate-200'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-500 text-center">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-400 mt-2.5 text-center">
          Calculated from your own {isDonor ? 'donated and collected' : 'requested and collected'} meals (0.4 kg = 1 meal).
        </p>
      </div>
    </div>
  );
};

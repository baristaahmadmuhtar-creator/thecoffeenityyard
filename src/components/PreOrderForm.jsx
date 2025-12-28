import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, User, ChevronLeft, ChevronRight as RightArrow, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    try {
        const date = new Date(dateString + 'T00:00:00'); 
        if (isNaN(date)) return 'Select Date';
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return 'Select Date';
    }
};

const toYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    return `${hours}:${m} ${ampm}`;
};

const DatePickerModal = ({ isOpen, onClose, onSelect, initialDate, minDateObj }) => {
    const effectiveMinDate = minDateObj || new Date();
    const minDateYYYYMMDD = toYYYYMMDD(effectiveMinDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [displayDate, setDisplayDate] = useState(new Date()); 

    const calendarDays = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
        
        const days = [];
        for (let i = startDayIndex; i > 0; i--) {
            days.push({ date: new Date(year, month, 1 - i), currentMonth: false });
        }
        const lastDayOfMonth = new Date(year, month + 1, 0);
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), currentMonth: true });
        }
        let dayCounter = 1;
        while (days.length < 42) {
             days.push({ date: new Date(year, month + 1, dayCounter++), currentMonth: false });
        }
        return days; 
    }, [displayDate]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    onClick={e => e.stopPropagation()}
                    className="bg-old-lace rounded-t-[2rem] md:rounded-[2rem] p-6 w-full max-w-sm shadow-2xl pb-safe-bottom border-t border-white/50"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-heading">
                            Select Date
                        </h4>
                        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                            <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition text-slate-600"><ChevronLeft size={18}/></button>
                            <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition text-slate-600"><RightArrow size={18}/></button>
                        </div>
                    </div>
                    <div className="text-center font-bold text-lg mb-4 text-slate-800 bg-white/50 py-2 rounded-xl border border-white">
                        {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dayObj, index) => {
                            const dateStr = toYYYYMMDD(dayObj.date);
                            const isDisabled = dateStr < minDateYYYYMMDD;
                            const isSelected = dateStr === selectedDate;
                            
                            return (
                                <button 
                                    key={index}
                                    disabled={isDisabled}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`w-full aspect-square rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center ${
                                        isSelected ? 'bg-flag-red text-white shadow-lg shadow-flag-red/30' : 
                                        isDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : 'text-slate-700 bg-white hover:bg-white hover:text-flag-red shadow-sm border border-white'
                                    }`}
                                >
                                    {dayObj.date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => { onSelect(selectedDate); onClose(); }} disabled={!selectedDate} className="w-full py-4 mt-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-flag-red transition-all disabled:opacity-50 shadow-lg">
                        Confirm Date
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const TimePickerModal = ({ isOpen, onClose, onSelect, initialTime, minTimeStr }) => {
    const [selectedTime, setSelectedTime] = useState(initialTime);

    useEffect(() => {
        if (isOpen && minTimeStr && (!initialTime || initialTime < minTimeStr)) {
            setSelectedTime(minTimeStr);
        }
    }, [isOpen, minTimeStr, initialTime]);

    const handleConfirm = () => {
        if (!selectedTime) return;
        const [h, m] = selectedTime.split(':').map(Number);
        const mins = h * 60 + m;
        
        if (mins < 420 || mins > 1380) { 
            toast.error("We are open from 07:00 AM to 11:00 PM.");
            return;
        }
        if (minTimeStr) {
            const [mh, mm] = minTimeStr.split(':').map(Number);
            if (mins < mh * 60 + mm) {
                toast.error(`Earliest pickup is ${formatTimeAMPM(minTimeStr)}`);
                return;
            }
        }
        onSelect(selectedTime);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    onClick={e => e.stopPropagation()}
                    className="bg-old-lace rounded-t-[2rem] md:rounded-[2rem] p-8 w-full max-w-sm shadow-2xl pb-safe-bottom border-t border-white/50"
                >
                    <h4 className="text-2xl font-bold text-slate-900 mb-2 text-center font-heading">Select Time</h4>
                    <p className="text-center text-slate-500 text-sm mb-8 font-medium">Opening Hours: 07:00 AM - 11:00 PM</p>
                    
                    <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-white ring-4 ring-slate-50">
                        <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full bg-transparent text-5xl font-black text-center outline-none text-slate-900 font-sans p-2"/>
                    </div>
                    <button onClick={handleConfirm} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-flag-red transition-all shadow-lg">Confirm Time</button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const PreOrderForm = ({ onClose }) => {
  const { cart, cartTotal, formatBND } = useCart();
  const [formData, setFormData] = useState({ name: '', date: '', time: '', notes: '' });
  const [modalOpen, setModalOpen] = useState(null);

  // Lock scroll
  useBodyScrollLock(true);

  const { minDateObj, minTimeForTodayStr } = useMemo(() => {
      const now = new Date();
      let maxPrepHours = 0;
      let forceNextDay = false;

      cart.forEach(item => {
          const itemPrep = Number(item.prepTime || 24); 
          if (itemPrep >= 24) forceNextDay = true;
          if (itemPrep > maxPrepHours) maxPrepHours = itemPrep;
      });

      const openingTime = new Date(); openingTime.setHours(7, 0, 0, 0); 
      let startTime = now < openingTime ? openingTime : now;
      let earliest = new Date(startTime.getTime() + (maxPrepHours * 3600000));
      
      if (earliest < openingTime) earliest = openingTime;

      const closing = new Date(); closing.setHours(23, 0, 0, 0);
      let resDate = new Date();
      let resTime = null;

      if (forceNextDay || earliest > closing) {
          resDate.setDate(now.getDate() + 1);
          resDate.setHours(0,0,0,0);
      } else {
          resDate.setHours(0,0,0,0);
          resTime = `${String(earliest.getHours()).padStart(2,'0')}:${String(earliest.getMinutes()).padStart(2,'0')}`;
      }
      return { minDateObj: resDate, minTimeForTodayStr: resTime };
  }, [cart]);

  const handleSend = () => {
    if (!formData.name.trim()) {
        toast.error("Please enter your name.");
        return;
    }
    if (!formData.date) {
        toast.error("Please select a pickup date.");
        return;
    }
    if (!formData.time) {
        toast.error("Please select a pickup time.");
        return;
    }
    
    const orderID = Math.floor(1000 + Math.random() * 9000); 
    let msg = `*📦 NEW ORDER - #${orderID}*\n─────────────────\n`;
    msg += `👤 *CUSTOMER INFO*\nName : *${formData.name}*\nDate : ${formatDate(formData.date)}\nTime : ${formatTimeAMPM(formData.time)}\n─────────────────\n\n`;
    msg += `🛒 *ORDER LIST (${cart.length} Items)*\n`;
    
    cart.forEach((item, idx) => {
      let dName = item.name;
      if (item.selectedOption) dName = dName.split('(')[0].trim();
      msg += `${idx + 1}. *${dName}* (x${item.quantity})\n`;
      if (item.selectedOption) msg += `   └ _${item.selectedOption.replace(/[()]/g, '')}_\n`;
      msg += `   💲 ${formatBND(item.price * item.quantity)}\n\n`;
    });

    if(formData.notes) msg += `─────────────────\n📝 *NOTES:*\n_${formData.notes}_\n`;
    msg += `─────────────────\n💰 *TOTAL: ${formatBND(cartTotal)}*\n─────────────────\nThank you! 🙏`;

    window.open(`https://wa.me/6738304535?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-old-lace w-full max-w-lg rounded-t-3xl md:rounded-[2.5rem] relative z-10 shadow-2xl h-[90dvh] md:h-auto flex flex-col border-t border-white/50"
          >
            <div className="p-6 md:p-8 border-b border-almond-silk/50 flex justify-between items-center sticky top-0 bg-old-lace z-10 rounded-t-[2.5rem]">
              <div>
                  <h3 className="text-2xl font-black text-slate-900 font-heading">Finalize Order</h3>
                  <p className="text-slate-500 text-sm font-medium">Please provide your pickup details.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white hover:bg-almond-silk text-slate-500 active:scale-95 transition-colors"><X size={24}/></button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-grow pb-32 md:pb-8">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex gap-2 ml-1">Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-flag-red transition-colors"/>
                    <input type="text" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-flag-red focus:border-transparent transition-all text-base border border-almond-silk/50 shadow-sm appearance-none"/>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex gap-2 ml-1">Date <span className="text-red-500">*</span></label>
                    <div onClick={() => setModalOpen('date')} className={`bg-white border border-almond-silk/50 rounded-2xl px-4 py-4 flex justify-between items-center cursor-pointer hover:border-flag-red hover:shadow-md transition-all group active:scale-[0.98] ${formData.date ? 'ring-1 ring-flag-red/10' : ''}`}>
                        <span className={`font-bold text-sm ${formData.date ? 'text-slate-900' : 'text-slate-400'}`}>{formatDate(formData.date)}</span>
                        <Calendar size={18} className={`${formData.date ? 'text-flag-red' : 'text-slate-300'} group-hover:text-flag-red transition-colors`}/>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex gap-2 ml-1">Time <span className="text-red-500">*</span></label>
                    <div onClick={() => setModalOpen('time')} className={`bg-white border border-almond-silk/50 rounded-2xl px-4 py-4 flex justify-between items-center cursor-pointer hover:border-flag-red hover:shadow-md transition-all group active:scale-[0.98] ${formData.time ? 'ring-1 ring-flag-red/10' : ''}`}>
                        <span className={`font-bold text-sm ${formData.time ? 'text-slate-900' : 'text-slate-400'}`}>{formData.time ? formatTimeAMPM(formData.time) : 'Select Time'}</span>
                        <Clock size={18} className={`${formData.time ? 'text-flag-red' : 'text-slate-300'} group-hover:text-flag-red transition-colors`}/>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex gap-2 ml-1">Notes (Optional)</label>
                 <div className="relative group">
                    <MessageSquare size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-flag-red transition-colors"/>
                    <textarea className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 font-medium text-base text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-flag-red h-28 resize-none border border-almond-silk/50 shadow-sm appearance-none transition-all" placeholder="Any special requests or allergies?" onChange={e => setFormData({...formData, notes: e.target.value})}>{formData.notes}</textarea>
                 </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-almond-silk/50 bg-white/50 backdrop-blur-xl md:rounded-b-[2.5rem] absolute bottom-0 left-0 right-0 z-20 pb-safe-bottom">
              <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Estimate</span>
                  <span className="text-flag-red font-black text-3xl tracking-tight">{formatBND(cartTotal)}</span>
              </div>
              <button onClick={handleSend} className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-2xl flex justify-center items-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] hover:shadow-green-500/30">
                Place Order on WhatsApp <ChevronRight size={20}/>
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
      
      <DatePickerModal 
          isOpen={modalOpen === 'date'} 
          onClose={() => setModalOpen(null)} 
          onSelect={(date) => setFormData({...formData, date, time: ''})} 
          initialDate={formData.date}
          minDateObj={minDateObj} 
      />
      
      <TimePickerModal 
          isOpen={modalOpen === 'time'} 
          onClose={() => setModalOpen(null)} 
          onSelect={(time) => setFormData({...formData, time})} 
          initialTime={formData.time}
          minTimeStr={formData.date === toYYYYMMDD(new Date()) ? minTimeForTodayStr : null}
      />
    </>
  );
};
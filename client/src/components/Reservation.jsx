import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays } from 'date-fns';
import { ArrowLeft, Calendar, CheckCircle2, Clock, CreditCard, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import axios from 'axios';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export const Reservation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState('details')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: 2 });
  const [orderRef, setOrderRef] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [toPay, setToPay] = useState(0);

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const key = import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY;
  const configuredBase = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && closeModal()
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isModalOpen])

  useEffect(()=>{
    const amount = 100 * Number(formData.guests) - (100 * Number(formData.guests) * 0.1);
    setToPay(amount)
  }, [formData])
  
  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setStep('details')
      setOrderRef('')
    }, 300)
  }

  const handlePaymentSuccess = async (response) => {
    try {
      toast.success(`Booked! Ref: ${response.reference}`);
      setOrderRef(response.reference);
      await createBooking();
    } catch (err) {
      toast.error('Payment succeeded but booking save failed');
      console.error(err);
    }
  }
  
  const handlePaymentClose = () => {
    toast.info('Payment window closed');
  };
  
  const handlePay = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Fill all fields');
      return;
    }
    if (!formData.date || !formData.time) {
      toast.error('Pick date & time');
      return;
    }
  
    try {
      const handler = window.PaystackPop.setup({
        key: key,
        email: formData.email,
        amount: Math.round(toPay * 100), // Paystack uses kobo
        currency: 'GHS',
        ref: `NBC_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          custom_fields: [
            { display_name: "Service", variable_name: "service", value: 'Beauty Consultation' },
            { display_name: "Date", variable_name: "date", value: formData.date },
            { display_name: "Time", variable_name: "time", value: formData.time }
          ]
        },
        callback: (response)=>handlePaymentSuccess(response),
        onClose: handlePaymentClose,
      });
      handler.openIframe();
    } catch (error) {
      console.error(error)
      toast.error('Payment failed to initialize');
    }
  };
  
  const createBooking = async () => {
    try {
      const book = await axios.post(`${backendUrl}/order/consult`, { formData });
      if (book.data.success) {
        toast.success("Booking confirmed!");
        setStep('success');
      } else {
        toast.error("Booking saved locally. Contact support with ref: " + orderRef);
        console.log(book.data)
      }
    } catch (err) {
      toast.error("Booking saved locally. Contact support with ref: " + orderRef);
      console.error(err);
    }
  };
  
  const updateField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value }))
  }

  return (
    <div id='reserve'>
      <div className="flex justify-center bg-zinc-100 px-4 py-20 text-zinc-900 dark:bg-zinc-900 dark:text-white">
        <motion.button
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onClick={() => setIsModalOpen(true)} 
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border-2 border-[#C5A059] px-8 py-3 font-semibold text-[#C5A059] transition hover:bg-[#C5A059] hover:text-white">
          Book Beauty Consultation
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm'
            />

            <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className='w-full max-w-lg'
              >
                <div className='max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900'>

                  {step === 'details' && (
                    <div className='p-6 sm:p-8'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <h3 className='text-2xl font-bold text-zinc-900 dark:text-white'>
                            Book a Beauty Consultation
                          </h3>
                          <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
                            GHS 100 per person • 10% off groups
                          </p>
                        </div>
                        <button onClick={closeModal} className='-mr-2 -mt-2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:rotate-90 transition dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'>
                          <X className='h-5 w-5' />
                        </button>
                      </div>

                      <form onSubmit={(e) => {e.preventDefault(); setStep('datetime')}} className='mt-6 space-y-4'>
                        <div>
                          <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>Full Name</label>
                          <input type='text' required value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                            className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-800 dark:text-white'
                            placeholder='Enter your name' />
                        </div>

                        <div>
                          <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>Email</label>
                          <input type='email' required value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                            className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-800 dark:text-white'
                            placeholder='your@email.com' />
                        </div>

                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                          <div>
                            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>Phone</label>
                            <input type='tel' required value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}
                              className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-800 dark:text-white'
                              placeholder='+233...' />
                          </div>
                          <div>
                            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>Number of Guests</label>
                            <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#C5A059] dark:border-white/10 dark:bg-zinc-800"
                              onChange={e => updateField('guests', e.target.value)} value={formData.guests}>
                              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                            </select>
                          </div>
                        </div>

                        <button type='submit' className='cursor-pointer mt-2 w-full rounded-full bg-zinc-900 py-4 font-semibold text-white transition hover:bg-[#C5A059] hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-[#C5A059] dark:hover:text-white'>
                          Choose date & time
                        </button>
                      </form>
                    </div>
                  )}

                  {step === 'datetime' && (
                    <div className='p-6 sm:p-8'>
                      <div className='flex items-center gap-3 mb-6'>
                        <button onClick={() => setStep('details')} className='-ml-2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'>
                          <ArrowLeft className='h-5 w-5' />
                        </button>
                        <h3 className='text-2xl font-bold text-zinc-900 dark:text-white'>Pick Date & Time</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                            <Calendar className="h-5 w-5" /> Select Date
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {next7Days.map(date => {
                              const dateStr = format(date, 'yyyy-MM-dd');
                              return (
                                <button key={dateStr} type="button" onClick={() => updateField('date', dateStr)}
                                  className={`rounded-xl border-2 p-3 text-center transition ${
                                    formData.date === dateStr
                                    ? 'border-[#C5A059] bg-[#C5A059] text-white'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-800'
                                  }`}>
                                  <div className="text-xs font-medium">{format(date, 'EEE')}</div>
                                  <div className="text-lg font-bold">{format(date, 'd')}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {formData.date && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                              <Clock className="h-5 w-5" /> Select Time
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {timeSlots.map(time => (
                                <button key={time} type="button" onClick={() => updateField('time', time)}
                                  className={`rounded-xl border-2 p-3 text-sm font-medium transition ${
                                    formData.time === time
                                    ? 'border-[#C5A059] bg-[#C5A059] text-white'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-800'
                                  }`}>
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button onClick={handlePay} disabled={!formData.date || !formData.time}
                          className="cursor-pointer w-full rounded-full bg-zinc-900 py-4 font-semibold text-white hover:bg-[#C5A059] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black">
                          Continue to Payment • ₵{toPay.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 'success' && (
                    <div className='p-8 text-center'>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                        className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10'>
                        <CheckCircle2 className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
                      </motion.div>

                      <h3 className='mt-6 text-2xl font-bold text-zinc-900 dark:text-white'>Booking Confirmed!</h3>
                      <p className='mt-2 text-balance text-sm text-zinc-600 dark:text-zinc-400'>
                        Ref: <span className='font-semibold text-zinc-900 dark:text-white'>{orderRef}</span>
                      </p>
                      <p className='mt-4 text-sm text-zinc-600 dark:text-zinc-400'>
                        We've sent confirmation to <span className='font-semibold text-zinc-900 dark:text-white'>{formData.email}</span>
                      </p>

                      <div className='mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left text-sm dark:border-white/10 dark:bg-zinc-800/50'>
                        <div className='flex justify-between'><span className='text-zinc-600 dark:text-zinc-400'>Name</span><span className='font-medium text-zinc-900 dark:text-white'>{formData.name}</span></div>
                        <div className='mt-3 flex justify-between'><span className='text-zinc-600 dark:text-zinc-400'>Date</span><span className='font-medium text-zinc-900 dark:text-white'>{formData.date}</span></div>
                        <div className='mt-3 flex justify-between'><span className='text-zinc-600 dark:text-zinc-400'>Time</span><span className='font-medium text-zinc-900 dark:text-white'>{formData.time}</span></div>
                        <div className='mt-3 flex justify-between'><span className='text-zinc-600 dark:text-zinc-400'>Amount Paid</span><span className='font-semibold text-emerald-600 dark:text-emerald-400'>₵{toPay.toFixed(2)}</span></div>
                      </div>

                      <button onClick={closeModal}
                        className='mt-8 w-full rounded-full border-2 border-zinc-900 py-4 font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'>
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
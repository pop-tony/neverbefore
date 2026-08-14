import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  const configuredBase = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');

    try {
      const res = await axios.post(`${backendUrl}/order/consult`, { formData });

      if (res.data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', orderNumber: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        console.log(res.data)
      }
    } catch(err) {
      setStatus('error');
      console.error(err)
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C5A059]">Support</p>
          <h1 className="text-5xl font-black tracking-tight md:text-6xl">Contact Never Before Cosmetic</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Questions about orders, formulas, or skin rituals? We're here to help.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 text-xl font-bold">Visit Our Atelier</h3>
              <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-[#C5A059]" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Email</p>
                    <a href="mailto:hello@neverbeforecosmetic.com" className="hover:text-[#C5A059]">hello@neverbeforecosmetic.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-[#C5A059]" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Phone</p>
                    <a href="tel:+233598227146" className="hover:text-[#C5A059]">+233 59 822 7146</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-[#C5A059]" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">Atelier</p>
                    <p>Adabraka, Accra<br />Ghana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8234567890123!2d-0.2089!3d5.5600!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzMnMzYuMCJOIDDCsDEyJzMyLjAiVw!5e0!3m2!1sen!2sgh!4v1234567890"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-300"
              ></iframe>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Name <span className="text-[#C5A059]">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:bg-zinc-900 ${errors.name? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                    placeholder="Your name" />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Email <span className="text-[#C5A059]">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:bg-zinc-900 ${errors.email? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                    placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Phone Number <span className="text-[#C5A059]">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:bg-zinc-900 ${errors.phone? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                    placeholder="+233 50 123 4567" />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Order Number <span className="text-zinc-400">(optional)</span></label>
                  <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="#12345" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Subject <span className="text-[#C5A059]">*</span></label>
                <select name="subject" value={formData.subject} onChange={handleChange}
                  className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:bg-zinc-900 ${errors.subject? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}>
                  <option value="">Select a topic</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Formula Help">Formula Help</option>
                  <option value="Shade Matching">Shade Matching</option>
                  <option value="Returns">Returns & Exchanges</option>
                  <option value="Payment">Payment</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Message <span className="text-[#C5A059]">*</span></label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={6}
                  className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#C5A059] dark:bg-zinc-900 ${errors.message? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                  placeholder="Tell us how we can help..." />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-semibold">Message sent! We'll get back to you soon.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-400">
                  Something went wrong. Please try again or email us directly.
                </div>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                {status === 'loading'? 'Sending...' : (<><Send className="h-4 w-4" />Send Message</>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

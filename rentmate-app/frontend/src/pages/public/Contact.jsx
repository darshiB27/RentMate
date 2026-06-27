import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock, 
  FiTwitter, 
  FiLinkedin, 
  FiFacebook, 
  FiInstagram,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiRotateCcw,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import axiosInstance from '../../config/axios.js';

// Fix Leaflet Default Icon image asset loading paths in Vite bundler environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@rentmate.com';

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full Name must be at least 2 characters.')
    .max(100, 'Full Name cannot exceed 100 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Invalid email address format.'),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters.')
    .max(200, 'Subject cannot exceed 200 characters.'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.'),
});

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeFaq, setActiveFaq] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setToast({ show: false, message: '', type: 'success' });
    try {
      const response = await axiosInstance.post('/contact/send', data);
      setToast({
        show: true,
        message: response.data?.message || 'Thank you! Your message has been sent successfully.',
        type: 'success',
      });
      reset();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Something went wrong. Please check your inputs and try again.';
      setToast({
        show: true,
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    reset();
    setToast({ show: false, message: '', type: 'success' });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How to list a property?',
      a: 'Owners can register, complete their verification, and list their PG, Hostel, or flat by navigating to the "Add Property" section of the owner dashboard.',
    },
    {
      q: 'How to contact an owner?',
      a: 'Register or sign in as a tenant, search for your desired property, and click "Send Inquiry" or "Chat" to connect directly with the owner.',
    },
    {
      q: 'How does verification work?',
      a: 'Our verification team reviews property papers, local details, and conducts physical checks where possible to assign the "Verified" badge to approved properties.',
    },
    {
      q: 'Refund policy',
      a: 'RentMate is a discovery platform and does not directly handle tenant deposits or booking amounts. Booking rules and refunds depend on your direct agreement with the owner.',
    },
    {
      q: 'Account issues',
      a: 'If you face account lockout, password issues, or role configuration errors, submit a request via this contact form and we will resolve it within 24-48 hours.',
    },
    {
      q: 'Report a problem',
      a: 'To report incorrect details, suspicious listings, or misconduct, click the "Report" button on the property page or include full details in this contact form.',
    },
  ];

  return (
    <div className="space-y-12 pb-12 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border text-white transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 border-emerald-500' 
            : 'bg-rose-600 border-rose-500'
        }`}>
          {toast.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden brand-gradient text-white py-16 px-6 sm:px-12 text-center shadow-xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
            Contact RentMate
          </h1>
          <p className="text-base sm:text-lg text-slate-100 max-w-2xl mx-auto font-medium">
            We're here to help you find your perfect room, PG, hostel, or rental accommodation.
          </p>
        </div>
      </section>

      {/* Grid Layout: Contact Info & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information & Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
              Get in Touch
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <FiMail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 font-sans">Email Address</h3>
                  <a href={`mailto:${supportEmail}`} className="text-base font-bold text-slate-800 hover:text-indigo-600 transition-colors font-sans">
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <FiPhone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 font-sans">Phone Number</h3>
                  <a href="tel:+917571022895" className="text-base font-bold text-slate-800 hover:text-indigo-600 transition-colors font-sans">
                    +91 75710 22895
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 font-sans">Office Address</h3>
                  <p className="text-base font-bold text-slate-800 font-sans leading-relaxed">
                    Madan Mohan Malaviya University of Technology (MMMUT)<br />
                    Gorakhpur, Uttar Pradesh - 273010<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 font-sans">Support Hours</h3>
                  <p className="text-base font-bold text-slate-800 font-sans">
                    Mon - Sat: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-display">Follow Our Community</h3>
            <div className="flex gap-3">
              <a 
                href="https://twitter.com/rentmate" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Follow RentMate on Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/rentmate" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Follow RentMate on LinkedIn"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/rentmate" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Follow RentMate on Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/rentmate" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Follow RentMate on Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 font-display">Send a Message</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 font-sans ${
                    errors.name 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1 font-sans">
                    <FiAlertCircle className="w-3.5 h-3.5 inline" /> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 font-sans ${
                    errors.email 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1 font-sans">
                    <FiAlertCircle className="w-3.5 h-3.5 inline" /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                  Phone Number <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 font-sans ${
                    errors.phone 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1 font-sans">
                    <FiAlertCircle className="w-3.5 h-3.5 inline" /> {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Inquiry about listings"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 font-sans ${
                    errors.subject 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1 font-sans">
                    <FiAlertCircle className="w-3.5 h-3.5 inline" /> {errors.subject.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="Write your message here..."
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 font-sans ${
                  errors.message 
                    ? 'border-rose-400 focus:ring-rose-200' 
                    : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
                {...register('message')}
              />
              {errors.message && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1 font-sans">
                  <FiAlertCircle className="w-3.5 h-3.5 inline" /> {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer select-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer select-none"
              >
                <FiRotateCcw className="w-4 h-4" />
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Office Location Interactive Map */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display">Our Office</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Use controls to zoom or pan the map. Click the marker to see full details.</p>
        </div>
        <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative z-10 bg-slate-100">
          <MapContainer 
            center={[26.73056, 83.43333]} 
            zoom={15} 
            scrollWheelZoom={false} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[26.73056, 83.43333]}>
              <Popup>
                <div className="p-2 space-y-1.5 text-slate-800 max-w-[220px]">
                  <h4 className="font-bold text-sm text-indigo-600 font-display">RentMate Headquarters</h4>
                  <p className="text-xs text-slate-600 font-sans">
                    MMMUT Campus, Gorakhpur, Uttar Pradesh - 273010, India
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                    HQ & Support Center
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Frequently Asked Questions</h2>
          <p className="text-base text-slate-500 font-medium font-sans">Quick answers to common questions about finding and managing listings.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:text-indigo-600 focus:outline-none transition-colors duration-150 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-display">{faq.q}</span>
                  {isOpen ? <FiChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" /> : <FiChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[200px] pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium font-sans">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

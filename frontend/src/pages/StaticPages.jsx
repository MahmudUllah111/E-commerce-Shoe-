import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { submitContactForm } from '../services/api';

export function AboutPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '4rem auto', padding: '0 1.5rem', lineHeight: 1.7 }}>
      <span style={{ color: '#e11d48', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Heritage</span>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.5rem 0 1.5rem', color: '#111827' }}>Engineered for Performance & Everyday Comfort</h1>
      <p style={{ color: '#4b5563', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
        TrustedMart was founded with a single mission: to bring authentic, performance-tested footwear to athletes and streetwear lovers across Bangladesh. We partner directly with authorized global distributors to ensure every pair that leaves our fulfillment center is 100% genuine.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', margin: '3rem 0' }}>
        <div style={{ background: '#f9fafb', padding: '1.8rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem' }}>100% Authenticity</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Every shoe is verified and inspected prior to dispatch. Zero counterfeits tolerated.</p>
        </div>
        <div style={{ background: '#f9fafb', padding: '1.8rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Live Stock Tracking</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Automated back-in-stock alerts keep our community first in line for restocks.</p>
        </div>
        <div style={{ background: '#f9fafb', padding: '1.8rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem' }}>30-Day Guarantee</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>If the size doesn't fit, exchange it with our courier swap service nationwide.</p>
        </div>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    { q: 'How long does delivery take across Bangladesh?', a: 'Inside Dhaka, deliveries arrive in 24 to 48 hours. Outside Dhaka, orders typically take 3 to 5 business days via standard courier.' },
    { q: 'What happens if a size is sold out?', a: 'Click on the out-of-stock size and enter your email address. Our system will send an automated restock email the moment our admin updates the inventory.' },
    { q: 'Can I pay Cash on Delivery (COD)?', a: 'Yes! We support full Cash on Delivery nationwide, as well as digital card and mobile banking payments.' },
    { q: 'How do I exchange an incorrect size?', a: 'Contact our customer support team within 30 days of receiving your package. We will dispatch the replacement pair right away.' }
  ];

  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div style={{ maxWidth: '840px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.5rem', textAlign: 'center' }}>Frequently Asked Questions</h1>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem' }}>Find answers to common questions about orders, sizing, and fulfillment.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{ width: '100%', padding: '1.2rem', background: '#fff', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: '#111827' }}
            >
              {faq.q}
              <ChevronDown size={18} style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 1.2rem 1.2rem', color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.6, background: '#fff' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(formData);
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      alert('Failed to send message. Please ensure the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Contact Customer Support</h1>
      <p style={{ color: '#6b7280', marginBottom: '3rem' }}>Have a question about your order or sizing? Reach out to our team.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="#e11d48" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800 }}>Store HQ</h4>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>House 24, Road 7, Dhanmondi, Dhaka 1205</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={20} color="#e11d48" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800 }}>Phone Support</h4>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>+880 1700-000000 (9am - 9pm)</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} color="#e11d48" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800 }}>Email Inquiries</h4>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>support@trustedmart.com</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sent ? (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} /> Thank you! Your message has been saved and sent to our team.
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Your Name</label>
                <input required type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Email Address</label>
                <input required type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Message</label>
                <textarea required rows="4" placeholder="How can we help you?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ padding: '0.85rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '4rem auto', padding: '0 1.5rem', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '1.5rem' }}>30-Day Return & Exchange Policy</h1>
      <p style={{ color: '#4b5563', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
        At TrustedMart, we want you to be completely satisfied with your footwear. If your shoe doesn't fit or you wish to exchange it for another model, our return policy makes the process effortless.
      </p>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2rem' }}>Policy Guidelines</h3>
      <ul style={{ color: '#4b5563', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <li>Items must be returned within 30 days of the recorded delivery date.</li>
        <li>Shoes must be unworn, undamaged, and inside their original packaging with intact tags.</li>
        <li>Size exchanges are complimentary—our courier will drop off the new size and collect the returned pair simultaneously.</li>
      </ul>
    </div>
  );
}
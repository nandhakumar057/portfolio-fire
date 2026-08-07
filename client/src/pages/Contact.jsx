import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Eraser, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import SocialLinks from '../components/SocialLinks';
import usePageMeta from '../hooks/usePageMeta';
import { getProfile, sendMessage } from '../api';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  usePageMeta({
    title: 'Contact | Nandhakumar Thirunavukkarasu',
    description:
      'Get in touch with Nandhakumar Thirunavukkarasu — UI/UX internships, project ideas, collaborations and opportunities.',
  });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email.';
    if (!form.subject.trim()) next.subject = 'Please add a subject.';
    if (form.message.trim().length < 10) next.message = 'Message should be at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await sendMessage(form);
      setStatus('sent');
      setForm(EMPTY);
      setTimeout(() => setStatus(null), 6000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 6000);
    }
  };

  const handleClear = () => {
    setForm(EMPTY);
    setErrors({});
  };

  return (
    <PageWrap>
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk"
          subtitle="Have a question, opportunity, or idea? Send me a message — I'll get back to you."
        />

        <div className="grid gap-10 lg:grid-cols-[1fr,1.4fr]">
          {/* Info */}
          <Reveal>
            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Contact details</h3>
                <div className="space-y-4 text-sm">
                  <a
                    href={profile?.socials?.email || 'mailto:'}
                    className="flex items-center gap-3 text-accent transition-colors hover:text-white"
                  >
                    <span className="icon-chip">
                      <Mail size={18} />
                    </span>
                    {profile?.email || 'nandha.t2006@gmail.com'}
                  </a>
                  {profile?.socials?.phone && (
                    <a
                      href={profile.socials.phone}
                      className="flex items-center gap-3 text-accent transition-colors hover:text-white"
                    >
                      <span className="icon-chip">
                        <Phone size={18} />
                      </span>
                      {profile.socials.phone.replace('tel:', '')}
                    </a>
                  )}
                  <div className="flex items-center gap-3 text-accent">
                    <span className="icon-chip">
                      <MapPin size={18} />
                    </span>
                    {profile?.location || 'Arakkonam, Tamil Nadu, India'}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Find me online</h3>
                <SocialLinks socials={profile?.socials || {}} size={20} />
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="card space-y-5 p-7" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? 'border-white' : ''}`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-white">{errors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? 'border-white' : ''}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-white">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={`input ${errors.subject ? 'border-white' : ''}`}
                  placeholder="What's this about?"
                />
                {errors.subject && <p className="mt-1.5 text-xs text-white">{errors.subject}</p>}
              </div>

              <div>
                <label className="label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className={`input resize-none ${errors.message ? 'border-white' : ''}`}
                  placeholder="Write your message here..."
                />
                {errors.message && <p className="mt-1.5 text-xs text-white">{errors.message}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-60">
                  <Send size={17} />
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                <button type="button" onClick={handleClear} className="btn-outline">
                  <Eraser size={17} /> Clear Form
                </button>
              </div>

              {/* Status messages */}
              {status === 'sent' && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
                >
                  <CheckCircle2 size={17} /> Message sent! Thanks for reaching out — I&apos;ll reply soon.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#161616] px-4 py-3 text-sm font-medium text-white"
                >
                  <AlertCircle size={17} /> Something went wrong. Please try again later.
                </motion.p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </PageWrap>
  );
}

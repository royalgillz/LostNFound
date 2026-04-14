import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';
import HowItWorks from '../components/ui/HowItWorks';
import { COPY } from '../content/copy';

const CATEGORIES = [
  { label: 'Gadgets',          desc: 'Phones, laptops, earphones, chargers' },
  { label: 'Clothing',         desc: 'Jackets, hoodies, bags, accessories'  },
  { label: 'College Supplies', desc: 'ID cards, notebooks, stationery'      },
  { label: 'Other',            desc: 'Keys, wallets, water bottles and more' },
];

const FAQS = [
  {
    q: 'Who can use LostNFound?',
    a: 'Anyone in the TIET community can browse listings. You need an account to post an item or contact a poster.',
  },
  {
    q: 'How does contact work?',
    a: 'Open a listing and use "Contact Poster". The app opens your email client with a pre-filled message so no personal number is exposed in public.',
  },
  {
    q: 'What should I include in a listing?',
    a: 'Add a clear item name, exact location, date, and 1-3 photos. Mention identifying marks so ownership can be verified quickly.',
  },
  {
    q: 'How many photos can I upload?',
    a: 'Up to 6 photos per listing (max 2 MB each). The first image becomes the listing cover in search results.',
  },
  {
    q: 'What happens after an item is returned?',
    a: 'Please mark the listing as resolved from your profile or listing page so others know it has been handled.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="font-medium text-neutral-800 text-sm">{q}</span>
        <FaChevronDown
          size={12}
          className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-neutral-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function About() {
  return (
    <div>

      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-neutral-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <MdOutlineSchool size={16} /> Thapar Institute of Engineering &amp; Technology
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {COPY.about.heroTitle}
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto">
            {COPY.about.heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Our mission</h2>
        <p className="text-neutral-600 leading-relaxed mb-4">
          Campus lost-and-found updates usually get split across group chats and notice
          boards. LostNFound puts those reports in one searchable place so students and
          staff can find items faster and avoid duplicate posts.
        </p>
        <p className="text-neutral-600 leading-relaxed">
          Our focus is simple: useful information, responsible contact, and clear status.
          When an item is returned, it should be marked resolved so the feed stays clean.
        </p>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-800 text-center mb-10">How it works</h2>
          <HowItWorks />
        </div>
      </section>

      {/* ── What we cover ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-800 mb-8">What we cover</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map(({ label, desc }) => (
            <div key={label} className="flex gap-4 p-5 bg-white border border-neutral-200 rounded-2xl">
              <div className="w-2 rounded-full bg-neutral-300 flex-shrink-0" />
              <div>
                <p className="font-semibold text-neutral-800 text-sm">{label}</p>
                <p className="text-neutral-500 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-800 mb-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Contact</h2>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3 text-neutral-600">
            <MdOutlineSchool size={20} className="text-neutral-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-800">Admin Office</p>
              <p className="text-sm">Thapar Institute of Engineering &amp; Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-neutral-600">
            <FaMapMarkerAlt size={16} className="text-neutral-600 flex-shrink-0" />
            <p className="text-sm">Patiala, Punjab, India, 147004</p>
          </div>
          <div className="flex items-center gap-3 text-neutral-600">
            <FaEnvelope size={15} className="text-neutral-600 flex-shrink-0" />
            <a href="mailto:info@thapar.edu" className="text-sm text-neutral-900 hover:underline">
              info@thapar.edu
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-neutral-300 text-sm mb-8">
            Check current reports or post what you lost/found in under a minute.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/search"
              className="bg-white text-neutral-900 px-6 py-2.5 rounded-full font-medium text-sm hover:bg-neutral-100 transition-colors"
            >
              Browse Items
            </Link>
            <Link
              to="/create-listing"
              className="border border-white/60 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors"
            >
              Report an Item
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

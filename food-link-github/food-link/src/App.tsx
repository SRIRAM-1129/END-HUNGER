import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Crosshair,
  HandHeart,
  MapPin,
  Menu,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Mode = 'find' | 'offer';
type OfferStatus = 'available' | 'claimed';

type Offer = {
  id: string;
  title: string;
  category: string;
  quantity: string;
  location: string;
  distance: string;
  expires: string;
  pickup: string;
  donor: string;
  phone: string;
  description: string;
  status: OfferStatus;
  claimedBy?: string;
};

const seedOffers: Offer[] = [
  {
    id: 'sunrise',
    title: 'Warm sourdough loaves',
    category: 'Bakery',
    quantity: '12 loaves',
    location: 'Mabel Street Bakery',
    distance: '0.4 mi',
    expires: 'Today, 6:30 PM',
    pickup: 'Today, 5:00–6:30 PM',
    donor: 'Mabel Street Bakery',
    phone: '4155550138',
    description: 'Fresh from this morning’s bake. A mix of country loaves and seeded rye.',
    status: 'available',
  },
  {
    id: 'garden',
    title: 'Garden vegetable boxes',
    category: 'Produce',
    quantity: '8 family boxes',
    location: 'Juniper Community Garden',
    distance: '0.8 mi',
    expires: 'Tomorrow, 10:00 AM',
    pickup: 'Today, 4:00–7:00 PM',
    donor: 'Juniper Community Garden',
    phone: '4155550172',
    description: 'Leafy greens, zucchini, tomatoes, and herbs packed for easy sharing.',
    status: 'available',
  },
  {
    id: 'cafe',
    title: 'Prepared lentil stew',
    category: 'Prepared meals',
    quantity: '18 portions',
    location: 'Northside Cafe',
    distance: '1.1 mi',
    expires: 'Today, 8:00 PM',
    pickup: 'Today, 6:00–8:00 PM',
    donor: 'Northside Cafe',
    phone: '4155550194',
    description: 'Vegetarian lentil stew with rice. Please bring clean containers if possible.',
    status: 'available',
  },
  {
    id: 'harbor',
    title: 'Fruit cups for families',
    category: 'Fruit',
    quantity: '24 cups',
    location: 'Harborview Events Hall',
    distance: '1.7 mi',
    expires: 'Today, 7:30 PM',
    pickup: 'Today, 6:30–7:30 PM',
    donor: 'Harborview Events Hall',
    phone: '4155550116',
    description: 'Sealed cups of melon, berries, and grapes left from an afternoon gathering.',
    status: 'available',
  },
];

const categories = ['All food', 'Bakery', 'Produce', 'Prepared meals', 'Fruit'];

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
  return phone;
}

function AppMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-food-link">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))] shadow-soft">
        <HandHeart size={21} strokeWidth={2.3} aria-hidden="true" />
      </div>
      <div className="leading-none">
        <div className="font-display text-[1.35rem] font-bold tracking-[-0.04em]">Food Link</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.19em] text-[hsl(var(--muted-foreground))]">Around the corner</div>
      </div>
    </div>
  );
}

function AppHeader({ mode, onModeChange, onMenu, menuOpen }: { mode: Mode; onModeChange: (mode: Mode) => void; onMenu: () => void; menuOpen: boolean }) {
  return (
    <header className="relative z-20 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <AppMark />
        <nav className="hidden items-center gap-2 rounded-full bg-[hsl(var(--muted))] p-1 md:flex" aria-label="Main navigation">
          <button data-testid="button-mode-find-desktop" onClick={() => onModeChange('find')} className={`rounded-full px-5 py-2 text-sm font-bold transition-spring ${mode === 'find' ? 'bg-[hsl(var(--card))] text-[hsl(var(--secondary))] shadow-soft' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>Find food</button>
          <button data-testid="button-mode-offer-desktop" onClick={() => onModeChange('offer')} className={`rounded-full px-5 py-2 text-sm font-bold transition-spring ${mode === 'offer' ? 'bg-[hsl(var(--card))] text-[hsl(var(--secondary))] shadow-soft' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>Offer food</button>
        </nav>
        <button data-testid="button-mobile-menu" aria-expanded={menuOpen} aria-label="Open menu" onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] md:hidden">
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button data-testid="button-mode-find-mobile" onClick={() => { onModeChange('find'); onMenu(); }} className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === 'find' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--card))]' : 'bg-[hsl(var(--muted))]'}`}>Find food</button>
            <button data-testid="button-mode-offer-mobile" onClick={() => { onModeChange('offer'); onMenu(); }} className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === 'offer' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--card))]' : 'bg-[hsl(var(--muted))]'}`}>Offer food</button>
          </div>
        </div>
      )}
    </header>
  );
}

function OfferCard({ offer, onClaim }: { offer: Offer; onClaim: (offer: Offer) => void }) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-soft transition-spring hover:shadow-lift" data-testid={`card-offer-${offer.id}`}>
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className="rounded-full bg-[hsl(var(--accent)/.25)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--secondary))]" data-testid={`text-category-${offer.id}`}>{offer.category}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid={`text-distance-${offer.id}`}><MapPin size={13} aria-hidden="true" /> {offer.distance}</span>
        </div>
        <h3 className="font-display text-[1.45rem] font-bold leading-[1.05] tracking-[-0.035em]" data-testid={`text-title-${offer.id}`}>{offer.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]" data-testid={`text-description-${offer.id}`}>{offer.description}</p>
        <div className="mt-5 space-y-2 border-t border-[hsl(var(--border))] pt-4 text-sm">
          <div className="flex items-center justify-between gap-4"><span className="text-[hsl(var(--muted-foreground))]">Available</span><strong data-testid={`text-quantity-${offer.id}`}>{offer.quantity}</strong></div>
          <div className="flex items-center justify-between gap-4"><span className="text-[hsl(var(--muted-foreground))]">Pickup</span><strong className="text-right" data-testid={`text-pickup-${offer.id}`}>{offer.pickup}</strong></div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <a data-testid={`link-call-${offer.id}`} href={`tel:${offer.phone}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--secondary))] transition-spring hover:bg-[hsl(var(--muted))]" aria-label={`Call ${offer.donor}`}>
          <Phone size={17} aria-hidden="true" />
        </a>
        <button data-testid={`button-claim-${offer.id}`} onClick={() => onClaim(offer)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--secondary))] px-4 text-sm font-bold text-[hsl(var(--card))] transition-spring hover:brightness-110">
          Claim this food <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]"><Clock3 size={13} aria-hidden="true" /> Best before {offer.expires}</div>
    </article>
  );
}

function ClaimDialog({ offer, onClose, onConfirm }: { offer: Offer; onClose: () => void; onConfirm: (name: string) => void }) {
  const [name, setName] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--secondary)/.46)] p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-md rounded-[1.6rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-lift animate-rise" role="dialog" aria-modal="true" aria-labelledby="claim-title" data-testid="dialog-claim">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><div className="mb-2 inline-flex rounded-full bg-[hsl(var(--accent)/.28)] p-2 text-[hsl(var(--secondary))]"><HandHeart size={18} aria-hidden="true" /></div><h2 id="claim-title" className="font-display text-3xl font-bold tracking-[-.04em]">Save this for someone?</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Tell {offer.donor} who is coming so they can set it aside.</p></div>
          <button data-testid="button-close-claim" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[hsl(var(--border))]" aria-label="Close claim dialog"><X size={17} /></button>
        </div>
        <div className="mb-5 rounded-xl bg-[hsl(var(--muted))] p-4"><div className="font-bold" data-testid="text-claim-offer">{offer.title}</div><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{offer.quantity} · {offer.pickup}</div></div>
        <form onSubmit={submit}>
          <label className="block text-sm font-bold" htmlFor="claimer-name">Your name or organization</label>
          <input data-testid="input-claimer-name" id="claimer-name" autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. The Corner Pantry" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:border-[hsl(var(--primary))]" />
          <button data-testid="button-confirm-claim" type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] font-bold text-[hsl(var(--card))] transition-spring hover:brightness-105">Confirm claim <Check size={17} /></button>
        </form>
      </section>
    </div>
  );
}

function OfferForm({ onSubmit, onCancel }: { onSubmit: (offer: Omit<Offer, 'id' | 'status' | 'distance'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ title: '', category: 'Bakery', quantity: '', location: '', expires: '', pickup: '', donor: '', phone: '', description: '' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };
  return (
    <form onSubmit={submit} className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-soft sm:p-7" data-testid="form-offer">
      <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">A little goes a long way</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.04em]">Offer food nearby</h2><p className="mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">Share what you have and a nearby neighbor can plan a pickup before it spoils.</p></div><button data-testid="button-cancel-offer" type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-full border border-[hsl(var(--border))]" aria-label="Close offer form"><X size={17} /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-bold">What are you offering?<input data-testid="input-offer-title" required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. 8 containers of vegetable curry" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="text-sm font-bold">Type<select data-testid="select-offer-category" value={form.category} onChange={(event) => update('category', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]">{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="text-sm font-bold">How much?<input data-testid="input-offer-quantity" required value={form.quantity} onChange={(event) => update('quantity', event.target.value)} placeholder="e.g. 10 portions" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="text-sm font-bold">Pickup location<input data-testid="input-offer-location" required value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Place people can find you" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="text-sm font-bold">Your name or organization<input data-testid="input-offer-donor" required value={form.donor} onChange={(event) => update('donor', event.target.value)} placeholder="e.g. Elena's Kitchen" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="text-sm font-bold">Pickup window<input data-testid="input-offer-pickup" required value={form.pickup} onChange={(event) => update('pickup', event.target.value)} placeholder="Today, 4:00–6:00 PM" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="text-sm font-bold">Best before<input data-testid="input-offer-expires" required value={form.expires} onChange={(event) => update('expires', event.target.value)} placeholder="Today, 8:00 PM" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
        <label className="sm:col-span-2 text-sm font-bold">Phone to share <span className="font-normal text-[hsl(var(--muted-foreground))]">(entered by you)</span><input data-testid="input-offer-phone" required type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="(415) 555-0123" className="mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /><span className="mt-1.5 block text-xs font-normal text-[hsl(var(--muted-foreground))]">Food Link never reads a phone number from your device. Only this number will be shown to people picking up.</span></label>
        <label className="sm:col-span-2 text-sm font-bold">A few helpful details <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span><textarea data-testid="input-offer-description" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Containers, ingredients, access notes…" rows={3} className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-4 text-sm font-normal outline-none focus:border-[hsl(var(--primary))]" /></label>
      </div>
      <button data-testid="button-publish-offer" type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] font-bold text-[hsl(var(--card))] transition-spring hover:brightness-105 sm:w-auto sm:px-6">Post this offer <Plus size={17} /></button>
    </form>
  );
}

function Home() {
  const [mode, setMode] = useState<Mode>('find');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [category, setCategory] = useState('All food');
  const [search, setSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationState, setLocationState] = useState<'idle' | 'loading' | 'found' | 'denied'>('idle');
  const [notice, setNotice] = useState('');
  const [hydrating, setHydrating] = useState(true);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem('food-link-offers');
        setOffers(saved ? JSON.parse(saved) : seedOffers);
      } catch {
        setOffers(seedOffers);
        setStorageError(true);
      } finally {
        setHydrating(false);
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrating && offers.length) {
      try { window.localStorage.setItem('food-link-offers', JSON.stringify(offers)); } catch { setStorageError(true); }
    }
  }, [offers, hydrating]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const availableOffers = useMemo(() => offers.filter((offer) => offer.status === 'available'), [offers]);
  const visibleOffers = useMemo(() => availableOffers.filter((offer) => {
    const matchesCategory = category === 'All food' || offer.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${offer.title} ${offer.location} ${offer.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [availableOffers, category, search]);

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationState('denied'); return; }
    setLocationState('loading');
    navigator.geolocation.getCurrentPosition(
      () => { setLocationState('found'); setNotice('Showing offers near your current neighborhood.'); },
      () => { setLocationState('denied'); setNotice('No problem — showing the neighborhood list instead.'); },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    );
  };

  const publishOffer = (newOffer: Omit<Offer, 'id' | 'status' | 'distance'>) => {
    const created: Offer = { ...newOffer, id: `local-${Date.now()}`, status: 'available', distance: 'Near you' };
    setOffers((current) => [created, ...current]);
    setShowOfferForm(false);
    setMode('find');
    setNotice('Your offer is live. Neighbors can see it and call you for pickup.');
  };

  const claimOffer = (name: string) => {
    if (!selectedOffer) return;
    setOffers((current) => current.map((offer) => offer.id === selectedOffer.id ? { ...offer, status: 'claimed', claimedBy: name } : offer));
    setSelectedOffer(null);
    setNotice(`Claim saved. Call ${selectedOffer.donor} at ${formatPhone(selectedOffer.phone)} to coordinate pickup.`);
  };

  return (
    <div className="noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <AppHeader mode={mode} onModeChange={(nextMode) => { setMode(nextMode); setShowOfferForm(nextMode === 'offer'); }} onMenu={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} />
      <main>
        <section className="relative overflow-hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--accent)/.2)]">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[28px] border-[hsl(var(--primary)/.1)]" />
          <div className="pointer-events-none absolute -bottom-40 left-[42%] h-72 w-72 rounded-full bg-[hsl(var(--accent)/.28)] blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-20">
            <div className="animate-rise">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card)/.7)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--secondary))]"><Sparkles size={14} aria-hidden="true" /> Good food, close to home</div>
              <h1 className="max-w-2xl font-display text-[clamp(3.2rem,8vw,6.7rem)] font-bold leading-[.91] tracking-[-.065em] text-[hsl(var(--secondary))]">Food finds a<br /><span className="text-[hsl(var(--primary))]">neighbor.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">A simple way to pass along extra meals, bakery trays, and garden harvests to people who can use them today.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button data-testid="button-hero-find" onClick={() => { setMode('find'); setShowOfferForm(false); document.getElementById('nearby-offers')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--secondary))] px-5 font-bold text-[hsl(var(--card))] transition-spring hover:brightness-110">See nearby food <ArrowRight size={17} /></button>
                <button data-testid="button-hero-offer" onClick={() => { setMode('offer'); setShowOfferForm(true); document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--secondary)/.3)] bg-[hsl(var(--card)/.55)] px-5 font-bold text-[hsl(var(--secondary))] transition-spring hover:bg-[hsl(var(--card))]"><Plus size={17} /> Offer food</button>
              </div>
            </div>
            <div className="relative animate-rise stagger-2">
              <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(var(--secondary))] p-6 text-[hsl(var(--card))] shadow-lift sm:p-8">
                <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border-[18px] border-[hsl(var(--accent)/.3)]" />
                <div className="relative">
                  <div className="flex items-center justify-between border-b border-[hsl(var(--card)/.14)] pb-5"><span className="text-sm font-bold tracking-wide">A small neighborhood update</span><span className="rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--secondary))]">Live</span></div>
                  <div className="py-7"><div className="font-display text-5xl font-bold tracking-[-.06em] text-[hsl(var(--accent))]">{availableOffers.length}</div><div className="mt-1 text-sm text-[hsl(var(--card)/.72)]">offers ready for pickup nearby</div></div>
                  <div className="flex items-center gap-3 border-t border-[hsl(var(--card)/.14)] pt-5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--primary))]"><Users size={17} /></div><p className="text-sm leading-5 text-[hsl(var(--card)/.8)]">Every listing is a real person, place, or group in the neighborhood.</p></div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-soft sm:block"><div className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={16} className="text-[hsl(var(--primary))]" /> No silent phone access</div></div>
            </div>
          </div>
        </section>

        <section id="nearby-offers" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-12 lg:px-8 lg:py-16">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]"><MapPin size={14} /> Nearby board</div><h2 className="font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">What’s available today</h2><p className="mt-2 text-[hsl(var(--muted-foreground))]">Choose a pickup that works for you. Please call before heading over.</p></div>
            <button data-testid="button-use-location" onClick={requestLocation} disabled={locationState === 'loading'} className="flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm font-bold text-[hsl(var(--secondary))] transition-spring hover:bg-[hsl(var(--muted))] md:self-auto"><Crosshair size={16} />{locationState === 'loading' ? 'Finding you…' : locationState === 'found' ? 'Using your location' : 'Use my location'}</button>
          </div>
          {locationState === 'idle' && <p className="mb-6 max-w-2xl rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] px-4 py-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]" data-testid="text-location-explanation">Want a tighter list? Choose “Use my location” and your browser will ask permission. We only use it to sort this list; you can keep browsing without it.</p>}
          {locationState === 'denied' && <p className="mb-6 rounded-xl border border-[hsl(var(--accent)/.6)] bg-[hsl(var(--accent)/.16)] px-4 py-3 text-sm text-[hsl(var(--secondary))]" data-testid="status-location-denied">Location wasn’t shared, so this list is showing the neighborhood demo area. You can still browse everything here.</p>}
          <div className="mb-7 flex flex-col gap-3 lg:flex-row">
            <label className="relative block flex-1"><span className="sr-only">Search nearby food</span><input data-testid="input-search-offers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search meals, places, or ingredients" className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 text-sm outline-none transition-spring focus:border-[hsl(var(--primary))]" /></label>
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by food type">{categories.map((item) => <button data-testid={`button-filter-${item.toLowerCase().replaceAll(' ', '-')}`} role="tab" aria-selected={category === item} key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition-spring ${category === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--card))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>{item}</button>)}</div>
          </div>
          {hydrating ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div className="h-[365px] animate-pulse rounded-[1.35rem] bg-[hsl(var(--muted))]" key={item} data-testid={`loading-offer-${item}`} />)}</div> : visibleOffers.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{visibleOffers.map((offer, index) => <div key={offer.id} className={`animate-rise stagger-${Math.min(index + 1, 3)}`}><OfferCard offer={offer} onClaim={setSelectedOffer} /></div>)}</div> : <div className="rounded-[1.6rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] px-6 py-14 text-center" data-testid="empty-offers"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.3)] text-[hsl(var(--secondary))]"><Store size={25} /></div><h3 className="mt-5 font-display text-2xl font-bold">Nothing matches that search</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Try another food type or clear your search. New neighbors add offers throughout the day.</p><button data-testid="button-clear-filters" onClick={() => { setSearch(''); setCategory('All food'); }} className="mt-5 rounded-xl bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--card))]">Clear filters</button></div>}
        </section>

        <section id="offer-section" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/.5)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:px-8 lg:py-16">
            <div className="lg:sticky lg:top-8"><div className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Keep it moving</div><h2 className="max-w-md font-display text-4xl font-bold leading-[.98] tracking-[-.05em] sm:text-5xl">Have a little extra? Someone nearby can use it.</h2><p className="mt-5 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">A clear pickup window and a number you choose to share are all it takes. You stay in control of every handoff.</p><div className="mt-8 space-y-4">{[['01', 'Describe what you have', 'A quick, honest description helps people decide.'], ['02', 'Choose a pickup window', 'Short windows keep food fresh and plans clear.'], ['03', 'Talk it through', 'A direct call makes the handoff feel human.']].map(([number, title, detail]) => <div className="flex gap-3" key={number}><span className="font-display text-xl font-bold text-[hsl(var(--primary))]">{number}</span><div><div className="text-sm font-bold">{title}</div><div className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{detail}</div></div></div>)}</div></div>
            {showOfferForm ? <OfferForm onSubmit={publishOffer} onCancel={() => { setShowOfferForm(false); setMode('find'); }} /> : <div className="flex min-h-[330px] flex-col justify-center rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-soft"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.3)] text-[hsl(var(--secondary))]"><Plus size={25} /></div><h3 className="mt-6 font-display text-3xl font-bold tracking-[-.04em]">Put good food on the board</h3><p className="mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">Posting takes less than a minute. Add the number you want to share so pickup stays easy.</p><button data-testid="button-open-offer-form" onClick={() => { setShowOfferForm(true); setMode('offer'); }} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] font-bold text-[hsl(var(--card))] transition-spring hover:brightness-105 sm:w-fit sm:px-6">Create an offer <ArrowRight size={17} /></button></div>}
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <AppMark />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><span className="flex items-center gap-1.5"><ShieldCheck size={14} /> You choose what to share</span><span className="flex items-center gap-1.5"><Users size={14} /> Built for neighbors</span></div>
        </footer>
      </main>
      {storageError && <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-lg rounded-xl border border-[hsl(var(--accent)/.6)] bg-[hsl(var(--card))] px-4 py-3 text-sm shadow-lift" data-testid="status-storage-error">This browser could not save changes locally. Your updates will remain visible until you refresh.</div>}
      {notice && <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-xl bg-[hsl(var(--secondary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--card))] shadow-lift animate-rise" role="status" data-testid="status-notice"><span>{notice}</span><button data-testid="button-dismiss-notice" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}
      {selectedOffer && <ClaimDialog offer={selectedOffer} onClose={() => setSelectedOffer(null)} onConfirm={claimOffer} />}
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

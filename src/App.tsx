import { useCallback, useEffect, useState } from 'react';
import { Plane, Home, Ticket, ShieldCheck, TreePine } from 'lucide-react';
import { Landing } from '@/components/Landing';
import { AuthPanel } from '@/components/AuthPanel';
import { Dashboard } from '@/components/Dashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { Snowfall } from '@/components/Snowfall';
import {
  loadAssignments,
  loadDates,
  loadMembers,
  saveMembers,
} from '@/lib/storage';
import type { Assignment, EventDates, Member, Panel } from '@/lib/types';
import { ADMIN_SIGN_CODE } from '@/lib/types';

export default function App() {
  const [panel, setPanel] = useState<Panel>('home');
  const [dates, setDates] = useState<EventDates>(() => loadDates());
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadAssignments());
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [returnPanel, setReturnPanel] = useState<Panel>('home');

  const drawDone = assignments.length > 0;

  const syncMembers = useCallback(() => {
    setMembers(loadMembers());
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fresh = loadMembers().find((m) => m.id === currentUser.id);
    if (!fresh) {
      setCurrentUser(null);
    } else if (fresh.status !== currentUser.status || fresh.wishlist !== currentUser.wishlist) {
      setCurrentUser(fresh);
      saveMembers(loadMembers());
    }
  }, [members, currentUser]);

  useEffect(() => {
    const stored = loadMembers();
    const admin = stored.find((m) => m.signCode.toUpperCase() === ADMIN_SIGN_CODE);
    if (admin && admin.status !== 'approved') {
      saveMembers(stored.map((m) => (m.id === admin.id ? { ...m, status: 'approved' } : m)));
      syncMembers();
    }
  }, [syncMembers]);

  const navigate = (p: Panel) => {
    setPanel(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (member: Member) => {
    setCurrentUser(loadMembers().find((m) => m.id === member.id) ?? member);
    setPanel('dashboard');
    window.scrollTo({ top: 0 });
  };

  const goAdmin = () => {
    setReturnPanel(panel === 'home' ? 'home' : panel);
    navigate('admin');
  };

  const isAdmin = currentUser?.signCode.toUpperCase() === ADMIN_SIGN_CODE;
  const loggedIn = !!currentUser;

  const openPanel = panel === 'dashboard' && !currentUser ? 'home' : panel;

  return (
    <div className="min-h-screen flex flex-col">
      <Snowfall />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Plane className="h-5 w-5 text-navy-950 -rotate-45" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white leading-tight">МИАТ Монита</div>
              <div className="text-[10px] text-slate-400 leading-tight">Мэдээлэл лавлагааны тасаг</div>
            </div>
          </button>
          <nav className="flex items-center gap-1.5">
            <HeaderBtn active={openPanel === 'home'} onClick={() => navigate('home')} icon={<Home className="h-4 w-4" />} label="Нүүр" />
            {!loggedIn && (
              <HeaderBtn active={openPanel === 'auth'} onClick={() => navigate('auth')} icon={<Ticket className="h-4 w-4" />} label="Бүртгүүлэх" />
            )}
            {loggedIn && (
              <HeaderBtn active={openPanel === 'dashboard'} onClick={() => navigate('dashboard')} icon={<TreePine className="h-4 w-4" />} label="Миний урилга" />
            )}
            <HeaderBtn active={openPanel === 'admin'} onClick={goAdmin} icon={<ShieldCheck className="h-4 w-4" />} label="Удирдлага" hideOnMobile />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {openPanel === 'home' && (
          <Landing dates={dates} onEnter={loggedIn ? () => navigate('dashboard') : () => navigate('auth')} loggedIn={loggedIn} onAdmin={goAdmin} />
        )}
        {openPanel === 'auth' && <AuthPanel onLogin={handleLogin} />}
        {openPanel === 'dashboard' && currentUser && (
          <Dashboard
            member={currentUser}
            drawDone={drawDone}
            onLogout={() => {
              setCurrentUser(null);
              navigate('home');
            }}
            onUpdate={(m) => setCurrentUser(m)}
          />
        )}
        {openPanel === 'admin' && (
          <AdminPanel
            dates={dates}
            drawDone={drawDone}
            onDatesChange={(d) => setDates(d)}
            onMembersChange={syncMembers}
            onDrawChange={(a) => setAssignments(a)}
            onExit={() => navigate(returnPanel === 'admin' ? 'home' : returnPanel)}
            adminMember={isAdmin ? currentUser : null}
          />
        )}
      </main>

      <div className="sm:hidden sticky bottom-0 z-30 border-t border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-around">
          <TabBtn active={openPanel === 'home'} onClick={() => navigate('home')} icon={<Home className="h-5 w-5" />} label="Нүүр" />
          {!loggedIn && <TabBtn active={openPanel === 'auth'} onClick={() => navigate('auth')} icon={<Ticket className="h-5 w-5" />} label="Бүртгүүлэх" />}
          {loggedIn && <TabBtn active={openPanel === 'dashboard'} onClick={() => navigate('dashboard')} icon={<TreePine className="h-5 w-5" />} label="Миний" />}
          <TabBtn active={openPanel === 'admin'} onClick={goAdmin} icon={<ShieldCheck className="h-5 w-5" />} label="Удирдлага" />
        </div>
      </div>
    </div>
  );
}

function HeaderBtn({
  active,
  onClick,
  icon,
  label,
  hideOnMobile,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hideOnMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-white/10 text-gold-300 border border-gold-500/25'
          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
      } ${hideOnMobile ? 'hidden sm:inline-flex' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
        active ? 'text-gold-300' : 'text-slate-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

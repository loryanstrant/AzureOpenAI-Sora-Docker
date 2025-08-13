import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    // Prefer system
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <header className={`sticky top-0 z-40 border-b bg-white/80 dark:bg-slate-900/70 backdrop-blur transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${scrolled ? 'py-3' : 'py-4'} flex items-center justify-between transition-all`}> 
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">S</span>
            <span className="font-semibold text-lg tracking-tight dark:text-white">Sora Video Generator</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <NavLink to="/" className={({isActive})=>`px-3 py-2 rounded-lg ${isActive? 'text-blue-700 bg-blue-50 dark:bg-slate-800 dark:text-blue-300':'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>Home</NavLink>
            <a className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" href="https://learn.microsoft.com/azure/ai-foundry/openai/video-generation-quickstart" target="_blank" rel="noreferrer">Docs</a>
            <button onClick={toggleTheme} className="ml-2 inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
          <button
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 text-gray-700 dark:border-slate-700 dark:text-gray-200"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div
          id="mobile-nav"
          className={`sm:hidden border-t bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
            <NavLink to="/" onClick={()=>setMobileOpen(false)} className={({isActive})=>`px-3 py-2 rounded-lg ${isActive? 'text-blue-700 bg-blue-50 dark:bg-slate-800 dark:text-blue-300':'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800'}`}>Home</NavLink>
            <a className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800" href="https://learn.microsoft.com/azure/ai-foundry/openai/video-generation-quickstart" target="_blank" rel="noreferrer" onClick={()=>setMobileOpen(false)}>Docs</a>
            <button onClick={()=>{toggleTheme(); setMobileOpen(false);}} className="px-3 py-2 text-left rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800">
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100">
        <div key={location.pathname} className="animate-fade">
          <Outlet />
        </div>
      </main>
      <footer className="border-t bg-white/60 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-gray-500 dark:text-gray-400">
          Powered by Azure OpenAI • Demo UI
        </div>
      </footer>
    </div>
  );
}

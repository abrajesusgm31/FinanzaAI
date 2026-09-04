import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">FinanzasAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            Arquitectura de Ledger Centralizado & RLS
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Gestión financiera inteligente para <span className="text-indigo-600">equipos y familias</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Plataforma robusta con doble partida contable estricta, aislamiento multiusuario por workspace, importación inteligente y análisis potenciado con Gemini AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Comenzar ahora <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-medium px-8 py-3.5 rounded-xl border border-slate-200 transition-all shadow-sm"
            >
              Acceder a mi cuenta
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Ledger Centralizado</h3>
              <p className="text-sm text-slate-600">
                Fuente única de verdad contable con validación estricta y balance cero en transferencias.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Row Level Security</h3>
              <p className="text-sm text-slate-600">
                Seguridad garantizada a nivel de base de datos con Supabase Auth y roles por workspace.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Gemini AI Integrado</h3>
              <p className="text-sm text-slate-600">
                Análisis predictivo, categorización y chat financiero con cifrado de clave de servidor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 text-center text-xs text-slate-500">
        FinanzasAI &copy; {new Date().getFullYear()} — Todos los derechos reservados.
      </footer>
    </div>
  );
}

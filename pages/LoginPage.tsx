
import React, { useState } from 'react';
import { Mail, Lock, Loader2, TrendingUp, AlertCircle, User as UserIcon, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.signUp(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      setError('Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-[1.5rem] mb-6 shadow-xl shadow-emerald-500/20">
            <TrendingUp size={32} className="text-gray-950" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Marketing Money</h1>
          <p className="text-emerald-500/60 mt-3 font-black text-[10px] uppercase tracking-[0.3em]">Agency Command Center</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex bg-gray-900 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-emerald-500 text-gray-950 shadow-lg' : 'text-gray-500'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-emerald-500 text-gray-950 shadow-lg' : 'text-gray-500'}`}
            >
              Ativar Acesso
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] p-4 rounded-2xl flex items-start space-x-3 font-bold uppercase">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="animate-in slide-in-from-top duration-300">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Seu Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado?" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20 group uppercase tracking-widest text-xs">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center">
                  {isLogin ? "Acessar HUB" : "Ativar Perfil"}
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
              Marketing Money Agency © 2024<br/>Painel de Controle Exclusivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

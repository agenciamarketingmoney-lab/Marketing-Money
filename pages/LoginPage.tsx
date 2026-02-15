
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(email, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos. Você já criou este usuário no Console do Firebase?');
      } else {
        setError('Erro: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-xl shadow-indigo-600/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nexus Intelligence</h1>
          <p className="text-gray-500 mt-2">Login Corporativo Cloud</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex@agencia.com" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Acessar Plataforma Cloud"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
              <Zap size={12} className="mr-2" /> Guia de Primeiro Acesso
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded-xl text-[10px] text-gray-400 leading-relaxed border border-gray-800">
                1. Vá em <b className="text-white">Authentication</b> no Console Firebase.
              </div>
              <div className="p-3 bg-gray-900 rounded-xl text-[10px] text-gray-400 leading-relaxed border border-gray-800">
                2. Clique em <b className="text-white">Add User</b> e crie seu e-mail e senha.
              </div>
              <div className="p-3 bg-gray-900 rounded-xl text-[10px] text-gray-400 leading-relaxed border border-gray-800">
                3. Use esses dados acima para logar e inicializar o banco.
              </div>
            </div>
            
            <button 
              onClick={() => { setEmail('alexandre@agencianexus.com'); setPassword('demo123456'); authService.login('alexandre@agencianexus.com', 'demo123456'); }}
              className="mt-6 w-full text-[10px] text-gray-600 hover:text-indigo-400 uppercase font-black tracking-widest transition-colors"
            >
              Pular para Modo Offline (Somente Visualização)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

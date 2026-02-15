
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
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
        setError('Acesso negado. Certifique-se de que seu usuário foi criado no console de administração.');
      } else {
        setError('Falha na conexão: ' + err.message);
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nexus Cloud</h1>
          <p className="text-gray-500 mt-2 font-medium">Plataforma de Gestão de Marketing</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-2xl flex items-start space-x-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@nexus.com" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "ENTRAR NO SISTEMA"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Nexus Intelligence Engine v2.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

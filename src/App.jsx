import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Calendar, Play, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');
  const [view, setView] = useState(() => localStorage.getItem('view') || 'config');
  const [participantCount, setParticipantCount] = useState(() => Number(localStorage.getItem('participantCount')) || 0);
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('participants');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('startTime');
    if (saved) return saved;
    // Default to current Brasilia time
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  });
  const [endTime, setEndTime] = useState(() => {
    const saved = localStorage.getItem('endTime');
    if (saved) return saved;
    // Default to 1 hour from now
    const later = new Date(new Date().getTime() + 60 * 60 * 1000);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(later);
  });
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('adminPassword') || '');
  const [unlockAttempt, setUnlockAttempt] = useState('');
  const [debugClicks, setDebugClicks] = useState(0);

  // Translations
  const t = (key) => {
    const texts = {
      es: {
        title: "Sorteo Pro",
        config: "Configuración",
        live: "Sorteo en Vivo",
        back: "Volver y Reiniciar",
        managerTitle: "Gestor de Sorteo",
        startBtn: "COMENZAR",
        timeError: "⚠️ Por favor, coloca bien el intervalo de la hora (Inicio < Fin)",
        participants: "Número de Participantes",
        startTime: "Hora de Inicio",
        endTime: "Hora de Finalización",
        number: "Número",
        name: "Nombre del Participante",
        placeholder: "Nombre del participante",
        waiting: "Esperando Inicio...",
        rolling: "Sorteo en Progreso",
        finished: "Sorteo Finalizado",
        brTime: "Hora actual Brasil",
        pending: "Pendiente",
        spinning: "Sorteando...",
        winner: "¡GANADOR!",
        completedAt: "Sorteo completado a las",
        copy: "Sorteo Premium Edition",
        errorPast: "⚠️ La hora de inicio no puede ser en el pasado",
        errorDuration: "⚠️ El sorteo no puede durar más de 3 horas",
        errorParticipants: "⚠️ El número de participantes debe estar entre 1 y 15",
        adminPassword: "Contraseña de Administrador (Opcional)",
        unlockToBack: "Contraseña para volver",
        wrongPassword: "❌ Contraseña incorrecta",
        setNow: "Ahora",
        resetAll: "Reiniciar Todo",
        confirmReset: "¿Seguro que quieres borrar TODOS los datos del sorteo?",
        totalParticipants: "Total de Participantes",
        description: "Gestión avanzada de sorteos en vivo con temporizador automático y seguridad administrativa."
      },
      pt: {
        title: "Sorteio Pro",
        config: "Configuração",
        live: "Sorteio ao Vivo",
        back: "Voltar e Reiniciar",
        managerTitle: "Gestor de Sorteio",
        startBtn: "COMEÇAR",
        timeError: "⚠️ Por favor, coloque corretamente o intervalo (Início < Fim)",
        participants: "Número de Participantes",
        startTime: "Hora de Início",
        endTime: "Hora de Término",
        number: "Número",
        name: "Nome do Participante",
        placeholder: "Nome do participante",
        waiting: "Aguardando Início...",
        rolling: "Sorteio em Progresso",
        finished: "Sorteio Finalizado",
        brTime: "Hora atual Brasil",
        pending: "Pendente",
        spinning: "Sorteando...",
        winner: "¡VENCEDOR!",
        completedAt: "Sorteio concluído às",
        copy: "Sorteio Premium Edition",
        errorPast: "⚠️ A hora de início não pode ser no passado",
        errorDuration: "⚠️ O sorteio não pode durar mais de 3 horas",
        errorParticipants: "⚠️ O número de participantes deve estar entre 1 e 15",
        adminPassword: "Senha do Administrador (Opcional)",
        unlockToBack: "Senha para voltar",
        wrongPassword: "❌ Senha incorreta",
        setNow: "Agora",
        resetAll: "Reiniciar Tudo",
        confirmReset: "Tem certeza que deseja apagar TODOS os dados do sorteio?",
        totalParticipants: "Total de Participantes",
        description: "Gestão avançada de sorteios ao vivo com temporizador automático e segurança administrativa."
      }
    };
    return texts[lang][key];
  };
  
  // Persistence effects
  useEffect(() => {
    localStorage.setItem('lang', lang);
    localStorage.setItem('view', view);
    localStorage.setItem('participantCount', participantCount);
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('endTime', endTime);
    localStorage.setItem('adminPassword', adminPassword);
  }, [lang, view, participantCount, participants, startTime, endTime, adminPassword]);
  
  // Real-time Clock logic (Brasilia)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getBrasiliaTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const currentBrasiliaString = getBrasiliaTime(currentTime);

  // Raffle logic states
  const [winner, setWinner] = useState(() => {
    const saved = localStorage.getItem('winner');
    return saved ? JSON.parse(saved) : null;
  });
  const [displayNumber, setDisplayNumber] = useState(0);
  const [raffleStatus, setRaffleStatus] = useState('idle');

  useEffect(() => {
    if (winner) {
      localStorage.setItem('winner', JSON.stringify(winner));
    } else {
      localStorage.removeItem('winner');
    }
  }, [winner]);

  // Helper to convert "HH:mm" to a Date object for today in Brasilia
  const timeToDate = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(currentTime);
    // Since we want to compare with Brasilia time, we need to adjust 'date' 
    // to represent the same hour/minute in the local TZ as it would be in Brasilia
    // But easier: just compare the string representations HH:mm:ss
    return timeStr + ":00";
  };

  useEffect(() => {
    let count = parseInt(participantCount);
    if (isNaN(count) || count < 0) return; // Don't wipe if empty or invalid
    if (count > 15) count = 15;
    
    setParticipants(prev => {
      const next = [...prev];
      if (count > next.length) {
        for (let i = next.length; i < count; i++) {
          next.push({ id: i + 1, name: '' });
        }
      } else if (count < next.length) {
        // Only slice if explicitly requested or if we are synced
        return next.slice(0, count);
      }
      return next;
    });
  }, [participantCount]);

  const handleNameChange = (id, name) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, name } : p)
    );
  };

  const setStartTimeNow = () => {
    const now = new Date();
    const brTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    setStartTime(brTime);
  };

  const startRaffle = () => {
    if (participants.length === 0) return alert('¡Agrega participantes primero!');
    setView('raffle');
    // We only reset the winner if we are NOT already in a finished state for the current times
    // But since the user might want to re-run it with same settings, we keep manual reset 
    // to the "RefreshCw" or manual config change.
    // For now, let's just make sure it's clear.
  };

  const resetRaffle = () => {
    if (adminPassword && unlockAttempt !== adminPassword) {
      alert(t('wrongPassword'));
      return;
    }
    setWinner(null);
    setUnlockAttempt('');
    localStorage.removeItem('winner');
    setView('config');
  };

  const masterReset = (isEmergency = false) => {
    // If we're in raffle view and a password is set, we must verify it (unless emergency)
    if (!isEmergency && view === 'raffle' && adminPassword && unlockAttempt !== adminPassword) {
      alert(t('wrongPassword'));
      return;
    }

    if (!window.confirm(t('confirmReset'))) return;
    
    // 1. Reset all React states manually
    setParticipantCount(0);
    setParticipants([]);
    setAdminPassword('');
    setUnlockAttempt('');
    setWinner(null);
    setRaffleStatus('idle');
    setView('config');
    setDebugClicks(0);
    
    // 2. Set times back to Now/Default
    const now = new Date();
    const brTime = (date) => new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    
    setStartTime(brTime(now));
    setEndTime(brTime(new Date(now.getTime() + 60 * 60 * 1000)));

    // 3. Clear localStorage (keeping language preference)
    const currentLang = lang;
    localStorage.clear();
    localStorage.setItem('lang', currentLang);
  };

  const handleTrophyClick = () => {
    const newClicks = debugClicks + 1;
    if (newClicks >= 5) {
      masterReset(true);
      setDebugClicks(0);
    } else {
      setDebugClicks(newClicks);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setDebugClicks(0), 2000);
    }
  };

  useEffect(() => {
    if (view !== 'raffle') return;

    const startStr = startTime + ":00";
    const endStr = endTime + ":00";
    const currentStr = currentBrasiliaString;

    if (currentStr < startStr) {
      setRaffleStatus('waiting');
    } else if (currentStr >= startStr && currentStr < endStr) {
      setRaffleStatus('rolling');
    } else {
      setRaffleStatus('finished');
    }
  }, [view, currentBrasiliaString, startTime, endTime]);

  useEffect(() => {
    let spinInterval;
    if (raffleStatus === 'rolling' && participants.length > 0) {
      spinInterval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * participants.length) + 1);
      }, 50);
    } else if (raffleStatus === 'finished' && !winner && participants.length > 0) {
      const winnerIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[winnerIndex]);
      setDisplayNumber(participants[winnerIndex].id);
    }

    return () => clearInterval(spinInterval);
  }, [raffleStatus, participants, winner]);

  const isTimeValid = startTime < endTime;
  
  const isPastTime = (startTime + ":00") < currentBrasiliaString;
  
  const calculateDuration = () => {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const d1 = h1 * 60 + m1;
    const d2 = h2 * 60 + m2;
    return d2 - d1;
  };
  
  const duration = calculateDuration();
  const isDurationValid = duration > 0 && duration <= 180;
  
  const isParticipantCountValid = participantCount >= 1 && participantCount <= 15;
  
  const canStart = participants.length > 0 && isParticipantCountValid && isTimeValid && !isPastTime && isDurationValid;

  return (
    <>
      <header>
        <div 
          onClick={handleTrophyClick}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          title="Admin Access"
        >
          <Trophy color="#8b5cf6" size={28} />
          <h2 style={{ margin: 0, textFillColor: 'initial', background: 'none', color: 'white' }}>
            {t('title')}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="lang-toggle">
            <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
            <div className="divider"></div>
            <button className={lang === 'pt' ? 'active' : ''} onClick={() => setLang('pt')}>PT</button>
          </div>
          <div className="time-badge desktop-only">
            <Clock size={14} />
            <span>{currentBrasiliaString}</span>
          </div>
          <span className="badge">
            {view === 'config' ? t('config') : t('live')}
          </span>
          {view === 'raffle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {adminPassword && (
                <input 
                  type="password"
                  placeholder={t('unlockToBack')}
                  value={unlockAttempt}
                  onChange={(e) => setUnlockAttempt(e.target.value)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    border: '1px solid var(--border)', 
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.8rem',
                    width: '100px'
                  }}
                />
              )}
              <button 
                onClick={resetRaffle}
                className="btn-icon"
                title={t('back')}
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {view === 'config' ? (
          <motion.div 
            key="config-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('managerTitle')}</h1>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('description')}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-icon"
                  onClick={masterReset}
                  title={t('resetAll')}
                  style={{ color: '#ef4444' }}
                >
                  <RefreshCw size={20} />
                </button>
                <button 
                  className="btn-play"
                  onClick={startRaffle}
                  disabled={!canStart}
                >
                  <Play size={20} fill="currentColor" />
                  {t('startBtn')}
                </button>
              </div>
            </div>

            <div className="error-container">
              {!isTimeValid && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="error-message">
                  <span>{t('timeError')}</span>
                </motion.div>
              )}
              {isTimeValid && isPastTime && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="error-message">
                  <span>{t('errorPast')}</span>
                </motion.div>
              )}
              {isTimeValid && !isDurationValid && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="error-message">
                  <span>{t('errorDuration')}</span>
                </motion.div>
              )}
              {participantCount > 0 && !isParticipantCountValid && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="error-message">
                  <span>{t('errorParticipants')}</span>
                </motion.div>
              )}
            </div>
            
            <div className="input-group">
              <label>
                <Users size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {t('participants')}
              </label>
              <input 
                type="number" 
                min="1"
                max="15"
                placeholder="Ej: 10"
                value={participantCount || ''}
                onChange={(e) => setParticipantCount(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <label style={{ color: 'var(--primary)', fontWeight: '600' }}>
                <RefreshCw size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {t('adminPassword')}
              </label>
              <input 
                type="password" 
                placeholder="****"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ fontSize: '1.2rem', padding: '0.75rem' }}
              />
            </div>

            <div className="controls-grid">
              <div className="input-group">
                <label>
                  <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  {t('startTime')}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <button 
                    onClick={setStartTimeNow}
                    className="btn-icon"
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem', height: 'auto' }}
                  >
                    {t('setNow')}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>
                  <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  {t('endTime')}
                </label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {participants.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="table-container"
                >
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>{t('number')}</th>
                        <th>{t('name')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <motion.tr 
                          key={p.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                              #{p.id}
                            </span>
                          </td>
                          <td>
                            <input 
                              type="text" 
                              placeholder={`${t('placeholder')} ${p.id}`}
                              value={p.name}
                              onChange={(e) => handleNameChange(p.id, e.target.value)}
                              style={{ background: 'transparent', border: 'none', padding: '0.25rem' }}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="raffle-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card raffle-card"
            style={{ textAlign: 'center' }}
          >
            <div className="raffle-header">
              <Clock size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.25rem' }}>
                {raffleStatus === 'waiting' && t('waiting')}
                {raffleStatus === 'rolling' && t('rolling')}
                {raffleStatus === 'finished' && t('finished')}
              </h2>
              <div className="time-display">
                <span style={{ color: raffleStatus === 'waiting' ? 'var(--primary)' : 'white' }}>{startTime}</span>
                <div className="time-separator"></div>
                <span style={{ color: raffleStatus === 'rolling' ? 'var(--accent)' : 'white' }}>{endTime}</span>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div>{t('brTime')}: <strong>{currentBrasiliaString}</strong></div>
                <div style={{ padding: '0 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {t('totalParticipants')}: <strong>{participants.length}</strong>
                </div>
              </div>
            </div>

            <div className="spin-container">
              {raffleStatus !== 'finished' ? (
                <div className="countdown-ring" style={{ borderColor: raffleStatus === 'waiting' ? 'var(--border)' : 'var(--primary)' }}>
                  <div className="spinning-number" style={{ opacity: raffleStatus === 'waiting' ? 0.3 : 1 }}>
                    {raffleStatus === 'waiting' ? '?' : displayNumber}
                  </div>
                  <div className="timer-text">
                    {raffleStatus === 'waiting' ? t('pending') : t('spinning')}
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="winner-box"
                >
                  <Trophy size={60} color="var(--accent)" />
                  <div className="winner-label">{t('winner')}</div>
                  <div className="winner-number">#{winner?.id}</div>
                  <div className="winner-name">{winner?.name || `${t('placeholder')} ${winner?.id}`}</div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {t('completedAt')} {endTime}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <footer>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
          <span>&copy; 2026 {t('copy')}</span>
        </div>
      </footer>
    </>
  );
}

export default App;

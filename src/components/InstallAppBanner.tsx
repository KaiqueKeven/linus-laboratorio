'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Share, PlusSquare, X, Download, CheckCircle2 } from 'lucide-react';

export function InstallAppBanner() {
  const [isStandalone, setIsStandalone] = useState(true); // default to true to avoid flash
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check if dismissed before
    const isDismissed = localStorage.getItem('linus_pwa_dismissed') === 'true';
    setDismissed(isDismissed);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsStandalone(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('linus_pwa_dismissed', 'true');
  };

  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom App Banner for Mobile Browsers */}
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-40 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-orange-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#ed8431] overflow-hidden p-1 shrink-0 shadow-md flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/linus-mark.png"
              alt="Linus Pauling"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>Instalar como App</span>
              <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-semibold">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              Adicione à tela inicial para tela cheia e acesso rápido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            title="Dispensar aviso"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructions Modal (especially for iPhone / iOS and browsers without native prompt) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ed8431] overflow-hidden p-2 shadow-lg mb-3 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/linus-mark.png"
                  alt="Linus Pauling"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Instalar Laboratório Linus Pauling
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Tenha o sistema como um aplicativo nativo na tela inicial do seu celular.
              </p>

              {isIos ? (
                /* iOS Instructions */
                <div className="w-full space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700">
                      Toque no botão <strong className="text-slate-900">Compartilhar</strong>{' '}
                      <Share className="w-3.5 h-3.5 inline text-blue-600 mb-0.5" /> na barra inferior do Safari.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700">
                      Role para baixo e selecione{' '}
                      <strong className="text-slate-900">Adicionar à Tela de Início</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mb-0.5" />.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700">
                      Toque em <strong className="text-slate-900">Adicionar</strong> no canto superior direito!
                    </div>
                  </div>
                </div>
              ) : (
                /* Android / Chrome Instructions */
                <div className="w-full space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700">
                      Toque nos <strong className="text-slate-900">três pontinhos (⋮)</strong> no topo do navegador Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700">
                      Selecione <strong className="text-slate-900">Instalar aplicativo</strong> ou <strong className="text-slate-900">Adicionar à tela inicial</strong>.
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

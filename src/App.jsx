import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronRight, 
  Layers, 
  Cpu, 
  Zap, 
  Grid3X3, 
  ArrowRightLeft, 
  Info,
  Play,
  RefreshCw,
  Search,
  Activity,
  Languages,
  Calculator,
  BarChart3,
  Flame,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useTranslation, Trans } from 'react-i18next';

// --- KaTeX Helper Component ---
// KaTeX 进行latex渲染能力
const Latex = ({ formula, displayMode = false, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: displayMode
      });
    }
  }, [formula, displayMode]);

  return <span ref={containerRef} className={className} />;
};

// --- Constants & Helper Data ---
const INITIAL_MATRIX = Array.from({ length: 4 }, (_, r) => 
  Array.from({ length: 4 }, (_, c) => r * 4 + c)
);

const KERNEL_PRESETS = {
  'Sobel-X': [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
  'Sobel-Y': [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
  'Laplacian': [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
  'Identity': [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
};

const BAYES_DATA = {
  priors: { yes: 9/14, no: 5/14 },
  counts: {
    BP: { High: { yes: 2, no: 3 }, Normal: { yes: 3, no: 2 }, Low: { yes: 4, no: 0 } },
    Fever: { High: { yes: 2, no: 2 }, Mild: { yes: 4, no: 2 }, No: { yes: 3, no: 1 } },
    Diabetes: { Yes: { yes: 3, no: 4 }, No: { yes: 6, no: 1 } },
    Vomit: { Yes: { yes: 3, no: 3 }, No: { yes: 6, no: 2 } }
  },
  m_values: { BP: 3, Fever: 3, Diabetes: 2, Vomit: 2 }
};

// --- Common UI Components ---

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">{title}</h2>
    </div>
    <p className="text-sm text-gray-500 ml-10 italic">{subtitle}</p>
  </div>
);

const SeniorAdvice = ({ content }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg"
    >
      <div className="flex gap-2">
        <Zap className="text-amber-500 shrink-0" size={18} />
        <div>
          <span className="font-bold text-amber-800 text-sm">{t('senior_advice')}</span>
          <div className="text-amber-900 text-sm leading-relaxed inline">{content}</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Sub-Modules ---

// NEW: Bayes Basics Module (Formula & Fire Case)
const BayesBasicsModule = () => {
  const [pFire, setPFire] = useState(0.01);
  const [pSmokeGivenFire, setPSmokeGivenFire] = useState(0.9);
  const [pSmoke, setPSmoke] = useState(0.1);
  const { t } = useTranslation();

  const pFireGivenSmoke = useMemo(() => {
    return (pFire * pSmokeGivenFire) / pSmoke;
  }, [pFire, pSmokeGivenFire, pSmoke]);

  return (
    <div className="space-y-10">
      {/* Formula Parsing Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-blue-500" />
          {t('bayes.basics.title')}
        </h3>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl border border-slate-100 shadow-inner mb-6">
            <Latex displayMode formula="P(B|E) = P(B) \times \frac{P(E|B)}{P(E)}" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{t('bayes.basics.terms.posterior')}</p>
              <p className="text-sm text-slate-700">
                <Trans i18nKey="bayes.basics.terms.posterior_desc">
                  Update of belief <Latex formula="B" /> after evidence <Latex formula="E" />.
                </Trans>
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">{t('bayes.basics.terms.prior')}</p>
              <p className="text-sm text-slate-700">
                <Trans i18nKey="bayes.basics.terms.prior_desc">
                  Probability of belief <Latex formula="B" /> before any evidence.
                </Trans>
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">{t('bayes.basics.terms.likelihood')}</p>
              <p className="text-sm text-slate-700">
                <Trans i18nKey="bayes.basics.terms.likelihood_desc">
                  Probability of evidence <Latex formula="E" /> given belief <Latex formula="B" /> is true.
                </Trans>
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wider">{t('bayes.basics.terms.marginal')}</p>
              <p className="text-sm text-slate-700">
                <Trans i18nKey="bayes.basics.terms.marginal_desc">
                  Total probability of evidence <Latex formula="E" /> under all conditions.
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fire Case Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Flame size={18} className="text-red-500" />
          {t('bayes.fire_case.title')}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700"><Trans i18nKey="bayes.fire_case.p_fire">Prob <Latex formula="P(\text{Fire})" /></Trans></span>
                <input 
                  type="range" min="0.001" max="0.2" step="0.001" value={pFire} 
                  onChange={(e) => setPFire(parseFloat(e.target.value))}
                  className="w-32 accent-red-500"
                />
                <span className="font-mono text-xs font-bold text-red-600">{(pFire*100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700"><Trans i18nKey="bayes.fire_case.p_smoke">Prob <Latex formula="P(\text{Smoke})" /></Trans></span>
                <input 
                  type="range" min="0.01" max="0.5" step="0.01" value={pSmoke} 
                  onChange={(e) => setPSmoke(parseFloat(e.target.value))}
                  className="w-32 accent-slate-500"
                />
                <span className="font-mono text-xs font-bold text-slate-600">{(pSmoke*100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700"><Trans i18nKey="bayes.fire_case.p_smoke_given_fire">Prob <Latex formula="P(\text{Smoke}|\text{Fire})" /></Trans></span>
                <input 
                  type="range" min="0.5" max="1" step="0.01" value={pSmokeGivenFire} 
                  onChange={(e) => setPSmokeGivenFire(parseFloat(e.target.value))}
                  className="w-32 accent-purple-500"
                />
                <span className="font-mono text-xs font-bold text-purple-600">{(pSmokeGivenFire*100).toFixed(1)}%</span>
              </div>
            </div>

            <SeniorAdvice content={<Trans i18nKey="bayes.fire_case.advice">
              讲义中的经典案例... <Latex formula="9\%" />... <b>Evidence ≠ Conclusion...</b>
            </Trans>} />
          </div>

          <div className="flex flex-col justify-center items-center bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wind size={100} /></div>
            <div className="text-center z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('bayes.fire_case.result_title')}</p>
              <p className="text-5xl font-black text-red-400 mb-2">{(pFireGivenSmoke * 100).toFixed(2)}%</p>
              <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 text-xs font-mono leading-relaxed">
                <p className="mb-2 text-slate-400">{t('bayes.fire_case.calc_process')}</p>
                <Latex formula={`P(F|S) = \\frac{${pFire} \\times ${pSmokeGivenFire}}{${pSmoke}}`} />
                <p className="mt-2 text-red-300">= {pFireGivenSmoke.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// D: Naive Bayes Module (Disease Z Case)
const NaiveBayesModule = () => {
  const [inputs, setInputs] = useState({ BP: 'High', Fever: 'No', Diabetes: 'Yes', Vomit: 'Yes' });
  const [alpha, setAlpha] = useState(0);
  const [useLog, setUseLog] = useState(false);
  const { t } = useTranslation();

  const calculate = () => {
    const results = { yes: { score: 0, raw: 1, steps: [] }, no: { score: 0, raw: 1, steps: [] } };
    ['yes', 'no'].forEach(cls => {
      const prior = BAYES_DATA.priors[cls];
      results[cls].steps.push({ name: 'Prior', val: prior, label: cls === 'yes' ? 'P(Z=Yes)' : 'P(Z=No)' });
      let likelihoodProduct = 1;
      let logSum = Math.log(prior);
      Object.entries(inputs).forEach(([feat, val]) => {
        const count = BAYES_DATA.counts[feat][val][cls];
        const totalCls = cls === 'yes' ? 9 : 5;
        const m = BAYES_DATA.m_values[feat];
        const prob = (count + alpha) / (totalCls + m * alpha);
        results[cls].steps.push({ 
          name: feat, val: prob, label: `P(${feat}|${cls})`,
          formula: `\\frac{${count} + ${alpha}}{${totalCls} + ${m} \\times ${alpha}}`
        });
        likelihoodProduct *= prob;
        logSum += Math.log(prob || 1e-10);
      });
      results[cls].raw = prior * likelihoodProduct;
      results[cls].score = useLog ? logSum : results[cls].raw;
    });
    const totalRaw = results.yes.raw + results.no.raw;
    results.yes.prob = totalRaw > 0 ? results.yes.raw / totalRaw : 0;
    results.no.prob = totalRaw > 0 ? results.no.raw / totalRaw : 0;
    return results;
  };

  const results = useMemo(calculate, [inputs, alpha, useLog]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">{t('bayes.naive.input_title')}</h4>
          <div className="space-y-4">
            {Object.keys(inputs).map(feat => (
              <div key={feat}>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">{feat}</label>
                <select 
                  value={inputs[feat]} 
                  onChange={(e) => setInputs({...inputs, [feat]: e.target.value})}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                >
                  {Object.keys(BAYES_DATA.counts[feat]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase"><Trans i18nKey="bayes.naive.smoothing">Smoothing <Latex formula="\alpha" />:</Trans></span>
                <input 
                  type="number" step="0.1" min="0" max="2" value={alpha} 
                  onChange={(e) => setAlpha(parseFloat(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-center text-xs font-mono"
                />
              </div>
              <button 
                onClick={() => setUseLog(!useLog)}
                className={`w-full py-2 rounded-lg text-[10px] font-black transition-all ${useLog ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}
              >
                {useLog ? t('bayes.naive.log_mode') : t('bayes.naive.product_mode')}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">{t('bayes.naive.result_title')}</h4>
            <div className="space-y-6 relative z-10">
              {['yes', 'no'].map(cls => (
                <div key={cls}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase">Class: {cls}</span>
                    <span className="text-xl font-mono text-blue-400">{(results[cls].prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${results[cls].prob * 100}%` }} className={`h-full ${cls === 'yes' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase">{t('bayes.naive.likelihood_chain')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
              {['yes', 'no'].map(cls => (
                <div key={cls} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-400 mb-2 uppercase tracking-tighter">{t('bayes.naive.prob_for', {cls})}</p>
                  <div className="space-y-2">
                    {results[cls].steps.map((s, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-slate-500 font-mono"><Latex formula={s.label} /></span>
                        <span className="font-mono font-bold text-slate-800">{s.val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SeniorAdvice content={<Trans i18nKey="bayes.naive.advice">
        讲义第 23 页重点... <Latex formula="\alpha" /> ...
      </Trans>} />
    </div>
  );
};

// A: NumPy Mechanism
const NumpyModule = () => {
  const [sliceType, setSliceType] = useState('none');
  const { t } = useTranslation();

  const getHighlight = (r, c, val) => {
    if (sliceType === 'slice') return r === 1; 
    if (sliceType === 'fancy') return r === 0 || r === 2; 
    if (sliceType === 'mask') return val % 2 === 0; 
    return false;
  };

  const getInfo = () => {
    switch(sliceType) {
      case 'slice': return { label: t('numpy_module.view_label'), color: "bg-green-500", desc: t('numpy_module.view_desc') };
      case 'fancy': return { label: t('numpy_module.fancy_label'), color: "bg-blue-500", desc: t('numpy_module.fancy_desc') };
      case 'mask': return { label: t('numpy_module.mask_label'), color: "bg-purple-500", desc: t('numpy_module.mask_desc') };
      default: return null;
    }
  };

  const info = getInfo();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Grid3X3 size={18} className="text-blue-500" />
          {t('numpy_module.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4 rounded-xl shadow-inner">
              {INITIAL_MATRIX.map((row, r) => 
                row.map((val, c) => (
                  <motion.div
                    key={`${r}-${c}`}
                    animate={{ 
                      scale: getHighlight(r, c, val) ? 1.05 : 1,
                      backgroundColor: getHighlight(r, c, val) ? (info ? '#dcfce7' : '#ffffff') : '#ffffff'
                    }}
                    className={`h-12 flex items-center justify-center rounded border text-sm font-mono
                      ${getHighlight(r, c, val) ? 'border-green-500 border-2 z-10' : 'border-gray-200 text-gray-400'}`}
                  >
                    {val}
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSliceType('slice')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'slice' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'}`}>{t('numpy_module.slice_btn')}</button>
              <button onClick={() => setSliceType('fancy')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'fancy' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>{t('numpy_module.fancy_btn')}</button>
              <button onClick={() => setSliceType('mask')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'mask' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'}`}>{t('numpy_module.mask_btn')}</button>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            {info ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white shadow-sm">
                <div className={`inline-block px-2 py-1 rounded text-white text-[10px] font-bold mb-2 uppercase tracking-wider ${info.color}`}>
                  {info.label}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{info.desc}</p>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-400 italic">{t('numpy_module.instruction')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-blue-500" />
          {t('numpy_module.broadcast_title')}
        </h3>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Shape A */}
            <div className="text-center">
              <div className="mb-2"><Latex formula="(3, 1)" className="text-xs text-gray-500 font-bold" /></div>
              <div className="grid grid-cols-1 gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-1">
                    <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <div className="w-8 h-8 bg-blue-100 rounded border-dashed border-2 border-blue-200 flex items-center justify-center text-blue-300 text-[10px]">?</div>
                    <div className="w-8 h-8 bg-blue-100 rounded border-dashed border-2 border-blue-200 flex items-center justify-center text-blue-300 text-[10px]">?</div>
                    <div className="w-8 h-8 bg-blue-100 rounded border-dashed border-2 border-blue-200 flex items-center justify-center text-blue-300 text-[10px]">?</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-gray-400 font-bold text-2xl">+</div>
            {/* Shape B */}
            <div className="text-center">
              <div className="mb-2"><Latex formula="(1, 4)" className="text-xs text-gray-500 font-bold" /></div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center text-white text-[10px] font-bold">B</div>)}
                </div>
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-1">
                    {[1, 2, 3, 4].map(j => <div key={j} className="w-8 h-8 bg-orange-100 rounded border-dashed border-2 border-orange-200 flex items-center justify-center text-orange-300 text-[10px]">?</div>)}
                  </div>
                ))}
              </div>
            </div>
            <ChevronRight className="rotate-90 md:rotate-0 text-gray-300" />
            <div className="text-center">
               <div className="mb-2"><Latex formula="(3, 4)" className="text-xs text-green-600 font-bold" /></div>
               <div className="grid grid-cols-4 gap-1 p-1 bg-green-50 rounded border border-green-200">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-green-400 rounded flex items-center justify-center text-white text-[10px] font-bold">A+B</div>
                ))}
               </div>
            </div>
          </div>
          <SeniorAdvice content={
            <Trans i18nKey="numpy_module.broadcast_advice">
              Broadcasting isn't actually copying data in memory... <Latex formula="1" />.
            </Trans>
          } />
        </div>
      </div>
    </div>
  );
};

// B: Backprop Module
const BackpropModule = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorVal, setErrorVal] = useState(0.8);
  const { t } = useTranslation();

  const startTracking = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity size={18} className="text-red-500" />
          {t('backprop_module.title')}
        </h3>
        <div className="relative h-64 bg-slate-900 rounded-2xl overflow-hidden p-8 flex items-center justify-between">
          <div className="z-10 flex flex-col gap-12">
            <div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center text-white font-mono text-sm">i</div>
            <div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center text-white font-mono text-sm">j</div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="15%" y1="35%" x2="85%" y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
            <line x1="15%" y1="65%" x2="85%" y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
            
            <AnimatePresence>
              {isAnimating && (
                <motion.circle
                  initial={{ cx: "85%", cy: "50%", r: 4 }}
                  animate={{ cx: "15%", cy: "35%", r: 6 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  fill="#ef4444"
                />
              )}
            </AnimatePresence>
          </svg>

          <div className="z-10 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center text-white font-mono border-4 border-red-200">k</div>
          </div>

          <div className="absolute top-4 right-4 text-right">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{t('backprop_module.output_layer')}</p>
            <p className="text-xs text-red-400 font-bold flex items-center gap-1 justify-end">
              Error <Latex formula="\delta_k" />
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('backprop_module.error_val')} <Latex formula="(Target - Out)" />:</label>
            <input 
              type="range" min="0" max="2" step="0.1" value={errorVal} 
              onChange={(e) => setErrorVal(e.target.value)}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span className="font-mono text-red-600 font-bold">{errorVal}</span>
          </div>
          <button 
            onClick={startTracking}
            disabled={isAnimating}
            className="w-full py-3 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-red-700 transition disabled:opacity-50 shadow-md"
          >
            <Play size={16} fill="currentColor" /> {isAnimating ? t('backprop_module.calculating') : t('backprop_module.track_grad')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 italic border-b pb-2">
          <Search size={16} className="text-blue-500" />
          {t('backprop_module.notebook_title')}
        </h4>
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">{t('backprop_module.step1_title')}</p>
            <Latex displayMode formula="\frac{\partial E}{\partial w_{jk}} = \frac{\partial E}{\partial O_k} \cdot \frac{\partial O_k}{\partial net_k} \cdot \frac{\partial net_k}{\partial w_{jk}}" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">{t('backprop_module.step2_title')}</p>
            <p className="text-xs text-gray-600 mb-2">
              <Trans i18nKey="backprop_module.step2_desc">
                Let <Latex formula="\delta_k = - \frac{\partial E}{\partial net_k}" />. Under MSE loss:
              </Trans>
            </p>
            <Latex displayMode formula="\delta_k = (T_k - O_k) \cdot f'(net_k)" className="text-red-700" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">{t('backprop_module.step3_title')}</p>
            <Latex displayMode formula="\Delta w_{jk} = \eta \cdot \delta_k \cdot O_j" className="text-green-700" />
          </div>
          <SeniorAdvice content={
            <Trans i18nKey="backprop_module.advice">
              Remember, backpropagation... <Latex formula="w_{jk}" /> ... <Latex formula="E" /> ... <Latex formula="\delta_k" /> ...
            </Trans>
          } />
        </div>
      </div>
    </div>
  );
};

// C: Convolution Module
const KernelModule = () => {
  const [kernel, setKernel] = useState(KERNEL_PRESETS['Sobel-X']);
  const [activePreset, setActivePreset] = useState('Sobel-X');
  const { t } = useTranslation();

  const sourceImage = useMemo(() => {
    const img = Array.from({ length: 8 }, () => Array(8).fill(0));
    for(let i=2; i<6; i++) {
      for(let j=2; j<6; j++) img[i][j] = 100;
    }
    return img;
  }, []);

  const handleKernelChange = (r, c, val) => {
    const newKernel = kernel.map((row, ri) => 
      row.map((v, ci) => (ri === r && ci === c ? Number(val) : v))
    );
    setKernel(newKernel);
    setActivePreset('Custom');
  };

  const applyPreset = (name) => {
    setKernel(KERNEL_PRESETS[name]);
    setActivePreset(name);
  };

  const getConvolvedVal = (ri, ci) => {
    let sum = 0;
    for(let kr=0; kr<3; kr++) {
      for(let kc=0; kc<3; kc++) {
        sum += sourceImage[ri + kr][ci + kc] * kernel[kr][kc];
      }
    }
    return Math.max(0, Math.min(255, Math.abs(sum)));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border">
        <div className="flex gap-2">
          {Object.keys(KERNEL_PRESETS).map(name => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activePreset === name ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           {t('kernel_module.operation')} <Latex formula="(I * K)_{x,y}" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t('kernel_module.input_image')} <Latex formula="I" /></span>
          <div className="grid grid-cols-8 gap-px bg-slate-300 p-px border-2 border-slate-200 rounded shadow-sm">
            {sourceImage.map((row, ri) => 
              row.map((val, ci) => (
                <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{ backgroundColor: `rgb(${val},${val},${val})` }} />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center relative">
          <div className="text-3xl font-bold text-slate-200 absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:block">×</div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t('kernel_module.kernel')} <Latex formula="K" /></span>
          <div className="grid grid-cols-3 gap-2 bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100 shadow-inner">
            {kernel.map((row, ri) => 
              row.map((val, ci) => (
                <input
                  key={`${ri}-${ci}`}
                  type="number"
                  value={val}
                  onChange={(e) => handleKernelChange(ri, ci, e.target.value)}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-indigo-200 rounded-lg text-center font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col items-center relative">
          <div className="text-3xl font-bold text-slate-200 absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:block">=</div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">{t('kernel_module.output_feature_map')}</span>
          <div className="grid grid-cols-6 gap-px bg-slate-300 p-px border-2 border-slate-200 rounded shadow-sm">
            {Array.from({ length: 6 }).map((_, ri) => 
              Array.from({ length: 6 }).map((_, ci) => {
                const val = getConvolvedVal(ri, ci);
                return (
                  <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{ backgroundColor: `rgb(${val},${val},${val})` }} />
                );
              })
            )}
          </div>
        </div>
      </div>
      <SeniorAdvice content={
        <Trans i18nKey="kernel_module.advice">
          A convolution kernel... <Latex formula="\text{Laplacian}" /> ...
        </Trans>
      } />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('numpy');
  const { t, i18n } = useTranslation();

  const tabs = [
    { id: 'numpy', label: t('app.tabs.numpy'), icon: Cpu, subtitle: 'View vs Copy & Broadcasting' },
    { id: 'backprop', label: t('app.tabs.backprop'), icon: Layers, subtitle: 'The Chain Rule Visualized' },
    { id: 'kernel', label: t('app.tabs.kernel'), icon: Grid3X3, subtitle: 'Edge Detection Simulation' },
    { id: 'bayesBasics', label: t('app.tabs.bayesBasics'), icon: Calculator, subtitle: 'Formula & Fire Alarm Case' },
    { id: 'naiveBayes', label: t('app.tabs.naiveBayes'), icon: BarChart3, subtitle: 'Inference & Smoothing' }
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('zh') ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500 font-medium">{t('app.subtitle')}</p>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase font-black">{t('app.version')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-3 text-xs font-mono text-slate-500 hidden sm:flex">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            Environment: Ready / KaTeX Engine Active
          </div>
          <button 
            onClick={toggleLanguage}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition flex items-center gap-2 px-4 font-bold text-slate-600"
            title="Switch Language"
          >
            <Languages size={20} className="text-blue-600" />
            {i18n.language.startsWith('zh') ? 'English' : '中文'}
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-8 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">{t('app.sidebar.knowledge_core')}</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left
                ${activeTab === tab.id 
                  ? 'bg-white shadow-xl shadow-blue-100/50 text-blue-600 border border-blue-50 -translate-y-0.5' 
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}`}
            >
              <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <tab.icon size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black">{tab.label}</span>
                <span className="text-[10px] opacity-60 font-medium truncate w-32">{tab.subtitle}</span>
              </div>
            </button>
          ))}
          
          <div className="mt-16 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
               <Cpu size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{t('app.sidebar.exam_tip.title')}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                <Trans i18nKey="app.sidebar.exam_tip.content">
                  考试注意：<Latex formula="\text{Broadcasting}" /> 只能扩展 Size 为 1 的维度。
                  <Latex formula="\mathbf{A} \cdot \mathbf{B}" /> (np.dot) 和 <Latex formula="\mathbf{A} \odot \mathbf{B}" /> (Element-wise) 物理含义完全不同！
                </Trans>
              </p>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <section className="flex-1 p-8 md:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'numpy' && (
                <>
                  <SectionTitle 
                    icon={Cpu} 
                    title={t('app.section.numpy.title')} 
                    subtitle={t('app.section.numpy.subtitle')} 
                  />
                  <NumpyModule />
                </>
              )}
              {activeTab === 'backprop' && (
                <>
                  <SectionTitle 
                    icon={Layers} 
                    title={t('app.section.backprop.title')} 
                    subtitle={t('app.section.backprop.subtitle')} 
                  />
                  <BackpropModule />
                </>
              )}
              {activeTab === 'kernel' && (
                <>
                  <SectionTitle 
                    icon={Grid3X3} 
                    title={t('app.section.kernel.title')} 
                    subtitle={t('app.section.kernel.subtitle')} 
                  />
                  <KernelModule />
                </>
              )}
              {activeTab === 'bayesBasics' && (
                <>
                  <SectionTitle 
                    icon={Calculator} 
                    title={t('app.section.bayesBasics.title')} 
                    subtitle={t('app.section.bayesBasics.subtitle')} 
                  />
                  <BayesBasicsModule />
                </>
              )}
              {activeTab === 'naiveBayes' && (
                <>
                  <SectionTitle 
                    icon={BarChart3} 
                    title={t('app.section.naiveBayes.title')} 
                    subtitle={t('app.section.naiveBayes.subtitle')} 
                  />
                  <NaiveBayesModule />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
        <p>{t('app.footer.copyright')}</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 hover:text-blue-500 cursor-default transition"><RefreshCw size={14} /> {t('app.footer.latency')}</span>
          <span className="flex items-center gap-2 hover:text-blue-500 cursor-default transition"><Cpu size={14} /> {t('app.footer.render')}</span>
        </div>
      </footer>
    </div>
  );
}

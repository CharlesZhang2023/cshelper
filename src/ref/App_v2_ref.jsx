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
  BarChart3,
  FlaskConical,
  Calculator,
  Flame,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- KaTeX Helper Component ---
const Latex = ({ formula, displayMode = false, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadKatex = () => {
      if (window.katex) {
        window.katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode
        });
        return;
      }
      if (!document.getElementById('katex-css')) {
        const link = document.createElement('link');
        link.id = 'katex-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('katex-js')) {
        const script = document.createElement('script');
        script.id = 'katex-js';
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => {
          if (containerRef.current) {
            window.katex.render(formula, containerRef.current, {
              throwOnError: false,
              displayMode: displayMode
            });
          }
        };
        document.head.appendChild(script);
      }
    };
    loadKatex();
  }, [formula, displayMode]);

  return <span ref={containerRef} className={className} />;
};

// --- Data & Constants ---
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

const SeniorAdvice = ({ content }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg shadow-sm"
  >
    <div className="flex gap-2">
      <Zap className="text-amber-500 shrink-0" size={18} />
      <div>
        <span className="font-bold text-amber-800 text-sm">学长寄语：</span>
        <div className="text-amber-900 text-sm leading-relaxed inline">{content}</div>
      </div>
    </div>
  </motion.div>
);

// --- Sub-Modules ---

// NEW: Bayes Basics Module (Formula & Fire Case)
const BayesBasicsModule = () => {
  const [pFire, setPFire] = useState(0.01);
  const [pSmokeGivenFire, setPSmokeGivenFire] = useState(0.9);
  const [pSmoke, setPSmoke] = useState(0.1);

  const pFireGivenSmoke = useMemo(() => {
    return (pFire * pSmokeGivenFire) / pSmoke;
  }, [pFire, pSmokeGivenFire, pSmoke]);

  return (
    <div className="space-y-10">
      {/* Formula Parsing Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-blue-500" />
          1. 贝叶斯法则的核心解析
        </h3>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl border border-slate-100 shadow-inner mb-6">
            <Latex displayMode formula="P(B|E) = P(B) \times \frac{P(E|B)}{P(E)}" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">Posterior (后验概率)</p>
              <p className="text-sm text-slate-700">已知证据 <Latex formula="E" /> 发生后，我们对信念 <Latex formula="B" /> 的更新程度。</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">Prior (先验概率)</p>
              <p className="text-sm text-slate-700">在看到任何证据之前，信念 <Latex formula="B" /> 本身发生的概率。</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">Likelihood (似然概率)</p>
              <p className="text-sm text-slate-700">假设信念 <Latex formula="B" /> 为真，证据 <Latex formula="E" /> 出现的可能性。</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wider">Marginal (边际概率)</p>
              <p className="text-sm text-slate-700">证据 <Latex formula="E" /> 在所有情况下发生的总概率。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fire Case Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Flame size={18} className="text-red-500" />
          2. 实战演练：烟雾与火警案例 (Notes P.15)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">火灾概率 <Latex formula="P(\text{Fire})" /></span>
                <input 
                  type="range" min="0.001" max="0.2" step="0.001" value={pFire} 
                  onChange={(e) => setPFire(parseFloat(e.target.value))}
                  className="w-32 accent-red-500"
                />
                <span className="font-mono text-xs font-bold text-red-600">{(pFire*100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">烟雾概率 <Latex formula="P(\text{Smoke})" /></span>
                <input 
                  type="range" min="0.01" max="0.5" step="0.01" value={pSmoke} 
                  onChange={(e) => setPSmoke(parseFloat(e.target.value))}
                  className="w-32 accent-slate-500"
                />
                <span className="font-mono text-xs font-bold text-slate-600">{(pSmoke*100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">火灾产烟 <Latex formula="P(\text{Smoke}|\text{Fire})" /></span>
                <input 
                  type="range" min="0.5" max="1" step="0.01" value={pSmokeGivenFire} 
                  onChange={(e) => setPSmokeGivenFire(parseFloat(e.target.value))}
                  className="w-32 accent-purple-500"
                />
                <span className="font-mono text-xs font-bold text-purple-600">{(pSmokeGivenFire*100).toFixed(1)}%</span>
              </div>
            </div>

            <SeniorAdvice content={<>
              讲义中的经典案例：虽然火灾很少见（Prior = 1%），但烟雾可能因为BBQ而常见（Marginal = 10%）。贝叶斯法则告诉我们，此时看到烟雾并确定火灾的概率只有 <Latex formula="9\%" />。<b>证据不等于结论，先验概率非常重要！</b>
            </>} />
          </div>

          <div className="flex flex-col justify-center items-center bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wind size={100} /></div>
            <div className="text-center z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">看到烟雾后火灾的概率</p>
              <p className="text-5xl font-black text-red-400 mb-2">{(pFireGivenSmoke * 100).toFixed(2)}%</p>
              <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 text-xs font-mono leading-relaxed">
                <p className="mb-2 text-slate-400">计算过程：</p>
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
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">特征输入</h4>
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
                <span className="text-[10px] font-bold text-slate-500 uppercase">平滑系数 $\alpha$:</span>
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
                {useLog ? 'LOG-SUM MODE' : 'PRODUCT MODE'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">分类结果 (Notes P.29)</h4>
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
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase">Likelihood Chain</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
              {['yes', 'no'].map(cls => (
                <div key={cls} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-400 mb-2 uppercase tracking-tighter">Probabilities for {cls}</p>
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
      <SeniorAdvice content={<>讲义第 23 页重点：贝叶斯之所以是“朴素”的，是因为它假设特征之间<b>条件独立</b>。虽然这不符合实际，但在处理垃圾邮件等任务时非常高效。注意 <b>Zero Frequency Problem</b>，一定要调大 <Latex formula="\alpha" /> 来观察变化！</>} />
    </div>
  );
};

// --- Re-using previous components ---
const NumpyModule = () => {
  const [sliceType, setSliceType] = useState('none');
  const getHighlight = (r, c, val) => {
    if (sliceType === 'slice') return r === 1; 
    if (sliceType === 'fancy') return r === 0 || r === 2; 
    if (sliceType === 'mask') return val % 2 === 0; 
    return false;
  };
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 bg-slate-100 p-4 rounded-2xl shadow-inner">
            {INITIAL_MATRIX.map((row, r) => row.map((val, c) => (
              <motion.div key={`${r}-${c}`} animate={{ scale: getHighlight(r, c, val) ? 1.05 : 1, backgroundColor: getHighlight(r, c, val) ? '#dcfce7' : '#ffffff' }} className={`h-12 flex items-center justify-center rounded border text-sm font-mono ${getHighlight(r, c, val) ? 'border-green-500 border-2 z-10' : 'border-slate-200 text-slate-300'}`}>{val}</motion.div>
            )))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSliceType('slice')} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${sliceType === 'slice' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 shadow-sm'}`}>a[1:2, :]</button>
            <button onClick={() => setSliceType('fancy')} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${sliceType === 'fancy' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 shadow-sm'}`}>a[[0, 2]]</button>
            <button onClick={() => setSliceType('mask')} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${sliceType === 'mask' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 shadow-sm'}`}>a[a%2==0]</button>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {sliceType !== 'none' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-white border-2 border-dashed rounded-2xl">
              <p className="text-xs text-slate-500 leading-relaxed uppercase font-black mb-2 tracking-widest">{sliceType === 'slice' ? 'View (Reference)' : 'Copy (New Memory)'}</p>
              <p className="text-sm text-slate-700">{sliceType === 'slice' ? 'Basic Slicing 返回的是原数据的视图，修改后会影响原数组！' : 'Fancy indexing/Masking 返回的是一份拷贝。'}</p>
            </motion.div>
          ) : <p className="text-sm text-slate-400 italic">点击左侧按钮观察 NumPy 内存行为...</p>}
        </div>
      </div>
    </div>
  );
};

const INITIAL_MATRIX = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => r * 4 + c));

const BackpropModule = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="relative h-64 bg-slate-900 rounded-2xl overflow-hidden p-8 flex items-center justify-between shadow-2xl">
          <div className="z-10 flex flex-col gap-12">
            <div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-mono">i</div>
            <div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-mono">j</div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line x1="15%" y1="35%" x2="85%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <line x1="15%" y1="65%" x2="85%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="4" />
            <AnimatePresence>{isAnimating && <motion.circle initial={{ cx: "85%", cy: "50%", r: 4 }} animate={{ cx: "15%", cy: "35%", r: 6 }} transition={{ duration: 1.5 }} fill="#ef4444" />}</AnimatePresence>
          </svg>
          <div className="z-10 w-14 h-14 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center text-white font-mono border-4 border-red-200">k</div>
          <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono tracking-widest uppercase italic">Gradient Flow</div>
        </div>
        <button onClick={() => {setIsAnimating(true); setTimeout(()=>setIsAnimating(false), 2000)}} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs"><Play size={14} /> Trace Backpropagation</button>
      </div>
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 overflow-y-auto max-h-[400px]">
        <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Search size={16} /> 梯度推导笔记</h4>
        <div className="space-y-4">
          <div className="p-3 bg-white border rounded shadow-sm italic"><Latex displayMode formula="\frac{\partial E}{\partial w_{jk}} = \frac{\partial E}{\partial O_k} \cdot \frac{\partial O_k}{\partial net_k} \cdot \frac{\partial net_k}{\partial w_{jk}}" /></div>
          <div className="p-3 bg-white border rounded shadow-sm italic text-red-600"><Latex displayMode formula="\delta_k = (T_k - O_k) \cdot f'(net_k)" /></div>
          <SeniorAdvice content="链式法则是 AI 的灵魂。它把后层的错误（Error）像回声一样传回前面的权重。" />
        </div>
      </div>
    </div>
  );
};

const KernelModule = () => {
  const [kernel, setKernel] = useState([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]);
  const sourceImage = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]].map(row => row.map(v => v * 100));
  const getConv = (ri, ci) => {
    let s = 0;
    for(let r=0; r<3; r++) for(let c=0; c<3; c++) s += sourceImage[ri+r][ci+c] * kernel[r][c];
    return Math.max(0, Math.min(255, Math.abs(s)));
  };
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Input Image (8x8)</span>
          <div className="grid grid-cols-8 gap-px bg-slate-300 p-0.5 border-2 rounded shadow-sm">
            {sourceImage.map((row, ri) => row.map((val, ci) => <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{backgroundColor: `rgb(${val},${val},${val})`}} />))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3x3 Kernel</span>
          <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50 border-2 border-indigo-100 rounded-2xl shadow-inner">
            {kernel.map((row, ri) => row.map((val, ci) => (
              <input key={`${ri}-${ci}`} type="number" value={val} onChange={(e) => {
                const k = kernel.map((r, r_idx) => r.map((c, c_idx) => r_idx === ri && c_idx === ci ? Number(e.target.value) : c));
                setKernel(k);
              }} className="w-10 h-10 bg-white border border-indigo-200 rounded-lg text-center font-mono font-bold text-indigo-700 shadow-sm" />
            )))}
          </div>
          <Latex formula="(I * K)_{x,y}" className="text-indigo-400 text-xs font-bold" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-green-500 uppercase mb-4 tracking-widest">Feature Map (6x6)</span>
          <div className="grid grid-cols-6 gap-px bg-slate-300 p-0.5 border-2 rounded shadow-sm">
            {Array.from({length: 6}).map((_, ri) => Array.from({length: 6}).map((_, ci) => {
              const val = getConv(ri, ci);
              return <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{backgroundColor: `rgb(${val},${val},${val})`}} />
            }))}
          </div>
        </div>
      </div>
      <SeniorAdvice content="卷积核就像是个『取景框』，决定了神经网络更关注水平边缘还是垂直边缘。Notes P.34 重点提示：注意卷积步长 (Stride) 和 填充 (Padding) 带来的影响！" />
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('bayesBasics');

  const tabs = [
    { id: 'bayesBasics', label: '贝叶斯基础', icon: Calculator, subtitle: 'Formula & Fire Alarm Case' },
    { id: 'naiveBayes', label: '朴素贝叶斯', icon: BarChart3, subtitle: 'Inference & Smoothing' },
    { id: 'numpy', label: 'NumPy 机制', icon: Cpu, subtitle: 'View/Copy & Broadcasting' },
    { id: 'backprop', label: '反向传播', icon: Layers, subtitle: 'Chain Rule Tracking' },
    { id: 'kernel', label: '卷积实验室', icon: Grid3X3, subtitle: 'Filter Simulation' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">CS/AI <span className="text-blue-600">交互式学习实验室</span></h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500 font-medium">COMP2211 Machine Learning Lab</p>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase font-black tracking-widest shadow-sm">v3.0 Fundamentals</span>
          </div>
        </div>
        <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-full shadow-lg flex items-center gap-3 text-xs font-mono text-slate-500">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          Environment: Ready / KaTeX Enabled
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        <nav className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-8 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Navigation</p>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left ${activeTab === tab.id ? 'bg-white shadow-xl shadow-blue-100/50 text-blue-600 border border-blue-50 -translate-y-1' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}`}>
              <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}><tab.icon size={18} /></div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black truncate">{tab.label}</span>
                <span className="text-[10px] opacity-60 font-medium truncate">{tab.subtitle}</span>
              </div>
            </button>
          ))}
          <div className="mt-12 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700"><Calculator size={100} /></div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2"><Info size={16} /><span className="text-xs font-black uppercase tracking-widest">Exam Note</span></div>
              <p className="text-[11px] leading-relaxed opacity-90 font-medium italic">
                “Bayes is the mathematical rule that describes how to update a belief, given some evidence.” — Desmond Tsoi
              </p>
            </div>
          </div>
        </nav>

        <section className="flex-1 p-8 md:p-14 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
              {activeTab === 'bayesBasics' && <><SectionTitle icon={Calculator} title="贝叶斯定理基础" subtitle="从数学定义到直觉更新" /><BayesBasicsModule /></>}
              {activeTab === 'naiveBayes' && <><SectionTitle icon={BarChart3} title="朴素贝叶斯推断" subtitle="特征条件独立假设下的分类器" /><NaiveBayesModule /></>}
              {activeTab === 'numpy' && <><SectionTitle icon={Cpu} title="NumPy 内部机制" subtitle="Memory Management in Numerical Ops" /><NumpyModule /></>}
              {activeTab === 'backprop' && <><SectionTitle icon={Layers} title="反向传播推导" subtitle="Chain Rule & Weights Update" /><BackpropModule /></>}
              {activeTab === 'kernel' && <><SectionTitle icon={Grid3X3} title="卷积滤波器" subtitle="Spatial Feature Extraction" /><KernelModule /></>}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
        <p>© 2026 COMP2211 ML LAB. DATA DRIVEN LEARNING.</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 transition hover:text-blue-500 cursor-default"><Calculator size={14} /> Bayes Rule: Core</span>
          <span className="flex items-center gap-2 transition hover:text-blue-500 cursor-default"><Flame size={14} /> Fire Case: Interactive</span>
        </div>
      </footer>
    </div>
  );
}
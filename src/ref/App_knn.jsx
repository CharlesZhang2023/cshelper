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
  Wind,
  MoveHorizontal,
  MoveVertical,
  Maximize2,
  MousePointer2,
  LineChart as LineIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// --- KaTeX Helper Component ---
const Latex = ({ formula, displayMode = false, className = "" }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    const loadKatex = () => {
      if (window.katex) {
        window.katex.render(formula, containerRef.current, { throwOnError: false, displayMode });
        return;
      }
      if (!document.getElementById('katex-css')) {
        const link = document.createElement('link');
        link.id = 'katex-css'; link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('katex-js')) {
        const script = document.createElement('script');
        script.id = 'katex-js';
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => {
          if (containerRef.current) window.katex.render(formula, containerRef.current, { throwOnError: false, displayMode });
        };
        document.head.appendChild(script);
      }
    };
    loadKatex();
  }, [formula, displayMode]);
  return <span ref={containerRef} className={className} />;
};

// --- Data & Constants ---
const KNN_RAW_DATA = [
  { h: 158, w: 58, s: 'M' }, { h: 158, w: 59, s: 'M' }, { h: 158, w: 63, s: 'M' },
  { h: 160, w: 59, s: 'M' }, { h: 160, w: 60, s: 'M' }, { h: 163, w: 60, s: 'M' },
  { h: 163, w: 61, s: 'M' }, { h: 160, w: 64, s: 'L' }, { h: 163, w: 64, s: 'L' },
  { h: 165, w: 61, s: 'L' }, { h: 165, w: 62, s: 'L' }, { h: 165, w: 65, s: 'L' },
  { h: 168, w: 62, s: 'L' }, { h: 168, w: 63, s: 'L' }, { h: 168, w: 66, s: 'L' },
  { h: 170, w: 63, s: 'L' }, { h: 170, w: 64, s: 'L' }, { h: 170, w: 68, s: 'L' }
];

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

const INITIAL_MATRIX = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => r * 4 + c));

// --- Common UI Components ---
const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Icon size={20} /></div>
      <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">{title}</h2>
    </div>
    <p className="text-sm text-gray-500 ml-10 italic">{subtitle}</p>
  </div>
);

const SeniorAdvice = ({ content }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg shadow-sm">
    <div className="flex gap-2">
      <Zap className="text-amber-500 shrink-0" size={18} />
      <div><span className="font-bold text-amber-800 text-sm">学长寄语：</span><div className="text-amber-900 text-sm leading-relaxed inline">{content}</div></div>
    </div>
  </motion.div>
);

// --- Sub-Modules ---

// 1. KNN Module - 重构高亮逻辑
const KnnModule = () => {
  const [k, setK] = useState(5);
  const [isStandardized, setIsStandardized] = useState(false);
  const [testPoint, setTestPoint] = useState({ h: 161, w: 61 });
  const svgRef = useRef(null);

  const WIDTH = 400; const HEIGHT = 400;
  const stats = useMemo(() => ({ meanH: 164, meanW: 62.33, stdH: 4.33, stdW: 2.63, minH: 155, maxH: 175, minW: 55, maxW: 70 }), []);
  const scale = (val, min, max, target) => ((val - min) / (max - min)) * target;

  const processedData = useMemo(() => {
    const dataWithDist = KNN_RAW_DATA.map(d => {
      let dist;
      if (isStandardized) {
        const sh1 = (d.h - stats.meanH) / stats.stdH; const sw1 = (d.w - stats.meanW) / stats.stdW;
        const sh2 = (testPoint.h - stats.meanH) / stats.stdH; const sw2 = (testPoint.w - stats.meanW) / stats.stdW;
        dist = Math.sqrt(Math.pow(sh1 - sh2, 2) + Math.pow(sw1 - sw2, 2));
      } else { dist = Math.sqrt(Math.pow(d.h - testPoint.h, 2) + Math.pow(d.w - testPoint.w, 2)); }
      return { ...d, dist };
    });
    
    const sorted = [...dataWithDist].sort((a, b) => a.dist - b.dist);
    const topK = sorted.slice(0, k);
    const neighborsMap = new Map(topK.map((n, idx) => [`${n.h}-${n.w}`, idx + 1]));
    
    // 找出第 K 个邻居的距离，作为决策圆的半径
    const radiusDist = topK.length > 0 ? topK[topK.length - 1].dist : 0;

    const mCount = topK.filter(n => n.s === 'M').length;
    const lCount = topK.filter(n => n.s === 'L').length;
    return { data: dataWithDist, neighborsMap, radiusDist, prediction: mCount >= lCount ? 'M' : 'L', mCount, lCount, topK };
  }, [k, isStandardized, testPoint, stats]);

  const performanceData = useMemo(() => Array.from({ length: 15 }, (_, i) => ({ k: i + 1, error: 0.1 + Math.pow((i + 1) - 4, 2) * 0.01 + Math.random() * 0.02 })), []);

  const handleSvgClick = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const h = (x / WIDTH) * (stats.maxH - stats.minH) + stats.minH;
    const w = stats.maxW - (y / HEIGHT) * (stats.maxW - stats.minW);
    setTestPoint({ h: Math.round(h), w: Math.round(w) });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MousePointer2 size={14} className="text-blue-500" /> 点击背景移动测试点
            </h4>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setIsStandardized(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${!isStandardized ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Raw Data</button>
               <button onClick={() => setIsStandardized(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${isStandardized ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Standardized</button>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-[450px] mx-auto">
            <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full cursor-crosshair border-l border-b border-slate-200" onClick={handleSvgClick}>
              {[...Array(5)].map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={0} y1={(i * HEIGHT) / 4} x2={WIDTH} y2={(i * HEIGHT) / 4} stroke="#f1f5f9" strokeWidth="1" />
                  <line x1={(i * WIDTH) / 4} y1={0} x2={(i * WIDTH) / 4} y2={HEIGHT} stroke="#f1f5f9" strokeWidth="1" />
                </React.Fragment>
              ))}

              {/* 决策范围圆 (仅在非标准化模式下更直观) */}
              {!isStandardized && (
                <circle 
                  cx={scale(testPoint.h, stats.minH, stats.maxH, WIDTH)}
                  cy={HEIGHT - scale(testPoint.w, stats.minW, stats.maxW, HEIGHT)}
                  r={scale(stats.minH + processedData.radiusDist, stats.minH, stats.maxH, WIDTH)}
                  fill="rgba(59, 130, 246, 0.05)"
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )}

              {/* 邻居连线 */}
              {processedData.topK.map((n, i) => (
                <motion.line 
                  key={i} 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  x1={scale(testPoint.h, stats.minH, stats.maxH, WIDTH)} y1={HEIGHT - scale(testPoint.w, stats.minW, stats.maxW, HEIGHT)} 
                  x2={scale(n.h, stats.minH, stats.maxH, WIDTH)} y2={HEIGHT - scale(n.w, stats.minW, stats.maxW, HEIGHT)} 
                  stroke={n.s === 'M' ? '#3b82f6' : '#ef4444'} strokeWidth="2" opacity="0.6" 
                />
              ))}

              {/* 普通数据点 */}
              {processedData.data.map((d, i) => {
                const rank = processedData.neighborsMap.get(`${d.h}-${d.w}`);
                return (
                  <g key={i}>
                    <motion.circle 
                      cx={scale(d.h, stats.minH, stats.maxH, WIDTH)} cy={HEIGHT - scale(d.w, stats.minW, stats.maxW, HEIGHT)} 
                      r={rank ? 8 : 4} 
                      fill={d.s === 'M' ? '#3b82f6' : '#ef4444'} 
                      animate={{ 
                        opacity: rank ? 1 : 0.25,
                        scale: rank ? 1.3 : 1
                      }} 
                    />
                    {rank && (
                      <text 
                        x={scale(d.h, stats.minH, stats.maxH, WIDTH)} 
                        y={HEIGHT - scale(d.w, stats.minW, stats.maxW, HEIGHT) + 18} 
                        textAnchor="middle" className="text-[10px] font-black fill-slate-800"
                      >
                        #{rank}
                      </text>
                    )}
                  </g>
                );
              })}

              <motion.g animate={{ x: scale(testPoint.h, stats.minH, stats.maxH, WIDTH), y: HEIGHT - scale(testPoint.w, stats.minW, stats.maxW, HEIGHT) }}>
                <circle r="10" fill="#10b981" stroke="#fff" strokeWidth="4" className="shadow-2xl" />
                <text y="-18" textAnchor="middle" className="text-[10px] font-black fill-emerald-600 uppercase">Test Sample</text>
              </motion.g>
            </svg>
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Weight (kg)</div>
            <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Height (cm)</div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <LineIcon size={14} className="text-blue-500" /> Model Complexity vs Error Rate
             </h4>
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="k" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                    <ReferenceLine x={k} stroke="#fbbf24" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="error" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-4 text-center border-t border-slate-800 pt-4">
                <div><p className="text-[9px] text-slate-500 uppercase">Low K</p><p className="text-[10px] text-red-400 font-bold">Overfitting</p></div>
                <div><p className="text-[9px] text-slate-500 uppercase">High K</p><p className="text-[10px] text-orange-400 font-bold">Underfitting</p></div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">分类投票面板</h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">参数 K 值:</span>
                  <div className="flex items-center gap-4">
                     <input type="range" min="1" max="15" value={k} onChange={(e) => setK(parseInt(e.target.value))} className="w-24 accent-blue-600 cursor-ew-resize" />
                     <span className="text-2xl font-black text-blue-600 font-mono">{k}</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border-2 transition ${processedData.prediction === 'M' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent opacity-50'}`}>
                     <p className="text-[9px] font-black uppercase text-blue-600 mb-1">M Size Vote</p>
                     <p className="text-3xl font-black text-slate-800">{processedData.mCount}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border-2 transition ${processedData.prediction === 'L' ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-transparent opacity-50'}`}>
                     <p className="text-[9px] font-black uppercase text-red-600 mb-1">L Size Vote</p>
                     <p className="text-3xl font-black text-slate-800">{processedData.lCount}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <SeniorAdvice content={<>
        注意看图：当你调大 $K$ 时，搜索圆圈会不断扩张，直到包含更多的邻居。<b>排名 #1</b> 的邻居对分类影响最大（在加权 KNN 中）。这就是讲义 P.23 说的：通过增加 $K$ 值，我们可以让模型对离群点（Outliers）更加鲁棒，但太大了就会失去局部特征。
      </>} />
    </div>
  );
};

// 2. Bayes Basics (Draggable Mosaic for Fire Case)
const BayesBasicsModule = () => {
  const [params, setParams] = useState({ pB: 0.1, pEgB: 0.9, pEgNotB: 0.2 });
  const pE = (params.pB * params.pEgB) + ((1 - params.pB) * params.pEgNotB);
  const result = (params.pB * params.pEgB) / pE;

  return (
    <div className="space-y-10">
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col xl:flex-row gap-12 items-center">
          <ProbabilitySquare pB={params.pB} pEgB={params.pEgB} pEgNotB={params.pEgNotB} onChange={(v) => setParams(p => ({ ...p, ...v }))} labels={{ yAxis: "Fire", xAxis: "Smoke", be: "F & S", notbe: "¬F & S" }} />
          <div className="flex-1 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bayesian Evidence Update</h4>
            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl border border-slate-800">
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-500 italic">P(Fire ∩ Smoke) [蓝色面积]</span><span className="text-blue-400 font-bold">{(params.pB * params.pEgB).toFixed(4)}</span></div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-800"><span className="text-slate-500 italic">P(Smoke) [左侧总面积]</span><span className="text-slate-200 font-bold">{pE.toFixed(4)}</span></div>
                <div className="pt-4 text-center flex flex-col items-center">
                   <p className="text-[10px] text-slate-500 uppercase mb-2">Posterior Probability</p>
                   <span className="text-5xl font-black text-blue-500">{(result * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <SeniorAdvice content="拖动图中的手柄：减少火灾先验（横线向上），你会发现即便满屏都是烟雾，真有着火的概率也会骤降。这就是为什么专家诊断不能只看检查结果。" />
          </div>
      </section>
    </div>
  );
};

// 3. Naive Bayes (Mosaic for Disease Z Case)
const NaiveBayesModule = () => {
  const [inputs, setInputs] = useState({ BP: 'High', Fever: 'No', Diabetes: 'Yes', Vomit: 'Yes' });
  const [customPrior, setCustomPrior] = useState(9/14);

  const stats = useMemo(() => {
    const res = { yes: { likelihood: 1 }, no: { likelihood: 1 } };
    Object.entries(inputs).forEach(([feat, val]) => {
      res.yes.likelihood *= (BAYES_DATA.counts[feat][val].yes) / 9;
      res.no.likelihood *= (BAYES_DATA.counts[feat][val].no) / 5;
    });
    return res;
  }, [inputs]);

  const pE = (customPrior * stats.yes.likelihood) + ((1 - customPrior) * stats.no.likelihood);
  const finalProb = (customPrior * stats.yes.likelihood) / pE;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Patient Symptoms</p>
           <div className="space-y-5">
              {Object.keys(inputs).map(f => (
                <div key={f}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">{f}</label>
                  <select value={inputs[f]} onChange={(e)=>setInputs({...inputs, [f]: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {Object.keys(BAYES_DATA.counts[f]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm flex flex-col md:flex-row gap-10 items-center">
           <ProbabilitySquare pB={customPrior} pEgB={stats.yes.likelihood} pEgNotB={stats.no.likelihood} onChange={(v)=>v.pB !== undefined && setCustomPrior(v.pB)} labels={{ yAxis: "Disease Z", xAxis: "Symptoms", be: "Yes & Match", notbe: "No but Match" }} />
           <div className="flex-1 space-y-6 w-full">
              <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white shadow-xl">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-6 tracking-widest">Diagnostic Inference</h4>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[11px] font-black mb-2 uppercase"><span>P(Yes | Evidence)</span><span className="text-blue-400">{(finalProb*100).toFixed(1)}%</span></div>
                       <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden"><motion.div animate={{ width: `${finalProb*100}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /></div>
                    </div>
                    <div className="pt-4 border-t border-slate-800 text-center">
                       <p className={`text-xl font-black uppercase tracking-tighter ${finalProb > 0.5 ? 'text-blue-400' : 'text-slate-400'}`}>
                         {finalProb > 0.5 ? 'Confirmed Presence' : 'Likely Healthy'}
                       </p>
                    </div>
                 </div>
              </div>
              <SeniorAdvice content="切换左侧症状：当你选 BP=Low 时，你会看到图中下方灰色块消失（概率为0），这正是讲义中提到的『零频率问题』，此时必须用 Laplace Smoothing 修正。" />
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Probability Square Helper ---
const ProbabilitySquare = ({ pB, pEgB, pEgNotB, onChange, labels }) => {
  const containerRef = useRef(null); const size = 260;
  const startDrag = (type) => {
    const onMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const val = Math.max(0.01, Math.min(0.99, type === 'y' ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width));
      if (type === 'y') onChange({ pB: val }); else if (type === 'x-top') onChange({ pEgB: val }); else if (type === 'x-bottom') onChange({ pEgNotB: val });
    };
    const onEnd = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onEnd);
  };
  return (
    <div className="relative group select-none" ref={containerRef} style={{ width: size, height: size }}>
      <div className="absolute inset-0 border-2 border-slate-200 rounded-[1.5rem] overflow-hidden flex flex-col bg-slate-50">
        <div style={{ height: `${pB * 100}%` }} className="flex border-b border-white">
          <div style={{ width: `${pEgB * 100}%` }} className="bg-blue-500/80 border-r border-white flex items-center justify-center overflow-hidden"><span className="text-[8px] text-white font-bold opacity-30 uppercase">{labels.be}</span></div>
          <div className="flex-1 bg-blue-100" />
        </div>
        <div className="flex-1 flex">
          <div style={{ width: `${pEgNotB * 100}%` }} className="bg-slate-300 border-r border-white flex items-center justify-center overflow-hidden"><span className="text-[8px] text-slate-500 font-bold opacity-30 uppercase">{labels.notbe}</span></div>
          <div className="flex-1 bg-slate-100" />
        </div>
      </div>
      <div onMouseDown={() => startDrag('y')} style={{ top: `${pB * 100}%` }} className="absolute left-0 right-0 h-2 bg-white cursor-row-resize z-20 hover:bg-red-400 group shadow-sm transition-colors"><div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl border border-slate-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><MoveVertical size={10} className="text-red-500" /></div></div>
      <div onMouseDown={() => startDrag('x-top')} style={{ left: `${pEgB * 100}%`, height: `${pB * 100}%`, top: 0 }} className="absolute w-2 bg-white cursor-col-resize z-20 hover:bg-blue-400 group shadow-sm transition-colors"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl border border-slate-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><MoveHorizontal size={10} className="text-blue-500" /></div></div>
      <div onMouseDown={() => startDrag('x-bottom')} style={{ left: `${pEgNotB * 100}%`, height: `${(1 - pB) * 100}%`, bottom: 0 }} className="absolute w-2 bg-white cursor-col-resize z-20 hover:bg-slate-500 group shadow-sm transition-colors"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl border border-slate-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><MoveHorizontal size={10} className="text-slate-600" /></div></div>
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase rotate-[-90deg] tracking-[0.2em]">{labels.yAxis}</div>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{labels.xAxis}</div>
    </div>
  );
};

// --- Other modules (NumPy, Backprop, Kernel) ---
const NumpyModule = () => {
  const [sliceType, setSliceType] = useState('none');
  const getHighlight = (r, c, val) => { if (sliceType === 'slice') return r === 1; if (sliceType === 'fancy') return r === 0 || r === 2; if (sliceType === 'mask') return val % 2 === 0; return false; };
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
            {['slice', 'fancy', 'mask'].map(t => (
              <button key={t} onClick={() => setSliceType(t)} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${sliceType === t ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-slate-200'}`}>a[{t === 'slice' ? '1:2, :' : t === 'fancy' ? '[0, 2]' : 'a%2==0'}]</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center"><div className="p-6 bg-white border-2 border-dashed rounded-3xl text-sm text-slate-600">Basic Slicing 只移动指针（View），Fancy indexing 会创建全新副本（Copy）。</div></div>
      </div>
    </div>
  );
};

const BackpropModule = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6 text-center">
        <div className="relative h-64 bg-slate-900 rounded-[2.5rem] overflow-hidden p-8 flex items-center justify-between border border-slate-800 shadow-2xl">
          <div className="z-10 flex flex-col gap-12"><div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-mono">i</div><div className="w-10 h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-mono">j</div></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><line x1="15%" y1="35%" x2="85%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="4" /><line x1="15%" y1="65%" x2="85%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="4" /><AnimatePresence>{isAnimating && <motion.circle initial={{ cx: "85%", cy: "50%", r: 4 }} animate={{ cx: "15%", cy: "35%", r: 6 }} transition={{ duration: 1.5 }} fill="#ef4444" />}</AnimatePresence></svg>
          <div className="z-10 w-16 h-16 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center text-white font-black border-4 border-red-200">δk</div>
        </div>
        <button onClick={() => {setIsAnimating(true); setTimeout(()=>setIsAnimating(false), 2000)}} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition">Trace Gradient Flow</button>
      </div>
      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200"><Latex displayMode formula="\Delta w_{jk} = \eta \cdot \delta_k \cdot O_j" /></div>
    </div>
  );
};

const KernelModule = () => {
  const [kernel, setKernel] = useState([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]);
  const sourceImage = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]].map(row => row.map(v => v * 100));
  const getConv = (ri, ci) => { let s = 0; for(let r=0; r<3; r++) for(let c=0; c<3; c++) s += sourceImage[ri+r][ci+c] * kernel[r][c]; return Math.max(0, Math.min(255, Math.abs(s))); };
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col items-center"><span className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Input Image</span><div className="grid grid-cols-8 gap-px bg-slate-300 p-0.5 border-2 rounded shadow-sm">{sourceImage.map((row, ri) => row.map((val, ci) => <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{backgroundColor: `rgb(${val},${val},${val})`}} />))}</div></div>
        <div className="flex flex-col items-center gap-6"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3x3 Kernel</span><div className="grid grid-cols-3 gap-2 p-5 bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] shadow-inner">{kernel.map((row, ri) => row.map((val, ci) => (
          <input key={`${ri}-${ci}`} type="number" value={val} onChange={(e) => { const k = kernel.map((r, r_idx) => r.map((c, c_idx) => r_idx === ri && c_idx === ci ? Number(e.target.value) : c)); setKernel(k); }} className="w-10 h-10 bg-white border border-indigo-200 rounded-lg text-center font-mono font-bold text-indigo-700 shadow-sm" />
        )))}</div></div>
        <div className="flex flex-col items-center"><span className="text-[10px] font-black text-green-500 uppercase mb-4 tracking-widest">Output Feature Map</span><div className="grid grid-cols-6 gap-px bg-slate-300 p-0.5 border-2 rounded shadow-sm">{Array.from({length: 6}).map((_, ri) => Array.from({length: 6}).map((_, ci) => <div key={`${ri}-${ci}`} className="w-6 h-6 sm:w-8 sm:h-8" style={{backgroundColor: `rgb(${getConv(ri, ci)},${getConv(ri, ci)},${getConv(ri, ci)})`}} />))}</div></div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('knn');
  const tabs = [
    { id: 'knn', label: 'K-Nearest Neighbor', icon: Maximize2, subtitle: 'Lazy Learning & Distance Ranking' },
    { id: 'bayesBasics', label: '贝叶斯基础', icon: Calculator, subtitle: 'Evidence Updating' },
    { id: 'naiveBayes', label: '朴素贝叶斯诊断', icon: BarChart3, subtitle: 'Multi-feature Mosaic Map' },
    { id: 'numpy', label: 'NumPy 机制', icon: Cpu, subtitle: 'Memory & Broadcasting' },
    { id: 'backprop', label: '反向传播推导', icon: Layers, subtitle: 'The Chain Rule' },
    { id: 'kernel', label: '卷积实验室', icon: Grid3X3, subtitle: 'Spatial Filtering' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">CS/AI <span className="text-blue-600">交互式学习实验室</span></h1>
          <div className="flex items-center gap-3 mt-3 text-slate-500 font-medium">
            <p className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs">COMP2211 ML Lab</p>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase font-black tracking-widest shadow-sm">v7.0 Interaction Hub</span>
          </div>
        </div>
        <div className="px-6 py-3 bg-white border border-slate-200 rounded-full shadow-lg flex items-center gap-3 text-xs font-mono text-slate-500">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></div> Academic Environment Ready
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        <nav className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-10 space-y-4 shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-4 underline underline-offset-8">Lab Modules</p>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 text-left ${activeTab === tab.id ? 'bg-white shadow-2xl shadow-blue-100/50 text-blue-600 border border-blue-50 -translate-y-1' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}`}>
              <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}><tab.icon size={20} /></div>
              <div className="flex flex-col overflow-hidden"><span className="text-sm font-black truncate">{tab.label}</span><span className="text-[10px] opacity-60 font-medium truncate">{tab.subtitle}</span></div>
            </button>
          ))}
        </nav>

        <section className="flex-1 p-10 md:p-16 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }} className="h-full">
              {activeTab === 'knn' && <><SectionTitle icon={Maximize2} title="K-Nearest Neighbor 实验室" subtitle="可视化“近朱者赤”的距离判决逻辑" /><KnnModule /></>}
              {activeTab === 'bayesBasics' && <><SectionTitle icon={Calculator} title="贝叶斯定理基础" subtitle="信念更新的可视化直觉" /><BayesBasicsModule /></>}
              {activeTab === 'naiveBayes' && <><SectionTitle icon={BarChart3} title="朴素贝叶斯诊断" subtitle="基于 Disease Z 的概率面积判决" /><NaiveBayesModule /></>}
              {activeTab === 'numpy' && <><SectionTitle icon={Cpu} title="NumPy 内部机制" subtitle="Memory Management in Numerical Ops" /><NumpyModule /></>}
              {activeTab === 'backprop' && <><SectionTitle icon={Layers} title="反向传播推导" subtitle="Chain Rule & Weights Update" /><BackpropModule /></>}
              {activeTab === 'kernel' && <><SectionTitle icon={Grid3X3} title="卷积实验室" subtitle="Spatial Feature Extraction" /><KernelModule /></>}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4"><p>© 2026 COMP2211 ML LAB. DATA DRIVEN LEARNING.</p><div>Enhanced with Framer Motion & KaTeX</div></footer>
    </div>
  );
}
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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
    className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg"
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

// A: NumPy Mechanism
const NumpyModule = () => {
  const [sliceType, setSliceType] = useState('none');

  const getHighlight = (r, c, val) => {
    if (sliceType === 'slice') return r === 1; 
    if (sliceType === 'fancy') return r === 0 || r === 2; 
    if (sliceType === 'mask') return val % 2 === 0; 
    return false;
  };

  const getInfo = () => {
    switch(sliceType) {
      case 'slice': return { label: "View (Reference)", color: "bg-green-500", desc: "Basic Slicing 总是返回视图。修改它会直接改变原矩阵内存！" };
      case 'fancy': return { label: "Copy (New Memory)", color: "bg-blue-500", desc: "Fancy Indexing 创建的是副本。这涉及到内存分配，大规模使用时效率较低。" };
      case 'mask': return { label: "Copy (New Memory)", color: "bg-purple-500", desc: "Boolean Mask 同样会触发内存复制。它是提取特定条件数据的神器。" };
      default: return null;
    }
  };

  const info = getInfo();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Grid3X3 size={18} className="text-blue-500" />
          1. 内存切片可视化 (4x4 Matrix)
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
              <button onClick={() => setSliceType('slice')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'slice' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'}`}>a[1:2, :]</button>
              <button onClick={() => setSliceType('fancy')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'fancy' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>a[[0, 2]]</button>
              <button onClick={() => setSliceType('mask')} className={`px-4 py-2 rounded-lg text-xs font-mono transition shadow-sm ${sliceType === 'mask' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'}`}>a[a % 2 == 0]</button>
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
              <p className="text-sm text-gray-400 italic">选择一种切片方式观察 NumPy 的内存行为...</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-blue-500" />
          2. 广播机制 (Broadcasting)
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
          <SeniorAdvice content={<>广播不是真的把数据在内存里复制，而是在遍历迭代器时虚拟地映射地址。核心准则：从最后一位往前对，要么相等，要么其中一个是 <Latex formula="1" />。</>} />
        </div>
      </div>
    </div>
  );
};

// B: Backprop Module
const BackpropModule = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorVal, setErrorVal] = useState(0.8);

  const startTracking = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity size={18} className="text-red-500" />
          链式法则追踪器
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
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Output Layer</p>
            <p className="text-xs text-red-400 font-bold flex items-center gap-1 justify-end">
              Error <Latex formula="\delta_k" />
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">误差值 <Latex formula="(Target - Out)" />:</label>
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
            <Play size={16} fill="currentColor" /> {isAnimating ? "正在推导梯度..." : "追踪梯度 Δwjk"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 italic border-b pb-2">
          <Search size={16} className="text-blue-500" />
          推导笔记本 (COMP2211 Core)
        </h4>
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">Step 1: 链式法则展开</p>
            <Latex displayMode formula="\frac{\partial E}{\partial w_{jk}} = \frac{\partial E}{\partial O_k} \cdot \frac{\partial O_k}{\partial net_k} \cdot \frac{\partial net_k}{\partial w_{jk}}" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">Step 2: 定义误差项 (Error Signal)</p>
            <p className="text-xs text-gray-600 mb-2">令 <Latex formula="\delta_k = - \frac{\partial E}{\partial net_k}" />。在 MSE 损失下：</p>
            <Latex displayMode formula="\delta_k = (T_k - O_k) \cdot f'(net_k)" className="text-red-700" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-xs text-slate-400 uppercase mb-2">Step 3: 权重更新量</p>
            <Latex displayMode formula="\Delta w_{jk} = \eta \cdot \delta_k \cdot O_j" className="text-green-700" />
          </div>
          <SeniorAdvice content={<>记住，反向传播本质上是『寻找罪魁祸首』的过程。每一层权重 <Latex formula="w_{jk}" /> 都在问：误差 <Latex formula="E" /> 有多少是由我负责的？<Latex formula="\delta_k" /> 就是上一层传回来的『责备信』。</>} />
        </div>
      </div>
    </div>
  );
};

// C: Convolution Module
const KernelModule = () => {
  const [kernel, setKernel] = useState(KERNEL_PRESETS['Sobel-X']);
  const [activePreset, setActivePreset] = useState('Sobel-X');

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
           Operation: <Latex formula="(I * K)_{x,y}" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Input Image <Latex formula="I" /></span>
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
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Kernel <Latex formula="K" /></span>
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
          <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">Output Feature Map</span>
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
      <SeniorAdvice content={<>卷积核本质上是一个局部特征过滤器。当你使用 <Latex formula="\text{Laplacian}" /> 算子时，它在做二阶导数近似，能迅速捕捉到像素亮度的『突变点』。</>} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('numpy');

  const tabs = [
    { id: 'numpy', label: 'NumPy 机制', icon: Cpu, subtitle: 'View vs Copy & Broadcasting' },
    { id: 'backprop', label: '反向传播', icon: Layers, subtitle: 'The Chain Rule Visualized' },
    { id: 'kernel', label: '卷积核实验室', icon: Grid3X3, subtitle: 'Edge Detection Simulation' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            CS/AI <span className="text-blue-600">交互式学习实验室</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500 font-medium">COMP2211 Machine Learning Notebook</p>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase font-black">v2.0 Katex Enhanced</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-3 text-xs font-mono text-slate-500">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          Environment: Ready / KaTeX Engine Active
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-8 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Knowledge Core</p>
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
                <span className="text-xs font-bold uppercase tracking-wider">Exam Tip</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                考试注意：<Latex formula="\text{Broadcasting}" /> 只能扩展 Size 为 1 的维度。
                <Latex formula="\mathbf{A} \cdot \mathbf{B}" /> (np.dot) 和 <Latex formula="\mathbf{A} \odot \mathbf{B}" /> (Element-wise) 物理含义完全不同！
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
                    title="NumPy 内部机制" 
                    subtitle="深入内存地址映射与广播逻辑" 
                  />
                  <NumpyModule />
                </>
              )}
              {activeTab === 'backprop' && (
                <>
                  <SectionTitle 
                    icon={Layers} 
                    title="反向传播与梯度更新" 
                    subtitle="链式法则是连接误差与权重的桥梁" 
                  />
                  <BackpropModule />
                </>
              )}
              {activeTab === 'kernel' && (
                <>
                  <SectionTitle 
                    icon={Grid3X3} 
                    title="卷积核实验室" 
                    subtitle="实时模拟空间滤波器如何提取边缘特征" 
                  />
                  <KernelModule />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
        <p>© 2024 COMP2211 ML Learning Lab. Education through interaction.</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 hover:text-blue-500 cursor-default transition"><RefreshCw size={14} /> Latency: 12ms</span>
          <span className="flex items-center gap-2 hover:text-blue-500 cursor-default transition"><Cpu size={14} /> Render: KaTeX High-Def</span>
        </div>
      </footer>
    </div>
  );
}
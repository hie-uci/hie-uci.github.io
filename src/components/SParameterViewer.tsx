"use client";

import React, { useState, useMemo, ChangeEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { UploadCloud, FileText, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import { parseTouchstone, sToMixedMode, cDB, cPhase, cMag, computeTDR, getTdrValidationError, MixedModePairing, TDRPoint } from '../lib/sParameterEngine';
import { SmithChart } from './SmithChart';

// Categorical series tokens from globals.css: they switch with the theme.
const colors = Array.from({ length: 8 }, (_, i) => `var(--series-${i + 1})`);

const axisTick = { fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-martian)' };
const axisLabel = { fill: 'var(--ink-3)', fontSize: 11 };

interface PlotDataPoint {
  frequency: number;
  fGHz: number;
  [key: string]: number | string;
}

type ChartType = 'S' | 'Z' | 'Y' | 'L' | 'C' | 'Q' | 'ESR' | 'Rp' | 'VSWR' | 'GD' | 'K';
type SParamViewType = 'Magnitude' | 'Phase' | 'Real' | 'Imag';

interface TooltipPayloadEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
}

function numericValue(point: PlotDataPoint, key: string): number {
  const value = point[key];
  return typeof value === 'number' ? value : Number(value);
}

function SParameterTooltip({
  active,
  payload,
  label,
  chartType,
  sParamViewType,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: number | string;
  chartType: ChartType;
  sParamViewType: SParamViewType;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[4px] border border-line-strong bg-surface p-3 shadow-[var(--shadow-pop)]">
      <p className="kicker mb-2 normal-case">{`${label} GHz`}</p>
      {payload.map((entry, index) => {
        const dataKey = String(entry.dataKey ?? '');
        const isComplex = dataKey.includes('_Magnitude') || dataKey.includes('_Phase') || dataKey.includes('_Real') || dataKey.includes('_Imag');
        const name = isComplex ? dataKey.split('_')[0] : String(entry.name ?? '');

        let unit = '';
        if (chartType === 'S') unit = sParamViewType === 'Magnitude' ? 'dB' : sParamViewType === 'Phase' ? '°' : '';
        else if (chartType === 'Z' || chartType === 'Y' || chartType === 'ESR' || chartType === 'Rp') {
          if (chartType === 'Y') unit = 'S';
          else unit = 'Ω';
          if (isComplex && sParamViewType === 'Phase') unit = '°';
        }
        else if (chartType === 'L') unit = 'nH';
        else if (chartType === 'C') unit = 'pF';
        else if (chartType === 'GD') unit = 'ps';
        else if (chartType === 'VSWR' || chartType === 'K' || chartType === 'Q') unit = '';

        return (
          <p key={index} className="readout text-[13px]" style={{ color: entry.color }}>
            {name}: {entry.value} {unit}
          </p>
        );
      })}
    </div>
  );
}

export default function SParameterViewer() {
  const [data, setData] = useState<PlotDataPoint[]>([]);
  const [tdrData, setTdrData] = useState<TDRPoint[]>([]);
  const [viewMode, setViewMode] = useState<'Frequency' | 'Time' | 'SmithChart'>('Frequency');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPassive, setIsPassive] = useState<boolean>(true);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [maxPassivitySingularValue, setMaxPassivitySingularValue] = useState<number | null>(null);
  const [tdrWarning, setTdrWarning] = useState<string>('');
  const [stabilitySummary, setStabilitySummary] = useState<string>('');
  
  const [analysisGroup, setAnalysisGroup] = useState<'S' | 'ZY' | 'Comp' | 'Sys'>('S');
  const [chartType, setChartType] = useState<ChartType>('S');
  const [sParamViewType, setSParamViewType] = useState<SParamViewType>('Magnitude');
  const [sParamMode, setSParamMode] = useState<'Single' | 'Mixed'>('Single');
  const [mixedModePairing, setMixedModePairing] = useState<MixedModePairing>('12-34');
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [numPorts, setNumPorts] = useState<number>(0);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setParseWarnings([]);
    
    const match = file.name.match(/\.s(\d+)p$/i);
    let ports = 2;
    if (match) {
      ports = parseInt(match[1]);
    } else {
      ports = 2;
    }
    setNumPorts(ports);

    try {
      const text = await file.text();
      const parsed = parseTouchstone(text, ports);
      if (parsed.errors?.length) throw new Error(parsed.errors.join(' '));
      if (parsed.points.length === 0) {
        throw new Error('Could not parse any valid frequency points. Check file format.');
      }
      setIsPassive(parsed.isPassive);
      setParseWarnings(parsed.warnings ?? []);
      setMaxPassivitySingularValue(parsed.maxPassivitySingularValue);
      
      const plotData = parsed.points.map(pt => {
        const f = pt.frequency;
        const fGHz = f / 1e9;
        const w = 2 * Math.PI * f;
        
        const S = pt.matrix;
        const N = S.length;
        
        const dataPoint: PlotDataPoint = {
          frequency: f,
          fGHz: parseFloat(fGHz.toFixed(4)),
        };
      
        // Standard Single-Ended S-Parameters
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            dataPoint[`S${i+1}${j+1}_Magnitude`] = parseFloat(cDB(S[i][j]).toFixed(4));
            dataPoint[`S${i+1}${j+1}_Phase`] = parseFloat((cPhase(S[i][j]) * 180 / Math.PI).toFixed(4));
            dataPoint[`S${i+1}${j+1}_Real`] = parseFloat(S[i][j].real.toFixed(4));
            dataPoint[`S${i+1}${j+1}_Imag`] = parseFloat(S[i][j].imag.toFixed(4));
          }
        }

        // Mixed-Mode for 4-port
        if (N === 4) {
          (['12-34', '13-24', '14-23'] as MixedModePairing[]).forEach(pairing => {
            const S_mm = sToMixedMode(S, pairing);
            if (!S_mm) return;
            const mmLabels = ['dd1', 'dd2', 'cc1', 'cc2'];
            for (let i = 0; i < 4; i++) {
              for (let j = 0; j < 4; j++) {
                const label = `S${mmLabels[i][0]}${mmLabels[j][0]}${mmLabels[i][2]}${mmLabels[j][2]}`;
                dataPoint[`${label}_${pairing}_Magnitude`] = parseFloat(cDB(S_mm[i][j]).toFixed(4));
                dataPoint[`${label}_${pairing}_Phase`] = parseFloat((cPhase(S_mm[i][j]) * 180 / Math.PI).toFixed(4));
                dataPoint[`${label}_${pairing}_Real`] = parseFloat(S_mm[i][j].real.toFixed(4));
                dataPoint[`${label}_${pairing}_Imag`] = parseFloat(S_mm[i][j].imag.toFixed(4));
              }
            }
          });
        }
      
        if (pt.Z) {
          for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
              const zij = pt.Z[i][j];
              dataPoint[`Z${i+1}${j+1}_Magnitude`] = parseFloat(cMag(zij).toFixed(4));
              dataPoint[`Z${i+1}${j+1}_Phase`] = parseFloat((cPhase(zij) * 180 / Math.PI).toFixed(4));
              dataPoint[`Z${i+1}${j+1}_Real`] = parseFloat(zij.real.toFixed(4));
              dataPoint[`Z${i+1}${j+1}_Imag`] = parseFloat(zij.imag.toFixed(4));
              
              if (i === j) {
                if (zij.imag > 0) dataPoint[`L${i+1}${i+1}`] = parseFloat(((zij.imag / w) * 1e9).toFixed(4));
                if (zij.imag < 0) dataPoint[`C${i+1}${i+1}`] = parseFloat(((-1 / (w * zij.imag)) * 1e12).toFixed(4));
                if (zij.real !== 0) dataPoint[`Q${i+1}${i+1}`] = parseFloat(Math.abs(zij.imag / zij.real).toFixed(4));
              }
            }
          }
          if (N >= 2) {
            const zdiff_real = pt.Z[0][0].real + pt.Z[1][1].real - pt.Z[0][1].real - pt.Z[1][0].real;
            const zdiff_imag = pt.Z[0][0].imag + pt.Z[1][1].imag - pt.Z[0][1].imag - pt.Z[1][0].imag;
            if (zdiff_imag > 0) dataPoint['L_diff'] = parseFloat(((zdiff_imag / w) * 1e9).toFixed(4));
            if (zdiff_imag < 0) dataPoint['C_diff'] = parseFloat(((-1 / (w * zdiff_imag)) * 1e12).toFixed(4));
            if (zdiff_real !== 0) dataPoint['Q_diff'] = parseFloat(Math.abs(zdiff_imag / zdiff_real).toFixed(4));
          }
        }

        if (pt.Y) {
          for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
              const yij = pt.Y[i][j];
              dataPoint[`Y${i+1}${j+1}_Magnitude`] = parseFloat(cMag(yij).toFixed(4));
              dataPoint[`Y${i+1}${j+1}_Phase`] = parseFloat((cPhase(yij) * 180 / Math.PI).toFixed(4));
              dataPoint[`Y${i+1}${j+1}_Real`] = parseFloat(yij.real.toFixed(4));
              dataPoint[`Y${i+1}${j+1}_Imag`] = parseFloat(yij.imag.toFixed(4));
            }
          }
        }

        if (pt.vswr) {
          for (let i = 0; i < N; i++) {
            dataPoint[`VSWR${i+1}`] = parseFloat(pt.vswr[i].toFixed(4));
          }
        }

        if (pt.ESR) {
          for (let i = 0; i < N; i++) {
            dataPoint[`ESR${i+1}`] = parseFloat(pt.ESR[i].toFixed(4));
          }
        }

        if (pt.Rp) {
          for (let i = 0; i < N; i++) {
            dataPoint[`Rp${i+1}`] = parseFloat(pt.Rp[i].toFixed(4));
          }
        }

        if (pt.groupDelay !== undefined) {
          dataPoint[`GD21`] = parseFloat((pt.groupDelay * 1e12).toFixed(4)); // seconds to ps
        }

        if (pt.K !== undefined) {
          dataPoint[`K`] = parseFloat(pt.K.toFixed(4));
        }
        if (pt.deltaMagnitude !== undefined) dataPoint['Delta'] = parseFloat(pt.deltaMagnitude.toFixed(4));
      
        return dataPoint;
      });

      setData(plotData);
      const tdrError = getTdrValidationError(parsed.points);
      setTdrWarning(tdrError ?? 'Approximate transform: any missing DC data is extrapolated and a one-sided raised-cosine low-pass taper is applied. Interpret discontinuity locations and impedance quantitatively only after checking bandwidth and calibration.');
      setTdrData(tdrError ? [] : computeTDR(parsed.points, 0));
      if (ports === 2) {
        const stableCount = parsed.points.filter(point => point.unconditionallyStable).length;
        setStabilitySummary(`${stableCount}/${parsed.points.length} frequency points satisfy both K > 1 and |Δ| < 1.`);
      } else setStabilitySummary('');
      setSParamMode('Single');
      setViewMode('Frequency');
      setSParamViewType('Magnitude');
      setAnalysisGroup('S');

      if (ports >= 2) {
        setSelectedKeys(['S11', 'S21']);
      } else {
        setSelectedKeys(['S11']);
      }
      setChartType('S');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing Touchstone file.');
      setData([]);
      setParseWarnings([]);
      setMaxPassivitySingularValue(null);
      setTdrWarning('');
      setStabilitySummary('');
    }
  };

  const handleClear = () => {
    setData([]);
    setTdrData([]);
    setFileName('');
    setError('');
    setParseWarnings([]);
    setMaxPassivitySingularValue(null);
    setTdrWarning('');
    setStabilitySummary('');
    setSelectedKeys([]);
  };

  const availableKeys = useMemo(() => {
    if (data.length === 0) return [];
    if (chartType === 'S' || chartType === 'Z' || chartType === 'Y') {
      if (sParamMode === 'Mixed' && chartType === 'S') {
        return ['Sdd11', 'Sdd21', 'Sdd12', 'Sdd22', 'Scc11', 'Scc21', 'Scc12', 'Scc22', 'Scd11', 'Sdc11'];
      }
      const keys = [];
      for (let i = 1; i <= numPorts; i++) {
        for (let j = 1; j <= numPorts; j++) {
          keys.push(`${chartType}${i}${j}`);
        }
      }
      return keys;
    } else if (chartType === 'L' || chartType === 'C' || chartType === 'Q' || chartType === 'ESR' || chartType === 'Rp' || chartType === 'VSWR') {
      return Array.from(new Set(data.flatMap(point => Object.keys(point).filter(key => key.startsWith(chartType)))));
    } else if (chartType === 'GD') {
      return ['GD21'];
    } else if (chartType === 'K') {
      return ['K', 'Delta'];
    }
    return [];
  }, [data, chartType, sParamMode, numPorts]);

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    if (data.length > 0) {
      if (type === 'S' || type === 'Z' || type === 'Y') {
        if (sParamMode === 'Mixed' && type === 'S') setSelectedKeys(['Sdd11', 'Sdd21']);
        else setSelectedKeys(numPorts >= 2 ? [`${type}11`, `${type}21`] : [`${type}11`]);
      } else if (type === 'L') {
        setSelectedKeys(numPorts >= 2 ? ['L_diff', 'L11'] : ['L11']);
      } else if (type === 'C') {
        setSelectedKeys(numPorts >= 2 ? ['C_diff', 'C11'] : ['C11']);
      } else if (type === 'Q') {
        setSelectedKeys(numPorts >= 2 ? ['Q_diff', 'Q11'] : ['Q11']);
      } else if (type === 'ESR' || type === 'Rp' || type === 'VSWR') {
        setSelectedKeys([`${type}1`]);
      } else if (type === 'GD') {
        setSelectedKeys(['GD21']);
      } else if (type === 'K') {
        setSelectedKeys(['K', 'Delta']);
      }
    }
  };

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const group = e.target.value as 'S' | 'ZY' | 'Comp' | 'Sys';
    setAnalysisGroup(group);
    if (group === 'S') handleChartTypeChange('S');
    else if (group === 'ZY') handleChartTypeChange('Z');
    else if (group === 'Comp') handleChartTypeChange('L');
    else if (group === 'Sys') handleChartTypeChange('VSWR');
  };

  const handleModeChange = (mode: 'Single' | 'Mixed') => {
    setSParamMode(mode);
    if (mode === 'Mixed') setSelectedKeys(['Sdd11', 'Sdd21']);
    else setSelectedKeys(['S11', 'S21']);
  };

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const s11SmithPoints = useMemo(
    () => data
      .map(d => ({ real: numericValue(d, 'S11_Real'), imag: numericValue(d, 'S11_Imag') }))
      .filter(point => Number.isFinite(point.real) && Number.isFinite(point.imag)),
    [data]
  );

  const s22SmithPoints = useMemo(
    () => data
      .map(d => ({ real: numericValue(d, 'S22_Real'), imag: numericValue(d, 'S22_Imag') }))
      .filter(point => Number.isFinite(point.real) && Number.isFinite(point.imag)),
    [data]
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="kicker">Touchstone file</p>
          <p className="mt-1.5 text-sm text-ink-2">
            Upload a Touchstone v1/full-matrix file (.sNp) to view S-parameters, L, C, Q, and system metrics.
          </p>
        </div>
        
        {!data.length ? (
          <label className="btn btn-primary shrink-0 cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
            <UploadCloud size={20} />
            <span>Upload File</span>
            <input type="file" accept=".s1p,.s2p,.s3p,.s4p,.s5p,.s6p,.s7p,.s8p,.s9p,.s10p,.s11p,.s12p" className="sr-only" onChange={handleFileUpload} />
          </label>
        ) : (
          <div className="flex shrink-0 items-center gap-3 rounded-md border border-line bg-bg-raised px-4 py-2">
            <FileText size={18} className="text-accent-ink" aria-hidden="true" />
            <span className="max-w-[150px] truncate font-mono text-[13px] text-ink md:max-w-[250px]">{fileName}</span>
            <button type="button" onClick={handleClear} className="btn-icon h-9 min-h-9 w-9 min-w-9 text-ink-3 hover:text-ink" title="Remove file" aria-label="Remove file">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-[4px] border border-marker-ink/45 bg-marker/10 p-4 text-sm text-ink" role="alert">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data.length > 0 && !isPassive && (
        <div className="flex items-start gap-3 rounded-[4px] border border-marker-ink/45 bg-marker/10 p-4 text-sm text-ink">
          <ShieldAlert size={18} className="shrink-0" />
          <span>Warning: The S-matrix passivity check exceeded the +0.1 dB numerical-tolerance threshold (σmax &gt; 1.0116){maxPassivitySingularValue !== null ? `; measured max σ=${maxPassivitySingularValue.toFixed(3)}` : ''}. This can be expected for active devices; for a passive DUT, check calibration, reference impedance, and de-embedding.</span>
        </div>
      )}

      {parseWarnings.length > 0 && (
        <div className="flex items-start gap-3 rounded-[4px] border border-marker-ink/45 bg-marker/10 p-4 text-sm text-ink">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            {parseWarnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        </div>
      )}

      {data.length > 0 && tdrWarning && (
        <div className={`rounded-[4px] border p-3 text-xs ${tdrData.length ? 'border-line bg-surface-2/60 text-ink-2' : 'border-marker-ink/45 bg-marker/10 text-ink'}`}>
          TDR: {tdrWarning}
        </div>
      )}

      {data.length > 0 && (
        <div className="flex flex-col gap-6">
          
          <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="View">
            <button
              type="button"
              onClick={() => setViewMode('Frequency')}
              role="tab" aria-selected={viewMode === 'Frequency'} className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${viewMode === 'Frequency' ? 'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-marker' : 'text-ink-3 hover:text-ink'}`}
            >
              Frequency Domain
            </button>
            <button
              type="button"
              onClick={() => setViewMode('SmithChart')}
              role="tab" aria-selected={viewMode === 'SmithChart'} className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${viewMode === 'SmithChart' ? 'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-marker' : 'text-ink-3 hover:text-ink'}`}
            >
              Smith Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode('Time')}
              disabled={tdrData.length === 0}
              title={tdrData.length === 0 ? tdrWarning : undefined}
              role="tab" aria-selected={viewMode === 'Time'} className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${viewMode === 'Time' ? 'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-marker' : 'text-ink-3 hover:text-ink'}`}
            >
              Time Domain (TDR)
            </button>
          </div>

          {viewMode === 'Frequency' ? (
            <>
              <div className="flex flex-col gap-4 rounded-[4px] border border-line bg-bg-raised p-4">
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-1 lg:w-auto">
                  <select
                    value={analysisGroup}
                    onChange={handleGroupChange}
                    className="cursor-pointer bg-transparent px-2 text-sm font-semibold text-ink focus:outline-none" aria-label="Analysis group"
                  >
                    <option value="S">S-Parameters</option>
                    <option value="ZY">Z / Y Parameters</option>
                    <option value="Comp">Component Extraction</option>
                    <option value="Sys">System Metrics</option>
                  </select>
                  <div className="mx-1 h-6 w-px shrink-0 bg-line-strong"></div>
                  
                  {analysisGroup === 'S' && (
                    <button
                      type="button"
                      onClick={() => handleChartTypeChange('S')}
                      className="whitespace-nowrap rounded-md px-3.5 py-2 font-mono text-[12px] [font-stretch:87.5%] bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]"
                    >
                      S-Params
                    </button>
                  )}
                  {analysisGroup === 'ZY' && (['Z', 'Y'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleChartTypeChange(type)}
                      className={`whitespace-nowrap rounded-md px-3.5 py-2 font-mono text-[12px] transition-colors [font-stretch:87.5%] ${
                        chartType === type 
                          ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' 
                          : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      {type}-Params
                    </button>
                  ))}
                  {analysisGroup === 'Comp' && (['L', 'C', 'Q', 'ESR', 'Rp'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleChartTypeChange(type)}
                      className={`whitespace-nowrap rounded-md px-3.5 py-2 font-mono text-[12px] transition-colors [font-stretch:87.5%] ${
                        chartType === type 
                          ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' 
                          : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      {type === 'L' ? 'Inductance' : type === 'C' ? 'Capacitance' : type === 'Q' ? 'Q-Factor' : type}
                    </button>
                  ))}
                  {analysisGroup === 'Sys' && (['VSWR', 'GD', 'K'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleChartTypeChange(type)}
                      className={`whitespace-nowrap rounded-md px-3.5 py-2 font-mono text-[12px] transition-colors [font-stretch:87.5%] ${
                        chartType === type 
                          ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' 
                          : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      {type === 'GD' ? 'Group Delay' : type === 'K' ? 'K-Factor' : type}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto w-full lg:w-auto">
                  {chartType === 'S' && numPorts === 4 && (
                    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-surface p-1">
                      {(['Single', 'Mixed'] as const).map(mode => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => handleModeChange(mode)}
                          className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase transition-colors [font-stretch:87.5%] ${
                            sParamMode === mode 
                              ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' 
                              : 'text-ink-3 hover:text-ink'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                      {sParamMode === 'Mixed' && (
                        <select value={mixedModePairing} onChange={(event) => setMixedModePairing(event.target.value as MixedModePairing)} className="rounded bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink" aria-label="Mixed-mode physical port pairing">
                          <option value="12-34">Pairs 1–2 / 3–4</option>
                          <option value="13-24">Pairs 1–3 / 2–4</option>
                          <option value="14-23">Pairs 1–4 / 2–3</option>
                        </select>
                      )}
                    </div>
                  )}

                  {(chartType === 'S' || chartType === 'Z' || chartType === 'Y') && (
                    <div className="flex shrink-0 gap-1 rounded-lg border border-line bg-surface p-1">
                      {(['Magnitude', 'Phase', 'Real', 'Imag'] as const).map(view => (
                        <button
                          type="button"
                          key={view}
                          onClick={() => setSParamViewType(view)}
                          className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase transition-colors [font-stretch:87.5%] ${
                            sParamViewType === view 
                              ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' 
                              : 'text-ink-3 hover:text-ink'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-line bg-surface px-4 py-2.5">
                <span className="kicker mr-1 text-[10.5px]">Plot:</span>
                {availableKeys.map(key => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 font-mono text-[12px] text-ink-2 transition-colors hover:text-ink">
                    <input 
                      type="checkbox" 
                      checked={selectedKeys.includes(key)} 
                      onChange={() => toggleKey(key)}
                      className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                    />
                    {key}
                  </label>
                ))}
              </div>
              {analysisGroup === 'Comp' && (
                <p className="text-xs leading-relaxed text-ink-3">First-order extraction: L is shown only where Im(Zpp)&gt;0, C only where Im(Zpp)&lt;0, and Q=|Im(Zpp)/Re(Zpp)|. Zpp corresponds to the other ports open; ESR=Re(Zpp). Rp=1/Re(Ypp), where Ypp corresponds to the other ports short. These are frequency-dependent equivalents, not broadband lumped models.</p>
              )}
              {chartType === 'K' && stabilitySummary && (
                <p className="text-xs leading-relaxed text-ink-3">{stabilitySummary} K alone is insufficient; unconditional stability requires K&gt;1 and |Δ|&lt;1 at each frequency.</p>
              )}
            </div>
          </div>

          <div className="mt-2 h-[500px] w-full rounded-[4px] border border-line bg-bg-raised p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--line-strong)" />
                  <XAxis 
                    dataKey="fGHz" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickCount={10}
                    label={{ value: 'Frequency (GHz)', position: 'bottom', offset: 0, ...axisLabel }}
                    tick={axisTick}
                    tickFormatter={(val) => val.toFixed(2)}
                    stroke="var(--line-strong)"
                  />
                  <YAxis 
                    label={{ 
                      value: chartType === 'S' ? (sParamViewType === 'Magnitude' ? 'Magnitude (dB)' : sParamViewType === 'Phase' ? 'Phase (°)' : sParamViewType) :
                             (chartType === 'Z' || chartType === 'Y') ? (sParamViewType === 'Magnitude' ? `Magnitude (${chartType === 'Z' ? 'Ω' : 'S'})` : sParamViewType === 'Phase' ? 'Phase (°)' : sParamViewType) :
                             chartType === 'L' ? 'Inductance (nH)' : 
                             chartType === 'C' ? 'Capacitance (pF)' : 
                             chartType === 'GD' ? 'Group Delay (ps)' :
                             (chartType === 'ESR' || chartType === 'Rp') ? 'Resistance (Ω)' :
                             chartType === 'Q' ? 'Quality Factor' : 
                             chartType === 'VSWR' ? 'VSWR' : 'K-Factor', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: 0,
                      ...axisLabel
                    }}
                    tick={axisTick}
                    domain={['auto', 'auto']}
                    stroke="var(--line-strong)"
                  />
                  <Tooltip content={<SParameterTooltip chartType={chartType} sParamViewType={sParamViewType} />} />
                  <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-martian)' }} />
                  {selectedKeys.map((key, i) => (
                    <Line 
                      key={key} 
                      type="monotone" 
                      dataKey={(chartType === 'S' || chartType === 'Z' || chartType === 'Y')
                        ? chartType === 'S' && sParamMode === 'Mixed'
                          ? `${key}_${mixedModePairing}_${sParamViewType}`
                          : `${key}_${sParamViewType}`
                        : key}
                      name={key}
                      stroke={colors[i % colors.length]} 
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  ))}
                  <Brush 
                    dataKey="fGHz" 
                    height={30} 
                    stroke="var(--line-strong)" fill="var(--surface)" travellerWidth={8} 
                    tickFormatter={(val) => val.toFixed(2)} 
                    y={460}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </>
          ) : viewMode === 'SmithChart' ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-[4px] border border-line bg-bg-raised p-4">
                <h3 className="text-lg font-semibold [font-stretch:106%]">S-Parameter Smith Chart</h3>
                <p className="mt-1 text-sm text-ink-2">
                  Continuous frequency trajectories of complex reflection coefficients on the Smith Chart.
                </p>
              </div>
              <div className="flex w-full items-center justify-center rounded-[4px] border border-line bg-bg-raised p-6">
                 <SmithChart 
                   gammaTrajectories={[
                     {
                       points: s11SmithPoints,
                       color: 'var(--series-1)',
                       name: 'S11'
                     },
                     ...(numPorts >= 2 ? [{
                       points: s22SmithPoints,
                       color: 'var(--series-2)',
                       name: 'S22'
                     }] : [])
                   ]}
                 />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-[4px] border border-line bg-bg-raised p-4">
                <h3 className="text-lg font-semibold [font-stretch:106%]">Time-Domain Reflectometry (TDR)</h3>
                <p className="mt-1 text-sm text-ink-2">
                  Impedance profile calculated via Inverse Fast Fourier Transform (IFFT) of S11 data.
                </p>
              </div>
              <div className="mt-2 h-[500px] w-full rounded-[4px] border border-line bg-bg-raised p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tdrData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--line-strong)" />
                    <XAxis 
                      dataKey="timeNs" 
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickCount={10}
                      label={{ value: 'Time (ns)', position: 'bottom', offset: 0, ...axisLabel }}
                      tick={axisTick}
                      tickFormatter={(val) => val.toFixed(3)}
                      stroke="var(--line-strong)"
                    />
                    <YAxis 
                      label={{ value: 'Impedance (Ω)', angle: -90, position: 'insideLeft', ...axisLabel }}
                      tick={axisTick}
                      domain={['auto', 'auto']}
                      stroke="var(--line-strong)"
                    />
                    <Tooltip 
                      formatter={(val, name) => [
                        typeof val === 'number' ? val.toFixed(2) : val,
                        name === 'impedance' ? 'Z(t) [Ω]' : name,
                      ]}
                      labelFormatter={(label) => typeof label === 'number' ? `${label.toFixed(3)} ns` : label}
                    />
                    <Legend verticalAlign="top" height={40} />
                    <Line 
                      type="stepAfter" 
                      dataKey="impedance" 
                      name="impedance"
                      stroke="var(--series-1)" 
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Brush 
                      dataKey="timeNs" 
                      height={30} 
                      stroke="var(--line-strong)" fill="var(--surface)" travellerWidth={8} 
                      tickFormatter={(val) => val.toFixed(3)} 
                      y={460}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

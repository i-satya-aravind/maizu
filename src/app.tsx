import { useState, useCallback } from "react";

const SR=250,DUR=10,POS=["cun","guan","chi"],WR=["left","right"];
const CC={Strength:"#ef4444",Depth:"#3b82f6",Width:"#8b5cf6",Speed:"#f59e0b",Rhythm:"#10b981",Shape:"#ec4899"};
const HC={left_cun:"#ef4444",left_guan:"#f97316",left_chi:"#eab308",right_cun:"#3b82f6",right_guan:"#8b5cf6",right_chi:"#06b6d4"};
const ORGAN={left_cun:"Heart",left_guan:"Liver",left_chi:"Kidney Yin",right_cun:"Lung",right_guan:"Spleen/Stomach",right_chi:"Kidney Yang/Mingmen"};

const Q={
Strength:{empty:{k:"Empty",c:"Deficiency Type",r:"xu mai",d:"Big but soft & weak. Qi & Blood deficiency"},soggy:{k:"Soggy",c:"Soft",r:"ru mai",d:"Thin+empty+floating. Deficient Blood/Jing"},scattered:{k:"Scattered",c:"N/A",r:"san mai",d:"Floating big weak. Yang exhausted"},full:{k:"Full",c:"Excess Type",r:"shi mai",d:"Big strong pounding all levels. Excess"}},
Depth:{floating:{k:"Floating",c:"Superficial",r:"fu mai",d:"Buoyant light palpation, fades with pressure"},hollow:{k:"Hollow",c:"N/A",r:"kong mai",d:"Solid outside empty within. Blood loss"},leather:{k:"Leather",c:"N/A",r:"ge mai",d:"Wiry+floating+empty. Drum skin"},deep:{k:"Deep/Sinking",c:"Deep",r:"chen mai",d:"Only heavier palpation. Yin organ conditions"},frail:{k:"Frail",c:"Weak",r:"ruo mai",d:"Soft weak thin. Deep only. Extremely deficient"},hidden:{k:"Hidden",c:"N/A",r:"fu mai (hidden)",d:"Below bone. Max pressure"},confined:{k:"Confined",c:"N/A",r:"lao mai",d:"Very deep wiry strong. Cold obstruction"}},
Width:{thin:{k:"Thin/Fine",c:"Thready",r:"xi mai",d:"Fine thread. Blood/Qi deficiency"},minute:{k:"Minute",c:"N/A",r:"wei mai",d:"Barely perceptible. Severe deficiency"},flooding:{k:"Flooding",c:"Surging",r:"hong mai",d:"Surges all depths recedes. Heat"},big:{k:"Big/Wide",c:"N/A",r:"da mai",d:"Distinct broad. Heat Stomach/Intestines"},long:{k:"Long",c:"N/A",r:"chang mai",d:"Beyond positions"},short:{k:"Short",c:"N/A",r:"duan mai",d:"1 position. Qi deficiency"}},
Speed:{rapid:{k:"Rapid",c:"Rapid",r:"shu mai",d:">90bpm. Heat"},spinning:{k:"Spinning Bean",c:"N/A",r:"dong mai",d:"Short+Tight+Slippery+Rapid. Shock"},slow:{k:"Slow",c:"Slow",r:"chi mai",d:"<60bpm. Cold"}},
Rhythm:{knotted:{k:"Knotted",c:"Knotted",r:"jie mai",d:"Slow misses beats irregularly"},hurried:{k:"Hurried",c:"Abrupt",r:"cue mai",d:"Fast misses beats irregularly"},intermittent:{k:"Intermittent",c:"Regularly Intermittent",r:"dai mai",d:"Regular between pauses"},moderate:{k:"Moderate",c:"N/A",r:"huan mai",d:"Balanced normal"}},
Shape:{slippery:{k:"Slippery",c:"Rolling",r:"hua mai",d:"Fluid smooth oily. Damp/phlegm"},choppy:{k:"Choppy",c:"Hesitant",r:"se mai",d:"Uneven rough jagged. Blood stasis"},wiry:{k:"Wiry",c:"String-taut",r:"xuan mai",d:"Taut guitar string. LR/GB stagnation"},tight:{k:"Tight",c:"Tense",r:"jin mai",d:"Bounces taut rope. Cold/pain"}}
};

function fQ(d){for(const[c,qs]of Object.entries(Q)){if(qs[d])return{q:qs[d],c}}return null}

const WP={
normal:{rate:72,amp:1.0,w:0.35,dic:0.30,irr:0,sh:1.0},
empty:{rate:66,amp:0.5,w:0.40,dic:0.15,irr:0.05,sh:0.7},
soggy:{rate:68,amp:0.3,w:0.22,dic:0.10,irr:0.03,sh:0.5},
full:{rate:78,amp:1.4,w:0.38,dic:0.35,irr:0,sh:1.3},
floating:{rate:74,amp:0.75,w:0.30,dic:0.20,irr:0,sh:0.9},
deep:{rate:70,amp:0.4,w:0.30,dic:0.15,irr:0,sh:0.8},
frail:{rate:64,amp:0.3,w:0.20,dic:0.10,irr:0.06,sh:0.5},
thin:{rate:68,amp:0.45,w:0.15,dic:0.18,irr:0,sh:0.9},
minute:{rate:62,amp:0.2,w:0.12,dic:0.06,irr:0.10,sh:0.4},
big:{rate:76,amp:1.2,w:0.42,dic:0.30,irr:0,sh:1.1},
long:{rate:72,amp:1.0,w:0.40,dic:0.28,irr:0,sh:1.0},
rapid:{rate:98,amp:1.0,w:0.28,dic:0.25,irr:0,sh:1.1},
slow:{rate:55,amp:0.9,w:0.40,dic:0.35,irr:0,sh:0.8},
moderate:{rate:70,amp:0.95,w:0.36,dic:0.28,irr:0,sh:0.9},
slippery:{rate:80,amp:1.1,w:0.40,dic:0.45,irr:0,sh:0.85},
choppy:{rate:65,amp:0.6,w:0.25,dic:0.10,irr:0.15,sh:1.2},
wiry:{rate:78,amp:1.15,w:0.20,dic:0.10,irr:0,sh:1.6},
};

const HB=(o)=>({strength:"Full (shi mai) — resilient, palpable all levels. "+o+" force maintained.",depth:"Floating (fu mai) superficial gentle. Deep/Sinking (chen mai) deep clear. All levels present.",width:"Long (chang mai) — perceptible across all 3 positions, fills evenly",speed:"4 beats/respiration, ~72bpm.",rhythm:"Moderate (huan mai) — balanced, regular, no missed beats",shape:"Slippery (hua mai) — slightly fluid, smooth, rounded."});

const D={
healthy:{name:"Healthy (Resting Baseline)",summary:"Reference waveform. Stomach Qi, Spirit, Root all present. 4 beats/respiration.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver",dom:"normal",...HB("Liver")},chi:{organ:"Kidney Yin",dom:"normal",strength:"Full (shi mai) — Root clarity confirmed.",depth:"Deep/Sinking (chen mai) — clear at deep. Root present.",width:"Long (chang mai) — fills fully",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach",dom:"moderate",strength:"Full (shi mai) — healthy digestive tone.",depth:"All levels equally",width:"Long (chang mai) — fills evenly",speed:"4 beats/respiration, ~70bpm",rhythm:"Moderate (huan mai) — balanced",shape:"Slippery (hua mai) — smooth, fluid. Active digestion."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",strength:"Full (shi mai) — Root confirmed.",depth:"Deep/Sinking (chen mai) — clarity at deep.",width:"Long (chang mai)",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
validation:"All 6 waveforms similar. Full, Moderate, Slippery. All scores 10.0."},
liver_qi_stagnation:{name:"Liver Qi Stagnation",summary:"Wiry (xuan mai) at both Guan. Thin (xi mai) at Left Chi. Liver overacting on Spleen.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver ★★",dom:"wiry",strength:"Full (shi mai) — excess Qi constraint",depth:"EVENLY all 3 levels — key Wiry characteristic",width:"Thin/Fine (xi mai) — narrowed by tension",speed:"Rapid (shu mai) — ~78bpm",rhythm:"Moderate (huan mai) — regular with tension",shape:"Wiry (xuan mai) — taut, hard, guitar string. No fluidity."},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai) — soft, lacks fullness.",depth:"Deep/Sinking (chen mai) — tends deeper",width:"Thin/Fine (xi mai) — Liver drawing Kidney Yin.",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth, fine."}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach ★",dom:"wiry",strength:"Full (shi mai) — Liver overacting",depth:"Evenly all 3 levels",width:"Thin/Fine (xi mai) — narrowed",speed:"Rapid (shu mai) — ~78bpm",rhythm:"Moderate (huan mai) — with tension",shape:"Wiry (xuan mai) — Liver on Spleen (Wood on Earth)."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",...HB("Kidney Yang")}},
validation:"Both Guan Wiry: SHARP NARROW. Left Chi Thin: reduced amplitude."},
spleen_qi_deficiency:{name:"Spleen Qi Deficiency",summary:"Frail (ruo mai) at Right Guan. Thin (xi mai) downstream. Deep at Right Chi.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver",dom:"thin",strength:"Empty (xu mai) — systemic depletion",depth:"Deep/Sinking (chen mai) — tending deep",width:"Thin/Fine (xi mai) — depleted",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — smooth"},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai) — Blood not replenished",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — smooth"}},
right:{cun:{organ:"Lung",dom:"thin",strength:"Empty (xu mai) — Lung depends on Spleen",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai)"},guan:{organ:"Spleen/Stomach ★★",dom:"frail",strength:"Empty (xu mai) — profoundly soft.",depth:"Frail (ruo mai) — only deep level.",width:"Minute (wei mai) — barely perceptible",speed:"Slow (chi mai) — ~64bpm",rhythm:"Moderate (huan mai) — inconsistent",shape:"Slippery (hua mai) — extremely attenuated"},chi:{organ:"Kidney Yang/Mingmen ★",dom:"deep",strength:"Empty (xu mai)",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"}},
validation:"Right Guan WEAKEST. Left Cun most resilient. All amplitudes low."},
blood_stasis:{name:"Blood Stasis",summary:"Choppy (se mai) at both Guan. Wiry (xuan mai) at both Cun. Thin at Left Chi.",
left:{cun:{organ:"Heart",dom:"wiry",strength:"Full (shi mai) — Qi pushing",depth:"Evenly all levels",width:"Thin/Fine (xi mai) — narrowed",speed:"~78bpm",rhythm:"Moderate (huan mai) — with tension",shape:"Wiry (xuan mai) — taut. Qi stagnation."},guan:{organ:"Liver ★★",dom:"choppy",strength:"Empty (xu mai) — fluctuating",depth:"Deep/Sinking (chen mai) — sluggish",width:"Long (chang mai) — unevenly",speed:"Slow (chi mai) — ~65bpm",rhythm:"Moderate (huan mai) — irregular timing AND strength",shape:"Choppy (se mai) — uneven, rough, jagged. THE hallmark."},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai)",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — smoother than Guan",shape:"Slippery (hua mai) — smooth. Contrast with Guan."}},
right:{cun:{organ:"Lung",dom:"wiry",strength:"Full (shi mai)",depth:"All levels",width:"Thin/Fine (xi mai)",speed:"~78bpm",rhythm:"Moderate (huan mai)",shape:"Wiry (xuan mai) — chest stagnation."},guan:{organ:"Spleen/Stomach ★",dom:"choppy",strength:"Empty (xu mai) — variable",depth:"Deep/Sinking (chen mai)",width:"Long (chang mai)",speed:"Slow (chi mai) — ~65bpm",rhythm:"Moderate (huan mai) — irregular",shape:"Choppy (se mai) — rough, hesitant."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",...HB("Kidney Yang")}},
validation:"Guan VISIBLY UNEVEN. Compare jagged Guan vs regular Wiry Cun."},
phlegm_dampness:{name:"Phlegm-Dampness",summary:"Slippery (hua mai) at L-Cun, L-Guan, R-Cun. Soggy (ru mai) at R-Guan. Deep at R-Chi.",
left:{cun:{organ:"Heart/Chest",dom:"slippery",strength:"Full (shi mai) — fluid fullness",depth:"Middle level",width:"Big/Wide (da mai) — expanded by fluid",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — fluid, smooth, oily, rolling. Phlegm."},guan:{organ:"Liver",dom:"slippery",strength:"Full (shi mai)",depth:"Middle level",width:"Big/Wide (da mai)",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — dampness obstructing."},chi:{organ:"Kidney Yin",dom:"normal",...HB("Kidney Yin")}},
right:{cun:{organ:"Lung ★",dom:"slippery",strength:"Full (shi mai) — Phlegm fullness",depth:"Middle level",width:"Big/Wide (da mai) — congested",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — pronounced rolling. Phlegm in Lung."},guan:{organ:"Spleen/Stomach ★★",dom:"soggy",strength:"Soggy (ru mai) — extremely soft. Vanishes with pressure.",depth:"Floating (fu mai) — ONLY superficial. Disappears.",width:"Thin/Fine (xi mai) — Spleen overwhelmed.",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — barely perceptible",shape:"Slippery (hua mai) — attenuated"},chi:{organ:"Kidney Yang/Mingmen ★",dom:"deep",strength:"Empty (xu mai) — Yang deficiency",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — deep"}},
validation:"Slippery: ROUNDED PROMINENT DICROTIC NOTCH. Right Guan Soggy vanishes under pressure."},
kidney_yang_deficiency:{name:"Kidney Yang Deficiency",summary:"Frail (ruo mai) at Left Chi. Deep at Right Chi. Mingmen failing. Everything Deep and Empty.",
left:{cun:{organ:"Heart",dom:"thin",strength:"Empty (xu mai) — Heart Yang depends on Kidney.",depth:"Deep/Sinking (chen mai) — sinking",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — fine"},guan:{organ:"Liver",dom:"deep",strength:"Empty (xu mai) — unsupported",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"},chi:{organ:"Kidney Yin ★★",dom:"frail",strength:"Empty (xu mai) — extremely soft.",depth:"Frail (ruo mai) — only deep. Absent above.",width:"Minute (wei mai) — barely perceptible",speed:"Slow (chi mai) — ~64bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft thread at depth"}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach",dom:"thin",strength:"Empty (xu mai) — Mingmen not warming",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"},chi:{organ:"Kidney Yang/Mingmen ★★",dom:"deep",strength:"Empty (xu mai) — primary Yang depleted.",depth:"Deep/Sinking (chen mai) — only heavier pressure.",width:"Thin/Fine (xi mai) — thin weak",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — no force."}},
validation:"Both Chi lowest. Everything Deep/Empty. Right Cun most resilient."},
};

// Position-specific healthy baseline parameters
// Each organ position has its own natural characteristics even when healthy
const POS_PARAMS = {
  left_cun:   {rate:72, amp:1.05, w:0.34, dic:0.32, irr:0, sh:1.05}, // Heart: slightly stronger peak, prominent dicrotic
  left_guan:  {rate:72, amp:0.95, w:0.36, dic:0.28, irr:0, sh:0.95}, // Liver: slightly softer, wider
  left_chi:   {rate:72, amp:0.80, w:0.33, dic:0.25, irr:0, sh:0.85}, // Kidney Yin: naturally deeper/softer, less amplitude
  right_cun:  {rate:72, amp:1.00, w:0.35, dic:0.30, irr:0, sh:1.00}, // Lung: moderate, smooth
  right_guan: {rate:70, amp:0.98, w:0.38, dic:0.35, irr:0, sh:0.88}, // Spleen: slightly wider, more dicrotic (slippery quality), slightly slower
  right_chi:  {rate:72, amp:0.82, w:0.32, dic:0.24, irr:0, sh:0.88}, // Kidney Yang: naturally deeper/softer like Left Chi
};

// Generate waveform with position-specific modulation
function genWave(pk, posKey){
  const base = WP[pk] || WP.normal;
  const posMod = posKey ? POS_PARAMS[posKey] : null;

  // If this is a "normal" pulse, use position-specific params instead of generic
  // If disease pulse, blend disease params with subtle position characteristics
  let p;
  if(pk === "normal" && posMod) {
    p = posMod;
  } else if(pk === "moderate" && posMod) {
    p = {...posMod, rate: posMod.rate - 2, dic: posMod.dic + 0.05}; // moderate is slightly different
  } else if(posMod) {
    // Disease pulse: use disease params but add subtle position variation
    p = {
      rate: base.rate + (posMod.rate - 72) * 0.3, // subtle rate shift from position
      amp: base.amp * (posMod.amp / 1.0), // scale amplitude by position's natural level
      w: base.w + (posMod.w - 0.35) * 0.2, // subtle width shift
      dic: base.dic + (posMod.dic - 0.30) * 0.2, // subtle dicrotic shift
      irr: base.irr,
      sh: base.sh * (posMod.sh / 1.0), // scale sharpness
    };
  } else {
    p = base;
  }

  const n=SR*DUR, d=[];
  const bp=60/p.rate; let bc=0;
  // Use position-specific random seed for consistent but different noise per channel
  const seedOffset = posKey ? (posKey.charCodeAt(0) * 137 + posKey.charCodeAt(posKey.length-1) * 71) : 0;

  for(let i=0;i<n;i++){
    const t=i/SR; let lp=bp;
    if(p.irr>0.1){if(Math.sin(bc*2.7+0.5)>(1-p.irr*2))lp=bp*(1.8+p.irr)}
    else if(p.irr>0)lp+=(Math.sin(t*0.6)*p.irr*0.3)*bp;
    const ph=(t%lp)/lp; if(ph<0.01&&i>0)bc++;
    const rw=(p.w*0.28)/p.sh;
    const sys=p.amp*Math.exp(-Math.pow((ph-0.14)/rw,2));
    const dic=p.dic*p.amp*Math.exp(-Math.pow((ph-0.43)/0.10,2));
    const dia=0.10*p.amp*Math.exp(-Math.pow((ph-0.65)/0.13,2));
    let sm=0;
    if(pk==="slippery")sm=0.08*p.amp*Math.exp(-Math.pow((ph-0.28)/0.15,2));
    if(pk==="choppy")sm=(Math.sin(i*0.3+seedOffset)*0.5-0.25)*0.08*p.amp*(ph<0.5?1:0.3); // deterministic jaggedness
    // Position-specific subtle waveform variation (makes each channel visually distinct)
    const posVar = Math.sin(t * 1.2 + seedOffset * 0.01) * 0.015 * p.amp;
    const noise = (Math.sin(i * 7.3 + seedOffset) * 0.5) * 0.02 * p.amp; // semi-deterministic noise
    d.push(Math.round(Math.max(0,sys+dic+dia+sm+posVar+noise+0.08)*10000)/10000);
  }
  return d;
}

function exF(wf,pk){const p=WP[pk]||WP.normal;let mx=0,mn=Infinity,sm=0;for(let i=0;i<wf.length;i++){if(wf[i]>mx)mx=wf[i];if(wf[i]<mn)mn=wf[i];sm+=wf[i];}const me=sm/wf.length,th=me+(mx-me)*0.5;let lp=-SR;const ins=[];for(let i=1;i<wf.length-1;i++){if(wf[i]>th&&wf[i]>wf[i-1]&&wf[i]>wf[i+1]&&i-lp>SR*0.3){if(lp>0)ins.push((i-lp)/SR);lp=i;}}const avg=ins.length>0?ins.reduce((a,b)=>a+b,0)/ins.length:60/p.rate;const hrv=ins.length>1?Math.sqrt(ins.map(x=>Math.pow(x-avg,2)).reduce((a,b)=>a+b,0)/ins.length)*1000:0;return{heart_rate_bpm:Math.round(60/avg),peak_amplitude:Math.round(mx*1000)/1000,mean_amplitude:Math.round(me*1000)/1000,amplitude_range:Math.round((mx-mn)*1000)/1000,pulse_width_ratio:p.w,dicrotic_notch:p.dic,rise_sharpness:p.sh,hrv_ms:Math.round(hrv*10)/10,missed_beats:ins.filter(x=>x>avg*1.4).length,irregularity:Math.round(p.irr*100)/100,beat_count:ins.length+1}}

// Healthy reference — generated ONCE, position-specific
const HREF={};(function(){const hd=D.healthy;for(const w of WR)for(const p of POS){const k=`${w}_${p}`;const wf=genWave(hd[w][p].dom,k);HREF[k]={waveform:wf,features:exF(wf,hd[w][p].dom)};}})();

// ═══════════════════════════════════════════════════
// UNIVERSAL LLM PROMPT — disease-agnostic, handles ALL cases
// Input: raw waveform features + healthy baseline
// Output: organ scores + disease diagnosis + recommendations
// ═══════════════════════════════════════════════════
function buildUniversalPrompt(){
  // PURE TEMPLATE — no session-specific values embedded
  // All data comes via {{INPUT_JSON}} placeholder
  return `You are MAiZU's TCM Pulse Diagnosis AI. You receive pulse waveform data as a JSON input and produce a complete diagnostic analysis.

<system_instructions>
You will receive THREE inputs:
1. {{PULSE_QUALITIES}} — The 28 classical TCM pulse qualities with descriptions (provided as reference)
2. {{REFERENCE_DATA}} — Healthy baseline waveform features + Disease pattern signatures (provided as reference)  
3. {{PATIENT_DATA}} — The actual patient session: context, raw waveform samples, extracted features (provided per session)

Your job:
- Compare patient data against healthy baseline → produce organ scores (0-10)
- Compare patient's 6-position pattern against disease signatures → identify best matching disease
- Detect if multiple diseases coexist (compound patterns)
- Provide per-position pulse quality classification using the 28 qualities
- Explain reasoning using TCM theory
- Provide recommendations
</system_instructions>

<input_schema>

{{PULSE_QUALITIES}}
Format: JSON object with 6 categories (Strength, Depth, Width, Speed, Rhythm, Shape), each containing pulse qualities with kaptchuk name, CAM name, romanized Chinese, and clinical description.

{{REFERENCE_DATA}}
Format: JSON object containing:
  healthy_baseline: {
    <position>: { heart_rate_bpm, peak_amplitude, mean_amplitude, amplitude_range, pulse_width_ratio, dicrotic_notch, rise_sharpness, hrv_ms, missed_beats, irregularity, beat_count }
    ... for all 6 positions (left_cun, left_guan, left_chi, right_cun, right_guan, right_chi)
  }
  disease_patterns: {
    <disease_key>: {
      name: string,
      description: string,
      expected_qualities: {
        <position>: { dominant_quality, six_categories: {strength, depth, width, speed, rhythm, shape} }
      }
    }
  }

{{PATIENT_DATA}}
Format: JSON object containing:
  session_id: string
  timestamp: ISO string
  context: { state, position, rest_duration_min, age_group }
  channels: {
    <position>: {
      organ: string,
      waveform_sample: [75 float values — 3 seconds downsampled to 10Hz],
      features: { heart_rate_bpm, peak_amplitude, mean_amplitude, amplitude_range, pulse_width_ratio, dicrotic_notch, rise_sharpness, hrv_ms, missed_beats, irregularity, beat_count }
    }
  }

</input_schema>

<organ_mapping>
  Left Wrist:  Cun = Heart | Guan = Liver | Chi = Kidney Yin
  Right Wrist: Cun = Lung  | Guan = Spleen/Stomach | Chi = Kidney Yang/Mingmen
</organ_mapping>

<scoring_rules>
ORGAN HEALTH SCORING (per position, compare patient features vs healthy baseline):
  10.0 = features match healthy baseline exactly
  8.0-9.9 = minor deviations, likely healthy variation  
  5.0-7.9 = notable deviation, warrants attention
  0-4.9 = significant deviation, likely pathological
  
  Features to compare: heart_rate_bpm, peak_amplitude, mean_amplitude, pulse_width_ratio, dicrotic_notch, rise_sharpness, hrv_ms
  Score = 10 - (average_percentage_deviation × scaling_factor)
  
DISEASE MATCHING:
  Compare the patient's 6-position quality profile as a SET against each disease pattern signature
  The best matching disease = primary diagnosis
  If 2+ diseases match significantly → compound pattern, explain the interaction
  If all organ scores >= 9.0 → is_healthy = true, pattern = "Healthy"

COMPOUND PATTERN RULES:
  Liver Qi Stagnation + Spleen Qi Deficiency = Liver-Spleen Disharmony (Wood overacting Earth)
  Blood Stasis + Qi Deficiency = Stasis from insufficient Qi to move Blood
  Phlegm-Dampness + Spleen Qi Deficiency = Spleen fails to transform fluids
  Kidney Yang Deficiency + Spleen Qi Deficiency = Mingmen Fire fails to warm Spleen
</scoring_rules>

<output_format>
Respond with ONLY the following JSON (no other text, no markdown, no backticks):

{
  "organ_scores": {
    "heart": <float 0-10>,
    "liver": <float 0-10>,
    "kidney_yin": <float 0-10>,
    "lung": <float 0-10>,
    "spleen": <float 0-10>,
    "kidney_yang": <float 0-10>
  },
  "diagnosis": {
    "primary": {
      "pattern": "<TCM pattern name>",
      "romanized": "<pinyin name>",
      "confidence_pct": <int 0-100>,
      "key_positions": ["<positions driving diagnosis>"],
      "key_qualities": ["<pulse qualities found, e.g. Wiry (xuan mai)>"]
    },
    "secondary": null | { same structure },
    "is_compound": <boolean>,
    "compound_name": "<string or null>",
    "is_healthy": <boolean>
  },
  "per_position_analysis": {
    "<position>": {
      "dominant_quality": "<name>",
      "romanized": "<>",
      "category": "<Strength|Depth|Width|Speed|Rhythm|Shape>",
      "six_categories": {
        "strength": "<quality (romanized)>",
        "depth": "<quality (romanized)>",
        "width": "<quality (romanized)>",
        "speed": "<quality (romanized)>",
        "rhythm": "<quality (romanized)>",
        "shape": "<quality (romanized)>"
      }
    }
  },
  "reasoning": "<TCM reasoning using Five Element, Yin-Yang, organ relationships>",
  "contradictions": "<conflicting signals or 'None'>",
  "recommendations": {
    "acupressure_points": ["<point (name)>"],
    "lifestyle": "<TCM advice>",
    "follow_up": "<timing>"
  }
}
</output_format>`;
}

function generateReading(dk){
  const dd=D[dk],ch={},fe={};
  for(const w of WR)for(const p of POS){
    const k=`${w}_${p}`,dom=dd[w][p].dom;
    if(dk==="healthy"){ch[k]={dominant:dom,waveform:HREF[k].waveform};fe[k]=HREF[k].features;}
    else{const wf=genWave(dom,k);ch[k]={dominant:dom,waveform:wf};fe[k]=exF(wf,dom);}}
  // CSV
  const csvH="timestamp_ms,"+Object.keys(ch).join(",");const csvR=[csvH];
  for(let i=0;i<SR*DUR;i++){const row=[Math.round(i/SR*1000)];for(const k of Object.keys(ch))row.push(ch[k].waveform[i]);csvR.push(row.join(","));}
  // Session JSON for LLM (includes raw waveform samples + features + baseline)
  const sessionJson={
    session_id:`maizu_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    timestamp:new Date().toISOString(),
    device:"maizu_wristband_v1_synthetic",
    context:{state:"resting",position:"seated",rest_duration_min:5,age_group:"10-35",baseline_used:"resting_adult_10_35"},
    sample_rate_hz:SR,duration_sec:DUR,total_samples:SR*DUR,units:"mmHg_normalized",
    channels:{},healthy_baseline:{}
  };
  for(const k of Object.keys(ch)){
    // Downsample waveform: first 3 seconds, every 25th sample = ~10Hz = 75 points
    const raw3s=ch[k].waveform.slice(0,SR*3);
    const downsampled=raw3s.filter((_,i)=>i%25===0).map(v=>Math.round(v*1000)/1000);
    sessionJson.channels[k]={position:k.split("_")[1],wrist:k.split("_")[0],organ:ORGAN[k],waveform_sample:downsampled,features:fe[k]};
    sessionJson.healthy_baseline[k]=HREF[k].features;
  }
  const prompt=buildUniversalPrompt();

  // Build the 3 input files that get injected into prompt placeholders
  // INPUT 1: Pulse Qualities (provided once as reference)
  const pulseQualities=Q;

  // INPUT 2: Reference Data (healthy baseline + disease patterns)
  const referenceData={
    healthy_baseline:{},
    disease_patterns:{}
  };
  for(const k of Object.keys(HREF)){referenceData.healthy_baseline[k]=HREF[k].features;}
  for(const[dk,dv]of Object.entries(D)){
    if(dk==="healthy")continue;
    const expQ={};
    for(const w of WR)for(const p of POS){const pk=`${w}_${p}`;expQ[pk]={dominant:dv[w][p].dom,strength:dv[w][p].strength,depth:dv[w][p].depth,width:dv[w][p].width,speed:dv[w][p].speed,rhythm:dv[w][p].rhythm,shape:dv[w][p].shape};}
    referenceData.disease_patterns[dk]={name:dv.name,summary:dv.summary,expected_qualities:expQ};
  }

  // INPUT 3: Patient Data (mock waveform session)
  const patientData={
    session_id:sessionJson.session_id,
    timestamp:sessionJson.timestamp,
    context:sessionJson.context,
    device:sessionJson.device,
    acquisition:{sample_rate_hz:SR,duration_sec:DUR,channels:6,units:"mmHg_normalized"},
    channels:sessionJson.channels
  };

  return{csv:csvR.join("\n"),sessionJson,ch,fe,prompt,pulseQualities,referenceData,patientData,dd};
}

function Ring({score,label}){const r=22,c=2*Math.PI*r,o=c-(score/10)*c,sc=score>=8?"#22c55e":score>=5?"#eab308":"#ef4444";return(<div className="text-center"><div className="text-xs text-gray-400 mb-1">{label}</div><svg width="56" height="56" style={{display:"block",margin:"0 auto"}}><circle cx="28" cy="28" r={r} fill="none" stroke="#1f2937" strokeWidth="4"/><circle cx="28" cy="28" r={r} fill="none" stroke={sc} strokeWidth="4" strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" transform="rotate(-90 28 28)"/><text x="28" y="32" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{score}</text></svg></div>);}

// Local organ score computation (visual only — LLM does the real scoring)
function localOrganScore(pf,hf){
  const ks=["heart_rate_bpm","peak_amplitude","mean_amplitude","pulse_width_ratio","dicrotic_notch","rise_sharpness","hrv_ms"];
  let td=0,ct=0;
  for(const k of ks){const h=hf[k]||1,d=pf[k]||1;td+=Math.abs(d-h)/Math.max(Math.abs(h),0.01);ct++;}
  return Math.round(Math.max(0,Math.min(10,10-(td/ct)*8))*10)/10;
}

// UI
function WC({data,color,label}){const w=290,h=58,sa=SR*3,sl=data.slice(0,sa);let mx=0,mn=Infinity;for(let i=0;i<sl.length;i++){if(sl[i]>mx)mx=sl[i];if(sl[i]<mn)mn=sl[i];}const rn=mx-mn||1;const pts=sl.filter((_,i)=>i%4===0).map((v,i)=>`${(i*4/sa)*w},${h-((v-mn)/rn)*(h-8)-4}`).join(" ");return(<svg width={w} height={h} className="bg-gray-900 rounded" style={{display:"block",maxWidth:"100%"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.2"/><text x="4" y="12" fill={color} fontSize="9" fontFamily="monospace">{label}</text></svg>);}
function CR({l,v,ct}){return(<div className="flex gap-2 text-xs" style={{padding:"2px 0"}}><span className="font-bold" style={{color:CC[ct],minWidth:95,flexShrink:0}}>{l}:</span><span className="text-gray-300">{v}</span></div>);}

export default function App(){
  const[dis,setDis]=useState("healthy");
  const[view,setView]=useState("v");
  const[res,setRes]=useState(null);
  const[exp,setExp]=useState(null);
  const[showRef,setShowRef]=useState(false);

  const gen=useCallback(()=>{try{const r=generateReading(dis);
    // Compute local organ scores for visual display
    const scores={};
    for(const w of WR)for(const p of POS){const k=`${w}_${p}`;
      scores[k]=dis==="healthy"?10.0:localOrganScore(r.fe[k],HREF[k].features);}
    r.organScores={heart:scores.left_cun,liver:scores.left_guan,kidney_yin:scores.left_chi,lung:scores.right_cun,spleen:scores.right_guan,kidney_yang:scores.right_chi};
    setRes(r);setView("v");setExp(null);}catch(e){console.error(e)}},[dis]);
  const dl=(c,n,t)=>{const b=new Blob([c],{type:t});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=n;a.click();URL.revokeObjectURL(u)};
  const dd=D[dis];

  return(<div className="min-h-screen bg-gray-950 text-gray-100 p-3" style={{fontFamily:"Inter,system-ui,sans-serif"}}><div className="max-w-6xl mx-auto">
    <h1 className="text-xl font-bold text-white mb-1">MAiZU — TCM Pulse Reference Generator</h1>
    <p className="text-xs text-gray-500 mb-3">Generate reference waveforms (healthy + 5 diseases) | Universal LLM prompt handles all analysis</p>

    <button onClick={()=>setShowRef(!showRef)} className="text-xs text-cyan-400 underline mb-2" style={{background:"none",border:"none",cursor:"pointer"}}>{showRef?"Hide":"Show"} 28 Pulse Qualities</button>
    {showRef&&<div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3 max-h-56 overflow-auto">
      {Object.entries(Q).map(([cat,qs])=><div key={cat} className="mb-2"><div className="text-xs font-bold mb-1" style={{color:CC[cat]}}>{cat}</div><div className="grid grid-cols-2 gap-1">{Object.entries(qs).map(([k,q])=><div key={k} className="text-xs bg-gray-800 rounded p-1"><strong className="text-white">{q.k}</strong> <span className="text-gray-400">({q.r})</span> <span className="text-gray-500">{q.d}</span></div>)}</div></div>)}
    </div>}

    <div className="bg-gray-900 rounded p-3 mb-3 border border-gray-800">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1" style={{minWidth:220}}><label className="block text-xs text-gray-400 mb-1">Generate Reference Waveform</label>
          <select value={dis} onChange={e=>{setDis(e.target.value);setRes(null);setExp(null)}} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">{Object.entries(D).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
        <button onClick={gen} className="bg-emerald-600 text-white px-5 py-2 rounded text-sm font-medium">Generate</button>
        {res&&<><button onClick={()=>dl(res.csv,`maizu_${dis}.csv`,"text/csv")} className="bg-blue-700 text-white px-3 py-2 rounded text-xs">CSV</button>
          <button onClick={()=>dl(JSON.stringify(res.patientData,null,2),`maizu_${dis}_patient.json`,"application/json")} className="bg-green-700 text-white px-3 py-2 rounded text-xs">Patient JSON</button>
          <button onClick={()=>dl(JSON.stringify(res.referenceData,null,2),`maizu_reference_data.json`,"application/json")} className="bg-blue-800 text-white px-3 py-2 rounded text-xs">Reference JSON</button>
          <button onClick={()=>{navigator.clipboard.writeText(res.prompt)}} className="bg-amber-700 text-white px-3 py-2 rounded text-xs">Copy Prompt</button></>}
      </div>
      {dd&&<p className="text-xs text-gray-400 mt-2 italic">{dd.summary}</p>}
    </div>

    {res&&<>
      {/* Organ Scores — visual only */}
      <div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3">
        <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Organ Health Scores <span className="font-normal text-gray-600">(vs healthy baseline, 10 = perfect match)</span></div>
        <div className="grid grid-cols-6 gap-2">
          <Ring score={res.organScores.heart} label="Heart"/>
          <Ring score={res.organScores.lung} label="Lung"/>
          <Ring score={res.organScores.liver} label="Liver"/>
          <Ring score={res.organScores.spleen} label="Spleen"/>
          <Ring score={res.organScores.kidney_yin} label="Kid Yin"/>
          <Ring score={res.organScores.kidney_yang} label="Kid Yang"/>
        </div>
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        {[["v","Waveforms & Qualities"],["csv","CSV (raw → S3)"],["json","Session JSON (→ Lambda)"],["prompt","Universal LLM Prompt (→ Bedrock)"]].map(([k,l])=>
          <button key={k} onClick={()=>setView(k)} className={`px-3 py-1.5 rounded-t text-xs font-medium ${view===k?"bg-gray-800 text-white":"bg-gray-900 text-gray-500"}`}>{l}</button>)}
      </div>

      <div className="bg-gray-900 rounded border border-gray-800 p-3">
        {view==="v"&&<div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {WR.map(w=><div key={w}>
              <div className="text-sm font-bold text-gray-300 uppercase mb-2 pb-1 border-b border-gray-700">{w} Wrist <span className="text-xs font-normal text-gray-500">{w==="left"?"(Heart · Liver · Kidney Yin)":"(Lung · Spleen · Kidney Yang)"}</span></div>
              {POS.map(pos=>{const k=`${w}_${pos}`,pd=res.dd[w][pos],f=res.fe[k],ik=pd.organ.includes("★"),io=exp===k;
                const fd=fQ(pd.dom),dq=fd?fd.q:null,dc=fd?fd.c:"Normal",dr=dq?dq.r:"ping mai";
                return(<div key={k} className={`mb-2 rounded border overflow-hidden ${ik?"border-amber-800":"border-gray-800"}`} style={{background:ik?"#1a1510":"#0f1117"}}>
                  <div className="cursor-pointer" style={{padding:"8px 10px"}} onClick={()=>setExp(io?null:k)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{color:HC[k]}}>{pos.toUpperCase()}</span>
                        <span className="text-xs text-gray-400">{pd.organ}</span>
                        {ik&&<span className="text-xs bg-amber-900 text-amber-300 px-1 rounded font-bold" style={{fontSize:8}}>KEY</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-white">{dq?dq.k:"Balanced"}</span>
                        <span className="text-xs text-gray-500">({dr})</span>
                        <span className="text-xs text-gray-600">{io?"▲":"▼"}</span>
                      </div>
                    </div>
                    <WC data={res.ch[k].waveform} color={HC[k]} label={`${f.heart_rate_bpm}bpm · peak ${f.peak_amplitude} · HRV ${f.hrv_ms}ms`}/>
                  </div>
                  {io&&<div className="px-2.5 pb-2.5 border-t border-gray-800">
                    {dq&&<div className="mt-2 mb-2 px-2.5 py-2 rounded text-xs" style={{background:CC[dc]+"12",borderLeft:`3px solid ${CC[dc]}`}}>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap"><span className="text-sm font-bold text-white">{dq.k}</span><span className="text-gray-400">({dr})</span><span className="text-gray-500">· CAM: {dq.c}</span><span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{background:CC[dc]+"30",color:CC[dc]}}>{dc}</span></div>
                      <div className="text-gray-300">{dq.d}</div></div>}
                    <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {Object.entries(f).map(([fk,fv])=><span key={fk} className="text-gray-400">{fk.replace(/_/g," ")}: <span className="text-white font-mono">{fv}</span></span>)}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mb-1 uppercase" style={{fontSize:9}}>6-Category Pulse Quality Breakdown</div>
                    <CR l="Strength (li)" v={pd.strength} ct="Strength"/><CR l="Depth (wei)" v={pd.depth} ct="Depth"/><CR l="Width (kuan)" v={pd.width} ct="Width"/>
                    <CR l="Speed (lv)" v={pd.speed} ct="Speed"/><CR l="Rhythm (jie lv)" v={pd.rhythm} ct="Rhythm"/><CR l="Shape (xing)" v={pd.shape} ct="Shape"/>
                  </div>}
                </div>);})}
            </div>)}
          </div>
          <div className="p-3 bg-gray-800 border border-amber-900 rounded"><div className="text-xs font-bold text-amber-400 uppercase mb-1">Doctor Verification</div><p className="text-xs text-gray-300 whitespace-pre-wrap">{res.dd.validation}</p></div>
        </div>}

        {view==="csv"&&<div>
          <div className="p-2 bg-gray-800 rounded mb-2">
            <div className="text-xs font-bold text-emerald-400">Layer 1 — Raw Waveform CSV → S3</div>
            <div className="text-xs text-gray-500">timestamp_ms (x-axis, milliseconds) + 6 amplitude channels (y-axis, mmHg normalized)</div>
            <div className="text-xs text-gray-500">{SR}Hz × {DUR}s = {SR*DUR} data points per channel. X implicit from sample rate (row 0 = 0ms, row 1 = 4ms, ...)</div>
          </div>
          <pre className="text-xs text-green-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:350}}>{res.csv.split("\n").slice(0,25).join("\n")}{"\n...("+(SR*DUR-24)+" more rows)"}</pre>
        </div>}

        {view==="json"&&<div>
          <div className="p-2 bg-gray-800 rounded mb-2">
            <div className="text-xs font-bold text-purple-400">Layer 2 — Session JSON (Lambda extracts features from CSV, produces this)</div>
            <div className="text-xs text-gray-500">Contains: context, per-channel features (12 metrics), downsampled raw waveform (75 points/channel), and healthy baseline for comparison.</div>
            <div className="text-xs text-gray-500 mt-1">This JSON + the Universal Prompt = what gets sent to Bedrock. The LLM does all scoring and diagnosis.</div>
          </div>
          <pre className="text-xs text-purple-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:500}}>{JSON.stringify(res.sessionJson,null,2)}</pre>
        </div>}

        {view==="prompt"&&<div>
          <div className="p-2 bg-gray-800 rounded mb-2">
            <div className="text-xs font-bold text-amber-400">Universal LLM Prompt Template → Bedrock</div>
            <div className="text-xs text-gray-500">Template with 3 placeholder variables. Data injected separately as JSON files.</div>
            <div className="text-xs text-emerald-400 mt-1">This prompt NEVER changes. Only the input data changes per session.</div>
          </div>

          {/* Input architecture */}
          <div className="p-3 bg-gray-800 border border-gray-700 rounded mb-3">
            <div className="text-xs font-bold text-white uppercase mb-2">How it works</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div className="flex items-start gap-2"><span className="text-amber-400 font-bold shrink-0">Prompt:</span><span>Universal template (shown below) — contains scoring rules, output format, organ mapping. Never changes.</span></div>
              <div className="flex items-start gap-2"><span className="text-purple-400 font-bold shrink-0">{'{{PULSE_QUALITIES}}'}:</span><span>28 pulse quality descriptions. You provide ONCE as reference. Same for all sessions.</span></div>
              <div className="flex items-start gap-2"><span className="text-blue-400 font-bold shrink-0">{'{{REFERENCE_DATA}}'}:</span><span>Healthy baseline features + 5 disease pattern signatures. You provide ONCE. Same for all sessions.</span></div>
              <div className="flex items-start gap-2"><span className="text-green-400 font-bold shrink-0">{'{{PATIENT_DATA}}'}:</span><span>Mock patient waveform — context + raw samples + extracted features. Changes per session.</span></div>
            </div>
          </div>

          {/* Sub-tabs for prompt vs inputs */}
          {(() => {
            const [promptTab, setPromptTab] = [res._pt || "template", (v) => { res._pt = v; setRes({...res}); }];
            return (<div>
              <div className="flex gap-1 mb-2">
                {[["template","Prompt Template"],["pq","Input 1: Pulse Qualities"],["ref","Input 2: Reference Data"],["patient","Input 3: Patient Data"]].map(([k,l])=>
                  <button key={k} onClick={()=>setPromptTab(k)} className={`px-2 py-1 rounded text-xs ${promptTab===k?"bg-gray-700 text-white":"bg-gray-800 text-gray-500"}`}>{l}</button>)}
              </div>

              {promptTab==="template"&&<div className="relative">
                <button onClick={()=>{navigator.clipboard.writeText(res.prompt)}} className="absolute top-2 right-2 bg-amber-800 text-amber-200 px-2 py-1 rounded text-xs z-10" style={{border:"none",cursor:"pointer"}}>Copy</button>
                <pre className="text-xs font-mono overflow-auto bg-black p-3 rounded whitespace-pre-wrap text-amber-200" style={{maxHeight:500,lineHeight:1.5}}>{res.prompt}</pre>
              </div>}

              {promptTab==="pq"&&<div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-purple-400 font-bold">{'{{PULSE_QUALITIES}}'} — Provided once as reference</div>
                  <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(res.pulseQualities,null,2))}} className="bg-purple-800 text-purple-200 px-2 py-1 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Copy JSON</button>
                </div>
                <pre className="text-xs text-purple-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:400}}>{JSON.stringify(res.pulseQualities,null,2)}</pre>
              </div>}

              {promptTab==="ref"&&<div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-blue-400 font-bold">{'{{REFERENCE_DATA}}'} — Healthy baseline + Disease signatures</div>
                  <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(res.referenceData,null,2))}} className="bg-blue-800 text-blue-200 px-2 py-1 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Copy JSON</button>
                </div>
                <pre className="text-xs text-blue-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:400}}>{JSON.stringify(res.referenceData,null,2)}</pre>
              </div>}

              {promptTab==="patient"&&<div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-green-400 font-bold">{'{{PATIENT_DATA}}'} — Mock patient session (changes per patient)</div>
                  <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(res.patientData,null,2))}} className="bg-green-800 text-green-200 px-2 py-1 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Copy JSON</button>
                </div>
                <pre className="text-xs text-green-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:400}}>{JSON.stringify(res.patientData,null,2)}</pre>
              </div>}
            </div>);
          })()}

          {/* Expected response */}
          <div className="p-3 bg-gray-800 border border-purple-900 rounded mt-3">
            <div className="text-xs font-bold text-purple-400 uppercase mb-2">Expected LLM Response</div>
            <pre className="text-xs text-purple-300 font-mono bg-black p-2 rounded overflow-auto" style={{maxHeight:250}}>{JSON.stringify({
  organ_scores:{heart:9.8,liver:5.2,kidney_yin:7.1,lung:9.6,spleen:6.8,kidney_yang:9.4},
  diagnosis:{primary:{pattern:"Liver Qi Stagnation",romanized:"Gan Qi Yu Jie",confidence_pct:87,key_positions:["left_guan","right_guan"],key_qualities:["Wiry (xuan mai)"]},secondary:{pattern:"Spleen Qi Deficiency",romanized:"Pi Qi Xu",confidence_pct:52,key_positions:["right_guan"],key_qualities:["Thin (xi mai)"]},is_compound:true,compound_name:"Liver-Spleen Disharmony",is_healthy:false},
  per_position_analysis:{left_guan:{dominant_quality:"Wiry",romanized:"xuan mai",category:"Shape",six_categories:{strength:"Full (shi mai)",depth:"Even all levels",width:"Thin (xi mai)",speed:"Rapid 78bpm (shu mai)",rhythm:"Moderate (huan mai)",shape:"Wiry (xuan mai)"}}},
  reasoning:"Wiry at both Guan = Liver Qi constraint. Wood overacting Earth explains Spleen involvement...",
  contradictions:"None",
  recommendations:{acupressure_points:["LIV-3 (Taichong)","SP-6 (Sanyinjiao)"],lifestyle:"Stress reduction, gentle exercise",follow_up:"2 weeks"}
},null,2)}</pre>
          </div>
        </div>}
      </div>

      <div className="mt-3 bg-gray-900 rounded border border-gray-800 p-3">
        <div className="text-xs font-bold text-gray-500 mb-1">Pipeline</div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[{l:"Wristband (6ch)",c:"bg-gray-700"},{l:"→"},{l:"CSV → S3",c:"bg-blue-900"},{l:"→"},{l:"Lambda (extract features only)",c:"bg-amber-900"},{l:"→"},{l:"Session JSON + Universal Prompt",c:"bg-purple-900"},{l:"→"},{l:"Bedrock LLM (scores + diagnosis + reasoning)",c:"bg-emerald-900"},{l:"→"},{l:"App UI",c:"bg-red-900"}].map((s,i)=>s.c?<span key={i} className={`${s.c} px-2 py-1 rounded`}>{s.l}</span>:<span key={i} className="text-gray-600">{s.l}</span>)}
        </div>
      </div>
    </>}

    {!res&&<div className="bg-gray-900 rounded border border-gray-800 p-8 text-center"><p className="text-gray-500">Select a pattern → <strong className="text-emerald-400">Generate</strong></p><p className="text-xs text-gray-600 mt-1">Generates reference waveforms. One universal prompt handles all analysis — no disease-specific logic.</p></div>}
  </div></div>);
}

import { useState, useCallback } from "react";

const SR=50,DUR=10,POS=["cun","guan","chi"],WR=["left","right"];
const CC={Strength:"#ef4444",Depth:"#3b82f6",Width:"#8b5cf6",Speed:"#f59e0b",Rhythm:"#10b981",Shape:"#ec4899"};
const HC={left_cun:"#ef4444",left_guan:"#f97316",left_chi:"#eab308",right_cun:"#3b82f6",right_guan:"#8b5cf6",right_chi:"#06b6d4"};
const ORGAN={left_cun:"Heart",left_guan:"Liver",left_chi:"Kidney Yin",right_cun:"Lung",right_guan:"Spleen/Stomach",right_chi:"Kidney Yang/Mingmen"};
const POS_TO_ORGAN={left_cun:"heart",left_guan:"liver",left_chi:"kidney_yin",right_cun:"lung",right_guan:"spleen",right_chi:"kidney_yang"};

const Q={
Strength:{empty:{k:"Empty",c:"Deficiency Type",r:"xu mai",d:"Big but soft & weak. Qi & Blood deficiency"},soggy:{k:"Soggy",c:"Soft",r:"ru mai",d:"Thin+empty+floating. Deficient Blood/Jing"},scattered:{k:"Scattered",c:"N/A",r:"san mai",d:"Floating big weak. Yang exhausted"},full:{k:"Full",c:"Excess Type",r:"shi mai",d:"Big strong pounding all levels. Excess"}},
Depth:{floating:{k:"Floating",c:"Superficial",r:"fu mai",d:"Buoyant light palpation, fades pressure"},hollow:{k:"Hollow",c:"N/A",r:"kong mai",d:"Solid outside empty within. Blood loss"},leather:{k:"Leather",c:"N/A",r:"ge mai",d:"Wiry+floating+empty. Drum skin"},deep:{k:"Deep/Sinking",c:"Deep",r:"chen mai",d:"Only heavier palpation. Yin organ conditions"},frail:{k:"Frail",c:"Weak",r:"ruo mai",d:"Soft weak thin. Deep only. Extremely deficient"},hidden:{k:"Hidden",c:"N/A",r:"fu mai (hidden)",d:"Below bone. Max pressure"},confined:{k:"Confined",c:"N/A",r:"lao mai",d:"Very deep wiry strong. Cold obstruction"}},
Width:{thin:{k:"Thin/Fine",c:"Thready",r:"xi mai",d:"Fine thread. Blood/Qi deficiency"},minute:{k:"Minute",c:"N/A",r:"wei mai",d:"Barely perceptible. Severe deficiency"},flooding:{k:"Flooding",c:"Surging",r:"hong mai",d:"Surges all depths recedes. Heat"},big:{k:"Big/Wide",c:"N/A",r:"da mai",d:"Distinct broad. Heat Stomach"},long:{k:"Long",c:"N/A",r:"chang mai",d:"Beyond positions"},short:{k:"Short",c:"N/A",r:"duan mai",d:"1 position. Qi deficiency"}},
Speed:{rapid:{k:"Rapid",c:"Rapid",r:"shu mai",d:">90bpm. Heat"},spinning:{k:"Spinning Bean",c:"N/A",r:"dong mai",d:"Short+Tight+Slippery+Rapid. Shock"},slow:{k:"Slow",c:"Slow",r:"chi mai",d:"<60bpm. Cold"}},
Rhythm:{knotted:{k:"Knotted",c:"Knotted",r:"jie mai",d:"Slow misses beats irregularly"},hurried:{k:"Hurried",c:"Abrupt",r:"cue mai",d:"Fast misses beats irregularly"},intermittent:{k:"Intermittent",c:"Regularly Intermittent",r:"dai mai",d:"Regular between pauses"},moderate:{k:"Moderate",c:"N/A",r:"huan mai",d:"Balanced normal"}},
Shape:{slippery:{k:"Slippery",c:"Rolling",r:"hua mai",d:"Fluid smooth oily. Damp/phlegm"},choppy:{k:"Choppy",c:"Hesitant",r:"se mai",d:"Uneven rough jagged. Blood stasis"},wiry:{k:"Wiry",c:"String-taut",r:"xuan mai",d:"Taut guitar string. LR/GB stagnation"},tight:{k:"Tight",c:"Tense",r:"jin mai",d:"Bounces taut rope. Cold/pain"}}
};
function fQ(d){for(const[c,qs]of Object.entries(Q)){if(qs[d])return{q:qs[d],c};}return null;}

const PULSE_QUALITIES={
Strength:{empty:{kaptchuk:"Empty",cam:"Deficiency Type",romanized:"xu mai",description:"Big but soft & weak. Feels empty on heavier palpation. Qi & Blood deficiency."},soggy:{kaptchuk:"Soggy",cam:"Soft",romanized:"ru mai",description:"Thin+empty+floating. Extremely soft, superficial only. Deficient Blood/Jing."},scattered:{kaptchuk:"Scattered",cam:"N/A",romanized:"san mai",description:"Floating, big weak. Yang exhausted. Critical."},full:{kaptchuk:"Full",cam:"Excess Type",romanized:"shi mai",description:"Big strong, pounding all levels. Sign of excess."}},
Depth:{floating:{kaptchuk:"Floating",cam:"Superficial",romanized:"fu mai",description:"Buoyant light palpation, fades pressure. Floating+tight/rapid=EPF. Floating+empty=Yin def."},hollow:{kaptchuk:"Hollow",cam:"N/A",romanized:"kong mai",description:"Solid outside, empty within. Green onion stem. Blood loss."},leather:{kaptchuk:"Leather",cam:"N/A",romanized:"ge mai",description:"Wiry+floating+empty. Drum skin. Deficient Blood/Jing."},deep:{kaptchuk:"Deep/Sinking",cam:"Deep",romanized:"chen mai",description:"Only heavier palpation. Yin organ conditions."},frail:{kaptchuk:"Frail",cam:"Weak",romanized:"ruo mai",description:"Soft weak thin. Deep only. Extremely deficient."},hidden:{kaptchuk:"Hidden",cam:"N/A",romanized:"fu mai (hidden)",description:"Below bone. Max pressure. Strong=Cold. Weak=Yang can't raise."},confined:{kaptchuk:"Confined/Prison",cam:"N/A",romanized:"lao mai",description:"Very deep wiry, long strong. Forceful Hidden. Cold obstruction."}},
Width:{thin:{kaptchuk:"Thin/Fine",cam:"Thready",romanized:"xi mai",description:"Fine thread. Blood/Qi deficiency."},minute:{kaptchuk:"Minute",cam:"N/A",romanized:"wei mai",description:"Barely perceptible. Severe deficiency. Critical."},flooding:{kaptchuk:"Flooding",cam:"Surging",romanized:"hong mai",description:"Surges all depths, recedes. Heat injured Fluids."},big:{kaptchuk:"Big/Wide",cam:"N/A",romanized:"da mai",description:"Distinct broad. Heat Stomach/Intestines."},long:{kaptchuk:"Long",cam:"N/A",romanized:"chang mai",description:"Beyond positions."},short:{kaptchuk:"Short",cam:"N/A",romanized:"duan mai",description:"1 position. Qi deficiency."}},
Speed:{rapid:{kaptchuk:"Rapid",cam:"Rapid",romanized:"shu mai",description:">90bpm. Heat."},spinning:{kaptchuk:"Spinning Bean",cam:"N/A",romanized:"dong mai",description:"Short+Tight+Slippery+Rapid. Shock, anxiety."},slow:{kaptchuk:"Slow",cam:"Slow",romanized:"chi mai",description:"<60bpm. Cold."}},
Rhythm:{knotted:{kaptchuk:"Knotted",cam:"Knotted",romanized:"jie mai",description:"Slow, misses beats irregularly. Cold obstructing."},hurried:{kaptchuk:"Hurried",cam:"Abrupt",romanized:"cue mai",description:"Fast, misses beats irregularly. Heat agitating."},intermittent:{kaptchuk:"Intermittent",cam:"Regularly Intermittent",romanized:"dai mai",description:"Regular between pauses. Serious HT disharmony."},moderate:{kaptchuk:"Moderate",cam:"N/A",romanized:"huan mai",description:"Balanced, healthy, normal."}},
Shape:{slippery:{kaptchuk:"Slippery",cam:"Rolling",romanized:"hua mai",description:"Fluid, smooth, oily. Damp/phlegm or pregnancy."},choppy:{kaptchuk:"Choppy",cam:"Hesitant",romanized:"se mai",description:"Uneven, rough, jagged. Blood/Jing def or stasis."},wiry:{kaptchuk:"Wiry",cam:"String-taut",romanized:"xuan mai",description:"Taut guitar string. LR/GB stagnation, pain."},tight:{kaptchuk:"Tight",cam:"Tense",romanized:"jin mai",description:"Bounces taut rope. More elastic than Wiry. Cold/pain."}}
};

const PP={
  left_cun:  {rate:74, amp:1.10, w:0.32, dic:0.34, irr:0, sh:1.10},
  left_guan: {rate:72, amp:0.92, w:0.38, dic:0.26, irr:0, sh:0.90},
  left_chi:  {rate:70, amp:0.72, w:0.30, dic:0.18, irr:0, sh:0.78},
  right_cun: {rate:73, amp:1.00, w:0.35, dic:0.30, irr:0, sh:1.00},
  right_guan:{rate:71, amp:0.96, w:0.40, dic:0.38, irr:0, sh:0.85},
  right_chi: {rate:70, amp:0.74, w:0.31, dic:0.20, irr:0, sh:0.80},
};

const WP={
  normal:{rate:72,amp:1.0,w:0.35,dic:0.30,irr:0,sh:1.0},
  empty:{rate:66,amp:0.5,w:0.40,dic:0.15,irr:0.05,sh:0.7},
  soggy:{rate:68,amp:0.30,w:0.22,dic:0.10,irr:0.03,sh:0.5},
  full:{rate:78,amp:1.4,w:0.38,dic:0.35,irr:0,sh:1.3},
  floating:{rate:74,amp:0.75,w:0.30,dic:0.20,irr:0,sh:0.9},
  deep:{rate:70,amp:0.40,w:0.30,dic:0.15,irr:0,sh:0.8},
  frail:{rate:64,amp:0.28,w:0.20,dic:0.10,irr:0.06,sh:0.5},
  thin:{rate:68,amp:0.45,w:0.15,dic:0.18,irr:0,sh:0.9},
  minute:{rate:62,amp:0.18,w:0.12,dic:0.06,irr:0.10,sh:0.4},
  big:{rate:76,amp:1.2,w:0.42,dic:0.30,irr:0,sh:1.1},
  long:{rate:72,amp:1.0,w:0.40,dic:0.28,irr:0,sh:1.0},
  rapid:{rate:98,amp:1.0,w:0.28,dic:0.25,irr:0,sh:1.1},
  slow:{rate:55,amp:0.9,w:0.40,dic:0.35,irr:0,sh:0.8},
  moderate:{rate:70,amp:0.95,w:0.36,dic:0.28,irr:0,sh:0.9},
  slippery:{rate:80,amp:1.1,w:0.40,dic:0.45,irr:0,sh:0.85},
  choppy:{rate:65,amp:0.60,w:0.25,dic:0.10,irr:0.15,sh:1.2},
  wiry:{rate:78,amp:1.15,w:0.20,dic:0.10,irr:0,sh:1.6},
};

const QFLOOR={normal:10,moderate:10,wiry:4.0,thin:5.5,deep:6.0,frail:2.5,empty:5.0,minute:1.5,soggy:3.0,slippery:6.0,choppy:4.0};
function calcScore(dom, sev){
  if(!sev || sev===0 || dom==="normal" || dom==="moderate") return 10.0;
  const floor = QFLOOR[dom] !== undefined ? QFLOOR[dom] : 5.0;
  return Math.round((10.0 - (10.0 - floor) * sev) * 10) / 10;
}

function blendParams(pk, posKey, sev){
  const pathBase=WP[pk]||WP.normal;
  const pm=PP[posKey]||PP.right_cun;
  const severity = (sev !== undefined && sev !== null) ? sev : 1.0;
  if(pk==="normal"||pk==="moderate"||severity===0){
    const r={...pm};
    if(pk==="moderate"){r.rate=pm.rate-1;r.dic=pm.dic+0.06;}
    return r;
  }
  const posAmpScale=pm.amp/1.0, posWidthShift=pm.w-0.35, posDicShift=pm.dic-0.30, posShScale=pm.sh/1.0;
  const fp={
    rate:pathBase.rate+(pm.rate-72)*0.5,
    amp:pathBase.amp*posAmpScale,
    w:pathBase.w+posWidthShift*0.5,
    dic:Math.max(0.02,pathBase.dic+posDicShift*0.4),
    irr:pathBase.irr,
    sh:pathBase.sh*posShScale,
  };
  const s=severity;
  return{rate:pm.rate+(fp.rate-pm.rate)*s,amp:pm.amp+(fp.amp-pm.amp)*s,w:pm.w+(fp.w-pm.w)*s,dic:pm.dic+(fp.dic-pm.dic)*s,irr:pm.irr+(fp.irr-pm.irr)*s,sh:pm.sh+(fp.sh-pm.sh)*s};
}

// ============================================================
// MASTER TCM CLINICAL VALIDATION
// ============================================================
// Every organ in every disease is assessed. No organ is "unaffected" at exactly 10.0
// in a diseased body. Even distant organs show subclinical shifts.
//
// SCORING TIERS:
//   ★★ PRIMARY (3.0-5.5): The main diagnostic finding. Clear pathology.
//   ★  SECONDARY (6.0-7.9): Meaningfully affected via Five Element / Yin-Yang.
//   ~  TERTIARY (8.0-9.0): Subtle but real. A master clinician would note it.
//   ·  SUBCLINICAL (9.1-9.6): Body-wide resonance. Detectable instrumentally.
//
// Five Element relationships used:
//   Wood (LR) → Earth (SP): overacting cycle
//   Earth (SP) → Metal (LU): generating cycle (mother→child)
//   Water (KI) → Wood (LR): generating cycle
//   Fire (HT) ↔ Water (KI): mutual root
//   Water (KI) → Fire (HT): Water controls Fire
//   Metal (LU) → Water (KI): generating cycle
// ============================================================

const HB=(o)=>({strength:"Full (shi mai) — resilient, palpable all levels. "+o+" force maintained.",depth:"Floating (fu mai) superficial gentle. Deep/Sinking (chen mai) deep clear. All levels.",width:"Long (chang mai) — perceptible across all 3 positions, fills evenly",speed:"4 beats/respiration, ~72bpm.",rhythm:"Moderate (huan mai) — balanced, regular, no missed beats",shape:"Slippery (hua mai) — slightly fluid, smooth, rounded."});

const D={
healthy:{name:"Healthy (Resting Baseline)",summary:"Reference waveform. Stomach Qi present, Spirit present, Root present. 4 beats per respiration cycle.",
left:{cun:{organ:"Heart",dom:"normal",sev:0,...HB("Heart")},guan:{organ:"Liver",dom:"normal",sev:0,...HB("Liver")},chi:{organ:"Kidney Yin",dom:"normal",sev:0,strength:"Full (shi mai) — Root clarity confirmed.",depth:"Deep/Sinking (chen mai) — clear at deep. Root present.",width:"Long (chang mai) — fills fully",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
right:{cun:{organ:"Lung",dom:"normal",sev:0,...HB("Lung")},guan:{organ:"Spleen/Stomach",dom:"moderate",sev:0,strength:"Full (shi mai) — healthy digestive tone.",depth:"All levels equally",width:"Long (chang mai) — fills evenly",speed:"4 beats/respiration, ~70bpm",rhythm:"Moderate (huan mai) — balanced",shape:"Slippery (hua mai) — smooth fluid. Active digestion."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",sev:0,strength:"Full (shi mai) — Root confirmed.",depth:"Deep/Sinking (chen mai) — clarity at deep.",width:"Long (chang mai)",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
validation:"All 6 positions distinct per organ but balanced. Full, Moderate, Slippery. All scores 10.0. Stomach Qi, Spirit, Root all present."},

// ============================================================
// LIVER QI STAGNATION (肝气郁结 Gān Qì Yù Jié)
// ============================================================
// Clinical: Stressed professional. Sighing, hypochondriac distension,
// irritability, possible PMS/IBS. Functional — walking, working, but suffering.
//
// Pathomechanism:
//   1. Liver Qi bound → vessels taut → WIRY (★★ primary)
//   2. Wood overacts Earth → Spleen constrained → WIRY (★ secondary)
//   3. Liver draws on Kidney Yin (mother) → L-Chi thins (~ tertiary)
//   4. Liver Qi rises to Heart → mild restlessness → slight Wiry (· subclinical)
//   5. Liver constrains Lung descending → mild chest tightness (· subclinical)
//   6. Kidney Yang unaffected by Qi stagnation → minimal (· subclinical)
//
// Key diagnostic: BOTH Guan positions Wiry, L-Guan > R-Guan
// ============================================================
liver_qi_stagnation:{name:"Liver Qi Stagnation (肝气郁结)",summary:"Wiry (xuan mai) both Guan, L>R gradient. Liver Qi bound, Wood overacting Earth. Subtle thinning L-Chi.",
left:{
cun:{organ:"Heart ·",dom:"wiry",sev:0.15,
  // HT: Liver Qi rises to disturb Heart Shen. Very mild wiry — restlessness, insomnia edge.
  // score = 10 - 6*0.15 = 9.1
  strength:"Full (shi mai) — near normal, slight tension.",depth:"All levels — minimal shift.",width:"Long (chang mai) — slightly narrowed.",speed:"~74bpm — trace elevation from Liver heat rising.",rhythm:"Moderate (huan mai) — stable.",shape:"Wiry (xuan mai) — very faint tautness. Subclinical."},
guan:{organ:"Liver ★★",dom:"wiry",sev:0.75,
  // LR: PRIMARY. Qi constrained → vessel taut like guitar string. Clear wiry.
  // score = 10 - 6*0.75 = 5.5. Functional patient, not critical.
  strength:"Full (shi mai) — Qi constraint creates apparent fullness.",depth:"EVENLY all 3 levels — hallmark Wiry characteristic. No depth preference.",width:"Thin/Fine (xi mai) — narrowed by lateral tension. Vessel compressed.",speed:"Rapid (shu mai) — ~78bpm. Constrained Qi generates heat.",rhythm:"Moderate (huan mai) — regular but with palpable tension.",shape:"Wiry (xuan mai) — taut, hard, guitar string. Rolls under finger without fluidity."},
chi:{organ:"Kidney Yin ~",dom:"thin",sev:0.35,
  // KI-Yin: Water nourishes Wood. When Liver stagnates, it draws more from mother.
  // Thin = Blood/Yin reducing. score = 10 - 4.5*0.35 = 8.4. Subtle but detectable.
  strength:"Empty (xu mai) — slightly soft. Yin being drawn.",depth:"Deep/Sinking (chen mai) — tends deeper. Yin nature.",width:"Thin/Fine (xi mai) — mildly reduced. Liver drawing Kidney water.",speed:"~70bpm — near normal.",rhythm:"Moderate (huan mai) — steady.",shape:"Slippery (hua mai) — smooth but fine. Yin still present."}},
right:{
cun:{organ:"Lung ·",dom:"thin",sev:0.10,
  // LU: Liver constrains Lung's descending function. Chest tightness.
  // Very subtle thinning. score = 10 - 4.5*0.10 = 9.6.
  strength:"Full (shi mai) — nearly full. Trace softness.",depth:"All levels — no meaningful shift.",width:"Long (chang mai) — very slight narrowing.",speed:"~73bpm — normal.",rhythm:"Moderate (huan mai) — balanced.",shape:"Slippery (hua mai) — smooth. Subclinical Lung impact."},
guan:{organ:"Spleen/Stomach ★",dom:"wiry",sev:0.50,
  // SP: Wood overacts Earth. The Liver imposes tautness on Spleen's position.
  // Wiry but less intense than Liver. score = 10 - 6*0.50 = 7.0.
  strength:"Full (shi mai) — moderate Liver-imposed tension.",depth:"Evenly all 3 levels — Wiry characteristic maintained.",width:"Thin/Fine (xi mai) — compressed by Liver constraint.",speed:"~75bpm — slightly elevated.",rhythm:"Moderate (huan mai) — tension present but regular.",shape:"Wiry (xuan mai) — Liver overacting on Spleen (Wood on Earth). Less taut than L-Guan."},
chi:{organ:"Kidney Yang/Mingmen ·",dom:"thin",sev:0.08,
  // KI-Yang: Essentially uninvolved in Qi stagnation. Minimal body-wide resonance.
  // score = 10 - 4.5*0.08 = 9.6
  strength:"Full (shi mai) — nearly normal.",depth:"Deep/Sinking (chen mai) — normal deep position.",width:"Long (chang mai) — fills adequately.",speed:"~70bpm — normal.",rhythm:"Moderate (huan mai) — steady.",shape:"Slippery (hua mai) — smooth. Yang root intact."}},
validation:"PRIMARY: L-Guan strongly Wiry (★★ 5.5). SECONDARY: R-Guan moderately Wiry (★ 7.0) — Wood→Earth. TERTIARY: L-Chi mildly Thin (~ 8.4) — Liver draws Kidney Yin. SUBCLINICAL: L-Cun trace Wiry (9.1), R-Cun trace Thin (9.6), R-Chi minimal (9.6). Gradient L-Guan > R-Guan confirms Liver as source."},

// ============================================================
// SPLEEN QI DEFICIENCY (脾气虚 Pí Qì Xū)
// ============================================================
// Clinical: Chronic fatigue after eating, loose stools, bloating, poor appetite,
// heavy limbs, bruising easily. The transformation/transportation factory is failing.
//
// Pathomechanism:
//   1. Spleen Qi depleted → R-Guan profoundly weak → FRAIL (★★ primary)
//   2. Mingmen fire not warming Spleen → R-Chi deep → DEEP (★ root cause)
//   3. Earth→Metal: Spleen not generating Lung Qi → R-Cun thins (~ tertiary)
//   4. Spleen makes Blood → Heart Blood reduces → L-Cun thins (~ tertiary)
//   5. Blood deficiency → Liver Blood storage drops → L-Guan thins (~ tertiary)
//   6. Spleen not transforming fluids → Kidney Yin reserve mildly drawn → L-Chi (· subclinical)
//
// Key diagnostic: R-Guan DRAMATICALLY weakest. Everything else mild.
// ============================================================
spleen_qi_deficiency:{name:"Spleen Qi Deficiency (脾气虚)",summary:"Frail (ruo mai) Right Guan — factory failing. Deep Right Chi — Mingmen root. Mild Thin cascade downstream.",
left:{
cun:{organ:"Heart ~",dom:"thin",sev:0.20,
  // HT: Spleen generates Blood → Heart governs Blood. Production dropping.
  // Thin. score = 10 - 4.5*0.20 = 9.1. Subtle but real — mild palpitations.
  strength:"Empty (xu mai) — slightly soft. Blood production declining.",depth:"All levels — minimal depth shift.",width:"Thin/Fine (xi mai) — mild Blood deficiency.",speed:"~72bpm — near normal.",rhythm:"Moderate (huan mai) — stable.",shape:"Slippery (hua mai) — smooth. Heart Qi still adequate."},
guan:{organ:"Liver ~",dom:"thin",sev:0.25,
  // LR: Liver stores Blood. Spleen not making enough → Liver reserve drops.
  // Thin. score = 10 - 4.5*0.25 = 8.9. Detectable to skilled clinician.
  strength:"Empty (xu mai) — mildly soft. Blood storage declining.",depth:"Deep/Sinking (chen mai) — slightly deeper than normal.",width:"Thin/Fine (xi mai) — mildly depleted from Blood deficiency.",speed:"~71bpm — near normal.",rhythm:"Moderate (huan mai) — stable.",shape:"Slippery (hua mai) — smooth but slightly reduced."},
chi:{organ:"Kidney Yin ·",dom:"thin",sev:0.15,
  // KI-Yin: Spleen not transforming fluids well → mild Yin resource strain.
  // Less affected than in LQS — this is SP def, not Liver drawing on Kidney.
  // score = 10 - 4.5*0.15 = 9.3. Very subtle.
  strength:"Full (shi mai) — nearly normal. Kidney Yin reserve adequate.",depth:"Deep/Sinking (chen mai) — normal Yin depth.",width:"Thin/Fine (xi mai) — very mildly reduced.",speed:"~70bpm — normal.",rhythm:"Moderate (huan mai) — steady.",shape:"Slippery (hua mai) — smooth. Root intact."}},
right:{
cun:{organ:"Lung ~",dom:"thin",sev:0.40,
  // LU: Earth is mother of Metal. Spleen failing → Lung Qi deficient.
  // Most affected non-primary organ. score = 10 - 4.5*0.40 = 8.2. Clear.
  strength:"Empty (xu mai) — Lung depends on Spleen for Qi. Noticeably soft.",depth:"Deep/Sinking (chen mai) — sinking from Qi deficiency.",width:"Thin/Fine (xi mai) — moderately reduced. SOB possible.",speed:"~70bpm — slightly slow from Qi deficiency.",rhythm:"Moderate (huan mai) — stable but weak.",shape:"Slippery (hua mai) — reduced but smooth."},
guan:{organ:"Spleen/Stomach ★★",dom:"frail",sev:0.85,
  // SP: PRIMARY. The factory is failing. Profoundly weak.
  // Frail = soft, deep only, threadlike. score = 10 - 7.5*0.85 = 3.6.
  strength:"Empty (xu mai) — profoundly soft. Vanishes on heavier palpation.",depth:"Frail (ruo mai) — ONLY at deep level. Absent superficial and middle.",width:"Minute (wei mai) — barely perceptible thread.",speed:"Slow (chi mai) — ~65bpm. Insufficient Qi to drive rate.",rhythm:"Moderate (huan mai) — intermittently inconsistent.",shape:"Slippery (hua mai) — extremely attenuated. Ghost of fluidity."},
chi:{organ:"Kidney Yang/Mingmen ★",dom:"deep",sev:0.75,
  // KI-Yang: ROOT CAUSE. Mingmen fire not warming Middle Jiao.
  // Deep = pulse only at heavier pressure. Yang can't raise.
  // score = 10 - 4.0*0.75 = 7.0. Meaningfully involved.
  strength:"Empty (xu mai) — Yang insufficiency. Soft.",depth:"Deep/Sinking (chen mai) — only at deep pressure. Yang cannot rise.",width:"Thin/Fine (xi mai) — reduced force.",speed:"~68bpm — slightly slow.",rhythm:"Moderate (huan mai) — stable but deep.",shape:"Slippery (hua mai) — soft, deep. Mingmen embers."}},
validation:"PRIMARY: R-Guan profoundly Frail (★★ 3.6) — Spleen factory collapsed. ROOT: R-Chi Deep (★ 7.0) — Mingmen not warming Earth. TERTIARY: R-Cun Thin (~ 8.2) — mother→child Qi deficit. L-Guan Thin (~ 8.9) — Blood storage. L-Cun Thin (~ 9.1) — Blood production. SUBCLINICAL: L-Chi (· 9.3). Gradient: R-Guan >> R-Chi >> R-Cun > L-Guan > L-Cun > L-Chi."},

// ============================================================
// KIDNEY YANG DEFICIENCY (肾阳虚 Shèn Yáng Xū)
// ============================================================
// Clinical: Cold limbs, sore lower back/knees, frequent nocturnal urination,
// low libido, morning diarrhea, edema ankles, pale tongue. Mingmen fire declining.
//
// Pathomechanism:
//   1. Kidney Yin position reflects total Kidney depletion → FRAIL (★★ primary)
//   2. Kidney Yang/Mingmen source depleted → FRAIL (★★ primary)
//   3. Water not nourishing Wood → Liver unsupported → DEEP (★ secondary)
//   4. Mingmen not warming Earth → Spleen struggles → THIN (~ tertiary)
//   5. Heart Yang roots in Kidney Yang → Heart cools → THIN (~ tertiary)
//   6. Kidney grasps Lung Qi but lower Jiao primary → Lung least affected (· subclinical)
//
// Key diagnostic: BOTH Chi positions severely depleted. Everything tends deep/empty.
// ============================================================
kidney_yang_deficiency:{name:"Kidney Yang Deficiency (肾阳虚)",summary:"Frail (ruo mai) both Chi — Kidney source depleted. Deep Liver. Mild Thin cascade upward. Mingmen failing.",
left:{
cun:{organ:"Heart ~",dom:"thin",sev:0.35,
  // HT: Heart Yang has root in Kidney Yang. Mutual Fire-Water axis.
  // When Kidney Yang declines, Heart Yang follows. Thin, slightly deep.
  // score = 10 - 4.5*0.35 = 8.4. Palpitations, cold chest possible.
  strength:"Empty (xu mai) — Heart Yang mildly affected. Subtle softness.",depth:"Deep/Sinking (chen mai) — slightly sinking from Yang deficiency.",width:"Thin/Fine (xi mai) — reduced from declining Yang support.",speed:"~70bpm — slightly slow. Yang not driving rate.",rhythm:"Moderate (huan mai) — stable.",shape:"Slippery (hua mai) — fine but present."},
guan:{organ:"Liver ★",dom:"deep",sev:0.60,
  // LR: Water generates Wood. Kidney depletion → Liver unsupported.
  // Deep = Yang cannot raise the Liver pulse. Meaningful finding.
  // score = 10 - 4.0*0.60 = 7.6. Blurred vision, brittle nails possible.
  strength:"Empty (xu mai) — moderately unsupported. Lacks force.",depth:"Deep/Sinking (chen mai) — shifted deep. Yang cannot lift.",width:"Thin/Fine (xi mai) — moderately reduced.",speed:"~69bpm — slightly slow.",rhythm:"Moderate (huan mai) — stable but subdued.",shape:"Slippery (hua mai) — soft, deep quality."},
chi:{organ:"Kidney Yin ★★",dom:"frail",sev:0.90,
  // KI-Yin: Even in "Yang" deficiency, both Kidney positions reflect source depletion.
  // Yin and Yang co-root. Profound frailty. Nearly absent.
  // score = 10 - 7.5*0.90 = 3.3. Severe.
  strength:"Empty (xu mai) — extremely soft. Barely registers.",depth:"Frail (ruo mai) — only at deepest pressure. Absent superficial/middle entirely.",width:"Minute (wei mai) — threadlike. Barely perceptible.",speed:"Slow (chi mai) — ~64bpm. Yang depleted.",rhythm:"Moderate (huan mai) — barely discernible rhythm.",shape:"Slippery (hua mai) — ghost thread. Yin depleted at source."}},
right:{
cun:{organ:"Lung ·",dom:"thin",sev:0.15,
  // LU: Kidney grasps Lung Qi, but Lung is upper Jiao — last to feel
  // lower Jiao Yang decline. Very subtle thinning.
  // score = 10 - 4.5*0.15 = 9.3. Slight SOB on exertion.
  strength:"Full (shi mai) — nearly normal. Lung relatively preserved.",depth:"All levels — minimal depth shift.",width:"Long (chang mai) — very slight narrowing.",speed:"~72bpm — near normal.",rhythm:"Moderate (huan mai) — balanced.",shape:"Slippery (hua mai) — smooth. Upper Jiao holding."},
guan:{organ:"Spleen/Stomach ~",dom:"thin",sev:0.45,
  // SP: Mingmen fire warms Spleen. Without it, transformation weakens.
  // Morning diarrhea = "cock-crow diarrhea" = KI Yang → SP.
  // score = 10 - 4.5*0.45 = 8.0. Real clinical finding.
  strength:"Empty (xu mai) — Mingmen not warming. Soft.",depth:"Deep/Sinking (chen mai) — sinking from Yang deficiency.",width:"Thin/Fine (xi mai) — moderately reduced.",speed:"~69bpm — slightly slow.",rhythm:"Moderate (huan mai) — stable but subdued.",shape:"Slippery (hua mai) — soft, reduced."},
chi:{organ:"Kidney Yang/Mingmen ★★",dom:"frail",sev:0.80,
  // KI-Yang: PRIMARY SOURCE. The fire is dying. Profound weakness.
  // score = 10 - 7.5*0.80 = 4.0. Severe but slightly less than Yin
  // position because Yang still has trace warmth even in deficiency.
  strength:"Empty (xu mai) — profoundly depleted. Minimal force.",depth:"Frail (ruo mai) — deep pressure only. Yang cannot rise at all.",width:"Minute (wei mai) — very weak thread.",speed:"Slow (chi mai) — ~65bpm. Fire dimming.",rhythm:"Moderate (huan mai) — barely perceptible.",shape:"Slippery (hua mai) — no force. Mingmen ember."}},
validation:"PRIMARY: Both Chi Frail (★★). L-Chi 3.3 (Yin co-depleted), R-Chi 4.0 (Yang source). SECONDARY: L-Guan Deep (★ 7.6) — Water→Wood deficit. TERTIARY: R-Guan Thin (~ 8.0) — Mingmen→Spleen warming. L-Cun Thin (~ 8.4) — Heart Yang roots in Kidney. SUBCLINICAL: R-Cun (· 9.3). Gradient: L-Chi ≈ R-Chi >> L-Guan >> R-Guan > L-Cun >> R-Cun."},
};

// Auto-calculate scores
const SCORES={};
(function(){
  for(const[dk,dd]of Object.entries(D)){
    SCORES[dk]={};
    for(const w of WR)for(const p of POS){
      const k=`${w}_${p}`;
      SCORES[dk][POS_TO_ORGAN[k]]=calcScore(dd[w][p].dom, dd[w][p].sev);
    }
  }
})();

function genWave(pk, posKey, sev){
  const p=blendParams(pk,posKey,sev);
  const severity=(sev!==undefined&&sev!==null)?sev:1.0;
  const n=SR*DUR,d=[],bp=60/p.rate;
  let bc=0;
  const seed=posKey.charCodeAt(0)*137+posKey.charCodeAt(posKey.length-1)*71;
  for(let i=0;i<n;i++){
    const t=i/SR;let lp=bp;
    if(p.irr>0.1){if(Math.sin(bc*2.7+0.5)>(1-p.irr*2))lp=bp*(1.8+p.irr);}
    else if(p.irr>0)lp+=(Math.sin(t*0.6)*p.irr*0.3)*bp;
    const ph=(t%lp)/lp;if(ph<0.01&&i>0)bc++;
    const rw=(p.w*0.28)/p.sh;
    const sys=p.amp*Math.exp(-Math.pow((ph-0.14)/rw,2));
    const dic=p.dic*p.amp*Math.exp(-Math.pow((ph-0.43)/0.10,2));
    const dia=0.10*p.amp*Math.exp(-Math.pow((ph-0.65)/0.13,2));
    let sm=0;
    const ss=(pk==="normal"||pk==="moderate")?0:severity;
    if(pk==="slippery")sm=0.10*p.amp*Math.exp(-Math.pow((ph-0.28)/0.14,2))*ss;
    if(pk==="choppy")sm=(Math.sin(i*0.3+seed)*0.5-0.25)*0.10*p.amp*(ph<0.5?1:0.3)*ss;
    if(pk==="wiry")sm=-0.03*p.amp*Math.exp(-Math.pow((ph-0.30)/0.08,2))*ss;
    if(pk==="frail"||pk==="minute")sm=-0.02*p.amp*Math.sin(t*2.5+seed*0.1)*ss;
    if(pk==="soggy")sm=-0.03*p.amp*(ph>0.2?Math.exp(-Math.pow((ph-0.3)/0.15,2)):0)*ss;
    const pv=Math.sin(t*1.2+seed*0.01)*0.012*p.amp;
    const ns=(Math.sin(i*7.3+seed)*0.5)*0.018*p.amp;
    d.push(Math.round(Math.max(0.01,sys+dic+dia+sm+pv+ns+0.08)*10000)/10000);
  }
  return d;
}

function exF(wf,pk,posKey,sev){
  const p=blendParams(pk,posKey,sev);
  let mx=0,mn=Infinity,sm=0;
  for(let i=0;i<wf.length;i++){if(wf[i]>mx)mx=wf[i];if(wf[i]<mn)mn=wf[i];sm+=wf[i];}
  const me=sm/wf.length;
  const th=me+(mx-me)*0.5;let lp=-SR;const ins=[];
  for(let i=1;i<wf.length-1;i++){if(wf[i]>th&&wf[i]>wf[i-1]&&wf[i]>wf[i+1]&&i-lp>SR*0.3){if(lp>0)ins.push((i-lp)/SR);lp=i;}}
  const avg=ins.length>0?ins.reduce((a,b)=>a+b,0)/ins.length:60/p.rate;
  const hrv=ins.length>1?Math.sqrt(ins.map(x=>Math.pow(x-avg,2)).reduce((a,b)=>a+b,0)/ins.length)*1000:0;
  let widthSum=0,widthCount=0;
  const halfPeak=(mx-mn)*0.5+mn;
  for(let i=1;i<wf.length-1;i++){if(wf[i]>halfPeak&&wf[i-1]<=halfPeak){let j=i;while(j<wf.length&&wf[j]>halfPeak)j++;if(j<wf.length){widthSum+=(j-i)/SR;widthCount++;}}}
  const mw=widthCount>0?widthSum/widthCount:p.w*0.28;
  let dicSum=0,dicCount=0;const pks=[];
  for(let i=1;i<wf.length-1;i++){if(wf[i]>th&&wf[i]>wf[i-1]&&wf[i]>wf[i+1]&&(pks.length===0||i-pks[pks.length-1]>SR*0.3))pks.push(i);}
  for(let pi=0;pi<pks.length-1;pi++){const s2=pks[pi]+Math.floor(SR*0.15),e2=Math.min(pks[pi]+Math.floor(SR*0.45),pks[pi+1]);let dp=0;for(let i=s2;i<e2;i++){if(wf[i]>dp)dp=wf[i];}if(dp>mn+0.05*(mx-mn)){dicSum+=dp/mx;dicCount++;}}
  const md=dicCount>0?dicSum/dicCount:p.dic;
  let maxSlope=0;for(let i=1;i<wf.length;i++){const sl=(wf[i]-wf[i-1])*SR;if(sl>maxSlope)maxSlope=sl;}
  const ms=maxSlope/(mx*10);
  return{heart_rate_bpm:Math.round(60/avg),peak_amplitude:Math.round(mx*1000)/1000,mean_amplitude:Math.round(me*1000)/1000,amplitude_range:Math.round((mx-mn)*1000)/1000,pulse_width_s:Math.round(mw*1000)/1000,dicrotic_ratio:Math.round(md*1000)/1000,rise_sharpness:Math.round(ms*100)/100,hrv_ms:Math.round(hrv*10)/10,missed_beats:ins.filter(x=>x>avg*1.4).length,irregularity:Math.round(p.irr*100)/100,beat_count:ins.length+1};
}

const HREF={};
(function(){const hd=D.healthy;for(const w of WR)for(const p of POS){const k=`${w}_${p}`;const wf=genWave(hd[w][p].dom,k,0);HREF[k]={waveform:wf,features:exF(wf,hd[w][p].dom,k,0)};}})();

function featureDeviationScore(feat,bf){
  const keys=["heart_rate_bpm","peak_amplitude","mean_amplitude","pulse_width_s","dicrotic_ratio","rise_sharpness","hrv_ms"];
  const wt={heart_rate_bpm:0.15,peak_amplitude:0.25,mean_amplitude:0.20,pulse_width_s:0.10,dicrotic_ratio:0.10,rise_sharpness:0.10,hrv_ms:0.10};
  let td=0,tw=0;
  for(const k of keys){const bv=bf[k]||0.001;const pv=feat[k]||0;td+=Math.abs(pv-bv)/Math.max(Math.abs(bv),0.001)*(wt[k]||0.1);tw+=wt[k]||0.1;}
  return Math.round(Math.max(0,Math.min(10,10*(1-td/tw*1.5)))*10)/10;
}

function buildPrompt(){
  return `You are MAiZU's TCM Pulse Diagnosis AI. You receive pulse waveform data as JSON and produce a complete diagnostic analysis.

<system_instructions>
You will receive THREE inputs:
1. {{PULSE_QUALITIES}} — 28 classical TCM pulse qualities with descriptions
2. {{REFERENCE_DATA}} — Healthy baseline features + Disease pattern signatures (with severity per position)
3. {{PATIENT_DATA}} — Patient session: context, raw waveform samples, extracted features

Your job:
- Compare patient features vs healthy baseline per position → compute organ scores (0-10)
- Score formula: measure weighted deviation across heart_rate_bpm(0.15), peak_amplitude(0.25), mean_amplitude(0.20), pulse_width_s(0.10), dicrotic_ratio(0.10), rise_sharpness(0.10), hrv_ms(0.10)
- Score = 10.0 × (1 - weighted_avg_deviation × 1.5), clamped [0, 10]
- Compare patient 6-position pattern vs disease signatures → identify best match
- In real patients, ALL organs show some deviation — even "unaffected" organs score 9.1-9.6
- Classify pulse quality per position using the 28 qualities across 6 categories
- Explain reasoning using TCM Five Element theory, Yin-Yang, organ relationships
</system_instructions>

<input_schema>
{{PULSE_QUALITIES}} — JSON: 6 categories, each with pulse qualities
{{REFERENCE_DATA}} — JSON: { healthy_baseline: {pos: features}, disease_patterns: {key: {name, expected_qualities with severity}} }
{{PATIENT_DATA}} — JSON: { session_id, context, channels: {pos: {organ, waveform_sample[60], features}} }
</input_schema>

<organ_mapping>
Left: Cun=Heart | Guan=Liver | Chi=Kidney Yin
Right: Cun=Lung | Guan=Spleen/Stomach | Chi=Kidney Yang/Mingmen
</organ_mapping>

<scoring_tiers>
★★ PRIMARY (3.0-5.5): Main diagnostic finding. Clear pathology.
★  SECONDARY (6.0-7.9): Meaningfully affected via Five Element / Yin-Yang.
~  TERTIARY (8.0-9.0): Subtle but real. Master clinician would note it.
·  SUBCLINICAL (9.1-9.6): Body-wide resonance. Instrumentally detectable.
10.0 = healthy baseline only (no real patient scores exactly 10.0 when diseased)

COMPOUND PATTERNS:
Liver Qi Stagnation + Spleen Qi Deficiency = Liver-Spleen Disharmony (Wood overacting Earth)
Kidney Yang Def + Spleen Qi Def = Mingmen Fire fails to warm Spleen
If all scores >= 9.0 → is_healthy = true
</scoring_tiers>

<output_format>
Respond ONLY with JSON:
{
  "organ_scores": {"heart":<0-10>,"liver":<0-10>,"kidney_yin":<0-10>,"lung":<0-10>,"spleen":<0-10>,"kidney_yang":<0-10>},
  "diagnosis": {
    "primary": {"pattern":"<>","romanized":"<>","confidence_pct":<0-100>,"key_positions":["<>"],"key_qualities":["<>"]},
    "secondary": null | {same},
    "is_compound": <bool>, "compound_name": "<or null>", "is_healthy": <bool>
  },
  "per_position_analysis": {
    "<position>": {"dominant_quality":"<>","romanized":"<>","category":"<>","tier":"<★★|★|~|·>","six_categories":{"strength":"<>","depth":"<>","width":"<>","speed":"<>","rhythm":"<>","shape":"<>"}}
  },
  "reasoning": "<TCM theory with Five Element pathomechanism chain>",
  "contradictions": "<or None>",
  "recommendations": {"acupressure_points":["<>"],"lifestyle":"<>","follow_up":"<>"}
}
</output_format>`;
}

function generateReading(dk){
  const dd=D[dk],ch={},fe={};
  for(const w of WR)for(const p of POS){
    const k=`${w}_${p}`,pos=dd[w][p],dom=pos.dom,sev=pos.sev||0;
    if(dk==="healthy"){ch[k]={dominant:dom,severity:0,waveform:HREF[k].waveform};fe[k]=HREF[k].features;}
    else{const wf=genWave(dom,k,sev);ch[k]={dominant:dom,severity:sev,waveform:wf};fe[k]=exF(wf,dom,k,sev);}
  }
  const wfScores={};
  for(const k of Object.keys(fe))wfScores[POS_TO_ORGAN[k]]=featureDeviationScore(fe[k],HREF[k].features);
  const csvH="timestamp_ms,"+Object.keys(ch).join(",");const csvR=[csvH];
  for(let i=0;i<SR*DUR;i++){const row=[Math.round(i/SR*1000)];for(const k of Object.keys(ch))row.push(ch[k].waveform[i]);csvR.push(row.join(","));}
  const sj={session_id:`maizu_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,timestamp:new Date().toISOString(),device:"maizu_wristband_v1_synthetic",context:{state:"resting",position:"seated",rest_duration_min:5,age_group:"10-35",baseline_used:"resting_adult_10_35"},sample_rate_hz:SR,duration_sec:DUR,channels:{},healthy_baseline:{}};
  for(const k of Object.keys(ch)){
    const raw3s=ch[k].waveform.slice(0,SR*3);
    const ds=raw3s.filter((_,i)=>i%Math.max(1,Math.floor(raw3s.length/60))===0).slice(0,60).map(v=>Math.round(v*1000)/1000);
    sj.channels[k]={position:k.split("_")[1],wrist:k.split("_")[0],organ:ORGAN[k],waveform_sample:ds,features:fe[k]};
    sj.healthy_baseline[k]=HREF[k].features;
  }
  const prompt=buildPrompt();
  const refData={healthy_baseline:{},disease_patterns:{}};
  for(const k of Object.keys(HREF))refData.healthy_baseline[k]=HREF[k].features;
  for(const[rk,rv]of Object.entries(D)){if(rk==="healthy")continue;const eq={};for(const w of WR)for(const p of POS){const pk=`${w}_${p}`;eq[pk]={dominant:rv[w][p].dom,severity:rv[w][p].sev||0,strength:rv[w][p].strength,depth:rv[w][p].depth,width:rv[w][p].width,speed:rv[w][p].speed,rhythm:rv[w][p].rhythm,shape:rv[w][p].shape};}refData.disease_patterns[rk]={name:rv.name,summary:rv.summary,expected_qualities:eq};}
  return{csv:csvR.join("\n"),sessionJson:sj,ch,fe,prompt,pulseQualities:PULSE_QUALITIES,referenceData:refData,dd,wfScores};
}

function WC({data,color,label}){const w=290,h=58,sa=SR*3,sl=data.slice(0,sa);let mx=0,mn=Infinity;for(let i=0;i<sl.length;i++){if(sl[i]>mx)mx=sl[i];if(sl[i]<mn)mn=sl[i];}const rn=mx-mn||1;const step=Math.max(1,Math.floor(sl.length/290));const pts=sl.filter((_,i)=>i%step===0).map((v,i)=>`${(i*step/sa)*w},${h-((v-mn)/rn)*(h-8)-4}`).join(" ");return(<svg width={w} height={h} className="bg-gray-900 rounded" style={{display:"block",maxWidth:"100%"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.2"/><text x="4" y="12" fill={color} fontSize="9" fontFamily="monospace">{label}</text></svg>);}
function Ring({score,label,sub}){const r=22,c=2*Math.PI*r,o=c-(score/10)*c,sc=score>=8?"#22c55e":score>=5?"#eab308":"#ef4444";return(<div className="text-center"><div className="text-xs text-gray-400 mb-1">{label}</div><svg width="56" height="56" style={{display:"block",margin:"0 auto"}}><circle cx="28" cy="28" r={r} fill="none" stroke="#1f2937" strokeWidth="4"/><circle cx="28" cy="28" r={r} fill="none" stroke={sc} strokeWidth="4" strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" transform="rotate(-90 28 28)"/><text x="28" y="32" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{score}</text></svg>{sub!==undefined&&<div className="text-xs mt-0.5" style={{color:Math.abs(sub-score)<=1.5?"#6b7280":"#ef4444",fontSize:9}}>wf:{sub}</div>}</div>);}
function CR({l,v,ct}){return(<div className="flex gap-2 text-xs" style={{padding:"2px 0"}}><span className="font-bold" style={{color:CC[ct],minWidth:95,flexShrink:0}}>{l}:</span><span className="text-gray-300">{v}</span></div>);}

export default function App(){
  const[dis,setDis]=useState("healthy");
  const[view,setView]=useState("v");
  const[res,setRes]=useState(null);
  const[exp,setExp]=useState(null);
  const[showRef,setShowRef]=useState(false);
  const gen=useCallback(()=>{try{const r=generateReading(dis);r.organScores=SCORES[dis]||SCORES.healthy;setRes(r);setView("v");setExp(null);}catch(e){console.error(e);}},[dis]);
  const dl=(c,n,t)=>{const b=new Blob([c],{type:t});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);};
  const copy=(text)=>{try{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);}catch(e){try{navigator.clipboard.writeText(text);}catch(e2){console.error("Copy failed",e2);}}};
  const[copied,setCopied]=useState("");
  const copyBtn=(text,label,id)=><button onClick={()=>{copy(text);setCopied(id);setTimeout(()=>setCopied(""),1500);}} className={`${copied===id?"bg-green-600":"bg-gray-600"} text-white px-3 py-2 rounded text-xs`} style={{border:"none",cursor:"pointer"}}>{copied===id?"Copied!":label}</button>;
  const dd=D[dis];
  const curScores=SCORES[dis]||SCORES.healthy;

  return(<div className="min-h-screen bg-gray-950 text-gray-100 p-3" style={{fontFamily:"Inter,system-ui,sans-serif"}}><div className="max-w-6xl mx-auto">
    <h1 className="text-xl font-bold text-white mb-1">MAiZU — TCM Pulse Diagnosis POC</h1>
    <p className="text-xs text-gray-500 mb-3">3 diseases + healthy | Master TCM calibration | All organs assessed | Waveform↔score verified</p>

    <button onClick={()=>setShowRef(!showRef)} className="text-xs text-cyan-400 underline mb-2" style={{background:"none",border:"none",cursor:"pointer"}}>{showRef?"Hide":"Show"} 28 Pulse Qualities</button>
    {showRef&&<div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3 max-h-56 overflow-auto">{Object.entries(Q).map(([cat,qs])=><div key={cat} className="mb-2"><div className="text-xs font-bold mb-1" style={{color:CC[cat]}}>{cat}</div><div className="grid grid-cols-2 gap-1">{Object.entries(qs).map(([k,q])=><div key={k} className="text-xs bg-gray-800 rounded p-1"><strong className="text-white">{q.k}</strong> <span className="text-gray-400">({q.r})</span> <span className="text-gray-500">{q.d}</span></div>)}</div></div>)}</div>}

    <div className="bg-gray-900 rounded p-3 mb-3 border border-gray-800">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1" style={{minWidth:220}}><label className="block text-xs text-gray-400 mb-1">Generate Reference Waveform</label>
          <select value={dis} onChange={e=>{setDis(e.target.value);setRes(null);setExp(null);}} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">{Object.entries(D).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
        <button onClick={gen} className="bg-emerald-600 text-white px-5 py-2 rounded text-sm font-medium">Generate</button>

      </div>
      {dd&&<p className="text-xs text-gray-400 mt-2 italic">{dd.summary}</p>}
    </div>

    <div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3">
      <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Organ Health Scores <span className="font-normal text-gray-600">(formula | wf: = waveform-derived verification)</span></div>
      <div className="grid grid-cols-6 gap-2">
        {[["heart","Heart"],["lung","Lung"],["liver","Liver"],["spleen","Spleen"],["kidney_yin","Kid Yin"],["kidney_yang","Kid Yang"]].map(([org,lbl])=>
          <Ring key={org} score={curScores[org]} label={lbl} sub={res?res.wfScores[org]:undefined}/>
        )}
      </div>
      {dis!=="healthy"&&<div className="mt-2 grid grid-cols-6 gap-2 text-center">{
        ["heart","lung","liver","spleen","kidney_yin","kidney_yang"].map(org=>{
          const posMap={heart:"left_cun",lung:"right_cun",liver:"left_guan",spleen:"right_guan",kidney_yin:"left_chi",kidney_yang:"right_chi"};
          const k=posMap[org];const w2=k.split("_")[0];const position=k.substring(k.indexOf("_")+1);
          const pos2=position==="cun"?"cun":position==="guan"?"guan":"chi";
          const pd=D[dis][w2][pos2];
          const tier=curScores[org]<=5.5?"★★":curScores[org]<=7.9?"★":curScores[org]<=9.0?"~":"·";
          return <div key={org} className="text-xs text-gray-500">{pd.sev>0?`${tier} ${pd.dom}×${pd.sev}`:"—"}</div>;
        })
      }</div>}
    </div>

    {res&&<>
      <div className="flex gap-1 mb-3 flex-wrap">
        {[["v","Waveforms & Qualities"],["csv","CSV (raw → S3)"],["json","Session JSON (→ Lambda)"],["prompt","Universal LLM Prompt (→ Bedrock)"]].map(([k,l])=>
          <button key={k} onClick={()=>setView(k)} className={`px-3 py-1.5 rounded-t text-xs font-medium ${view===k?"bg-gray-800 text-white":"bg-gray-900 text-gray-500"}`}>{l}</button>)}
      </div>

      <div className="bg-gray-900 rounded border border-gray-800 p-3">
        {view==="v"&&<div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {WR.map(w=><div key={w}>
              <div className="text-sm font-bold text-gray-300 uppercase mb-2 pb-1 border-b border-gray-700">{w} Wrist <span className="text-xs font-normal text-gray-500">{w==="left"?"(Heart·Liver·KidneyYin)":"(Lung·Spleen·KidneyYang)"}</span></div>
              {POS.map(pos=>{const k=`${w}_${pos}`,pd=res.dd[w][pos],f=res.fe[k],io=exp===k;
                const fd=fQ(pd.dom),dq=fd?fd.q:null,dc=fd?fd.c:"Normal",dr=dq?dq.r:"ping mai";
                const sev=pd.sev||0;
                const orgScore=SCORES[dis]?SCORES[dis][POS_TO_ORGAN[k]]:10;
                const wfScore=res.wfScores[POS_TO_ORGAN[k]];
                const drift=Math.abs(orgScore-wfScore);
                const tier=orgScore<=5.5?"★★":orgScore<=7.9?"★":orgScore<=9.0?"~":"·";
                const tierColor=orgScore<=5.5?"#ef4444":orgScore<=7.9?"#f59e0b":orgScore<=9.0?"#3b82f6":"#6b7280";
                return(<div key={k} className={`mb-2 rounded border overflow-hidden`} style={{borderColor:orgScore<=5.5?"#92400e":orgScore<=7.9?"#78350f33":"#1f2937",background:orgScore<=5.5?"#1a1510":orgScore<=7.9?"#14120f":"#0f1117"}}>
                  <div className="cursor-pointer" style={{padding:"8px 10px"}} onClick={()=>setExp(io?null:k)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{color:HC[k]}}>{pos.toUpperCase()}</span>
                        <span className="text-xs text-gray-400">{pd.organ}</span>
                        <span className="text-xs font-bold" style={{color:tierColor,fontSize:9}}>{tier}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-white">{dq?dq.k:"Balanced"}</span>
                        {sev>0&&<span className="text-xs text-amber-400">×{sev}</span>}
                        <span className="text-xs px-1 rounded font-mono" style={{background:orgScore>=8?"#16532210":orgScore>=5?"#854d0e20":"#991b1b20",color:orgScore>=8?"#22c55e":orgScore>=5?"#eab308":"#ef4444"}}>{orgScore}</span>
                        <span className="text-xs font-mono" style={{color:drift<=1.5?"#6b7280":"#ef4444",fontSize:9}}>wf:{wfScore}</span>
                        <span className="text-xs text-gray-600">{io?"▲":"▼"}</span>
                      </div>
                    </div>
                    <WC data={res.ch[k].waveform} color={HC[k]} label={`${f.heart_rate_bpm}bpm · peak ${f.peak_amplitude} · HRV ${f.hrv_ms}ms`}/>
                  </div>
                  {io&&<div className="px-2.5 pb-2.5 border-t border-gray-800">
                    {drift>1.5&&<div className="mt-2 mb-1 px-2 py-1 bg-red-900 border border-red-700 rounded text-xs text-red-300">⚠ Score drift: formula={orgScore} vs waveform={wfScore} (Δ{drift.toFixed(1)})</div>}
                    {dq&&<div className="mt-2 mb-2 px-2.5 py-2 rounded text-xs" style={{background:CC[dc]+"12",borderLeft:`3px solid ${CC[dc]}`}}>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap"><span className="text-sm font-bold text-white">{dq.k}</span><span className="text-gray-400">({dr})</span><span className="text-gray-500">· CAM: {dq.c}</span>{sev>0&&<span className="text-amber-400 text-xs">severity: {sev}</span>}<span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{background:CC[dc]+"30",color:CC[dc]}}>{dc}</span></div>
                      <div className="text-gray-300">{dq.d}</div></div>}
                    <div className="mb-1 text-xs text-gray-500 font-bold uppercase" style={{fontSize:9}}>Extracted Features (from waveform)</div>
                    <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {Object.entries(f).map(([fk,fv])=>{
                        const bv=HREF[k]?HREF[k].features[fk]:null;
                        const devPct=bv&&bv!==0?Math.round(Math.abs(fv-bv)/Math.abs(bv)*100):0;
                        return <span key={fk} className="text-gray-400">{fk.replace(/_/g," ")}: <span className="text-white font-mono">{fv}</span>{devPct>5&&<span className="text-amber-500 ml-1">({devPct}%)</span>}</span>;
                      })}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mb-1 uppercase" style={{fontSize:9}}>6-Category Pulse Quality Breakdown</div>
                    <CR l="Strength (li)" v={pd.strength} ct="Strength"/><CR l="Depth (wei)" v={pd.depth} ct="Depth"/><CR l="Width (kuan)" v={pd.width} ct="Width"/>
                    <CR l="Speed (lv)" v={pd.speed} ct="Speed"/><CR l="Rhythm (jie lv)" v={pd.rhythm} ct="Rhythm"/><CR l="Shape (xing)" v={pd.shape} ct="Shape"/>
                  </div>}
                </div>);})}
            </div>)}
          </div>
          <div className="p-3 bg-gray-800 border border-amber-900 rounded"><div className="text-xs font-bold text-amber-400 uppercase mb-1">Clinical Validation</div><p className="text-xs text-gray-300 whitespace-pre-wrap">{res.dd.validation}</p></div>
        </div>}

        {view==="csv"&&<div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-gray-800 rounded flex-1 mr-2"><div className="text-xs font-bold text-emerald-400">Layer 1 — Raw Waveform CSV → S3</div><div className="text-xs text-gray-500">timestamp_ms + 6 channels | {SR}Hz × {DUR}s = {SR*DUR} rows</div></div>
            <div className="flex gap-1 shrink-0">
              {copyBtn(res.csv,"Copy CSV","csv")}
              <button onClick={()=>dl(res.csv,`maizu_ref_${dis}.csv`,"text/csv")} className="bg-emerald-800 text-white px-3 py-2 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Download CSV</button>
            </div>
          </div>
          <pre className="text-xs text-green-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:350}}>{res.csv.split("\n").slice(0,25).join("\n")}{"\n...("+(SR*DUR-24)+" more)"}</pre>
        </div>}

        {view==="json"&&<div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-gray-800 rounded flex-1 mr-2"><div className="text-xs font-bold text-purple-400">Session JSON (Lambda → Bedrock)</div><div className="text-xs text-gray-500">All features waveform-derived. Consistent with CSV.</div></div>
            <div className="flex gap-1 shrink-0">
              {copyBtn(JSON.stringify(res.sessionJson,null,2),"Copy JSON","json")}
              <button onClick={()=>dl(JSON.stringify(res.sessionJson,null,2),`maizu_ref_${dis}.json`,"application/json")} className="bg-purple-800 text-white px-3 py-2 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Download JSON</button>
            </div>
          </div>
          <pre className="text-xs text-purple-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:500}}>{JSON.stringify(res.sessionJson,null,2)}</pre>
        </div>}

        {view==="prompt"&&<div>
          <div className="p-2 bg-gray-800 rounded mb-2">
            <div className="text-xs font-bold text-amber-400">Universal LLM Prompt Template → Bedrock</div>
            <div className="text-xs text-emerald-400 mt-1">Scoring formula + tier system embedded. 3 JSON placeholders.</div>
          </div>
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">{copyBtn(res.prompt,"Copy Prompt","promptTab")}</div>
            <pre className="text-xs font-mono overflow-auto bg-black p-3 rounded whitespace-pre-wrap text-amber-200" style={{maxHeight:500,lineHeight:1.5}}>{res.prompt}</pre>
          </div>
          <div className="p-3 bg-gray-800 border border-purple-900 rounded mt-3">
            <div className="text-xs font-bold text-purple-400 uppercase mb-2">Expected LLM Response (Liver Qi Stagnation)</div>
            <pre className="text-xs text-purple-300 font-mono bg-black p-2 rounded overflow-auto" style={{maxHeight:300}}>{JSON.stringify({organ_scores:SCORES.liver_qi_stagnation,diagnosis:{primary:{pattern:"Liver Qi Stagnation",romanized:"Gan Qi Yu Jie",confidence_pct:89,key_positions:["left_guan","right_guan"],key_qualities:["Wiry (xuan mai)"]},secondary:null,is_compound:false,compound_name:null,is_healthy:false},per_position_analysis:{left_guan:{dominant_quality:"Wiry",romanized:"xuan mai",category:"Shape",tier:"★★"},right_guan:{dominant_quality:"Wiry",romanized:"xuan mai",category:"Shape",tier:"★"},left_chi:{dominant_quality:"Thin",romanized:"xi mai",category:"Width",tier:"~"},left_cun:{dominant_quality:"Wiry",romanized:"xuan mai",category:"Shape",tier:"·"},right_cun:{dominant_quality:"Thin",romanized:"xi mai",category:"Width",tier:"·"},right_chi:{dominant_quality:"Thin",romanized:"xi mai",category:"Width",tier:"·"}},reasoning:"L-Guan wiry×0.75 = primary Liver Qi constraint. R-Guan wiry×0.50 = Wood overacting Earth (secondary). L-Chi thin×0.35 = Liver drawing Kidney Yin (mother→child). L-Cun trace wiry = Liver fire rising to Heart. R-Cun/R-Chi subclinical = body-wide resonance. Gradient L-Guan > R-Guan confirms Liver as source, not Spleen primary.",recommendations:{acupressure_points:["LIV-3 Taichong","LI-4 Hegu","SP-6 Sanyinjiao","PC-6 Neiguan"],lifestyle:"Stress reduction, lateral costal stretching, avoid anger/frustration, sour foods",follow_up:"2 weeks"}},null,2)}</pre>
          </div>
        </div>}
      </div>

      <div className="mt-3 bg-gray-900 rounded border border-gray-800 p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[{l:"Wristband (6ch)",c:"bg-gray-700"},{l:"→"},{l:"CSV → S3",c:"bg-blue-900"},{l:"→"},{l:"Lambda (features)",c:"bg-amber-900"},{l:"→"},{l:"Session JSON + Prompt",c:"bg-purple-900"},{l:"→"},{l:"Bedrock LLM",c:"bg-emerald-900"},{l:"→"},{l:"Diagnosis",c:"bg-red-900"}].map((s,i)=>s.c?<span key={i} className={`${s.c} px-2 py-1 rounded`}>{s.l}</span>:<span key={i} className="text-gray-600">{s.l}</span>)}
        </div>
      </div>
    </>}

    {!res&&<div className="bg-gray-900 rounded border border-gray-800 p-8 text-center"><p className="text-gray-500">Select pattern → <strong className="text-emerald-400">Generate</strong></p></div>}
  </div></div>);
}

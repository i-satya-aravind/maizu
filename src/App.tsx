import { useState, useCallback } from "react";

const SR=250,DUR=10,POS=["cun","guan","chi"],WR=["left","right"];
const CC={Strength:"#ef4444",Depth:"#3b82f6",Width:"#8b5cf6",Speed:"#f59e0b",Rhythm:"#10b981",Shape:"#ec4899"};
const HC={left_cun:"#ef4444",left_guan:"#f97316",left_chi:"#eab308",right_cun:"#3b82f6",right_guan:"#8b5cf6",right_chi:"#06b6d4"};
const ORGAN={left_cun:"Heart",left_guan:"Liver",left_chi:"Kidney Yin",right_cun:"Lung",right_guan:"Spleen/Stomach",right_chi:"Kidney Yang/Mingmen"};

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

// Position-specific healthy baseline parameters
// Each organ has DISTINCT characteristics even when healthy
const PP={
  left_cun:  {rate:74, amp:1.10, w:0.32, dic:0.34, irr:0, sh:1.10},  // Heart: fastest, strongest peak, sharp rise, prominent dicrotic
  left_guan: {rate:72, amp:0.92, w:0.38, dic:0.26, irr:0, sh:0.90},  // Liver: moderate, wider pulse, softer rise
  left_chi:  {rate:70, amp:0.72, w:0.30, dic:0.18, irr:0, sh:0.78},  // Kidney Yin: slowest, weakest, narrow, deep quality
  right_cun: {rate:73, amp:1.00, w:0.35, dic:0.30, irr:0, sh:1.00},  // Lung: moderate baseline, smooth
  right_guan:{rate:71, amp:0.96, w:0.40, dic:0.38, irr:0, sh:0.85},  // Spleen: widest, most dicrotic (slippery), soft rise
  right_chi: {rate:70, amp:0.74, w:0.31, dic:0.20, irr:0, sh:0.80},  // Kidney Yang: similar to Left Chi, deep/soft
};

// Pulse quality waveform parameters
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

// TCM-validated organ scores per disease
const SCORES={
  // TCM-validated organ scores — reflects realistic clinical presentation
  // Most patients are functional people with specific imbalances, NOT multi-organ failure
  // Only primary affected organs show significant drops
  // 10.0 = healthy baseline | 8.0-9.9 = healthy range | 6.0-7.9 = mild issue | 4.0-5.9 = moderate | <4.0 = severe

  healthy:               {heart:10.0, liver:10.0, kidney_yin:10.0, lung:10.0, spleen:10.0, kidney_yang:10.0},

  liver_qi_stagnation:   {heart:9.6,  liver:5.2,  kidney_yin:7.8,  lung:9.5,  spleen:6.8,  kidney_yang:9.4},
  //  Liver 5.2: PRIMARY — Wiry, taut. Clear deviation but patient is functional (stressed, not critical).
  //  Spleen 6.8: Mild impact from Liver overacting. Slightly disrupted, not failing.
  //  Kidney Yin 7.8: Liver drawing slightly on Yin. Thin but subtle. Barely noticeable.
  //  Heart 9.6, Lung 9.5, Kidney Yang 9.4: Essentially healthy. No meaningful deviation.

  spleen_qi_deficiency:  {heart:9.2,  liver:8.2,  kidney_yin:8.0,  lung:7.8,  spleen:3.8,  kidney_yang:6.2},
  //  Spleen 3.8: PRIMARY — Frail. Clearly pathological. The main finding.
  //  Kidney Yang 6.2: ROOT CAUSE — Deep. Mingmen not warming Spleen. Moderate but real.
  //  Lung 7.8: Mild — Lung depends on Spleen Qi. Thin but not dramatically so.
  //  Liver 8.2, Kidney Yin 8.0: Mildly affected. Systemic depletion starting but organs still OK.
  //  Heart 9.2: Well preserved. Last organ affected.

  blood_stasis:          {heart:7.2,  liver:4.2,  kidney_yin:7.5,  lung:7.0,  spleen:5.0,  kidney_yang:9.3},
  //  Liver 4.2: PRIMARY — Choppy. Most jagged/uneven. Liver stores Blood, worst stasis here.
  //  Spleen 5.0: SECONDARY — Choppy but less severe. Blood flow impaired middle Jiao.
  //  Heart 7.2, Lung 7.0: Wiry from Qi stagnation. Noticeable but not severe — patient has chest tension.
  //  Kidney Yin 7.5: Thin — underlying deficiency. Mild.
  //  Kidney Yang 9.3: Healthy. Not involved in Blood Stasis.

  phlegm_dampness:       {heart:7.5,  liver:7.5,  kidney_yin:9.3,  lung:7.2,  spleen:3.5,  kidney_yang:6.0},
  //  Spleen 3.5: PRIMARY — Soggy. Most severe finding. Spleen overwhelmed.
  //  Kidney Yang 6.0: ROOT — Deep. Yang deficiency causing water metabolism failure.
  //  Lung 7.2: Slippery — Phlegm in Lung. Noticeable but patient is breathing.
  //  Heart 7.5, Liver 7.5: Slippery — fluid excess. Mild-moderate. Functioning.
  //  Kidney Yin 9.3: Not involved. Healthy.

  kidney_yang_deficiency: {heart:7.5,  liver:6.8,  kidney_yin:3.5,  lung:9.2,  spleen:7.2,  kidney_yang:4.2},
  //  Kidney Yin 3.5: PRIMARY — Frail. Profound depletion at source. The main finding.
  //  Kidney Yang 4.2: PRIMARY — Deep. Source depleted. Second main finding.
  //  Liver 6.8: Deep/Empty — Yang not supporting Liver. Moderate but functional.
  //  Heart 7.5: Thin/Empty — Heart Yang depends on Kidney. Mild impact.
  //  Spleen 7.2: Thin — Mingmen not warming. Mild.
  //  Lung 9.2: Preserved. Last organ affected.
};

const HB=(o)=>({strength:"Full (shi mai) — resilient, palpable all levels. "+o+" force maintained.",depth:"Floating (fu mai) superficial gentle. Deep/Sinking (chen mai) deep clear. All levels.",width:"Long (chang mai) — perceptible across all 3 positions, fills evenly",speed:"4 beats/respiration, ~72bpm.",rhythm:"Moderate (huan mai) — balanced, regular, no missed beats",shape:"Slippery (hua mai) — slightly fluid, smooth, rounded."});

const D={
healthy:{name:"Healthy (Resting Baseline)",summary:"Reference waveform. Stomach Qi, Spirit, Root present. 4 beats/respiration.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver",dom:"normal",...HB("Liver")},chi:{organ:"Kidney Yin",dom:"normal",strength:"Full (shi mai) — Root clarity confirmed.",depth:"Deep/Sinking (chen mai) — clear at deep. Root present.",width:"Long (chang mai) — fills fully",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach",dom:"moderate",strength:"Full (shi mai) — healthy digestive tone.",depth:"All levels equally",width:"Long (chang mai) — fills evenly",speed:"4 beats/respiration, ~70bpm",rhythm:"Moderate (huan mai) — balanced",shape:"Slippery (hua mai) — smooth fluid. Active digestion."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",strength:"Full (shi mai) — Root confirmed.",depth:"Deep/Sinking (chen mai) — clarity at deep.",width:"Long (chang mai)",speed:"4 beats/respiration, ~72bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth"}},
validation:"All 6 waveforms distinct per position but balanced. Full, Moderate, Slippery. Scores all 10.0."},
liver_qi_stagnation:{name:"Liver Qi Stagnation",summary:"Wiry (xuan mai) both Guan. Thin (xi mai) Left Chi. Liver overacting Spleen.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver ★★",dom:"wiry",strength:"Full (shi mai) — excess Qi constraint",depth:"EVENLY all 3 levels — key Wiry characteristic",width:"Thin/Fine (xi mai) — narrowed by tension",speed:"Rapid (shu mai) — ~78bpm",rhythm:"Moderate (huan mai) — regular with tension",shape:"Wiry (xuan mai) — taut, hard, guitar string. No fluidity."},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai) — soft, lacks fullness.",depth:"Deep/Sinking (chen mai) — tends deeper",width:"Thin/Fine (xi mai) — Liver drawing Kidney Yin.",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — steady",shape:"Slippery (hua mai) — smooth, fine."}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach ★",dom:"wiry",strength:"Full (shi mai) — Liver overacting",depth:"Evenly all 3 levels",width:"Thin/Fine (xi mai) — narrowed",speed:"Rapid (shu mai) — ~78bpm",rhythm:"Moderate (huan mai) — with tension",shape:"Wiry (xuan mai) — Liver on Spleen (Wood on Earth)."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",...HB("Kidney Yang")}},
validation:"Both Guan Wiry: SHARP NARROW. Left Chi Thin: reduced. Cun/Right Chi contrast."},
spleen_qi_deficiency:{name:"Spleen Qi Deficiency",summary:"Frail (ruo mai) Right Guan. Thin (xi mai) downstream. Deep Right Chi.",
left:{cun:{organ:"Heart",dom:"normal",...HB("Heart")},guan:{organ:"Liver",dom:"thin",strength:"Empty (xu mai) — systemic depletion",depth:"Deep/Sinking (chen mai) — tending deep",width:"Thin/Fine (xi mai) — depleted",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — smooth"},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai) — Blood not replenished",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai)"}},
right:{cun:{organ:"Lung",dom:"thin",strength:"Empty (xu mai) — Lung depends on Spleen",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai)"},guan:{organ:"Spleen/Stomach ★★",dom:"frail",strength:"Empty (xu mai) — profoundly soft. Factory depleted.",depth:"Frail (ruo mai) — only deep. Absent superficial/middle.",width:"Minute (wei mai) — barely perceptible",speed:"Slow (chi mai) — ~64bpm",rhythm:"Moderate (huan mai) — inconsistent",shape:"Slippery (hua mai) — extremely attenuated"},chi:{organ:"Kidney Yang/Mingmen ★",dom:"deep",strength:"Empty (xu mai)",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"}},
validation:"Right Guan WEAKEST. Left Cun most resilient. All amplitudes low."},
blood_stasis:{name:"Blood Stasis",summary:"Choppy (se mai) both Guan. Wiry (xuan mai) both Cun. Thin Left Chi.",
left:{cun:{organ:"Heart",dom:"wiry",strength:"Full (shi mai) — Qi pushing",depth:"Evenly all levels",width:"Thin/Fine (xi mai) — narrowed",speed:"~78bpm",rhythm:"Moderate (huan mai) — with tension",shape:"Wiry (xuan mai) — taut. Qi stagnation."},guan:{organ:"Liver ★★",dom:"choppy",strength:"Empty (xu mai) — fluctuating",depth:"Deep/Sinking (chen mai) — sluggish",width:"Long (chang mai) — unevenly",speed:"Slow (chi mai) — ~65bpm",rhythm:"Moderate (huan mai) — irregular timing AND strength",shape:"Choppy (se mai) — uneven, rough, jagged. THE hallmark."},chi:{organ:"Kidney Yin",dom:"thin",strength:"Empty (xu mai)",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — smoother than Guan",shape:"Slippery (hua mai) — smooth. Contrast with Guan."}},
right:{cun:{organ:"Lung",dom:"wiry",strength:"Full (shi mai)",depth:"All levels",width:"Thin/Fine (xi mai)",speed:"~78bpm",rhythm:"Moderate (huan mai)",shape:"Wiry (xuan mai) — chest stagnation."},guan:{organ:"Spleen/Stomach ★",dom:"choppy",strength:"Empty (xu mai) — variable",depth:"Deep/Sinking (chen mai)",width:"Long (chang mai)",speed:"Slow (chi mai) — ~65bpm",rhythm:"Moderate (huan mai) — irregular",shape:"Choppy (se mai) — rough, hesitant."},chi:{organ:"Kidney Yang/Mingmen",dom:"normal",...HB("Kidney Yang")}},
validation:"Guan VISIBLY UNEVEN. Compare jagged Guan vs regular Wiry Cun."},
phlegm_dampness:{name:"Phlegm-Dampness",summary:"Slippery (hua mai) L-Cun, L-Guan, R-Cun. Soggy (ru mai) R-Guan. Deep R-Chi.",
left:{cun:{organ:"Heart/Chest",dom:"slippery",strength:"Full (shi mai) — fluid fullness",depth:"Middle level",width:"Big/Wide (da mai) — expanded by fluid",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — fluid, smooth, oily, rolling. Phlegm."},guan:{organ:"Liver",dom:"slippery",strength:"Full (shi mai)",depth:"Middle level",width:"Big/Wide (da mai)",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — dampness obstructing."},chi:{organ:"Kidney Yin",dom:"normal",...HB("Kidney Yin")}},
right:{cun:{organ:"Lung ★",dom:"slippery",strength:"Full (shi mai) — Phlegm fullness",depth:"Middle level",width:"Big/Wide (da mai) — congested",speed:"~80bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — pronounced rolling. Phlegm Lung."},guan:{organ:"Spleen/Stomach ★★",dom:"soggy",strength:"Soggy (ru mai) — extremely soft. Vanishes pressure.",depth:"Floating (fu mai) — ONLY superficial. Disappears.",width:"Thin/Fine (xi mai) — Spleen overwhelmed.",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai) — barely perceptible",shape:"Slippery (hua mai) — attenuated"},chi:{organ:"Kidney Yang/Mingmen ★",dom:"deep",strength:"Empty (xu mai) — Yang deficiency",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — deep"}},
validation:"Slippery: ROUNDED PROMINENT DICROTIC NOTCH. Right Guan Soggy vanishes pressure."},
kidney_yang_deficiency:{name:"Kidney Yang Deficiency",summary:"Frail (ruo mai) Left Chi. Deep Right Chi. Mingmen failing. Everything Deep Empty.",
left:{cun:{organ:"Heart",dom:"thin",strength:"Empty (xu mai) — Heart Yang depends Kidney.",depth:"Deep/Sinking (chen mai) — sinking",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — fine"},guan:{organ:"Liver",dom:"deep",strength:"Empty (xu mai) — unsupported",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"},chi:{organ:"Kidney Yin ★★",dom:"frail",strength:"Empty (xu mai) — extremely soft.",depth:"Frail (ruo mai) — only deep. Absent above.",width:"Minute (wei mai) — barely perceptible",speed:"Slow (chi mai) — ~64bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft thread"}},
right:{cun:{organ:"Lung",dom:"normal",...HB("Lung")},guan:{organ:"Spleen/Stomach",dom:"thin",strength:"Empty (xu mai) — Mingmen not warming",depth:"Deep/Sinking (chen mai)",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~68bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — soft"},chi:{organ:"Kidney Yang/Mingmen ★★",dom:"deep",strength:"Empty (xu mai) — primary Yang depleted.",depth:"Deep/Sinking (chen mai) — only heavier pressure.",width:"Thin/Fine (xi mai)",speed:"Slow (chi mai) — ~70bpm",rhythm:"Moderate (huan mai)",shape:"Slippery (hua mai) — no force."}},
validation:"Both Chi lowest. Everything Deep/Empty. Right Cun most resilient."},
};

// Waveform generation — position-aware, deterministic
function genWave(pk, posKey){
  const base=WP[pk]||WP.normal;
  const pm=PP[posKey]||PP.right_cun;
  let p;
  if(pk==="normal"||pk==="moderate"){
    // Healthy: use position params directly — each organ sounds different
    p={...pm};
    if(pk==="moderate"){p.rate=pm.rate-1;p.dic=pm.dic+0.06;}
  } else {
    // Disease: blend disease quality with position characteristics
    // Position modulates amplitude, width, dicrotic, sharpness significantly
    const posAmpScale = pm.amp / 1.0;   // Heart 1.10, Chi 0.72 — big range
    const posWidthShift = pm.w - 0.35;   // Spleen +0.05, Chi -0.05
    const posDicShift = pm.dic - 0.30;   // Spleen +0.08, Chi -0.12
    const posShScale = pm.sh / 1.0;      // Heart 1.10, Chi 0.78
    p = {
      rate: base.rate + (pm.rate - 72) * 0.5,        // position shifts rate ±2bpm
      amp:  base.amp * posAmpScale,                    // Chi positions always weaker
      w:    base.w + posWidthShift * 0.5,              // Spleen wider, Chi narrower
      dic:  Math.max(0.02, base.dic + posDicShift * 0.4), // Spleen more dicrotic, Chi less
      irr:  base.irr,
      sh:   base.sh * posShScale,                      // Heart sharper, Chi softer
    };
  }
  const n=SR*DUR, d=[], bp=60/p.rate;
  let bc=0;
  const seed = posKey.charCodeAt(0)*137 + posKey.charCodeAt(posKey.length-1)*71;
  for(let i=0;i<n;i++){
    const t=i/SR; let lp=bp;
    if(p.irr>0.1){if(Math.sin(bc*2.7+0.5)>(1-p.irr*2))lp=bp*(1.8+p.irr);}
    else if(p.irr>0)lp+=(Math.sin(t*0.6)*p.irr*0.3)*bp;
    const ph=(t%lp)/lp; if(ph<0.01&&i>0)bc++;
    const rw=(p.w*0.28)/p.sh;
    const sys=p.amp*Math.exp(-Math.pow((ph-0.14)/rw,2));
    const dic=p.dic*p.amp*Math.exp(-Math.pow((ph-0.43)/0.10,2));
    const dia=0.10*p.amp*Math.exp(-Math.pow((ph-0.65)/0.13,2));
    let sm=0;
    if(pk==="slippery")sm=0.10*p.amp*Math.exp(-Math.pow((ph-0.28)/0.14,2));
    if(pk==="choppy")sm=(Math.sin(i*0.3+seed)*0.5-0.25)*0.10*p.amp*(ph<0.5?1:0.3);
    if(pk==="wiry")sm=-0.03*p.amp*Math.exp(-Math.pow((ph-0.30)/0.08,2)); // sharper notch
    if(pk==="frail"||pk==="minute")sm=-0.02*p.amp*Math.sin(t*2.5+seed*0.1); // wavering
    if(pk==="soggy")sm=-0.03*p.amp*(ph>0.2?Math.exp(-Math.pow((ph-0.3)/0.15,2)):0); // fades
    const pv=Math.sin(t*1.2+seed*0.01)*0.012*p.amp;
    const ns=(Math.sin(i*7.3+seed)*0.5)*0.018*p.amp;
    d.push(Math.round(Math.max(0.01,sys+dic+dia+sm+pv+ns+0.08)*10000)/10000);
  }
  return d;
}

function exF(wf,pk,posKey){
  const base=WP[pk]||WP.normal;
  const pm=PP[posKey]||PP.right_cun;
  let ep;
  if(pk==="normal"||pk==="moderate"){ep={...pm};if(pk==="moderate"){ep.rate=pm.rate-1;ep.dic=pm.dic+0.06;}}
  else{
    const posAmpScale=pm.amp/1.0, posWidthShift=pm.w-0.35, posDicShift=pm.dic-0.30, posShScale=pm.sh/1.0;
    ep={rate:base.rate+(pm.rate-72)*0.5, amp:base.amp*posAmpScale, w:base.w+posWidthShift*0.5, dic:Math.max(0.02,base.dic+posDicShift*0.4), irr:base.irr, sh:base.sh*posShScale};
  }
  let mx=0,mn=Infinity,sm=0;
  for(let i=0;i<wf.length;i++){if(wf[i]>mx)mx=wf[i];if(wf[i]<mn)mn=wf[i];sm+=wf[i];}
  const me=sm/wf.length,th=me+(mx-me)*0.5;let lp=-SR;const ins=[];
  for(let i=1;i<wf.length-1;i++){if(wf[i]>th&&wf[i]>wf[i-1]&&wf[i]>wf[i+1]&&i-lp>SR*0.3){if(lp>0)ins.push((i-lp)/SR);lp=i;}}
  const avg=ins.length>0?ins.reduce((a,b)=>a+b,0)/ins.length:60/ep.rate;
  const hrv=ins.length>1?Math.sqrt(ins.map(x=>Math.pow(x-avg,2)).reduce((a,b)=>a+b,0)/ins.length)*1000:0;
  return{heart_rate_bpm:Math.round(60/avg),peak_amplitude:Math.round(mx*1000)/1000,mean_amplitude:Math.round(me*1000)/1000,amplitude_range:Math.round((mx-mn)*1000)/1000,pulse_width_ratio:Math.round(ep.w*1000)/1000,dicrotic_notch:Math.round(ep.dic*1000)/1000,rise_sharpness:Math.round(ep.sh*100)/100,hrv_ms:Math.round(hrv*10)/10,missed_beats:ins.filter(x=>x>avg*1.4).length,irregularity:Math.round(ep.irr*100)/100,beat_count:ins.length+1};
}

// Healthy reference
const HREF={};
(function(){const hd=D.healthy;for(const w of WR)for(const p of POS){const k=`${w}_${p}`;const wf=genWave(hd[w][p].dom,k);HREF[k]={waveform:wf,features:exF(wf,hd[w][p].dom,k)};}})();

// Universal LLM Prompt Template
function buildPrompt(){
  return `You are MAiZU's TCM Pulse Diagnosis AI. You receive pulse waveform data as JSON and produce a complete diagnostic analysis.

<system_instructions>
You will receive THREE inputs:
1. {{PULSE_QUALITIES}} — 28 classical TCM pulse qualities with descriptions
2. {{REFERENCE_DATA}} — Healthy baseline features + Disease pattern signatures
3. {{PATIENT_DATA}} — Patient session: context, raw waveform samples, extracted features

Your job:
- Compare patient vs healthy baseline → organ scores (0-10)
- Compare patient 6-position pattern vs disease signatures → identify best match
- Detect compound patterns if multiple diseases coexist
- Classify pulse quality per position using the 28 qualities across 6 categories
- Explain reasoning using TCM theory (Five Elements, Yin-Yang, organ relationships)
</system_instructions>

<input_schema>
{{PULSE_QUALITIES}} — JSON: 6 categories, each with pulse qualities (kaptchuk, cam, romanized, description)
{{REFERENCE_DATA}} — JSON: { healthy_baseline: {position: features}, disease_patterns: {key: {name, expected_qualities}} }
{{PATIENT_DATA}} — JSON: { session_id, context, channels: {position: {organ, waveform_sample[75], features}} }
</input_schema>

<organ_mapping>
Left: Cun=Heart | Guan=Liver | Chi=Kidney Yin
Right: Cun=Lung | Guan=Spleen/Stomach | Chi=Kidney Yang/Mingmen
</organ_mapping>

<scoring_rules>
10.0 = matches healthy baseline exactly
8.0-9.9 = minor deviation, healthy variation
5.0-7.9 = notable deviation, warrants attention
0-4.9 = significant deviation, likely pathological

Compare: heart_rate_bpm, peak_amplitude, mean_amplitude, pulse_width_ratio, dicrotic_notch, rise_sharpness, hrv_ms

COMPOUND PATTERNS:
Liver Qi Stagnation + Spleen Qi Deficiency = Liver-Spleen Disharmony (Wood overacting Earth)
Blood Stasis + Qi Deficiency = Stasis from insufficient Qi
Phlegm-Dampness + Spleen Qi Deficiency = Spleen fails to transform fluids
Kidney Yang Def + Spleen Qi Def = Mingmen Fire fails to warm Spleen
If all scores >= 9.0 → is_healthy = true
</scoring_rules>

<output_format>
Respond ONLY with JSON:
{
  "organ_scores": {"heart":<0-10>,"liver":<0-10>,"kidney_yin":<0-10>,"lung":<0-10>,"spleen":<0-10>,"kidney_yang":<0-10>},
  "diagnosis": {
    "primary": {"pattern":"<name>","romanized":"<pinyin>","confidence_pct":<0-100>,"key_positions":["<>"],"key_qualities":["<>"]},
    "secondary": null | {same},
    "is_compound": <bool>, "compound_name": "<or null>", "is_healthy": <bool>
  },
  "per_position_analysis": {
    "<position>": {"dominant_quality":"<>","romanized":"<>","category":"<>","six_categories":{"strength":"<>","depth":"<>","width":"<>","speed":"<>","rhythm":"<>","shape":"<>"}}
  },
  "reasoning": "<TCM theory explanation>",
  "contradictions": "<or None>",
  "recommendations": {"acupressure_points":["<>"],"lifestyle":"<>","follow_up":"<>"}
}
</output_format>`;
}

function generateReading(dk){
  const dd=D[dk],ch={},fe={};
  for(const w of WR)for(const p of POS){
    const k=`${w}_${p}`,dom=dd[w][p].dom;
    if(dk==="healthy"){ch[k]={dominant:dom,waveform:HREF[k].waveform};fe[k]=HREF[k].features;}
    else{const wf=genWave(dom,k);ch[k]={dominant:dom,waveform:wf};fe[k]=exF(wf,dom,k);}
  }
  const csvH="timestamp_ms,"+Object.keys(ch).join(",");const csvR=[csvH];
  for(let i=0;i<SR*DUR;i++){const row=[Math.round(i/SR*1000)];for(const k of Object.keys(ch))row.push(ch[k].waveform[i]);csvR.push(row.join(","));}
  const sessionJson={session_id:`maizu_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,timestamp:new Date().toISOString(),device:"maizu_wristband_v1_synthetic",context:{state:"resting",position:"seated",rest_duration_min:5,age_group:"10-35",baseline_used:"resting_adult_10_35"},sample_rate_hz:SR,duration_sec:DUR,channels:{},healthy_baseline:{}};
  for(const k of Object.keys(ch)){
    const raw3s=ch[k].waveform.slice(0,SR*3);
    const ds=raw3s.filter((_,i)=>i%25===0).map(v=>Math.round(v*1000)/1000);
    sessionJson.channels[k]={position:k.split("_")[1],wrist:k.split("_")[0],organ:ORGAN[k],waveform_sample:ds,features:fe[k]};
    sessionJson.healthy_baseline[k]=HREF[k].features;
  }
  const prompt=buildPrompt();
  const refData={healthy_baseline:{},disease_patterns:{}};
  for(const k of Object.keys(HREF))refData.healthy_baseline[k]=HREF[k].features;
  for(const[rk,rv]of Object.entries(D)){if(rk==="healthy")continue;const eq={};for(const w of WR)for(const p of POS){const pk=`${w}_${p}`;eq[pk]={dominant:rv[w][p].dom,strength:rv[w][p].strength,depth:rv[w][p].depth,width:rv[w][p].width,speed:rv[w][p].speed,rhythm:rv[w][p].rhythm,shape:rv[w][p].shape};}refData.disease_patterns[rk]={name:rv.name,summary:rv.summary,expected_qualities:eq};}
  const patientData={session_id:sessionJson.session_id,timestamp:sessionJson.timestamp,device:sessionJson.device,context:sessionJson.context,acquisition:{sample_rate_hz:SR,duration_sec:DUR,channels:6,units:"mmHg_normalized"},channels:sessionJson.channels};
  return{csv:csvR.join("\n"),sessionJson,ch,fe,prompt,pulseQualities:PULSE_QUALITIES,referenceData:refData,patientData,dd};
}

// UI
function WC({data,color,label}){const w=290,h=58,sa=SR*3,sl=data.slice(0,sa);let mx=0,mn=Infinity;for(let i=0;i<sl.length;i++){if(sl[i]>mx)mx=sl[i];if(sl[i]<mn)mn=sl[i];}const rn=mx-mn||1;const pts=sl.filter((_,i)=>i%4===0).map((v,i)=>`${(i*4/sa)*w},${h-((v-mn)/rn)*(h-8)-4}`).join(" ");return(<svg width={w} height={h} className="bg-gray-900 rounded" style={{display:"block",maxWidth:"100%"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.2"/><text x="4" y="12" fill={color} fontSize="9" fontFamily="monospace">{label}</text></svg>);}
function Ring({score,label}){const r=22,c=2*Math.PI*r,o=c-(score/10)*c,sc=score>=8?"#22c55e":score>=5?"#eab308":"#ef4444";return(<div className="text-center"><div className="text-xs text-gray-400 mb-1">{label}</div><svg width="56" height="56" style={{display:"block",margin:"0 auto"}}><circle cx="28" cy="28" r={r} fill="none" stroke="#1f2937" strokeWidth="4"/><circle cx="28" cy="28" r={r} fill="none" stroke={sc} strokeWidth="4" strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" transform="rotate(-90 28 28)"/><text x="28" y="32" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{score}</text></svg></div>);}
function CR({l,v,ct}){return(<div className="flex gap-2 text-xs" style={{padding:"2px 0"}}><span className="font-bold" style={{color:CC[ct],minWidth:95,flexShrink:0}}>{l}:</span><span className="text-gray-300">{v}</span></div>);}

export default function App(){
  const[dis,setDis]=useState("healthy");
  const[view,setView]=useState("v");
  const[res,setRes]=useState(null);
  const[exp,setExp]=useState(null);
  const[showRef,setShowRef]=useState(false);
  const gen=useCallback(()=>{try{const r=generateReading(dis);r.organScores=SCORES[dis]||SCORES.healthy;setRes(r);setView("v");setExp(null);}catch(e){console.error(e);}},[dis]);
  const dl=(c,n,t)=>{const b=new Blob([c],{type:t});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);};
  const copy=(text)=>{
    try{
      const ta=document.createElement("textarea");
      ta.value=text;
      ta.style.position="fixed";
      ta.style.left="-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }catch(e){
      try{navigator.clipboard.writeText(text);}catch(e2){console.error("Copy failed",e2);}
    }
  };
  const[copied,setCopied]=useState("");
  const copyBtn=(text,label,id)=>{
    return <button onClick={()=>{copy(text);setCopied(id);setTimeout(()=>setCopied(""),1500);}} className={`${copied===id?"bg-green-600":"bg-gray-600"} text-white px-3 py-2 rounded text-xs`} style={{border:"none",cursor:"pointer"}}>{copied===id?"Copied!":label}</button>;
  };
  const dd=D[dis];

  return(<div className="min-h-screen bg-gray-950 text-gray-100 p-3" style={{fontFamily:"Inter,system-ui,sans-serif"}}><div className="max-w-6xl mx-auto">
    <h1 className="text-xl font-bold text-white mb-1">MAiZU — TCM Pulse Diagnosis POC</h1>
    <p className="text-xs text-gray-500 mb-3">5 diseases + healthy | Organ scores | Universal LLM prompt with 3 input placeholders</p>

    <button onClick={()=>setShowRef(!showRef)} className="text-xs text-cyan-400 underline mb-2" style={{background:"none",border:"none",cursor:"pointer"}}>{showRef?"Hide":"Show"} 28 Pulse Qualities</button>
    {showRef&&<div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3 max-h-56 overflow-auto">{Object.entries(Q).map(([cat,qs])=><div key={cat} className="mb-2"><div className="text-xs font-bold mb-1" style={{color:CC[cat]}}>{cat}</div><div className="grid grid-cols-2 gap-1">{Object.entries(qs).map(([k,q])=><div key={k} className="text-xs bg-gray-800 rounded p-1"><strong className="text-white">{q.k}</strong> <span className="text-gray-400">({q.r})</span> <span className="text-gray-500">{q.d}</span></div>)}</div></div>)}</div>}

    <div className="bg-gray-900 rounded p-3 mb-3 border border-gray-800">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1" style={{minWidth:220}}><label className="block text-xs text-gray-400 mb-1">Generate Reference Waveform</label>
          <select value={dis} onChange={e=>{setDis(e.target.value);setRes(null);setExp(null);}} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">{Object.entries(D).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
        <button onClick={gen} className="bg-emerald-600 text-white px-5 py-2 rounded text-sm font-medium">Generate</button>
        {res&&<>
          {copyBtn(res.prompt,"Copy Prompt","prompt")}
          {copyBtn(JSON.stringify(res.referenceData,null,2),"Copy Ref Data","ref")}
          {copyBtn(JSON.stringify(PULSE_QUALITIES,null,2),"Copy Pulse Qualities","pq")}
        </>}
      </div>
      {dd&&<p className="text-xs text-gray-400 mt-2 italic">{dd.summary}</p>}
    </div>

    {res&&<>
      <div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3">
        <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Organ Health Scores <span className="font-normal text-gray-600">(vs healthy baseline, 10 = perfect)</span></div>
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
              <div className="text-sm font-bold text-gray-300 uppercase mb-2 pb-1 border-b border-gray-700">{w} Wrist <span className="text-xs font-normal text-gray-500">{w==="left"?"(Heart·Liver·KidneyYin)":"(Lung·Spleen·KidneyYang)"}</span></div>
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
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-gray-800 rounded flex-1 mr-2"><div className="text-xs font-bold text-emerald-400">Layer 1 — Raw Waveform CSV → S3</div><div className="text-xs text-gray-500">timestamp_ms (x) + 6 amplitude channels (y, mmHg normalized) | {SR}Hz × {DUR}s = {SR*DUR} rows</div></div>
            <div className="flex gap-1 shrink-0">
              {copyBtn(res.csv,"Copy CSV","csv")}
              <button onClick={()=>dl(res.csv,`maizu_ref_${dis}.csv`,"text/csv")} className="bg-emerald-800 text-white px-3 py-2 rounded text-xs" style={{border:"none",cursor:"pointer"}}>Download CSV</button>
            </div>
          </div>
          <pre className="text-xs text-green-300 font-mono overflow-auto bg-black p-2 rounded" style={{maxHeight:350}}>{res.csv.split("\n").slice(0,25).join("\n")}{"\n...("+(SR*DUR-24)+" more)"}</pre>
        </div>}

        {view==="json"&&<div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-gray-800 rounded flex-1 mr-2"><div className="text-xs font-bold text-purple-400">Session JSON (Lambda output → Bedrock input)</div><div className="text-xs text-gray-500">Context + per-channel features + waveform samples + healthy baseline</div></div>
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
            <div className="text-xs text-emerald-400 mt-1">This prompt NEVER changes. 3 placeholders receive data as JSON.</div>
          </div>
          <div className="p-3 bg-gray-800 border border-gray-700 rounded mb-3">
            <div className="text-xs font-bold text-white uppercase mb-2">Input Architecture</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div><span className="text-purple-400 font-bold">{"{{PULSE_QUALITIES}}"}</span> — 28 qualities reference. Same for all sessions.</div>
              <div><span className="text-blue-400 font-bold">{"{{REFERENCE_DATA}}"}</span> — Healthy baseline + 5 disease signatures. Same for all sessions.</div>
              <div><span className="text-green-400 font-bold">{"{{PATIENT_DATA}}"}</span> — Patient waveform + features. Changes per session.</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">{copyBtn(res.prompt,"Copy Prompt","promptTab")}</div>
            <pre className="text-xs font-mono overflow-auto bg-black p-3 rounded whitespace-pre-wrap text-amber-200" style={{maxHeight:500,lineHeight:1.5}}>{res.prompt}</pre>
          </div>
          <div className="p-3 bg-gray-800 border border-purple-900 rounded mt-3">
            <div className="text-xs font-bold text-purple-400 uppercase mb-2">Expected LLM Response</div>
            <pre className="text-xs text-purple-300 font-mono bg-black p-2 rounded overflow-auto" style={{maxHeight:250}}>{JSON.stringify({organ_scores:{heart:9.8,liver:5.2,kidney_yin:7.1,lung:9.6,spleen:6.8,kidney_yang:9.4},diagnosis:{primary:{pattern:"Liver Qi Stagnation",romanized:"Gan Qi Yu Jie",confidence_pct:87,key_positions:["left_guan","right_guan"],key_qualities:["Wiry (xuan mai)"]},secondary:null,is_compound:false,compound_name:null,is_healthy:false},reasoning:"Wiry at both Guan = Liver constraint...",recommendations:{acupressure_points:["LIV-3","SP-6"],lifestyle:"Stress reduction",follow_up:"2 weeks"}},null,2)}</pre>
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

import { useState, useCallback } from "react";

const SR = 250, DUR = 10;
const POSITIONS = ["cun", "guan", "chi"];
const WRISTS = ["left", "right"];
const CATEGORIES = ["Strength", "Depth", "Width", "Speed", "Rhythm", "Shape"];
const CAT_COLORS = { Strength: "#ef4444", Depth: "#3b82f6", Width: "#8b5cf6", Speed: "#f59e0b", Rhythm: "#10b981", Shape: "#ec4899" };
const CH_COL = { left_cun: "#ef4444", left_guan: "#f97316", left_chi: "#eab308", right_cun: "#3b82f6", right_guan: "#8b5cf6", right_chi: "#06b6d4" };

const QUALITIES_BY_CAT = {
  Strength: {
    empty: { kaptchuk: "Empty", cam: "Deficiency Type", romanized: "xu mai", desc: "Big but soft & weak — balloon partially filled with water. Feels empty on heavier palpation. Yin. → Qi & Blood deficiency" },
    soggy: { kaptchuk: "Soggy", cam: "Soft", romanized: "ru mai", desc: "Combo thin+empty+floating. Extremely soft, perceptible only superficially. Disappears with pressure. Yin. → Deficient Blood/Jing, sometimes Damp" },
    scattered: { kaptchuk: "Scattered", cam: "N/A", romanized: "san mai", desc: "Floating, big & weak — larger, less distinct than empty. Felt as it recedes. Yin. → Ki/Yang exhausted & floating away (critical)" },
    full: { kaptchuk: "Full", cam: "Excess Type", romanized: "shi mai", desc: "Big & strong, pounding against all 3 fingers at all levels. Yang. → Sign of excess — body fighting vigorously" },
  },
  Depth: {
    floating: { kaptchuk: "Floating", cam: "Superficial", romanized: "fu mai", desc: "Buoyant with light palpation, obscured with pressure. Yang. Floating+tight/rapid=EPF. Floating+empty=Yin def." },
    hollow: { kaptchuk: "Hollow", cam: "N/A", romanized: "kong mai", desc: "Like green onion stem — solid outside, empty within. Yin. → Deficient Blood, often after great blood loss" },
    leather: { kaptchuk: "Leather", cam: "N/A", romanized: "ge mai", desc: "Combo wiry+floating+empty. Like tight drum skin — hard surface, hollow beneath. Yin. → Deficient Blood or Jing" },
    deep: { kaptchuk: "Deep/Sinking", cam: "Deep", romanized: "chen mai", desc: "Found only with heavier palpation. Yin. → Yin organ conditions: qi/yang def.(weak) or qi/blood stasis(full)" },
    frail: { kaptchuk: "Frail", cam: "Weak", romanized: "ruo mai", desc: "Soft, weak, somewhat thin. Usually at deep level only. Yin. → Extremely deficient Qi/Yang" },
    hidden: { kaptchuk: "Hidden", cam: "N/A", romanized: "fu mai (hidden)", desc: "Deep as if below bone — maximum pressure needed. Yin. Strong=Cold obstructing. Weak=Def. Yang can't raise pulse" },
    confined: { kaptchuk: "Confined/Prison", cam: "N/A", romanized: "lao mai", desc: "Very deep & wiry, long & strong. Form of Hidden but forceful. Yang within Yin. → Obstruction due to Cold" },
  },
  Width: {
    thin: { kaptchuk: "Thin/Fine", cam: "Thready", romanized: "xi mai", desc: "Distinct & clear, like a fine thread. Yin. → Blood deficiency, often Qi deficiency" },
    minute: { kaptchuk: "Minute", cam: "N/A", romanized: "wei mai", desc: "Fine & soft, lacks clarity of thin. Barely perceptible. Yin. → Severe Qi & Blood deficiency (critical)" },
    flooding: { kaptchuk: "Flooding", cam: "Surging", romanized: "hong mai", desc: "Surges at all 3 depths, leaves with less strength — receding wave. → Heat injured Fluids & Yin" },
    big: { kaptchuk: "Big/Wide", cam: "N/A", romanized: "da mai", desc: "Distinct & broad — wider than normal without surging force. Yang. → Heat in Stomach or Intestines" },
    long: { kaptchuk: "Long", cam: "N/A", romanized: "chang mai", desc: "Perceptible beyond 1st & 3rd positions. Yang. OK unless also tight & wiry → excess or heat" },
    short: { kaptchuk: "Short", cam: "N/A", romanized: "duan mai", desc: "Doesn't fill space under 3 fingers, felt in 1 position. Yin. → Qi deficiency" },
  },
  Speed: {
    rapid: { kaptchuk: "Rapid", cam: "Rapid", romanized: "shu mai", desc: ">5 beats/respiration or >90bpm. Yang. → Heat is indicated" },
    spinning: { kaptchuk: "Spinning Bean/Moving", cam: "N/A", romanized: "dong mai", desc: "Combo Short+Tight+Slippery+Rapid. Felt in 1 position, incomplete like a bean. Yang. → Shock, palpitations, anxiety" },
    slow: { kaptchuk: "Slow", cam: "Slow", romanized: "chi mai", desc: "<4 beats/respiration or <60bpm. Yin. → Cold is indicated" },
  },
  Rhythm: {
    knotted: { kaptchuk: "Knotted", cam: "Knotted", romanized: "jie mai", desc: "Slow pulse, misses beats irregularly. Yin. → Cold obstructing Qi/Blood, or deficiency" },
    hurried: { kaptchuk: "Hurried", cam: "Abrupt", romanized: "cue mai", desc: "Fast pulse, misses beats irregularly. Yang. → Heat agitating Qi & Blood" },
    intermittent: { kaptchuk: "Intermittent", cam: "Regularly Intermittent", romanized: "dai mai", desc: "Misses more beats, regular rhythm between pauses. Yin. → Serious HT disharmony (grave)" },
    moderate: { kaptchuk: "Moderate", cam: "N/A", romanized: "huan mai", desc: "Healthy, balanced. Normal depth, speed, strength, width. Sometimes slightly slippery" },
  },
  Shape: {
    slippery: { kaptchuk: "Slippery", cam: "Rolling", romanized: "hua mai", desc: "Very fluid, slides under finger, smooth & oily. Common in pregnancy. Full=damp/phlegm. Empty=damp+Qi def." },
    choppy: { kaptchuk: "Choppy", cam: "Hesitant", romanized: "se mai", desc: "Uneven, rough, jagged. Irregular rhythm & strength. Yin. Thin=Blood/Jing def. Full=Congealed Blood" },
    wiry: { kaptchuk: "Wiry", cam: "String-taut", romanized: "xuan mai", desc: "Taut, hard, like guitar string at all levels. No fluidity. Yang. → LR/GB stagnation, pain, phlegm obstruction" },
    tight: { kaptchuk: "Tight", cam: "Tense", romanized: "jin mai", desc: "Strong, bounces side to side like taut rope. Fuller & more elastic than Wiry. Vibrates. → Excess, Cold/pain, stagnation" },
  },
};

function findQuality(dom) {
  for (const [cat, quals] of Object.entries(QUALITIES_BY_CAT)) {
    if (quals[dom]) return { quality: quals[dom], cat };
  }
  return null;
}

const WAVE_PARAMS = {
  normal: { rate: 72, amp: 1.0, width: 0.35, dicrotic: 0.30, irregularity: 0, sharpness: 1.0 },
  empty: { rate: 66, amp: 0.5, width: 0.40, dicrotic: 0.15, irregularity: 0.05, sharpness: 0.7 },
  soggy: { rate: 68, amp: 0.3, width: 0.22, dicrotic: 0.10, irregularity: 0.03, sharpness: 0.5 },
  scattered: { rate: 70, amp: 0.55, width: 0.42, dicrotic: 0.08, irregularity: 0.15, sharpness: 0.6 },
  full: { rate: 78, amp: 1.4, width: 0.38, dicrotic: 0.35, irregularity: 0, sharpness: 1.3 },
  floating: { rate: 74, amp: 0.75, width: 0.30, dicrotic: 0.20, irregularity: 0, sharpness: 0.9 },
  hollow: { rate: 72, amp: 0.6, width: 0.32, dicrotic: 0.12, irregularity: 0.04, sharpness: 0.8 },
  leather: { rate: 75, amp: 0.8, width: 0.25, dicrotic: 0.10, irregularity: 0.02, sharpness: 1.4 },
  deep: { rate: 70, amp: 0.4, width: 0.30, dicrotic: 0.15, irregularity: 0, sharpness: 0.8 },
  frail: { rate: 64, amp: 0.3, width: 0.20, dicrotic: 0.10, irregularity: 0.06, sharpness: 0.5 },
  hidden: { rate: 68, amp: 0.2, width: 0.25, dicrotic: 0.08, irregularity: 0.03, sharpness: 0.6 },
  confined: { rate: 72, amp: 0.9, width: 0.22, dicrotic: 0.12, irregularity: 0, sharpness: 1.5 },
  thin: { rate: 68, amp: 0.45, width: 0.15, dicrotic: 0.18, irregularity: 0, sharpness: 0.9 },
  minute: { rate: 62, amp: 0.2, width: 0.12, dicrotic: 0.06, irregularity: 0.10, sharpness: 0.4 },
  flooding: { rate: 85, amp: 1.5, width: 0.48, dicrotic: 0.40, irregularity: 0, sharpness: 1.4 },
  big: { rate: 76, amp: 1.2, width: 0.42, dicrotic: 0.30, irregularity: 0, sharpness: 1.1 },
  long: { rate: 72, amp: 1.0, width: 0.40, dicrotic: 0.28, irregularity: 0, sharpness: 1.0 },
  short: { rate: 70, amp: 0.6, width: 0.18, dicrotic: 0.12, irregularity: 0.05, sharpness: 0.8 },
  rapid: { rate: 98, amp: 1.0, width: 0.28, dicrotic: 0.25, irregularity: 0, sharpness: 1.1 },
  spinning: { rate: 95, amp: 0.9, width: 0.16, dicrotic: 0.15, irregularity: 0.12, sharpness: 1.3 },
  slow: { rate: 55, amp: 0.9, width: 0.40, dicrotic: 0.35, irregularity: 0, sharpness: 0.8 },
  knotted: { rate: 58, amp: 0.8, width: 0.35, dicrotic: 0.25, irregularity: 0.25, sharpness: 0.8 },
  hurried: { rate: 95, amp: 1.1, width: 0.26, dicrotic: 0.22, irregularity: 0.20, sharpness: 1.2 },
  intermittent: { rate: 65, amp: 0.7, width: 0.32, dicrotic: 0.20, irregularity: 0.30, sharpness: 0.7 },
  moderate: { rate: 70, amp: 0.95, width: 0.36, dicrotic: 0.28, irregularity: 0, sharpness: 0.9 },
  slippery: { rate: 80, amp: 1.1, width: 0.40, dicrotic: 0.45, irregularity: 0, sharpness: 0.85 },
  choppy: { rate: 65, amp: 0.6, width: 0.25, dicrotic: 0.10, irregularity: 0.15, sharpness: 1.2 },
  wiry: { rate: 78, amp: 1.15, width: 0.20, dicrotic: 0.10, irregularity: 0, sharpness: 1.6 },
  tight: { rate: 82, amp: 1.1, width: 0.20, dicrotic: 0.15, irregularity: 0, sharpness: 1.4 },
};

// All 20 diseases — every position uses ONLY the 28 pulse qualities
// No "normal" label — describe what is actually felt
const D = {
  healthy: {
    name: "Healthy",
    summary: "Stomach Qi present at superficial level (gentle, calm). Spirit present at middle level (soft outside, strong inside). Root present at deep level (clear, distinct). 4 beats per respiration.",
    left: {
      cun: {
        organ: "Heart", dominant: "normal",
        strength: "Full (shi mai) — pounding is felt against all 3 fingers, resilient at all levels, neither excessive nor deficient",
        depth: "Floating (fu mai) at superficial: gentle presence felt. Deep/Sinking (chen mai) at deep: clear and distinct. Both levels present equally.",
        width: "Long (chang mai) — perceptible across all 3 finger positions, fills the space evenly",
        speed: "4 beats per respiration, ~72bpm. Between Rapid (shu mai) and Slow (chi mai) — neither fast nor slow.",
        rhythm: "Moderate (huan mai) — perfectly balanced, no missed beats, no speed changes. Regular in quality.",
        shape: "Slippery (hua mai) — very slightly fluid and smooth under the fingers. Not Wiry, not Choppy. Rounded contour."
      },
      guan: {
        organ: "Liver", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable against all 3 fingers evenly at all depth levels",
        depth: "Felt equally at superficial, middle, and deep levels — neither Floating nor Sinking predominantly",
        width: "Long (chang mai) — fills space under all 3 fingers evenly",
        speed: "4 beats per respiration, ~72bpm. Between Rapid and Slow.",
        rhythm: "Moderate (huan mai) — balanced, regular, no interruptions",
        shape: "Slippery (hua mai) — slightly fluid and smooth, rounded pulse contour"
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — clearly palpable, resilient presence. Root is felt — there is clarity at this deep position.",
        depth: "Deep/Sinking (chen mai) — clear and distinct at the deep level. This clarity at Chi confirms Root is present.",
        width: "Long (chang mai) — perceptible, fills the finger position fully",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even, balanced",
        shape: "Slippery (hua mai) — slightly smooth and rounded"
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "normal",
        strength: "Full (shi mai) — resilient at all levels, gentle at superficial touch confirming Stomach Qi",
        depth: "Floating (fu mai) at superficial: gentle, calm presence (Stomach Qi). Equally felt at middle and deep.",
        width: "Long (chang mai) — fills all 3 finger positions",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — balanced and regular",
        shape: "Slippery (hua mai) — smooth, rounded contour"
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "moderate",
        strength: "Full (shi mai) — resilient, palpable. Spleen/Stomach position has healthy digestive tone.",
        depth: "Felt at all levels — superficial, middle, and deep equally",
        width: "Long (chang mai) — fills the space evenly",
        speed: "4 beats per respiration, ~70bpm",
        rhythm: "Moderate (huan mai) — perfectly balanced, sometimes considered slightly Slippery",
        shape: "Slippery (hua mai) — smooth, fluid, oily quality. Slightly more pronounced Slippery than other positions — reflects active digestive function."
      },
      chi: {
        organ: "Kidney Yang/Mingmen", dominant: "normal",
        strength: "Full (shi mai) — clearly present, resilient. Root confirmed at this position.",
        depth: "Deep/Sinking (chen mai) — clarity at the deep level. Kidney Yang pulse is distinct, confirming Root.",
        width: "Long (chang mai) — fills the position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — slightly smooth and rounded"
      },
    },
    validation: "DOCTOR CHECK: All 6 waveforms should appear very similar — resilient (Full/shi mai), balanced rhythm (Moderate/huan mai), slightly smooth shape (Slippery/hua mai), felt at all levels. Stomach Qi confirmed by gentle Floating quality at superficial. Root confirmed by clarity of Deep at both Chi positions."
  },

  liver_qi_stagnation: {
    name: "Liver Qi Stagnation",
    summary: "Liver overacting on Spleen (Wood on Earth). Wiry (xuan mai) at both Guan. Liver drawing on Kidney Yin creates Thin (xi mai) at Left Chi.",
    left: {
      cun: {
        organ: "Heart", dominant: "normal",
        strength: "Full (shi mai) — palpable against all 3 fingers, resilient at all levels. Heart force is maintained.",
        depth: "Felt equally at superficial, middle, and deep — neither predominantly Floating nor Sinking",
        width: "Long (chang mai) — fills space under fingers evenly, perceptible across positions",
        speed: "4 beats per respiration, ~72bpm. Between Rapid and Slow.",
        rhythm: "Moderate (huan mai) — even, balanced, no interruptions or speed changes",
        shape: "Slippery (hua mai) — smooth, fluid, rounded contour under the fingers"
      },
      guan: {
        organ: "Liver ★★", dominant: "wiry",
        strength: "Full (shi mai) — pounding forcefully, excess Qi constraint generating strong pulse",
        depth: "Felt EVENLY at all 3 levels — superficial, middle, deep. Key Wiry characteristic: does not fade at any level.",
        width: "Thin/Fine (xi mai) — narrowed by the taut tension, like a thin string pressed against the fingers",
        speed: "Rapid (shu mai) — ~78bpm, Qi constraint generating mild heat, pushing above 4 beats/respiration",
        rhythm: "Moderate (huan mai) — regular between beats, but with underlying tension throughout",
        shape: "Wiry (xuan mai) — taut, hard, like a guitar string pushing against the fingers. No fluidity. Sharp rise, narrow peak."
      },
      chi: {
        organ: "Kidney Yin", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacks the resilient fullness. Feels partially hollow on heavier palpation.",
        depth: "Deep/Sinking (chen mai) — tends toward the deeper level, slightly reduced at superficial",
        width: "Thin/Fine (xi mai) — distinct like a fine thread. Clear but attenuated. Liver is drawing on Kidney Yin reserves (Water feeds Wood).",
        speed: "Slow (chi mai) — ~68bpm, slightly below 4 beats/respiration, reduced metabolic drive at this position",
        rhythm: "Moderate (huan mai) — steady rhythm, no missed beats, regular quality",
        shape: "Slippery (hua mai) — smooth and fine, no rough edges or tension. Thread-like but clear."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Lung function maintained.",
        depth: "Floating (fu mai) at superficial: gentle presence. Equally felt at middle and deep.",
        width: "Long (chang mai) — fills space under fingers, perceptible across positions",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — balanced, regular",
        shape: "Slippery (hua mai) — smooth, rounded, fluid contour"
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "wiry",
        strength: "Full (shi mai) — forceful, Liver Qi overacting on Spleen pushes with excess",
        depth: "Felt evenly at all 3 levels — Wiry quality transmits through all depths",
        width: "Thin/Fine (xi mai) — narrowed by tension, taut quality reduces width",
        speed: "Rapid (shu mai) — ~78bpm, slightly accelerated from Liver constraint",
        rhythm: "Moderate (huan mai) — regular rhythm with underlying tension",
        shape: "Wiry (xuan mai) — taut like guitar string. Liver Qi overacting on Spleen (Wood insulting Earth). No fluidity."
      },
      chi: {
        organ: "Kidney Yang/Mingmen", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney Yang reserves are maintained.",
        depth: "Deep/Sinking (chen mai) — clear at the deep level, Root present",
        width: "Long (chang mai) — fills the position evenly",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even, balanced",
        shape: "Slippery (hua mai) — smooth, rounded. Kidney Yang position not under tension."
      },
    },
    validation: "DOCTOR CHECK: Both Guan show Wiry (xuan mai) — SHARP, NARROW peaks, minimal dicrotic notch, felt EVENLY at all depths. Left Chi shows Thin (xi mai) — reduced amplitude, fine thread. Compare Cun and Right Chi waveforms against Guan waveforms — the shape and width difference should be visible."
  },

  kidney_yang_deficiency: {
    name: "Kidney Yang Deficiency",
    summary: "Root Yang depletion. Both Chi positions show deep/weak qualities. Mingmen Fire failing causes systemic drops across all organs.",
    left: {
      cun: {
        organ: "Heart", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacks fullness. Feels partially vacant on heavier pressure. Heart Yang depends on Kidney Yang.",
        depth: "Deep/Sinking (chen mai) — pulse sinks toward deeper level, reduced presence at superficial. Yang deficiency pulling downward.",
        width: "Thin/Fine (xi mai) — distinct but fine like a thread. Reduced blood volume from Yang deficiency affecting Heart.",
        speed: "Slow (chi mai) — ~68bpm, below 4 beats/respiration. Cold from Yang deficiency slowing circulation.",
        rhythm: "Moderate (huan mai) — regular, steady rhythm maintained between beats",
        shape: "Slippery (hua mai) — smooth contour, no rough edges or tension. Fine and fluid."
      },
      guan: {
        organ: "Liver", dominant: "deep",
        strength: "Empty (xu mai) — soft, lacks resilience. Liver Yang unsupported by Kidney Yang below.",
        depth: "Deep/Sinking (chen mai) — only found with heavier palpation. Insufficient Kidney Yang to push Liver pulse upward.",
        width: "Thin/Fine (xi mai) — slightly narrowed, reduced volume",
        speed: "Slow (chi mai) — ~70bpm, slightly below standard rhythm",
        rhythm: "Moderate (huan mai) — even, regular between beats",
        shape: "Slippery (hua mai) — soft, smooth. No Wiry tension, no Choppy roughness."
      },
      chi: {
        organ: "Kidney Yin ★★", dominant: "frail",
        strength: "Empty (xu mai) — extremely soft, barely palpable. Profoundly deficient force.",
        depth: "Frail (ruo mai) — only detected at the deep level. Soft, weak, thin at depth. Cannot be felt at superficial or middle levels.",
        width: "Minute (wei mai) — approaching barely perceptible. Finer than Thin, lacks clarity.",
        speed: "Slow (chi mai) — ~64bpm, well below 4 beats/respiration",
        rhythm: "Moderate (huan mai) — attempts regularity but Yang insufficient to sustain consistent force",
        shape: "Slippery (hua mai) — soft, smooth thread at depth. No tension, no roughness."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Last organ to be affected by Kidney Yang depletion.",
        depth: "Floating (fu mai) at superficial: gentle presence. Felt at middle and deep as well.",
        width: "Long (chang mai) — fills space under fingers",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — balanced, regular",
        shape: "Slippery (hua mai) — smooth, rounded contour"
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "thin",
        strength: "Empty (xu mai) — soft, reduced resilience. Mingmen Fire not warming the Spleen.",
        depth: "Deep/Sinking (chen mai) — sinking toward deeper level",
        width: "Thin/Fine (xi mai) — narrowed, reduced. Spleen not receiving warmth from Mingmen.",
        speed: "Slow (chi mai) — ~68bpm, slightly slow",
        rhythm: "Moderate (huan mai) — regular rhythm maintained",
        shape: "Slippery (hua mai) — smooth, soft quality"
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "deep",
        strength: "Empty (xu mai) — primary Yang source depleted. Soft, lacks any forceful quality.",
        depth: "Deep/Sinking (chen mai) — only found with heavier pressure. Primary diagnostic site for Kidney Yang.",
        width: "Thin/Fine (xi mai) — thin and weak, reduced presence",
        speed: "Slow (chi mai) — ~70bpm, metabolism slowed",
        rhythm: "Moderate (huan mai) — steady between beats",
        shape: "Slippery (hua mai) — soft, smooth. No force, no tension, no roughness."
      },
    },
    validation: "DOCTOR CHECK: Both Chi should show lowest amplitude (Frail/Deep). Pulse at most positions should trend toward Deep/Sinking and Empty. Right Cun (Lung) should show the most resilient waveform — visibly stronger than all others."
  },

  wind_heat_invasion: {
    name: "Wind-Heat Invasion (EPF)",
    summary: "Acute exterior pattern. Wei Qi rises: Floating (fu mai) at Cun. Heat pathogen: Rapid (shu mai) at Guan. Chi positions show undisturbed qualities — pathogen at exterior only.",
    left: {
      cun: {
        organ: "Heart ★", dominant: "floating",
        strength: "Full (shi mai) — Wei Qi rising to fight pathogen creates forceful presence at surface",
        depth: "Floating (fu mai) — buoyant, easily felt with very light palpation. Obscured when pressing harder. Pulse lives at the surface.",
        width: "Big/Wide (da mai) — slightly broader than typical, Wei Qi expanding outward",
        speed: "Rapid (shu mai) — >90bpm, more than 5 beats/respiration. Heat accelerating circulation.",
        rhythm: "Moderate (huan mai) — regular between beats, no missed beats",
        shape: "Slippery (hua mai) — smooth, rounded. No Wiry tension."
      },
      guan: {
        organ: "Liver", dominant: "rapid",
        strength: "Full (shi mai) — maintained force, body actively fighting the pathogen",
        depth: "Floating (fu mai) — tending superficial, pathogen pulling pulse toward the surface",
        width: "Long (chang mai) — fills the position, perceptible across fingers",
        speed: "Rapid (shu mai) — >90bpm, systemic heat acceleration. More than 5 beats/respiration.",
        rhythm: "Moderate (huan mai) — regular, even spacing between beats",
        shape: "Slippery (hua mai) — smooth, slightly tense but not Wiry"
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Force maintained at this level.",
        depth: "Deep/Sinking (chen mai) — clear presence at deep level. Root intact.",
        width: "Long (chang mai) — fills space evenly",
        speed: "4 beats per respiration, ~72bpm. Pathogen has not penetrated to this level.",
        rhythm: "Moderate (huan mai) — steady, balanced",
        shape: "Slippery (hua mai) — smooth, fluid, rounded"
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "floating",
        strength: "Full (shi mai) — Lung governs Wei Qi. Defensive Qi rising forcefully to the surface.",
        depth: "Floating (fu mai) — buoyant at lightest touch. Lung is the first line of defense — pulse rises to meet pathogen.",
        width: "Big/Wide (da mai) — expanded, Wei Qi pushing outward",
        speed: "Rapid (shu mai) — >90bpm, heat driving circulation",
        rhythm: "Moderate (huan mai) — regular, no interruptions",
        shape: "Slippery (hua mai) — smooth, rounded, fluid"
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "rapid",
        strength: "Full (shi mai) — active, forceful. Body's digestive system involved in immune response.",
        depth: "Floating (fu mai) — tending superficial in this acute phase",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — >90bpm, heat is systemic",
        rhythm: "Moderate (huan mai) — regular rhythm",
        shape: "Slippery (hua mai) — smooth, slightly more fluid than usual"
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient at all levels. Kidney Yang reserves undisturbed.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root intact. Pathogen has NOT penetrated interior.",
        width: "Long (chang mai) — fills position fully",
        speed: "4 beats per respiration, ~72bpm. Deep level unaccelerated.",
        rhythm: "Moderate (huan mai) — steady, even, balanced",
        shape: "Slippery (hua mai) — smooth, rounded. Undisturbed quality."
      },
    },
    validation: "DOCTOR CHECK: Cun Floating — CLEAR at light pressure, FADES with heavier. Rate ~95-100bpm at Cun/Guan. CRITICAL: Both Chi waveforms should look distinctly different — slower rate, deeper presence, undisturbed quality."
  },

  wind_cold_invasion: {
    name: "Wind-Cold Invasion (EPF)",
    summary: "Acute exterior Cold. Floating (fu mai) at Cun same as Wind-Heat. But Tight (jin mai) at Guan instead of Rapid — Cold contracts channels. Key differentiator.",
    left: {
      cun: {
        organ: "Heart", dominant: "floating",
        strength: "Full (shi mai) — resilient, Wei Qi mobilizing at surface",
        depth: "Floating (fu mai) — buoyant at light touch, defensive Qi at surface",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~74bpm. Not truly Rapid — Cold does NOT generate heat speed.",
        rhythm: "Moderate (huan mai) — regular between beats",
        shape: "Slippery (hua mai) — smooth, rounded"
      },
      guan: {
        organ: "Liver ★", dominant: "tight",
        strength: "Full (shi mai) — forceful, Cold contracting channels creates strong tension",
        depth: "Felt evenly at all levels — Tight quality transmits through superficial, middle, deep",
        width: "Short (duan mai) — Cold contracting the width, doesn't fill all 3 finger positions fully",
        speed: "4 beats per respiration, ~82bpm apparent — Tight (jin mai) vibration makes it SEEM faster than actual rate",
        rhythm: "Moderate (huan mai) — regular between beats, but tense throughout",
        shape: "Tight (jin mai) — strong, bouncing from side to side like taut rope. Fuller and more elastic than Wiry. Vibrates."
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, clearly palpable. Interior undisturbed.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root maintained.",
        width: "Long (chang mai) — fills position evenly",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. No tension felt."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "floating",
        strength: "Full (shi mai) — Lung Wei Qi at surface, resilient",
        depth: "Floating (fu mai) — buoyant, Lung defending at superficial level",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~74bpm. Not Rapid.",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fluid"
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "tight",
        strength: "Full (shi mai) — Cold-tension creating forceful quality",
        depth: "Felt at all levels evenly — Tight transmits through",
        width: "Short (duan mai) — contracted by Cold",
        speed: "~82bpm apparent — Tight vibration mimics increased speed",
        rhythm: "Moderate (huan mai) — regular but with tension",
        shape: "Tight (jin mai) — taut rope bouncing side-to-side. Cold contracting middle Jiao channels."
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney Yang intact.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root present.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Interior undisturbed."
      },
    },
    validation: "DOCTOR CHECK: Compare vs Wind-Heat — Guan shows Tight (jin mai, bouncing elastic) NOT Rapid. Actual bpm LOWER (~82 vs ~98). Tight has HIGHER AMPLITUDE and Short width vs Rapid's Long width. Cun Floating identical to Wind-Heat."
  },

  spleen_qi_deficiency: {
    name: "Spleen Qi Deficiency",
    summary: "Spleen = factory of Qi & Blood. Right Guan (Spleen) shows Frail (ruo mai). Mingmen (Right Chi) showing Deep. Downstream organs show Thin (xi mai) from reduced production.",
    left: {
      cun: {
        organ: "Heart", dominant: "normal",
        strength: "Full (shi mai) — resilient, maintained. Heart is relatively preserved as last organ affected upstream.",
        depth: "Felt at superficial, middle, and deep — balanced across levels",
        width: "Long (chang mai) — fills the position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — balanced, regular",
        shape: "Slippery (hua mai) — smooth, rounded contour"
      },
      guan: {
        organ: "Liver", dominant: "thin",
        strength: "Empty (xu mai) — soft, reduced resilience. Systemic depletion from Spleen failure reaching Liver.",
        depth: "Deep/Sinking (chen mai) — tending deeper, reduced superficial presence",
        width: "Thin/Fine (xi mai) — fine thread. Spleen not producing enough Blood/Qi to nourish Liver.",
        speed: "Slow (chi mai) — ~68bpm, below 4 beats/respiration",
        rhythm: "Moderate (huan mai) — regular between beats",
        shape: "Slippery (hua mai) — smooth, fine, no roughness"
      },
      chi: {
        organ: "Kidney Yin", dominant: "thin",
        strength: "Empty (xu mai) — soft, reduced. Spleen not replenishing Kidney Yin reserves.",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Thin/Fine (xi mai) — fine thread. Spleen not producing sufficient Blood to nourish Kidney.",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — steady",
        shape: "Slippery (hua mai) — smooth, fine"
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacking fullness. Lung depends on Spleen sending clear Qi upward.",
        depth: "Deep/Sinking (chen mai) — pulse sinking, weak Qi can't push to surface",
        width: "Thin/Fine (xi mai) — fine, thread-like. Insufficient Qi from Spleen below.",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fine, soft"
      },
      guan: {
        organ: "Spleen/Stomach ★★", dominant: "frail",
        strength: "Empty (xu mai) — profoundly soft. Feels like partially filled water balloon. The factory is depleted.",
        depth: "Frail (ruo mai) — only detected at the deep level. Soft, weak, thin at depth. Absent at superficial and middle.",
        width: "Minute (wei mai) — approaching barely perceptible. Finer than Thin, lacking Thin's clarity.",
        speed: "Slow (chi mai) — ~64bpm, well below standard rhythm. Spleen too weak to drive circulation.",
        rhythm: "Moderate (huan mai) — attempts regularity but force is inconsistent",
        shape: "Slippery (hua mai) — soft, smooth. No tension, no roughness. Extremely attenuated."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★", dominant: "deep",
        strength: "Empty (xu mai) — soft, lacking fullness. Mingmen Fire insufficient to warm Spleen.",
        depth: "Deep/Sinking (chen mai) — only found with heavier palpation. Kidney Yang pulse has sunk.",
        width: "Thin/Fine (xi mai) — narrowed, reduced",
        speed: "Slow (chi mai) — ~70bpm",
        rhythm: "Moderate (huan mai) — steady between beats",
        shape: "Slippery (hua mai) — smooth, soft, deep quality"
      },
    },
    validation: "DOCTOR CHECK: Right Guan (Frail/ruo mai) should show WEAKEST, most attenuated waveform. Left Cun should show the most resilient waveform — visibly different from all others. No Full (shi mai) or Flooding (hong mai) qualities anywhere except possibly Left Cun."
  },

  blood_stasis: {
    name: "Blood Stasis",
    summary: "Blood congealed: Choppy (se mai) at Guan. Qi stagnation accompanies: Wiry (xuan mai) at Cun. Underlying deficiency: Thin (xi mai) at Left Chi.",
    left: {
      cun: {
        organ: "Heart", dominant: "wiry",
        strength: "Full (shi mai) — forceful, Qi pushing against stuck Blood creates excess pressure",
        depth: "Felt evenly at all levels — Wiry transmits through superficial, middle, deep equally",
        width: "Thin/Fine (xi mai) — narrowed by the taut tension",
        speed: "4 beats per respiration, ~78bpm",
        rhythm: "Moderate (huan mai) — regular between beats, but with underlying tension throughout",
        shape: "Wiry (xuan mai) — taut, hard like guitar string. No fluidity. Qi stagnation driving Blood stasis."
      },
      guan: {
        organ: "Liver ★★", dominant: "choppy",
        strength: "Empty (xu mai) — fluctuating, inconsistent force. Some beats stronger, some weaker.",
        depth: "Deep/Sinking (chen mai) — tending deeper, sluggish Blood not pushing to surface",
        width: "Long (chang mai) — fills position but with uneven presence",
        speed: "Slow (chi mai) — ~65bpm, Blood flow sluggish, below 4 beats/respiration",
        rhythm: "Moderate (huan mai) — attempts regularity but irregular in both timing AND strength between beats",
        shape: "Choppy (se mai) — uneven, rough, jagged edges. THE hallmark of Blood Stasis. Irregular amplitude beat-to-beat."
      },
      chi: {
        organ: "Kidney Yin", dominant: "thin",
        strength: "Empty (xu mai) — soft, reduced resilience. Underlying deficiency allowed stasis to develop.",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Thin/Fine (xi mai) — fine thread. Deficiency that preceded the stasis.",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — steady, regular. Smoother than Guan position.",
        shape: "Slippery (hua mai) — smooth, fine. Clear contrast with the rough Choppy at Guan."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "wiry",
        strength: "Full (shi mai) — Qi stagnation creating forceful quality in chest",
        depth: "Felt at all levels evenly — Wiry characteristic",
        width: "Thin/Fine (xi mai) — narrowed by tension",
        speed: "4 beats per respiration, ~78bpm",
        rhythm: "Moderate (huan mai) — regular with tension",
        shape: "Wiry (xuan mai) — taut, hard. Qi stagnation in chest/Lung channel."
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "choppy",
        strength: "Empty (xu mai) — variable force, inconsistent beat-to-beat",
        depth: "Deep/Sinking (chen mai) — tending deep, sluggish",
        width: "Long (chang mai) — fills position unevenly",
        speed: "Slow (chi mai) — ~65bpm, sluggish flow",
        rhythm: "Moderate (huan mai) — irregular timing and force between beats",
        shape: "Choppy (se mai) — rough, hesitant. Blood not flowing smoothly through middle Jiao."
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Kidney Yang reserves maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level, Root present",
        width: "Long (chang mai) — fills position evenly",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Kidney position not involved in stasis."
      },
    },
    validation: "DOCTOR CHECK: Guan waveforms must show VISIBLY UNEVEN amplitude beat-to-beat (Choppy/se mai). Compare Choppy Guan (jagged, rough) vs Wiry Cun (sharp but regular). Left Chi Thin should show lower amplitude but SMOOTH contour — clear contrast with rough Guan."
  },

  phlegm_dampness: {
    name: "Phlegm-Dampness",
    summary: "Dampness accumulating. Slippery (hua mai) at Left Cun, Left Guan, Right Cun — smooth, rolling, oily. Spleen overwhelmed: Soggy (ru mai) at Right Guan. Deep (chen mai) at Right Chi.",
    left: {
      cun: {
        organ: "Heart/Chest", dominant: "slippery",
        strength: "Full (shi mai) — fluid excess creates palpable fullness, pressing against the fingers",
        depth: "Felt at middle level predominantly — neither deeply sinking nor floating",
        width: "Big/Wide (da mai) — broader than typical, expanded by fluid accumulation in upper Jiao",
        speed: "4 beats per respiration, ~80bpm. Slightly above standard but below true Rapid.",
        rhythm: "Moderate (huan mai) — regular, even between beats",
        shape: "Slippery (hua mai) — very fluid, slides under the finger. Smooth and oily. Ball-like rolling quality. Phlegm in chest."
      },
      guan: {
        organ: "Liver", dominant: "slippery",
        strength: "Full (shi mai) — fluid fullness in middle Jiao pressing on Liver channel",
        depth: "Felt at middle level — balanced between levels",
        width: "Big/Wide (da mai) — slightly expanded, dampness broadening",
        speed: "4 beats per respiration, ~80bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, oily, rolling. Dampness obstructing Liver Qi flow."
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney Yin reserves present.",
        depth: "Deep/Sinking (chen mai) — clear at deep level",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Kidney Yin position not primarily involved."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "slippery",
        strength: "Full (shi mai) — Phlegm accumulating in Lung creates palpable fullness",
        depth: "Felt at middle level — fluid keeping pulse mid-range",
        width: "Big/Wide (da mai) — expanded, Lung water passages congested with Phlegm",
        speed: "4 beats per respiration, ~80bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — very smooth, oily, pronounced rolling quality. Phlegm in Lung."
      },
      guan: {
        organ: "Spleen/Stomach ★★", dominant: "soggy",
        strength: "Soggy (ru mai) — extremely soft, combination of thin+empty+floating. Slightest increase in pressure makes it disappear entirely.",
        depth: "Floating (fu mai) — perceptible ONLY at the most superficial level. Vanishes completely with any additional pressure.",
        width: "Thin/Fine (xi mai) — weak, thin. Spleen overwhelmed, failing to transform dampness.",
        speed: "Slow (chi mai) — ~68bpm, Spleen too weak to drive standard rhythm",
        rhythm: "Moderate (huan mai) — regular but force barely perceptible",
        shape: "Slippery (hua mai) — soft, smooth. No rough edges but extremely attenuated."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★", dominant: "deep",
        strength: "Empty (xu mai) — soft, lacking fullness. Yang deficiency underlying water metabolism failure.",
        depth: "Deep/Sinking (chen mai) — only found with heavier pressure. Kidney Yang has sunk.",
        width: "Thin/Fine (xi mai) — narrowed, reduced",
        speed: "Slow (chi mai) — ~70bpm",
        rhythm: "Moderate (huan mai) — steady between beats",
        shape: "Slippery (hua mai) — smooth, soft, deep quality"
      },
    },
    validation: "DOCTOR CHECK: Slippery channels (Left Cun, Left Guan, Right Cun) should show ROUNDED, SMOOTH waveforms with PROMINENT DICROTIC NOTCH (rolling quality). Right Guan (Soggy/ru mai) should look MARKEDLY DIFFERENT — very low amplitude, detectable only at lightest pressure."
  },

  excess_heat: {
    name: "Excess Heat / High Fever",
    summary: "Extreme heat. Flooding (hong mai) surging at Cun. Full (shi mai) at Right Guan. Rapid (shu mai) throughout. Right Chi shows undisturbed qualities — confirms EXCESS not Yin deficiency.",
    left: {
      cun: {
        organ: "Heart ★★", dominant: "flooding",
        strength: "Full (shi mai) — maximum force, pounding against all 3 fingers at all levels",
        depth: "Felt forcefully at ALL levels — superficial, middle, deep equally with great force",
        width: "Flooding (hong mai) — very wide, surging. Broadest width pulse — wave arrives with great force.",
        speed: "Rapid (shu mai) — 85+bpm, well above 5 beats/respiration. Heat driving circulation to maximum.",
        rhythm: "Moderate (huan mai) — regular between beats despite speed",
        shape: "Slippery (hua mai) — dramatic surging wave shape. Sharp powerful rise, slower gradual fall — like ocean wave crashing then receding."
      },
      guan: {
        organ: "Liver", dominant: "rapid",
        strength: "Full (shi mai) — forceful excess, body fighting heat with vigor",
        depth: "Felt at all levels — heat pushing pulse outward at every depth",
        width: "Big/Wide (da mai) — expanded by heat, broader than standard",
        speed: "Rapid (shu mai) — ~98bpm, systemic heat acceleration",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, forceful, fluid"
      },
      chi: {
        organ: "Kidney Yin", dominant: "rapid",
        strength: "Full (shi mai) — heat penetrating to lower Jiao, force maintained",
        depth: "Felt at middle level — heat keeping pulse accessible",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — ~98bpm, heat reaching lower Jiao",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fluid. Kidney Yin still intact despite heat."
      },
    },
    right: {
      cun: {
        organ: "Lung ★★", dominant: "flooding",
        strength: "Full (shi mai) — maximum excess force, pounding at all levels",
        depth: "Felt forcefully at ALL levels — powerful presence everywhere",
        width: "Flooding (hong mai) — maximum width, surging wave. Broadest possible pulse.",
        speed: "Rapid (shu mai) — 85+bpm",
        rhythm: "Moderate (huan mai) — regular despite extreme speed",
        shape: "Slippery (hua mai) — surging. Powerful wave arrival, gradual recession."
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "full",
        strength: "Full (shi mai) — big, strong, pounding against all 3 fingers at all depth levels. Maximum excess.",
        depth: "Felt forcefully at ALL levels — superficial through deep, equally strong everywhere",
        width: "Big/Wide (da mai) — wide, forceful, expanded",
        speed: "Rapid (shu mai) — 78+bpm, accelerated",
        rhythm: "Moderate (huan mai) — regular, strong",
        shape: "Slippery (hua mai) — smooth, forceful, powerful"
      },
      chi: {
        organ: "Kidney Yang ★", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Kidney Yang reserves maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Felt at middle and superficial equally.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. Kidney position NOT accelerated — this is the key differential.",
        rhythm: "Moderate (huan mai) — steady, balanced, even",
        shape: "Slippery (hua mai) — smooth, rounded. Calm quality. Contrasts sharply with the surging quality at other positions."
      },
    },
    validation: "DOCTOR CHECK: Flooding at Cun = HIGHEST AMPLITUDE of any disease pattern. Surging wave shape — fast rise, slow fall. CRITICAL: Right Chi should be conspicuously CALM and SLOWER compared to all other positions. If Right Chi shows Thin/Empty/Frail → this is Yin Deficiency Heat, not Excess Heat."
  },

  cold_stagnation: {
    name: "Cold Stagnation / Pain",
    summary: "Cold constricting: Tight (jin mai) at Guan. Deep cold lodged: Confined (lao mai) at Right Chi — Yang trapped but strong. Slow (chi mai) rate. Deep (chen mai) at Left Chi.",
    left: {
      cun: {
        organ: "Heart", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Heart not directly constricted by Cold yet.",
        depth: "Felt at superficial, middle, and deep — balanced",
        width: "Long (chang mai) — fills position",
        speed: "Slow (chi mai) — ~70bpm, Cold beginning to slow overall metabolism",
        rhythm: "Moderate (huan mai) — regular, even",
        shape: "Slippery (hua mai) — smooth, rounded. No tension at this position."
      },
      guan: {
        organ: "Liver ★", dominant: "tight",
        strength: "Full (shi mai) — forceful, Cold constricting channels creates strong tension and pressure",
        depth: "Felt evenly at all levels — Tight quality transmits through all depths",
        width: "Short (duan mai) — Cold contracting channel width, doesn't fill all 3 finger positions",
        speed: "4 beats per respiration, ~82bpm apparent — Tight (jin mai) vibration creates sensation of speed",
        rhythm: "Moderate (huan mai) — regular between beats but with constant tension",
        shape: "Tight (jin mai) — strong, bouncing side-to-side like taut rope. Fuller and more elastic than Wiry. Vibrates. Cold constricting channels."
      },
      chi: {
        organ: "Kidney Yin", dominant: "deep",
        strength: "Full (shi mai) — maintained force at this level, though shifted deep",
        depth: "Deep/Sinking (chen mai) — Cold pushing pulse downward. Only found with heavier pressure.",
        width: "Long (chang mai) — fills position at depth",
        speed: "Slow (chi mai) — ~70bpm, Cold slowing",
        rhythm: "Moderate (huan mai) — steady",
        shape: "Slippery (hua mai) — smooth, stable at depth. No roughness or tension at this position."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "slow",
        strength: "Full (shi mai) — resilient, force maintained",
        depth: "Felt at middle level — balanced",
        width: "Long (chang mai) — fills position",
        speed: "Slow (chi mai) — <60bpm. Less than 4 beats/respiration. Cold has slowed the entire metabolic rate.",
        rhythm: "Moderate (huan mai) — regular, steady",
        shape: "Slippery (hua mai) — smooth, rounded. Slow but smooth."
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "tight",
        strength: "Full (shi mai) — Cold-tension creating forceful quality",
        depth: "Felt at all levels — Tight transmits through",
        width: "Short (duan mai) — contracted by Cold",
        speed: "4 beats per respiration apparent — Tight vibration",
        rhythm: "Moderate (huan mai) — regular with tension",
        shape: "Tight (jin mai) — taut rope, bouncing, vibrating. Cold-pain in middle Jiao."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "confined",
        strength: "Full (shi mai) — FORCEFUL despite being very deep. Yang trapped under Cold but still powerful.",
        depth: "Confined/Prison (lao mai) — very deep, form of Hidden but with FORCE. Only at the deepest level.",
        width: "Long (chang mai) — extends beyond the finger position, perceptible past boundaries",
        speed: "Slow (chi mai) — below standard rate",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Wiry (xuan mai) — Confined includes wiry component. Taut, hard, strong at depth. Yang is IMPRISONED by Cold but not extinguished."
      },
    },
    validation: "DOCTOR CHECK: Rate Slow (chi mai) ~55bpm. Tight at Guan = ELASTIC BOUNCING quality. CRITICAL: Confined at Right Chi must show STRONG AMPLITUDE despite deep location (Full + Confined + Wiry). If deep AND weak (Empty/Frail) → this is Yang Deficiency, not Cold Stagnation."
  },

  yang_collapse: {
    name: "Yang Collapse (Critical)",
    summary: "EMERGENCY. Minute (wei mai) at Cun. Hidden (fu mai) at Guan. Frail (ruo mai) at Chi. Every position shows Empty (xu mai) strength. All Deep or deeper. Pulse approaching cessation.",
    left: {
      cun: {
        organ: "Heart ★", dominant: "minute",
        strength: "Empty (xu mai) — barely palpable. Soft, vacant, force almost absent.",
        depth: "Deep/Sinking (chen mai) — no Yang to hold pulse at surface. Has sunk completely.",
        width: "Minute (wei mai) — finer than Thin, lacks Thin's clarity. Barely perceptible, seems to disappear.",
        speed: "Slow (chi mai) — ~62bpm, irregular. Metabolism collapsing.",
        rhythm: "Moderate (huan mai) — attempts regularity but Yang insufficient. Beats occasionally flutter.",
        shape: "Slippery (hua mai) — smooth but almost imperceptible. Like a ghost of a pulse."
      },
      guan: {
        organ: "Liver ★", dominant: "hidden",
        strength: "Empty (xu mai) — profoundly depleted. Almost no force detected.",
        depth: "Hidden (fu mai) — below the bone. Requires maximum pressure to detect. Deeper than Deep/Sinking.",
        width: "Minute (wei mai) — approaching invisible. Barely a thread.",
        speed: "Slow (chi mai) — ~68bpm, slowing",
        rhythm: "Moderate (huan mai) — irregular, inconsistent spacing. Yang failing.",
        shape: "Slippery (hua mai) — ill-defined, ghost-like. Boundaries of the pulse indistinct."
      },
      chi: {
        organ: "Kidney Yin ★", dominant: "frail",
        strength: "Empty (xu mai) — extremely soft. Profoundly deficient.",
        depth: "Frail (ruo mai) — only at the deep level. Soft, weak, thin at depth. Absent above.",
        width: "Minute (wei mai) — barely perceptible thread",
        speed: "Slow (chi mai) — ~64bpm",
        rhythm: "Moderate (huan mai) — attempts rhythm but inconsistent. Yin also failing.",
        shape: "Slippery (hua mai) — soft, smooth at depth. Extremely attenuated."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "minute",
        strength: "Empty (xu mai) — barely palpable. Force almost absent.",
        depth: "Deep/Sinking (chen mai) — sunk completely. No superficial presence.",
        width: "Minute (wei mai) — barely there. Fading in and out.",
        speed: "Slow (chi mai) — ~62bpm",
        rhythm: "Moderate (huan mai) — irregular, fading",
        shape: "Slippery (hua mai) — ghost-like, indistinct"
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "frail",
        strength: "Empty (xu mai) — collapsed. Spleen Yang extinguished.",
        depth: "Frail (ruo mai) — only at deep level. Absent at superficial and middle.",
        width: "Minute (wei mai) — thread-like, barely detectable",
        speed: "Slow (chi mai) — ~64bpm",
        rhythm: "Moderate (huan mai) — irregular, force inconsistent",
        shape: "Slippery (hua mai) — soft, smooth, extremely weak"
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "hidden",
        strength: "Empty (xu mai) — Yang source extinguished. Almost no force.",
        depth: "Hidden (fu mai) — maximum depth, below the bone. The deepest possible pulse location.",
        width: "Minute (wei mai) — barely perceptible",
        speed: "Slow (chi mai) — ~68bpm, approaching cessation",
        rhythm: "Moderate (huan mai) — irregular, failing",
        shape: "Slippery (hua mai) — Mingmen fire going out. Ghost-like quality. Pulse boundaries dissolving."
      },
    },
    validation: "DOCTOR CHECK: ALL 6 waveforms should show VERY LOW AMPLITUDE — lowest of any pattern. ALL positions show Empty (xu mai) strength. Minute (wei mai) channels barely distinguishable from noise. Hidden (fu mai) channels detectable ONLY at maximum pressure. No Full or Flooding qualities anywhere."
  },

  heart_blood_deficiency: {
    name: "Heart Blood Deficiency",
    summary: "Heart needs Blood for Shen. Thin (xi mai) at Left Cun. Choppy (se mai) at Left Guan — Liver Blood depleted. Deep (chen mai) at Right Chi — root Jing depletion.",
    left: {
      cun: {
        organ: "Heart ★★", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacks fullness. Heart Blood insufficient to generate force.",
        depth: "Deep/Sinking (chen mai) — tending deep, insufficient Blood to push to surface",
        width: "Thin/Fine (xi mai) — distinct like a fine thread. Clear but attenuated. Insufficient Heart Blood.",
        speed: "Slow (chi mai) — ~68bpm, slightly below standard. Insufficient Blood to maintain rate.",
        rhythm: "Moderate (huan mai) — regular between beats",
        shape: "Slippery (hua mai) — smooth, fine thread. Clear contour but reduced."
      },
      guan: {
        organ: "Liver ★", dominant: "choppy",
        strength: "Empty (xu mai) — fluctuating force. Some beats stronger, some weaker. Inconsistent.",
        depth: "Deep/Sinking (chen mai) — tending deep, sluggish Blood movement",
        width: "Thin/Fine (xi mai) — thin and choppy together = Blood/Jing DEFICIENCY (not stasis)",
        speed: "Slow (chi mai) — ~65bpm, sluggish from deficiency",
        rhythm: "Moderate (huan mai) — irregular in both timing AND strength between beats",
        shape: "Choppy (se mai) — rough, uneven, jagged edges. Irregular amplitude beat-to-beat. Liver Blood stores depleted."
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney Yin relatively preserved.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root present.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Kidney Yin reserves maintained."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "thin",
        strength: "Empty (xu mai) — soft, reduced. Lung shares upper Jiao with Heart, affected by Blood deficiency.",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Thin/Fine (xi mai) — fine, thread-like",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fine"
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "normal",
        strength: "Full (shi mai) — resilient. Spleen function maintained.",
        depth: "Felt at all levels — balanced",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~70bpm",
        rhythm: "Moderate (huan mai) — regular, balanced",
        shape: "Slippery (hua mai) — smooth, slightly rolling. Spleen position functioning."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★", dominant: "deep",
        strength: "Empty (xu mai) — soft, reduced. Root Jing depletion affecting Blood production.",
        depth: "Deep/Sinking (chen mai) — only with heavier palpation. Root cause showing at depth.",
        width: "Thin/Fine (xi mai) — narrowed",
        speed: "Slow (chi mai) — ~70bpm",
        rhythm: "Moderate (huan mai) — steady",
        shape: "Slippery (hua mai) — smooth, soft at depth"
      },
    },
    validation: "DOCTOR CHECK: Left Cun (Heart) Thin — clear fine thread. Left Guan Choppy — UNEVEN morphology, irregular beat-to-beat amplitude. DIFFERENTIATOR vs Blood Stasis: here Choppy comes with Empty strength (deficiency), Blood Stasis Choppy comes with more variable but stronger force."
  },

  heart_qi_irregularity: {
    name: "Heart Qi Irregularity",
    summary: "Rhythm category PRIMARY. Knotted (jie mai) at Left Cun: Slow + irregular missed beats. Intermittent (dai mai) at Right Cun: more missed beats, regular pattern between pauses — graver sign.",
    left: {
      cun: {
        organ: "Heart ★★", dominant: "knotted",
        strength: "Full (shi mai) — between beats, force is maintained. The issue is rhythm, not strength.",
        depth: "Felt at middle level — balanced between depths",
        width: "Long (chang mai) — fills position between beats",
        speed: "Slow (chi mai) — ~58bpm with MISSED BEATS. Less than 4 beats/respiration, and some beats absent entirely.",
        rhythm: "Knotted (jie mai) — slow pulse that misses beats IRREGULARLY. Skipped beats occur unpredictably. Heart not ruling Blood properly.",
        shape: "Slippery (hua mai) — smooth contour between beats. Beats that DO occur have normal shape. But beats DROP OUT."
      },
      guan: {
        organ: "Liver", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Liver function maintained.",
        depth: "Felt at superficial, middle, and deep — balanced",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. Localizes rhythm problem to Heart — Liver rate is standard.",
        rhythm: "Moderate (huan mai) — regular, steady, no missed beats. Confirms Heart-specific issue.",
        shape: "Slippery (hua mai) — smooth, rounded"
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient. Kidney Yin maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even. Kidney rhythm undisturbed.",
        shape: "Slippery (hua mai) — smooth, rounded"
      },
    },
    right: {
      cun: {
        organ: "Lung ★★", dominant: "intermittent",
        strength: "Empty (xu mai) — slightly weakened between pauses. Force diminishing.",
        depth: "Felt at middle level — balanced",
        width: "Long (chang mai) — fills position between pauses",
        speed: "Slow (chi mai) — ~65bpm with MORE missed beats than Left Cun",
        rhythm: "Intermittent (dai mai) — misses more beats than Knotted, but regular rhythm BETWEEN pauses. GRAVER sign than Knotted. Indicates deeper Heart-Kidney disconnection.",
        shape: "Slippery (hua mai) — smooth morphology between pauses. Individual beats are well-formed but pauses are frequent."
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "normal",
        strength: "Full (shi mai) — resilient. Spleen function maintained.",
        depth: "Felt at all levels — balanced",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~70bpm",
        rhythm: "Moderate (huan mai) — regular, steady. Spleen rhythm undisturbed.",
        shape: "Slippery (hua mai) — smooth, rounded"
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★", dominant: "deep",
        strength: "Empty (xu mai) — soft, reduced. Heart-Kidney axis disconnected. Kidney Yang not supporting Heart.",
        depth: "Deep/Sinking (chen mai) — sunk, only with heavier pressure",
        width: "Thin/Fine (xi mai) — narrowed, reduced presence",
        speed: "Slow (chi mai) — ~68bpm, slightly slow",
        rhythm: "Moderate (huan mai) — steady between beats",
        shape: "Slippery (hua mai) — smooth, soft at depth"
      },
    },
    validation: "DOCTOR CHECK: Left Cun (Knotted) must show CLEARLY MISSED BEATS — visible gaps at IRREGULAR intervals. Right Cun (Intermittent) should show MORE missed beats but with REGULAR spacing between pauses. BOTH Guan positions should show REGULAR rhythm — confirms Heart-specific rhythm disturbance."
  },

  heat_agitating_blood: {
    name: "Heat Agitating Blood",
    summary: "Hurried (cue mai) at Cun: Rapid + irregular missed beats (heat = fast+skipped). Flooding (hong mai) at Right Guan. Opposite of Knotted (cold = slow+skipped).",
    left: {
      cun: {
        organ: "Heart ★★", dominant: "hurried",
        strength: "Full (shi mai) — forceful, heat driving strong beats. Between skipped beats, force is high.",
        depth: "Floating (fu mai) — heat pushing pulse toward the surface",
        width: "Long (chang mai) — fills position between skipped beats",
        speed: "Rapid (shu mai) — ~95bpm WITH missed beats. More than 5 beats/respiration when beating.",
        rhythm: "Hurried (cue mai) — FAST pulse that SKIPS beats IRREGULARLY. Heat overstimulating Heart — misfires from overstimulation. Between skips, rhythm is fast.",
        shape: "Slippery (hua mai) — forceful, smooth between beats. Individual beats strong and well-formed, then sudden gap."
      },
      guan: {
        organ: "Liver", dominant: "rapid",
        strength: "Full (shi mai) — forceful, systemic heat driving excess",
        depth: "Floating (fu mai) — heat pushing outward",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — ~98bpm, systemic heat acceleration. More than 5 beats/respiration.",
        rhythm: "Moderate (huan mai) — regular, no missed beats at this position",
        shape: "Slippery (hua mai) — smooth, tense, forceful"
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney reserves maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root intact.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. Heat at Blood level has NOT reached Kidney yet.",
        rhythm: "Moderate (huan mai) — steady, even, balanced",
        shape: "Slippery (hua mai) — smooth, rounded. Undisturbed quality at this level."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "hurried",
        strength: "Full (shi mai) — forceful between skips",
        depth: "Floating (fu mai) — heat pushing to surface",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — with skipped beats",
        rhythm: "Hurried (cue mai) — fast pulse with irregular skipped beats. Heat agitating Lung Blood.",
        shape: "Slippery (hua mai) — forceful then gaps"
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "flooding",
        strength: "Full (shi mai) — maximum excess force, pounding at all levels",
        depth: "Felt forcefully at ALL levels — heat driving pulse outward everywhere",
        width: "Flooding (hong mai) — very wide, surging. Dramatic expansion.",
        speed: "Rapid (shu mai) — ~85bpm, heat driving Blood with great force",
        rhythm: "Moderate (huan mai) — regular, strong",
        shape: "Slippery (hua mai) — dramatic surging wave. Powerful arrival, gradual recession."
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient. Kidney Yang reserves undisturbed.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root intact.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. Deep level spared from heat.",
        rhythm: "Moderate (huan mai) — steady, balanced",
        shape: "Slippery (hua mai) — smooth, rounded. Calm quality at depth."
      },
    },
    validation: "DOCTOR CHECK: Hurried at Cun = FAST rate WITH irregular skipped beats. Compare vs Knotted which is SLOW + skipped. Rate >90bpm between gaps. Right Guan Flooding = HIGHEST amplitude. Both Chi should show undisturbed, slower rhythm."
  },

  yin_deficiency_heat: {
    name: "Yin Deficiency with Empty Heat",
    summary: "DEFICIENCY heat. Thin (xi mai) + Rapid (shu mai) = no substance but pathological heat. Floating+Empty at Right Cun = no Yin anchor. Frail (ruo mai) at Right Chi = root Kidney Yin exhaustion.",
    left: {
      cun: {
        organ: "Heart", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacks fullness. Heart Yin/Blood depleted, cannot generate force.",
        depth: "Deep/Sinking (chen mai) — tending deep, insufficient substance to push upward",
        width: "Thin/Fine (xi mai) — fine thread. Distinct but attenuated. No substance.",
        speed: "Rapid (shu mai) — ~78bpm, pathological heat from Yin-Yang imbalance. Deficiency heat.",
        rhythm: "Moderate (huan mai) — regular between beats",
        shape: "Slippery (hua mai) — smooth, fine. Thread-like but clear contour."
      },
      guan: {
        organ: "Liver", dominant: "rapid",
        strength: "Full (shi mai) — maintained force, Liver function present",
        depth: "Felt at middle level — balanced",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — ~85bpm, heat manifestation from Yin-Yang imbalance",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fluid"
      },
      chi: {
        organ: "Kidney Yin ★", dominant: "thin",
        strength: "Empty (xu mai) — soft, depleted. Kidney Yin (source of all Yin) is deficient.",
        depth: "Deep/Sinking (chen mai) — sinking, reduced presence at surface",
        width: "Thin/Fine (xi mai) — fine thread. Kidney Yin depleted at source.",
        speed: "Rapid (shu mai) — ~78bpm, slightly accelerated even here",
        rhythm: "Moderate (huan mai) — steady",
        shape: "Slippery (hua mai) — smooth, fine"
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "floating",
        strength: "Empty (xu mai) — Floating + Empty combination = Yin deficiency. Soft, insubstantial at the surface.",
        depth: "Floating (fu mai) — pulse floats because there is no Yin substance to ANCHOR it downward. Buoyant but vacant.",
        width: "Long (chang mai) — fills position at surface",
        speed: "Rapid (shu mai) — ~78bpm, slightly accelerated",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — light, insubstantial. Floats without substance."
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "thin",
        strength: "Empty (xu mai) — soft, Spleen Yin also depleted",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Thin/Fine (xi mai) — fine thread. Systemic Yin depletion.",
        speed: "Rapid (shu mai) — ~78bpm, slightly accelerated",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fine"
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "frail",
        strength: "Empty (xu mai) — root Kidney Yin exhaustion. Profoundly depleted force.",
        depth: "Frail (ruo mai) — only at deep level. Soft, weak, thin at depth. Absent at superficial and middle.",
        width: "Minute (wei mai) — approaching barely perceptible. Finer than Thin.",
        speed: "Slow (chi mai) — ~64bpm. At the root level, heat does not penetrate. Slowest position.",
        rhythm: "Moderate (huan mai) — attempts regularity, slightly inconsistent",
        shape: "Slippery (hua mai) — soft, smooth, extremely attenuated. Deepest Yin exhausted."
      },
    },
    validation: "DOCTOR CHECK: CRITICAL DIFFERENTIATOR vs Excess Heat — that has Flooding/Full (shi mai) forceful pulses. This shows Thin/Empty (xu mai) + ELEVATED RATE. The combination of WEAK + FAST is the diagnostic key. Right Cun Floating (fu mai) should fade with pressure. Right Chi (Frail) = weakest channel."
  },

  blood_loss_acute: {
    name: "Acute Blood Loss",
    summary: "Hollow (kong mai) at Cun: solid outside, empty within. Scattered (san mai) at Left Guan: Yang floating away. Empty (xu mai) at Right Guan. Frail (ruo mai) at both Chi.",
    left: {
      cun: {
        organ: "Heart ★", dominant: "hollow",
        strength: "Empty (xu mai) — vessel structure felt but interior is vacant. Hollow inside.",
        depth: "Hollow (kong mai) — solid on outside, empty within. Like green onion stem. Felt at superficial and middle but VACANT in center.",
        width: "Long (chang mai) — vessel fills position structurally but lacks Blood volume inside",
        speed: "4 beats per respiration, ~72bpm. Compensatory rate maintained.",
        rhythm: "Moderate (huan mai) — slightly irregular spacing",
        shape: "Slippery (hua mai) — pulse WALL is felt, smooth structure, but INSIDE is vacant. Signature of blood loss."
      },
      guan: {
        organ: "Liver ★★", dominant: "scattered",
        strength: "Scattered (san mai) — floating, big, weak. Larger than Empty but less distinct. Yang energy dispersing.",
        depth: "Floating (fu mai) — superficial, tending to float away. Felt as it RECEDES. Yang losing its anchor.",
        width: "Big/Wide (da mai) — big but DIFFUSE. Ill-defined boundaries. Spreading without substance.",
        speed: "4 beats per respiration, ~70bpm",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Slippery (hua mai) — soft, diffuse, boundaries unclear. CRITICAL sign — Yang floating away because Blood anchor is lost."
      },
      chi: {
        organ: "Kidney Yin ★", dominant: "frail",
        strength: "Empty (xu mai) — profoundly depleted. Kidney (Blood source) reserves exhausted.",
        depth: "Frail (ruo mai) — only at deep level. Soft, weak, thin at depth. Absent above.",
        width: "Minute (wei mai) — barely perceptible",
        speed: "Slow (chi mai) — ~64bpm",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Slippery (hua mai) — smooth, extremely attenuated at depth"
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "hollow",
        strength: "Empty (xu mai) — same hollow-vessel quality. Structure without substance.",
        depth: "Hollow (kong mai) — solid outside, empty within. Lung governs Blood vessels.",
        width: "Long (chang mai) — structure present but vacant",
        speed: "4 beats per respiration, ~72bpm. Compensatory.",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Slippery (hua mai) — pulse wall smooth but interior VACANT"
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "empty",
        strength: "Empty (xu mai) — big but soft and weak. Like balloon partially filled with water. Feels vacant on heavier pressure.",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Big/Wide (da mai) — big but SOFT. Wide without force.",
        speed: "Slow (chi mai) — ~66bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, soft. Vacant quality on deeper pressure."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★", dominant: "frail",
        strength: "Empty (xu mai) — root depleted. Both Kidney positions show profound emptiness.",
        depth: "Frail (ruo mai) — only at deep level",
        width: "Minute (wei mai) — barely perceptible",
        speed: "Slow (chi mai) — ~64bpm",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Slippery (hua mai) — extremely attenuated, smooth at depth"
      },
    },
    validation: "DOCTOR CHECK: Hollow (kong mai) waveforms should show DIP IN CENTER — structure present but vacant inside. Scattered (san mai) at Left Guan should look DIFFUSE, ILL-DEFINED, spreading. DIFFERENTIATOR vs Yang Collapse: Blood Loss has Hollow (structure present, empty inside), Yang Collapse has Minute/Hidden (barely detectable, no structure)."
  },

  anxiety_shock: {
    name: "Anxiety / Shock / Fright",
    summary: "Spinning Bean (dong mai) at both Cun: Short+Tight+Slippery+Rapid combo, incomplete. Wiry (xuan mai) at Left Guan — emotional shock. Tight (jin mai) at Right Guan — defensive contraction.",
    left: {
      cun: {
        organ: "Heart ★★", dominant: "spinning",
        strength: "Full (shi mai) — agitated force, short bursts of power",
        depth: "Felt at middle level — concentrated in one spot",
        width: "Short (duan mai) — compact, doesn't fill all 3 finger positions. Felt in one position only.",
        speed: "Spinning Bean/Moving (dong mai) — combo pulse: Rapid ~95bpm. Fast, compact, bouncing.",
        rhythm: "Moderate (huan mai) — slightly irregular, agitated",
        shape: "Tight (jin mai) + Slippery (hua mai) — bouncing, compact, truncated. 'Incomplete, without head and tail, like a bean.' No normal rise-plateau-fall."
      },
      guan: {
        organ: "Liver ★", dominant: "wiry",
        strength: "Full (shi mai) — emotional tension creating forceful, excess quality",
        depth: "Felt evenly at all 3 levels — Wiry characteristic: even at all depths",
        width: "Thin/Fine (xi mai) — narrowed by taut tension",
        speed: "4 beats per respiration, ~78bpm",
        rhythm: "Moderate (huan mai) — regular with underlying tension",
        shape: "Wiry (xuan mai) — taut, hard like guitar string. No fluidity. Liver Qi stagnation from emotional shock. Emotions first affect Liver."
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable. Kidney reserves maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root present.",
        width: "Long (chang mai) — fills position. Acute reaction, not constitutional.",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Undisturbed at depth."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "spinning",
        strength: "Full (shi mai) — agitated, short bursts",
        depth: "Felt at middle level — concentrated",
        width: "Short (duan mai) — compact, one position only",
        speed: "Spinning Bean/Moving (dong mai) — Rapid ~95bpm, bouncing compact",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Tight (jin mai) + Slippery (hua mai) — agitated, incomplete, bouncing. Lung Qi scattered by fright."
      },
      guan: {
        organ: "Spleen/Stomach ★", dominant: "tight",
        strength: "Full (shi mai) — Cold-shock defensive contraction creating forceful tension",
        depth: "Felt at all levels — Tight transmits through",
        width: "Short (duan mai) — contracted by defensive response",
        speed: "4 beats per respiration, ~82bpm — Tight vibration makes it seem faster",
        rhythm: "Moderate (huan mai) — regular with tension",
        shape: "Tight (jin mai) — strong, bouncing side-to-side like taut rope. Defensive contraction response to fright. More elastic than Wiry."
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient. Kidney Yang undisturbed.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root intact.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. Acute shock, not deep chronic issue.",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded. Undisturbed."
      },
    },
    validation: "DOCTOR CHECK: Spinning Bean at Cun should look DISTINCTLY DIFFERENT — compact, rapid, TRUNCATED morphology. NOT just a fast pulse — should look INCOMPLETE and bouncing, Short width. Chi positions show undisturbed qualities — confirms ACUTE shock not chronic anxiety."
  },

  cold_obstructing_deep: {
    name: "Deep Cold Obstruction",
    summary: "Severe deep Cold. Hidden (fu mai) at both Chi — below bone. Confined (lao mai) at both Guan — deep+wiry+STRONG. Slow (chi mai). Everything deep but Guan positions are FORCEFUL.",
    left: {
      cun: {
        organ: "Heart", dominant: "deep",
        strength: "Full (shi mai) — maintained force but shifted deep. Cold pushing everything downward.",
        depth: "Deep/Sinking (chen mai) — Cold pushing pulse to deeper levels throughout the body",
        width: "Long (chang mai) — fills position at depth",
        speed: "Slow (chi mai) — ~70bpm, Cold slowing overall circulation",
        rhythm: "Moderate (huan mai) — regular, even",
        shape: "Slippery (hua mai) — smooth, stable at depth. No tension at this position specifically."
      },
      guan: {
        organ: "Liver ★★", dominant: "confined",
        strength: "Full (shi mai) — FORCEFUL despite being very deep. Yang energy is TRAPPED but still POWERFUL.",
        depth: "Confined/Prison (lao mai) — very deep, form of Hidden but with great FORCE. Only at deepest level but STRONG there.",
        width: "Long (chang mai) — extends beyond the finger position, perceptible past normal boundaries. Longer than typical.",
        speed: "Slow (chi mai) — ~72bpm, slow-normal",
        rhythm: "Moderate (huan mai) — regular, strong despite depth",
        shape: "Wiry (xuan mai) — Confined includes wiry component. Taut, hard, strong at depth. Yang is IMPRISONED by Cold but retains its force."
      },
      chi: {
        organ: "Kidney Yin ★", dominant: "hidden",
        strength: "Empty (xu mai) — barely perceptible. Cold has blocked the channels completely at this level.",
        depth: "Hidden (fu mai) — below the bone. Maximum pressure required. Deeper than Deep/Sinking.",
        width: "Minute (wei mai) — approaching invisible at this depth",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — slightly irregular at this depth",
        shape: "Slippery (hua mai) — smooth but barely detectable. Cold at deepest level."
      },
    },
    right: {
      cun: {
        organ: "Lung", dominant: "slow",
        strength: "Full (shi mai) — maintained force",
        depth: "Deep/Sinking (chen mai) — tending deep, Cold influence",
        width: "Long (chang mai) — fills position",
        speed: "Slow (chi mai) — <60bpm. Less than 4 beats/respiration. Cold has slowed entire metabolism.",
        rhythm: "Moderate (huan mai) — regular, steady",
        shape: "Slippery (hua mai) — smooth, rounded. Slow but smooth."
      },
      guan: {
        organ: "Spleen/Stomach ★★", dominant: "confined",
        strength: "Full (shi mai) — FORCEFUL at depth. Yang fighting against Cold obstruction.",
        depth: "Confined/Prison (lao mai) — very deep but STRONG. Force concentrated at deepest level.",
        width: "Long (chang mai) — extending, long quality",
        speed: "Slow (chi mai) — slow-normal",
        rhythm: "Moderate (huan mai) — regular, forceful",
        shape: "Wiry (xuan mai) — Confined's wiry component. Taut and strong at depth. Cold obstructing but Yang still fights."
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "hidden",
        strength: "Empty (xu mai) — barely perceptible at this level. Mingmen buried under Cold.",
        depth: "Hidden (fu mai) — deepest Cold obstruction. Below the bone. Maximum pressure required.",
        width: "Minute (wei mai) — barely detectable",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — slightly irregular",
        shape: "Slippery (hua mai) — smooth but ghost-like. Mingmen Fire buried under Cold."
      },
    },
    validation: "DOCTOR CHECK: ALL deep. Confined at Guan = STRONG AMPLITUDE despite deep location (Full + Confined + Wiry). Hidden at Chi = barely detectable. Rate Slow. CRITICAL vs Yang Collapse: BOTH deep, but Cold Obstruction has FORCEFUL Confined. Yang Collapse has only Empty/Minute. The doctor should feel POWER trapped underneath at Guan."
  },

  jing_deficiency: {
    name: "Jing/Essence Deficiency",
    summary: "Kidney Jing depleted. Leather (ge mai) at Left Guan: drum skin — hard surface, hollow beneath. Soggy (ru mai) at Right Cun: extremely soft. Frail (ruo mai) at both Chi.",
    left: {
      cun: {
        organ: "Heart", dominant: "thin",
        strength: "Empty (xu mai) — soft, lacks fullness. Heart Blood insufficient from root Jing depletion.",
        depth: "Deep/Sinking (chen mai) — tending deep, insufficient substance",
        width: "Thin/Fine (xi mai) — fine thread from Jing depletion",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fine thread"
      },
      guan: {
        organ: "Liver ★★", dominant: "leather",
        strength: "Empty (xu mai) — EMPTY inside despite taut surface. Hard outside, vacant within.",
        depth: "Leather (ge mai) — combination Floating + Wiry + Empty. Felt at SUPERFICIAL level with taut quality, but HOLLOW beneath. Like tight skin on drum.",
        width: "Thin/Fine (xi mai) — wiry component narrows the width",
        speed: "4 beats per respiration, ~75bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Wiry (xuan mai) — Leather includes wiry component. Taut surface. BUT immediately beneath is EMPTINESS. Drum skin with nothing underneath. Liver Blood and Jing depleted."
      },
      chi: {
        organ: "Kidney Yin ★★", dominant: "frail",
        strength: "Empty (xu mai) — Jing source exhausted. Profoundly soft and depleted.",
        depth: "Frail (ruo mai) — only at deep level. Soft, weak, thin at depth. Absent at superficial and middle.",
        width: "Minute (wei mai) — barely perceptible",
        speed: "Slow (chi mai) — ~64bpm, constitutional depletion slowing",
        rhythm: "Moderate (huan mai) — slightly inconsistent",
        shape: "Slippery (hua mai) — smooth, extremely attenuated. Constitutional Yin essence depleted."
      },
    },
    right: {
      cun: {
        organ: "Lung ★", dominant: "soggy",
        strength: "Soggy (ru mai) — extremely soft. Combination thin+empty+floating. Vanishes with any pressure increase.",
        depth: "Floating (fu mai) — perceptible ONLY at the most superficial level. Disappears completely when pressing down. Lung Qi cannot descend — no Kidney Jing to 'grasp' it.",
        width: "Thin/Fine (xi mai) — weak, thin",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — extremely soft, smooth. Like touching a cloud — present then gone."
      },
      guan: {
        organ: "Spleen/Stomach", dominant: "thin",
        strength: "Empty (xu mai) — soft, depleted from systemic Jing depletion",
        depth: "Deep/Sinking (chen mai) — tending deep",
        width: "Thin/Fine (xi mai) — fine thread. Systemic depletion from Kidney Jing root.",
        speed: "Slow (chi mai) — ~68bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — smooth, fine"
      },
      chi: {
        organ: "Kidney Yang/Mingmen ★★", dominant: "frail",
        strength: "Empty (xu mai) — root exhausted. Both Kidney positions depleted.",
        depth: "Frail (ruo mai) — only at deep level. Absent at superficial and middle.",
        width: "Minute (wei mai) — barely perceptible",
        speed: "Slow (chi mai) — ~64bpm",
        rhythm: "Moderate (huan mai) — slightly inconsistent",
        shape: "Slippery (hua mai) — extremely attenuated. Mingmen Jing depleted. Root of all essence exhausted."
      },
    },
    validation: "DOCTOR CHECK: Leather at Left Guan is MOST DISTINCTIVE waveform — SHARP/TAUT initial peak (drum skin) then HOLLOW trough (emptiness beneath). Soggy at Right Cun detectable ONLY at lightest pressure — VANISHES with any additional pressure. Both Chi (Frail) = WEAKEST waveforms."
  },

  stomach_intestine_heat: {
    name: "Stomach/Intestine Heat",
    summary: "Localized digestive heat. Big/Wide (da mai) at Right Cun — Large Intestine heat. Rapid (shu mai) at Right Guan — Stomach heat. Slippery (hua mai) at Left Guan — food accumulation.",
    left: {
      cun: {
        organ: "Heart", dominant: "normal",
        strength: "Full (shi mai) — resilient, palpable at all levels. Heart function maintained.",
        depth: "Felt at superficial, middle, and deep — balanced",
        width: "Long (chang mai) — fills position evenly",
        speed: "4 beats per respiration, ~72bpm. Heart rate not elevated — localized condition.",
        rhythm: "Moderate (huan mai) — regular, balanced",
        shape: "Slippery (hua mai) — smooth, rounded contour"
      },
      guan: {
        organ: "Liver ★", dominant: "slippery",
        strength: "Full (shi mai) — maintained force with fluid fullness",
        depth: "Felt at middle level — balanced",
        width: "Big/Wide (da mai) — slightly broader, food accumulation expanding",
        speed: "4 beats per respiration, ~80bpm. Slightly above standard from local heat effect.",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — very smooth, rolling, oily quality. PRONOUNCED rolling compared to other positions. Food accumulation and dampness from disrupted digestion."
      },
      chi: {
        organ: "Kidney Yin", dominant: "normal",
        strength: "Full (shi mai) — resilient. Kidney function maintained.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root present.",
        width: "Long (chang mai) — fills position. Localized condition — Kidney undisturbed.",
        speed: "4 beats per respiration, ~72bpm",
        rhythm: "Moderate (huan mai) — steady, even",
        shape: "Slippery (hua mai) — smooth, rounded"
      },
    },
    right: {
      cun: {
        organ: "Lung/Large Intestine ★★", dominant: "big",
        strength: "Full (shi mai) — heat-driven force, palpable at all levels",
        depth: "Felt at all levels — heat pushing pulse outward",
        width: "Big/Wide (da mai) — distinct and BROAD. Wider than standard. Classical indication of Heat in Stomach or Intestines. Not as dramatic as Flooding/hong mai.",
        speed: "4 beats per respiration, ~76bpm",
        rhythm: "Moderate (huan mai) — regular",
        shape: "Slippery (hua mai) — broad, forceful waves. Wider and more expansive than other positions."
      },
      guan: {
        organ: "Spleen/Stomach ★★", dominant: "rapid",
        strength: "Full (shi mai) — Stomach heat generating forceful, active pulse",
        depth: "Felt at all levels — heat pushing outward",
        width: "Long (chang mai) — fills position",
        speed: "Rapid (shu mai) — ~98bpm, more than 5 beats/respiration. Heat specifically in Stomach accelerating activity.",
        rhythm: "Moderate (huan mai) — regular, strong",
        shape: "Slippery (hua mai) — smooth, forceful, active"
      },
      chi: {
        organ: "Kidney Yang", dominant: "normal",
        strength: "Full (shi mai) — resilient. Kidney Yang maintained. Confirms localized condition.",
        depth: "Deep/Sinking (chen mai) — clear at deep level. Root intact.",
        width: "Long (chang mai) — fills position",
        speed: "4 beats per respiration, ~72bpm. NOT elevated — confirms localized heat, not systemic.",
        rhythm: "Moderate (huan mai) — steady, balanced",
        shape: "Slippery (hua mai) — smooth, rounded. Undisturbed quality."
      },
    },
    validation: "DOCTOR CHECK: Right Guan (Rapid/shu mai) clearly ELEVATED RATE vs all other positions. Right Cun (Big/Wide/da mai) shows BROADER waveform — wider but NOT as dramatic as Flooding. Left Guan Slippery = PROMINENT DICROTIC NOTCH (rolling). CONTRAST between active right-side positions and other positions should be clearly visible."
  },
};

function genWaveform(pKey) {
  const p = WAVE_PARAMS[pKey] || WAVE_PARAMS.normal;
  const n = SR * DUR, data = [];
  const basePeriod = 60 / p.rate;
  let beatCount = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let lp = basePeriod;
    if (p.irregularity > 0.1) {
      if (Math.sin(beatCount * 2.7 + 0.5) > (1 - p.irregularity * 2)) lp = basePeriod * (1.8 + p.irregularity);
    } else if (p.irregularity > 0) {
      lp += (Math.sin(t * 0.6) * p.irregularity * 0.3) * basePeriod;
    }
    const phase = (t % lp) / lp;
    if (phase < 0.01 && i > 0) beatCount++;
    const rw = (p.width * 0.28) / p.sharpness;
    const sys = p.amp * Math.exp(-Math.pow((phase - 0.14) / rw, 2));
    const dic = p.dicrotic * p.amp * Math.exp(-Math.pow((phase - 0.43) / 0.10, 2));
    const dia = 0.10 * p.amp * Math.exp(-Math.pow((phase - 0.65) / 0.13, 2));
    let sm = 0;
    if (pKey === "slippery") sm = 0.08 * p.amp * Math.exp(-Math.pow((phase - 0.28) / 0.15, 2));
    if (pKey === "choppy") sm = (Math.random() - 0.5) * 0.08 * p.amp * (phase < 0.5 ? 1 : 0.3);
    if (pKey === "spinning") sm = -0.3 * p.amp * (phase > 0.35 ? Math.exp(-Math.pow((phase - 0.5) / 0.2, 2)) : 0);
    if (pKey === "hollow") sm = -0.25 * p.amp * Math.exp(-Math.pow((phase - 0.18) / 0.05, 2));
    const noise = (Math.random() - 0.5) * 0.02 * p.amp;
    data.push(Math.round(Math.max(0, sys + dic + dia + sm + noise + 0.08) * 10000) / 10000);
  }
  return data;
}

function extractFeatures(wf, pKey) {
  const p = WAVE_PARAMS[pKey] || WAVE_PARAMS.normal;
  const max = Math.max(...wf), min = Math.min(...wf);
  const mean = wf.reduce((a, b) => a + b, 0) / wf.length;
  const thr = mean + (max - mean) * 0.5;
  let lastPk = -SR;
  const ints = [];
  for (let i = 1; i < wf.length - 1; i++) {
    if (wf[i] > thr && wf[i] > wf[i - 1] && wf[i] > wf[i + 1] && i - lastPk > SR * 0.3) {
      if (lastPk > 0) ints.push((i - lastPk) / SR);
      lastPk = i;
    }
  }
  const avg = ints.length > 0 ? ints.reduce((a, b) => a + b, 0) / ints.length : 60 / p.rate;
  const hrv = ints.length > 1 ? Math.sqrt(ints.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / ints.length) * 1000 : 0;
  return { hr: Math.round(60 / avg), peakAmp: Math.round(max * 1000) / 1000, meanAmp: Math.round(mean * 1000) / 1000, hrv: Math.round(hrv * 10) / 10, missed: ints.filter(x => x > avg * 1.4).length };
}

function buildLLMText(diseaseKey, featsMap) {
  const dd = D[diseaseKey];
  let s = `=== MAiZU Pulse Diagnostic Report ===\nPattern: ${dd.name}\n\n`;
  for (const w of WRISTS) {
    s += `== ${w.toUpperCase()} WRIST ==\n`;
    for (const pos of POSITIONS) {
      const k = `${w}_${pos}`;
      const pd = dd[w][pos];
      const f = featsMap[k];
      const found = findQuality(pd.dominant);
      const roman = found ? found.quality.romanized : "ping mai";
      s += `\n  ${pos.toUpperCase()} (${pd.organ}):\n`;
      s += `    Dominant: ${pd.dominant} (${roman}) | Measured: ${f.hr}bpm, amp=${f.peakAmp}, HRV=${f.hrv}ms\n`;
      s += `    Strength (li): ${pd.strength}\n    Depth (wei): ${pd.depth}\n    Width (kuan): ${pd.width}\n`;
      s += `    Speed (lv): ${pd.speed}\n    Rhythm (jie lv): ${pd.rhythm}\n    Shape (xing): ${pd.shape}\n`;
    }
    s += "\n";
  }
  s += `\nVALIDATION: ${dd.validation}\n`;
  s += `\nANALYSIS: Identify TCM pattern(s), confidence, key indicators, contradictions.\n`;
  return s;
}

function genReading(diseaseKey) {
  const dd = D[diseaseKey];
  const channels = {}, feats = {};
  for (const w of WRISTS) for (const pos of POSITIONS) {
    const k = `${w}_${pos}`;
    const dom = dd[w][pos].dominant;
    const wf = genWaveform(dom);
    channels[k] = { dominant: dom, waveform: wf };
    feats[k] = extractFeatures(wf, dom);
  }
  const csvH = "timestamp_ms," + Object.keys(channels).join(",");
  const csvR = [csvH];
  for (let i = 0; i < SR * DUR; i++) {
    const row = [Math.round(i / SR * 1000)];
    for (const k of Object.keys(channels)) row.push(channels[k].waveform[i]);
    csvR.push(row.join(","));
  }
  return {
    csv: csvR.join("\n"),
    json: { session_id: `maizu_${Date.now()}`, timestamp: new Date().toISOString(), diagnosis: dd.name, label: diseaseKey, sample_rate: SR, duration: DUR },
    channels, feats,
    llmText: buildLLMText(diseaseKey, feats)
  };
}

function WaveChart({ data, color, label }) {
  const w = 290, h = 58;
  const samples = SR * 3, sl = data.slice(0, samples);
  const mx = Math.max(...sl), mn = Math.min(...sl), rng = mx - mn || 1;
  const pts = sl.filter((_, i) => i % 4 === 0).map((v, i) => `${(i * 4 / samples) * w},${h - ((v - mn) / rng) * (h - 8) - 4}`).join(" ");
  return (
    <svg width={w} height={h} className="bg-gray-900 rounded" style={{ display: 'block', maxWidth: '100%' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" />
      <text x="4" y="12" fill={color} fontSize="9" fontFamily="monospace">{label}</text>
    </svg>
  );
}

function CategoryRow({ label, value, cat }) {
  const c = CAT_COLORS[cat] || "#9ca3af";
  return (
    <div className="flex gap-2 text-xs py-0.5">
      <span className="font-bold shrink-0" style={{ color: c, minWidth: '95px' }}>{label}:</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}

export default function App() {
  const [disease, setDisease] = useState("healthy");
  const [view, setView] = useState("validate");
  const [result, setResult] = useState(null);
  const [showRef, setShowRef] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const generate = useCallback(() => {
    setResult(genReading(disease));
    setView("validate");
    setExpanded(null);
  }, [disease]);

  const dl = (content, name, type) => {
    const blob = new Blob([content], { type });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = u; a.download = name; a.click();
    URL.revokeObjectURL(u);
  };

  const dd = D[disease];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-3" style={{ fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-white">MAiZU — 28 Pulse Qualities Disease Mapper</h1>
          <p className="text-gray-500 text-xs">Every position described using only the 28 pulse qualities. Click any waveform to expand full 6-category breakdown.</p>
        </div>

        <button onClick={() => setShowRef(!showRef)} className="text-xs text-cyan-400 hover:text-cyan-300 mb-2 underline">
          {showRef ? "Hide" : "Show"} 28 Pulse Qualities Reference
        </button>
        {showRef && (
          <div className="bg-gray-900 rounded border border-gray-800 p-3 mb-3 max-h-72 overflow-auto">
            {CATEGORIES.map(cat => (
              <div key={cat} className="mb-2">
                <h4 className="text-xs font-bold mb-1" style={{ color: CAT_COLORS[cat] }}>{cat}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {Object.entries(QUALITIES_BY_CAT[cat]).map(([k, q]) => (
                    <div key={k} className="text-xs bg-gray-800 rounded p-1.5">
                      <span className="font-bold text-white">{q.kaptchuk}</span>
                      <span className="text-gray-400"> ({q.romanized}) · CAM: {q.cam}</span>
                      <div className="text-gray-500 mt-0.5 leading-tight">{q.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-900 rounded p-3 mb-3 border border-gray-800">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-52">
              <label className="block text-xs text-gray-400 mb-1">Disease Pattern ({Object.keys(D).length})</label>
              <select value={disease} onChange={e => { setDisease(e.target.value); setResult(null); setExpanded(null); }}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">
                {Object.entries(D).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
              </select>
            </div>
            <button onClick={generate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded text-sm font-medium">Generate</button>
            {result && (
              <>
                <button onClick={() => dl(result.csv, `maizu_${disease}.csv`, 'text/csv')} className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded text-xs">Download CSV</button>
                <button onClick={() => dl(JSON.stringify(result.json, null, 2), `maizu_${disease}.json`, 'application/json')} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded text-xs">Download JSON</button>
              </>
            )}
          </div>
          {dd && <p className="text-xs text-gray-400 mt-2 italic">{dd.summary}</p>}
        </div>

        {result && (
          <>
            <div className="flex gap-1 mb-3 flex-wrap">
              {[["validate", "Waveforms & Pulse Qualities"], ["csv", "CSV"], ["json", "JSON"], ["llm", "LLM Prompt"]].map(([k, l]) => (
                <button key={k} onClick={() => setView(k)}
                  className={`px-3 py-1.5 rounded-t text-xs font-medium ${view === k ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}>{l}</button>
              ))}
            </div>

            <div className="bg-gray-900 rounded border border-gray-800 p-3">
              {view === "validate" && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {WRISTS.map(w => (
                      <div key={w}>
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-2 pb-1 border-b border-gray-700">
                          {w} Wrist <span className="text-xs font-normal text-gray-500">{w === "left" ? "(Heart · Liver · Kidney Yin)" : "(Lung · Spleen · Kidney Yang)"}</span>
                        </h4>
                        {POSITIONS.map(pos => {
                          const k = `${w}_${pos}`;
                          const pd = dd[w][pos];
                          const f = result.feats[k];
                          const isKey = pd.organ.includes("★");
                          const dom = pd.dominant;
                          const isOpen = expanded === k;
                          const found = findQuality(dom);
                          const domQ = found ? found.quality : null;
                          const domCat = found ? found.cat : "Shape";
                          const domRoman = domQ ? domQ.romanized : "ping mai";

                          return (
                            <div key={k} className={`mb-2 rounded border overflow-hidden ${isKey ? 'border-amber-800' : 'border-gray-800'}`}
                              style={{ backgroundColor: isKey ? '#1a1510' : '#0f1117' }}>
                              <div className="cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setExpanded(isOpen ? null : k)}>
                                <div className="px-2.5 py-1.5 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold" style={{ color: CH_COL[k] }}>{pos.toUpperCase()}</span>
                                    <span className="text-xs text-gray-400">{pd.organ}</span>
                                    {isKey && <span className="text-xs bg-amber-900 text-amber-300 px-1 rounded font-bold" style={{ fontSize: '9px' }}>KEY</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-white">{domQ ? domQ.kaptchuk : "Balanced"}</span>
                                    <span className="text-xs text-gray-500">({domRoman})</span>
                                    <span className="text-xs text-gray-600">{isOpen ? "▲" : "▼"}</span>
                                  </div>
                                </div>
                                <div className="px-2.5 pb-1.5">
                                  <WaveChart data={result.channels[k].waveform} color={CH_COL[k]} label={`${f.hr} bpm · amp ${f.peakAmp} · HRV ${f.hrv}ms`} />
                                </div>
                              </div>
                              {isOpen && (
                                <div className="px-2.5 pb-2.5 border-t border-gray-800">
                                  {domQ && (
                                    <div className="mt-2 mb-2 px-2.5 py-2 rounded text-xs" style={{ backgroundColor: CAT_COLORS[domCat] + '12', borderLeft: `3px solid ${CAT_COLORS[domCat]}` }}>
                                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                        <span className="font-bold text-white text-sm">{domQ.kaptchuk}</span>
                                        <span className="text-gray-400">({domRoman})</span>
                                        <span className="text-gray-500">· CAM: {domQ.cam}</span>
                                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: CAT_COLORS[domCat] + '30', color: CAT_COLORS[domCat] }}>{domCat}</span>
                                      </div>
                                      <div className="text-gray-300 leading-relaxed">{domQ.desc}</div>
                                    </div>
                                  )}
                                  <div className="mb-2 flex flex-wrap gap-3 text-xs">
                                    <span className="text-gray-400">Heart Rate: <span className="text-white font-mono">{f.hr} bpm</span></span>
                                    <span className="text-gray-400">Peak Amp: <span className="text-white font-mono">{f.peakAmp}</span></span>
                                    <span className="text-gray-400">Mean Amp: <span className="text-white font-mono">{f.meanAmp}</span></span>
                                    <span className="text-gray-400">HRV: <span className="text-white font-mono">{f.hrv}ms</span></span>
                                    <span className="text-gray-400">Missed Beats: <span className="text-white font-mono">{f.missed}</span></span>
                                  </div>
                                  <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider" style={{ fontSize: '10px' }}>6-Category Pulse Quality Breakdown</div>
                                  <div className="space-y-0.5">
                                    <CategoryRow label="Strength (li)" value={pd.strength} cat="Strength" />
                                    <CategoryRow label="Depth (wei)" value={pd.depth} cat="Depth" />
                                    <CategoryRow label="Width (kuan)" value={pd.width} cat="Width" />
                                    <CategoryRow label="Speed (lv)" value={pd.speed} cat="Speed" />
                                    <CategoryRow label="Rhythm (jie lv)" value={pd.rhythm} cat="Rhythm" />
                                    <CategoryRow label="Shape (xing)" value={pd.shape} cat="Shape" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-800 border border-amber-900 rounded">
                    <h4 className="text-xs font-bold text-amber-400 mb-1 uppercase">Doctor Verification Checklist</h4>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{dd.validation}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {[{ c: "Strength", r: "li" }, { c: "Depth", r: "wei" }, { c: "Width", r: "kuan" }, { c: "Speed", r: "lv" }, { c: "Rhythm", r: "jie lv" }, { c: "Shape", r: "xing" }].map(({ c, r }) => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded" style={{ background: CAT_COLORS[c] + "22", color: CAT_COLORS[c] }}>{c} ({r})</span>
                    ))}
                    <span className="text-xs text-gray-600 ml-2">KEY = primary diagnostic position</span>
                  </div>
                </div>
              )}

              {view === "csv" && (
                <div>
                  <div className="mb-2 p-2 bg-gray-800 rounded"><p className="text-xs text-emerald-400 font-bold">Layer 1 — Raw CSV for S3</p><p className="text-xs text-gray-500">{SR}Hz · {DUR}s · {SR * DUR} rows · ~{Math.round(result.csv.length / 1024)}KB</p></div>
                  <pre className="text-xs text-green-300 font-mono overflow-auto max-h-72 bg-black p-2 rounded">{result.csv.split("\n").slice(0, 20).join("\n")}{"\n...(" + (SR * DUR - 19) + " more rows)"}</pre>
                </div>
              )}
              {view === "json" && (
                <div>
                  <div className="mb-2 p-2 bg-gray-800 rounded"><p className="text-xs text-purple-400 font-bold">Layer 2 — Feature JSON for Bedrock</p></div>
                  <pre className="text-xs text-purple-300 font-mono overflow-auto max-h-72 bg-black p-2 rounded">{JSON.stringify(result.json, null, 2)}</pre>
                </div>
              )}
              {view === "llm" && (
                <div>
                  <div className="mb-2 p-2 bg-gray-800 rounded"><p className="text-xs text-amber-400 font-bold">LLM Prompt Text for Bedrock</p></div>
                  <pre className="text-sm text-amber-200 font-mono overflow-auto max-h-80 bg-black p-2 rounded whitespace-pre-wrap">{result.llmText}</pre>
                </div>
              )}
            </div>

            <div className="mt-3 bg-gray-900 rounded border border-gray-800 p-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[{ l: "Wristband (6ch)", c: "bg-gray-700" }, { l: "→" }, { l: "CSV → S3", c: "bg-blue-900 border border-blue-700" }, { l: "→" },
                { l: "Lambda (extract 6 categories)", c: "bg-amber-900 border border-amber-700" }, { l: "→" },
                { l: "JSON (28 qualities)", c: "bg-purple-900 border border-purple-700" }, { l: "→" },
                { l: "Bedrock LLM", c: "bg-emerald-900 border border-emerald-700" }, { l: "→" },
                { l: "TCM Diagnosis", c: "bg-red-900 border border-red-700" }
                ].map((s, i) => s.c ? <span key={i} className={`${s.c} px-2 py-1 rounded`}>{s.l}</span> : <span key={i} className="text-gray-600">{s.l}</span>)}
              </div>
            </div>
          </>
        )}

        {!result && (
          <div className="bg-gray-900 rounded border border-gray-800 p-6 text-center">
            <p className="text-gray-500">Select a disease pattern and click <strong className="text-emerald-400">Generate</strong></p>
            <p className="text-xs text-gray-600 mt-1">All positions described using only the 28 pulse qualities — no pre-judgments</p>
          </div>
        )}
      </div>
    </div>
  );
}

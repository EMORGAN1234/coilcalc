import { useState, useMemo, useEffect } from "react";

const PI = Math.PI;

const ALLOYS = [
  { id: "1100", label: "1100", density: 0.0975 },
  { id: "3003", label: "3003", density: 0.0984 },
  { id: "3004", label: "3004", density: 0.0984 },
  { id: "3105", label: "3105", density: 0.0985 },
  { id: "5005", label: "5005", density: 0.0974 },
  { id: "5052", label: "5052", density: 0.0968 },
  { id: "5182", label: "5182", density: 0.0966 },
  { id: "6061", label: "6061", density: 0.0975 },
  { id: "7075", label: "7075", density: 0.1015 },
];

const DEFAULT_TEMPERS = {
  "1100": "H14", "3003": "H14", "3004": "H32", "3105": "H24",
  "5005": "H32", "5052": "H32", "5182": "H32", "6061": "T6", "7075": "T6",
};

const STANDARD_WIDTHS = [36, 48, 60, 72];

const font = "'Inter','Segoe UI',system-ui,sans-serif";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield}
*{box-sizing:border-box}

.rcc-page{background:linear-gradient(135deg,#171717 0%,#262626 50%,#0a0a0a 100%);color:#171717;min-height:100vh;padding:16px 24px;font-family:${font}}
.rcc-wrap{max-width:1280px;margin:0 auto}
.rcc-card{background:rgba(255,255,255,0.97);border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #d4d4d4;box-shadow:0 4px 24px rgba(0,0,0,0.15)}
.rcc-card-accent{background:rgba(255,255,255,0.97);border-radius:16px;padding:20px;margin-bottom:20px;border-top:4px solid #dc2626;box-shadow:0 8px 32px rgba(0,0,0,0.2)}
.rcc-inner{background:linear-gradient(135deg,#fafafa,#f5f5f5);border-radius:12px;padding:16px;border:1px solid #e5e5e5}
.rcc-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rcc-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.rcc-grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px}
.rcc-width-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.rcc-stock-row{display:grid;grid-template-columns:140px 120px 1fr 36px;gap:8px;align-items:center}
.rcc-footer{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#737373;padding:8px 4px}

@media(max-width:1000px){
  .rcc-width-grid{grid-template-columns:1fr 1fr}
  .rcc-grid4{grid-template-columns:1fr 1fr}
}
@media(max-width:700px){
  .rcc-page{padding:10px 10px}
  .rcc-width-grid{grid-template-columns:1fr}
  .rcc-grid2{grid-template-columns:1fr}
  .rcc-grid3{grid-template-columns:1fr 1fr}
  .rcc-grid4{grid-template-columns:1fr 1fr}
  .rcc-stock-row{grid-template-columns:1fr 1fr 1fr 36px}
  .rcc-card{padding:14px}
  .rcc-card-accent{padding:14px}
  .rcc-footer{flex-direction:column;gap:4px;text-align:center}
}
@media(max-width:480px){
  .rcc-page{padding:6px 6px}
  .rcc-grid3{grid-template-columns:1fr 1fr}
  .rcc-stock-row{grid-template-columns:1fr 1fr}
}
`;

const S = {
  inp: { width: "100%", padding: "8px 12px", fontSize: 14, fontFamily: font, fontWeight: 500, border: "1px solid #d4d4d4", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", color: "#171717" },
  inpRo: { width: "100%", padding: "8px 12px", fontSize: 14, fontFamily: font, fontWeight: 700, border: "2px solid #a3a3a3", borderRadius: 8, background: "#f5f5f5", color: "#171717", cursor: "not-allowed", boxSizing: "border-box" },
  inpErr: { width: "100%", padding: "8px 12px", fontSize: 14, fontFamily: font, fontWeight: 500, border: "2px solid #dc2626", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fef2f2", color: "#171717" },
  lbl: { display: "block", fontSize: 10, fontWeight: 700, color: "#525252", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" },
  sec: { fontSize: 12, fontWeight: 700, color: "#404040", textTransform: "uppercase", letterSpacing: "1px", margin: 0 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block", marginRight: 8 },
  dotGray: { width: 8, height: 8, borderRadius: "50%", background: "#525252", display: "inline-block", marginRight: 8 },
};

const fmt = (n, d = 4) => (!n || isNaN(n) || !isFinite(n)) ? "—" : n.toFixed(d);

function btnStyle(active) {
  return { padding: "6px 14px", fontSize: 11, fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font, letterSpacing: "0.5px", transition: "all 0.15s", background: active ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#fff", color: active ? "#fff" : "#525252", outline: active ? "none" : "1px solid #d4d4d4", boxShadow: active ? "0 2px 8px rgba(220,38,38,0.3)" : "none" };
}

function metricBox(primary) {
  return { borderRadius: 12, padding: 12, border: `1px solid ${primary ? "#fecaca" : "#e5e5e5"}`, background: primary ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "linear-gradient(135deg, #fafafa, #f5f5f5)" };
}

function StatBox({ label, value, sub, green, accent, warn }) {
  const bg = green ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : accent ? "linear-gradient(135deg,#fef2f2,#fee2e2)" : warn ? "linear-gradient(135deg,#fffbeb,#fef3c7)" : "linear-gradient(135deg,#fafafa,#f5f5f5)";
  const bdr = green ? "#bbf7d0" : accent ? "#fecaca" : warn ? "#fde68a" : "#e5e5e5";
  const clr = green ? "#16a34a" : accent ? "#dc2626" : warn ? "#b45309" : "#171717";
  return (
    <div style={{ borderRadius: 10, padding: "10px 12px", border: `1px solid ${bdr}`, background: bg }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: "#737373", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: clr, margin: 0, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: "#a3a3a3", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

// Coil OD formula: OD = sqrt(ID² + 4W/(π·ρ·width_in))
function coilOD(weightLbs, widthIn, densityLbIn3, coreIDin) {
  if (weightLbs <= 0 || widthIn <= 0 || densityLbIn3 <= 0 || coreIDin <= 0) return 0;
  return Math.sqrt(coreIDin * coreIDin + (4 * weightLbs) / (PI * densityLbIn3 * widthIn));
}

// Linear footage: ft = W / (width × gauge × density × 12)
function coilFeet(weightLbs, widthIn, gaugeIn, densityLbIn3) {
  if (weightLbs <= 0 || widthIn <= 0 || gaugeIn <= 0 || densityLbIn3 <= 0) return 0;
  return weightLbs / (widthIn * gaugeIn * densityLbIn3 * 12);
}

// lbs per linear foot
// lbs per linear foot
function lbsPerFt(widthIn, gaugeIn, densityLbIn3) {
  return widthIn * gaugeIn * densityLbIn3 * 12;
}

// OD sanity check — computed OD must be meaningfully larger than core ID
function coilODValid(od, coreIDin) {
  return od > coreIDin + 0.25;
}
export default function RolledCoilCalculator() {
  // ── SHARED MATERIAL ──────────────────────────────────────────
  const [mode, setMode] = useState("slit"); // "slit" | "ctl" | "info"
  const [alloyId, setAlloyId] = useState("5052");
  const [temper, setTemper] = useState("H32");
  const [gauge, setGauge] = useState("");
  const [coreID, setCoreID] = useState("20");

  // ── SLIT PLANNER ─────────────────────────────────────────────
  const [slitWidth, setSlitWidth] = useState("");
  const [headsTails, setHeadsTails] = useState("2");
  const [orderVal, setOrderVal] = useState("");
  const [orderUnit, setOrderUnit] = useState("lbs"); // lbs | pcs | ft
  const [sheetLength, setSheetLength] = useState("");
  const [maxCoilWt, setMaxCoilWt] = useState("");
  const [maxCoilOD, setMaxCoilOD] = useState("");

  // ── CTL PLANNER ──────────────────────────────────────────────
  const [ctlPieceWidth, setCtlPieceWidth] = useState("");
  const [ctlPieceLength, setCtlPieceLength] = useState("");
  const [ctlScrap, setCtlScrap] = useState("2");
  const [ctlAnyOrientation, setCtlAnyOrientation] = useState(true);
  const [ctlGrainReq, setCtlGrainReq] = useState("none");
  const [ctlQtyPcs, setCtlQtyPcs] = useState("");
  const [ctlQtyLbs, setCtlQtyLbs] = useState("");
  const [ctlQtyFt2, setCtlQtyFt2] = useState("");

  // ── COIL INFO ─────────────────────────────────────────────────
  const [infoWidth, setInfoWidth] = useState("");
  const [infoWeight, setInfoWeight] = useState("");

  // ── STOCK COILS (shared across slit + CTL) ───────────────────
  const [stockCoils, setStockCoils] = useState([
    { width: "", weight: "", tag: "" },
  ]);

  // ── HISTORY ──────────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── AUTO-TEMPER ──────────────────────────────────────────────
  useEffect(() => {
    if (DEFAULT_TEMPERS[alloyId]) setTemper(DEFAULT_TEMPERS[alloyId]);
  }, [alloyId]);

  // ── DERIVED MATERIAL ─────────────────────────────────────────
  const alloy = ALLOYS.find((a) => a.id === alloyId) || ALLOYS[5];
  const density = alloy.density;
  const gaugeNum = parseFloat(gauge) || 0;
  const gaugeOver = gaugeNum > 0.325;
  const gaugeUnder = gaugeNum > 0 && gaugeNum < 0.006;
  const coreIn = parseFloat(coreID) || 20;

  // ═══════════════════════════════════════════════════════
  // SLIT CALC
  // ═══════════════════════════════════════════════════════
  const slitCalc = useMemo(() => {
    const sw = parseFloat(slitWidth) || 0;
    const g = gaugeNum;
    const ht = parseFloat(headsTails) || 0;
    const htF = ht / 100;
    const shLen = parseFloat(sheetLength) || 0;

    if (!sw || sw <= 0 || !g || g < 0.006 || g > 0.325) return null;

    const results = STANDARD_WIDTHS.map((mw) => {
      const numSlits = Math.floor(mw / sw);
      if (numSlits <= 0) return { mw, valid: false, reason: `${sw}" slit doesn't fit in ${mw}" master` };

      const offalIn = mw - numSlits * sw;
      const offalPct = (offalIn / mw) * 100;
      const slitYield = (numSlits * sw) / mw;
      const totalYield = slitYield * (1 - htF);
      const scrapPct = (1 - totalYield) * 100;
      const lbsPerFtVal = lbsPerFt(sw, g, density);

      let orderLbs = 0;
      let orderFt = 0;
      let orderPcs = 0;
      const ov = parseFloat(orderVal) || 0;
      if (ov > 0) {
        if (orderUnit === "lbs") {
          orderLbs = ov;
          orderFt = coilFeet(orderLbs, sw, g, density);
          if (shLen > 0) orderPcs = Math.floor(orderFt / (shLen / 12));
        } else if (orderUnit === "ft") {
          orderFt = ov;
          orderLbs = orderFt * lbsPerFtVal;
        } else if (orderUnit === "pcs") {
          if (shLen > 0) {
            orderPcs = ov;
            orderFt = (orderPcs * shLen) / 12;
            orderLbs = orderFt * lbsPerFtVal;
          }
        }
      }
      const masterLbsNeeded = orderLbs > 0 ? orderLbs / totalYield : 0;
      const masterFtNeeded = masterLbsNeeded > 0 ? coilFeet(masterLbsNeeded, mw, g, density) : 0;
      const sheetWt = shLen > 0 ? lbsPerFt(sw, g, density) * (shLen / 12) : 0;

      return {
        mw, valid: true, numSlits, offalIn, offalPct,
        slitYield: slitYield * 100, totalYield: totalYield * 100,
        scrapPct, lbsPerFtVal, masterLbsNeeded, masterFtNeeded,
        orderFt, orderLbs: orderUnit === "lbs" ? ov : orderLbs,
        orderPcs: orderPcs || (shLen > 0 && orderFt > 0 ? Math.floor(orderFt / (shLen / 12)) : 0),
        sheetWt,
      };
    });

    const valid = results.filter((r) => r.valid);
    if (!valid.length) return { results, best: null };
    const best = valid.reduce((b, c) => c.scrapPct < b.scrapPct ? c : b);
    return { results, best };
  }, [slitWidth, gaugeNum, headsTails, orderVal, orderUnit, sheetLength, density]);

  // ═══════════════════════════════════════════════════════
  // STOCK ANALYSIS — SLIT
  // ═══════════════════════════════════════════════════════
  const slitStockAnalysis = useMemo(() => {
    if (!slitCalc || gaugeOver) return [];
    const sw = parseFloat(slitWidth) || 0;
    if (sw <= 0) return [];
    const ht = parseFloat(headsTails) || 0;
    const htF = ht / 100;
    const maxWt = parseFloat(maxCoilWt) || 0;
    const maxOD = parseFloat(maxCoilOD) || 0;

    return stockCoils.map((sc) => {
      const scWt = parseFloat(sc.weight) || 0;
      const scW = parseFloat(sc.width) || 0;
      if (scWt <= 0 || scW <= 0) return { ...sc, valid: false, reason: "Missing width or weight" };
      if (scW < sw) return { ...sc, valid: false, reason: `Coil width ${scW}" < slit width ${sw}"` };

      const numSlits = Math.floor(scW / sw);
      const offalIn = scW - numSlits * sw;
      const offalPct = (offalIn / scW) * 100;
      const slitYield = (numSlits * sw) / scW;
      const totalYield = slitYield * (1 - htF);
      const scrapPct = (1 - totalYield) * 100;

      const outputPerMaster = scWt * totalYield;
      const slitCoilWt = outputPerMaster / numSlits;
      const lbsPerFtSlit = lbsPerFt(sw, gaugeNum, density);
      const outputFtPerSlit = lbsPerFtSlit > 0 ? slitCoilWt / lbsPerFtSlit : 0;

      let coilSizeLimit = 0;
      const maxWtAtOD = (maxOD > 0 && maxOD > coreIn)
        ? ((maxOD * maxOD - coreIn * coreIn) * PI * density * sw) / 4
        : 0;
      if (maxWt > 0 && maxWtAtOD > 0) coilSizeLimit = Math.min(maxWt, maxWtAtOD);
      else if (maxWt > 0) coilSizeLimit = maxWt;
      else if (maxWtAtOD > 0) coilSizeLimit = maxWtAtOD;

      let fullCoilsPerSlit = 1, pupWtPerSlit = 0, coilsPerSlit = 1;
      let fullSlitCoilOD = 0, pupSlitCoilOD = 0;

    if (coilSizeLimit > 0 && slitCoilWt > coilSizeLimit) {
  fullCoilsPerSlit = Math.floor(slitCoilWt / coilSizeLimit);
  pupWtPerSlit = slitCoilWt - fullCoilsPerSlit * coilSizeLimit;
  coilsPerSlit = fullCoilsPerSlit + (pupWtPerSlit >= 100 ? 1 : 0);
  fullSlitCoilOD = coilOD(coilSizeLimit, sw, density, coreIn);
  if (pupWtPerSlit >= 100) pupSlitCoilOD = coilOD(pupWtPerSlit, sw, density, coreIn);
      } else {
        fullSlitCoilOD = coilOD(slitCoilWt, sw, density, coreIn);
      }

      const totalSlitCoilsFromMaster = numSlits * coilsPerSlit;
      const masterFt = coilFeet(scWt, scW, gaugeNum, density);
      const masterOD = coilOD(scWt, scW, density, coreIn);

      const orderLbsNeeded = slitCalc?.best ? slitCalc.best.masterLbsNeeded : 0;
      const canFulfill = orderLbsNeeded > 0 ? scWt >= orderLbsNeeded : null;
      const leftoverMasterLbs = orderLbsNeeded > 0 ? Math.max(0, scWt - orderLbsNeeded) : 0;
      const leftoverOutputLbs = leftoverMasterLbs * totalYield;
      const leftoverFt = coilFeet(leftoverMasterLbs, scW, gaugeNum, density);

      return {
        ...sc, valid: true, scW, scWt,
        numSlits, offalIn, offalPct, slitYield: slitYield * 100,
        totalYield: totalYield * 100, scrapPct,
        outputPerMaster, slitCoilWt, outputFtPerSlit,
        coilSizeLimit, fullCoilsPerSlit, pupWtPerSlit, coilsPerSlit,
        fullSlitCoilOD, pupSlitCoilOD, totalSlitCoilsFromMaster,
        masterFt, masterOD,
        canFulfill, orderLbsNeeded, leftoverMasterLbs, leftoverOutputLbs, leftoverFt,
      };
    });
  }, [stockCoils, slitWidth, gaugeNum, headsTails, maxCoilWt, maxCoilOD, coreIn, density, slitCalc, gaugeOver]);

  // ═══════════════════════════════════════════════════════
  // CTL CALC
  // ═══════════════════════════════════════════════════════
  function calcCTLOption(masterWidth, pieceW, pieceL, ctlScrapPct) {
    const g = gaugeNum;
    if (!masterWidth || masterWidth < 30 || pieceW <= 0 || pieceL <= 0 || g < 0.006 || g > 0.325) return null;

    const ctlF = (parseFloat(ctlScrapPct) || 0) / 100;

    const tryLayout = (pw, pl) => {
      if (pw > masterWidth) return null;
      const piecesAcross = Math.floor(masterWidth / pw);
      if (piecesAcross <= 0) return null;
      const trimIn = masterWidth - piecesAcross * pw;
      if (trimIn > 8) return null;
      const trimPct = (trimIn / masterWidth) * 100;
      const widthYield = (piecesAcross * pw) / masterWidth;
      const totalYield = widthYield * (1 - ctlF);
      const scrapPct = (1 - totalYield) * 100;
      return { piecesAcross, trimIn, trimPct, ctlScrapPct: ctlF * 100, totalYield: totalYield * 100, scrapPct, pw, pl };
    };

    const normalGrainDir = "length";
    const rotatedGrainDir = "width";

    const normalOk = ctlGrainReq === "none" || ctlGrainReq === normalGrainDir;
    const rotatedOk = (ctlGrainReq === "none" || ctlGrainReq === rotatedGrainDir) && ctlAnyOrientation;

    let result = normalOk ? tryLayout(pieceW, pieceL) : null;
    let resultRot = rotatedOk ? tryLayout(pieceL, pieceW) : null;

    let rotated = false;
    if (result && resultRot) {
      if (resultRot.piecesAcross > result.piecesAcross ||
        (resultRot.piecesAcross === result.piecesAcross && resultRot.scrapPct < result.scrapPct)) {
        result = resultRot;
        rotated = true;
      }
    } else if (!result && resultRot) {
      result = resultRot;
      rotated = true;
    }

    if (!result) {
      const normalPcs = pieceW <= masterWidth ? Math.floor(masterWidth / pieceW) : 0;
      const normalTrim = normalPcs > 0 ? masterWidth - normalPcs * pieceW : masterWidth - pieceW;
      const rotPcs = ctlAnyOrientation && pieceL <= masterWidth ? Math.floor(masterWidth / pieceL) : 0;
      const rotTrim = rotPcs > 0 ? masterWidth - rotPcs * pieceL : masterWidth - pieceL;
      const tooNarrow = pieceW > masterWidth && (!ctlAnyOrientation || pieceL > masterWidth);
      let reason = tooNarrow
        ? `Piece doesn't fit — need at least ${Math.min(pieceW, ctlAnyOrientation ? pieceL : pieceW)}" wide master`
        : `Edge drop too large: normal ${normalTrim.toFixed(3)}" ${ctlAnyOrientation ? `/ rotated ${rotTrim.toFixed(3)}"` : ""} (max 8")`;
      return { valid: false, reason };
    }

    const { piecesAcross, trimIn, trimPct, ctlScrapPct: ctlS, totalYield, scrapPct } = result;
    const cutLength = result.pl;
    const lbsPerFtMaster = lbsPerFt(masterWidth, gaugeNum, density);

    const pcWt = result.pw * result.pl * gaugeNum * density;
    let orderPcs = 0, orderLbs = 0, orderFt2 = 0;
    const pv = parseFloat(ctlQtyPcs) || 0;
    if (pv > 0) { orderPcs = pv; orderLbs = pv * pcWt; orderFt2 = pv * (result.pw * result.pl / 144); }

    const cutsNeeded = orderPcs > 0 ? Math.ceil(orderPcs / piecesAcross) : 0;
    // FIX #3: use ctlF (already parsed from ctlScrapPct param) instead of re-parsing ctlScrap state
    const masterFtNeeded = cutsNeeded > 0
      ? (cutsNeeded * cutLength) / (12 * (1 - ctlF))
      : 0;
    const masterLbsNeeded = masterFtNeeded * lbsPerFtMaster;

    return {
      valid: true, masterWidth, piecesAcross, trimIn, trimPct,
      ctlScrapPct: ctlS, totalYield, scrapPct, rotated,
      cutLength, pcWt, orderPcs, orderLbs, orderFt2,
      cutsNeeded, masterFtNeeded, masterLbsNeeded,
      usePW: result.pw, usePL: result.pl,
    };
  }

  const ctlCalc = useMemo(() => {
    const pw = parseFloat(ctlPieceWidth) || 0;
    const pl = parseFloat(ctlPieceLength) || 0;
    if (pw <= 0 || pl <= 0 || gaugeNum <= 0 || gaugeOver) return null;

    const results = STANDARD_WIDTHS.map((mw) => {
      const r = calcCTLOption(mw, pw, pl, ctlScrap);
      return r ? { ...r, mw } : { mw, valid: false, reason: `No valid layout for ${mw}" master` };
    });

    const valid = results.filter((r) => r.valid);
    if (!valid.length) return { results, best: null };
    const best = valid.reduce((b, c) => c.scrapPct < b.scrapPct ? c : b);
    return { results, best };
  }, [ctlPieceWidth, ctlPieceLength, ctlScrap, ctlAnyOrientation, ctlGrainReq, gaugeNum, gaugeOver, ctlQtyPcs, density]);

  // CTL piece weight for qty sync
  const ctlPcWt = useMemo(() => {
    const pw = parseFloat(ctlPieceWidth) || 0;
    const pl = parseFloat(ctlPieceLength) || 0;
    if (pw <= 0 || pl <= 0 || gaugeNum <= 0) return 0;
    return pw * pl * gaugeNum * density;
  }, [ctlPieceWidth, ctlPieceLength, gaugeNum, density]);

  function syncCtlQty(field, val) {
    const pw = parseFloat(ctlPieceWidth) || 0;
    const pl = parseFloat(ctlPieceLength) || 0;
    const pcWt = ctlPcWt;
    const pcFt2 = pw > 0 && pl > 0 ? (pw * pl) / 144 : 0;
    if (field === "pcs") {
      setCtlQtyPcs(val);
      const n = parseFloat(val) || 0;
      if (pcWt > 0 && n > 0) setCtlQtyLbs((n * pcWt).toFixed(1));
      else setCtlQtyLbs("");
      if (pcFt2 > 0 && n > 0) setCtlQtyFt2((n * pcFt2).toFixed(2));
      else setCtlQtyFt2("");
    } else if (field === "lbs") {
      setCtlQtyLbs(val);
      const n = parseFloat(val) || 0;
      if (pcWt > 0 && n > 0) { const p = Math.round(n / pcWt); setCtlQtyPcs(String(p)); if (pcFt2 > 0) setCtlQtyFt2((p * pcFt2).toFixed(2)); }
      else { setCtlQtyPcs(""); setCtlQtyFt2(""); }
    } else {
      setCtlQtyFt2(val);
      const n = parseFloat(val) || 0;
      if (pcFt2 > 0 && n > 0) { const p = Math.round(n / pcFt2); setCtlQtyPcs(String(p)); if (pcWt > 0) setCtlQtyLbs((p * pcWt).toFixed(1)); }
      else { setCtlQtyPcs(""); setCtlQtyLbs(""); }
    }
  }

  // ═══════════════════════════════════════════════════════
  // CTL STOCK ANALYSIS
  // ═══════════════════════════════════════════════════════
  const ctlStockAnalysis = useMemo(() => {
    if (!ctlCalc || !ctlCalc.best || gaugeOver) return [];
    const best = ctlCalc.best;
    const orderPcs = parseFloat(ctlQtyPcs) || 0;

    return stockCoils.map((sc) => {
      const scWt = parseFloat(sc.weight) || 0;
      const scW = parseFloat(sc.width) || 0;
      if (scWt <= 0 || scW <= 0) return { ...sc, valid: false, reason: "Missing width or weight" };

      const pw = parseFloat(ctlPieceWidth) || 0;
      const pl = parseFloat(ctlPieceLength) || 0;
      const opt = calcCTLOption(scW, pw, pl, ctlScrap);
      if (!opt || !opt.valid) return { ...sc, valid: false, reason: opt?.reason || `No valid layout for ${scW}" coil` };

      const ctlScrapF = (parseFloat(ctlScrap) || 0) / 100;
      const lbsPerFtCoil = lbsPerFt(scW, gaugeNum, density);
      const masterFt = lbsPerFtCoil > 0 ? scWt / lbsPerFtCoil : 0;
      const usableFt = masterFt * (1 - ctlScrapF);
      const cutsAvail = pl > 0 ? Math.floor(usableFt / (pl / 12)) : 0;
      const pcsAvail = cutsAvail * opt.piecesAcross;

      const cutsNeeded = orderPcs > 0 ? Math.ceil(orderPcs / opt.piecesAcross) : 0;
      const ftNeeded = cutsNeeded > 0 ? (cutsNeeded * opt.cutLength) / (12 * (1 - ctlScrapF)) : 0;
      const lbsNeeded = ftNeeded * lbsPerFtCoil;

      const canFulfill = orderPcs > 0 ? pcsAvail >= orderPcs : null;
      const leftoverFt = orderPcs > 0 ? Math.max(0, masterFt - ftNeeded) : masterFt;
      const leftoverLbs = leftoverFt * lbsPerFtCoil;
      const pcsFromThisCoil = orderPcs > 0 ? Math.min(pcsAvail, orderPcs) : pcsAvail;

      const masterOD = coilOD(scWt, scW, density, coreIn);

      return {
        ...sc, valid: true, scW, scWt,
        piecesAcross: opt.piecesAcross, trimIn: opt.trimIn, trimPct: opt.trimPct,
        ctlScrapPct: opt.ctlScrapPct, totalYield: opt.totalYield, scrapPct: opt.scrapPct,
        rotated: opt.rotated, cutsAvail, pcsAvail, masterFt, masterOD,
        canFulfill, cutsNeeded, lbsNeeded, ftNeeded,
        leftoverFt, leftoverLbs, pcsFromThisCoil,
      };
    });
  }, [stockCoils, ctlCalc, ctlQtyPcs, ctlPieceWidth, ctlPieceLength, ctlScrap, gaugeNum, density, coreIn, gaugeOver]);

  // ═══════════════════════════════════════════════════════
  // COIL INFO
  // ═══════════════════════════════════════════════════════
  const coilInfo = useMemo(() => {
    const w = parseFloat(infoWidth) || 0;
    const wt = parseFloat(infoWeight) || 0;
    const g = gaugeNum;
    if (w <= 0 || wt <= 0 || g <= 0) return null;

    const ft = coilFeet(wt, w, g, density);
    const lpf = lbsPerFt(w, g, density);
    const od = coilOD(wt, w, density, coreIn);
    const sqFt = (w * ft * 12) / 144;
    const lpSqFt = density * g * 144;

    const odValid = coilODValid(od, coreIn);
return {
  ft, inches: ft * 12, meters: ft * 0.3048,
  sqFt, lpf, lbsPerIn: lpf / 12, lpSqFt,
  kgPerMeter: lpf * 1.48816,
  od, odMM: od * 25.4,
  coreBuildup: (od - coreIn) / 2,
  odValid,
};
  }, [infoWidth, infoWeight, gaugeNum, density, coreIn]);

  // ── SAVE ──────────────────────────────────────────────
  function saveCalc() {
    if (mode === "slit" && slitCalc?.best) {
      setHistory((h) => [{
        id: Date.now(), mode: "Slit",
        label: `${slitWidth}" slit from ${slitCalc.best.mw}" master — ${alloyId}-${temper} ${gauge}"`,
        detail: `Scrap ${fmt(slitCalc.best.scrapPct, 2)}% · ${slitCalc.best.numSlits} slits · H/T ${headsTails}%`,
      }, ...h].slice(0, 20));
    } else if (mode === "ctl" && ctlCalc?.best) {
      setHistory((h) => [{
        id: Date.now(), mode: "CTL",
        label: `${ctlPieceWidth}"×${ctlPieceLength}" sheet from ${ctlCalc.best.mw}" master — ${alloyId}-${temper} ${gauge}"`,
        detail: `Scrap ${fmt(ctlCalc.best.scrapPct, 2)}% · ${ctlCalc.best.piecesAcross} across`,
      }, ...h].slice(0, 20));
    } else if (mode === "info" && coilInfo) {
      setHistory((h) => [{
        id: Date.now(), mode: "Info",
        label: `${infoWidth}"×${gauge}" ${alloyId}-${temper} @ ${infoWeight} lbs`,
        detail: `${fmt(coilInfo.ft, 1)} ft · OD ${fmt(coilInfo.od, 2)}"`,
      }, ...h].slice(0, 20));
    }
  }

  const canSave = (mode === "slit" && !!slitCalc?.best) || (mode === "ctl" && !!ctlCalc?.best) || (mode === "info" && !!coilInfo);

  // ─────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────
  const tabBtn = (id, label) => (
    <button onClick={() => setMode(id)} style={{ ...btnStyle(mode === id), padding: "8px 18px", fontSize: 12 }}>{label}</button>
  );

  function renderWidthCard(r, best) {
    const isBest = best && r.mw === best.mw;
    const border = !r.valid ? "1px solid #e5e5e5" : isBest ? "2px solid #dc2626" : "1px solid #e5e5e5";
    const bg = !r.valid ? "#fafafa" : isBest ? "linear-gradient(135deg,#fef2f2,#fff)" : "linear-gradient(135deg,#fafafa,#fff)";

    return (
      <div key={r.mw} style={{ borderRadius: 14, border, background: bg, padding: 16, position: "relative" }}>
        {isBest && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.5px" }}>★ BEST</div>
        )}
        <p style={{ fontSize: 20, fontWeight: 800, color: r.valid ? (isBest ? "#dc2626" : "#171717") : "#a3a3a3", margin: "0 0 10px", letterSpacing: "-0.5px" }}>{r.mw}"</p>
        {!r.valid ? (
          <p style={{ fontSize: 11, color: "#a3a3a3", fontStyle: "italic" }}>{r.reason}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { l: "Slits", v: String(r.numSlits) },
              { l: "Edge Offal", v: `${fmt(r.offalIn, 3)}" (${fmt(r.offalPct, 1)}%)` },
              { l: "Slit Yield", v: `${fmt(r.slitYield, 2)}%` },
              { l: "Heads/Tails Scrap", v: `${headsTails}%`, dim: true },
              // FIX #2: label changed from "Total Scrap (edge + H/T)" to "Total Scrap (combined)"
              { l: "Total Scrap (combined)", v: `${fmt(r.scrapPct, 2)}%`, accent: true },
              { l: "lbs / ft (slit)", v: fmt(r.lbsPerFtVal, 4) },
              ...(r.masterLbsNeeded > 0 ? [
                { l: "Master lbs needed", v: `${fmt(r.masterLbsNeeded, 0)} lbs`, bold: true },
                { l: "Master ft needed", v: `${fmt(r.masterFtNeeded, 1)} ft` },
              ] : []),
              ...(r.sheetWt > 0 ? [{ l: "Sheet wt (each)", v: `${fmt(r.sheetWt, 3)} lbs` }] : []),
              ...(r.orderPcs > 0 ? [{ l: "Sheets / pcs", v: String(r.orderPcs) }] : []),
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: row.dim ? "#a3a3a3" : "#525252", textTransform: "uppercase", letterSpacing: "0.4px" }}>{row.l}</span>
                <span style={{ fontSize: 12, fontWeight: row.bold ? 800 : 700, color: row.accent ? "#dc2626" : row.dim ? "#a3a3a3" : "#171717" }}>{row.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderCTLWidthCard(r, best) {
    const isBest = best && r.mw === best.mw;
    const border = !r.valid ? "1px solid #e5e5e5" : isBest ? "2px solid #dc2626" : "1px solid #e5e5e5";
    const bg = !r.valid ? "#fafafa" : isBest ? "linear-gradient(135deg,#fef2f2,#fff)" : "linear-gradient(135deg,#fafafa,#fff)";

    return (
      <div key={r.mw} style={{ borderRadius: 14, border, background: bg, padding: 16, position: "relative" }}>
        {isBest && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.5px" }}>★ BEST</div>
        )}
        {r.rotated && (
          <div style={{ position: "absolute", top: isBest ? 32 : 10, right: 10, background: "#171717", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>↔ ROTATED</div>
        )}
        <p style={{ fontSize: 20, fontWeight: 800, color: r.valid ? (isBest ? "#dc2626" : "#171717") : "#a3a3a3", margin: "0 0 10px", letterSpacing: "-0.5px" }}>{r.mw}"</p>
        {!r.valid ? (
          <p style={{ fontSize: 11, color: "#a3a3a3", fontStyle: "italic" }}>{r.reason}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { l: "Pcs Across", v: String(r.piecesAcross) },
              { l: "Orientation", v: r.rotated ? `↔ Rotated — grain along piece WIDTH` : `Normal — grain along piece LENGTH` },
              { l: "Edge Drop", v: `${fmt(r.trimIn, 3)}"` },
              { l: "Trim Scrap", v: `${fmt(r.trimPct, 2)}%`, dim: true },
              { l: "CTL Process Scrap", v: `${r.ctlScrapPct.toFixed(1)}%`, dim: true },
              { l: "Total Scrap (trim + CTL)", v: `${fmt(r.scrapPct, 2)}%`, accent: true },
              { l: "Total Yield", v: `${fmt(r.totalYield, 2)}%` },
              ...(r.cutsNeeded > 0 ? [
                { l: "Cuts Needed", v: String(r.cutsNeeded), bold: true },
                { l: "Master ft needed", v: `${fmt(r.masterFtNeeded, 1)} ft` },
                { l: "Master lbs needed", v: `${fmt(r.masterLbsNeeded, 0)} lbs`, bold: true },
              ] : []),
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: row.dim ? "#a3a3a3" : "#525252", textTransform: "uppercase", letterSpacing: "0.4px" }}>{row.l}</span>
                <span style={{ fontSize: 12, fontWeight: row.bold ? 800 : 700, color: row.accent ? "#dc2626" : row.dim ? "#a3a3a3" : "#171717" }}>{row.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderStockCard(sc, i, mode) {
    const isSlitMode = mode === "slit";
    const analysis = isSlitMode ? slitStockAnalysis[i] : ctlStockAnalysis[i];
    if (!analysis) return null;

    const { valid } = analysis;
    const hasOrder = isSlitMode
      ? (parseFloat(orderVal) > 0)
      : (parseFloat(ctlQtyPcs) > 0);

    const cardBg = !valid ? "#fafafa"
      : analysis.canFulfill === true ? "linear-gradient(135deg,#f0fdf4,#fff)"
        : analysis.canFulfill === false ? "linear-gradient(135deg,#fffbeb,#fff)"
          : "linear-gradient(135deg,#fafafa,#fff)";
    const cardBorder = !valid ? "1px solid #e5e5e5"
      : analysis.canFulfill === true ? "2px solid #16a34a"
        : analysis.canFulfill === false ? "2px solid #f59e0b"
          : "1px solid #e5e5e5";

    return (
      <div key={i} style={{ borderRadius: 14, border: cardBorder, background: cardBg, padding: 16, marginBottom: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
          <div>
            {/* FIX #4: wrap scWt in fmt() to avoid raw float display */}
            <p style={{ fontSize: 16, fontWeight: 800, color: "#171717", margin: 0 }}>
              {analysis.scW || "?"}″ wide · {analysis.scWt ? fmt(analysis.scWt, 0) : "?"}  lbs
            </p>
            {sc.tag && <p style={{ fontSize: 11, color: "#737373", margin: "2px 0 0", fontWeight: 600 }}>TAG: {sc.tag}</p>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {analysis.canFulfill === true && hasOrder && (
              <span style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>✓ COVERS ORDER</span>
            )}
            {analysis.canFulfill === false && hasOrder && (
              <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>⚠ SHORT</span>
            )}
          </div>
        </div>

        {!valid ? (
          <p style={{ fontSize: 11, color: "#a3a3a3", fontStyle: "italic" }}>{analysis.reason}</p>
        ) : isSlitMode ? (
          <>
            <div className="rcc-grid4" style={{ gap: 8, marginBottom: 8 }}>
              <StatBox label="Slits" value={String(analysis.numSlits)} />
              <StatBox label="Total Yield" value={`${fmt(analysis.totalYield, 2)}%`} />
              <StatBox label="Scrap" value={`${fmt(analysis.scrapPct, 2)}%`} />
              <StatBox label="Master Footage" value={`${fmt(analysis.masterFt, 1)} ft`} />
              <StatBox label="Output / Master" value={`${fmt(analysis.outputPerMaster, 0)} lbs`} green />
              <StatBox label="Wt / Slit Coil" value={`${fmt(analysis.slitCoilWt, 0)} lbs`} accent />
              <StatBox label="Ft / Slit Coil" value={`${fmt(analysis.outputFtPerSlit, 1)} ft`} />
              <StatBox label="Full Coil OD" value={`${fmt(analysis.fullSlitCoilOD, 2)}"`} />
              {analysis.coilSizeLimit > 0 && (
                <>
                  <StatBox label="Full Coils / Slit" value={String(analysis.fullCoilsPerSlit)} green />
                  <StatBox label="Total Coils / Master" value={String(analysis.totalSlitCoilsFromMaster)} accent />
                  {analysis.pupWtPerSlit > 0.01 && (
                    <>
                      <StatBox label="Pup Wt / Slit" value={`${fmt(analysis.pupWtPerSlit, 0)} lbs`} warn />
                      <StatBox label="Pup OD" value={`${fmt(analysis.pupSlitCoilOD, 2)}"`} warn />
                    </>
                  )}
                </>
              )}
            </div>
            {hasOrder && (
              <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 10, marginTop: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Order Coverage</p>
                <div className="rcc-grid4" style={{ gap: 8 }}>
                  <StatBox label="Order Needs" value={`${fmt(analysis.orderLbsNeeded, 0)} lbs`} />
                  <StatBox label="Coil Has" value={`${fmt(analysis.scWt, 0)} lbs`} />
                  {analysis.canFulfill ? (
                    <>
                      <StatBox label="Leftover Master" value={`${fmt(analysis.leftoverMasterLbs, 0)} lbs`} warn={analysis.leftoverMasterLbs > 10} />
                      <StatBox label="Leftover Output" value={`${fmt(analysis.leftoverOutputLbs, 0)} lbs`} warn={analysis.leftoverOutputLbs > 10} />
                    </>
                  ) : (
                    <StatBox label="Shortage" value={`${fmt(analysis.orderLbsNeeded - analysis.scWt, 0)} lbs`} />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rcc-grid4" style={{ gap: 8, marginBottom: 8 }}>
              <StatBox label="Pcs Across" value={String(analysis.piecesAcross)} />
              <StatBox label="Edge Drop" value={`${fmt(analysis.trimIn, 3)}"`} />
              <StatBox label="Total Scrap" value={`${fmt(analysis.scrapPct, 2)}%`} />
              <StatBox label="Total Yield" value={`${fmt(analysis.totalYield, 2)}%`} />
              <StatBox label="Cuts Avail" value={String(analysis.cutsAvail)} green />
              <StatBox label="Pcs Avail" value={String(analysis.pcsAvail)} accent />
              <StatBox label="Master Footage" value={`${fmt(analysis.masterFt, 1)} ft`} />
              <StatBox label="Master OD" value={`${fmt(analysis.masterOD, 2)}"`} />
              {analysis.rotated && <StatBox label="Orientation" value="↔ Rotated" />}
            </div>
            {hasOrder && (
              <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 10, marginTop: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Order Coverage — {ctlQtyPcs} pcs needed</p>
                <div className="rcc-grid4" style={{ gap: 8 }}>
                  <StatBox label="From This Coil" value={`${analysis.pcsFromThisCoil} pcs`} green={analysis.canFulfill} warn={!analysis.canFulfill} />
                  <StatBox label="Cuts Needed" value={String(analysis.cutsNeeded)} />
                  <StatBox label="Leftover Footage" value={`${fmt(analysis.leftoverFt, 1)} ft`} warn={analysis.leftoverFt > 1} />
                  <StatBox label="Leftover Lbs" value={`${fmt(analysis.leftoverLbs, 0)} lbs`} warn={analysis.leftoverLbs > 10} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER SUMMARY BAR
  // ─────────────────────────────────────────────────────
  function renderSlitSummaryBar(best) {
    const htNum = parseFloat(headsTails) || 0;
    const rows = [
      { l: "Master Width", v: `${best.mw}"` },
      { l: "Slits", v: String(best.numSlits) },
      { l: "Edge Offal", v: `${fmt(best.offalIn, 3)}" (${fmt(best.offalPct, 1)}%)` },
      { l: "Heads/Tails Scrap", v: `${htNum}%`, dim: true },
      { l: "Total Scrap (combined)", v: `${fmt(best.scrapPct, 2)}%`, accent: true },
      { l: "lbs / ft (slit)", v: fmt(best.lbsPerFtVal, 4) },
      ...(best.masterLbsNeeded > 0 ? [{ l: "Master lbs needed", v: `${fmt(best.masterLbsNeeded, 0)} lbs` }] : []),
    ];
    return (
      <div style={{ background: "linear-gradient(135deg,#171717,#262626)", borderRadius: 14, padding: 16, marginTop: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>★ Best Option Summary — {best.mw}" Master</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {rows.map((r, i) => (
            <div key={i}>
              <p style={{ fontSize: 9, color: "#737373", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px" }}>{r.l}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: r.accent ? "#fca5a5" : r.dim ? "#737373" : "#fff", margin: 0 }}>{r.v}</p>
            </div>
          ))}
        </div>
        {htNum === 0 && (
          <p style={{ fontSize: 10, color: "#f59e0b", marginTop: 10 }}>⚠ Heads/tails scrap is 0% — update if applicable</p>
        )}
       <p style={{ fontSize: 10, color: "#525252", marginTop: 10, fontStyle: "italic" }}>
  Scrap rate includes both edge offal ({fmt(best.offalPct, 2)}%) and heads/tails ({parseFloat(headsTails) || 0}%) — combined multiplicatively.
</p>
      </div>
    );
  }

  function renderCTLSummaryBar(best) {
    const rows = [
      { l: "Master Width", v: `${best.mw}"` },
      { l: "Pcs Across", v: String(best.piecesAcross) },
      { l: "Grain Direction", v: best.rotated ? "Along piece WIDTH" : "Along piece LENGTH" },
      { l: "Edge Drop", v: `${fmt(best.trimIn, 3)}"` },
      { l: "Trim Scrap", v: `${fmt(best.trimPct, 2)}%`, dim: true },
      { l: "CTL Process Scrap", v: `${best.ctlScrapPct.toFixed(1)}%`, dim: true },
      { l: "Total Scrap (trim + CTL)", v: `${fmt(best.scrapPct, 2)}%`, accent: true },
      ...(best.cutsNeeded > 0 ? [{ l: "Cuts Needed", v: String(best.cutsNeeded) }] : []),
      ...(best.masterLbsNeeded > 0 ? [{ l: "Master lbs needed", v: `${fmt(best.masterLbsNeeded, 0)} lbs` }] : []),
    ];
    return (
      <div style={{ background: "linear-gradient(135deg,#171717,#262626)", borderRadius: 14, padding: 16, marginTop: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
          ★ Best Option Summary — {best.mw}" Master{best.rotated ? " (↔ Rotated)" : ""}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {rows.map((r, i) => (
            <div key={i}>
              <p style={{ fontSize: 9, color: "#737373", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px" }}>{r.l}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: r.accent ? "#fca5a5" : r.dim ? "#737373" : "#fff", margin: 0 }}>{r.v}</p>
            </div>
          ))}
        </div>
       <p style={{ fontSize: 10, color: "#525252", marginTop: 10, fontStyle: "italic" }}>
  Scrap rate includes both edge offal ({fmt(best.offalPct, 2)}%) and heads/tails ({parseFloat(headsTails) || 0}%) — combined multiplicatively.
</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // STOCK COIL INPUT SECTION (shared)
  // ─────────────────────────────────────────────────────
  function renderStockInputCard() {
    return (
      <div className="rcc-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={S.sec}><span style={S.dotGray}></span>In-Stock Master Coil</p>
          <button onClick={() => setStockCoils([...stockCoils, { width: "", weight: "", tag: "" }])}
            style={{ ...btnStyle(false), fontSize: 11 }}>+ Add Coil</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stockCoils.map((sc, i) => (
            <div key={i} className="rcc-stock-row">
              <div>
                <label style={S.lbl}>Width (&ldquo;)</label>
                <input type="number" step="0.125" value={sc.width} onChange={(e) => { const u = [...stockCoils]; u[i].width = e.target.value; setStockCoils(u); }} style={S.inp} placeholder="e.g. 49" />
              </div>
              <div>
                <label style={S.lbl}>Weight (lbs)</label>
                <input type="number" step="1" value={sc.weight} onChange={(e) => { const u = [...stockCoils]; u[i].weight = e.target.value; setStockCoils(u); }} style={S.inp} placeholder="e.g. 8400" />
              </div>
              <div>
                <label style={S.lbl}>Tag / Notes</label>
                <input type="text" value={sc.tag} onChange={(e) => { const u = [...stockCoils]; u[i].tag = e.target.value; setStockCoils(u); }} style={S.inp} placeholder="Heat #, lot, location…" />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={() => setStockCoils(stockCoils.filter((_, idx) => idx !== i))}
                  style={{ width: 36, height: 36, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: font }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="rcc-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rcc-wrap">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="rcc-card-accent">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#dc2626,#991b1b)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(220,38,38,0.4)", flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="2.2" fill="none" />
                <circle cx="14" cy="14" r="8" stroke="white" strokeWidth="1.8" fill="none" />
                <circle cx="14" cy="14" r="4.5" stroke="white" strokeWidth="1.4" fill="none" />
                <circle cx="14" cy="14" r="1.5" fill="white" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#171717", margin: 0, letterSpacing: "-0.5px" }}>Rolled Coil Calculator</h1>
              <p style={{ fontSize: 13, color: "#737373", margin: "2px 0 0", fontWeight: 500 }}>Slit Coil Planner · CTL Sheet Planner · Coil Info</p>
            </div>
          </div>

          {/* Material Inputs */}
          <div className="rcc-inner" style={{ marginBottom: 16 }}>
            <p style={{ ...S.sec, marginBottom: 12 }}><span style={S.dot}></span>Material</p>
            <div className="rcc-grid4">
              <div>
                <label style={S.lbl}>Alloy</label>
                <select value={alloyId} onChange={(e) => setAlloyId(e.target.value)} style={S.inp}>
                  {ALLOYS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.lbl}>Temper</label>
                <input type="text" value={temper} onChange={(e) => setTemper(e.target.value)} style={S.inp} placeholder="H32" />
              </div>
              <div>
                <label style={S.lbl}>Gauge (")</label>
                <input type="number" step="0.001" value={gauge} onChange={(e) => setGauge(e.target.value)} style={(gaugeOver || gaugeUnder) ? S.inpErr : S.inp} placeholder="0.032" />
                {gaugeOver && <p style={{ fontSize: 10, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>⚠ Max gauge is 0.325"</p>}
                {gaugeUnder && <p style={{ fontSize: 10, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>⚠ Min gauge is 0.006"</p>}
              </div>
              <div>
                <label style={S.lbl}>Core ID (")</label>
                <input type="number" step="0.5" value={coreID} onChange={(e) => setCoreID(e.target.value)} style={S.inp} placeholder="20" />
              </div>
            </div>
          </div>

          {/* Mode Tabs + Save */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {tabBtn("slit", "✂ Slit Coil Planner")}
              {tabBtn("ctl", "📐 CTL Sheet Planner")}
              {tabBtn("info", "📏 Coil Info")}
            </div>
            <button onClick={saveCalc} style={{ ...btnStyle(canSave), padding: "8px 18px", fontSize: 11, opacity: canSave ? 1 : 0.4 }}>+ Save to History</button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* SLIT MODE */}
        {/* ══════════════════════════════════════════════════ */}
        {mode === "slit" && (
          <>
            {/* Customer Requirements */}
            <div className="rcc-card">
              <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Customer Requirements</p>
              <div className="rcc-grid4">
                <div>
                  <label style={S.lbl}>Slit Width (")</label>
                  <input type="number" step="0.001" value={slitWidth} onChange={(e) => setSlitWidth(e.target.value)} style={S.inp} placeholder="e.g. 10.952" />
                </div>
                <div>
                  <label style={S.lbl}>Heads/Tails Scrap %</label>
                  <input type="number" step="0.1" value={headsTails} onChange={(e) => setHeadsTails(e.target.value)} style={S.inp} placeholder="2" />
                </div>
                <div>
                  <label style={S.lbl}>Order Quantity</label>
                  <input type="number" step="1" value={orderVal} onChange={(e) => setOrderVal(e.target.value)} style={S.inp} placeholder="e.g. 10000" />
                </div>
                <div>
                  <label style={S.lbl}>Order Unit</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["lbs", "ft", "pcs"].map((u) => (
                      <button key={u} onClick={() => setOrderUnit(u)} style={{ ...btnStyle(orderUnit === u), padding: "8px 10px", flex: 1 }}>{u}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={S.lbl}>Sheet Length (") <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
                  <input type="number" step="0.5" value={sheetLength} onChange={(e) => setSheetLength(e.target.value)} style={S.inp} placeholder="e.g. 120" />
                </div>
                <div>
                  <label style={S.lbl}>Max Output Coil Wt (lbs) <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
                  <input type="number" step="10" value={maxCoilWt} onChange={(e) => setMaxCoilWt(e.target.value)} style={S.inp} placeholder="e.g. 3000" />
                </div>
                <div>
                  <label style={S.lbl}>Max Output Coil OD (") <span style={{ fontWeight: 400, textTransform: "none" }}>optional</span></label>
                  <input type="number" step="0.5" value={maxCoilOD} onChange={(e) => setMaxCoilOD(e.target.value)} style={S.inp} placeholder="e.g. 60" />
                </div>
                {orderUnit === "pcs" && !sheetLength && (
                  <div style={{ gridColumn: "span 1", display: "flex", alignItems: "center" }}>
                    <p style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>⚠ Enter sheet length to calculate pcs</p>
                  </div>
                )}
              </div>
            </div>

            {/* In-Stock Master Coil */}
            {renderStockInputCard()}

            {/* Gauge warning */}
            {(gaugeOver || gaugeUnder) && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, margin: 0 }}>
                  {gaugeOver ? "⛔ Gauge exceeds maximum (0.325\") — calculations suppressed until corrected." : "⛔ Gauge below minimum (0.006\") — calculations suppressed until corrected."}
                </p>
              </div>
            )}

            {/* Standard Master Width Options */}
            {!gaugeOver && slitCalc && (
              <div className="rcc-card">
                <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Standard Master Width Options</p>
                <div className="rcc-width-grid">
                  {slitCalc.results.map((r) => renderWidthCard(r, slitCalc.best))}
                </div>
                {slitCalc.best && renderSlitSummaryBar(slitCalc.best)}
                {!slitCalc.best && (
                  <p style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                    Enter slit width and gauge to see options.
                  </p>
                )}
              </div>
            )}

            {/* Stock Coverage Analysis */}
            {!gaugeOver && slitStockAnalysis.some((a) => a.valid) && (
              <div className="rcc-card">
                <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Stock Coverage Analysis</p>
                {slitCalc?.best && parseFloat(orderVal) > 0 && (
                  <div style={{ background: "linear-gradient(135deg,#171717,#262626)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 16 }}>
                    {[
                      { l: "Slit Width", v: `${slitWidth}"` },
                      { l: "Order", v: `${orderVal} ${orderUnit}` },
                      { l: "Best Master", v: `${slitCalc.best.mw}"` },
                      { l: "Master lbs needed", v: `${fmt(slitCalc.best.masterLbsNeeded, 0)} lbs` },
                      { l: "Alloy", v: `${alloyId}-${temper}` },
                      { l: "Gauge", v: `${gauge}"` },
                    ].map((r, i) => (
                      <div key={i}>
                        <p style={{ fontSize: 9, color: "#737373", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px" }}>{r.l}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{r.v}</p>
                      </div>
                    ))}
                  </div>
                )}
                {stockCoils.map((sc, i) => renderStockCard(sc, i, "slit"))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* CTL MODE */}
        {/* ══════════════════════════════════════════════════ */}
        {mode === "ctl" && (
          <>
            {/* CTL Requirements */}
            <div className="rcc-card">
              <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>CTL Sheet Requirements</p>
              <div className="rcc-grid4">
                <div>
                  <label style={S.lbl}>Piece Width (")</label>
                  <input type="number" step="0.1" value={ctlPieceWidth} onChange={(e) => setCtlPieceWidth(e.target.value)} style={S.inp} placeholder="e.g. 36" />
                </div>
                <div>
                  <label style={S.lbl}>Piece Length (")</label>
                  <input type="number" step="0.1" value={ctlPieceLength} onChange={(e) => setCtlPieceLength(e.target.value)} style={S.inp} placeholder="e.g. 120" />
                </div>
                <div>
                  <label style={S.lbl}>CTL Process Scrap %</label>
                  <input type="number" step="0.1" value={ctlScrap} onChange={(e) => setCtlScrap(e.target.value)} style={S.inp} placeholder="2" />
                </div>
                <div>
                  <label style={S.lbl}>Grain Requirement</label>
                  <select value={ctlGrainReq} onChange={(e) => setCtlGrainReq(e.target.value)} style={S.inp}>
                    <option value="none">None / Don't care</option>
                    <option value="length">Along piece LENGTH ↕</option>
                    <option value="width">Along piece WIDTH ↔</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <p style={{ fontSize: 10, color: "#525252", margin: 0, lineHeight: 1.6 }}>
                  <b>Grain note:</b> Coil grain runs in the rolling direction (along coil length / run direction).
                  Normal layout (piece width across coil) → grain along piece <b>length</b>.
                  Rotated layout (piece length across coil) → grain along piece <b>width</b>.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setCtlAnyOrientation(!ctlAnyOrientation)} style={{ ...btnStyle(ctlAnyOrientation), padding: "8px 14px", fontSize: 11 }}>
                  {ctlAnyOrientation ? "✓ Allow Rotation" : "✗ Fixed Orientation"}
                </button>
                {ctlGrainReq !== "none" && (
                  <span style={{ fontSize: 11, color: "#525252", fontStyle: "italic" }}>
                    Grain locked → only {ctlGrainReq === "length" ? "normal (non-rotated)" : "rotated"} layouts allowed
                    {!ctlAnyOrientation && ctlGrainReq === "width" ? " — but rotation is disabled, no valid layouts possible" : ""}
                  </span>
                )}
              </div>
              <div className="rcc-grid3" style={{ marginTop: 14 }}>
                <div>
                  <label style={S.lbl}>Order Qty (pcs)</label>
                  <input type="number" step="1" value={ctlQtyPcs} onChange={(e) => syncCtlQty("pcs", e.target.value)} style={S.inp} placeholder="e.g. 200" />
                </div>
                <div>
                  <label style={S.lbl}>Order Qty (lbs)</label>
                  <input type="number" step="1" value={ctlQtyLbs} onChange={(e) => syncCtlQty("lbs", e.target.value)} style={S.inp} placeholder="auto" />
                </div>
                <div>
                  <label style={S.lbl}>Order Qty (ft²)</label>
                  <input type="number" step="1" value={ctlQtyFt2} onChange={(e) => syncCtlQty("ft2", e.target.value)} style={S.inp} placeholder="auto" />
                </div>
              </div>
              {ctlPcWt > 0 && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#f5f5f5", borderRadius: 8, display: "flex", gap: 20 }}>
                  <span style={{ fontSize: 11, color: "#525252" }}><b>lbs/pc:</b> {fmt(ctlPcWt, 4)}</span>
                  <span style={{ fontSize: 11, color: "#525252" }}><b>ft²/pc:</b> {parseFloat(ctlPieceWidth) > 0 && parseFloat(ctlPieceLength) > 0 ? fmt((parseFloat(ctlPieceWidth) * parseFloat(ctlPieceLength)) / 144, 4) : "—"}</span>
                </div>
              )}
            </div>

            {/* In-Stock Master Coil */}
            {renderStockInputCard()}

            {/* Gauge warning */}
            {(gaugeOver || gaugeUnder) && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, margin: 0 }}>
              {gaugeOver ? "⛔ Gauge exceeds maximum (0.325\") — calculations suppressed until corrected." : "⛔ Gauge below minimum (0.006\") — calculations suppressed until corrected."}
              </p>
          </div>
          )}

            {/* Standard Master Width Options */}
            {!gaugeOver && ctlCalc && (
              <div className="rcc-card">
                <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Standard Master Width Options</p>
                <div className="rcc-width-grid">
                  {ctlCalc.results.map((r) => renderCTLWidthCard(r, ctlCalc.best))}
                </div>
                {ctlCalc.best && renderCTLSummaryBar(ctlCalc.best)}
                {!ctlCalc.best && (
                  <p style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                    Enter piece dimensions and gauge to see options.
                  </p>
                )}
              </div>
            )}

            {/* CTL Stock Coverage */}
            {!gaugeOver && ctlStockAnalysis.some((a) => a.valid) && (
              <div className="rcc-card">
                <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Stock Coverage Analysis</p>
                {ctlCalc?.best && parseFloat(ctlQtyPcs) > 0 && (
                  <div style={{ background: "linear-gradient(135deg,#171717,#262626)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 16 }}>
                    {[
                      { l: "Sheet Size", v: `${ctlPieceWidth}"×${ctlPieceLength}"` },
                      { l: "Order", v: `${ctlQtyPcs} pcs` },
                      { l: "lbs", v: ctlQtyLbs ? `${parseFloat(ctlQtyLbs).toLocaleString()} lbs` : "—" },
                      { l: "Best Master", v: `${ctlCalc.best.mw}"` },
                      { l: "Alloy", v: `${alloyId}-${temper}` },
                      { l: "Gauge", v: `${gauge}"` },
                    ].map((r, i) => (
                      <div key={i}>
                        <p style={{ fontSize: 9, color: "#737373", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px" }}>{r.l}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{r.v}</p>
                      </div>
                    ))}
                  </div>
                )}
                {stockCoils.map((sc, i) => renderStockCard(sc, i, "ctl"))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* COIL INFO MODE */}
        {/* ══════════════════════════════════════════════════ */}
        {mode === "info" && (
          <>
            <div className="rcc-card">
              <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Coil Specifications</p>
              <div className="rcc-grid4">
                <div>
                  <label style={S.lbl}>Coil Width (")</label>
                  <input type="number" step="0.125" value={infoWidth} onChange={(e) => setInfoWidth(e.target.value)} style={S.inp} placeholder="e.g. 48" />
                </div>
                <div>
                  <label style={S.lbl}>Coil Weight (lbs)</label>
                  <input type="number" step="1" value={infoWeight} onChange={(e) => setInfoWeight(e.target.value)} style={S.inp} placeholder="e.g. 8400" />
                </div>
              </div>
              <p style={{ fontSize: 10, color: "#a3a3a3", marginTop: 10, fontStyle: "italic" }}>Uses alloy, gauge, and core ID from the Material section above.</p>
            </div>

            {coilInfo && (
              <div className="rcc-card" style={{ border: "2px solid #dc2626" }}>
                <p style={{ ...S.sec, marginBottom: 14 }}><span style={S.dot}></span>Coil Data — {alloyId}-{temper} {gauge}" × {infoWidth}"</p>
                <div className="rcc-grid4" style={{ marginBottom: 16 }}>
                  <div style={{ ...metricBox(true), gridColumn: "span 2" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#737373", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Linear Footage</p>
                    <p style={{ fontSize: 36, fontWeight: 800, color: "#dc2626", margin: 0, letterSpacing: "-1px" }}>{fmt(coilInfo.ft, 1)}</p>
                    <p style={{ fontSize: 11, color: "#a3a3a3", marginTop: 4 }}>ft &nbsp;·&nbsp; {fmt(coilInfo.inches, 0)}" &nbsp;·&nbsp; {fmt(coilInfo.meters, 1)} m</p>
                  </div>
                  <div style={{ ...metricBox(true), gridColumn: "span 2" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#737373", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Coil OD</p>
                    <p style={{ fontSize: 36, fontWeight: 800, color: "#dc2626", margin: 0, letterSpacing: "-1px" }}>{fmt(coilInfo.od, 2)}"</p>
<p style={{ fontSize: 11, color: "#a3a3a3", marginTop: 4 }}>{fmt(coilInfo.odMM, 1)} mm &nbsp;·&nbsp; {fmt(coilInfo.coreBuildup, 3)}" buildup/side</p>
{!coilInfo.odValid && <p style={{ fontSize: 10, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>⚠ Computed OD is less than 0.25" above core ID — check weight and core size inputs.</p>}
                  </div>
                </div>
                <div className="rcc-grid4">
                  {[
                    { l: "lbs / linear ft", v: fmt(coilInfo.lpf, 4), primary: true },
                    { l: "lbs / linear in", v: fmt(coilInfo.lbsPerIn, 5) },
                    { l: "lbs / ft²", v: fmt(coilInfo.lpSqFt, 4) },
                    { l: "kg / linear m", v: fmt(coilInfo.kgPerMeter, 4) },
                    { l: "Square Footage", v: fmt(coilInfo.sqFt, 1) },
                    { l: "Core ID", v: `${coreIn}"` },
                    { l: "Density", v: `${density} lb/in³` },
                    { l: "Alloy / Temper", v: `${alloyId}-${temper}` },
                  ].map((item, i) => (
                    <div key={i} style={metricBox(item.primary)}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#737373", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{item.l}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: item.primary ? "#dc2626" : "#171717", margin: 0 }}>{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── DENSITY REFERENCE ─────────────────────────────── */}
        <div className="rcc-card" style={{ padding: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#404040", marginBottom: 8 }}>📊 Density Reference (lb/in³)</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {ALLOYS.map((a) => (
              <span key={a.id} onClick={() => setAlloyId(a.id)} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, cursor: "pointer", transition: "all 0.1s", background: alloyId === a.id ? "#fee2e2" : "#f5f5f5", color: alloyId === a.id ? "#dc2626" : "#525252", fontWeight: alloyId === a.id ? 700 : 400, border: `1px solid ${alloyId === a.id ? "#fecaca" : "#e5e5e5"}` }}>
                {a.label}: {a.density}
              </span>
            ))}
          </div>
        </div>

        {/* ── HISTORY ──────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="rcc-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#171717,#262626)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Saved Calculations ({history.length})</p>
              <button onClick={() => setHistory([])} style={{ fontSize: 10, color: "#a3a3a3", background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Clear All</button>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((rec) => (
                <div key={rec.id} style={{ background: "linear-gradient(135deg,#fafafa,#fff)", borderRadius: 12, padding: "12px 16px", border: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#fee2e2", color: "#dc2626" }}>{rec.mode}</span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#171717", margin: 0 }}>{rec.label}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "#737373", margin: 0 }}>{rec.detail}</p>
                  </div>
                  <button onClick={() => setHistory((h) => h.filter((r) => r.id !== rec.id))} style={{ fontSize: 16, color: "#a3a3a3", background: "none", border: "none", cursor: "pointer", fontFamily: font, flexShrink: 0, lineHeight: 1 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ───────────────────────────────────────── */}
        <div className="rcc-footer">
          <p style={{ margin: 0 }}>Rolled Coil Calculator — Champagne Metals</p>
          <p style={{ margin: 0, fontStyle: "italic" }}>Erin Morgan — ext. 289</p>
        </div>

      </div>
    </div>
  );
}

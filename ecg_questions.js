// =====================================================
// 6章：心電図・不整脈 問題データ & SVG描画関数
// =====================================================

// ---------- SVG描画ユーティリティ ----------

function _ecgGrid(svg, w, h) {
  for (let x = 0; x <= w; x += 6.6) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x); l.setAttribute('y1', 0);
    l.setAttribute('x2', x); l.setAttribute('y2', h);
    l.setAttribute('stroke', '#f4a460'); l.setAttribute('stroke-width', '0.6');
    svg.appendChild(l);
  }
  for (let y = 0; y <= h; y += 6.6) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 0); l.setAttribute('y1', y);
    l.setAttribute('x2', w); l.setAttribute('y2', y);
    l.setAttribute('stroke', '#f4a460'); l.setAttribute('stroke-width', '0.6');
    svg.appendChild(l);
  }
  for (let x = 0; x <= w; x += 33) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x); l.setAttribute('y1', 0);
    l.setAttribute('x2', x); l.setAttribute('y2', h);
    l.setAttribute('stroke', '#c0502a'); l.setAttribute('stroke-width', '1.2');
    svg.appendChild(l);
  }
  for (let y = 0; y <= h; y += 33) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 0); l.setAttribute('y1', y);
    l.setAttribute('x2', w); l.setAttribute('y2', y);
    l.setAttribute('stroke', '#c0502a'); l.setAttribute('stroke-width', '1.2');
    svg.appendChild(l);
  }
}

function _ecgPath(svg, points) {
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly.setAttribute('points', points.map(p => p[0] + ',' + p[1]).join(' '));
  poly.setAttribute('fill', 'none');
  poly.setAttribute('stroke', '#111');
  poly.setAttribute('stroke-width', '1.5');
  poly.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(poly);
}

// ---------- 各波形描画 ----------

function _drawAF(svg) {
  const w = 660, h = 120, bl = 70;
  _ecgGrid(svg, w, h);
  const qrsStarts = [30, 72, 118, 148, 198, 232, 282, 316, 370, 402, 452, 488, 542, 580, 628];
  const isInQRS = x => qrsStarts.some(q => x >= q && x < q + 10);
  let fPts = [];
  for (let x = 0; x < w; x += 1.5) {
    if (isInQRS(x)) continue;
    const y = bl + Math.sin(x * 0.6) * 1.2 + Math.sin(x * 1.3) * 0.7 + Math.sin(x * 2.7) * 0.4;
    fPts.push([x, y]);
  }
  _ecgPath(svg, fPts);
  for (const q of qrsStarts) {
    if (q + 10 > w) break;
    const fEnd = bl + Math.sin((q + 10) * 0.6) * 1.2 + Math.sin((q + 10) * 1.3) * 0.7;
    _ecgPath(svg, [[q, bl], [q+2, bl+3], [q+4, bl-22], [q+7, bl+8], [q+10, fEnd]]);
  }
}

function _drawBrady(svg) {
  const w = 660, h = 120, bl = 70;
  _ecgGrid(svg, w, h);
  const rr = 198;
  const starts = [5, 5+rr, 5+rr*2, 5+rr*3];
  let pts = [[0, bl]];
  for (const s of starts) {
    pts.push([s,bl],[s+5,bl],[s+8,bl-7],[s+11,bl],[s+15,bl],[s+17,bl+3],[s+19,bl-28],[s+21,bl+8],[s+24,bl],[s+28,bl-4],[s+33,bl]);
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawCHB(svg) {
  const w = 660, h = 120, bl = 70;
  _ecgGrid(svg, w, h);
  const pStarts = [18, 150, 282, 414, 546];
  const qStarts = [55, 253, 451, 649];
  const events = [
    ...pStarts.map(x => ({ x, t: 'p' })),
    ...qStarts.map(x => ({ x, t: 'q' })),
  ].sort((a, b) => a.x - b.x);
  let pts = [[0, bl]];
  for (const ev of events) {
    pts.push([ev.x, bl]);
    if (ev.t === 'p') {
      pts.push([ev.x+4, bl-8], [ev.x+8, bl]);
    } else {
      pts.push([ev.x+3, bl+5],[ev.x+7, bl-26],[ev.x+12, bl+12],[ev.x+17, bl],[ev.x+22, bl-5],[ev.x+28, bl]);
    }
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawAFL(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const fPer = 33;
  const qrsStarts = [2, 134, 266, 398, 530];
  const pts = [[0, bl]];
  let cursor = 0;
  function addF(from, to) {
    for (let x = from; x < to; x += 0.8) {
      const phase = ((x % fPer) + fPer) % fPer / fPer;
      const dy = phase < 0.8 ? (phase/0.8)*9 : 9*(1-(phase-0.8)/0.2);
      pts.push([x, bl + dy]);
    }
  }
  for (const q of qrsStarts) {
    addF(cursor, q);
    pts.push([q,bl],[q+3,bl+4],[q+7,bl-20],[q+11,bl+6],[q+15,bl]);
    cursor = q + 15;
  }
  addF(cursor, w);
  _ecgPath(svg, pts);
}

function _drawVF(svg) {
  const w = 660, h = 120, bl = 60;
  _ecgGrid(svg, w, h);
  const pts = [];
  for (let x = 0; x < w; x++) {
    const y = bl + Math.sin(x*0.19+0.5)*18 + Math.sin(x*0.31+1.8)*12 + Math.sin(x*0.53+0.3)*8 + Math.sin(x*0.07+2.1)*14 + Math.sin(x*0.77+0.9)*6;
    pts.push([x, Math.max(8, Math.min(h-8, y))]);
  }
  _ecgPath(svg, pts);
}

function _drawVT(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const pts = [[0, bl]];
  for (let s = 5; s < w - 31; s += 33) {
    pts.push([s,bl],[s+2,bl+4],[s+8,bl-22],[s+14,bl+12],[s+19,bl+5],[s+28,bl+1],[s+31,bl]);
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawPVC(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const events = [
    ...([5,150,295,440,585]).map(x => ({x, t:'n'})),
    ...([60,205,350,495]).map(x => ({x, t:'v'})),
  ].sort((a,b) => a.x - b.x);
  const pts = [[0, bl]];
  for (const e of events) {
    pts.push([e.x, bl]);
    if (e.t === 'n') {
      pts.push([e.x+3,bl],[e.x+6,bl-7],[e.x+10,bl],[e.x+14,bl],[e.x+16,bl+3],[e.x+18,bl-26],[e.x+20,bl+8],[e.x+22,bl],[e.x+26,bl-3],[e.x+32,bl]);
    } else {
      pts.push([e.x+4,bl+6],[e.x+9,bl-30],[e.x+16,bl+18],[e.x+21,bl+8],[e.x+26,bl]);
    }
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawMPVC(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const events = [
    {x:5,t:'n'},{x:99,t:'n'},{x:165,t:'a'},{x:260,t:'n'},{x:330,t:'b'},{x:440,t:'n'},{x:510,t:'a'},{x:600,t:'n'},
  ];
  const pts = [[0, bl]];
  for (const e of events) {
    pts.push([e.x, bl]);
    if (e.t === 'n') {
      pts.push([e.x+5,bl],[e.x+8,bl-6],[e.x+11,bl],[e.x+14,bl],[e.x+16,bl+3],[e.x+18,bl-26],[e.x+20,bl+8],[e.x+22,bl],[e.x+26,bl-3],[e.x+30,bl]);
    } else if (e.t === 'a') {
      pts.push([e.x+3,bl-5],[e.x+7,bl-28],[e.x+13,bl+16],[e.x+18,bl+3],[e.x+23,bl]);
    } else {
      pts.push([e.x+3,bl+5],[e.x+7,bl+28],[e.x+13,bl-12],[e.x+18,bl-3],[e.x+23,bl]);
    }
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawWenck(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const pp = 66, prSeq = [26, 33, 42, null];
  const pts = [[0, bl]];
  let pPos = 5, cycle = 0;
  while (pPos < w - 10) {
    const pr = prSeq[cycle % 4];
    pts.push([pPos,bl],[pPos+4,bl-7],[pPos+8,bl]);
    if (pr !== null) {
      const q = pPos + pr;
      if (q + 18 < w) {
        pts.push([q,bl],[q+2,bl+3],[q+4,bl-24],[q+6,bl+8],[q+8,bl],[q+12,bl-3],[q+18,bl]);
      }
    }
    pPos += pp; cycle++;
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawMob2(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const pp = 66, pr = 20;
  const pts = [[0, bl]];
  let pPos = 5, cycle = 0;
  while (pPos < w - 10) {
    const blocked = (cycle % 3 === 2);
    pts.push([pPos,bl],[pPos+4,bl-7],[pPos+8,bl]);
    if (!blocked) {
      const q = pPos + pr;
      if (q + 18 < w) {
        pts.push([q,bl],[q+2,bl+3],[q+4,bl-24],[q+6,bl+8],[q+8,bl],[q+12,bl-3],[q+18,bl]);
      }
    }
    pPos += pp; cycle++;
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _draw1AVB(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const rr = 132, pr = 50;
  const pts = [[0, bl]];
  for (let s = 5; s < w - 70; s += rr) {
    const q = s + pr;
    pts.push([s,bl],[s+5,bl-10],[s+10,bl]);
    if (q + 20 < w) {
      pts.push([q,bl],[q+2,bl+3],[q+4,bl-26],[q+6,bl+8],[q+8,bl],[q+13,bl-4],[q+20,bl]);
    }
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

function _drawSArrest(svg) {
  const w = 660, h = 120, bl = 68;
  _ecgGrid(svg, w, h);
  const normalStarts = [5, 104, 354, 453];
  const pts = [[0, bl]];
  for (const s of normalStarts) {
    pts.push([s,bl],[s+4,bl-6],[s+8,bl],[s+14,bl],[s+16,bl+3],[s+18,bl-25],[s+20,bl+8],[s+22,bl],[s+26,bl-3],[s+33,bl]);
  }
  pts.push([w, bl]);
  _ecgPath(svg, pts);
}

// ---------- ディスパッチ関数 ----------
function drawECG(svg, ecgType) {
  svg.innerHTML = '';
  const map = {
    'af': _drawAF, 'brady': _drawBrady, 'chb': _drawCHB,
    'afl': _drawAFL, 'vf': _drawVF, 'vt': _drawVT,
    'pvc': _drawPVC, 'mpvc': _drawMPVC, 'wenck': _drawWenck,
    'mob2': _drawMob2, '1avb': _draw1AVB, 'sarrest': _drawSArrest,
  };
  if (map[ecgType]) map[ecgType](svg);
}

// ---------- 問題データ ----------
const ECG_QUESTIONS = [
  {
    id: 601, chapter: 6, chapterName: '心電図・不整脈', qNum: 1,
    question: '下の心電図を見て、不整脈の種類として正しいのはどれか。',
    options: ['洞性徐脈', '心房細動（AF）', '心房粗動（AFL）', '3度房室ブロック', '心室頻拍（VT）'],
    answer: 2,
    explanation: '【正解：②心房細動（AF）】P波が消失しf波（基線の細かい揺れ）が出現、RR間隔が不規則なのが特徴。洞性徐脈はP波が一定間隔で出現する。心房粗動はF波（のこぎり歯状）が規則的で、RR間隔は一定。3度房室ブロックはP波とQRSが無関係に出現するが、P波自体は見られる。心室頻拍は幅広いQRSが連続する。',
    ecgType: 'af'
  },
  {
    id: 602, chapter: 6, chapterName: '心電図・不整脈', qNum: 2,
    question: '下の心電図の心拍数として最も近いのはどれか。（小さいマス=0.04秒、大きいマス=0.2秒）',
    options: ['約72bpm', '約60bpm', '約33bpm', '約100bpm', '約50bpm'],
    answer: 3,
    explanation: '【正解：③約33bpm】心拍数の計算式：1500 ÷ (5mm × RR間隔マス数)。この心電図のRR間隔は約9マス（大きいマス）。→ 1500 ÷ (5 × 9) = 33bpm。40bpm以下を洞性徐脈という。72bpmはRR間隔4マス（正常洞調律）、60bpmは5マス、100bpmは3マスに相当する。',
    ecgType: 'brady'
  },
  {
    id: 603, chapter: 6, chapterName: '心電図・不整脈', qNum: 3,
    question: '下の心電図の特徴として正しいのはどれか。',
    options: ['P-R間隔が延長している', 'P波が消失しRR間隔が不規則', 'P波とQRSが全く無関係に出現している', 'QRSが突然1拍脱落する', 'RR間隔が徐々に延長し最後に1拍脱落する'],
    answer: 3,
    explanation: '【正解：③P波とQRSが全く無関係に出現している（3度完全房室ブロック）】洞結節からの指令が全く心室に伝わらず、心室は補充収縮で独自に動く。P-R間隔延長は1度AVB、P波消失・RR不規則はAF、QRS突然脱落はモビッツII型、RR徐々に延長→脱落はウェンケバッハ型の特徴。',
    ecgType: 'chb'
  },
  {
    id: 604, chapter: 6, chapterName: '心電図・不整脈', qNum: 4,
    question: '下の心電図の特徴として正しいのはどれか。',
    options: ['P波が消失しRR間隔が不規則', '規則的なF波（のこぎり歯状）が出現しRR間隔は一定', 'P波とQRSが全く無関係に出現している', '幅広いQRSが速いレートで連続している', 'PR間隔が延長しているが全拍でQRSが出現する'],
    answer: 2,
    explanation: '【正解：②心房粗動（AFL）】心房レート約300bpm、規則的なF波（のこぎり歯状）が特徴。心室へは2:1〜4:1で伝導しRR間隔は一定。P波消失・RR不規則はAF、P波とQRS無関係は3度AVB、幅広QRS連続はVT、PR延長・全拍QRS出現は1度AVBの特徴。',
    ecgType: 'afl'
  },
  {
    id: 605, chapter: 6, chapterName: '心電図・不整脈', qNum: 5,
    question: '下の心電図の対応として最も適切なのはどれか。',
    options: ['経過観察', '抗不整脈薬の投与', '直ちに除細動（AED/DC）と心肺蘇生', 'ペースメーカー挿入', '運動療法を即中止し安静'],
    answer: 3,
    explanation: '【正解：③直ちに除細動と心肺蘇生（心室細動VF）】VFは心室の痙攣で心拍出量ゼロ。1分以内の除細動が生存率を左右する致死性不整脈。経過観察・安静は不可。抗不整脈薬のみでは対応不可。ペースメーカーは徐脈の治療でVFには無効。',
    ecgType: 'vf'
  },
  {
    id: 606, chapter: 6, chapterName: '心電図・不整脈', qNum: 6,
    question: '下の心電図を見て、この不整脈への対応として正しいのはどれか。',
    options: ['運動を継続してよい', '運動を即中止し、持続する場合は除細動を検討', 'β遮断薬を追加して運動継続', 'ペースメーカーを挿入する', '利尿薬を投与して経過観察'],
    answer: 2,
    explanation: '【正解：②運動を即中止し、持続する場合は除細動（心室頻拍VT）】幅広いQRS（>0.12秒）が連続し、心拍数100〜250bpm。30秒以上続く持続性VTは即除細動適応。30秒未満で自然停止するNSVTは経過観察。ペースメーカーは徐脈の治療でVTには適応なし。',
    ecgType: 'vt'
  },
  {
    id: 607, chapter: 6, chapterName: '心電図・不整脈', qNum: 7,
    question: '下の心電図で、正常拍の間に出現する異常波形の特徴として正しいのはどれか。',
    options: ['正常より幅が狭くP波を伴う', '形の異なるQRSが混在している', 'P波がなく幅広いQRSで、毎回同じ形をしている', 'P波の後にQRSが出現しない', 'RR間隔が徐々に延長する'],
    answer: 3,
    explanation: '【正解：③単源性心室期外収縮（PVC）二段脈】P波なし・幅広QRS・毎回同じ形が特徴。心室の1ヶ所から出る異常興奮で、形が一定（単源性）。本例は2拍に1拍の二段脈（bigeminy）。幅が狭くP波を伴うのは心房期外収縮、形の異なるQRSが混在するのは多源性PVC。',
    ecgType: 'pvc'
  },
  {
    id: 608, chapter: 6, chapterName: '心電図・不整脈', qNum: 8,
    question: '下の心電図の異常波形について正しいのはどれか。',
    options: ['異常波形は全て同じ形をしている', '緊急性は低いため運動継続可能', '形の異なるQRSが混在し、心室頻拍・心室細動へ移行しやすい', 'P波が見えないためAFと鑑別できない', 'PR間隔の延長が特徴である'],
    answer: 3,
    explanation: '【正解：③多源性PVC（心室頻拍・心室細動へ移行リスク）】複数の心室異所性起源から出るため形が異なる。致死性不整脈に移行しやすく緊急性が高い。正常拍のP波が確認でき、AFとの鑑別は可能。単源性PVCは全て同じ形をしている。',
    ecgType: 'mpvc'
  },
  {
    id: 609, chapter: 6, chapterName: '心電図・不整脈', qNum: 9,
    question: '下の心電図の特徴として正しいのはどれか。',
    options: ['PR間隔が一定のままQRSが突然脱落する', 'PR間隔が徐々に延長し最終的にQRSが1拍脱落する', 'P波とQRSが完全に無関係に出現する', 'P波が消失しRR間隔が不規則になる', 'PR間隔が全拍で0.3秒以上に延長している'],
    answer: 2,
    explanation: '【正解：②2度房室ブロック ウェンケバッハ（モビッツI）型】PR間隔が徐々に延長→QRS脱落を繰り返す。房室結節レベルの障害で予後は比較的良好。PR一定でQRS突然脱落はモビッツII型、P波とQRS完全無関係は3度ブロック、P波消失・RR不規則はAFの特徴。',
    ecgType: 'wenck'
  },
  {
    id: 610, chapter: 6, chapterName: '心電図・不整脈', qNum: 10,
    question: '下の心電図について正しいのはどれか。',
    options: ['PR間隔が徐々に延長している', '予後は2度ブロックの中で最も良好である', 'PR間隔は一定のままQRSが突然脱落し、3度ブロックへ移行しやすい', '心室補充収縮が出現しP波とQRSが無関係', 'RR間隔が整数倍で再開する'],
    answer: 3,
    explanation: '【正解：③2度房室ブロック モビッツII型】PR間隔一定のままQRSが突然脱落する。His束以下の障害で3度ブロックへ移行しやすく予後不良。ペースメーカー適応を検討する。PR間隔が徐々に延長するのはウェンケバッハ型（予後良好）。RR整数倍での再開は洞房ブロックの特徴。',
    ecgType: 'mob2'
  },
  {
    id: 611, chapter: 6, chapterName: '心電図・不整脈', qNum: 11,
    question: '下の心電図の特徴として正しいのはどれか。（正常PR間隔：0.2秒＝大きいマス1個）',
    options: ['QRSが規則的に脱落している', 'P波が消失している', '全拍でQRSは出現しているがPR間隔が延長している', 'P波とQRSが無関係に出現している', 'RR間隔が不規則である'],
    answer: 3,
    explanation: '【正解：③1度房室ブロック】PR>0.2秒（大マス1個以上）が診断基準。全拍でQRSが出現し房室伝導遅延だが心室には伝わる。QRS脱落は2度AVB、P波消失はAF、P波とQRS無関係は3度AVB、RR不規則はAFやPVCの特徴。単独では臨床的意義は少ないが、他の疾患と合併することがある。',
    ecgType: '1avb'
  },
  {
    id: 612, chapter: 6, chapterName: '心電図・不整脈', qNum: 12,
    question: '下の心電図で、一時的にP波とQRSが消失する部分の特徴として正しいのはどれか。',
    options: ['停止後のP-P間隔は停止前の整数倍になる', '停止後のP-P間隔は停止前の整数倍にならない', 'P波のみが消失しQRSは維持される', 'P波の形が変わる', '停止後はQRS幅が広くなる'],
    answer: 2,
    explanation: '【正解：②洞停止（sinus arrest）】洞結節自体が興奮しないため、再開のタイミングがランダムで整数倍にならない。洞房ブロックは洞結節が正常に興奮しても心房への伝導がブロックされるため、停止後のP-P間隔は正確に整数倍になる（鑑別点）。洞停止では原則P波とQRSの両方が消失する。',
    ecgType: 'sarrest'
  },
];

// QUESTIONS配列にECG問題を追加
QUESTIONS.push(...ECG_QUESTIONS);

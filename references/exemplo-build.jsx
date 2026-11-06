// EXEMPLO APROVADO (vídeo "venda que ninguém fez", 55 s). Ao reutilizar: ajuste SKILL_DIR e VID, o nome da comp, DUR, os cortes FULL/PIP em `cuts` e todas as cenas/tempos.
// Motion graphics v2 — vídeo follow-up Arttico (ícones, logos, desenhos, volta pra tela cheia)
var SKILL_DIR = "C:/Users/SEU_USUARIO/.claude/skills/motion/"; // ajuste: pasta desta skill (barras /)
var VID = "C:/caminho/do/video.mp4"; // ajuste: vídeo original
var LOGO = SKILL_DIR + "assets/logo-arttico.png";
var W = 1080, H = 1920, FPS = 24, DUR = 55.2;

var BG = [0.004, 0, 0.19], NAVY = [0, 0.067, 0.27], NAVY2 = [0.07, 0.14, 0.38], CY = [0.22, 0.84, 1], CY2 = [0.64, 0.89, 0.94],
    WH = [1, 1, 1], GR = [0.6, 0.65, 0.75], RED = [1, 0.33, 0.4], BLK = [0.02, 0.02, 0.04],
    IGY = [1, 0.85, 0.46], IGO = [0.98, 0.49, 0.12], IGP = [0.84, 0.16, 0.46], IGU = [0.59, 0.18, 0.75],
    TKC = [0.15, 0.96, 0.93], TKR = [1, 0.17, 0.33];
var LEFT = ParagraphJustification.LEFT_JUSTIFY, CENTER = ParagraphJustification.CENTER_JUSTIFY;

var p = app.project;
var vid = p.importFile(new ImportOptions(new File(VID)));
var logo = p.importFile(new ImportOptions(new File(LOGO)));
var c = p.items.addComp("Follow-up Arttico v2", W, H, 1, DUR, FPS);

// ───────── helpers base ─────────
function T(l) { return l.property("Transform"); }
function nk(prop) { try { return prop.numKeys; } catch (e) { return 0; } }
function easeAll(prop) {
  var n = nk(prop);
  for (var k = 1; k <= n; k++) { try { prop.setTemporalEaseAtKey(k, [new KeyframeEase(0, 75)], [new KeyframeEase(0, 75)]); } catch (e) {} }
}
function key(prop, pairs) { for (var i = 0; i < pairs.length; i++) prop.setValueAtTime(pairs[i][0], pairs[i][1]); easeAll(prop); }
function vat(prop, t) { try { return prop.valueAtTime(t, false); } catch (e) { return prop.value; } }
function newC(name, w, h) { return p.items.addComp(name, w || 400, h || 400, 1, DUR, FPS); }
function S(C, x, y, name) { var l = C.layers.addShape(); if (name) l.name = name; T(l).property("Position").setValue([x, y]); return l; }
function G(l) { return l.property("Contents").addProperty("ADBE Vector Group"); }
function gc(g) { return g.property("Contents"); }
function aRect(g, w, h, r, x, y) { var s = gc(g).addProperty("ADBE Vector Shape - Rect"); s.property("Size").setValue([w, h]); s.property("Roundness").setValue(r || 0); if (x !== undefined) s.property("Position").setValue([x, y]); return s; }
function aEll(g, w, h, x, y) { var s = gc(g).addProperty("ADBE Vector Shape - Ellipse"); s.property("Size").setValue([w, h]); if (x !== undefined) s.property("Position").setValue([x, y]); return s; }
function mkShape(v, inT, outT, closed) {
  var s = new Shape(); s.vertices = v;
  var z = []; for (var i = 0; i < v.length; i++) z.push([0, 0]);
  s.inTangents = inT || z; s.outTangents = outT || z; s.closed = !!closed; return s;
}
function aPath(g, v, inT, outT, closed) { var s = gc(g).addProperty("ADBE Vector Shape - Group"); s.property("Path").setValue(mkShape(v, inT, outT, closed)); return s; }
function fill(g, col, op) { var f = gc(g).addProperty("ADBE Vector Graphic - Fill"); f.property("Color").setValue(col); if (op !== undefined) f.property("Opacity").setValue(op); return f; }
function strk(g, col, w) {
  var s = gc(g).addProperty("ADBE Vector Graphic - Stroke"); s.property("Color").setValue(col); s.property("Stroke Width").setValue(w || 8);
  try { s.property("Line Cap").setValue(2); s.property("Line Join").setValue(2); } catch (e) {}
  return s;
}
function trim(g, t0, t1) { var tr = gc(g).addProperty("ADBE Vector Filter - Trim"); key(tr.property("End"), [[t0, 0], [t1, 100]]); return tr; }
function gfill(g, stops, sp, ep) {
  var gf = gc(g).addProperty("ADBE Vector Graphic - G-Fill");
  gf.property("Start Point").setValue(sp); gf.property("End Point").setValue(ep);
  var cols = [], ops = [];
  for (var i = 0; i < stops.length; i++) { cols.push([stops[i][0], [stops[i][1][0], stops[i][1][1], stops[i][1][2], 1]]); }
  ops = [[0, 1], [1, 1]];
  try { gf.property("Colors").setValue({ colors: cols, opacities: ops }); }
  catch (e) { try { gf.property("Colors").setValue({ t: "Gradient", v: { colors: cols, opacities: ops } }); } catch (e2) { writeLn("gradient fallback: " + e2); } }
  return gf;
}
function ctext(C, str, size, col, x, y, o) {
  o = o || {};
  var l = C.layers.addText(str); l.name = "t: " + str.substr(0, 20);
  var td = l.property("Source Text").value;
  td.fontFamily = "Inter"; td.fontStyle = o.style || "Bold"; td.fontSize = size; td.fillColor = col;
  td.justification = o.just || CENTER;
  if (o.tracking !== undefined) td.tracking = o.tracking;
  l.property("Source Text").setValue(td);
  T(l).property("Position").setValue([x, y]);
  return l;
}
function nest(C, sub, x, y, s) { var l = C.layers.add(sub); l.startTime = 0; T(l).property("Position").setValue([x, y]); if (s) T(l).property("Scale").setValue([s, s]); return l; }

// animação de entrada/saída de um layer no comp principal
function anim(l, tin, tout, o) {
  o = o || {};
  var tr = T(l), pos = tr.property("Position").value, sc = tr.property("Scale").value[0], d = o.d || 0.5, a = o.a || "up";
  l.inPoint = tin; l.outPoint = tout;
  key(tr.property("Opacity"), [[tin, 0], [tin + d * 0.5, o.op || 100], [tout - 0.25, o.op || 100], [tout, 0]]);
  if (a === "pop") key(tr.property("Scale"), [[tin, [0, 0]], [tin + d * 0.65, [sc * 1.12, sc * 1.12]], [tin + d, [sc, sc]]]);
  else if (a === "up") key(tr.property("Position"), [[tin, [pos[0], pos[1] + 60]], [tin + d, pos]]);
  else if (a === "down") key(tr.property("Position"), [[tin, [pos[0], pos[1] - 60]], [tin + d, pos]]);
  else if (a === "left") key(tr.property("Position"), [[tin, [pos[0] + 120, pos[1]]], [tin + d, pos]]);
  else if (a === "right") key(tr.property("Position"), [[tin, [pos[0] - 120, pos[1]]], [tin + d, pos]]);
  return l;
}
function place(C, x, y, tin, tout, o) {
  o = o || {};
  var l = c.layers.add(C); l.startTime = 0; l.name = C.name;
  T(l).property("Position").setValue([x, y]);
  var s = o.s || 100; T(l).property("Scale").setValue([s, s]);
  return anim(l, tin, tout, { a: o.a || "pop", d: o.d });
}
function moveTo(l, t0, t1, xy, s) {
  var pp = T(l).property("Position"); key(pp, [[t0, vat(pp, t0)], [t1, xy]]);
  if (s !== undefined) { var sp = T(l).property("Scale"); key(sp, [[t0, vat(sp, t0)], [t1, [s, s]]]); }
}
function txt(str, size, col, x, y, tin, tout, o) {
  o = o || {};
  var l = ctext(c, str, size, col, x, y, o);
  return anim(l, tin, tout, o);
}

// ───────── ícones (cada um é um precomp 400x400, centro 200,200) ─────────
var LOGOS = SKILL_DIR + "assets/";
var igImg = p.importFile(new ImportOptions(new File(LOGOS + "instagram.png")));
var ttImg = p.importFile(new ImportOptions(new File(LOGOS + "tiktok.png")));
function imgIcon(name, img) { var C = newC(name); nest(C, img, 200, 200, 42); return C; }
function icInstagram() { return imgIcon("Logo Instagram", igImg); }
function icTikTok() { return imgIcon("Logo TikTok", ttImg); }
function icDoc(accent) {
  var C = newC("Doc");
  var l = S(C, 200, 200); var g = G(l); aPath(g, [[-75, -100], [35, -100], [75, -60], [75, 100], [-75, 100]], null, null, true); fill(g, WH);
  var f = S(C, 200, 200); g = G(f); aPath(g, [[35, -100], [35, -60], [75, -60]], null, null, true); fill(g, CY2);
  var ln = S(C, 200, 200);
  var ys = [-30, 0, 30, 60], ws = [100, 100, 70, 40];
  for (var i = 0; i < 4; i++) { g = G(ln); aRect(g, ws[i], 12, 6, -45 + ws[i] / 2 - 5, ys[i]); fill(g, i === 3 ? (accent || CY) : NAVY2); }
  var t = S(C, 200, 200); g = G(t); aRect(g, 60, 14, 7, -20, -62); fill(g, accent || CY);
  return C;
}
function icClock(col) {
  var C = newC("Relógio");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 200, 200); fill(g, NAVY); g = G(b); aEll(g, 200, 200); strk(g, col || CY, 14);
  var tk = S(C, 200, 200);
  var pts = [[0, -78], [78, 0], [0, 78], [-78, 0]];
  for (var i = 0; i < 4; i++) { g = G(tk); aEll(g, 14, 14, pts[i][0], pts[i][1]); fill(g, CY2); }
  var h1 = S(C, 200, 200); g = G(h1); aPath(g, [[0, 0], [0, -45]]); strk(g, WH, 14); h1.property("Transform").property("Rotation").expression = "time*80";
  var h2 = S(C, 200, 200); g = G(h2); aPath(g, [[0, 0], [0, -66]]); strk(g, col || CY, 10); h2.property("Transform").property("Rotation").expression = "time*480";
  var dt = S(C, 200, 200); g = G(dt); aEll(g, 22, 22); fill(g, WH);
  return C;
}
function icPlay() {
  var C = newC("Play");
  var b = S(C, 200, 200); var g = G(b); aRect(g, 230, 170, 44); fill(g, RED);
  var t = S(C, 200, 200); g = G(t); aPath(g, [[-26, -40], [44, 0], [-26, 40]], null, null, true); fill(g, WH);
  return C;
}
function heartShape(g) {
  aPath(g, [[0, -54], [64, 10], [0, 74], [-64, 10]], null, null, true);
  aEll(g, 90, 90, 32, -22); aEll(g, 90, 90, -32, -22);
}
function icHeart(col) { var C = newC("Coração"); var l = S(C, 200, 190); var g = G(l); heartShape(g); fill(g, col || IGP); return C; }
function icBell(t0) {
  var C = newC("Sino");
  var l = S(C, 200, 105); var g;
  g = G(l); aEll(g, 26, 26, 0, 0); fill(g, CY);
  g = G(l); aPath(g, [[-95, 160], [-70, 135], [-62, 70], [0, 8], [62, 70], [70, 135], [95, 160]],
    [[0, 0], [0, 10], [0, 40], [-45, 0], [0, -40], [0, -10], [0, 0]],
    [[0, 0], [0, -10], [0, -40], [45, 0], [0, 40], [0, 10], [0, 0]], true); fill(g, CY);
  g = G(l); aEll(g, 46, 46, 0, 180); fill(g, CY2);
  if (t0 !== undefined) l.property("Transform").property("Rotation").expression =
    "var t=time-" + t0 + "; t<0?0: Math.sin(t*16)*22*Math.exp(-t*1.1)";
  return C;
}
function icMegaphone(t0) {
  var C = newC("Megafone");
  var b = S(C, 180, 200); var g;
  g = G(b); aRect(g, 34, 70, 10, -62, 62); fill(g, CY2);
  g = G(b); aPath(g, [[-95, -38], [45, -100], [45, 100], [-95, 38]], null, null, true); fill(g, WH);
  g = G(b); aRect(g, 30, 220, 15, 50, 0); fill(g, CY);
  for (var i = 0; i < 3; i++) {
    var w = S(C, 250 + i * 34, 200, "onda" + i); g = G(w);
    var r = 40 + i * 32;
    aPath(g, [[0, -r], [0, r]], [[0, 0], [r * 0.75, 0]], [[r * 0.75, 0], [0, 0]]); strk(g, CY, 14);
    w.property("Transform").property("Opacity").expression = "var t=time*3-" + (i * 0.33) + "; 30+70*Math.abs(Math.sin(t*Math.PI/1.0))";
    if (t0 !== undefined) trim(g, t0 + i * 0.12, t0 + 0.3 + i * 0.12);
  }
  return C;
}
function icPlane() {
  var C = newC("Avião");
  var l = S(C, 200, 200); var g;
  g = G(l); aPath(g, [[-120, 10], [120, -90], [35, 95], [5, 35]], null, null, true); fill(g, WH);
  g = G(l); aPath(g, [[5, 35], [120, -90]]); strk(g, CY2, 6);
  g = G(l); aPath(g, [[5, 35], [-5, 85], [30, 55]], null, null, true); fill(g, CY2);
  return C;
}
function icGear() {
  var C = newC("Engrenagem");
  var l = S(C, 200, 200); var g = G(l);
  var st = gc(g).addProperty("ADBE Vector Shape - Star");
  st.property("Type").setValue(1); st.property("Points").setValue(12); st.property("Outer Radius").setValue(118); st.property("Inner Radius").setValue(100);
  try { st.property("Outer Roundness").setValue(8); st.property("Inner Roundness").setValue(8); } catch (e) {}
  fill(g, CY);
  g = G(l); aEll(g, 120, 120); fill(g, NAVY);
  g = G(l); aEll(g, 120, 120); strk(g, CY2, 10);
  l.property("Transform").property("Rotation").expression = "time*40";
  return C;
}
function icCalendar(t0) {
  var C = newC("Calendário");
  var b = S(C, 200, 210); var g;
  g = G(b); aRect(g, 220, 200, 30); fill(g, NAVY); g = G(b); aRect(g, 220, 200, 30); strk(g, CY, 12);
  g = G(b); aRect(g, 220, 56, 0, 0, -72); fill(g, CY);
  var rg = S(C, 200, 105); g = G(rg); aRect(g, 18, 50, 9, -55, 0); fill(g, WH); g = G(rg); aRect(g, 18, 50, 9, 55, 0); fill(g, WH);
  var dots = S(C, 200, 230);
  for (var r = 0; r < 2; r++) for (var k = 0; k < 4; k++) { g = G(dots); aRect(g, 28, 24, 6, -63 + k * 42, -12 + r * 44); fill(g, (r === 1 && k === 2) ? CY : CY2, (r === 1 && k === 2) ? 100 : 45); }
  if (t0 !== undefined) { var ck = S(C, 284, 284); g = G(ck); aEll(g, 96, 96); fill(g, CY); g = G(ck); aPath(g, [[-22, 0], [-6, 18], [24, -16]]); strk(g, BG, 12); trim(g, t0, t0 + 0.35); }
  return C;
}
function icPerson(col) {
  var C = newC("Pessoa");
  var l = S(C, 200, 200); var g;
  g = G(l); aEll(g, 96, 96, 0, -50); fill(g, col || CY);
  g = G(l); aPath(g, [[-90, 100], [0, 15], [90, 100]], [[0, 0], [-62, 0], [0, 0]], [[0, -50], [62, 0], [0, 0]], true); fill(g, col || CY);
  return C;
}
function icBolt() {
  var C = newC("Raio");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 230, 230); fill(g, CY);
  var l = S(C, 200, 200); g = G(l); aPath(g, [[18, -92], [-56, 14], [-4, 14], [-22, 92], [56, -16], [4, -16]], null, null, true); fill(g, BG);
  return C;
}
function icChat() {
  var C = newC("Chat");
  var l = S(C, 200, 200); var g;
  g = G(l); aRect(g, 230, 160, 50, 0, -15); fill(g, CY);
  g = G(l); aPath(g, [[-70, 50], [-90, 100], [-20, 60]], null, null, true); fill(g, CY);
  for (var i = 0; i < 3; i++) { var d = S(C, 145 + i * 55, 185); g = G(d); aEll(g, 26, 26); fill(g, BG); }
  return C;
}
function icFlag() {
  var C = newC("Bandeira branca");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 240, 240); fill(g, CY);
  var pole = S(C, 150, 200); g = G(pole); aRect(g, 14, 170, 7, 0, 10); fill(g, BG);
  var fl = S(C, 157, 135); g = G(fl);
  aPath(g, [[0, 0], [100, 0], [100, 70], [0, 70]], [[0, 0], [-30, -20], [0, 0], [30, 20]], [[30, 20], [0, 0], [-30, -20], [0, 0]], true); fill(g, WH);
  fl.property("Transform").property("Rotation").expression = "Math.sin(time*5)*6";
  return C;
}
function icFace(tS, tN, tF) {
  var C = newC("Humor");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 240, 240); fill(g, CY);
  var e = S(C, 200, 200); g = G(e); aEll(g, 26, 34, -42, -28); fill(g, BG); g = G(e); aEll(g, 26, 34, 42, -28); fill(g, BG);
  var m = S(C, 200, 200); g = G(m);
  var path = aPath(g, [[-55, 30], [55, 30]], [[0, 0], [30, 40]], [[30, 40], [0, 0]]); strk(g, BG, 16);
  var pr = path.property("Path");
  pr.setValueAtTime(tS, mkShape([[-55, 30], [55, 30]], [[0, 0], [-30, 40]], [[30, 40], [0, 0]]));
  pr.setValueAtTime(tN, mkShape([[-55, 45], [55, 45]], [[0, 0], [-30, 0]], [[30, 0], [0, 0]]));
  pr.setValueAtTime(tF, mkShape([[-55, 60], [55, 60]], [[0, 0], [-30, -40]], [[30, -40], [0, 0]]));
  return C;
}
function icX(t0) {
  var C = newC("X vermelho");
  var l = S(C, 200, 200); var g;
  g = G(l); aPath(g, [[-120, -120], [120, 120]]); strk(g, RED, 30); trim(g, t0, t0 + 0.25);
  g = G(l); aPath(g, [[120, -120], [-120, 120]]); strk(g, RED, 30); trim(g, t0 + 0.2, t0 + 0.45);
  return C;
}
function icCheck(t0) {
  var C = newC("Check");
  var l = S(C, 200, 200); var g;
  g = G(l); aEll(g, 250, 250); fill(g, CY, 18);
  g = G(l); aEll(g, 250, 250); strk(g, CY, 16); trim(g, t0, t0 + 0.5);
  g = G(l); aPath(g, [[-60, 0], [-18, 42], [62, -46]]); strk(g, CY, 24); trim(g, t0 + 0.35, t0 + 0.7);
  return C;
}
function icAvatar(col) {
  var C = newC("Avatar");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 240, 240); fill(g, NAVY2);
  nest(C, icPerson(col || CY2), 200, 215, 70);
  return C;
}
function nodeIcon(sub, s) {
  var C = newC("Nó régua");
  var b = S(C, 200, 200); var g = G(b); aEll(g, 220, 220); fill(g, NAVY); g = G(b); aEll(g, 220, 220); strk(g, CY, 10);
  nest(C, sub, 200, 200, s || 50);
  return C;
}
function notifCard(sub, title, subtitle, dim) {
  var C = newC("Notificação " + title, 900, 180);
  var b = S(C, 450, 90); var g = G(b); aRect(g, 860, 150, 40); fill(g, NAVY2); g = G(b); aRect(g, 860, 150, 40); strk(g, dim ? GR : CY, 4);
  nest(C, sub, 100, 90, 38);
  ctext(C, title, 40, WH, 175, 80, { just: LEFT });
  ctext(C, subtitle, 30, CY2, 175, 122, { just: LEFT, style: "Medium" });
  return C;
}
function leadCard(n, xT) {
  var C = newC("Lead " + n, 300, 380);
  var b = S(C, 150, 190); var g = G(b); aRect(g, 260, 340, 40); fill(g, NAVY2); g = G(b); aRect(g, 260, 340, 40); strk(g, CY2, 4);
  nest(C, icAvatar(), 150, 150, 55);
  ctext(C, "Lead " + n, 40, WH, 150, 290);
  if (xT !== undefined) nest(C, icX(xT), 150, 190, 85);
  return C;
}
function phone() {
  var C = newC("Celular", 520, 900);
  var b = S(C, 260, 450); var g = G(b); aRect(g, 480, 860, 64); fill(g, NAVY); g = G(b); aRect(g, 480, 860, 64); strk(g, CY2, 8);
  var n = S(C, 260, 52); g = G(n); aRect(g, 120, 24, 12); fill(g, BG);
  nest(C, icAvatar(), 90, 125, 26);
  ctext(C, "Cliente", 34, WH, 140, 120, { just: LEFT });
  ctext(C, "visto por último hoje", 22, GR, 140, 150, { just: LEFT, style: "Medium" });
  var sep = S(C, 260, 182); g = G(sep); aRect(g, 440, 3, 0); fill(g, CY2, 25);
  // bolha enviada
  var bub = S(C, 300, 280, "bolha"); g = G(bub); aRect(g, 320, 110, 30); fill(g, CY);
  key(T(bub).property("Position"), [[5.8, [560, 280]], [6.2, [300, 280]]]);
  var dc = nest(C, icDoc(BG), 182, 280, 26); key(T(dc).property("Position"), [[5.8, [442, 280]], [6.2, [182, 280]]]);
  var bt = ctext(C, "Orçamento.pdf", 30, BG, 222, 291, { just: LEFT }); key(T(bt).property("Position"), [[5.8, [482, 291]], [6.2, [222, 291]]]);
  // ticks
  var tk = S(C, 400, 358, "ticks"); g = G(tk);
  aPath(g, [[-22, 0], [-10, 12], [12, -12]]); aPath(g, [[-6, 0], [6, 12], [28, -12]]);
  var ts = strk(g, GR, 6); trim(g, 6.3, 6.6);
  key(ts.property("Color"), [[6.9, GR], [7.1, CY]]);
  var vs = ctext(C, "visualizado", 22, CY, 365, 366, { just: ParagraphJustification.RIGHT_JUSTIFY, style: "Medium" });
  key(T(vs).property("Opacity"), [[6.9, 0], [7.2, 100]]);
  // digitando...
  var ty = S(C, 125, 450, "digitando"); g = G(ty); aRect(g, 150, 76, 38); fill(g, NAVY2);
  key(T(ty).property("Opacity"), [[7.3, 0], [7.5, 100], [8.4, 100], [8.6, 0]]);
  for (var i = 0; i < 3; i++) {
    var d = S(C, 90 + i * 35, 450); g = G(d); aEll(g, 18, 18); fill(g, CY2);
    T(d).property("Position").expression = "value + [0, Math.sin(time*10 - " + i + ")*7]";
    key(T(d).property("Opacity"), [[7.3, 0], [7.5, 100], [8.4, 100], [8.6, 0]]);
  }
  // silêncio: "..." cinza que pisca
  var sl = ctext(C, "sem resposta", 26, GR, 260, 640, { style: "Medium" });
  key(T(sl).property("Opacity"), [[8.8, 0], [9.2, 100]]);
  return C;
}

// ───────── 1) vídeo + estados tela cheia / PiP ─────────
var v = c.layers.add(vid); v.name = "Vídeo original";
var PW = 300, PH = Math.round(PW * 16 / 9), PM = 44;
var PX = W - PM - PW / 2, PY = PM + 110 + PH / 2;
var pscale = PW / 2160 * 100;
var FULL = { s: 50, p: [W / 2, H / 2], ms: 100, r: 0, b: 0 }, PIP = { s: pscale, p: [PX, PY], ms: PW / W * 100, r: 150, b: 100 };
var cuts = [[5.0, PIP], [19.3, FULL], [23.7, PIP], [33.1, FULL], [36.3, PIP], [50.9, FULL]];
var TR = 0.6;

var m = c.layers.addShape(); m.name = "PiP matte";
var mg = m.property("Contents").addProperty("ADBE Vector Group");
var mr = gc(mg).addProperty("ADBE Vector Shape - Rect"); mr.property("Size").setValue([W, H]);
fill(mg, WH);
var pb = c.layers.addShape(); pb.name = "PiP borda";
var pg = G(pb); aRect(pg, PW, PH, 34); strk(pg, CY, 5);
T(pb).property("Position").setValue([PX, PY]);

T(v).property("Scale").setValue([50, 50]); T(v).property("Position").setValue([W / 2, H / 2]);
T(m).property("Position").setValue([W / 2, H / 2]); T(pb).property("Opacity").setValue(0);
var prev = FULL;
for (var i = 0; i < cuts.length; i++) {
  var t = cuts[i][0], nx = cuts[i][1];
  T(v).property("Scale").setValueAtTime(t, [prev.s, prev.s]); T(v).property("Scale").setValueAtTime(t + TR, [nx.s, nx.s]);
  T(v).property("Position").setValueAtTime(t, prev.p); T(v).property("Position").setValueAtTime(t + TR, nx.p);
  T(m).property("Scale").setValueAtTime(t, [prev.ms, prev.ms]); T(m).property("Scale").setValueAtTime(t + TR, [nx.ms, nx.ms]);
  T(m).property("Position").setValueAtTime(t, prev.p); T(m).property("Position").setValueAtTime(t + TR, nx.p);
  mr.property("Roundness").setValueAtTime(t, prev.r); mr.property("Roundness").setValueAtTime(t + TR, nx.r);
  if (nx.b) { T(pb).property("Opacity").setValueAtTime(t + TR - 0.15, 0); T(pb).property("Opacity").setValueAtTime(t + TR + 0.15, 100); }
  else { T(pb).property("Opacity").setValueAtTime(t, 100); T(pb).property("Opacity").setValueAtTime(t + 0.15, 0); }
  prev = nx;
}
easeAll(T(v).property("Scale")); easeAll(T(v).property("Position")); easeAll(T(m).property("Scale")); easeAll(T(m).property("Position")); easeAll(mr.property("Roundness"));

// ───────── fundo ─────────
var bgl = c.layers.addSolid(BG, "Fundo", W, H, 1);
var glow = S(c, 200, 1500, "Glow"); var gg = G(glow); aEll(gg, 1100, 1100); fill(gg, CY);
T(glow).property("Opacity").setValue(14);
try { glow.property("Effects").addProperty("ADBE Gaussian Blur 2").property("Blurriness").setValue(260); } catch (e) {}
key(T(glow).property("Position"), [[5, [200, 1500]], [30, [880, 1250]], [DUR, [300, 1500]]]);
var grid = S(c, W / 2, 0, "Grade");
for (var gy = 0; gy < 8; gy++) { var gq = G(grid); aRect(gq, W, 2, 0, 0, 720 + gy * 160); fill(gq, CY, 6); }
for (var gx = 0; gx < 7; gx++) { var gq2 = G(grid); aRect(gq2, 2, 1300, 0, -540 + gx * 180, 1300); fill(gq2, CY, 4); }
grid.moveToEnd(); glow.moveToEnd(); bgl.moveToEnd();

// topo: logo + etiqueta + progresso (ficam por trás do vídeo; somem na tela cheia)
var lg1 = c.layers.add(logo); lg1.name = "Logo topo"; T(lg1).property("Scale").setValue([55, 55]); T(lg1).property("Position").setValue([PM + 110, PM + 60]);
anim(lg1, 5.5, DUR, { a: "right" });
txt("FOLLOW-UP QUE VENDE", 26, CY, PM + 8, PM + 128, 5.7, DUR, { just: LEFT, tracking: 120, a: "right" });
var prog = S(c, 60, 1850, "Progresso"); var prg = G(prog); var prr = aRect(prg, W - 120, 8, 4); prr.property("Position").setValue([(W - 120) / 2, 0]); fill(prg, CY);
key(T(prog).property("Scale"), [[5.4, [0, 100]], [DUR, [100, 100]]]);
try { T(prog).property("Scale").setTemporalEaseAtKey(1, [new KeyframeEase(0, 0.1)], [new KeyframeEase(0, 0.1)]); T(prog).property("Scale").setTemporalEaseAtKey(2, [new KeyframeEase(0, 0.1)], [new KeyframeEase(0, 0.1)]); } catch (e) {}

// ───────── CENA A 5.5–11.4: celular, orçamento visualizado, silêncio ─────────
txt("Visualizou… e sumiu?", 80, WH, 540, 800, 5.7, 11.4);
place(phone(), 540, 1330, 5.6, 11.4, { a: "up", d: 0.6 });
place(icClock(), 150, 1150, 8.2, 11.4, { s: 60 });
txt("ocupado", 36, CY2, 150, 1260, 8.4, 11.4, { style: "SemiBold" });
place(icPlay(), 930, 1450, 10.0, 11.4, { s: 55 });
txt("distraído", 36, CY2, 930, 1555, 10.2, 11.4, { style: "SemiBold" });

// ───────── CENA B 11.4–19.9: Instagram, TikTok, notificação esquecida ─────────
txt("Foi rolar o feed", 84, WH, 540, 800, 11.5, 17.2);
var ig = place(icInstagram(), 540, 1150, 11.9, 17.2, { s: 110, d: 0.6 });
moveTo(ig, 14.4, 14.9, [300, 1080], 75);
for (var h = 0; h < 4; h++) {
  var hl = place(icHeart(h % 2 ? IGP : RED), 600 + h * 30, 1100, 12.4 + h * 0.45, 13.9 + h * 0.45, { s: 30 });
  key(T(hl).property("Position"), [[12.4 + h * 0.45, [600 + h * 25, 1080]], [13.9 + h * 0.45, [640 + (h % 2 ? 160 : -60), 860]]]);
}
// stories (anéis desenhados)
var st = S(c, 540, 1460, "Stories");
for (var r = 0; r < 4; r++) {
  var sg = G(st); aEll(sg, 150, 150, -270 + r * 180, 0); fill(sg, NAVY2);
  var sg2 = G(st); aEll(sg2, 170, 170, -270 + r * 180, 0); strk(sg2, r === 0 ? IGO : IGP, 10); trim(sg2, 12.6 + r * 0.2, 13.2 + r * 0.2);
}
anim(st, 12.5, 14.5, { a: "up" });
var tk = place(icTikTok(), 780, 1080, 14.7, 17.2, { s: 75, d: 0.6 });
for (var vc = 0; vc < 3; vc++) {
  var t0 = 15.7 + vc * 0.5;
  var card = S(c, 540, 1500, "Vídeo card " + vc); var cg = G(card); aRect(cg, 220, 380, 34); fill(cg, vc === 1 ? TKR : NAVY2);
  var cg2 = G(card); aRect(cg2, 220, 380, 34); strk(cg2, TKC, 5);
  var cg3 = G(card); aPath(cg3, [[-22, -34], [38, 0], [-22, 34]], null, null, true); fill(cg3, WH);
  card.inPoint = t0; card.outPoint = t0 + 1.3;
  key(T(card).property("Position"), [[t0, [540, 1800]], [t0 + 0.45, [540, 1500]], [t0 + 0.85, [540, 1500]], [t0 + 1.3, [540, 1240]]]);
  key(T(card).property("Opacity"), [[t0, 0], [t0 + 0.3, 100], [t0 + 0.9, 100], [t0 + 1.3, 0]]);
}
txt("…e esqueceu de responder", 70, WH, 540, 800, 17.3, 19.9);
var slots = [1000, 1175, 1350, 1525];
var ours = place(notifCard(icDoc(), "Sua empresa", "Orçamento.pdf", false), 540, slots[0], 17.3, 19.9, { a: "down" });
var news = [[icInstagram(), "Instagram", "curtiu sua foto"], [icTikTok(), "TikTok", "novo vídeo pra você"], [icInstagram(), "Instagram", "3 novas mensagens"]];
for (var n = 0; n < 3; n++) {
  var tn = 17.75 + n * 0.4;
  moveTo(ours, tn, tn + 0.3, [540, slots[n + 1]]);
  var nl = place(notifCard(news[n][0], news[n][1], news[n][2], true), 540, slots[0], tn, 19.9, { a: "down", d: 0.35 });
  for (var m2 = n + 1; m2 < 3; m2++) { var tm = 17.75 + m2 * 0.4; moveTo(nl, tm, tm + 0.3, [540, slots[m2 - n]]); }
}
key(T(ours).property("Opacity"), [[18.95, 100], [19.3, 35]]);
txt("esquecido", 40, RED, 540, 1660, 19.1, 19.9, { style: "SemiBold" });

// ───────── CENA C (tela cheia 19.9–23.7): bandeira branca = desistiu ─────────
// (overlays criados no fim, acima do vídeo)

// ───────── CENA D 23.9–26.8: uma mensagem e próximo ─────────
txt("Uma mensagem só…", 80, WH, 540, 800, 24.0, 26.8);
var trail = S(c, 0, 0, "Rastro");
var trg = G(trail); aPath(trg, [[120, 1250], [960, 1020]], [[0, 0], [-300, 0]], [[300, 120], [0, 0]]); var trs = strk(trg, CY2, 6);
try { trs.property("Dashes").addProperty("ADBE Vector Stroke Dash 1").setValue(22); } catch (e) {}
trim(trg, 24.1, 24.9); anim(trail, 24.1, 25.4, { a: "fade" });
var pl = place(icPlane(), 120, 1250, 24.1, 25.3, { s: 45, d: 0.2 });
key(T(pl).property("Position"), [[24.1, [120, 1250]], [24.5, [520, 1210]], [24.9, [960, 1020]]]);
key(T(pl).property("Rotation"), [[24.1, 10], [24.9, -15]]);
var lx = [220, 540, 860, 1180];
var leads = [];
for (var ld = 0; ld < 4; ld++) {
  var lt = 24.9 + ld * 0.12;
  var L = place(leadCard(ld + 1, ld === 0 ? 25.3 : undefined), lx[ld], 1400, ld === 3 ? 25.8 : lt, 26.8, { a: "up", d: 0.4 });
  leads.push(L);
}
for (var ld2 = 0; ld2 < 4; ld2++) moveTo(leads[ld2], 25.8, 26.3, [lx[ld2] - 320, 1400]);
key(T(leads[0]).property("Opacity"), [[25.9, 100], [26.25, 0]]);
txt("próximo contato →", 50, CY, 540, 1700, 25.9, 26.8, { style: "SemiBold" });

// ───────── CENA E 26.8–33.6: não é ser chato → lembrar de uma decisão ─────────
txt("Follow-up bem feito", 84, WH, 540, 800, 26.9, 33.6);
place(icMegaphone(27.6), 540, 1200, 27.3, 29.6, { s: 95 });
txt("não é ser chato", 66, CY2, 540, 1490, 28.2, 29.6);
place(icX(28.7), 540, 1200, 28.6, 29.6, { a: "fade", s: 110 });
var bell = place(icBell(29.9), 540, 1180, 29.8, 33.6, { s: 95 });
txt("é lembrar a pessoa", 66, WH, 540, 1460, 30.1, 31.1);
moveTo(bell, 31.0, 31.5, [300, 1170], 70);
place(icCheck(31.3), 780, 1170, 31.2, 33.6, { s: 85, a: "fade" });
txt("de uma decisão", 66, WH, 540, 1440, 31.3, 33.6);
txt("que ela já queria tomar", 66, CY, 540, 1530, 31.9, 33.6);

// ───────── CENA G 36.6–40.6: processo, prazo, responsável ─────────
txt("Precisa ter", 84, WH, 540, 800, 36.6, 40.6);
place(icGear(), 200, 1130, 37.2, 40.6, { s: 70 });
txt("Processo", 48, WH, 200, 1320, 37.4, 40.6);
place(icCalendar(38.9), 540, 1130, 38.7, 40.6, { s: 70 });
txt("Prazo", 48, WH, 540, 1320, 38.9, 40.6);
place(icPerson(), 880, 1130, 39.1, 40.6, { s: 70 });
txt("Responsável", 48, WH, 880, 1320, 39.3, 40.6);
var ul = S(c, 100, 1420, "Sublinhado"); var ug = G(ul); aPath(ug, [[0, 0], [880, 0]]); strk(ug, CY, 10); trim(ug, 39.7, 40.2);
anim(ul, 39.7, 40.6, { a: "fade" });
txt("definidos", 60, CY, 540, 1530, 39.9, 40.6);

// ───────── CENA H 40.6–46.6: Arttico + régua no CRM com automação ─────────
var ring = S(c, 540, 880, "Anel logo"); var rgg = G(ring); aEll(rgg, 420, 420); strk(rgg, CY, 6);
ring.inPoint = 40.7; ring.outPoint = 42.2;
key(T(ring).property("Scale"), [[40.7, [40, 40]], [41.6, [150, 150]]]); key(T(ring).property("Opacity"), [[40.7, 100], [41.6, 0]]);
var lg2 = c.layers.add(logo); lg2.name = "Logo Arttico"; T(lg2).property("Position").setValue([540, 880]); T(lg2).property("Scale").setValue([120, 120]);
anim(lg2, 40.7, 42.2, { a: "pop", d: 0.5 });
txt("Follow-up vira", 70, WH, 540, 800, 42.2, 46.6, { style: "SemiBold" });
txt("régua no CRM", 116, CY, 540, 930, 42.4, 46.6);
var ru = S(c, 0, 0, "Régua");
var rug = G(ru); aPath(rug, [[110, 1260], [970, 1260]]); strk(rug, CY2, 8); trim(rug, 42.9, 43.6);
var ticks = S(c, 0, 0, "Marcas régua");
for (var tx = 0; tx <= 20; tx++) { var tg = G(ticks); aRect(tg, 4, tx % 5 === 0 ? 46 : 24, 2, 110 + tx * 43, 1260 + (tx % 5 === 0 ? 34 : 24)); fill(tg, CY2, 70); }
anim(ru, 42.9, 46.6, { a: "fade" }); anim(ticks, 43.2, 46.6, { a: "fade" });
var nodes = [[icDoc(), "dia 0", 40], [icChat(), "dia 2", 45], [icBell(), "dia 5", 42], [icPerson(), "dia 7", 45]];
var nx2 = [150, 420, 690, 960];
for (var nd = 0; nd < 4; nd++) {
  place(nodeIcon(nodes[nd][0], nodes[nd][2]), nx2[nd], 1160, 43.2 + nd * 0.4, 46.6, { s: 62 });
  txt(nodes[nd][1], 38, CY2, nx2[nd], 1370, 43.3 + nd * 0.4, 46.6, { style: "SemiBold" });
}
var pulse = S(c, 150, 1260, "Pulso"); var pg2 = G(pulse); aEll(pg2, 44, 44); fill(pg2, WH);
var pg3 = G(pulse); aEll(pg3, 80, 80); fill(pg3, CY, 35);
pulse.inPoint = 44.6; pulse.outPoint = 46.6;
key(T(pulse).property("Position"), [[44.6, [150, 1260]], [46.2, [960, 1260]]]);
key(T(pulse).property("Opacity"), [[44.6, 0], [44.75, 100], [46.3, 100], [46.6, 0]]);
place(icBolt(), 540, 1560, 44.7, 46.6, { s: 62 });
txt("tudo automático", 44, WH, 540, 1700, 44.9, 46.6, { style: "SemiBold" });

// ───────── CENA I 46.7–51.4: pilha de orçamentos parados ─────────
txt("Quantos orçamentos", 84, WH, 540, 800, 46.8, 51.4);
var px = [470, 610, 520, 650, 450, 570], py = [1470, 1450, 1400, 1380, 1340, 1300], rt = [-12, 9, -4, 15, -9, 4];
for (var dk = 0; dk < 6; dk++) {
  var td0 = 47.0 + dk * 0.22;
  var dl = place(icDoc(), px[dk], 1000, td0, 51.4, { s: 60, a: "fade", d: 0.2 });
  key(T(dl).property("Position"), [[td0, [px[dk], 1000]], [td0 + 0.4, [px[dk], py[dk]]]]);
  key(T(dl).property("Rotation"), [[td0, 0], [td0 + 0.4, rt[dk]]]);
  key(T(dl).property("Opacity"), [[49.0, 100], [49.4, 55]]);
}
txt("estão parados", 92, CY, 540, 910, 48.9, 51.4);
place(icClock(GR), 880, 1250, 49.0, 51.4, { s: 50 });
txt("sem 2ª tentativa?", 70, WH, 540, 1700, 49.7, 51.4);

// ───────── vídeo + PiP acima do motion ─────────
v.moveToBeginning(); m.moveToBeginning(); pb.moveToBeginning();
v.trackMatteType = TrackMatteType.ALPHA; m.enabled = false;

// ───────── OVERLAYS sobre a tela cheia ─────────
function pillText(str, x, y, w, tin, tout) {
  var pbx = S(c, x, y, "Pill fundo"); var pgx = G(pbx); aRect(pgx, w, 110, 55); fill(pgx, BG, 88); var pgy = G(pbx); aRect(pgy, w, 110, 55); strk(pgy, CY, 4);
  anim(pbx, tin, tout, { a: "right" });
  txt(str, 44, WH, x - w / 2 + 120, y + 15, tin + 0.1, tout, { just: LEFT, a: "right" });
}
// C: desiste no 1º silêncio
pillText("desiste no 1º silêncio", 560, 200, 760, 21.9, 23.7);
place(icFlag(), 210, 200, 21.8, 23.7, { s: 62 });
// F: humor do vendedor
pillText("humor do vendedor", 520, 200, 680, 34.5, 36.3);
place(icFace(34.8, 35.2, 35.6), 210, 200, 34.3, 36.3, { s: 62 });
// J: CTA
var lgb = S(c, 200, 150, "Logo fundo"); var lgg = G(lgb); aRect(lgg, 300, 110, 55); fill(lgg, BG, 80);
anim(lgb, 51.6, DUR + 0.3, { a: "down" });
var lg3 = c.layers.add(logo); lg3.name = "Logo CTA"; T(lg3).property("Position").setValue([200, 150]); T(lg3).property("Scale").setValue([58, 58]);
anim(lg3, 51.7, DUR + 0.3, { a: "down" });
var ripple = S(c, 905, 1745, "Toque"); var rpg = G(ripple); aEll(rpg, 120, 120); strk(rpg, WH, 8);
ripple.inPoint = 52.9; ripple.outPoint = DUR + 0.3;
T(ripple).property("Scale").expression = "var k=((time-52.9)*1.3)%1; [60+k*140, 60+k*140]";
T(ripple).property("Opacity").expression = "var k=((time-52.9)*1.3)%1; 100*(1-k)";
var btn = S(c, 540, 1660, "Botão CTA"); var btg = G(btn); aRect(btg, 760, 170, 85); fill(btg, CY);
anim(btn, 52.3, DUR + 0.3, { a: "pop", d: 0.5 });
key(T(btn).property("Scale"), [[53.0, [100, 100]], [53.6, [105, 105]], [54.2, [100, 100]], [54.8, [105, 105]]]);
txt("Link na bio", 80, BG, 540, 1688, 52.4, DUR + 0.3, { a: "pop" });
ripple.moveToBeginning();
var hand = S(c, 905, 1745, "Dedo"); var hg = G(hand); aEll(hg, 70, 70); fill(hg, WH, 90);
hand.inPoint = 52.8; hand.outPoint = DUR + 0.3;
T(hand).property("Scale").expression = "var k=((time-52.9)*1.3)%1; k<0.15? [80,80] : [100,100]";
pillText("agende uma conversa", 540, 1460, 640, 53.3, DUR + 0.3);

c.workAreaStart = 0; c.workAreaDuration = DUR;
writeLn("layers: " + c.numLayers + " comps: " + p.numItems);

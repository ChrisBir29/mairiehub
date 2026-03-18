'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';

/* ═══ DESIGN TOKENS ═══ */
const T = {
  primary: "#1B3A5C", primaryLight: "#2B5A8C", primaryFaded: "#E8EFF6",
  accent: "#D4A03C", accentLight: "#F5E6C4",
  surface: "#FFFFFF", bg: "#F3F5F8",
  text: "#1A2332", text2: "#5A6B7F", text3: "#8E9BB0",
  success: "#2D9F6F", successBg: "#E6F7EF",
  warning: "#E8943A", warningBg: "#FEF3E2",
  error: "#D64545", errorBg: "#FDE8E8",
  info: "#3B82F6", infoBg: "#EFF6FF",
  border: "#E2E8F0", borderLight: "#F0F3F7",
};

/* ═══ HELPERS ═══ */
const fmtEur = (n) => n ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n) : "–";
const dayN = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const monthN = ["Janv.","Fév.","Mars","Avril","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."];
const toDS = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayStr = toDS(new Date());
const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T12:00:00");
  return `${dayN[d.getDay()]} ${d.getDate()} ${monthN[d.getMonth()]}`;
};
const fmtDateFull = (s) => {
  if (!s) return "";
  const d = new Date(s + "T12:00:00");
  return `${dayN[d.getDay()]} ${d.getDate()} ${monthN[d.getMonth()]} ${d.getFullYear()}`;
};
const isOverdue = (s) => s && s < todayStr;
const daysUntil = (s) => {
  if (!s) return null;
  return Math.ceil((new Date(s + "T12:00:00") - new Date(todayStr + "T12:00:00")) / 86400000);
};
const evtColors = {
  reunion: "#3B82F6", commission: "#22C55E", permanence: "#F59E0B",
  conseil: "#EF4444", formation: "#F97316", visite: "#10B981", appel: "#8B5CF6",
};

/* ═══ COMPONENTS ═══ */
const Badge = ({ text, color, bg }) => (
  <span style={{ background: bg, color, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>
);

const ProgressBar = ({ value, color = T.primary }) => (
  <div style={{ width: "100%", height: 6, background: T.borderLight, borderRadius: 6, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 6, transition: "width 0.5s" }} />
  </div>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: 14, cursor: onClick ? "pointer" : "default", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", ...style }}>
    {children}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: T.surface, borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto", overflowX: "hidden", padding: 20, paddingBottom: 32 }}>
        <div style={{ width: 36, height: 4, background: T.border, borderRadius: 4, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: 0, flex: 1, minWidth: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: T.bg, border: "none", borderRadius: 99, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputStyle = { padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 16, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit", WebkitAppearance: "none" };
const btnStyle = { background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" };

/* ═══ PARTICIPANT PICKER ═══ */
function ParticipantPicker({ selected, membres, onChange, onAdd }) {
  const [newName, setNewName] = useState("");
  const toggle = (m) => {
    if (selected.includes(m)) onChange(selected.filter((x) => x !== m));
    else onChange([...selected, m]);
  };
  const addNew = () => {
    const name = newName.trim();
    if (!name) return;
    if (onAdd) onAdd(name);
    if (!selected.includes(name)) onChange([...selected, name]);
    setNewName("");
  };
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Participants</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {membres.map((m) => {
          const active = selected.includes(m);
          return (
            <button key={m} onClick={() => toggle(m)} style={{ padding: "5px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: active ? `2px solid ${T.primary}` : `1px solid ${T.border}`, background: active ? T.primaryFaded : T.surface, color: active ? T.primary : T.text2 }}>
              {active ? "✓ " : ""}{m}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nouveau participant..." onKeyDown={(e) => e.key === "Enter" && addNew()} style={{ ...inputStyle, flex: 1, fontSize: 14 }} />
        <button onClick={addNew} style={{ background: newName.trim() ? T.primary : T.bg, color: newName.trim() ? "#fff" : T.text3, border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>+</button>
      </div>
    </div>
  );
}

/* ═══ DATA ═══ */
const INIT_DATA = {
  membres: ["Christian", "Chantal", "Sophie (DGS)", "Bruno", "Virginie", "Francine", "Mickaël", "Stéphanie", "Michelle", "Michèle", "Manuela", "Daniel", "Quentin", "Élisabeth", "Françoise", "Anaïs", "Amin", "Sébastien", "Frédéric"],
  commissions: [
    { id: 1, emoji: "❤️", name: "CCAS", color: "#EC4899", description: "Centre Communal d'Action Sociale — aide sociale, personnes âgées, inclusion, solidarité", president: "Chantal", membres: ["Chantal", "Virginie", "Michelle", "Anaïs"], prochaine: null, projets: [] },
    { id: 2, emoji: "🏗️", name: "Travaux, Urbanisme, Environnement & Appel d'offre", color: "#E87A30", description: "Voirie, bâtiments communaux, PLU, éclairage, réseaux, marchés publics, environnement", president: "Chantal", membres: ["Chantal", "Mickaël", "Francine", "Stéphanie", "Bruno", "Daniel", "Amin"], prochaine: null, projets: [] },
    { id: 3, emoji: "📚", name: "Éducation, Enfance, Jeunesse & Sports", color: "#7C3AED", description: "École, périscolaire, jeunesse, sport, activités enfants, structures d'accueil", president: "Bruno", membres: ["Bruno", "Francine", "Virginie", "Michèle", "Mickaël", "Chantal", "Manuela", "Daniel", "Amin", "Sébastien", "Anaïs"], prochaine: null, projets: [] },
    { id: 4, emoji: "🎭", name: "Animation, Culture, Communication & Événementiel", color: "#2d7a30", description: "Associations, culture, fêtes, communication municipale, événements", president: "Chantal", membres: ["Chantal", "Virginie", "Mickaël", "Francine", "Bruno", "Élisabeth", "Françoise", "Sébastien"], prochaine: null, projets: [] },
    { id: 5, emoji: "📡", name: "Communication, Développement économique & Informations municipal", color: "#0EA5E9", description: "Communication digitale, développement économique, bulletin municipal, site web", president: "Virginie", membres: ["Virginie", "Francine", "Bruno", "Sébastien", "Chantal"], prochaine: null, projets: [] },
    { id: 6, emoji: "🌳", name: "Patrimoine & Biens indivis", color: "#16A34A", description: "Forêt, église, cimetière, biens communaux, patrimoine bâti et naturel", president: "Quentin", membres: ["Quentin", "Élisabeth", "Françoise", "Virginie", "Anaïs", "Chantal"], prochaine: null, projets: [] },
    { id: 7, emoji: "🔒", name: "Sécurité, Prévention & Salubrité publique", color: "#DC2626", description: "PCS, police du maire, salubrité, ERP, prévention des risques", president: "Bruno", membres: ["Bruno", "Amin", "Stéphanie", "Frédéric", "Manuela", "Daniel", "Francine", "Chantal"], prochaine: null, projets: [] },
    { id: 8, emoji: "💰", name: "CCID", color: "#1E5F8C", description: "Commission communale des impôts directs — fiscalité locale, révision des valeurs locatives", president: "Chantal", membres: ["Chantal", "Michèle", "Anaïs", "Daniel", "Amin"], prochaine: null, projets: [] },
    { id: 9, emoji: "📋", name: "Contrôle des listes électorales", color: "#8B5CF6", description: "Vérification et mise à jour des listes électorales de la commune", president: "Manuela", membres: ["Manuela"], prochaine: null, projets: [] },
  ],
  reunions: [
    { id: 1, title: "Réunion de municipalité — Lancement mandat", date: "2026-03-18", time: "18:00", location: "Bureau du maire", status: "planifiee", participants: ["Christian", "Chantal", "Sophie (DGS)", "Julien"],
      points: [
        { id: 1, num: 1, title: "Tour de table — Premières impressions", notes: "" },
        { id: 2, num: 2, title: "Organisation des permanences", notes: "" },
        { id: 3, num: 3, title: "Planning des commissions", notes: "" },
        { id: 4, num: 4, title: "Point dossier Neolia Phase 2", notes: "" },
        { id: 5, num: 5, title: "Calendrier conseil municipal", notes: "" },
      ] },
    { id: 2, title: "Réunion de municipalité — Budget", date: "2026-04-02", time: "18:00", location: "Bureau du maire", status: "planifiee", participants: ["Christian", "Chantal", "Sophie (DGS)"],
      points: [
        { id: 10, num: 1, title: "Retour formation AMF90", notes: "" },
        { id: 11, num: 2, title: "Comptes administratifs 2025", notes: "" },
        { id: 12, num: 3, title: "Orientations budgétaires", notes: "" },
        { id: 13, num: 4, title: "Investissements prioritaires", notes: "" },
      ] },
    { id: 3, title: "Réunion hebdo", date: "2026-03-25", time: "18:00", location: "Bureau du maire", status: "planifiee", participants: ["Christian", "Chantal", "Sophie (DGS)", "Julien"],
      points: [
        { id: 20, num: 1, title: "Suivi actions en cours", notes: "" },
        { id: 21, num: 2, title: "Dossier DAB / Cash Services", notes: "" },
        { id: 22, num: 3, title: "Bail antenne Totem/Orange", notes: "" },
      ] },
  ],
  actions: [
    { id: 1, title: "Convocations conseil municipal", responsable: "Sophie (DGS)", echeance: "2026-03-19", status: "a_faire", reunionId: 1, priority: "haute" },
    { id: 2, title: "Délégations de signature", responsable: "Sophie (DGS)", echeance: "2026-03-21", status: "a_faire", reunionId: 1, priority: "haute" },
    { id: 3, title: "RDV directrice Neolia", responsable: "Christian", echeance: "2026-03-20", status: "en_cours", reunionId: 1, priority: "haute" },
    { id: 4, title: "Répartition commissions", responsable: "Chantal", echeance: "2026-03-22", status: "a_faire", reunionId: 1, priority: "moyenne" },
    { id: 5, title: "Comptes administratifs 2025", responsable: "Sophie (DGS)", echeance: "2026-03-28", status: "a_faire", reunionId: 2, priority: "haute" },
    { id: 6, title: "Relancer Cash Services DAB", responsable: "Christian", echeance: "2026-03-25", status: "a_faire", reunionId: 3, priority: "moyenne" },
  ],
  agenda: [
    { id: 1, title: "Brief Sophie", time: "08:30", duration: 30, type: "reunion", location: "Bureau du maire", date: "2026-03-17" },
    { id: 2, title: "Permanence Morvellais", time: "09:30", duration: 90, type: "permanence", location: "Mairie", date: "2026-03-17" },
    { id: 3, title: "Réunion de municipalité", time: "18:00", duration: 90, type: "reunion", location: "Bureau du maire", date: "2026-03-18" },
    { id: 4, title: "Rencontre Neolia", time: "10:00", duration: 60, type: "reunion", location: "Neolia Belfort", date: "2026-03-19" },
    { id: 5, title: "Conseil Municipal", time: "10:00", duration: 180, type: "conseil", location: "Salle du conseil", date: "2026-03-22" },
    { id: 6, title: "Formation AMF90", time: "18:00", duration: 180, type: "formation", location: "À confirmer", date: "2026-04-07" },
  ],
  actions: [
    { id: 1, title: "Convocations conseil municipal", responsable: "Sophie (DGS)", echeance: "2026-03-19", status: "a_faire", reunionId: 1, pointId: 5, priority: "haute" },
    { id: 2, title: "Délégations de signature", responsable: "Sophie (DGS)", echeance: "2026-03-21", status: "a_faire", reunionId: 1, pointId: 5, priority: "haute" },
    { id: 3, title: "RDV directrice Neolia", responsable: "Christian", echeance: "2026-03-20", status: "en_cours", reunionId: 1, pointId: 4, priority: "haute" },
    { id: 4, title: "Répartition commissions", responsable: "Chantal", echeance: "2026-03-22", status: "a_faire", reunionId: 1, pointId: 3, priority: "moyenne" },
    { id: 5, title: "Comptes administratifs 2025", responsable: "Sophie (DGS)", echeance: "2026-03-28", status: "a_faire", reunionId: 2, pointId: 11, priority: "haute" },
    { id: 6, title: "Relancer Cash Services DAB", responsable: "Christian", echeance: "2026-03-25", status: "a_faire", reunionId: 3, pointId: 21, priority: "moyenne" },
  ],
};

/* ═══ STATUS HELPERS ═══ */
const actStatusLabel = { a_faire: "À faire", en_cours: "En cours", fait: "Fait" };
const actStatusColor = { a_faire: T.info, en_cours: T.warning, fait: T.success };
const actStatusBg = { a_faire: T.infoBg, en_cours: T.warningBg, fait: T.successBg };

/* ═══════════════════════════════════════════ */
/* COMMISSIONS SCREEN                          */
/* ═══════════════════════════════════════════ */
function CommissionsScreen({ data, setData }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddProjet, setShowAddProjet] = useState(false);
  const [projetForm, setProjetForm] = useState({ title: "", description: "", responsable: "", echeance: "", status: "a_faire" });
  const [detailTab, setDetailTab] = useState("info"); // info | projets
  const comms = data.commissions || [];
  const selected = selectedId ? comms.find((c) => c.id === selectedId) : null;

  const updateCommission = (updates) => {
    setData({ ...data, commissions: comms.map((c) => c.id === selectedId ? { ...c, ...updates } : c) });
  };
  const updateMembres = (newMembres) => updateCommission({ membres: newMembres });
  const addGlobalMembre = (name) => {
    const all = data.membres || [];
    if (!all.includes(name)) setData({ ...data, membres: [...all, name] });
  };
  const updateProchaine = (date) => updateCommission({ prochaine: date });

  const addProjet = () => {
    if (!projetForm.title) return;
    const projets = [...(selected.projets || []), { id: Date.now(), ...projetForm }];
    updateCommission({ projets });
    setProjetForm({ title: "", description: "", responsable: "", echeance: "", status: "a_faire" });
    setShowAddProjet(false);
  };
  const updateProjet = (pid, updates) => {
    const projets = (selected.projets || []).map((p) => p.id === pid ? { ...p, ...updates } : p);
    updateCommission({ projets });
  };
  const deleteProjet = (pid) => {
    updateCommission({ projets: (selected.projets || []).filter((p) => p.id !== pid) });
  };

  const projetStatusLabel = { a_faire: "À faire", en_cours: "En cours", fait: "Terminé" };
  const projetStatusColor = { a_faire: T.info, en_cours: T.warning, fait: T.success };
  const projetStatusBg = { a_faire: T.infoBg, en_cours: T.warningBg, fait: T.successBg };

  /* Liste des commissions */
  if (!selected) {
    return (
      <div style={{ padding: "12px 14px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Commissions</h1>
        <p style={{ fontSize: 12, color: T.text3, margin: "0 0 14px" }}>9 commissions municipales</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {comms.map((cm) => {
            const days = daysUntil(cm.prochaine);
            const nbProjets = (cm.projets || []).filter((p) => p.status !== "fait").length;
            return (
              <Card key={cm.id} onClick={() => { setSelectedId(cm.id); setDetailTab("info"); }} style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: cm.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cm.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, wordBreak: "break-word" }}>{cm.name}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
                      Prés. {cm.president} · {cm.membres.length} membres
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                      {cm.prochaine && (
                        <Badge text={"📅 " + fmtDate(cm.prochaine) + (days !== null && days >= 0 && days <= 3 ? ` (J-${days})` : "")} color={days !== null && days >= 0 && days <= 3 ? T.warning : T.text3} bg={days !== null && days >= 0 && days <= 3 ? T.warningBg : T.bg} />
                      )}
                      {nbProjets > 0 && <Badge text={nbProjets + " projet" + (nbProjets > 1 ? "s" : "")} color={T.accent} bg={T.accentLight} />}
                    </div>
                  </div>
                  <div style={{ width: 5, height: 38, borderRadius: 3, background: cm.color, flexShrink: 0 }} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  /* Détail commission */
  return (
    <div style={{ padding: "12px 14px" }}>
      <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.primaryLight, fontWeight: 600, fontSize: 13, padding: "0 0 6px", fontFamily: "inherit" }}>← Retour</button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: selected.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{selected.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, wordBreak: "break-word" }}>{selected.name}</h1>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 1 }}>Présidence : {selected.president}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, margin: "0 0 12px" }}>{selected.description}</p>

      {/* Tabs Info / Projets */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, borderRadius: 10, overflow: "hidden", border: "1px solid " + T.border }}>
        {[["info", "ℹ️ Infos"], ["projets", "📂 Projets"]].map(([k, l]) => (
          <button key={k} onClick={() => setDetailTab(k)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none", background: detailTab === k ? T.primary : T.surface, color: detailTab === k ? "#fff" : T.text2 }}>{l}</button>
        ))}
      </div>

      {/* TAB INFO */}
      {detailTab === "info" && (
        <>
          <Card style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📅 Prochaine réunion</div>
            <input type="date" value={selected.prochaine || ""} onChange={(e) => updateProchaine(e.target.value)} style={{ ...inputStyle, fontSize: 14 }} />
            {selected.prochaine && <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{fmtDate(selected.prochaine)}</div>}
          </Card>

          <Card style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>👥 Membres ({selected.membres.length})</div>
              <button onClick={() => setShowEdit(true)} style={{ fontSize: 11, color: T.primaryLight, background: T.primaryFaded, border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>Modifier</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selected.membres.map((m) => (
                <span key={m} style={{ fontSize: 12, background: m === selected.president ? selected.color + "22" : T.bg, color: m === selected.president ? selected.color : T.text2, padding: "4px 10px", borderRadius: 99, fontWeight: m === selected.president ? 600 : 400 }}>
                  {m === selected.president ? "👑 " : ""}{m}
                </span>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* TAB PROJETS */}
      {detailTab === "projets" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Projets ({(selected.projets || []).length})</div>
            <button onClick={() => setShowAddProjet(true)} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Projet</button>
          </div>

          {(selected.projets || []).length === 0 ? (
            <Card style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 32 }}>📂</div>
              <p style={{ color: T.text3, margin: "6px 0 0", fontSize: 13 }}>Aucun projet dans cette commission</p>
              <button onClick={() => setShowAddProjet(true)} style={{ marginTop: 10, background: T.primaryFaded, color: T.primary, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Créer le premier projet</button>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(selected.projets || []).map((p) => {
                const overdue = p.status !== "fait" && isOverdue(p.echeance);
                return (
                  <Card key={p.id} style={{ padding: 12, borderLeft: "3px solid " + (overdue ? T.error : projetStatusColor[p.status]) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, wordBreak: "break-word", textDecoration: p.status === "fait" ? "line-through" : "none", opacity: p.status === "fait" ? 0.6 : 1 }}>{p.title}</div>
                        {p.description && <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0", lineHeight: 1.4, wordBreak: "break-word" }}>{p.description}</p>}
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {p.responsable && <span>👤 {p.responsable}</span>}
                          {p.echeance && <span>· 📅 {fmtDate(p.echeance)}</span>}
                          {overdue && <span style={{ color: T.error, fontWeight: 600 }}>· ⚠️ Retard</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteProjet(p.id)} style={{ fontSize: 10, color: T.error, background: T.errorBg, border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", flexShrink: 0, marginLeft: 8 }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      {["a_faire", "en_cours", "fait"].map((s) => (
                        <button key={s} onClick={() => updateProjet(p.id, { status: s })} style={{ fontSize: 10, fontWeight: 600, border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", background: p.status === s ? projetStatusBg[s] : T.bg, color: p.status === s ? projetStatusColor[s] : T.text3 }}>{projetStatusLabel[s]}</button>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={"Membres — " + selected.name}>
        <ParticipantPicker selected={selected.membres} membres={data.membres || []} onChange={updateMembres} onAdd={addGlobalMembre} />
        <button onClick={() => setShowEdit(false)} style={{ ...btnStyle, marginTop: 16 }}>Valider</button>
      </Modal>

      <Modal open={showAddProjet} onClose={() => setShowAddProjet(false)} title="Nouveau projet">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={projetForm.title} onChange={(e) => setProjetForm({ ...projetForm, title: e.target.value })} placeholder="Nom du projet" style={inputStyle} autoFocus />
          <textarea value={projetForm.description} onChange={(e) => setProjetForm({ ...projetForm, description: e.target.value })} placeholder="Description (optionnel)" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          <select value={projetForm.responsable} onChange={(e) => setProjetForm({ ...projetForm, responsable: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
            <option value="">— Responsable —</option>
            {selected.membres.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="date" value={projetForm.echeance} onChange={(e) => setProjetForm({ ...projetForm, echeance: e.target.value })} style={inputStyle} />
          <button onClick={addProjet} style={btnStyle}>Créer le projet</button>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* REUNIONS SCREEN                             */
/* ═══════════════════════════════════════════ */
function ReunionsScreen({ data, setData }) {
  const [selId, setSelId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showPt, setShowPt] = useState(false);
  const [showAct, setShowAct] = useState(null);
  const [showNotes, setShowNotes] = useState(null);
  const [showPart, setShowPart] = useState(false);
  const [showEditPt, setShowEditPt] = useState(null);
  const [editPtTitle, setEditPtTitle] = useState("");
  const [form, setForm] = useState({ title: "", date: "", time: "18:00", location: "Bureau du maire", participants: ["Christian", "Chantal", "Sophie (DGS)", "Julien"] });
  const [ptForm, setPtForm] = useState({ title: "" });
  const [actForm, setActForm] = useState({ title: "", responsable: "Christian", echeance: "", priority: "moyenne" });
  const [notesText, setNotesText] = useState("");

  const reunions = data.reunions || [];
  const r = selId ? reunions.find((x) => x.id === selId) : null;
  const rActions = (data.actions || []).filter((a) => a.reunionId === selId);
  const membres = data.membres || [];

  const addGlobalMembre = (name) => { if (!membres.includes(name)) setData({ ...data, membres: [...membres, name] }); };

  const addReunion = () => {
    if (!form.title || !form.date) return;
    const newR = { id: Date.now(), ...form, status: "planifiee", points: [] };
    const newAgendaEvt = { id: Date.now() + 1, title: form.title, time: form.time, duration: 90, type: "reunion", location: form.location, date: form.date, reunionId: newR.id };
    setData({ ...data, reunions: [...reunions, newR], agenda: [...(data.agenda || []), newAgendaEvt] });
    setForm({ title: "", date: "", time: "18:00", location: "Bureau du maire", participants: ["Christian", "Chantal", "Sophie (DGS)", "Julien"] });
    setShowNew(false);
    setSelId(newR.id);
  };

  const addPoint = () => {
    if (!ptForm.title) return;
    setData({ ...data, reunions: reunions.map((x) => x.id !== selId ? x : { ...x, points: [...x.points, { id: Date.now(), num: x.points.length + 1, title: ptForm.title, notes: "" }] }) });
    setPtForm({ title: "" });
    setShowPt(false);
  };

  const removePoint = (pid) => {
    setData({ ...data, reunions: reunions.map((x) => x.id !== selId ? x : { ...x, points: x.points.filter((p) => p.id !== pid).map((p, i) => ({ ...p, num: i + 1 })) }) });
  };

  const movePoint = (pid, dir) => {
    setData({ ...data, reunions: reunions.map((x) => {
      if (x.id !== selId) return x;
      const idx = x.points.findIndex((p) => p.id === pid);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === x.points.length - 1)) return x;
      const pts = [...x.points];
      [pts[idx], pts[idx + dir]] = [pts[idx + dir], pts[idx]];
      return { ...x, points: pts.map((p, i) => ({ ...p, num: i + 1 })) };
    }) });
  };

  const openNotes = (pt) => { setShowNotes(pt); setNotesText(pt.notes || ""); };
  const saveNotes = () => {
    setData({ ...data, reunions: reunions.map((x) => x.id !== selId ? x : { ...x, points: x.points.map((p) => p.id === showNotes.id ? { ...p, notes: notesText } : p) }) });
    setShowNotes(null);
  };

  const openEditPt = (pt) => { setShowEditPt(pt); setEditPtTitle(pt.title); };
  const saveEditPt = () => {
    if (!editPtTitle.trim()) return;
    setData({ ...data, reunions: reunions.map((x) => x.id !== selId ? x : { ...x, points: x.points.map((p) => p.id === showEditPt.id ? { ...p, title: editPtTitle.trim() } : p) }) });
    setShowEditPt(null);
  };

  const toggleStatus = () => {
    setData({ ...data, reunions: reunions.map((x) => x.id === selId ? { ...x, status: x.status === "planifiee" ? "terminee" : "planifiee" } : x) });
  };

  const updateParticipants = (p) => {
    setData({ ...data, reunions: reunions.map((x) => x.id === selId ? { ...x, participants: p } : x) });
  };

  const addAction = () => {
    if (!actForm.title || !showAct) return;
    setData({ ...data, actions: [...(data.actions || []), { id: Date.now(), ...actForm, status: "a_faire", reunionId: selId, pointId: showAct }] });
    setActForm({ title: "", responsable: "Christian", echeance: "", priority: "moyenne" });
    setShowAct(null);
  };

  const updateAction = (id, updates) => {
    setData({ ...data, actions: (data.actions || []).map((a) => a.id === id ? { ...a, ...updates } : a) });
  };

  /* Liste des réunions */
  if (!r) {
    const upcoming = reunions.filter((x) => x.status === "planifiee").sort((a, b) => a.date.localeCompare(b.date));
    const past = reunions.filter((x) => x.status === "terminee").sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Réunions</h1>
            <p style={{ fontSize: 12, color: T.text3, margin: "2px 0 0" }}>Municipalité</p>
          </div>
          <button onClick={() => setShowNew(true)} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>+ Nouvelle</button>
        </div>

        {upcoming.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>📅 Prochaines</div>
            {upcoming.map((x) => {
              const d = daysUntil(x.date);
              const dateObj = new Date(x.date + "T12:00:00");
              const pendingActions = (data.actions || []).filter((a) => a.reunionId === x.id && a.status !== "fait").length;
              return (
                <Card key={x.id} onClick={() => setSelId(x.id)} style={{ padding: 12, marginBottom: 8, display: "flex", gap: 12 }}>
                  <div style={{ minWidth: 52, textAlign: "center", flexShrink: 0, padding: "4px 0" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.primary, textTransform: "uppercase" }}>{dayN[dateObj.getDay()]}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{dateObj.getDate()}</div>
                    <div style={{ fontSize: 10, color: T.text3 }}>{monthN[dateObj.getMonth()]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginTop: 2 }}>{x.time}</div>
                  </div>
                  <div style={{ width: 3, borderRadius: 3, background: d !== null && d >= 0 && d <= 3 ? T.error : T.primary, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, wordBreak: "break-word" }}>{x.title}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>📍 {x.location}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                      <Badge text={x.points.length + " pts"} color={T.primary} bg={T.primaryFaded} />
                      <Badge text={x.participants.length + " pers."} color={T.text3} bg={T.bg} />
                      {pendingActions > 0 && <Badge text={pendingActions + " actions"} color={T.warning} bg={T.warningBg} />}
                      {d !== null && d >= 0 && d <= 3 && <Badge text={d === 0 ? "Aujourd'hui !" : "Dans " + d + "j"} color={T.error} bg={T.errorBg} />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {past.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, margin: "12px 0 8px", textTransform: "uppercase" }}>✅ Passées</div>
            {past.map((x) => {
              const dateObj = new Date(x.date + "T12:00:00");
              return (
              <Card key={x.id} onClick={() => setSelId(x.id)} style={{ padding: 12, marginBottom: 8, opacity: 0.7, display: "flex", gap: 12 }}>
                <div style={{ minWidth: 42, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: T.text3, textTransform: "uppercase" }}>{dayN[dateObj.getDay()]}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text3 }}>{dateObj.getDate()}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{monthN[dateObj.getMonth()]}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{x.title}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{x.points.length} points · {x.time}</div>
                </div>
              </Card>
              );
            })}
          </>
        )}

        <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouvelle réunion">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" style={inputStyle} />
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lieu" style={inputStyle} />
            <ParticipantPicker selected={form.participants} membres={membres} onChange={(p) => setForm({ ...form, participants: p })} onAdd={addGlobalMembre} />
            <button onClick={addReunion} style={btnStyle}>Créer</button>
          </div>
        </Modal>
      </div>
    );
  }

  /* Détail réunion */
  const allActions = data.actions || [];
  return (
    <div style={{ padding: "12px 14px" }}>
      <button onClick={() => setSelId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.primaryLight, fontWeight: 600, fontSize: 13, padding: "0 0 6px", fontFamily: "inherit" }}>← Retour</button>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 2px", wordBreak: "break-word" }}>{r.title}</h1>
      <p style={{ fontSize: 12, color: T.text3, margin: "0 0 4px" }}>📅 {fmtDateFull(r.date)} à {r.time} · 📍 {r.location}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", margin: "0 0 10px" }}>
        <span style={{ fontSize: 12, color: T.text3 }}>👥</span>
        {r.participants.map((p) => <span key={p} style={{ fontSize: 11, background: T.primaryFaded, color: T.primary, padding: "2px 7px", borderRadius: 99, fontWeight: 500 }}>{p}</span>)}
        <button onClick={() => setShowPart(true)} style={{ fontSize: 11, background: T.bg, color: T.text3, border: "1px dashed " + T.border, borderRadius: 99, padding: "2px 7px", cursor: "pointer", fontFamily: "inherit" }}>+</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setShowPt(true)} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Point</button>
        <button onClick={toggleStatus} style={{ background: r.status === "planifiee" ? T.successBg : T.bg, color: r.status === "planifiee" ? T.success : T.text3, border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {r.status === "planifiee" ? "✅ Clôturer" : "↩ Rouvrir"}
        </button>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>📋 Ordre du jour</div>
      {r.points.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 20 }}><p style={{ color: T.text3, fontSize: 13 }}>Aucun point</p></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {r.points.map((pt) => {
            const ptActions = allActions.filter((a) => a.reunionId === selId && a.pointId === pt.id);
            return (
              <Card key={pt.id} style={{ padding: 10 }}>
                {/* Point header */}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: T.primaryFaded, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: T.primary, flexShrink: 0 }}>{pt.num}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, wordBreak: "break-word" }}>{pt.title}</div>
                    {pt.notes && <div style={{ marginTop: 5, padding: 7, background: T.bg, borderRadius: 7, fontSize: 12, color: T.text2, lineHeight: 1.4, whiteSpace: "pre-line", wordBreak: "break-word" }}>📝 {pt.notes}</div>}
                    <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                      <button onClick={() => openEditPt(pt)} style={{ fontSize: 10, fontWeight: 600, color: T.accent, background: T.accentLight, border: "none", borderRadius: 5, padding: "3px 7px", cursor: "pointer" }}>✏️ Modifier</button>
                      <button onClick={() => openNotes(pt)} style={{ fontSize: 10, fontWeight: 600, color: T.primaryLight, background: T.primaryFaded, border: "none", borderRadius: 5, padding: "3px 7px", cursor: "pointer" }}>📝 Notes</button>
                      <button onClick={() => setShowAct(pt.id)} style={{ fontSize: 10, fontWeight: 600, color: T.accent, background: T.accentLight, border: "none", borderRadius: 5, padding: "3px 7px", cursor: "pointer" }}>🎯 + Action</button>
                      <button onClick={() => movePoint(pt.id, -1)} style={{ fontSize: 10, color: T.text3, background: T.bg, border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer" }}>↑</button>
                      <button onClick={() => movePoint(pt.id, 1)} style={{ fontSize: 10, color: T.text3, background: T.bg, border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer" }}>↓</button>
                      <button onClick={() => removePoint(pt.id)} style={{ fontSize: 10, color: T.error, background: T.errorBg, border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                </div>

                {/* Actions linked to this point */}
                {ptActions.length > 0 && (
                  <div style={{ marginTop: 8, marginLeft: 36, display: "flex", flexDirection: "column", gap: 4 }}>
                    {ptActions.sort((a, b) => (a.echeance || "9").localeCompare(b.echeance || "9")).map((a) => {
                      const overdue = a.status !== "fait" && isOverdue(a.echeance);
                      const d = daysUntil(a.echeance);
                      return (
                        <div key={a.id} style={{ padding: "6px 8px", background: T.bg, borderRadius: 7, borderLeft: "3px solid " + (overdue ? T.error : actStatusColor[a.status]) }}>
                          <div style={{ fontSize: 12, fontWeight: 600, textDecoration: a.status === "fait" ? "line-through" : "none", opacity: a.status === "fait" ? 0.6 : 1, wordBreak: "break-word" }}>🎯 {a.title}</div>
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 2, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            <span>👤 {a.responsable}</span>
                            {a.echeance && <span>· 📅 {fmtDate(a.echeance)}</span>}
                            {overdue && <span style={{ color: T.error, fontWeight: 600 }}>· ⚠️ Retard</span>}
                            {!overdue && d !== null && d >= 0 && d <= 3 && a.status !== "fait" && <span style={{ color: T.warning, fontWeight: 600 }}>· J-{d}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                            {["a_faire", "en_cours", "fait"].map((s) => (
                              <button key={s} onClick={() => updateAction(a.id, { status: s })} style={{ fontSize: 9, fontWeight: 600, border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer", background: a.status === s ? actStatusBg[s] : T.surface, color: a.status === s ? actStatusColor[s] : T.text3 }}>{actStatusLabel[s]}</button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal open={showPt} onClose={() => setShowPt(false)} title="Ajouter un point">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={ptForm.title} onChange={(e) => setPtForm({ title: e.target.value })} placeholder="Sujet à aborder" style={inputStyle} autoFocus />
          <button onClick={addPoint} style={btnStyle}>Ajouter</button>
        </div>
      </Modal>

      <Modal open={!!showAct} onClose={() => setShowAct(null)} title="Nouvelle action">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: T.info, background: T.infoBg, padding: 8, borderRadius: 8 }}>
            📋 Liée au point : <b>{r.points.find((p) => p.id === showAct)?.title || ""}</b>
          </div>
          <input value={actForm.title} onChange={(e) => setActForm({ ...actForm, title: e.target.value })} placeholder="Que faut-il faire ?" style={inputStyle} autoFocus />
          <select value={actForm.responsable} onChange={(e) => setActForm({ ...actForm, responsable: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
            {r.participants.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" value={actForm.echeance} onChange={(e) => setActForm({ ...actForm, echeance: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <select value={actForm.priority} onChange={(e) => setActForm({ ...actForm, priority: e.target.value })} style={{ ...inputStyle, flex: 1, background: "#fff" }}>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>
          <button onClick={addAction} style={btnStyle}>Créer</button>
        </div>
      </Modal>

      <Modal open={showPart} onClose={() => setShowPart(false)} title="Participants">
        <ParticipantPicker selected={r.participants} membres={membres} onChange={updateParticipants} onAdd={addGlobalMembre} />
        <button onClick={() => setShowPart(false)} style={{ ...btnStyle, marginTop: 16 }}>Valider</button>
      </Modal>

      <Modal open={!!showNotes} onClose={() => setShowNotes(null)} title={"Notes — " + (showNotes ? showNotes.title : "")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Notes, décisions..." rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} autoFocus />
          <button onClick={saveNotes} style={btnStyle}>Enregistrer</button>
        </div>
      </Modal>

      <Modal open={!!showEditPt} onClose={() => setShowEditPt(null)} title="Modifier le point">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={editPtTitle} onChange={(e) => setEditPtTitle(e.target.value)} placeholder="Titre du point" style={inputStyle} autoFocus />
          <button onClick={saveEditPt} style={btnStyle}>Enregistrer</button>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* ACTIONS SCREEN                              */
/* ═══════════════════════════════════════════ */
function ActionsScreen({ data, setData }) {
  const [filter, setFilter] = useState("actives");
  const actions = data.actions || [];
  const overdueCount = actions.filter((a) => a.status !== "fait" && isOverdue(a.echeance)).length;

  const filtered = actions.filter((a) => {
    if (filter === "actives") return a.status !== "fait";
    if (filter === "retard") return a.status !== "fait" && isOverdue(a.echeance);
    return true;
  }).sort((a, b) => (a.echeance || "9").localeCompare(b.echeance || "9"));

  const updateAction = (id, updates) => {
    setData({ ...data, actions: actions.map((a) => a.id === id ? { ...a, ...updates } : a) });
  };

  return (
    <div style={{ padding: "12px 14px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Actions</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        <div style={{ background: T.infoBg, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.info }}>{actions.filter((a) => a.status === "a_faire").length}</div>
          <div style={{ fontSize: 10, color: T.text3 }}>À faire</div>
        </div>
        <div style={{ background: overdueCount > 0 ? T.errorBg : T.bg, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: overdueCount > 0 ? T.error : T.text3 }}>{overdueCount}</div>
          <div style={{ fontSize: 10, color: T.text3 }}>En retard</div>
        </div>
        <div style={{ background: T.successBg, borderRadius: 8, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.success }}>{actions.filter((a) => a.status === "fait").length}</div>
          <div style={{ fontSize: 10, color: T.text3 }}>Faites</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["actives", "Actives"], ["retard", "En retard"], ["toutes", "Toutes"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: filter === k ? T.primary : T.bg, color: filter === k ? "#fff" : T.text2, whiteSpace: "nowrap" }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 20 }}>
          <p style={{ color: T.text2, fontSize: 13 }}>{filter === "retard" ? "🎉 Rien en retard !" : "Aucune action"}</p>
        </Card>
      ) : filtered.map((a) => {
        const overdue = a.status !== "fait" && isOverdue(a.echeance);
        const d = daysUntil(a.echeance);
        const reunion = (data.reunions || []).find((x) => x.id === a.reunionId);
        return (
          <Card key={a.id} style={{ padding: 10, marginBottom: 6, borderLeft: "3px solid " + (overdue ? T.error : actStatusColor[a.status]) }}>
            <div style={{ fontSize: 13, fontWeight: 600, textDecoration: a.status === "fait" ? "line-through" : "none", opacity: a.status === "fait" ? 0.6 : 1, wordBreak: "break-word" }}>{a.title}</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 2, display: "flex", flexWrap: "wrap", gap: 4 }}>
              <span>👤 {a.responsable}</span>
              {a.echeance && <span>· 📅 {fmtDate(a.echeance)}</span>}
              {overdue && <span style={{ color: T.error, fontWeight: 600 }}>· ⚠️</span>}
              {!overdue && d !== null && d >= 0 && d <= 3 && a.status !== "fait" && <span style={{ color: T.warning, fontWeight: 600 }}>· J-{d}</span>}
            </div>
            {reunion && (() => {
              const point = reunion.points.find((p) => p.id === a.pointId);
              return <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>📋 {reunion.title}{point ? " → " + point.title : ""}</div>;
            })()}
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {["a_faire", "en_cours", "fait"].map((s) => (
                <button key={s} onClick={() => updateAction(a.id, { status: s })} style={{ fontSize: 10, fontWeight: 600, border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", background: a.status === s ? actStatusBg[s] : T.bg, color: a.status === s ? actStatusColor[s] : T.text3 }}>{actStatusLabel[s]}</button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* AGENDA SCREEN                               */
/* ═══════════════════════════════════════════ */
function AgendaScreen({ data, setData }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [evtForm, setEvtForm] = useState({ title: "", time: "09:00", duration: 60, type: "reunion", location: "" });
  const [gcal, setGcal] = useState({ connected: false, events: [], loading: true });
  const [syncing, setSyncing] = useState(false);

  useEffect(function() {
    fetch('/api/google/sync')
      .then(function(r) { return r.json(); })
      .then(function(d) { setGcal({ connected: d.connected, events: d.events || [], loading: false }); })
      .catch(function() { setGcal({ connected: false, events: [], loading: false }); });
  }, [syncing]);

  useEffect(function() {
    if (typeof window !== 'undefined') {
      var params = new URLSearchParams(window.location.search);
      if (params.get('gcal') === 'success') {
        setSyncing(function(s) { return !s; });
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);

  const syncNow = function() { setSyncing(function(s) { return !s; }); };

  const getWeekDays = function(offset) {
    var start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1 + offset * 7);
    return Array.from({ length: 7 }, function(_, i) {
      var d = new Date(start); d.setDate(start.getDate() + i); return d;
    });
  };

  var weekDays = getWeekDays(weekOffset);
  var selStr = toDS(selectedDate);
  var allAgenda = data.agenda || [];
  var gcalEventsForDay = gcal.events.filter(function(e) { return e.date === selStr; });
  var localEvents = allAgenda.filter(function(e) { return e.date === selStr; });
  var allDayEvents = localEvents.concat(gcalEventsForDay.filter(function(g) {
    return !localEvents.some(function(l) { return l.googleId === g.googleId; });
  })).sort(function(a, b) { return (a.time || '').localeCompare(b.time || ''); });
  var allEvtDates = {};
  allAgenda.forEach(function(e) { allEvtDates[e.date] = true; });
  gcal.events.forEach(function(e) { allEvtDates[e.date] = true; });

  var addEvent = function() {
    if (!evtForm.title) return;
    var newEvt = { id: Date.now(), title: evtForm.title, time: evtForm.time, duration: evtForm.duration, type: evtForm.type, location: evtForm.location, date: selStr };
    setData(Object.assign({}, data, { agenda: allAgenda.concat([newEvt]) }));
    if (gcal.connected) {
      fetch('/api/google/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEvt) }).catch(function() {});
    }
    setEvtForm({ title: "", time: "09:00", duration: 60, type: "reunion", location: "" });
    setShowAdd(false);
  };

  var deleteEvent = function(id) {
    setData(Object.assign({}, data, { agenda: allAgenda.filter(function(e) { return e.id !== id; }) }));
  };

  return (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Agenda</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {gcal.connected && <button onClick={syncNow} style={{ background: T.successBg, color: T.success, border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🔄 Sync</button>}
          <button onClick={function() { setShowAdd(true); }} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>+ RDV</button>
        </div>
      </div>

      {!gcal.loading && !gcal.connected && (
        <Card style={{ padding: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Google Calendar</div>
            <div style={{ fontSize: 11, color: T.text3 }}>Synchronise tes RDV</div>
          </div>
          <a href="/api/google" style={{ background: "#4285F4", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}>Connecter</a>
        </Card>
      )}
      {gcal.connected && <div style={{ fontSize: 11, color: T.success, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><span>✅ Google Calendar connecté</span><span style={{ color: T.text3 }}>· {gcal.events.length} événements</span></div>}

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        <button onClick={function() { setWeekOffset(function(w) { return w - 1; }); }} style={{ background: T.bg, border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>‹</button>
        <div style={{ flex: 1, display: "flex", gap: 2 }}>
          {weekDays.map(function(d) {
            var ds = toDS(d); var isSel = ds === selStr; var isToday = ds === todayStr; var hasEvts = !!allEvtDates[ds];
            return (
              <button key={ds} onClick={function() { setSelectedDate(new Date(d)); }} style={{ flex: 1, padding: "6px 0", background: isSel ? T.primary : "transparent", color: isSel ? "#fff" : T.text, border: isToday && !isSel ? "2px solid " + T.primary : "none", borderRadius: 8, cursor: "pointer", textAlign: "center", fontFamily: "inherit", minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.7 }}>{dayN[d.getDay()]}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{d.getDate()}</div>
                {hasEvts && <div style={{ width: 4, height: 4, borderRadius: 99, background: isSel ? "#fff" : T.accent, margin: "2px auto 0" }} />}
              </button>
            );
          })}
        </div>
        <button onClick={function() { setWeekOffset(function(w) { return w + 1; }); }} style={{ background: T.bg, border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>›</button>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: T.text2, margin: "0 0 10px" }}>{dayN[selectedDate.getDay()]} {selectedDate.getDate()} {monthN[selectedDate.getMonth()]}{selStr === todayStr && <span style={{ color: T.accent, marginLeft: 6 }}>— Aujourd&apos;hui</span>}</p>

      {allDayEvents.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 32 }}>📅</div>
          <p style={{ color: T.text2, margin: "6px 0 0", fontSize: 13 }}>Aucun événement</p>
          <button onClick={function() { setShowAdd(true); }} style={{ marginTop: 10, background: T.primaryFaded, color: T.primary, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Ajouter un RDV</button>
        </Card>
      ) : allDayEvents.map(function(e, idx) {
        var isGoogle = e.source === 'google';
        return (
        <Card key={e.id || e.googleId || idx} style={{ padding: 10, marginBottom: 6, display: "flex", gap: 10 }}>
          <div style={{ minWidth: 44, textAlign: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{e.time}</span><br />
            <span style={{ fontSize: 10, color: T.text3 }}>{e.duration}m</span>
          </div>
          <div style={{ width: 3, borderRadius: 3, background: isGoogle ? "#4285F4" : (evtColors[e.type] || evtColors.reunion), flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, wordBreak: "break-word" }}>{e.title}</div>
            {e.location && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>📍 {e.location}</div>}
            {isGoogle && <div style={{ fontSize: 10, color: "#4285F4", marginTop: 2 }}>📅 Google Calendar</div>}
            {e.reunionId && <div style={{ fontSize: 10, color: T.info, marginTop: 2 }}>📋 Réunion de municipalité</div>}
          </div>
          {!e.reunionId && !isGoogle && (
            <button onClick={function() { deleteEvent(e.id); }} style={{ fontSize: 10, color: T.error, background: T.errorBg, border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", flexShrink: 0, alignSelf: "flex-start" }}>✕</button>
          )}
        </Card>
        );
      })}

      <Modal open={showAdd} onClose={function() { setShowAdd(false); }} title="Nouveau rendez-vous">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={evtForm.title} onChange={function(e) { setEvtForm(Object.assign({}, evtForm, { title: e.target.value })); }} placeholder="Titre du RDV" style={inputStyle} autoFocus />
          <div style={{ display: "flex", gap: 8 }}>
            <input type="time" value={evtForm.time} onChange={function(e) { setEvtForm(Object.assign({}, evtForm, { time: e.target.value })); }} style={Object.assign({}, inputStyle, { flex: 1 })} />
            <select value={evtForm.type} onChange={function(e) { setEvtForm(Object.assign({}, evtForm, { type: e.target.value })); }} style={Object.assign({}, inputStyle, { flex: 1, background: "#fff" })}>
              <option value="reunion">Réunion</option>
              <option value="commission">Commission</option>
              <option value="permanence">Permanence</option>
              <option value="conseil">Conseil</option>
              <option value="formation">Formation</option>
              <option value="visite">Visite</option>
              <option value="appel">Appel</option>
            </select>
          </div>
          <input value={evtForm.location} onChange={function(e) { setEvtForm(Object.assign({}, evtForm, { location: e.target.value })); }} placeholder="Lieu" style={inputStyle} />
          <div style={{ fontSize: 12, color: T.text3, padding: "4px 0" }}>
            📅 Sera ajouté le {fmtDate(selStr)}
            {gcal.connected && <span style={{ color: "#4285F4", marginLeft: 6 }}>+ Google Calendar</span>}
          </div>
          <button onClick={addEvent} style={btnStyle}>Ajouter</button>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* DOSSIERS SCREEN                             */
/* ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════ */
/* MAIN APP                                    */
/* ═══════════════════════════════════════════ */
export default function MairieHub() {
  const router = useRouter();
  const [data, setDataLocal] = useState(null);
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  // Fetch data from API
  useEffect(() => {
    fetch('/api/data').then(r => {
      if (r.status === 401) { router.push('/'); return null; }
      return r.json();
    }).then(d => {
      if (d) { setRole(d.role); setDataLocal(d); }
      setLoading(false);
    }).catch(() => { router.push('/'); });
  }, [router]);

  // Save to API with debounce
  const setData = useCallback((newData) => {
    setDataLocal(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { role: _, ...toSave } = newData;
      fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      }).catch(console.error);
    }, 500);
  }, []);

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  if (loading || !data) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #1B3A5C, #0F2340)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🏛️</div>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>MairieHub</div>
        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>Morvillars</div>
      </div>
    );
  }

  const isAdjoint = role === 'adjoint';
  const tabs = isAdjoint
    ? [{ emoji: "📅", label: "Agenda" }]
    : [{ emoji: "📅", label: "Agenda" }, { emoji: "📋", label: "Réunions" }, { emoji: "🎯", label: "Actions" }, { emoji: "🏛️", label: "Commissions" }];

  const overdueActions = (data.actions || []).filter((a) => a.status !== "fait" && isOverdue(a.echeance)).length;

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: "100vw", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; -webkit-text-size-adjust: 100%; }
        body { margin: 0; background: #F3F5F8; overflow-x: hidden; width: 100%; }
        ::-webkit-scrollbar { display: none; }
        input, select, textarea { font-family: inherit; font-size: 16px !important; }
      `}</style>

      <div style={{ maxWidth: 500, margin: "0 auto", width: "100%", position: "relative" }}>
        {/* Top bar */}
        <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, borderBottom: "1px solid " + T.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>🏛️</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>MairieHub</span>
            {isAdjoint && <Badge text="Adjoint" color={T.warning} bg={T.warningBg} />}
          </div>
          <button onClick={logout} style={{ fontSize: 11, color: T.text3, background: T.bg, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>Déconnexion</button>
        </div>

        {/* Content */}
        <div style={{ paddingBottom: 80, minHeight: "calc(100dvh - 90px)", overflowX: "hidden" }}>
          {isAdjoint ? (
            <AgendaScreen data={data} setData={setData} />
          ) : (
            <>
              {tab === 0 && <AgendaScreen data={data} setData={setData} />}
              {tab === 1 && <ReunionsScreen data={data} setData={setData} />}
              {tab === 2 && <ActionsScreen data={data} setData={setData} />}
              {tab === 3 && <CommissionsScreen data={data} setData={setData} />}
            </>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.97)", borderTop: "1px solid " + T.borderLight, zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", justifyContent: "space-around", padding: "6px 0 2px" }}>
            {tabs.map((t, i) => {
              const active = tab === i;
              const showBadge = !isAdjoint && i === 2 && overdueActions > 0;
              return (
                <button key={i} onClick={() => setTab(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "4px 4px", background: "none", border: "none", cursor: "pointer", color: active ? T.primary : T.text3, fontFamily: "inherit", position: "relative", WebkitTapHighlightColor: "transparent", minWidth: 0 }}>
                  <span style={{ fontSize: 17, transform: active ? "scale(1.1)" : "scale(1)", transition: "transform 0.15s" }}>{t.emoji}</span>
                  <span style={{ fontSize: 8, fontWeight: active ? 700 : 500 }}>{t.label}</span>
                  {active && <div style={{ width: 4, height: 4, borderRadius: 99, background: T.primary, marginTop: -1 }} />}
                  {showBadge && <div style={{ position: "absolute", top: -1, right: 0, width: 14, height: 14, borderRadius: 99, background: T.error, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{overdueActions}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

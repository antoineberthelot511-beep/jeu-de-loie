"use client";
// Pour ton projet : ajoute  "use client";  tout en haut, puis enregistre ce
// fichier sous  src/app/host/[code]/page.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ---------- petites icônes SVG (pas de lib externe) ---------- */
const Ic = {
  grid: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  shapes: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="7" cy="7" r="4" /><rect x="13" y="3" width="8" height="8" rx="1" />
      <path d="M7 14l4 7H3z" /><rect x="13" y="14" width="8" height="8" rx="1" />
    </svg>
  ),
  text: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M5 6h14M12 6v13M9 19h6" />
    </svg>
  ),
  brand: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h5" />
    </svg>
  ),
  upload: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </svg>
  ),
  tools: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M14 7l3 3-9 9-3-3z" /><path d="M16 5l3 3" /><circle cx="6" cy="18" r="1" />
    </svg>
  ),
  projects: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
  apps: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" /><path d="M15 18h6M18 15v6" />
    </svg>
  ),
  magic: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M5 19l9-9M14 5l1.5 3L19 9.5 15.5 11 14 14l-1.5-3L9 9.5 12.5 8z" />
    </svg>
  ),
  bg: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15l5-5 4 4 3-3 6 6" />
    </svg>
  ),
  mic: (c = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" />
    </svg>
  ),
  spark: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={c}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" /><circle cx="18" cy="17" r="1.6" />
    </svg>
  ),
  play: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#333">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  crown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
      <path d="M3 18l2-10 5 5 2-7 2 7 5-5 2 10z" />
    </svg>
  ),
  chevron: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  pencil: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M15 5l4 4L8 20H4v-4z" />
    </svg>
  ),
  cloud: (c = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M6 18a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0118 18z" /><path d="M9 14l2 2 4-4" />
    </svg>
  ),
  chart: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  chat: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  ),
  notes: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  timer: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="12" cy="13" r="8" /><path d="M12 13V9M9 2h6" />
    </svg>
  ),
  grid2: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  expand: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  ),
  help: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 013.5 2c0 1.5-2 1.5-2 3M12 17h.01" />
    </svg>
  ),
};

/* ---------- rail gauche ---------- */
const railItems = [
  { key: "modeles", label: "Modèles", icon: Ic.grid },
  { key: "elements", label: "Éléments", icon: Ic.shapes },
  { key: "texte", label: "Texte", icon: Ic.text },
  { key: "marque", label: "Marque", icon: Ic.brand },
  { key: "importer", label: "Importer", icon: Ic.upload },
  { key: "outils", label: "Outils", icon: Ic.tools },
  { divider: true },
  { key: "projets", label: "Projets", icon: Ic.projects },
  { key: "applis", label: "Applis", icon: Ic.apps },
  { divider: true },
  { key: "magic", label: "Média magi…", icon: Ic.magic },
  { key: "bg", label: "Arrière-plan", icon: Ic.bg },
] as const;

/* ---------- cartes de la grille de résultats ---------- */
const results = [
  { t: "L'ORIENT", sub: "PRÉSENTATION", bg: "linear-gradient(135deg,#caa37a,#7c5a3a)", light: true, play: true },
  { t: "ROYAUME-UNIS", sub: "PRÉSENTATION", bg: "#1b2a52", accent: "#d12b2b" },
  { t: "Roadtrip en Écosse", sub: "3 au 8 Mai 2025", bg: "linear-gradient(135deg,#5b6b55,#2f3a2c)", light: true },
  { t: "Europe", sub: "", bg: "#16235a", euro: true },
  { t: "BUSINESS PROJECT", sub: "", bg: "linear-gradient(135deg,#3a3f4a,#11141a)", light: true },
  { t: "Project Proposal", sub: "", bg: "#eef1f6", dark: true, crown: true, play: true },
  { t: "PONT D'AVIGNON", sub: "", bg: "linear-gradient(135deg,#6f8aa6,#3a4f63)", light: true, crown: true },
  { t: "", sub: "", bg: "#f4f6fa", dark: true, crown: true, info: true },
  { t: "RÉUNION DE RENTRÉE", sub: "2026-2027", bg: "linear-gradient(135deg,#243b6b,#0f1c3a)", light: true, crown: true, play: true },
  { t: "CHINA", sub: "", bg: "#b91c1c", light: true },
  { t: "Monaco", sub: "", bg: "#eef1f6", dark: true },
  { t: "", sub: "", bg: "#c0182a", light: true, leaf: true },
];

/* ---------- éditeur : types & données ---------- */
type ShapeType = "rect" | "circle" | "triangle" | "star" | "line";
type ElementType = "text" | "image" | ShapeType;

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  text?: string;
  fontSize?: number;
  bold?: boolean;
  src?: string;
  // New properties
  rotation?: number; // in degrees
  opacity?: number; // 0-100
  fontFamily?: string; // for text
  textAlign?: 'left' | 'center' | 'right'; // for text
}

const COLORS = ["#7c3aed", "#e0245e", "#f0a500", "#16a34a", "#0ea5e9", "#0d1216"];

const shapeDefs: { key: ShapeType; label: string; render: (c: string) => React.ReactNode }[] = [
  { key: "rect", label: "Rectangle", render: (c) => <div style={{ width: 32, height: 32, background: c }} /> },
  { key: "circle", label: "Cercle", render: (c) => <div style={{ width: 32, height: 32, borderRadius: "50%", background: c }} /> },
  {
    key: "triangle",
    label: "Triangle",
    render: (c) => (
      <svg width="32" height="32" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,4 97,96 3,96" fill={c} />
      </svg>
    ),
  },
  {
    key: "star",
    label: "Étoile",
    render: (c) => (
      <svg width="32" height="32" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,3 61,38 98,38 68,59 79,95 50,73 21,95 32,59 2,38 39,38" fill={c} />
      </svg>
    ),
  },
  {
    key: "line",
    label: "Ligne",
    render: (c) => (
      <svg width="32" height="32" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="2" y1="50" x2="98" y2="50" stroke={c} strokeWidth="8" />
      </svg>
    ),
  },
];

function renderShapeContent(el: CanvasElement) {
  switch (el.type) {
    case "rect":
      return <div style={{ width: "100%", height: "100%", background: el.color }} />;
    case "circle":
      return <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: el.color }} />;
    case "triangle":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 98,98 2,98" fill={el.color} />
        </svg>
      );
    case "star":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,3 61,38 98,38 68,59 79,95 50,73 21,95 32,59 2,38 39,38" fill={el.color} />
        </svg>
      );
    case "line":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="2" y1="50" x2="98" y2="50" stroke={el.color} strokeWidth="6" />
        </svg>
      );
    default:
      return null;
  }
}

function genId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function HostScreen() {
  const params = useParams<{ code: string }>();
  const code = (params?.code ?? "").toUpperCase();

  const [zoom, setZoom] = useState(63);

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panel, setPanel] = useState<string>("modeles");
  const [canvasBg, setCanvasBg] = useState("#ffffff");
  const [currentColor, setCurrentColor] = useState("#7c3aed");
  const [undoStack, setUndoStack] = useState<Array<{elements: CanvasElement[], canvasBg: string}>>([]);
  const [redoStack, setRedoStack] = useState<Array<{elements: CanvasElement[], canvasBg: string}>>([]);
  const clipboard = useRef<CanvasElement | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "loading" | "error">("idle");

  // Trouve la partie via son code, puis charge le plateau sauvegardé (si présent)
  useEffect(() => {
    if (!code) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, board")
        .eq("code", code)
        .maybeSingle();

      if (!active) return;
      if (error || !data) return;

      setGameId(data.id);
      const board = data.board as { elements?: CanvasElement[]; canvasBg?: string } | null;
      if (board) {
        if (board.elements) setElements(board.elements);
        if (board.canvasBg) setCanvasBg(board.canvasBg);
      }
    })();

    return () => {
      active = false;
    };
  }, [code]);

  async function handleSave() {
    if (!gameId) return;
    setSaveStatus("saving");
    const { error } = await supabase
      .from("games")
      .update({ board: { elements, canvasBg } })
      .eq("id", gameId);
    setSaveStatus(error ? "error" : "saved");
  }

  async function handleLoad() {
    if (!gameId) return;
    setSaveStatus("loading");
    const { data, error } = await supabase
      .from("games")
      .select("board")
      .eq("id", gameId)
      .maybeSingle();

    if (error || !data) {
      setSaveStatus("error");
      return;
    }

    const board = data.board as { elements?: CanvasElement[]; canvasBg?: string } | null;
    saveState();
    setElements(board?.elements ?? []);
    setCanvasBg(board?.canvasBg ?? "#ffffff");
    setSelectedId(null);
    setEditingId(null);
    setSaveStatus("saved");
  }

  function saveState() {
    setUndoStack((prev) => [...prev, { elements: [...elements], canvasBg }]);
    setRedoStack([]);
  }

  const setCanvasBgWithSave = (color: string) => {
    saveState();
    setCanvasBg(color);
  };

  function undo() {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { elements: [...elements], canvasBg }]);
    setUndoStack((prev) => prev.slice(0, -1));
    setElements(last.elements);
    setCanvasBg(last.canvasBg);
    setSelectedId(null);
    setEditingId(null);
  }

  function redo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { elements: [...elements], canvasBg }]);
    setRedoStack((prev) => prev.slice(0, -1));
    setElements(next.elements);
    setCanvasBg(next.canvasBg);
    setSelectedId(null);
    setEditingId(null);
  }

  function copySelected() {
    if (!selectedId) return;
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    clipboard.current = { ...el };
  }

  function pasteSelected() {
    if (!clipboard.current) return;
    saveState();
    const newId = genId();
    const newEl = {
      ...clipboard.current,
      id: newId,
      x: clipboard.current.x + 20,
      y: clipboard.current.y + 20,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newId);
  }

  function duplicateSelected() {
    if (!selectedId) return;
    saveState();
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    const newId = genId();
    const newEl = {
      ...el,
      id: newId,
      x: el.x + 20,
      y: el.y + 20,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newId);
  }

  function bringForward() {
    if (!selectedId) return;
    saveState();
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === selectedId);
      if (idx === prev.length - 1) return prev;
      const newElements = [...prev];
      const [moved] = newElements.splice(idx, 1);
      newElements.splice(idx + 1, 0, moved);
      return newElements;
    });
  }

  function sendBackward() {
    if (!selectedId) return;
    saveState();
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === selectedId);
      if (idx === 0) return prev;
      const newElements = [...prev];
      const [moved] = newElements.splice(idx, 1);
      newElements.splice(idx - 1, 0, moved);
      return newElements;
    });
  }

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEl = elements.find((el) => el.id === selectedId) ?? null;

  const railIconColor = (active: boolean) => (active ? "#00838c" : "#3d3f44");

  function centerPos(w: number, h: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const cw = rect?.width ?? 600;
    const ch = rect?.height ?? 340;
    return { x: cw / 2 - w / 2, y: ch / 2 - h / 2 };
  }

  function addElement(partial: Omit<CanvasElement, "id">) {
    saveState();
    const id = genId();
    const newElement: CanvasElement = {
      id,
      ...partial,
      rotation: 0,
      opacity: 100,
      fontFamily: undefined,
      textAlign: undefined,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(id);
    setEditingId(null);
  }

  function addText(fontSize: number, bold: boolean, label: string) {
    const w = fontSize >= 40 ? 380 : fontSize >= 24 ? 300 : 220;
    const h = fontSize + 24;
    const { x, y } = centerPos(w, h);
    addElement({ type: "text", x, y, w, h, color: "#0d1216", text: label, fontSize, bold });
  }

  function addShape(type: ShapeType) {
    const w = type === "line" ? 160 : 120;
    const h = type === "line" ? 24 : 120;
    const { x, y } = centerPos(w, h);
    addElement({ type, x, y, w, h, color: currentColor });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const w = 240;
      const h = 160;
      const { x, y } = centerPos(w, h);
      addElement({ type: "image", x, y, w, h, color: "#000", src: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleElementMouseDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (editingId === id) return;
    saveState();
    setSelectedId(id);
    const el = elements.find((it) => it.id === id);
    if (!el) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setElements((prev) => prev.map((p) => (p.id === id ? { ...p, x: startElX + dx, y: startElY + dy } : p)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleResizeMouseDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const el = elements.find((it) => it.id === id);
    if (!el) return;
    saveState();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.w;
    const startH = el.h;
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setElements((prev) =>
        prev.map((p) => (p.id === id ? { ...p, w: Math.max(20, startW + dx), h: Math.max(20, startH + dy) } : p))
      );
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleTextDoubleClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedId(id);
    setEditingId(id);
  }

  function handleTextBlur(e: React.FocusEvent<HTMLDivElement>, id: string) {
    if (!selectedId) return; // safety, but should be selected
    saveState();
    const text = e.currentTarget.textContent ?? "";
    setElements((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));
    setEditingId(null);
  }

  function applyColorToSelected(color: string) {
    if (!selectedId) return;
    saveState();
    setElements((prev) => prev.map((p) => (p.id === selectedId ? { ...p, color } : p)));
  }

  function bumpFontSize(delta: number) {
    if (!selectedId) return;
    saveState();
    setElements((prev) =>
      prev.map((p) => (p.id === selectedId && p.type === "text" ? { ...p, fontSize: Math.max(8, (p.fontSize ?? 16) + delta) } : p))
    );
  }

  function toggleBold() {
    if (!selectedId) return;
    saveState();
    setElements((prev) => prev.map((p) => (p.id === selectedId && p.type === "text" ? { ...p, bold: !p.bold } : p)));
  }

  function deleteSelected() {
    if (!selectedId) return;
    saveState();
    setElements((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Copy: Ctrl+C
      if (e.ctrlKey && e.key === "c" && !e.shiftKey && !editingId) {
        e.preventDefault();
        copySelected();
        return;
      }
      // Paste: Ctrl+V
      if (e.ctrlKey && e.key === "v" && !e.shiftKey && !editingId) {
        e.preventDefault();
        pasteSelected();
        return;
      }
      // Duplicate: Ctrl+D
      if (e.ctrlKey && e.key === "d" && !e.shiftKey && !editingId) {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      // Arrow keys: move selected element
      if (selectedId && !editingId) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          saveState();
          setElements((prev) =>
            prev.map((p) =>
              p.id === selectedId ? { ...p, x: p.x - step } : p
            )
          );
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          saveState();
          setElements((prev) =>
            prev.map((p) =>
              p.id === selectedId ? { ...p, x: p.x + step } : p
            )
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          saveState();
          setElements((prev) =>
            prev.map((p) =>
              p.id === selectedId ? { ...p, y: p.y - step } : p
            )
          );
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          saveState();
          setElements((prev) =>
            prev.map((p) =>
              p.id === selectedId ? { ...p, y: p.y + step } : p
            )
          );
          return;
        }
      }
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        redo();
        return;
      }
      // Delete
      if (selectedId && !editingId && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        deleteSelected();
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, editingId, undoStack, redoStack, elements, canvasBg]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'Segoe UI', Roboto, system-ui, -apple-system, sans-serif",
        background: "#edeef0",
        color: "#0d1216",
        overflow: "hidden",
      }}
    >
      {/* ============ BARRE DU HAUT ============ */}
      <div
        style={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          background:
            "linear-gradient(90deg,#1fb6c4 0%,#3aa0d8 26%,#5f8fe6 42%,#e9edf3 60%,#ffffff 100%)",
          gap: 14,
        }}
      >
        {/* logo maison */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "#00c4cc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <path d="M16 8.5a4.5 4.5 0 10.2 7" strokeLinecap="round" />
          </svg>
        </div>

        <span style={{ fontWeight: 600, fontSize: 15, color: "#0d1216" }}>Fichier</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#0d1216" }}>Redimensionner</span>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
            fontSize: 15,
            color: "#0d1216",
          }}
        >
          {Ic.pencil("#0d1216")} Retouche {Ic.chevron("#0d1216")}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={undo} style={btnGhost}>↶</button>
          <button onClick={redo} style={btnGhost}>↷</button>
        </div>

        {/* badge autosave + Nouveau */}
        <div style={{ position: "relative", marginLeft: 2 }}>
          <span
            style={{
              position: "absolute",
              top: -14,
              left: -2,
              background: "#7c3aed",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 5,
            }}
          >
            Nouveau
          </span>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "rgba(255,255,255,.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {Ic.cloud("#1f7a82")}
          </div>
        </div>

        {/* titre centré */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ color: "#9aa3ad", fontSize: 14 }}>Sans titre - Présentation</span>
        </div>

        {/* droite */}
        <button style={btnGhost}>
          <span style={{ color: "#f0a500" }}>{"👑"}</span> Tester pour 0&nbsp;€
        </button>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "2px solid #e0245e",
            background: "#6b3fa0",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          A
        </div>

        <span style={{ color: "#3d3f44", cursor: "pointer" }}>{Ic.chart("#3d3f44")}</span>
        <span style={{ color: "#3d3f44", cursor: "pointer" }}>{Ic.chat("#3d3f44")}</span>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#7c3aed",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Présenter {Ic.chevron("#7c3aed")}
        </span>

        <button onClick={handleLoad} disabled={!gameId} style={btnGhost}>
          Charger
        </button>

        <button
          onClick={handleSave}
          disabled={!gameId || saveStatus === "saving"}
          style={{
            background: "#0d1117",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: 15,
            cursor: gameId ? "pointer" : "not-allowed",
            opacity: gameId ? 1 : 0.5,
          }}
        >
          {saveStatus === "saving" ? "Enregistrement…" : saveStatus === "saved" ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>

      {/* ============ CORPS ============ */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* rail gauche */}
        <div
          style={{
            width: 72,
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #ececec",
            paddingTop: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          {railItems.map((it, i) =>
            "divider" in it ? (
              <div key={i} style={{ width: 40, height: 1, background: "#ececec", margin: "8px 0" }} />
            ) : (
              <div
                key={it.key}
                onClick={() => setPanel(it.key)}
                style={{
                  width: "100%",
                  padding: "9px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: railIconColor(panel === it.key),
                  background: panel === it.key ? "#f0fbfc" : "transparent",
                }}
              >
                {it.icon(railIconColor(panel === it.key))}
                <span style={{ fontSize: 11, fontWeight: panel === it.key ? 700 : 500 }}>{it.label}</span>
              </div>
            )
          )}
        </div>

        {/* zone canvas + panneau flottant */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* canvas (slide blanc) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              ref={canvasRef}
              onMouseDown={() => setSelectedId(null)}
              style={{
                width: "62%",
                aspectRatio: "16 / 9",
                maxHeight: "82%",
                background: canvasBg,
                borderRadius: 4,
                boxShadow: "0 1px 6px rgba(0,0,0,.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {elements.map((el) => {
                const isSelected = selectedId === el.id;
                const isEditing = editingId === el.id;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    onDoubleClick={el.type === "text" ? (e) => handleTextDoubleClick(e, el.id) : undefined}
                    style={{
                      position: "absolute",
                      left: el.x,
                      top: el.y,
                      width: el.w,
                      height: el.h,
                      outline: isSelected ? "2px solid #7c3aed" : "none",
                      outlineOffset: 2,
                      cursor: isEditing ? "text" : "move",
                    }}
                  >
                    {el.type === "text" ? (
                      <div
                        ref={(node) => {
                          if (node && isEditing) node.focus();
                        }}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextBlur(e, el.id)}
                        style={{
                          width: "100%",
                          height: "100%",
                          fontSize: el.fontSize,
                          fontWeight: el.bold ? 700 : 400,
                          color: el.color,
                          outline: "none",
                          overflow: "hidden",
                          userSelect: isEditing ? "text" : "none",
                          cursor: isEditing ? "text" : "move",
                        }}
                      >
                        {el.text}
                      </div>
                    ) : el.type === "image" ? (
                      <img
                        src={el.src}
                        alt=""
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                      />
                    ) : (
                      renderShapeContent(el)
                    )}

                    {isSelected && !isEditing && (
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, el.id)}
                        style={{
                          position: "absolute",
                          right: -6,
                          bottom: -6,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#7c3aed",
                          border: "2px solid #fff",
                          cursor: "nwse-resize",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* barre flottante de sélection */}
          {selectedEl && !editingId && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 4px 18px rgba(0,0,0,.18)",
                padding: "8px 12px",
                zIndex: 5,
              }}
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => applyColorToSelected(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    border: selectedEl.color === c ? "2px solid #0d1216" : "1px solid #d9dde3",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}

              {selectedEl.type === "text" && (
                <>
                  <div style={{ width: 1, height: 22, background: "#ececec" }} />
                  <button onClick={() => bumpFontSize(-2)} style={toolbarBtn}>A−</button>
                  <button onClick={() => bumpFontSize(2)} style={toolbarBtn}>A+</button>
                  <button
                    onClick={toggleBold}
                    style={{ ...toolbarBtn, fontWeight: 700, background: selectedEl.bold ? "#f0fbfc" : "#fff" }}
                  >
                    G
                  </button>
                </>
              )}

              <div style={{ width: 1, height: 22, background: "#ececec" }} />
              <button onClick={deleteSelected} style={toolbarBtn}>🗑</button>
            </div>
          )}

          {/* panneau flottant (contenu dépend de "panel") */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              bottom: 12,
              width: 350,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,.14)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {panel === "modeles" && (
              <>
                {/* recherche */}
                <div style={{ padding: "14px 14px 10px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "1px solid #d9dde3",
                      borderRadius: 9,
                      padding: "9px 12px",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: 20, lineHeight: 0 }}>+</span>
                    <span style={{ flex: 1, color: "#9aa3ad", fontSize: 13.5 }}>
                      Décrivez votre design de rêve
                    </span>
                    {Ic.mic("#5b6470")}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        border: "1px solid #d9dde3",
                        background: "#fff",
                        borderRadius: 9,
                        padding: "9px 0",
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: "pointer",
                      }}
                    >
                      {Ic.spark("#0d1216")} Générer
                    </button>
                    <button
                      style={{
                        flex: 1,
                        border: "none",
                        background: "#7c3aed",
                        color: "#fff",
                        borderRadius: 9,
                        padding: "9px 0",
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: "pointer",
                      }}
                    >
                      Rechercher
                    </button>
                  </div>
                </div>

                {/* liste scrollable */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px" }}>
                  <div style={sectionTitle}>Utilisés récemment</div>
                  {/* carte MAPS */}
                  <div
                    style={{
                      height: 96,
                      borderRadius: 8,
                      marginBottom: 16,
                      background: "#e9eef2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#3a4a78",
                        letterSpacing: 1,
                      }}
                    >
                      A GAME ABOUT
                      <br />
                      MAPS
                    </span>
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      style={{ position: "absolute", right: 26, top: 22 }}
                    >
                      <path
                        d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"
                        fill="#e23a3a"
                      />
                      <circle cx="12" cy="9" r="2.6" fill="#fff" />
                    </svg>
                  </div>

                  <div style={sectionTitle}>Tous les résultats</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {results.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          height: 78,
                          borderRadius: 8,
                          background: r.bg,
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: r.bg.startsWith("#ee") || r.bg.startsWith("#f4") ? "1px solid #e5e8ee" : "none",
                        }}
                      >
                        {r.euro && (
                          <div style={{ display: "flex", flexWrap: "wrap", width: 34, justifyContent: "center", marginBottom: 4 }}>
                            {Array.from({ length: 10 }).map((_, k) => (
                              <span key={k} style={{ color: "#f5d000", fontSize: 7 }}>★</span>
                            ))}
                          </div>
                        )}
                        {r.info && (
                          <div style={{ width: "70%" }}>
                            {[0, 1, 2, 3].map((k) => (
                              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a4f8a" }} />
                                <span style={{ flex: 1, height: 4, background: "#cdd5e4", borderRadius: 2 }} />
                              </div>
                            ))}
                          </div>
                        )}
                        {r.leaf && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                            <path d="M12 2c-1 6-5 7-5 12a5 5 0 0010 0c0-5-4-6-5-12z" />
                          </svg>
                        )}
                        {r.t && (
                          <span
                            style={{
                              color: r.dark ? "#1b2a52" : "#fff",
                              fontWeight: 800,
                              fontSize: r.t.length > 12 ? 10 : 13,
                              textAlign: "center",
                              lineHeight: 1.15,
                              padding: "0 6px",
                              textShadow: r.light ? "0 1px 2px rgba(0,0,0,.4)" : "none",
                            }}
                          >
                            {r.t}
                          </span>
                        )}
                        {r.sub && (
                          <span
                            style={{
                              color: r.dark ? "#5b6470" : "rgba(255,255,255,.9)",
                              fontSize: 8,
                              marginTop: 2,
                              textShadow: r.light ? "0 1px 2px rgba(0,0,0,.4)" : "none",
                            }}
                          >
                            {r.sub}
                          </span>
                        )}
                        {r.accent && (
                          <span style={{ width: 30, height: 5, background: r.accent, marginTop: 3 }} />
                        )}
                        {r.play && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 6,
                              left: 6,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,.92)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {Ic.play()}
                          </div>
                        )}
                        {r.crown && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 6,
                              right: 6,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "#7c3aed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {Ic.crown()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {panel === "texte" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={sectionTitle}>Ajouter du texte</div>
                <button style={textPanelBtn} onClick={() => addText(40, true, "Ajoutez un titre")}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>Ajouter un titre</span>
                </button>
                <button style={textPanelBtn} onClick={() => addText(24, false, "Ajoutez un sous-titre")}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Ajouter un sous-titre</span>
                </button>
                <button style={textPanelBtn} onClick={() => addText(16, false, "Ajoutez du texte")}>
                  <span style={{ fontSize: 13 }}>Ajouter du texte</span>
                </button>
              </div>
            )}

            {panel === "elements" && (
              <div style={{ padding: 16 }}>
                <div style={sectionTitle}>Formes</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
                  {shapeDefs.map((s) => (
                    <button key={s.key} onClick={() => addShape(s.key)} style={shapeBtn} title={s.label}>
                      {s.render(currentColor)}
                    </button>
                  ))}
                </div>
                <div style={sectionTitle}>Couleurs</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrentColor(c);
                        applyColorToSelected(c);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        border: currentColor === c ? "2px solid #0d1216" : "1px solid #d9dde3",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {panel === "importer" && (
              <div style={{ padding: 16 }}>
                <div style={sectionTitle}>Importer un média</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ ...btnGhost, width: "100%", justifyContent: "center" }}
                >
                  {Ic.upload("#0d1216")} Choisir une image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            )}

            {panel === "bg" && (
              <div style={{ padding: 16 }}>
                <div style={sectionTitle}>Arrière-plan</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["#ffffff", ...COLORS].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCanvasBgWithSave(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        border: canvasBg === c ? "2px solid #0d1216" : "1px solid #d9dde3",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!["modeles", "texte", "elements", "importer", "bg"].includes(panel) && (
              <div style={{ padding: 24, color: "#9aa3ad", fontSize: 13.5 }}>
                Bientôt disponible.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ BARRE DU BAS ============ */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          background: "#fff",
          borderTop: "1px solid #ececec",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 20,
          fontSize: 13,
          color: "#3d3f44",
        }}
      >
        <span style={footItem}>{Ic.notes("#3d3f44")} Notes</span>
        <span style={footItem}>{Ic.timer("#3d3f44")} Minuteur</span>

        {/* centre : page + ajouter */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div
            style={{
              width: 56,
              height: 34,
              background: "#fff",
              border: "2px solid #7c3aed",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "#3d3f44",
            }}
          >
            1
          </div>
          <div
            style={{
              height: 34,
              padding: "0 10px",
              background: "#f1f2f4",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 0 }}>+</span>
            {Ic.chevron("#3d3f44")}
          </div>
        </div>

        {/* droite : zoom + pages */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 110, height: 4, background: "#dfe2e7", borderRadius: 2, position: "relative" }}>
              <div style={{ width: "55%", height: 4, background: "#9aa3ad", borderRadius: 2 }} />
              <div
                style={{
                  position: "absolute",
                  left: "52%",
                  top: -4,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "1px solid #b5bcc6",
                }}
              />
            </div>
            <span>{zoom} %</span>
          </div>
          <span style={footItem}>{Ic.grid2("#3d3f44")} Pages</span>
          <span>1/1</span>
          {Ic.grid2("#3d3f44")}
          {Ic.expand("#3d3f44")}
          {Ic.help("#3d3f44")}
        </div>
      </div>
    </div>
  );
}

const btnGhost = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  border: "1px solid #e3e6ea",
  borderRadius: 8,
  padding: "7px 14px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  color: "#0d1216",
};

const sectionTitle = {
  fontWeight: 700,
  fontSize: 14,
  margin: "4px 0 10px",
  color: "#0d1216",
};

const footItem = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};

const toolbarBtn: React.CSSProperties = {
  border: "1px solid #d9dde3",
  background: "#fff",
  borderRadius: 6,
  padding: "4px 9px",
  fontSize: 13,
  cursor: "pointer",
  color: "#0d1216",
};

const shapeBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 64,
  border: "1px solid #d9dde3",
  borderRadius: 9,
  background: "#fff",
  cursor: "pointer",
};

const textPanelBtn: React.CSSProperties = {
  textAlign: "left",
  border: "1px solid #d9dde3",
  borderRadius: 9,
  padding: "14px 12px",
  background: "#fff",
  cursor: "pointer",
};

import { useState, useEffect, useCallback, useRef } from "react";

const AFFILIATE_LINK = "https://mercadolivre.com/sec/2h4CuTZ";

const CATEGORIES = [
  { id: "MLB1051", name: "Celulares", emoji: "📱" },
  { id: "MLB1648", name: "Computadores", emoji: "💻" },
  { id: "MLB1000", name: "Eletrônicos", emoji: "🔌" },
  { id: "MLB1574", name: "Geladeiras", emoji: "🧊" },
  { id: "MLB1246", name: "TVs", emoji: "📺" },
  { id: "MLB5726", name: "Moda", emoji: "👗" },
];

const MOCK_PRODUCTS = [
  { id: "PROSB3000", title: "Smart Box Proeletronic Smartpro PROSB-3000 16GB 4K HD", price: 167.28, original_price: 204.00, discount: 18, category: "Eletrônicos", emoji: "📺", sold_quantity: 4821, affiliate_link: "https://meli.la/1HYpmJV", freeShipping: true, badge: "MAIS VENDIDO" },
  { id: "MLB1", title: "Smartphone Samsung Galaxy A55 5G 256GB", price: 1299.99, original_price: 1899.99, discount: 32, category: "Celulares", emoji: "📱", sold_quantity: 2341, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
  { id: "MLB2", title: "Notebook Lenovo IdeaPad 15 Intel Core i5 8GB 512GB SSD", price: 2499.0, original_price: 3299.0, discount: 24, category: "Computadores", emoji: "💻", sold_quantity: 876, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
  { id: "MLB3", title: 'Smart TV LG 55" 4K UHD NanoCell', price: 2199.0, original_price: 3499.0, discount: 37, category: "TVs", emoji: "📺", sold_quantity: 543, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
  { id: "MLB4", title: "Fone Bluetooth JBL Tune 520BT", price: 189.9, original_price: 299.9, discount: 37, category: "Eletrônicos", emoji: "🔌", sold_quantity: 5120, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
  { id: "MLB5", title: "Geladeira Brastemp Frost Free 375L Inox", price: 2899.0, original_price: 3799.0, discount: 24, category: "Geladeiras", emoji: "🧊", sold_quantity: 312, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
  { id: "MLB6", title: "Tênis Nike Revolution 7 Masculino", price: 179.99, original_price: 299.99, discount: 40, category: "Moda", emoji: "👗", sold_quantity: 9870, affiliate_link: "https://mercadolivre.com/sec/2h4CuTZ" },
];

const MOCK_GROUPS = [
  { id: "g1", name: "🔥 Promoções Imperdíveis BR", members: 487, active: true },
  { id: "g2", name: "💻 Tech & Eletrônicos Ofertas", members: 234, active: true },
  { id: "g3", name: "👟 Moda e Estilo em Promoção", members: 156, active: false },
  { id: "g4", name: "🏠 Casa & Eletro Promos", members: 312, active: true },
];

// Cupons reais do Mercado Livre
function makeCoupons() {
  const now = Date.now();
  return [
    { id: "c-supercupom", code: "SUPERCUPOM", description: "15% OFF em produtos selecionados — economize até R$ 30,60", discount: 15, maxDiscount: 30.60, category: "Todas", emoji: "⚡", expiresAt: now + 4 * 3600 * 1000, uses: 380, maxUses: 500, freeShipping: false, highlight: true },
    { id: "c-megacupom", code: "MEGACUPOM", description: "8% OFF em produtos selecionados", discount: 8, category: "Todas", emoji: "🎯", expiresAt: now + 23 * 3600 * 1000, uses: 210, maxUses: 600, freeShipping: false, highlight: false },
  ];
}

function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function generateMessage(product) {
  const link = product.affiliate_link || AFFILIATE_LINK;
  const shipping = product.freeShipping ? "
🚚 *Frete GRÁTIS!*" : "";
  const badge = product.badge ? "
🏆 " + product.badge : "";
  return `🔥 *OFERTA IMPERDÍVEL!*${badge}

${product.emoji} *${product.title}*

💰 De: ${formatPrice(product.original_price)}
✅ Por apenas: *${formatPrice(product.price)}*
📉 Você economiza: *${product.discount}% OFF no Pix*${shipping}

🛒 Compre agora:
${link}

⚡ Oferta por tempo limitado!
_Enviado pelo bot de promoções_ 🤖`;
}

function generateCouponMessage(coupon) {
  const urgency = getRemainingInfo(coupon.expiresAt);
  return `🎟️ *CUPOM EXCLUSIVO!*\n\n${coupon.emoji} *${coupon.description}*\n\n🏷️ Use o código: *${coupon.code}*\n${coupon.freeShipping ? "🚚 Frete grátis garantido!" : `💸 ${coupon.discount}% de desconto`}\n\n⏳ Expira em: *${urgency.label}*\n\n🛒 Acesse:\n${AFFILIATE_LINK}\n\n_Cole o código ao finalizar a compra_ ✅\n_Enviado pelo bot de promoções_ 🤖`;
}

function getRemainingInfo(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return { label: "Expirado", color: "#555", urgent: false, expired: true, pct: 0 };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const urgent = diff < 2 * 3600 * 1000;
  const label = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  const color = diff < 1 * 3600000 ? "#f87171" : diff < 3 * 3600000 ? "#fb923c" : "#4ade80";
  return { label, color, urgent, expired: false, pct: Math.min(100, (diff / (24 * 3600000)) * 100) };
}

// Countdown hook
function useCountdown() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return tick;
}

function CouponCard({ coupon, onSend, onCopy, selected, onSelect }) {
  useCountdown();
  const info = getRemainingInfo(coupon.expiresAt);
  const usePct = Math.round((coupon.uses / coupon.maxUses) * 100);

  if (info.expired) return null;

  return (
    <div
      onClick={() => onSelect(coupon)}
      style={{
        background: selected ? "rgba(255,228,0,0.07)" : "rgba(255,255,255,0.03)",
        border: selected ? "1.5px solid #FFE400" : info.urgent ? "1.5px solid rgba(248,113,113,0.3)" : "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: 18, cursor: "pointer",
        transition: "all 0.2s", position: "relative", overflow: "hidden",
      }}
    >
      {info.urgent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #f87171, #fb923c)",
          animation: "pulse 1s infinite",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 28 }}>{coupon.emoji}</div>
        <div style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: `${info.color}22`, color: info.color,
          fontFamily: "'JetBrains Mono'",
        }}>⏱ {info.label}</div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{coupon.description}</div>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>📂 {coupon.category}</div>

      {/* Código */}
      <div style={{
        background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "8px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
      }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: "#FFE400", letterSpacing: 2 }}>
          {coupon.code}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onCopy(coupon.code); }}
          style={{
            background: "rgba(255,228,0,0.1)", border: "1px solid rgba(255,228,0,0.2)",
            color: "#FFE400", borderRadius: 8, padding: "3px 10px",
            fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >copiar</button>
      </div>

      {/* Barra de uso */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", marginBottom: 4 }}>
          <span>{coupon.uses.toLocaleString()} usados</span>
          <span>{coupon.maxUses.toLocaleString()} disponíveis</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            width: `${usePct}%`,
            background: usePct > 85 ? "#f87171" : usePct > 60 ? "#fb923c" : "#4ade80",
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onSend(coupon); }}
        style={{
          width: "100%", padding: "8px 0", borderRadius: 10,
          border: "none", background: "#FFE400", color: "#0a0a0a",
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}
      >📤 Enviar para grupos</button>
    </div>
  );
}

function AddCouponModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    code: "", description: "", discount: "", category: "Todas", emoji: "🎟️",
    hours: "24", freeShipping: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.code || !form.description) return;
    onAdd({
      id: `c${Date.now()}`,
      code: form.code.toUpperCase(),
      description: form.description,
      discount: Number(form.discount) || 0,
      freeShipping: form.freeShipping,
      category: form.category,
      emoji: form.emoji,
      expiresAt: Date.now() + Number(form.hours) * 3600 * 1000,
      uses: 0,
      maxUses: 999,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#fff", fontFamily: "'JetBrains Mono'", fontSize: 13,
    padding: "10px 14px", outline: "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{
        background: "#141414", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: 28, width: 420, maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Novo Cupom</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={form.emoji} onChange={e => set("emoji", e.target.value)}
              style={{ ...inputStyle, width: 56, textAlign: "center", fontSize: 22, padding: "8px" }} />
            <input value={form.code} onChange={e => set("code", e.target.value)}
              placeholder="CÓDIGO DO CUPOM" style={{ ...inputStyle, flex: 1, letterSpacing: 2, fontWeight: 700 }} />
          </div>
          <input value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Descrição (ex: 30% OFF em Eletrônicos)" style={inputStyle} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Desconto %</div>
              <input type="number" value={form.discount} onChange={e => set("discount", e.target.value)}
                placeholder="0" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Expira em (horas)</div>
              <input type="number" value={form.hours} onChange={e => set("hours", e.target.value)}
                style={inputStyle} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Categoria</div>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}>
              {["Todas", ...CATEGORIES.map(c => c.name)].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div
            onClick={() => set("freeShipping", !form.freeShipping)}
            style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              padding: "10px 14px", borderRadius: 10,
              background: form.freeShipping ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${form.freeShipping ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: form.freeShipping ? "#4ade80" : "transparent",
              border: `2px solid ${form.freeShipping ? "#4ade80" : "#555"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {form.freeShipping && <span style={{ fontSize: 11, color: "#0a0a0a", fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: form.freeShipping ? "#4ade80" : "#888" }}>🚚 Inclui frete grátis</span>
          </div>
        </div>

        <button onClick={handleAdd} style={{
          width: "100%", marginTop: 20, padding: "14px 0",
          borderRadius: 12, border: "none", background: "#FFE400", color: "#0a0a0a",
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer",
        }}>
          ✅ Adicionar Cupom
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, onSelect, selected }) {
  return (
    <div onClick={() => onSelect(product)} style={{
      background: selected ? "rgba(255,228,0,0.08)" : "rgba(255,255,255,0.03)",
      border: selected ? "1.5px solid #FFE400" : "1.5px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 16, cursor: "pointer", transition: "all 0.2s", position: "relative",
    }}>
      <div style={{ position: "absolute", top: 10, right: 10, background: "#FFE400", color: "#0a0a0a", borderRadius: 8, padding: "2px 8px", fontWeight: 800, fontSize: 12 }}>
        -{product.discount}%
      </div>
      {product.badge && (
        <div style={{ position: "absolute", top: 10, left: 10, background: "#e11d48", color: "#fff", borderRadius: 6, padding: "2px 7px", fontWeight: 800, fontSize: 9, letterSpacing: 0.5 }}>
          {product.badge}
        </div>
      )}
      <div style={{ fontSize: 32, marginBottom: 8, marginTop: product.badge ? 20 : 0 }}>{product.emoji}</div>
      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.4, marginBottom: 10 }}>{product.title}</div>
      {product.freeShipping && <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 4 }}>🚚 Frete grátis</div>}
      <div style={{ color: "#999", textDecoration: "line-through", fontSize: 12 }}>{formatPrice(product.original_price)}</div>
      <div style={{ color: "#FFE400", fontWeight: 800, fontSize: 20 }}>{formatPrice(product.price)}</div>
      <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{product.sold_quantity.toLocaleString()} vendidos</div>
      {selected && <div style={{ position: "absolute", bottom: 10, right: 10, background: "#FFE400", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0a", fontWeight: 900, fontSize: 13 }}>✓</div>}
    </div>
  );
}

function GroupRow({ group, onToggle, selected }) {
  return (
    <div onClick={() => onToggle(group.id)} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: selected ? "rgba(255,228,0,0.06)" : "transparent",
      border: selected ? "1px solid rgba(255,228,0,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12, cursor: "pointer", transition: "all 0.2s", marginBottom: 8,
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, border: selected ? "2px solid #FFE400" : "2px solid #444", background: selected ? "#FFE400" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
        {selected && <span style={{ fontSize: 12, color: "#0a0a0a", fontWeight: 900 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#fff", fontSize: 13 }}>{group.name}</div>
        <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{group.members} membros</div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.active ? "#4ade80" : "#666" }} />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("cupons");
  const [products] = useState(MOCK_PRODUCTS);
  const [coupons, setCoupons] = useState(makeCoupons);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [filterCategory, setFilterCategory] = useState("todas");
  const [minDiscount, setMinDiscount] = useState(20);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [autoMode, setAutoMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [copied, setCopied] = useState(null);
  const [sendMode, setSendMode] = useState("produto"); // "produto" | "cupom"

  useCountdown(); // re-render every second for countdowns

  useEffect(() => {
    if (selectedProduct) setMessage(generateMessage(selectedProduct));
  }, [selectedProduct]);

  const filteredProducts = products.filter(p =>
    (filterCategory === "todas" || p.category === filterCategory) && p.discount >= minDiscount
  );

  const activeCoupons = coupons
    .filter(c => c.expiresAt > Date.now())
    .sort((a, b) => a.expiresAt - b.expiresAt);

  const toggleGroup = id => setSelectedGroups(prev =>
    prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
  );

  const addLog = (text, type = "info") => setLogs(prev => [
    { text, type, time: new Date().toLocaleTimeString("pt-BR") },
    ...prev.slice(0, 19),
  ]);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setMessage(generateCouponMessage(coupon));
    setSendMode("cupom");
    setTab("enviar");
  };

  const handleSend = async () => {
    if (selectedGroups.length === 0) return;
    if (sendMode === "produto" && !selectedProduct) return;
    if (sendMode === "cupom" && !selectedCoupon) return;

    setSending(true);
    setSent(false);
    const what = sendMode === "cupom" ? `cupom ${selectedCoupon.code}` : `oferta "${selectedProduct.title.slice(0, 30)}..."`;
    addLog(`Iniciando envio de ${what}...`, "info");

    for (const gid of selectedGroups) {
      const group = MOCK_GROUPS.find(g => g.id === gid);
      await new Promise(r => setTimeout(r, 900));
      addLog(`✅ Enviado para "${group.name}"`, "success");
    }

    setSending(false);
    setSent(true);
    addLog(`🎉 ${selectedGroups.length} grupo(s) notificados!`, "success");
    setTimeout(() => setSent(false), 4000);
  };

  const generateAIMessage = useCallback(async () => {
    if (sendMode === "produto" && !selectedProduct) return;
    if (sendMode === "cupom" && !selectedCoupon) return;
    setAiLoading(true);
    try {
      const prompt = sendMode === "cupom"
        ? `Crie uma mensagem de WhatsApp para divulgar este cupom de afiliado do Mercado Livre:\n\nCódigo: ${selectedCoupon.code}\nDescrição: ${selectedCoupon.description}\nDesconto: ${selectedCoupon.discount}%${selectedCoupon.freeShipping ? "\nFrete grátis: sim" : ""}\nExpira em: ${getRemainingInfo(selectedCoupon.expiresAt).label}\nLink: ${AFFILIATE_LINK}\n\nA mensagem deve usar emojis, criar urgência, destacar o código do cupom em destaque, e ter no máximo 150 palavras. Retorne APENAS a mensagem.`
        : `Crie uma mensagem de WhatsApp para afiliado do Mercado Livre vendendo:\n\nProduto: ${selectedProduct.title}\nPreço: ${formatPrice(selectedProduct.price)}\nOriginal: ${formatPrice(selectedProduct.original_price)}\nDesconto: ${selectedProduct.discount}%\nLink: ${AFFILIATE_LINK}\n\nA mensagem deve ser animada, ter senso de urgência, usar *negrito* WhatsApp, máximo 200 palavras. Retorne APENAS a mensagem.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("\n") || "";
      if (text) setMessage(text);
    } catch (e) {
      addLog("Erro ao gerar mensagem com IA", "error");
    }
    setAiLoading(false);
  }, [selectedProduct, selectedCoupon, sendMode]);

  const statCards = [
    { label: "Cupons Ativos", value: activeCoupons.length, icon: "🎟️" },
    { label: "Grupos Ativos", value: MOCK_GROUPS.filter(g => g.active).length, icon: "💬" },
    { label: "Envios Hoje", value: logs.filter(l => l.type === "success").length, icon: "📤" },
    { label: "Expirando em breve", value: activeCoupons.filter(c => c.expiresAt - Date.now() < 2 * 3600000).length, icon: "⚠️" },
  ];

  const tabStyle = t => ({
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s",
    background: tab === t ? "#FFE400" : "transparent",
    color: tab === t ? "#0a0a0a" : "#666",
  });

  const canSend = selectedGroups.length > 0 && (
    (sendMode === "produto" && selectedProduct) ||
    (sendMode === "cupom" && selectedCoupon)
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        textarea { resize: vertical; }
        select option { background: #1a1a1a; color: #fff; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {showAddCoupon && (
        <AddCouponModal
          onAdd={c => setCoupons(prev => [...prev, c])}
          onClose={() => setShowAddCoupon(false)}
        />
      )}

      {copied && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          background: "#4ade80", color: "#0a0a0a", borderRadius: 12,
          padding: "10px 18px", fontFamily: "'Syne', sans-serif", fontWeight: 700,
          animation: "slideIn 0.2s ease",
        }}>
          ✓ Código "{copied}" copiado!
        </div>
      )}

      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Syne', sans-serif", padding: 24 }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFE400", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛒</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>ML Afiliado Pro</h1>
              <div style={{ fontSize: 11, color: "#666" }}>Sistema de automação de promoções</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "'JetBrains Mono'" }}>conectado</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: s.label === "Expirando em breve" && s.value > 0 ? "#f87171" : "#FFE400" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 6, width: "fit-content" }}>
          {[["cupons", "🎟️ Cupons"], ["produtos", "🛍️ Produtos"], ["enviar", "📤 Enviar"], ["grupos", "💬 Grupos"], ["logs", "📋 Logs"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={tabStyle(key)}>{label}</button>
          ))}
        </div>

        {/* TAB: Cupons */}
        {tab === "cupons" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>CUPONS ATIVOS — ordenados por validade</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Expirados são removidos automaticamente ⚡</div>
              </div>
              <button onClick={() => setShowAddCoupon(true)} style={{
                padding: "10px 18px", borderRadius: 12, border: "none",
                background: "#FFE400", color: "#0a0a0a",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer",
              }}>+ Novo Cupom</button>
            </div>

            {activeCoupons.length === 0 ? (
              <div style={{ textAlign: "center", color: "#555", padding: 60, border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
                <div style={{ fontSize: 15, marginBottom: 8 }}>Nenhum cupom ativo</div>
                <div style={{ fontSize: 12 }}>Clique em "+ Novo Cupom" para adicionar</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {activeCoupons.map(c => (
                  <CouponCard
                    key={c.id} coupon={c}
                    selected={selectedCoupon?.id === c.id}
                    onSelect={setSelectedCoupon}
                    onSend={handleSendCoupon}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Produtos */}
        {tab === "produtos" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["todas", ...CATEGORIES.map(c => c.name)].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: filterCategory === cat ? "#FFE400" : "rgba(255,255,255,0.06)",
                    color: filterCategory === cat ? "#0a0a0a" : "#aaa",
                    fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, transition: "all 0.2s",
                  }}>{cat === "todas" ? "Todas" : cat}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#666" }}>Desconto mín:</span>
                <input type="range" min={10} max={60} value={minDiscount}
                  onChange={e => setMinDiscount(Number(e.target.value))}
                  style={{ accentColor: "#FFE400", width: 100 }} />
                <span style={{ fontSize: 12, color: "#FFE400", fontFamily: "'JetBrains Mono'", width: 36 }}>{minDiscount}%</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p}
                  selected={selectedProduct?.id === p.id}
                  onSelect={prod => {
                    setSelectedProduct(prod);
                    setSendMode("produto");
                    setMessage(generateMessage(prod));
                    setTab("enviar");
                  }} />
              ))}
            </div>
          </div>
        )}

        {/* TAB: Enviar */}
        {tab === "enviar" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "fadeIn 0.3s ease" }}>
            <div>
              {/* Toggle produto/cupom */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[["produto", "🛍️ Produto"], ["cupom", "🎟️ Cupom"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => setSendMode(mode)} style={{
                    padding: "7px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: sendMode === mode ? "rgba(255,228,0,0.15)" : "rgba(255,255,255,0.04)",
                    color: sendMode === mode ? "#FFE400" : "#666",
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                    outline: sendMode === mode ? "1px solid rgba(255,228,0,0.3)" : "none",
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ fontSize: 13, color: "#666", marginBottom: 12, fontWeight: 600 }}>
                {sendMode === "produto" ? "PRODUTO SELECIONADO" : "CUPOM SELECIONADO"}
              </div>

              {sendMode === "produto" && !selectedProduct && (
                <div style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16, padding: 40, textAlign: "center", color: "#555" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛍️</div>
                  <div>Selecione um produto na aba Produtos</div>
                </div>
              )}

              {sendMode === "produto" && selectedProduct && (
                <div style={{ background: "rgba(255,228,0,0.05)", border: "1.5px solid rgba(255,228,0,0.2)", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{selectedProduct.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, lineHeight: 1.4 }}>{selectedProduct.title}</div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#666" }}>Preço atual</div>
                      <div style={{ color: "#FFE400", fontWeight: 800, fontSize: 22 }}>{formatPrice(selectedProduct.price)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#666" }}>Desconto</div>
                      <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 22 }}>-{selectedProduct.discount}%</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "8px 12px", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#888", wordBreak: "break-all" }}>
                    🔗 {AFFILIATE_LINK}
                  </div>
                </div>
              )}

              {sendMode === "cupom" && !selectedCoupon && (
                <div style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16, padding: 40, textAlign: "center", color: "#555" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎟️</div>
                  <div>Selecione um cupom na aba Cupons</div>
                </div>
              )}

              {sendMode === "cupom" && selectedCoupon && (() => {
                const info = getRemainingInfo(selectedCoupon.expiresAt);
                return (
                  <div style={{ background: "rgba(255,228,0,0.05)", border: "1.5px solid rgba(255,228,0,0.2)", borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{selectedCoupon.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedCoupon.description}</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>📂 {selectedCoupon.category}</div>
                    <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700, color: "#FFE400", letterSpacing: 2 }}>{selectedCoupon.code}</span>
                      <span style={{ fontSize: 11, color: info.color, fontFamily: "'JetBrains Mono'" }}>⏱ {info.label}</span>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "8px 12px", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#888", wordBreak: "break-all" }}>
                      🔗 {AFFILIATE_LINK}
                    </div>
                  </div>
                );
              })()}

              {/* Mensagem */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>MENSAGEM</div>
                  <button onClick={generateAIMessage} disabled={!canSend || aiLoading} style={{
                    padding: "5px 12px", borderRadius: 8, border: "none",
                    cursor: canSend ? "pointer" : "not-allowed",
                    background: canSend ? "rgba(255,228,0,0.1)" : "rgba(255,255,255,0.03)",
                    color: canSend ? "#FFE400" : "#555",
                    fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {aiLoading ? <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #FFE400", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : "✨"} IA Gerar
                  </button>
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={10}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff", fontFamily: "'JetBrains Mono'", fontSize: 12, padding: 16, lineHeight: 1.6, outline: "none" }}
                  placeholder="Selecione um produto ou cupom para gerar a mensagem..." />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 12, fontWeight: 600 }}>SELECIONAR GRUPOS</div>
              {MOCK_GROUPS.map(g => (
                <GroupRow key={g.id} group={g} selected={selectedGroups.includes(g.id)} onToggle={toggleGroup} />
              ))}

              <div style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, color: "#666", fontWeight: 600, marginBottom: 12 }}>⏰ AGENDAMENTO AUTOMÁTICO</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div onClick={() => setAutoMode(!autoMode)} style={{ width: 40, height: 22, borderRadius: 11, background: autoMode ? "#FFE400" : "#333", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ position: "absolute", top: 3, left: autoMode ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: autoMode ? "#0a0a0a" : "#666", transition: "all 0.2s" }} />
                  </div>
                  <span style={{ fontSize: 13, color: autoMode ? "#FFE400" : "#555" }}>{autoMode ? "Ativo — enviando diariamente" : "Desativado"}</span>
                </div>
                {autoMode && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Horário:</span>
                    <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFE400", padding: "4px 10px", fontFamily: "'JetBrains Mono'", fontSize: 13 }} />
                    <span style={{ fontSize: 12, color: "#666" }}>todo dia</span>
                  </div>
                )}
              </div>

              <button onClick={handleSend} disabled={!canSend || sending} style={{
                width: "100%", marginTop: 20, padding: "16px 24px", borderRadius: 14, border: "none",
                background: !canSend ? "#1a1a1a" : sent ? "#4ade80" : "#FFE400",
                color: !canSend ? "#555" : "#0a0a0a",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16,
                cursor: !canSend ? "not-allowed" : "pointer", transition: "all 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                {sending ? (
                  <><span style={{ display: "inline-block", width: 16, height: 16, border: "3px solid #0a0a0a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Enviando...</>
                ) : sent ? "✓ Enviado com sucesso!" : `📤 Enviar para ${selectedGroups.length} grupo(s)`}
              </button>
              {!canSend && (
                <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 8 }}>
                  {selectedGroups.length === 0 ? "Selecione pelo menos um grupo" : `Selecione um ${sendMode} primeiro`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Grupos */}
        {tab === "grupos" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16, fontWeight: 600 }}>SEUS GRUPOS DO WHATSAPP — {MOCK_GROUPS.length} grupos</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {MOCK_GROUPS.map(g => (
                <div key={g.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{g.name}</div>
                    <div style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: g.active ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", color: g.active ? "#4ade80" : "#666" }}>{g.active ? "ativo" : "inativo"}</div>
                  </div>
                  <div style={{ color: "#666", fontSize: 12 }}>👥 {g.members} membros</div>
                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,228,0,0.2)", background: "rgba(255,228,0,0.05)", color: "#FFE400", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Selecionar</button>
                    <button style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#666", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⚙️</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center", color: "#555", cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
              <div style={{ fontSize: 13 }}>Conectar novo grupo do WhatsApp</div>
              <div style={{ fontSize: 11, marginTop: 4, color: "#444" }}>via Evolution API ou Z-API</div>
            </div>
          </div>
        )}

        {/* TAB: Logs */}
        {tab === "logs" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16, fontWeight: 600 }}>HISTÓRICO DE ATIVIDADES</div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", color: "#555", padding: 60, border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div>Nenhuma atividade ainda.<br />Faça um envio para ver o log aqui.</div>
              </div>
            ) : (
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 16, fontFamily: "'JetBrains Mono'" }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", animation: "fadeIn 0.2s ease" }}>
                    <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>{log.time}</span>
                    <span style={{ fontSize: 12, color: log.type === "success" ? "#4ade80" : log.type === "error" ? "#f87171" : "#aaa" }}>{log.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

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
        ? `Crie uma mensagem de WhatsApp para divulgar este cupom de afiliado do Mercado Livre:\n\nCódigo: ${selectedCoupon.code}\nDescrição: ${selectedCoupon.description}\nDesconto: ${selectedCoupon.discount}%${selectedCoupon.freeShipping ? "\nFrete grátis: sim" : ""}\nExpira em: ${getRemainingInfo(selectedCoupon.expiresAt).label}\nLi

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Heart, Plus, Shirt, Sparkles, LayoutGrid, Trash2, Wand2, Check } from "lucide-react";
import logo from "@/assets/logo.png";
import doodles from "@/assets/doodles.png";
import moodIcons from "@/assets/mood-icons.png";
import topImg from "@/assets/item-top.jpg";
import bottomImg from "@/assets/item-bottom.jpg";
import shoeImg from "@/assets/item-shoe.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Match Closet — seu look perfeito em segundos" },
      { name: "description", content: "Misture peças do seu armário, salve looks favoritos e monte seu estilo." },
      { property: "og:title", content: "Match Closet — seu look perfeito em segundos" },
      { property: "og:description", content: "Misture peças do seu armário, salve looks favoritos e monte seu estilo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Cat = "Cima" | "Baixo" | "Calçado";
type Item = { id: string; nome: string; categoria: Cat; vibe: string; basico: boolean; urlImagem: string };
type Fav = { id: string; cima?: Item | undefined; baixo?: Item | undefined; calcado?: Item | undefined };

const CATS: Cat[] = ["Cima", "Baixo", "Calçado"];
const SEED: Item[] = [
  { id: "s1", nome: "Regata Canelada Rosa", categoria: "Cima", vibe: "Rápido", basico: true, urlImagem: topImg },
  { id: "s2", nome: "Jeans Pantalona", categoria: "Baixo", vibe: "Rápido", basico: true, urlImagem: bottomImg },
  { id: "s3", nome: "Tênis Branco & Menta", categoria: "Calçado", vibe: "Conforto", basico: true, urlImagem: shoeImg },
];
const catStyle: Record<Cat, { label: string; card: string; tag: string }> = {
  Cima: { label: "Parte de cima", card: "bg-blush", tag: "text-blush-foreground" },
  Baixo: { label: "Parte de baixo", card: "bg-sky", tag: "text-sky-foreground" },
  Calçado: { label: "Calçado", card: "bg-mint", tag: "text-mint-foreground" },
};

// Crops one drawing out of the 4x3 doodle sheet.
function Doodle({ col, row, className = "" }: { col: number; row: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${doodles})`, backgroundSize: "400% 300%", backgroundPosition: `${(col / 3) * 100}% ${(row / 2) * 100}%` }}
    />
  );
}

function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setV(JSON.parse(raw));
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v, ready]);
  return [v, setV] as const;
}

type Tab = "look" | "armario" | "favs" | "novo";

// Crops one icon out of the 4x2 mood sheet.
function Mood({ col, row, className = "" }: { col: number; row: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${moodIcons})`, backgroundSize: "400% 200%", backgroundPosition: `${(col / 3) * 100}% ${row * 100}%` }}
    />
  );
}

type Q = { key: "clima" | "periodo" | "humor"; title: string; opts: { v: string; label: string; icon: [number, number] }[] };
const QUESTIONS: Q[] = [
  { key: "clima", title: "Como está o tempo?", opts: [{ v: "frio", label: "Frio", icon: [0, 0] }, { v: "calor", label: "Calor", icon: [1, 0] }] },
  { key: "periodo", title: "Que horas são?", opts: [{ v: "dia", label: "Dia", icon: [2, 0] }, { v: "tarde", label: "Tarde", icon: [3, 0] }, { v: "noite", label: "Noite", icon: [0, 1] }] },
  { key: "humor", title: "Como você está?", opts: [{ v: "bem", label: "Bem", icon: [1, 1] }, { v: "mal", label: "Mal", icon: [2, 1] }] },
];

function Welcome({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const q = QUESTIONS[step];
  return (
    <Shell>
      <div className="flex flex-1 flex-col px-5 pb-8 pt-6">
        <img src={logo} alt="Match Closet" width={1536} height={768} className="mx-auto h-20 w-auto" />
        <div className="mt-6 flex gap-2">
          {QUESTIONS.map((x, i) => (
            <button key={x.key} onClick={() => setStep(i)} className={`flex-1 rounded-full py-2 text-[11px] font-bold transition ${i === step ? "bg-foreground text-background" : ans[x.key] ? "bg-mint text-mint-foreground" : "bg-card text-muted-foreground shadow-soft"}`}>
              {i + 1}. {["Tempo", "Período", "Humor"][i]}
            </button>
          ))}
        </div>
        <h1 className="mt-8 text-center font-display text-3xl font-extrabold">{q.title}</h1>
        <div className={`mt-6 grid gap-3 ${q.opts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {q.opts.map((o) => {
            const sel = ans[q.key] === o.v;
            return (
              <button
                key={o.v}
                onClick={() => {
                  setAns({ ...ans, [q.key]: o.v });
                  if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 250);
                }}
                className={`flex flex-col items-center gap-2 rounded-3xl bg-card p-4 shadow-soft transition active:scale-95 ${sel ? "ring-2 ring-primary" : ""}`}
              >
                <Mood col={o.icon[0]} row={o.icon[1]} className="h-20 w-20" />
                <span className="font-display text-sm font-bold">{o.label}</span>
              </button>
            );
          })}
        </div>
        <button
          disabled={QUESTIONS.some((x) => !ans[x.key])}
          onClick={onDone}
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-50"
        >
          <Sparkles size={18} /> Montar meu look
        </button>
      </div>
    </Shell>
  );
}

function App() {
  const [items, setItems] = useStored<Item[]>("mc-items", SEED);
  const [favs, setFavs] = useStored<Fav[]>("mc-favs", []);
  const [tab, setTab] = useState<Tab>("look");
  const [idx, setIdx] = useState<Record<Cat, number>>({ Cima: 0, Baixo: 0, Calçado: 0 });
  const [soft, setSoft] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState("");
  const [started, setStarted] = useState(false);

  if (!started) return <Welcome onDone={() => setStarted(true)} />;

  const stock = useMemo(() => {
    const s: Record<Cat, Item[]> = { Cima: [], Baixo: [], Calçado: [] };
    items.forEach((i) => (!soft || i.basico) && s[i.categoria].push(i));
    return s;
  }, [items, soft]);
  const current = (c: Cat) => {
    const l = stock[c];
    return l.length ? l[((idx[c] % l.length) + l.length) % l.length] : undefined;
  };
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  if (done) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <Doodle col={3} row={0} className="h-40 w-40 animate-floaty" />
          <h2 className="mt-4 font-display text-3xl font-extrabold">Look selecionado!</h2>
          <p className="mt-2 text-muted-foreground">Você está pronta e radiante. Guarde o celular e aproveite o dia!</p>
          <div className="mt-6 flex gap-2">
            {CATS.map((c) => current(c) && <img key={c} src={current(c)!.urlImagem} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-soft" />)}
          </div>
          <button onClick={() => setDone(false)} className="mt-8 w-full rounded-2xl bg-brand py-4 font-display font-bold text-primary-foreground shadow-glow">
            Montar outro look
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="glass sticky top-0 z-20 flex items-center justify-between px-5 py-3">
        <img src={logo} alt="Match Closet" width={1536} height={768} className="h-12 w-auto" />
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">{items.length} peças</span>
      </header>

      <main className="relative flex-1 px-5 pb-32 pt-5">
        {tab === "look" && (
          <section>
            <div className="relative mb-5 overflow-hidden rounded-3xl bg-foreground p-5 text-background">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Hoje</p>
              <h1 className="mt-1 max-w-[70%] font-display text-2xl font-extrabold leading-tight">Seu look perfeito em segundos</h1>
              <Doodle col={1} row={0} className="absolute -right-4 top-2 h-28 w-36 rotate-12" />
            </div>

            <div className="flex flex-col gap-3">
              {CATS.map((c) => {
                const it = current(c);
                const st = catStyle[c];
                return (
                  <div key={c} className={`flex items-center gap-3 rounded-3xl p-3 shadow-soft ${st.card}`}>
                    <RoundBtn onClick={() => setIdx({ ...idx, [c]: idx[c] - 1 })}><ChevronLeft size={18} /></RoundBtn>
                    <div className="flex flex-1 items-center gap-3">
                      {it ? (
                        <img src={it.urlImagem} alt={it.nome} className="h-20 w-20 rounded-2xl bg-card object-cover" />
                      ) : (
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-card text-muted-foreground"><Shirt /></div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${st.tag}`}>{st.label}</p>
                        <p className="truncate font-display text-sm font-semibold">{it?.nome ?? "Sem peças"}</p>
                      </div>
                    </div>
                    <RoundBtn onClick={() => setIdx({ ...idx, [c]: idx[c] + 1 })}><ChevronRight size={18} /></RoundBtn>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => setDone(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-display font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]">
                <Sparkles size={18} /> Tô pronta!
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSoft(!soft)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition ${soft ? "border-primary bg-blush text-blush-foreground" : "border-border bg-card"}`}
                >
                  <Wand2 size={16} /> {soft ? "Só básicos" : "Suavizar"}
                </button>
                <button
                  onClick={() => {
                    setFavs([{ id: crypto.randomUUID(), cima: current("Cima"), baixo: current("Baixo"), calcado: current("Calçado") }, ...favs]);
                    flash("Look salvo nos favoritos 💗");
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold"
                >
                  <Heart size={16} /> Favoritar
                </button>
              </div>
            </div>
          </section>
        )}

        {tab === "armario" && <Closet items={items} onDelete={(id) => setItems(items.filter((i) => i.id !== id))} />}

        {tab === "favs" && (
          <section>
            <Title doodle={[2, 2]}>Looks favoritos</Title>
            {favs.length === 0 ? (
              <Empty doodle={[2, 0]} text="Nenhum look salvo ainda." />
            ) : (
              <div className="flex flex-col gap-3">
                {favs.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 rounded-3xl bg-card p-3 shadow-soft">
                    {[f.cima, f.baixo, f.calcado].map((i, n) => (
                      <img key={n} src={i?.urlImagem} alt={i?.nome ?? ""} className="h-16 w-16 rounded-2xl bg-muted object-cover" />
                    ))}
                    <button onClick={() => setFavs(favs.filter((x) => x.id !== f.id))} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "novo" && (
          <NewItem
            onSave={(it) => {
              setItems([...items, it]);
              flash("Peça salva no armário ✨");
              setTab("armario");
            }}
          />
        )}
      </main>

      {toast && (
        <div className="fixed bottom-28 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-soft">
          <Check size={16} /> {toast}
        </div>
      )}

      <nav className="glass fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 justify-around rounded-3xl p-2 shadow-soft">
        {([
          ["look", "Look", Sparkles],
          ["armario", "Armário", LayoutGrid],
          ["favs", "Favs", Heart],
          ["novo", "Novo", Plus],
        ] as const).map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-bold transition ${tab === k ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-app flex min-h-screen justify-center font-sans text-foreground">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden">
        <Doodle col={0} row={0} className="absolute -left-10 top-40 h-24 w-32 -rotate-12 opacity-40" />
        <Doodle col={0} row={1} className="absolute -right-6 top-[55%] h-28 w-20 rotate-12 opacity-40" />
        <Doodle col={3} row={1} className="absolute -left-8 bottom-24 h-28 w-36 opacity-30" />
        {children}
      </div>
    </div>
  );
}

function RoundBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card shadow-soft transition active:scale-90">
      {children}
    </button>
  );
}

function Title({ children, doodle }: { children: ReactNode; doodle: [number, number] }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Doodle col={doodle[0]} row={doodle[1]} className="h-10 w-10" />
      <h2 className="font-display text-2xl font-extrabold">{children}</h2>
    </div>
  );
}

function Empty({ text, doodle }: { text: string; doodle: [number, number] }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 py-10 text-center">
      <Doodle col={doodle[0]} row={doodle[1]} className="h-28 w-28 animate-floaty" />
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{text}</p>
    </div>
  );
}

function Closet({ items, onDelete }: { items: Item[]; onDelete: (id: string) => void }) {
  const [f, setF] = useState<"Todas" | Cat>("Todas");
  const list = f === "Todas" ? items : items.filter((i) => i.categoria === f);
  return (
    <section>
      <Title doodle={[0, 0]}>Meu armário</Title>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["Todas", ...CATS] as const).map((c) => (
          <button
            key={c}
            onClick={() => setF(c)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${f === c ? "bg-foreground text-background" : "bg-card text-muted-foreground shadow-soft"}`}
          >
            {c}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty doodle={[2, 1]} text="Nenhuma peça nesta categoria." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((i) => (
            <div key={i.id} className="relative rounded-3xl bg-card p-2 shadow-soft">
              <img src={i.urlImagem} alt={i.nome} loading="lazy" className="aspect-square w-full rounded-2xl bg-muted object-cover" />
              <button onClick={() => onDelete(i.id)} aria-label="Excluir" className="glass absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-foreground">
                <Trash2 size={14} />
              </button>
              <p className="mt-2 truncate px-1 font-display text-xs font-semibold">{i.nome}</p>
              <p className={`px-1 pb-1 text-[10px] font-bold uppercase tracking-wider ${catStyle[i.categoria].tag}`}>{i.categoria}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function NewItem({ onSave }: { onSave: (i: Item) => void }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<Cat>("Cima");
  const [vibe, setVibe] = useState("Trabalho");
  const [basico, setBasico] = useState(true);
  const [foto, setFoto] = useState("");
  const field = "w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <section>
      <Title doodle={[1, 1]}>Nova peça</Title>
      <form
        className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (!foto) return;
          onSave({ id: crypto.randomUUID(), nome, categoria, vibe, basico, urlImagem: foto });
        }}
      >
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">Nome da peça</span>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Regata canelada" className={field} />
        </label>
        <div>
          <span className="mb-1 block text-xs font-bold text-muted-foreground">Categoria</span>
          <div className="grid grid-cols-3 gap-2">
            {CATS.map((c) => (
              <button type="button" key={c} onClick={() => setCategoria(c)} className={`rounded-2xl py-2.5 text-xs font-bold ${categoria === c ? `${catStyle[c].card} ${catStyle[c].tag} ring-2 ring-current` : "bg-muted text-muted-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted-foreground">Vibe / estilo</span>
          <select value={vibe} onChange={(e) => setVibe(e.target.value)} className={field}>
            <option value="Trabalho">Trabalho</option>
            <option value="Rápido">Dia a dia</option>
            <option value="Conforto">Conforto</option>
          </select>
        </label>
        <button type="button" onClick={() => setBasico(!basico)} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold">
          É peça básica?
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${basico ? "justify-end bg-primary" : "justify-start bg-border"}`}>
            <span className="h-5 w-5 rounded-full bg-card shadow-soft" />
          </span>
        </button>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-butter/40 p-4 text-center">
          {foto ? <img src={foto} alt="" className="h-32 w-32 rounded-2xl object-cover" /> : <Doodle col={2} row={1} className="h-20 w-20" />}
          <span className="text-xs font-bold text-muted-foreground">{foto ? "Trocar foto" : "Toque para adicionar a foto"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const r = new FileReader();
              r.onload = () => setFoto(String(r.result));
              r.readAsDataURL(file);
            }}
          />
        </label>
        <button type="submit" disabled={!foto} className="rounded-2xl bg-brand py-4 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-50">
          Salvar peça
        </button>
      </form>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  Dumbbell,
  Eye,
  Heart,
  PackageSearch,
  Sparkles,
  UserRound,
} from "lucide-react";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function unwrap(response) {
  return response?.data ?? response ?? null;
}

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function imageOf(item) {
  return item?.cover_image_url || item?.image_url || item?.photo_url || item?.gallery?.[0] || null;
}

function dateRu(value) {
  if (!value) return "Сегодня";
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return "Сегодня";
  }
}

function textContent(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptOf(article) {
  return article?.excerpt || article?.description || textContent(article?.content).slice(0, 190) || "Практичный материал от НашФит: тренировки, питание и восстановление без лишней теории.";
}

function RelatedCard({ item, type }) {
  const href = type === "program" ? `/programs/${item.id}` : `/shop/${item.id}`;
  const Icon = type === "program" ? Dumbbell : PackageSearch;
  const image = imageOf(item);

  return (
    <Link href={href} className="group rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl hover:shadow-emerald-950/10">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[color:var(--bg)]">
        {image ? <img src={image} alt={item.title || item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><Icon className="h-8 w-8 text-emerald-700 dark:text-emerald-300" /></div>}
      </div>
      <div className="mt-3 line-clamp-2 font-black text-[color:var(--text)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{item.title || item.name}</div>
      <div className="mt-1 text-sm text-[color:var(--muted)]">{type === "program" ? `${item.duration_weeks || 1} нед.` : "Товар из магазина"}</div>
    </Link>
  );
}

function AuthorCard({ article }) {
  const author = article?.author || article?.user || null;
  const trainer = author?.trainer || article?.trainer || null;
  const name = trainer?.name || author?.name || "Редакция НашФит";
  const image = trainer?.photo_url || author?.avatar_url || null;

  return (
    <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-[color:var(--bg)] text-lg font-black text-emerald-700 dark:text-emerald-300">
          {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name[0] || <UserRound className="h-7 w-7" />}
        </div>
        <div>
          <div className="font-black text-[color:var(--text)]">{name}</div>
          <div className="text-sm text-[color:var(--muted)]">{trainer?.specialization || "Автор материала"}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">Материал подготовлен для пользователей НашФит: коротко, практично и с привязкой к тренировкам.</p>
    </div>
  );
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { isAuthed } = useAuth();
  const [article, setArticle] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [articleRes, programsRes, productsRes] = await Promise.allSettled([
          apiGet(`/articles/${id}`),
          apiGet("/programs?per_page=6"),
          apiGet("/products?per_page=6"),
        ]);

        if (cancelled) return;
        if (articleRes.status !== "fulfilled") throw articleRes.reason;
        setArticle(unwrap(articleRes.value));
        setPrograms(programsRes.status === "fulfilled" ? listFrom(programsRes.value).slice(0, 4) : []);
        setProducts(productsRes.status === "fulfilled" ? listFrom(productsRes.value).slice(0, 4) : []);
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || "Не удалось загрузить статью.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cover = imageOf(article);
  const tags = useMemo(() => {
    const raw = article?.tags || article?.tag_names || [];
    if (Array.isArray(raw)) return raw.map((tag) => typeof tag === "string" ? tag : tag?.name).filter(Boolean).slice(0, 8);
    if (typeof raw === "string") return raw.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
    return [];
  }, [article]);

  async function toggleFavorite() {
    if (!isAuthed) {
      window.location.href = `/login?next=/articles/${id}`;
      return;
    }

    try {
      const response = await apiPost(`/articles/${id}/favorite`, {});
      setArticle((current) => ({ ...current, is_favorited: response?.is_favorited ?? response?.is_favorite ?? !current?.is_favorited }));
    } catch (requestError) {
      setError(requestError?.message || "Не удалось сохранить статью.");
    }
  }

  async function toggleHelpful() {
    if (!isAuthed) {
      window.location.href = `/login?next=/articles/${id}`;
      return;
    }

    try {
      const response = await apiPost(`/articles/${id}/helpful`, {});
      setArticle((current) => ({ ...current, is_helpful: response?.is_helpful ?? !current?.is_helpful, helpful_count: response?.helpful_count ?? current?.helpful_count }));
    } catch (requestError) {
      setError(requestError?.message || "Не удалось поставить отметку.");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-10">
        <div className="container-fitlab h-[660px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-12">
        <div className="container-fitlab rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-red-700 dark:text-red-200">{error || "Статья не найдена."}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-8">
      <div className="container-fitlab">
        <Link href="/articles" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--muted)] transition hover:text-emerald-700 dark:hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Все статьи
        </Link>

        <section className="overflow-hidden rounded-[2.2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-sm">
          <div className="grid lg:grid-cols-[1fr_430px]">
            <div className="relative p-6 md:p-10">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
              <div className="absolute -bottom-28 right-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><Sparkles className="h-4 w-4" /> Фитнес-журнал</span>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl">{article.title}</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)] md:text-lg">{excerptOf(article)}</p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--muted)]">
                  <span>{dateRu(article.published_at || article.created_at)}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> {article.reading_time_minutes || 3} мин</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> {article.views_count || 0}</span>
                </div>

                {tags.length ? <div className="mt-6 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-sm font-bold text-[color:var(--text)]">{tag}</span>)}</div> : null}
              </div>
            </div>
            <div className="min-h-[360px] border-t border-[color:var(--stroke)] bg-[color:var(--bg)] lg:border-l lg:border-t-0">
              {cover ? <img src={cover} alt={article.title} className="h-full min-h-[360px] w-full object-cover" /> : <div className="grid h-full min-h-[360px] place-items-center bg-gradient-to-br from-emerald-500/16 via-cyan-500/10 to-transparent"><BookOpen className="h-24 w-24 text-emerald-700/70 dark:text-emerald-300/70" /></div>}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <article className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-10">
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || article.body || `<p>${excerptOf(article)}</p>` }} />
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <AuthorCard article={article} />

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
              <div className="grid gap-3">
                <button type="button" onClick={toggleFavorite} className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-black transition ${article.is_favorited ? "border-emerald-500 bg-emerald-500 text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-emerald-500/40"}`}>
                  <Bookmark className={`h-5 w-5 ${article.is_favorited ? "fill-current" : ""}`} /> {article.is_favorited ? "Сохранено" : "Сохранить"}
                </button>
                <button type="button" onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-black text-[color:var(--text)] transition hover:border-emerald-500/40">
                  {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> : <Copy className="h-5 w-5" />} {copied ? "Скопировано" : "Поделиться"}
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
              <h2 className="text-xl font-black text-[color:var(--text)]">Материал полезен?</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Твоя оценка помогает подбирать темы для журнала.</p>
              <button type="button" onClick={toggleHelpful} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-black transition ${article.is_helpful ? "border-rose-500 bg-rose-500 text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-rose-500/40"}`}>
                <Heart className={`h-5 w-5 ${article.is_helpful ? "fill-current" : ""}`} /> Да · {article.helpful_count || 0}
              </button>
            </div>

            <Link href="/programs" className="group flex items-center gap-4 rounded-[2rem] border border-emerald-500/25 bg-emerald-500/10 p-5 transition hover:border-emerald-500/45">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white"><Dumbbell className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1"><div className="font-black text-[color:var(--text)]">Закрепить программой</div><div className="text-sm text-[color:var(--muted)]">Перейти к тренировкам</div></div>
              <ArrowRight className="h-5 w-5 text-emerald-700 transition group-hover:translate-x-1 dark:text-emerald-300" />
            </Link>
          </aside>
        </section>

        {(programs.length || products.length) ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {programs.length ? <div><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black text-[color:var(--text)]">Программы по теме</h2><Link href="/programs" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Все программы</Link></div><div className="grid gap-4 sm:grid-cols-2">{programs.map((item) => <RelatedCard key={item.id} item={item} type="program" />)}</div></div> : null}
            {products.length ? <div><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black text-[color:var(--text)]">Товары для практики</h2><Link href="/shop" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Магазин</Link></div><div className="grid gap-4 sm:grid-cols-2">{products.map((item) => <RelatedCard key={item.id} item={item} type="product" />)}</div></div> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Clock3,
  Copy,
  Dumbbell,
  Eye,
  Heart,
  Share2,
} from "lucide-react";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ArticleCard from "@/components/articles/ArticleCard";
import RecommendationHub from "@/components/recommendations/RecommendationHub";
import { articleDate, categoryLabel, unwrapCollection } from "@/lib/articles";

function prepareArticleHtml(html) {
  if (typeof window === "undefined") return { html: html || "", toc: [] };
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html || "", "text/html");
  const toc = [];
  documentNode.querySelectorAll("h2, h3").forEach((heading, index) => {
    const id = `section-${index + 1}`;
    heading.id = id;
    toc.push({ id, title: heading.textContent || `Раздел ${index + 1}`, level: heading.tagName.toLowerCase() });
  });
  return { html: documentNode.body.innerHTML, toc };
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthed } = useAuth();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const prepared = useMemo(() => prepareArticleHtml(article?.content), [article?.content]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet(`/articles/${params.id}`)
      .then((response) => {
        if (!alive) return;
        const payload = response?.data ?? response;
        setArticle(payload);
        if (payload?.category) {
          apiGet(`/articles?category=${encodeURIComponent(payload.category)}&per_page=4`)
            .then((list) => {
              if (!alive) return;
              setRelated(unwrapCollection(list).filter((item) => String(item.id) !== String(payload.id)).slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.status === 404 ? "Статья не найдена" : (e?.data?.message || e?.message || "Ошибка загрузки статьи"));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [params.id]);

  useEffect(() => {
    const update = () => {
      const articleNode = document.getElementById("article-body");
      if (!articleNode) return;
      const rect = articleNode.getBoundingClientRect();
      const total = Math.max(articleNode.offsetHeight - window.innerHeight * 0.55, 1);
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), total);
      setProgress(Math.round((read / total) * 100));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [article]);

  async function requireAuth(action) {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent(`/articles/${params.id}`)}`);
      return;
    }
    await action();
  }

  async function toggleFavorite() {
    await requireAuth(async () => {
      const response = await apiPost(`/articles/${article.id}/favorite`);
      setArticle((current) => ({ ...current, is_favorited: response.is_favorited }));
    });
  }

  async function toggleHelpful() {
    await requireAuth(async () => {
      const response = await apiPost(`/articles/${article.id}/helpful`);
      setArticle((current) => ({ ...current, is_helpful: response.is_helpful, helpful_count: response.helpful_count }));
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return <Container className="py-20"><div className="h-96 animate-pulse rounded-3xl bg-[color:var(--panel)]" /></Container>;
  if (error || !article) return <Container className="py-20 text-center"><h1 className="text-3xl font-black">{error || "Статья не найдена"}</h1><Button as={Link} href="/articles" className="mt-6">Вернуться к статьям</Button></Container>;

  const trainer = article.is_trainer_article || article.author?.is_trainer;

  return (
    <main className="pb-20">
      <div className="fixed left-0 top-0 z-[70] h-1 bg-emerald-400 transition-[width]" style={{ width: `${progress}%` }} />

      <Container size="wide" className="py-7">
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] hover:text-emerald-400">
          <ArrowLeft className="h-4 w-4" /> Все статьи
        </Link>
      </Container>

      <section>
        <Container size="wide">
          <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]">
            {article.cover_image_url ? (
              <div className="relative aspect-[16/7] overflow-hidden">
                <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              </div>
            ) : null}
            <div className="p-6 sm:p-10 lg:p-14">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-400">{categoryLabel(article.category)}</span>
                {trainer ? <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-300"><BadgeCheck className="h-4 w-4" /> Материал тренера</span> : null}
              </div>
              <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.08] sm:text-6xl">{article.title}</h1>
              <p className="mt-6 max-w-4xl text-lg leading-8 text-[color:var(--muted)]">{article.excerpt}</p>

              <div className="mt-8 flex flex-col gap-5 border-t border-[color:var(--stroke)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-black text-slate-950">
                    {article.author?.trainer?.photo_url ? <img src={article.author.trainer.photo_url} alt={article.author.name} className="h-full w-full object-cover" /> : article.author?.name?.[0] || "Н"}
                  </div>
                  <div>
                    <p className="font-bold">{article.author?.name || "Редакция НашФит"}</p>
                    <p className="text-sm text-[color:var(--muted)]">{article.author?.trainer?.specialization || (trainer ? "Тренер НашФит" : "Автор НашФит")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--muted)]">
                  <span>{articleDate(article.published_at || article.created_at)}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {article.reading_time_minutes || 1} мин</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {article.views_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container size="wide" className="mt-10">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,760px)_220px] lg:justify-center">
          <aside className="hidden lg:block">
            {prepared.toc.length ? (
              <div className="sticky top-24">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[color:var(--muted)]">Содержание</p>
                <nav className="mt-4 space-y-3 border-l border-[color:var(--stroke)] pl-4">
                  {prepared.toc.map((item) => <a key={item.id} href={`#${item.id}`} className={`block text-sm leading-5 text-[color:var(--muted)] hover:text-emerald-400 ${item.level === "h3" ? "pl-3" : "font-semibold"}`}>{item.title}</a>)}
                </nav>
              </div>
            ) : null}
          </aside>

          <article id="article-body" className="article-content min-w-0" dangerouslySetInnerHTML={{ __html: prepared.html }} />

          <aside>
            <div className="sticky top-24 space-y-3">
              <button type="button" onClick={toggleFavorite} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${article.is_favorited ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-[color:var(--stroke)] bg-[color:var(--panel)] hover:border-emerald-400/50"}`}>
                <Bookmark className={`h-5 w-5 ${article.is_favorited ? "fill-emerald-400" : ""}`} /> {article.is_favorited ? "Сохранено" : "Сохранить"}
              </button>
              <button type="button" onClick={copyLink} className="flex w-full items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 text-left text-sm font-semibold hover:border-emerald-400/50">
                {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />} {copied ? "Скопировано" : "Поделиться"}
              </button>
            </div>
          </aside>
        </div>
      </Container>

      <Container size="narrow" className="mt-12">
        <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-xl font-black">Материал был полезен?</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Ваш ответ помогает нам выбирать лучшие темы.</p>
          </div>
          <button type="button" onClick={toggleHelpful} className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition sm:mt-0 ${article.is_helpful ? "border-rose-400 bg-rose-400/10 text-rose-300" : "border-[color:var(--stroke)] hover:border-rose-400/50"}`}>
            <Heart className={`h-5 w-5 ${article.is_helpful ? "fill-rose-400" : ""}`} /> Да, полезно · {article.helpful_count || 0}
          </button>
        </div>

        <Link
          href="/programs"
          className="group mt-8 flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
            <Dumbbell className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-[color:var(--text)]">Закрепить материал бесплатной программой</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">Выберите план и отслеживайте прогресс в личном кабинете.</div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-emerald-400 transition group-hover:translate-x-1" />
        </Link>

        <RecommendationHub contextType="article" contextId={article.id} className="mt-5" />
      </Container>

      {related.length ? (
        <Container size="wide" className="mt-16">
          <h2 className="text-3xl font-black">Читайте дальше</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">{related.map((item) => <ArticleCard key={item.id} article={item} />)}</div>
        </Container>
      ) : null}
    </main>
  );
}

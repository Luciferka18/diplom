"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  Bold,
  Check,
  ChevronDown,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  MessageSquareQuote,
  Monitor,
  Redo2,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Underline,
  Undo2,
  UploadCloud,
  X,
} from "lucide-react";
import { apiPost, apiPut } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { ARTICLE_CATEGORIES, categoryLabel } from "@/lib/articles";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

const EMPTY_CONTENT = "<p>Начните писать статью здесь...</p>";

function stripHtml(value) {
  if (typeof window === "undefined") return "";
  const node = document.createElement("div");
  node.innerHTML = value || "";
  return (node.textContent || "").trim();
}

function safePreviewHtml(value) {
  if (typeof window === "undefined") return value || "";
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(value || "", "text/html");
  documentNode.querySelectorAll("script,iframe,object,embed").forEach((node) => node.remove());
  documentNode.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name);
      if (["href", "src"].includes(attribute.name.toLowerCase()) && /^javascript:/i.test(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return documentNode.body.innerHTML;
}

export default function ArticleEditor({ initialArticle = null }) {
  const router = useRouter();
  const { user, isAdmin, isTrainer } = useAuth();
  const editorRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const initializedRef = useRef(false);

  const [article, setArticle] = useState(initialArticle);
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [category, setCategory] = useState(initialArticle?.category || "training");
  const [coverImage, setCoverImage] = useState(initialArticle?.cover_image_url || "");
  const [content, setContent] = useState(initialArticle?.content || EMPTY_CONTENT);
  const [preview, setPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastLocalSave, setLastLocalSave] = useState(null);
  const [restorableDraft, setRestorableDraft] = useState(null);

  const storageKey = useMemo(
    () => `nashfit-article-editor:${user?.id || "guest"}:${article?.id || "new"}`,
    [user?.id, article?.id]
  );

  const submitLabel = isAdmin || isTrainer ? "Опубликовать" : "Отправить на модерацию";
  const submitIcon = isAdmin || isTrainer ? Sparkles : Send;
  const SubmitIcon = submitIcon;

  useEffect(() => {
    if (!editorRef.current || initializedRef.current) return;
    editorRef.current.innerHTML = content || EMPTY_CONTENT;
    initializedRef.current = true;
  }, [content]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const local = JSON.parse(raw);
      const serverUpdated = article?.updated_at ? new Date(article.updated_at).getTime() : 0;
      if ((local.savedAt || 0) > serverUpdated + 1500) setRestorableDraft(local);
    } catch {
      setRestorableDraft(null);
    }
  }, [storageKey, article?.updated_at]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      const draft = {
        title,
        excerpt,
        category,
        coverImage,
        content: editorRef.current?.innerHTML || content,
        savedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastLocalSave(new Date());
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [title, excerpt, category, coverImage, content, storageKey]);

  const wordCount = useMemo(() => {
    const text = typeof window === "undefined" ? "" : stripHtml(content);
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }, [content]);

  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  function restoreLocalDraft() {
    if (!restorableDraft) return;
    setTitle(restorableDraft.title || "");
    setExcerpt(restorableDraft.excerpt || "");
    setCategory(restorableDraft.category || "training");
    setCoverImage(restorableDraft.coverImage || "");
    setContent(restorableDraft.content || EMPTY_CONTENT);
    if (editorRef.current) editorRef.current.innerHTML = restorableDraft.content || EMPTY_CONTENT;
    setRestorableDraft(null);
    setMessage("Локальная копия восстановлена");
  }

  function discardLocalDraft() {
    localStorage.removeItem(storageKey);
    setRestorableDraft(null);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function exec(command, value = null) {
    focusEditor();
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || "");
  }

  function insertHtml(html) {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    setContent(editorRef.current?.innerHTML || "");
  }

  function createLink() {
    const url = window.prompt("Вставьте ссылку");
    if (!url) return;
    exec("createLink", url);
  }

  function addCallout(type) {
    const labels = {
      tip: "Совет тренера",
      important: "Важно",
      mistake: "Частая ошибка",
    };
    insertHtml(`<div data-callout="${type}"><strong>${labels[type]}</strong><p>Напишите пояснение...</p></div><p><br></p>`);
  }

  async function uploadImage(file, mode = "inline") {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await apiPost("/articles/images", form);
      const payload = response?.data ?? response;
      const url = payload?.url;
      if (!url) throw new Error("Сервер не вернул ссылку на изображение");
      if (mode === "cover") {
        setCoverImage(url);
      } else {
        insertHtml(`<figure><img src="${url}" alt="Изображение статьи"><figcaption>Добавьте подпись к изображению</figcaption></figure><p><br></p>`);
      }
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
    }
  }

  function handleEditorDrop(event) {
    const file = [...(event.dataTransfer?.files || [])].find((item) => item.type.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    uploadImage(file, "inline");
  }

  function validate() {
    const html = editorRef.current?.innerHTML || content;
    const plain = stripHtml(html);
    if (title.trim().length < 5) return "Заголовок должен быть не короче 5 символов";
    if (plain.length < 20) return "Добавьте хотя бы небольшой текст статьи";
    return "";
  }

  async function save(intent) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        category,
        cover_image_url: coverImage || null,
        content: editorRef.current?.innerHTML || content,
        intent,
      };

      const response = article?.id
        ? await apiPut(`/articles/${article.id}`, payload)
        : await apiPost("/articles", payload);
      const saved = response?.data ?? response;
      setArticle(saved);
      localStorage.removeItem(storageKey);

      if (intent === "draft") {
        setMessage("Черновик сохранён");
        if (!article?.id && saved?.id) router.replace(`/account/articles/${saved.id}/edit`);
      } else {
        router.push("/account/articles");
        router.refresh();
      }
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось сохранить статью");
    } finally {
      setBusy(false);
    }
  }

  const toolbar = [
    { title: "Отменить", icon: Undo2, onClick: () => exec("undo") },
    { title: "Повторить", icon: Redo2, onClick: () => exec("redo") },
    { divider: true },
    { title: "Обычный текст", icon: AlignLeft, onClick: () => exec("formatBlock", "P") },
    { title: "Заголовок", icon: Heading2, onClick: () => exec("formatBlock", "H2") },
    { title: "Подзаголовок", icon: Heading3, onClick: () => exec("formatBlock", "H3") },
    { divider: true },
    { title: "Жирный", icon: Bold, onClick: () => exec("bold") },
    { title: "Курсив", icon: Italic, onClick: () => exec("italic") },
    { title: "Подчёркивание", icon: Underline, onClick: () => exec("underline") },
    { title: "Ссылка", icon: Link2, onClick: createLink },
    { divider: true },
    { title: "Маркированный список", icon: List, onClick: () => exec("insertUnorderedList") },
    { title: "Нумерованный список", icon: ListOrdered, onClick: () => exec("insertOrderedList") },
    { title: "Цитата", icon: MessageSquareQuote, onClick: () => exec("formatBlock", "BLOCKQUOTE") },
    { title: "Изображение", icon: ImagePlus, onClick: () => inlineImageInputRef.current?.click() },
  ];

  return (
    <div className="space-y-5">
      {restorableDraft ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-200">Найдена более новая локальная копия</p>
            <p className="text-sm text-amber-100/70">Она могла сохраниться после случайного закрытия страницы.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={restoreLocalDraft}>Восстановить</Button>
            <Button size="sm" variant="ghost" onClick={discardLocalDraft}><X className="h-4 w-4" /> Удалить</Button>
          </div>
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[color:var(--muted)]">{article?.id ? "Редактирование статьи" : "Новый материал"}</p>
          <h1 className="text-2xl font-black text-[color:var(--text)] sm:text-3xl">Редактор статей</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview((value) => !value)}>
            <Eye className="h-4 w-4" /> {preview ? "Вернуться к редактору" : "Предпросмотр"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => save("draft")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Сохранить
          </Button>
          <Button disabled={busy} onClick={() => save(isAdmin || isTrainer ? "publish" : "submit")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SubmitIcon className="h-4 w-4" />} {submitLabel}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            <Button size="sm" variant={previewDevice === "desktop" ? "primary" : "outline"} onClick={() => setPreviewDevice("desktop")}>
              <Monitor className="h-4 w-4" /> Компьютер
            </Button>
            <Button size="sm" variant={previewDevice === "mobile" ? "primary" : "outline"} onClick={() => setPreviewDevice("mobile")}>
              <Smartphone className="h-4 w-4" /> Телефон
            </Button>
          </div>
          <div className={`mx-auto overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-2xl transition-all ${previewDevice === "mobile" ? "max-w-[390px]" : "max-w-5xl"}`}>
            {coverImage ? <img src={coverImage} alt="Обложка" className="aspect-[16/7] w-full object-cover" /> : null}
            <div className="p-6 sm:p-10">
              <span className="text-sm font-bold uppercase tracking-[.16em] text-emerald-400">{categoryLabel(category)}</span>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{title || "Заголовок статьи"}</h1>
              <p className="mt-4 text-lg leading-8 text-[color:var(--muted)]">{excerpt || "Короткое описание поможет читателю понять, о чём материал."}</p>
              <div className="mt-5 text-sm text-[color:var(--muted)]">{readingMinutes} мин чтения · {wordCount} слов</div>
              <article className="article-content mt-10" dangerouslySetInnerHTML={{ __html: safePreviewHtml(content) }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Card hover={false} className="p-0 overflow-hidden">
              <div className="border-b border-[color:var(--stroke)] p-5">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Название статьи"
                  className="border-0 bg-transparent px-0 text-3xl font-black shadow-none focus:ring-0"
                  maxLength={255}
                />
                <Textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Коротко расскажите, почему эту статью стоит прочитать"
                  className="mt-2 min-h-20 resize-none border-0 bg-transparent px-0 text-base leading-7 shadow-none focus:ring-0"
                  maxLength={800}
                />
              </div>

              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[color:var(--stroke)] bg-[color:var(--panel)]/95 p-2 backdrop-blur">
                {toolbar.map((item, index) => {
                  if (item.divider) return <span key={`divider-${index}`} className="mx-1 h-7 w-px bg-[color:var(--stroke)]" />;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      title={item.title}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={item.onClick}
                      className="rounded-lg p-2 text-[color:var(--muted)] transition hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                <div className="group relative ml-auto">
                  <button type="button" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--muted)] hover:bg-[color:var(--bg)]">
                    Вставить блок <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addCallout("tip")} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-emerald-500/10">Совет тренера</button>
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addCallout("important")} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-amber-500/10">Важно</button>
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addCallout("mistake")} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-red-500/10">Частая ошибка</button>
                  </div>
                </div>
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => setContent(event.currentTarget.innerHTML)}
                onDrop={handleEditorDrop}
                className="article-editor article-content min-h-[560px] p-6 outline-none sm:p-9"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--stroke)] px-5 py-3 text-xs text-[color:var(--muted)]">
                <span>{wordCount} слов · примерно {readingMinutes} мин чтения</span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {lastLocalSave ? `Локально сохранено в ${lastLocalSave.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : "Автосохранение включено"}
                </span>
              </div>
            </Card>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Card hover={false}>
              <h2 className="font-bold">Настройки публикации</h2>
              <label className="mt-5 block text-sm font-semibold">Категория</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ARTICLE_CATEGORIES.filter((item) => item.value !== "all").map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>

              <div className="mt-5">
                <p className="text-sm font-semibold">Обложка</p>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    uploadImage(event.dataTransfer?.files?.[0], "cover");
                  }}
                  className="mt-2 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] text-center transition hover:border-emerald-400"
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Обложка" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-5 text-sm text-[color:var(--muted)]"><UploadCloud className="mx-auto mb-2 h-7 w-7" />Перетащите изображение или нажмите</span>
                  )}
                </button>
                {coverImage ? (
                  <button type="button" onClick={() => setCoverImage("")} className="mt-2 inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200">
                    <Trash2 className="h-3.5 w-3.5" /> Удалить обложку
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3 text-sm text-[color:var(--muted)]">
                {isAdmin || isTrainer ? (
                  <><strong className="text-emerald-400">Публикация без модерации.</strong> После нажатия «Опубликовать» статья сразу появится в журнале.</>
                ) : (
                  <><strong className="text-amber-300">Нужна модерация.</strong> Администратор проверит материал перед публикацией.</>
                )}
              </div>
            </Card>

            <Card hover={false}>
              <h2 className="font-bold">Перед публикацией</h2>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
                <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 ${title.length >= 5 ? "text-emerald-400" : "text-[color:var(--muted2)]"}`} /> Понятный заголовок</li>
                <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 ${excerpt.length >= 40 ? "text-emerald-400" : "text-[color:var(--muted2)]"}`} /> Короткое описание</li>
                <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 ${wordCount >= 80 ? "text-emerald-400" : "text-[color:var(--muted2)]"}`} /> Полезный основной текст</li>
                <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 ${coverImage ? "text-emerald-400" : "text-[color:var(--muted2)]"}`} /> Обложка</li>
              </ul>
            </Card>
          </aside>
        </div>
      )}

      <input ref={inlineImageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0], "inline")} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0], "cover")} />
      {uploading ? <div className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl"><Loader2 className="h-4 w-4 animate-spin" /> Загрузка изображения...</div> : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { Plus, Save, Trash2, RefreshCw, Search, Package, Layers3, X } from "lucide-react";

const empty = { name:"",slug:"",short_description:"",description:"",brand:"",sku:"",price:"",old_price:"",stock:0,image_url:"",gallery_text:"",attributes_text:"",badges_text:"",category_id:"",is_featured:false,is_new:false,trainer_pick:false,home_use:false,is_active:true,variants:[] };

function toForm(item) {
  return {
    ...empty, ...item,
    is_active: item.is_active !== false,
    category_id: item.category_id || "",
    gallery_text: (item.gallery || []).join("\n"),
    attributes_text: Object.entries(item.attributes || {}).map(([k,v]) => `${k}: ${v}`).join("\n"),
    badges_text: (item.badges || []).join(", "),
    variants: (item.variants || []).map((v) => ({ ...v, options_text: Object.entries(v.options || {}).map(([k,val]) => `${k}: ${val}`).join(", ") })),
  };
}

function parsePairs(text, separator = /[,\n]/) {
  return String(text || "").split(separator).map((row) => row.trim()).filter(Boolean).reduce((acc,row) => {
    const i = row.indexOf(":");
    if (i > 0) acc[row.slice(0,i).trim()] = row.slice(i+1).trim();
    return acc;
  }, {});
}

export default function AdminProductsPage() {
  const [products,setProducts]=useState([]); const [categories,setCategories]=useState([]); const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null); const [search,setSearch]=useState(""); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [p,c]=await Promise.all([apiGet("/products?admin=1&per_page=100&sort=new"),apiGet("/admin/categories?per_page=100")]);
      setProducts(p?.data || []); setCategories(c?.data || c || []);
    } catch(e){setError(e?.message||"Не удалось загрузить магазин.");} finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  const filtered=useMemo(()=>products.filter(p=>`${p.name} ${p.brand||""} ${p.sku||""}`.toLowerCase().includes(search.toLowerCase())),[products,search]);

  async function edit(item){
    setEditing(item.id); setMessage(""); setError(""); setBusy(true);
    try {
      const response = await apiGet(`/products/${item.id}`);
      const fullProduct = response?.data || response;
      setForm(toForm(fullProduct));
      window.scrollTo({top:0,behavior:"smooth"});
    } catch (e) {
      setEditing(null);
      setError(e?.data?.message || e?.message || "Не удалось загрузить полную карточку товара.");
    } finally {
      setBusy(false);
    }
  }
  function reset(){setEditing(null);setForm(empty);setMessage("");setError("");}
  function updateVariant(index,key,value){setForm(f=>({...f,variants:f.variants.map((v,i)=>i===index?{...v,[key]:value}:v)}));}
  function addVariant(){setForm(f=>({...f,variants:[...f.variants,{name:"",sku:`NF-VAR-${Date.now()}`,options_text:"",price:f.price||0,old_price:"",stock:0,image_url:"",is_active:true}]}));}

  async function save(event){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      const payload={
        name:form.name,slug:form.slug||null,short_description:form.short_description||null,description:form.description||null,brand:form.brand||null,sku:form.sku||null,
        price:Number(form.price||0),old_price:form.old_price?Number(form.old_price):null,stock:Number(form.stock||0),image_url:form.image_url||null,
        gallery:String(form.gallery_text||"").split(/\n/).map(x=>x.trim()).filter(Boolean),attributes:parsePairs(form.attributes_text,/\n/),badges:String(form.badges_text||"").split(",").map(x=>x.trim()).filter(Boolean),
        category_id:form.category_id?Number(form.category_id):null,is_featured:!!form.is_featured,is_new:!!form.is_new,trainer_pick:!!form.trainer_pick,home_use:!!form.home_use,is_active:form.is_active !== false,
        variants:form.variants.filter(v=>v.name&&v.sku).map(v=>({id:v.id||null,name:v.name,sku:v.sku,options:parsePairs(v.options_text),price:v.price!==""?Number(v.price):null,old_price:v.old_price?Number(v.old_price):null,stock:Number(v.stock||0),image_url:v.image_url||null,is_active:v.is_active!==false})),
      };
      if(editing) await apiPut(`/products/${editing}`,payload); else await apiPost("/products",payload);
      setMessage(editing?"Товар обновлён.":"Товар создан."); await load(); if(!editing) reset();
    }catch(e){setError(e?.data?.message||e?.message||"Не удалось сохранить товар.");}finally{setBusy(false);}
  }
  async function remove(item){if(!confirm(`Удалить «${item.name}»?`))return;await apiDelete(`/products/${item.id}`);if(editing===item.id)reset();await load();}

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-400">Управление магазином</div><h1 className="mt-1 text-3xl font-black text-[color:var(--text)]">Товары и варианты</h1><p className="mt-2 text-[color:var(--muted)]">Цены, остатки, вкусы, размеры и подборки.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] px-4 py-2.5 font-bold text-[color:var(--text)]"><RefreshCw className="h-4 w-4" /> Обновить</button></div>
    {error?<div className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200">{error}</div>:null}{message?<div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-300">{message}</div>:null}

    <form onSubmit={save} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-[color:var(--text)]">{editing?`Редактирование #${editing}`:"Новый товар"}</h2><p className="text-sm text-[color:var(--muted)]">Основные данные и варианты с отдельными остатками.</p></div>{editing?<button type="button" onClick={reset} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--muted)]"><X className="h-5 w-5" /></button>:null}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Название" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="Бренд" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder="Артикул" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)]"><option value="">Без категории</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input required type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Цена" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input type="number" step="0.01" value={form.old_price||""} onChange={e=>setForm({...form,old_price:e.target.value})} placeholder="Старая цена" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="Остаток без вариантов" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input value={form.slug||""} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug (автоматически)" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" />
        <input value={form.image_url||""} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="Главное изображение URL" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none md:col-span-2" />
        <input value={form.badges_text||""} onChange={e=>setForm({...form,badges_text:e.target.value})} placeholder="Бейджи через запятую" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none md:col-span-2" />
        <input value={form.short_description||""} onChange={e=>setForm({...form,short_description:e.target.value})} placeholder="Короткое описание" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none md:col-span-2 xl:col-span-4" />
        <textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Полное описание" className="min-h-28 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)] outline-none md:col-span-2" />
        <textarea value={form.attributes_text||""} onChange={e=>setForm({...form,attributes_text:e.target.value})} placeholder={"Характеристики, по одной на строку:\nБелок: 25 г\nОбъём: 900 г"} className="min-h-28 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)] outline-none md:col-span-2" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{[["is_featured","На главной"],["is_new","Новинка"],["trainer_pick","Выбор тренера"],["home_use","Для дома"],["is_active","Активен"]].map(([key,label])=><label key={key} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-bold ${form[key]?"border-emerald-400 bg-emerald-400 text-slate-950":"border-[color:var(--stroke)] text-[color:var(--muted)]"}`}><input type="checkbox" checked={!!form[key]} onChange={e=>setForm({...form,[key]:e.target.checked})} className="hidden" />{label}</label>)}</div>

      <div className="mt-7 border-t border-[color:var(--stroke)] pt-6"><div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black text-[color:var(--text)]"><Layers3 className="h-5 w-5 text-cyan-400" /> Варианты товара</h3><p className="text-sm text-[color:var(--muted)]">Например вкус + объём или размер + цвет. Итоговый остаток товара считается по вариантам автоматически.</p></div><button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 px-4 py-2 font-bold text-cyan-300"><Plus className="h-4 w-4" /> Добавить вариант</button></div>
        <div className="mt-4 space-y-3">{form.variants.map((variant,index)=><div key={variant.id||index} className="grid gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1.5fr_.7fr_.7fr_auto]"><input required value={variant.name} onChange={e=>updateVariant(index,"name",e.target.value)} placeholder="Название варианта" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)]" /><input required value={variant.sku} onChange={e=>updateVariant(index,"sku",e.target.value)} placeholder="SKU" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)]" /><input value={variant.options_text||""} onChange={e=>updateVariant(index,"options_text",e.target.value)} placeholder="Вкус: Шоколад, Объём: 900 г" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)]" /><input type="number" step="0.01" value={variant.price??""} onChange={e=>updateVariant(index,"price",e.target.value)} placeholder="Цена" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)]" /><input type="number" value={variant.stock??0} onChange={e=>updateVariant(index,"stock",e.target.value)} placeholder="Остаток" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)]" /><button type="button" onClick={()=>setForm(f=>({...f,variants:f.variants.filter((_,i)=>i!==index)}))} className="grid h-11 w-11 place-items-center rounded-xl border border-red-400/20 text-red-300"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      </div>
      <div className="mt-6 flex gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:opacity-50"><Save className="h-5 w-5" />{busy?"Сохраняем…":editing?"Сохранить изменения":"Создать товар"}</button>{editing?<button type="button" onClick={reset} className="rounded-xl border border-[color:var(--stroke)] px-5 py-3 font-bold text-[color:var(--text)]">Отмена</button>:null}</div>
    </form>

    <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-[color:var(--text)]">Каталог</h2><p className="text-sm text-[color:var(--muted)]">{products.length} товаров</p></div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] py-2.5 pl-10 pr-4 text-[color:var(--text)]" /></label></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="text-[color:var(--muted)]"><tr><th className="pb-3">Товар</th><th className="pb-3">Цена</th><th className="pb-3">Остаток</th><th className="pb-3">Варианты</th><th className="pb-3">Статус</th><th></th></tr></thead><tbody>{filtered.map(item=><tr key={item.id} className="border-t border-[color:var(--stroke)]"><td className="py-4"><div className="flex items-center gap-3">{item.image_url?<img src={item.image_url} alt="" className="h-12 w-12 rounded-xl object-cover"/>:<div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400/10"><Package className="h-5 w-5 text-emerald-400"/></div>}<div><b className="text-[color:var(--text)]">{item.name}</b><div className="text-xs text-[color:var(--muted)]">{item.brand}</div></div></div></td><td className="py-4 font-bold text-[color:var(--text)]">{Number(item.price).toLocaleString("ru-RU")} ₽</td><td className="py-4 text-[color:var(--text)]">{item.stock}</td><td className="py-4 text-[color:var(--muted)]">{item.variants?.length||0}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.is_active?"bg-emerald-400/10 text-emerald-400":"bg-red-400/10 text-red-300"}`}>{item.is_active?"Активен":"Скрыт"}</span></td><td className="py-4"><div className="flex justify-end gap-2"><button onClick={()=>edit(item)} className="rounded-lg border border-[color:var(--stroke)] px-3 py-2 font-bold text-[color:var(--text)]">Изменить</button><button onClick={()=>remove(item)} className="rounded-lg border border-red-400/20 p-2 text-red-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
    </section>
  </div>;
}

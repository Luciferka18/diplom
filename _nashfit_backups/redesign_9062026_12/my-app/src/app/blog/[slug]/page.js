import { redirect } from "next/navigation";
import { apiGet } from "@/services/api";

export default async function LegacyBlogArticlePage({ params }) {
  const resolved = params && typeof params.then === "function" ? await params : params;
  let article = null;

  try {
    const response = await apiGet(`/articles/slug/${resolved?.slug}`);
    article = response?.data ?? response;
  } catch {
    redirect("/articles");
  }

  redirect(`/articles/${article.id}`);
}

import BASE_URL, { getImageUrl } from "./config.js";

const section = document.getElementById("latest-blogs-section");
const grid = document.getElementById("latest-blogs-grid");

function createBlogCard(blog) {
    const slug = String(blog.slug || blog.title || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const card = document.createElement("article");
    card.className = "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2B1D14]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

    const link = document.createElement("a");
    link.href = `/blog/${encodeURIComponent(slug)}`;
    link.className = "flex h-full flex-col";
    link.setAttribute("aria-label", `Read ${blog.title || "latest blog"}`);

    const image = document.createElement("img");
    image.src = getImageUrl(blog.coverImage || blog.coverUrl, "/static/logo2.png");
    image.alt = blog.title || "Alora Radiance blog";
    image.loading = "lazy";
    image.decoding = "async";
    image.className = "aspect-[4/3] w-full bg-[#F1E6D3] object-cover";

    const content = document.createElement("div");
    content.className = "flex flex-1 flex-col p-4 sm:p-5";
    const category = document.createElement("span");
    category.className = "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5C2A]";
    category.textContent = blog.category || "Skincare guide";
    const title = document.createElement("h3");
    title.className = "mt-2 line-clamp-2 font-heading text-xl font-bold leading-snug text-[#2B1D14] group-hover:text-[#8B5C2A]";
    title.textContent = blog.metaTitle || blog.title || "Read our latest skincare guide";
    const summary = document.createElement("p");
    summary.className = "mt-2 line-clamp-3 text-sm leading-6 text-[#6B625A]";
    summary.textContent = blog.metaDesc || "Explore skincare tips, ingredient insights, and simple routine ideas.";
    const footer = document.createElement("div");
    footer.className = "mt-auto flex items-center justify-between gap-2 pt-5 text-xs";
    const date = document.createElement("time");
    date.className = "text-[#777067]";
    const publishedAt = blog.publishedAt || blog.createdAt;
    if (publishedAt && !Number.isNaN(new Date(publishedAt).getTime())) {
        date.dateTime = new Date(publishedAt).toISOString();
        date.textContent = new Date(publishedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }
    const readMore = document.createElement("span");
    readMore.className = "font-semibold text-[#8B5C2A]";
    readMore.textContent = "Read article →";

    footer.append(date, readMore);
    content.append(category, title, summary, footer);
    link.append(image, content);
    card.append(link);
    return card;
}

async function loadLatestBlogs() {
    if (!section || !grid) return;

    try {
        const response = await fetch(`${BASE_URL}/api/blogs/all?limit=4`, { cache: "no-cache" });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not load the latest blogs.");
        }

        const blogs = Array.isArray(result.blogs) ? result.blogs : (Array.isArray(result.data) ? result.data : []);
        const latestBlogs = blogs.slice(0, 4).filter(blog => blog && (blog.slug || blog.title));
        if (!latestBlogs.length) {
            section.hidden = true;
            return;
        }
        grid.replaceChildren(...latestBlogs.map(createBlogCard));
    } catch (error) {
        console.error("Could not load homepage latest blogs:", error);
        section.hidden = true;
    }
}

loadLatestBlogs();

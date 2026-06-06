async function fetchDataByTypes(types = ["products"]) {
  const { data, error } = await client
    .from("information")
    .select(
      `
            *,
            categories!information_category_id_fkey!inner(type)
            `,
    )
    .in("categories.type", types);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(({ categories, ...info }) => ({
    ...info,
    type: categories?.type ?? null,
  }));
}

async function fetchInforById(id) {
  const { data, error } = await client
    .from("information")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function subscribeToDB(email) {
  const { error } = await client.from("subscriptions").insert({ email });

  if (error) throw error;
}

async function fetchTestimonials() {
  const { data, error } = await client.from("testimonials").select(`
        *,
        user:users!testimonials_author_id_fkey(*)
      `);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(({ user, ...info }) => ({
    ...info,
    name: user?.name ?? "Anonymous",
    email: user?.email ?? null,
  }));
}

async function fetchCategoriesByType(type = "gallery") {
  const { data, error } = await client
    .from("categories")
    .select()
    .eq("type", type);
  if (error) {
    console.error(error);
    return;
  }
  return data;
}

async function fetchGallery() {
  return fetchDataByTypes(["gallery"]);
}

async function fetchBlogsByCategoryId(
  categoryId = "All",
  page = 1,
  pageSize = 2,
) {
  const safeCategoryId = Number(categoryId);
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 2);

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = client
    .from("information")
    .select(
      `
id, title, category_id, author_id, thumbpath, summary, created_at,
author: users! information_author_id_fkey( id, name), category: categories! information_category_id_fkey!inner (id, name, type), comments: comments! comments_blog_id_fkey(id)
`,
      { count: "exact" },
    )
    .eq("category. type", "blogs")
    .order("created_at", { ascending: false });

  if (!Number.isNaN(safeCategoryId) && safeCategoryId > 0) {
    query = query.eq("category_id", safeCategoryId);
  }

  const { data, error, count } = await query.range(from, to);
  const totalItems = count ?? 0;
  const pageCount = Math.ceil(totalItems / safePageSize);

  const prevPage = Math.max(safePage - 1, 1);
  const nextPage = Math.min(safePage + 1, pageCount);

  if (error) {
    console.error(error);
    return {
      data: [],
      pagination: {
        currentPage: safePage,
        pageCount: 0,
        categoryId,
        size: 0,
      },
      error,
    };
  }
  return {
    data,
    pagination: {
      currentPage: safePage,
      pageCount,
      categoryId,
      size: 2,
      prevPage,
      nextPage,
    },
    error,
  };
}

async function fetchBlogById(id) {
  const { data, error } = await client
    .from("information")
    .select(
      `
  id, title, category_id, author_id, imagepath, description, created_at,
author:users! information_author_id_fkey(id, name), category: categories! information_category_id_fkey! inner(id, name), comments: comments! comments_blog_id_fkey(
id, message, created_at,
author:users! comments_author_id_fkey(id, name)
  `,
    )
    .eq("id", id)
    .order("create_at", { ascending: false, foreignTable: "comments" })
    .single();

    if (error) {
      console.error(error)
      return null;
    }

    return data;
}

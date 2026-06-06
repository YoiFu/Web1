const SUPABASE_URL = "https://rwykkyoyadqsjmpwahdb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0CldYhMKzUn0cvzD_UDsWg_EitNXMND";

const { createClient } = window.supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function renderView(templateId, viewId, data) {
  var source = document.getElementById(templateId).innerHTML;
  let template = Handlebars.compile(source);
  document.getElementById(viewId).innerHTML = template({ data });
}

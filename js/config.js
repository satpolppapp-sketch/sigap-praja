// ==== SIGAP PRAJA - KONFIGURASI PUSAT ====
const SUPABASE_URL = 'https://mnjcughtunlsuayxteud.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zA6aztT6liHenHZfR5ohyA_TduVH8I6';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwI4Nw2i0A3a-QplA3gI-9cqYoV8QlXrIDyHEkOt6JknZzUJ1uPX0Ja41okiGueriGA/exec';
const APP_URL = 'https://sigap-praja-app.vercel.app';
const DOMAIN_EMAIL = '@satpolpp.go.id';
const PIN_UMUM = '1950';
let sb = null;
function initSupabase(){ sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); return sb; }

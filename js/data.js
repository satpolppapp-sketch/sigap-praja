// ==== SIGAP PRAJA - LAPISAN DATA (SUPABASE) ====
async function dbLoadAll(){
  const [prof,ang,dp,du,lp,lu,sita,bl] = await Promise.all([
    sb.from('profiles').select('nama,role'),
    sb.from('daftar_anggota').select('*'),
    sb.from('draf_patroli').select('*'),
    sb.from('draf_petugas_umum').select('*'),
    sb.from('log_patroli').select('*').order('id',{ascending:true}),
    sb.from('log_petugas_umum').select('*').order('id',{ascending:true}),
    sb.from('barang_bukti').select('*').order('id',{ascending:true}),
    sb.from('blacklist').select('*').order('id',{ascending:true})
  ]);
  const mapAng={}; (ang.data||[]).forEach(a=>{ const k=a.id_tim.toLowerCase(); (mapAng[k]=mapAng[k]||[]).push(a.nama_anggota); });
  const mapDraf={}; (dp.data||[]).forEach(d=>{ mapDraf[d.id_tim.toLowerCase()]={meta:JSON.stringify(d.meta_patroli||{}),temuan:JSON.stringify(d.list_temuan_json||[])}; });
  const users=(prof.data||[]).map(p=>({nama:p.nama,role:p.role,anggota_tim:mapAng[p.nama.toLowerCase()]||[],draf_aktif:mapDraf[p.nama.toLowerCase()]||null}));
  users.push({nama:'Petugas Umum',role:'umum',anggota_tim:mapAng['petugas umum']||[],draf_aktif:null});
  const mapLogP=r=>({id_laporan:r.id_laporan,tanggal:r.tanggal,waktu:r.waktu,nama_tim:r.nama_tim,kategori:r.kategori_giat,sub_kategori:r.sub_kategori,koordinat:r.lokasi_koordinat,lokasi:r.lokasi_teks,keterangan:r.keterangan_detail,link_drive:r.link_foto,link_doc:r.link_laporan_doc,anggota:(r.daftar_anggota||'').toLowerCase(),thumbnail:r.thumbnail||''});
  const mapLogU=r=>({id_laporan:r.id_laporan,tanggal:r.tanggal,waktu:r.waktu,nama_tim:r.nama_kegiatan,kategori:r.kategori,sub_kategori:r.sub_kategori,koordinat:r.lokasi_koordinat,lokasi:r.lokasi_teks,keterangan:r.keterangan_detail,link_drive:r.link_foto,link_doc:r.link_laporan_doc,anggota:(r.daftar_anggota||'').toLowerCase(),thumbnail:r.thumbnail||''});
  return { users, history:[...(lp.data||[]).map(mapLogP),...(lu.data||[]).map(mapLogU)], draftsUmum:(du.data||[]).map(d=>({id_kegiatan:d.id_kegiatan,nama_kegiatan:d.nama_kegiatan,nama_pelapor:d.nama_pelapor,meta:JSON.stringify(d.meta_data||{}),temuan:JSON.stringify(d.temuan_json||[])})), sita:sita.data||[], blacklist:bl.data||[] };
}
async function dbLoadAduan(){ const r=await sb.from('aduan_masyarakat').select('*').order('id',{ascending:true}); return r.data||[]; }
// --- Draft Patroli ---
async function dbSaveDraftPatroli(nama,meta,temuan){ return sb.from('draf_patroli').upsert({id_tim:nama,meta_patroli:meta,list_temuan_json:temuan,updated_at:new Date().toISOString()}); }
async function dbDeleteDraftPatroli(nama){ return sb.from('draf_patroli').delete().eq('id_tim',nama); }
// --- Draft Umum ---
async function dbSaveDraftUmum(o){ return sb.from('draf_petugas_umum').upsert({id_kegiatan:o.id,nama_kegiatan:o.nama_kegiatan,nama_pelapor:o.nama_pelapor,meta_data:o.meta,temuan_json:o.temuan,updated_at:new Date().toISOString()}); }
async function dbDeleteDraftUmum(id){ return sb.from('draf_petugas_umum').delete().eq('id_kegiatan',id); }
// --- Anggota ---
async function dbUpdateAnggota(idTim,arr){ await sb.from('daftar_anggota').delete().eq('id_tim',idTim); if(arr&&arr.length) return sb.from('daftar_anggota').insert(arr.map(n=>({id_tim:idTim,nama_anggota:n}))); return {error:null}; }
// --- Sita & Blacklist ---
async function dbSaveSita(o){ return sb.from('barang_bukti').insert([{id_sita:o.id_sita,tanggal:o.tanggal,waktu:o.waktu,tim:o.tim,jenis_barang:o.jenis,jumlah:o.jumlah,lokasi:o.lokasi,foto_base64:o.foto||''}]); }
async function dbSaveBlacklist(o){ return sb.from('blacklist').insert([{nik:o.nik,nama_pelanggar:o.nama,kategori_pelanggaran:o.kategori,catatan:o.catatan||'-',tanggal_ditindak:o.tanggal}]); }
// --- Aduan ---
async function dbAduanInsert(o){ return sb.from('aduan_masyarakat').insert([{id_tiket:o.id_tiket,tanggal:o.tanggal,waktu:o.waktu,nama:o.nama,no_hp:o.hp,kategori:o.kategori,lokasi:o.lokasi,koordinat:o.koordinat,deskripsi:o.deskripsi,status:'Antrean',foto_base64:o.foto||''}]); }
async function dbAduanStatus(id,status){ return sb.from('aduan_masyarakat').update({status}).eq('id_tiket',id); }
async function dbAduanProgress(id,teks,foto){ return sb.from('aduan_masyarakat').update({status:'Diproses (Tim di Lokasi)',progress_text:teks,progress_foto:foto||''}).eq('id_tiket',id); }
async function dbAduanHapus(id){ return sb.from('aduan_masyarakat').delete().eq('id_tiket',id); }
// --- Log (diisi SETELAH Apps Script selesai buat Drive/Docs) ---
async function dbInsertLogPatroli(rows){ return sb.from('log_patroli').insert(rows); }
async function dbInsertLogUmum(rows){ return sb.from('log_petugas_umum').insert(rows); }
// --- Apps Script (khusus Drive/Docs/Telegram) ---
async function gsPost(payload){ const r=await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(payload)}); return r.json(); }

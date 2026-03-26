// Sakura animation
function buatSakura(){
  for(let i=0;i<15;i++){
    let s=document.createElement('div');
    s.classList.add('sakura');
    s.style.left=Math.random()*100+'vw';
    s.style.animationDuration=(5+Math.random()*5)+'s';
    s.style.opacity=Math.random();
    s.style.transform='scale('+(0.5+Math.random())+')';
    document.body.appendChild(s);
  }
}
buatSakura();

// Monobox functionality
window.onload=function(){
  let u=localStorage.getItem("user");
  if(!u){ loginPage.style.display="flex"; navbar.style.display="none"; }
  else{ loginPage.style.display="none"; navbar.style.display="flex"; showTab('home'); welcomeText.innerText="Halo "+u; }
}

function loginUser(){
  let n=inputNama.value;
  if(n===""){ alert("Isi nama!"); return; }
  localStorage.setItem("user", n);
  loginPage.style.display="none"; navbar.style.display="flex"; showTab('home');
  welcomeText.innerText="Halo "+n;
}
function logout(){ localStorage.clear(); location.reload(); }
function showTab(tab){
  document.querySelectorAll('.tab-content').forEach(t=>t.style.display="none");
  document.getElementById(tab).style.display="block";
  if(tab==="riwayat") tampilRiwayat();
  if(tab==="admin") tampilAdmin();
}

// Pesanan & menu
let pesanan={}, history=JSON.parse(localStorage.getItem("history"))||[];
function tambah(n,h){ pesanan[n]=pesanan[n]||{harga:h,qty:0}; pesanan[n].qty++; render(); }
function kurang(n){ if(pesanan[n]){ pesanan[n].qty--; if(pesanan[n].qty<=0) delete pesanan[n]; } render(); }
function render(){
  let list=document.getElementById("list"); list.innerHTML=""; let total=0;
  for(let i in pesanan){ let p=pesanan[i]; total+=p.harga*p.qty;
    let li=document.createElement("li");
    li.innerHTML=`${i} <div><button onclick="kurang('${i}')">➖</button> ${p.qty} <button onclick="tambah('${i}',${p.harga})">➕</button></div>`;
    list.appendChild(li);
  }
  document.getElementById("total").innerText=total;
}
function resetPesanan(){ pesanan={}; render(); }

// Bayar
function bayarOnline(){
  let total=0;
  for(let i in pesanan) total+=pesanan[i].harga*pesanan[i].qty;
  if(total===0){ alert("Kosong!"); return; }
  popupBayar.style.display="flex";
  totalBayar.innerText="Rp "+total;
  let pembayaran=`CAFE MONOBOX\nTotal: Rp ${total}\nScan untuk bayar`;
  qrBayar.src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent(pembayaran);
}
function tutupPopup(){ popupBayar.style.display="none"; }
function prosesBayar(){
  let total=0, detail="";
  for(let i in pesanan){ let p=pesanan[i]; total+=p.harga*p.qty; detail+=`${i} x${p.qty} = Rp${p.harga*p.qty}\n`; }
  history.push({waktu:new Date().toLocaleString(), detail, total, items: JSON.parse(JSON.stringify(pesanan))});
  localStorage.setItem("history", JSON.stringify(history));
  tampilStruk(detail,total);
  tutupPopup(); pesanan={}; render();
}

// Struk
function tampilStruk(detail,total){ isiStruk.innerHTML=`<p><b>Waktu:</b> ${new Date().toLocaleString()}</p><pre>${detail}</pre><hr><b>Total: Rp ${total}</b>`; popupStruk.style.display="flex"; }
function tutupStruk(){ popupStruk.style.display="none"; }
function printStruk(){ let w=window.open('','width=400,height=600'); w.document.write(isiStruk.innerHTML); w.print(); }
function downloadStruk(){ let blob=new Blob([isiStruk.innerText],{type:"text/plain"}); let link=document.createElement("a"); link.href=URL.createObjectURL(blob); link.download="struk.txt"; link.click(); }

// Riwayat
function tampilRiwayat(){
  historyList.innerHTML="";
  history.forEach(h=>{
    let div=document.createElement("div");
    div.innerHTML=`<b>${h.waktu}</b><br><pre>${h.detail}</pre><b>Total: Rp ${h.total}</b>`;
    historyList.appendChild(div);
  });
}

// Admin
let chart;
function tampilAdmin(){
  let filter=document.getElementById("filterTanggal").value;
  let now=new Date();
  let filtered=history.filter(h=>{
    let t=new Date(h.waktu);
    if(filter==="hari") return t.toDateString()===now.toDateString();
    if(filter==="minggu") return (now-t)/(1000*60*60*24)<=7;
    return true;
  });
  let total=0; filtered.forEach(h=>total+=h.total);
  let jumlah=filtered.length; let rata=jumlah? total/jumlah:0;
  totalUang.innerText="Rp "+total; jumlahTransaksi.innerText=jumlah; rataRata.innerText="Rp "+Math.floor(rata);
  tampilGrafik(filtered); tampilMenuTerlaris(filtered);
}

function tampilGrafik(data){
  let dp={}; data.forEach(h=>{ let t=new Date(h.waktu).toLocaleDateString(); dp[t]=(dp[t]||0)+h.total; });
  if(chart) chart.destroy();
  chart=new Chart(grafikPenjualan,{ type:'bar', data:{ labels:Object.keys(dp), datasets:[{label:'Pendapatan', data:Object.values(dp)}] } });
}

function tampilMenuTerlaris(data){
  let count={};
  data.forEach(h=>{ if(!h.items) return; for(let i in h.items) count[i]=(count[i]||0)+h.items[i].qty; });
  let sorted=Object.entries(count).sort((a,b)=>b[1]-a[1]);
  menuTerlaris.innerHTML="";
  if(sorted.length===0){ menuTerlaris.innerHTML="Belum ada data"; return; }
  sorted.forEach((item,i)=>{ let div=document.createElement("div"); div.innerHTML=`${i+1}. ${item[0]} (${item[1]} terjual)`; menuTerlaris.appendChild(div); });
}

function resetData(){ if(confirm("Hapus semua data?")){ localStorage.removeItem("history"); history=[]; tampilAdmin(); } }
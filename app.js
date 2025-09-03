// TAB NAV
const tabs = document.querySelectorAll('nav .nav-links li');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    const target = tab.getAttribute('data-tab');
    tabContents.forEach(tc=>tc.style.display='none');
    document.getElementById(target).style.display='block';
  });
});

// LOGIN GOOGLE
auth.onAuthStateChanged(user=>{
  if(user){
    document.getElementById('perfilUsername').innerText=`Usuario: ${user.displayName || user.email}`;
    loadUserPlans(user.uid);
  }else{
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
});

// LOGOUT
function logout(){ auth.signOut(); }

// MAPA LEAFLET
const map = L.map('map').setView([20,0],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);

// CREAR PLAN
function crearPlan(){
  const title = document.getElementById('planTitle').value;
  const dest = document.getElementById('planDestination').value;
  const start = document.getElementById('planStart').value;
  const end = document.getElementById('planEnd').value;
  const type = document.getElementById('planType').value;
  const file = document.getElementById('planImage').files[0];
  if(!title || !dest) return alert("Completa los campos");
  const user = auth.currentUser;

  let imageUrl="";
  if(file){
    const storageRef = storage.ref('plans/'+file.name);
    storageRef.put(file).then(()=>storageRef.getDownloadURL().then(url=> savePlan(url)));
  }else{
    savePlan("");
  }

  function savePlan(img){
    const newPlan = {title,dest,start,end,type,user:user.displayName,img,img,userId:user.uid};
    db.ref('plans').push(newPlan);
    alert("Plan creado!");
  }
}

// CARGAR FEED EN TIEMPO REAL
const feedContainer = document.getElementById('feedContainer');
db.ref('plans').on('value',snapshot=>{
  feedContainer.innerHTML='';
  snapshot.forEach(s=>{
    const plan = s.val();
    const div = document.createElement('div');
    div.className='plan-card';
    div.innerHTML=`<h3>${plan.title}</h3>
      <p>${plan.dest} (${plan.start} → ${plan.end})</p>
      <p>Tipo: ${plan.type}</p>
      <p>Creado por: ${plan.user}</p>
      ${plan.img?`<img src="${plan.img}">`:''}
      <button onclick="likePlan('${s.key}')">❤️ Me gusta</button>
      <div id="comments-${s.key}"></div>
      <input type="text" id="commentInput-${s.key}" placeholder="Comentario">
      <button onclick="addComment('${s.key}')">Comentar</button>`;
    feedContainer.appendChild(div);
    loadComments(s.key);
  });
});

// LIKES
function likePlan(planId){
  const userId = auth.currentUser.uid;
  const likeRef = db.ref(`plans/${planId}/likes/${userId}`);
  likeRef.set(true);
}

// COMENTARIOS
function addComment(planId){
  const input = document.getElementById(`commentInput-${planId}`);
  const text = input.value;
  if(!text) return;
  const user = auth.currentUser.displayName;
  db.ref(`plans/${planId}/comments`).push({user,text});
  input.value='';
}
function loadComments(planId){
  const container = document.getElementById(`comments-${planId}`);
  db.ref(`plans/${planId}/comments`).on('value',snap=>{
    container.innerHTML='';
    snap.forEach(s=>{
      const c = s.val();
      const div = document.createElement('div');
      div.innerHTML=`<b>${c.user}</b>: ${c.text}`;
      container.appendChild(div);
    });
  });
}

// FILTRO EXPLORAR
function filterExplorar(){
  const destFilter = document.getElementById('searchDestination').value.toLowerCase();
  const typeFilter = document.getElementById('travelTypeFilter').value;
  db.ref('plans').once('value').then(snapshot=>{
    snapshot.forEach(s=>{
      const plan = s.val();
      if((plan.dest.toLowerCase().includes(destFilter) || !destFilter) && (plan.type===typeFilter || typeFilter==="todos")){
        L.marker([Math.random()*80-40, Math.random()*180-90]).addTo(map).bindPopup(plan.title+" - "+plan.dest);
      }
    });
  });
}

// CARGAR PLANES DEL USUARIO EN PERFIL
function loadUserPlans(uid){
  const container = document.getElementById('userPlans');
  db.ref('plans').orderByChild('userId').equalTo(uid).on('value',snap=>{
    container.innerHTML='';
    snap.forEach(s=>{
      const plan = s.val();
      const div = document.createElement('div');
      div.className='plan-card';
      div.innerHTML=`<h3>${plan.title}</h3><p>${plan.dest} (${plan.start} → ${plan.end})</p>`;
      container.appendChild(div);
    });
  });
}

// CHAT
const chatContainer=document.getElementById('chatContainer');
function sendMessage(){
  const msg=document.getElementById('chatInput').value;
  if(!msg) return;
  const user = auth.currentUser.displayName;
  db.ref('chat').push({user,msg});
  document.getElementById('chatInput').value='';
}
db.ref('chat').on('value',snap=>{
  chatContainer.innerHTML='';
  snap.forEach(s=>{
    const m = s.val();
    const div = document.createElement('div');
    div.className='chat-message';
    div.innerHTML=`<b>${m.user}</b>: ${m.msg}`;
    chatContainer.appendChild(div);
  });
});

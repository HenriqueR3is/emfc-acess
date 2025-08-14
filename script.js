document.addEventListener("DOMContentLoaded", () => {
  // --- INICIALIZAÇÃO E SELEÇÃO DE ELEMENTOS ---
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  const wrapper = document.getElementById("wrapper");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle");
  const navLinks = document.querySelectorAll("#sidebar .nav-link");
  const pages = document.querySelectorAll(".page-content");
  const pageTitleHeader = document.getElementById("page-title-header");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const loginModalEl = document.getElementById('loginModal');
  const loginModal = new bootstrap.Modal(loginModalEl);

  // --- FUNÇÕES GLOBAIS (DENTRO DO ESCOPO) ---
  window.deletarProva = function(id) {
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      db.collection("provas").doc(id).delete();
    }
  }

  window.deletarAviso = function(id) {
    if (confirm("Tem certeza que deseja apagar este aviso?")) {
      db.collection("avisos").doc(id).delete();
    }
  }

  window.editarAviso = function(id, tituloAtual, conteudoAtual) {
    const novoTitulo = prompt("Editar Título:", tituloAtual);
    if (novoTitulo === null) return;
    const novoConteudo = prompt("Editar Conteúdo:", conteudoAtual);
    if (novoConteudo === null) return;
    if (novoTitulo && novoConteudo) {
      db.collection("avisos").doc(id).update({
        titulo: novoTitulo,
        conteudo: novoConteudo
      });
    }
  }

  // --- FUNÇÃO DE FEEDBACK (TOASTS) ---
  function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return; // Não quebra se o container não existir
    const toastId = 'toast-' + Date.now();
    const toastColorClass = type === 'success' ? 'text-bg-success' : 'text-bg-danger';
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${toastColorClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
  }

  // --- LÓGICA DA INTERFACE (SIDEBAR E NAVEGAÇÃO) ---
  function toggleSidebar() { /* ... código da sidebar sem alterações ... */ }
  sidebarToggleBtn.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar);
  function navigateTo(pageId) { /* ... código de navegação sem alterações ... */ }
  navLinks.forEach(link => { link.addEventListener("click", (e) => { e.preventDefault(); navigateTo(link.getAttribute("data-page")); }); });
  navigateTo('home');

  // --- LÓGICA DE AUTENTICAÇÃO (LOGIN/LOGOUT) ---
  const loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        loginModal.hide();
        showToast('Login realizado com sucesso! Bem-vindo, Admin.');
      })
      .catch((error) => {
        let friendlyMessage = "Credenciais incorretas. Verifique seu email e senha.";
        showToast(friendlyMessage, 'danger');
      });
  });

  auth.onAuthStateChanged(user => {
    const adminElements = document.querySelectorAll(".admin-only");
    const adminLoginArea = document.querySelector(".admin-login-area");
    const displayStyle = user ? 'block' : 'none';
    adminElements.forEach(el => el.style.display = displayStyle);
    if (user) {
      adminLoginArea.innerHTML = `<button class="btn btn-light w-100" id="logout-btn"><i class="fas fa-sign-out-alt me-2"></i>Sair</button>`;
      document.getElementById("logout-btn").addEventListener('click', () => auth.signOut());
    } else {
      adminLoginArea.innerHTML = `<button class="btn btn-login-admin w-100" data-bs-toggle="modal" data-bs-target="#loginModal"><i class="fas fa-user-shield me-2"></i>Acesso Admin</button>`;
    }
  });

  // --- LÓGICA DO CRUD DE PROVAS/TRABALHOS ---
  const addProvaBtn = document.getElementById("add-prova-btn");
  addProvaBtn.addEventListener("click", () => {
    const titulo = document.getElementById("titulo-prova").value;
    const data = document.getElementById("data-prova").value;
    const conteudo = document.getElementById("conteudo-prova").value;

    if (titulo && data) {
      db.collection("provas").add({
        titulo: titulo,
        data: data,
        conteudo: conteudo,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        document.getElementById("titulo-prova").value = "";
        document.getElementById("data-prova").value = "";
        document.getElementById("conteudo-prova").value = "";
      }).catch(error => console.error("Erro ao adicionar: ", error));
    } else {
      alert("Por favor, preencha pelo menos o título e a data.");
    }
  });

 db.collection("provas").orderBy("data", "asc").onSnapshot(snapshot => {
    const listaProvas = document.getElementById("lista-provas");
    listaProvas.innerHTML = "";
    if (snapshot.empty) {
      listaProvas.innerHTML = "<p class='text-center text-muted'>Nenhuma avaliação cadastrada no momento.</p>";
      return;
    }
    snapshot.forEach(doc => {
      const prova = doc.data();
      let dataFormatada = 'Data não definida';
      if (prova.data) {
        const dataObj = new Date(prova.data + 'T00:00:00');
        if (!isNaN(dataObj.getTime())) {
          dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
        } else {
          dataFormatada = 'Data em formato inválido';
        }
      }
      const cardHtml = `
        <div class="card shadow-sm mb-3">
          <div class="card-header d-flex justify-content-between align-items-center bg-white">
            <h5 class="card-title mb-0" style="color: var(--cor-vinho-principal);">${prova.titulo}</h5>
            <div class="admin-only" style="display: ${auth.currentUser ? 'block' : 'none'};">
              <button class="btn btn-sm btn-outline-danger" onclick="deletarProva('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted"><strong>Data:</strong> ${dataFormatada}</h6>
            <p class="card-text">${(prova.conteudo || 'Sem conteúdo definido.').replace(/\n/g, '<br>')}</p>
          </div>
        </div>`;
      listaProvas.innerHTML += cardHtml;
    });
  });

  // --- LÓGICA DO CRUD DE AVISOS ---
  const addAvisoBtn = document.getElementById("add-aviso-btn");
  addAvisoBtn.addEventListener("click", () => {
  const titulo = document.getElementById("titulo-aviso").value;
  const conteudo = document.getElementById("conteudo-aviso").value;

  if (titulo && conteudo) {
    db.collection("avisos").add({
      titulo: titulo,
      conteudo: conteudo,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      document.getElementById("titulo-aviso").value = "";
      document.getElementById("conteudo-aviso").value = "";
    });
  } else {
    alert("Por favor, preencha o título e o conteúdo do aviso.");
  }
});

  db.collection("avisos").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    const listaAvisos = document.getElementById("lista-avisos");
    listaAvisos.innerHTML = "";
    if (snapshot.empty) {
      listaAvisos.innerHTML = "<p class='text-center text-muted'>Nenhum aviso publicado.</p>";
    }
    snapshot.forEach(doc => {
      const aviso = doc.data();
      const dataAviso = aviso.createdAt ? aviso.createdAt.toDate().toLocaleDateString('pt-BR') : 'Data indisponível';
      const cardHtml = `
        <div class="card card-aviso mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title">${aviso.titulo}</h5>
              <div class="admin-only" style="display: ${auth.currentUser ? 'block' : 'none'};">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editarAviso('${doc.id}', \`${aviso.titulo}\`, \`${aviso.conteudo || ''}\`)"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletarAviso('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <p class="card-text">${(aviso.conteudo || '').replace(/\n/g, '<br>')}</p>
            <small class="text-muted">Publicado em: ${dataAviso}</small>
          </div>
        </div>`;
      listaAvisos.innerHTML += cardHtml;
    });
  });
});

    // Reavalia os controles de admin após renderizar
    if (auth.currentUser) {
      const adminElements = document.querySelectorAll(".admin-only");
      adminElements.forEach(el => el.style.display = 'block');
    }
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Após redesenhar os cards, verificamos se o usuário está logado
    // e garantimos que os controles de admin nos novos cards fiquem visíveis.
    if (auth.currentUser) {
      const adminElements = document.querySelectorAll(".admin-only");
      adminElements.forEach(el => el.style.display = 'block');
    }
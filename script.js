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
  
  const listaProvas = document.getElementById("lista-provas");
  const listaAvisos = document.getElementById("lista-avisos");
  const listaMateriais = document.getElementById("lista-materiais");

  // --- FUNÇÕES DE FEEDBACK E INTERFACE ---
  function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
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

  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.body.classList.toggle("sidebar-mobile-open");
    } else {
      wrapper.classList.toggle("sidebar-collapsed");
    }
  }

  function navigateTo(pageId) {
    pages.forEach(page => page.style.display = 'none');
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.style.display = 'block';
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) pageTitleHeader.textContent = activeLink.textContent.trim();
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) link.classList.add('active');
    });
    if (window.innerWidth <= 768) {
      document.body.classList.remove("sidebar-mobile-open");
    }
  }

  // --- LÓGICA DE EVENTOS DA INTERFACE (SIDEBAR E NAVEGAÇÃO) ---
  sidebarToggleBtn.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar);
  navLinks.forEach(link => { 
    link.addEventListener("click", (e) => { 
      e.preventDefault(); 
      navigateTo(link.getAttribute("data-page")); 
    }); 
  });
  
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

  // =============================================================
  // ===== OUVINTES DE EVENTOS PARA OS CARDS (VERSÃO SEGURA) =====
  // =============================================================

  // --- Ouvinte para a lista de PROVAS ---
  if(listaProvas) {
    listaProvas.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const cardHeader = target.closest('.card-header');
      if (!cardHeader) return;

      const id = cardHeader.dataset.id;
      const titulo = cardHeader.dataset.titulo;
      const data = cardHeader.dataset.data;
      const conteudo = cardHeader.dataset.conteudo;

      if (target.classList.contains('btn-delete-prova')) {
        if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
          db.collection("provas").doc(id).delete();
        }
      }
      if (target.classList.contains('btn-edit-prova')) {
        const novoTitulo = prompt("Editar Título da Avaliação:", titulo);
        if (novoTitulo === null) return;
        const novaData = prompt("Editar Data (AAAA-MM-DD):", data);
        if (novaData === null) return;
        const novoConteudo = prompt("Editar Conteúdo:", conteudo);
        if (novoConteudo === null) return;
        if (novoTitulo && novaData) {
          db.collection("provas").doc(id).update({
            titulo: novoTitulo, data: novaData, conteudo: novoConteudo
          });
        }
      }
    });
  }
  
  // --- Ouvinte para a lista de AVISOS ---
  if(listaAvisos) {
    listaAvisos.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const cardBody = target.closest('.card-body');
      if(!cardBody) return;
      const id = cardBody.dataset.id;
      const titulo = cardBody.dataset.titulo;
      const conteudo = cardBody.dataset.conteudo;
      if (target.classList.contains('btn-delete-aviso')) {
        if (confirm("Tem certeza que deseja apagar este aviso?")) {
          db.collection("avisos").doc(id).delete();
        }
      }
      if (target.classList.contains('btn-edit-aviso')) {
        const novoTitulo = prompt("Editar Título:", titulo);
        if (novoTitulo === null) return;
        const novoConteudo = prompt("Editar Conteúdo:", conteudo);
        if (novoConteudo === null) return;
        if (novoTitulo && novoConteudo) {
          db.collection("avisos").doc(id).update({
            titulo: novoTitulo,
            conteudo: novoConteudo
          });
        }
      }
    });
  }

  // --- Ouvinte para a lista de MATERIAIS ---
  if(listaMateriais) {
    listaMateriais.addEventListener('click', (e) => {
      const target = e.target.closest('button.btn-delete-material');
      if (!target) return;

      const docId = target.dataset.id;
      const storagePath = target.dataset.path;

      if (confirm("Isso irá apagar o arquivo permanentemente. Deseja continuar?")) {
        firebase.storage().ref(storagePath).delete().then(() => {
          db.collection("materiais").doc(docId).delete().then(() => {
            showToast("Material deletado com sucesso.");
          });
        }).catch(error => {
          console.error("Erro ao deletar arquivo: ", error);
          showToast("Falha ao deletar o material.", "danger");
        });
      }
    });
  }


  // --- LÓGICA DO CRUD DE PROVAS/TRABALHOS ---
  if(listaProvas) {
    db.collection("provas").orderBy("data", "asc").onSnapshot(snapshot => {
      listaProvas.innerHTML = "";
      if (snapshot.empty) {
        listaProvas.innerHTML = "<p class='text-center text-muted'>Nenhuma avaliação cadastrada.</p>";
        return;
      }
      snapshot.forEach(doc => {
        const prova = doc.data();
        let dataFormatada = 'Data inválida';
        if (prova.data) {
          const dataObj = new Date(prova.data + 'T00:00:00');
          if (!isNaN(dataObj.getTime())) {
            dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
          }
        }
        const cardHtml = `
          <div class="card shadow-sm mb-3">
            <div class="card-header d-flex justify-content-between align-items-start" 
                 data-id="${doc.id}"
                 data-titulo="${(prova.titulo || '').replace(/"/g, '&quot;')}"
                 data-data="${prova.data || ''}"
                 data-conteudo="${(prova.conteudo || '').replace(/"/g, '&quot;')}">
              <h5 class="card-title flex-grow-1">${prova.titulo}</h5>
              <div class="admin-only d-flex" style="display: ${auth.currentUser ? 'flex' : 'none'};">
                <button class="btn btn-sm btn-outline-primary me-2 btn-edit-prova"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete-prova"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted"><strong>Data:</strong> ${dataFormatada}</h6>
              <p class="card-text">${(prova.conteudo || 'Sem detalhes.').replace(/\n/g, '<br>')}</p>
            </div>
          </div>`;
        listaProvas.innerHTML += cardHtml;
      });
    });
  }

  // --- LÓGICA DO CRUD DE AVISOS ---
  if(listaAvisos) {
    db.collection("avisos").orderBy("createdAt", "desc").onSnapshot(snapshot => {
      listaAvisos.innerHTML = "";
      if (snapshot.empty) {
        listaAvisos.innerHTML = "<p class='text-center text-muted'>Nenhum aviso publicado.</p>";
      }
      snapshot.forEach(doc => {
        const aviso = doc.data();
        const dataAviso = aviso.createdAt ? aviso.createdAt.toDate().toLocaleDateString('pt-BR') : '';
        const cardHtml = `
          <div class="card card-aviso mb-3">
            <div class="card-body"
                 data-id="${doc.id}"
                 data-titulo="${(aviso.titulo || '').replace(/"/g, '&quot;')}"
                 data-conteudo="${(aviso.conteudo || '').replace(/"/g, '&quot;')}">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title flex-grow-1">${aviso.titulo}</h5>
                <div class="admin-only d-flex" style="display: ${auth.currentUser ? 'flex' : 'none'};">
                  <button class="btn btn-sm btn-outline-primary me-2 btn-edit-aviso"><i class="fas fa-pencil-alt"></i></button>
                  <button class="btn btn-sm btn-outline-danger btn-delete-aviso"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
              <p class="card-text">${(aviso.conteudo || '').replace(/\n/g, '<br>')}</p>
              <small class="text-muted">Publicado em: ${dataAviso}</small>
            </div>
          </div>`;
        listaAvisos.innerHTML += cardHtml;
      });
    });
  }

  // --- LÓGICA CRUD DE MATERIAIS ---
  if(listaMateriais) {
    db.collection("materiais").orderBy("createdAt", "desc").onSnapshot(snapshot => {
      listaMateriais.innerHTML = "";
      if (snapshot.empty) {
        listaMateriais.innerHTML = "<p class='text-center text-muted'>Nenhum material de estudo disponível.</p>";
      }
      snapshot.forEach(doc => {
        const material = doc.data();
        const cardHtml = `
          <div class="card shadow-sm mb-3">
            <div class="card-body d-flex justify-content-between align-items-start">
              <div>
                <h5 class="card-title">${material.titulo}</h5>
                <p class="card-text mb-1">${(material.descricao || '').replace(/"/g, '&quot;')}</p>
                <small class="text-muted">Arquivo: ${material.fileName}</small>
              </div>
              <div class="d-flex align-items-center">
                <a href="${material.downloadURL}" target="_blank" class="btn btn-outline-success me-2">
                  <i class="fas fa-download me-1"></i>Baixar
                </a>
                <div class="admin-only" style="display: ${auth.currentUser ? 'block' : 'none'};">
                  <button class="btn btn-sm btn-outline-danger btn-delete-material" 
                          data-id="${doc.id}" 
                          data-path="${material.storagePath}">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>`;
        listaMateriais.innerHTML += cardHtml;
      });
      // Reavalia a visibilidade dos botões de admin
      if (auth.currentUser) {
        document.querySelectorAll("#lista-materiais .admin-only").forEach(el => el.style.display = 'block');
      }
    });
  }

  // --- LÓGICA PARA ADICIONAR CONTEÚDO ---

  // --- ADICIONAR PROVA ---
  const addProvaBtn = document.getElementById("add-prova-btn");
  if(addProvaBtn) {
    addProvaBtn.addEventListener("click", () => {
      const titulo = document.getElementById("titulo-prova").value;
      const data = document.getElementById("data-prova").value;
      const conteudo = document.getElementById("conteudo-prova").value;
      if (titulo && data) {
        db.collection("provas").add({
          titulo: titulo, data: data, conteudo: conteudo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          document.getElementById("titulo-prova").value = "";
          document.getElementById("data-prova").value = "";
          document.getElementById("conteudo-prova").value = "";
          showToast("Avaliação adicionada com sucesso!");
        });
      } else { alert("Por favor, preencha pelo menos o título e a data."); }
    });
  }

  // --- ADICIONAR AVISO ---
  const addAvisoBtn = document.getElementById("add-aviso-btn");
  if(addAvisoBtn) {
    addAvisoBtn.addEventListener("click", () => {
      const titulo = document.getElementById("titulo-aviso").value;
      const conteudo = document.getElementById("conteudo-aviso").value;
      if (titulo && conteudo) {
        db.collection("avisos").add({
          titulo: titulo, conteudo: conteudo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          document.getElementById("titulo-aviso").value = "";
          document.getElementById("conteudo-aviso").value = "";
          showToast("Aviso publicado com sucesso!");
        });
      } else { alert("Por favor, preencha o título e o conteúdo do aviso."); }
    });
  }

  // --- ADICIONAR MATERIAL ---
  const addMaterialBtn = document.getElementById("add-material-btn");
  if(addMaterialBtn) {
    const arquivoInput = document.getElementById("arquivo-material");
    const progressBar = document.getElementById("upload-progress-bar");
    const progressBarInner = progressBar.querySelector('.progress-bar');

    addMaterialBtn.addEventListener("click", () => {
      const titulo = document.getElementById("titulo-material").value;
      const descricao = document.getElementById("descricao-material").value;
      const arquivo = arquivoInput.files[0];

      if (!titulo || !arquivo) {
        alert("Por favor, preencha o título e selecione um arquivo.");
        return;
      }

      // Cria uma referência para o arquivo no Firebase Storage
      const storageRef = firebase.storage().ref(`materiais/${Date.now()}_${arquivo.name}`);
      // Inicia o upload
      const task = storageRef.put(arquivo);

      // Monitora o progresso do upload
      task.on('state_changed',
        (snapshot) => {
          // Atualiza a barra de progresso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.display = 'block';
          progressBarInner.style.width = progress + '%';
          progressBarInner.textContent = Math.round(progress) + '%';
        },
        (error) => {
          console.error("Erro no upload: ", error);
          showToast("Falha no envio do arquivo.", "danger");
          progressBar.style.display = 'none';
        },
        () => {
          // Upload concluído com sucesso
          task.snapshot.ref.getDownloadURL().then((downloadURL) => {
            db.collection("materiais").add({
              titulo: titulo,
              descricao: descricao,
              downloadURL: downloadURL,
              fileName: arquivo.name,
              storagePath: storageRef.fullPath,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast("Material enviado com sucesso!");
            // Limpa o formulário
            document.getElementById("titulo-material").value = "";
            document.getElementById("descricao-material").value = "";
            arquivoInput.value = "";
            progressBar.style.display = 'none';
          });
        }
      );
    });
  }

  // --- INICIALIZAÇÃO DA PÁGINA ---
  navigateTo('home');
});
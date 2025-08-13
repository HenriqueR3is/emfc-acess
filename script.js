document.addEventListener("DOMContentLoaded", () => {
  // --- SELEÇÃO DOS ELEMENTOS DO HTML ---
  const wrapper = document.getElementById("wrapper");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle");
  const navLinks = document.querySelectorAll("#sidebar .nav-link");
  const pages = document.querySelectorAll(".page-content");
  const pageTitleHeader = document.getElementById("page-title-header");

  // --- LÓGICA PARA RECOLHER A SIDEBAR ---
  sidebarToggleBtn.addEventListener("click", () => {
    wrapper.classList.toggle("sidebar-collapsed");
  });

  // --- FUNÇÃO ÚNICA E COMPLETA PARA NAVEGAÇÃO ---
  function navigateTo(pageId) {
    // 1. Esconde todas as seções de conteúdo
    pages.forEach(page => {
      page.style.display = 'none';
    });

    // 2. Mostra apenas a seção de conteúdo correta
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.style.display = 'block';
    }

    // 3. Atualiza o título no cabeçalho principal
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
      pageTitleHeader.textContent = activeLink.textContent;
    }

    // 4. Atualiza qual link está "ativo" (marcado) na sidebar
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      }
    });
  }

  // --- CONFIGURAÇÃO INICIAL DOS EVENTOS ---

  // Adiciona o evento de clique para cada link da sidebar
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Impede que o link recarregue a página
      const pageId = link.getAttribute("data-page");
      navigateTo(pageId);
    });
  });

  // Define a página inicial que deve ser exibida ao carregar o site
  navigateTo('home');
});
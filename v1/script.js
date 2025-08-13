// Adicionado para evitar que o form de login recarregue a página
document.getElementById("login-form").addEventListener("submit", (e) => e.preventDefault());

// LOGIN
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth
    .signInWithEmailAndPassword(email, pass)
    .catch((error) => alert(error.message));
});

document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut();
});

// MONITORAR LOGIN
auth.onAuthStateChanged((user) => {
  const loginSection = document.getElementById("login-section");
  const crudSection = document.getElementById("crud-section");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    loginSection.style.display = "none";
    crudSection.style.display = "block";
    logoutBtn.style.display = "block";
  } else {
    loginSection.style.display = "flex";
    crudSection.style.display = "none";
    logoutBtn.style.display = "none";
  }
});

// ADICIONAR PROVA
document.getElementById("add-btn").addEventListener("click", () => {
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;

  if (titulo && data) {
    db.collection("provas").add({ titulo, data });
    document.getElementById("titulo").value = "";
    document.getElementById("data").value = "";
  }
});

// LISTAR EM TEMPO REAL
db.collection("provas")
  .orderBy("data")
  .onSnapshot((snapshot) => {
    const lista = document.getElementById("lista-provas");
    lista.innerHTML = "";
    snapshot.forEach((doc) => {
      const tarefa = doc.data();

      // Formata a data para o padrão brasileiro (dd/mm/aaaa)
      const dataObj = new Date(tarefa.data + 'T00:00:00'); // Corrige fuso horário
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');

      const cardHtml = `
        <div class="card shadow-sm mb-3">
          <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h5 class="card-title mb-1">${tarefa.titulo}</h5>
              <p class="card-text text-muted">Prazo: ${dataFormatada}</p>
            </div>
            <div class="actions-container">
              <button class="btn btn-outline-primary btn-sm edit-btn" data-id="${doc.id}">✏️ Editar</button>
              <button class="btn btn-outline-danger btn-sm del-btn" data-id="${doc.id}">🗑️ Excluir</button>
            </div>
          </div>
        </div>
      `;
      lista.innerHTML += cardHtml;
    });

    addEventListenersToButtons();
  });

function addEventListenersToButtons() {
  // Botões de Deletar
  document.querySelectorAll('.del-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        db.collection("provas").doc(id).delete();
      }
    });
  });

  // Botões de Editar
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      const docRef = db.collection("provas").doc(id);
      const docSnap = await docRef.get();
      const dadosAtuais = docSnap.data();

      const novoTitulo = prompt("Novo título:", dadosAtuais.titulo);
      if (novoTitulo === null) return;

      const novaData = prompt("Nova data (AAAA-MM-DD):", dadosAtuais.data);
      if (novaData === null) return;

      if (novoTitulo && novaData) {
        docRef.update({ titulo: novoTitulo, data: novaData });
      }
    });
  });
}
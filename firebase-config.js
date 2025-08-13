// Coloque os dados do seu Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyDoR_-xEU7mqwwN8i-oqS4o2iyqA9BeEwc",
  authDomain: "emfc-cc081.firebaseapp.com",
  projectId: "emfc-cc081",
  storageBucket: "emfc-cc081.firebasestorage.app",
  messagingSenderId: "476861079771",
  appId: "1:476861079771:web:7f49c079171d8762ed2cfe",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// 🔹 Variáveis globais
const auth = firebase.auth();
const db = firebase.firestore();

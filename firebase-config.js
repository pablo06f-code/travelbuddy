// Configuración Firebase versión compat (v8) lista para usar
const firebaseConfig = {
    apiKey: "AIzaSyAFMclK8oLnNN128gZKkk5ahrLjwP1RQx8",
    authDomain: "travelbuddy-d4caf.firebaseapp.com",
    projectId: "travelbuddy-d4caf",
    storageBucket: "travelbuddy-d4caf.appspot.com",
    messagingSenderId: "1086574018430",
    appId: "1:1086574018430:web:e1d888dc8dc3d66083bd2f",
    measurementId: "G-0CYS7Z50B7"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Inicializar servicios
  const auth = firebase.auth();
  const db = firebase.database();
  const storage = firebase.storage();
  
"use strict";

// Imports from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// DOM elements
const domEmail = document.getElementById("user-form").elements["email"];
const domPassword = document.getElementById("user-form").elements["password"];
const domForm = document.getElementById("user-form");
const domSubmit = document.getElementById("submit-button");
const domError = document.getElementById("error");

const firebaseConfig = {

    apiKey: "AIzaSyAhxHwssGtnl9xg7NerbBBhyZ6oT7HY5QU",
  
    authDomain: "themeparkticketsite.firebaseapp.com",
  
    projectId: "themeparkticketsite",
  
    storageBucket: "themeparkticketsite.firebasestorage.app",
  
    messagingSenderId: "957138116735",
  
    appId: "1:957138116735:web:ae5bda556639a0092b1f4a"
  
  };
  

// Firebase setup
const firebaseApp = initializeApp(firebaseCfg);
const firebaseAuth = getAuth();

// Listeners
domForm.addEventListener("change", () => {
  domSubmit.disabled = !domForm.checkValidity();
});

domForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sign_up();
});

// Sign-up function
async function sign_up() {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, domEmail.value, domPassword.value);
    const token = await userCredential.user.getIdToken(true);

    await fetch("/users/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });

    window.location.replace("/users/welcome");

  } catch (error) {
    let errMsg;
    switch (error.code) {
      case "auth/email-already-in-use":
        errMsg = "Email already in use.";
        break;
      case "auth/invalid-email":
        errMsg = "Invalid email.";
        break;
      case "auth/weak-password":
        errMsg = "Password is too weak.";
        break;
      default:
        errMsg = "Something went wrong. " + error.code;
    }
    domError.textContent = errMsg;
  }
}

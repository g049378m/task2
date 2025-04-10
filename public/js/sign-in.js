"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAhxHwssGtnl9xg7NerbBBhyZ6oT7HY5QU",
  authDomain: "themeparkticketsite.firebaseapp.com",
  projectId: "themeparkticketsite",
  storageBucket: "themeparkticketsite.appspot.com",
  messagingSenderId: "957138116735",
  appId: "1:957138116735:web:ae5bda556639a0092b1f4a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const form = document.getElementById("signin-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const userCred = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    const token = await userCred.user.getIdToken();

    await fetch("/users/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });

    window.location.replace("/users/welcome");

  } catch (err) {
    errorMsg.textContent = "Login failed: " + err.message;
  }
});

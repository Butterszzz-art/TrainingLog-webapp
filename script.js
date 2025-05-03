const serverUrl = 'https://traininglog-backend.onrender.com';
let currentUser = null;

// LOGIN
async function startLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please fill in both username and password.");
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      currentUser = username;
      localStorage.setItem("fitnessAppUser", username);
      document.getElementById("userDisplay").textContent = username;
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("appContainer").style.display = "block";
      alert("Logged in successfully!");
    } else {
      alert(result.message || "Login failed.");
    }
  } catch (error) {
    console.error('Login error:', error);
    alert("Error connecting to server.");
  }
}

// SIGNUP
async function startSignup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please fill in both username and password.");
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      alert("Account created successfully! You can now log in.");
    } else {
      alert(result.message || "Signup failed.");
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert("Error connecting to server.");
  }
}

// LOGOUT (Optional)
function logout() {
  localStorage.removeItem("fitnessAppUser");
  location.reload();
}

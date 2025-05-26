const form = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const resultBox = document.getElementById("resultBox");

imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const file = imageInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  resultBox.innerText = "Analyzing...";

  try {
    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    resultBox.innerText = data.result || "Analysis failed.";
  } catch (error) {
    console.error("Error:", error);
    resultBox.innerText = "Server error.";
  }
});


// login page start
// document.getElementById('loginForm').addEventListener('submit', function (e) {
//   e.preventDefault();

//   const inputEmail = document.getElementById('email').value;
//   const inputPassword = document.getElementById('password').value;

//   const storedEmail = localStorage.getItem('userEmail');
//   const storedPassword = localStorage.getItem('userPassword');

//   if (inputEmail === storedEmail && inputPassword === storedPassword) {
//     // Show success notification
//     const msg = document.createElement('div');
//     msg.textContent = 'Login Successfully!';
//     msg.style.position = 'fixed';
//     msg.style.top = '20px';
//     msg.style.left = '50%';
//     msg.style.transform = 'translateX(-50%)';
//     msg.style.backgroundColor = '#28a745';
//     msg.style.color = 'white';
//     msg.style.padding = '10px 20px';
//     msg.style.borderRadius = '5px';
//     msg.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
//     document.body.appendChild(msg);

//     // Redirect to home after 2 seconds
//     setTimeout(() => {
//       window.location.href = 'home.html';
//     }, 2000);
//   } else {
//     alert('Invalid email or password');
//   }
// });


// document.getElementById("loginForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const loginEmail = document.getElementById("loginEmail").value;
//   const loginPassword = document.getElementById("loginPassword").value;

//   const storedEmail = localStorage.getItem("userEmail");
//   const storedPassword = localStorage.getItem("userPassword");

//   if (loginEmail === storedEmail && loginPassword === storedPassword) {
//     // Show notification
//     const msg = document.createElement('div');
//     msg.textContent = 'Login Successfully!';
//     msg.style.position = 'fixed';
//     msg.style.top = '20px';
//     msg.style.left = '50%';
//     msg.style.transform = 'translateX(-50%)';
//     msg.style.backgroundColor = '#28a745';
//     msg.style.color = 'white';
//     msg.style.padding = '10px 20px';
//     msg.style.borderRadius = '5px';
//     msg.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
//     document.body.appendChild(msg);

//     setTimeout(() => {
//       window.location.href = 'index.html';
//     }, 2000);
//   } else {
//     alert("Invalid email or password.");
//   }
// });



// login page end


// register page start
// document.getElementById("registerForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;
//   const confirmPassword = document.getElementById("confirmPassword").value;

//   if (password !== confirmPassword) {
//     alert("Passwords do not match!");
//     return;
//   }

//   // Save to localStorage
//   localStorage.setItem("userEmail", email);
//   localStorage.setItem("userPassword", password);

//   // Show notification
//   const msg = document.createElement('div');
//   msg.textContent = 'Registered Successfully!';
//   msg.style.position = 'fixed';
//   msg.style.top = '20px';
//   msg.style.left = '50%';
//   msg.style.transform = 'translateX(-50%)';
//   msg.style.backgroundColor = '#28a745';
//   msg.style.color = 'white';
//   msg.style.padding = '10px 20px';
//   msg.style.borderRadius = '5px';
//   msg.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
//   document.body.appendChild(msg);

//   // Redirect after 2s
//   setTimeout(() => {
//     window.location.href = 'index.html';
//   }, 2000);
// });
// // register page end
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('fileInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    if (fileInput.files.length === 0) {
        alert('Please select an image first');
        return;
    }
    
    formData.append('file', fileInput.files[0]);
    resultsDiv.innerHTML = '';
    loadingDiv.style.display = 'block';
    
    fetch('/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loadingDiv.style.display = 'none';
        
        if (data.error) {
            resultsDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        // Display results
        let resultHTML = `
            <div class="card">
                <div class="card-header">
                    <h4>Analysis Results</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h5>Original Image</h5>
                            <img src="/static/uploads/${data.filename}" class="img-fluid" alt="Uploaded Image">
                        </div>
                        <div class="col-md-6">
                            <h5>Analysis Data</h5>
                            <table class="table">
                                <tr>
                                    <th>ELA Score</th>
                                    <td>${data.ela_score.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>CNN Prediction</th>
                                    <td>${(data.cnn_prediction * 100).toFixed(2)}% fake</td>
                                </tr>
                                <tr class="${data.verdict === 'Fake' ? 'table-danger' : 'table-success'}">
                                    <th>Final Verdict</th>
                                    <td><strong>${data.verdict}</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultsDiv.innerHTML = resultHTML;
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        resultsDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
});

fetch('/analyze', {
    method: 'POST',
    body: formData
})
.then(response => {
    if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
    }
    return response.json();
})
.then(data => {
    console.log("Success:", data);
    // Display results...
})
.catch(error => {
    console.error("Error:", error);
    alert("Analysis failed. Check console for details.");
});


document.getElementById('cnn-result').innerHTML = `CNN Confidence: ${(data.cnn_prediction * 100).toFixed(2)}%`;



// script.js
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('loading-spinner').style.display = 'block';
    // ... rest of your code
});

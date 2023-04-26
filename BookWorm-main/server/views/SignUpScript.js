   const signupForm = document.getElementById("signupForm");
   const signupBtn = document.getElementById("signupBtn");

   signupBtn.addEventListener("click", function(event) {
     event.preventDefault();

     const name = document.getElementById("name").value;
     const email = document.getElementById("email").value;
     const password = document.getElementById("password").value;

     if (name === "" || email === "" || password === "") {
       alert("Please fill out all fields.");
       return;
     }

     window.location.href = "termsAgreement2.html";
   });
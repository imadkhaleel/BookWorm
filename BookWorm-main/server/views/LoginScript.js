
//////login button//////
const loginLink = document.getElementById('login-button');
loginLink.addEventListener('click', function(event) {
  event.preventDefault(); // prevent the form from submitting
  document.body.style.opacity = 0;
  setTimeout(function() {
    window.location.href = 'termsAgreement.html';
  }, 1000);
});
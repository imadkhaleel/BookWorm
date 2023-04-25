
//////AgreeButton/////
const acceptLink = document.getElementById('accept-button');
loginLink.addEventListener('click', function(event) {
  document.body.style.opacity = 0;
  setTimeout(function() {
    window.location.href = 'Account.html';
  }, 1000);
});
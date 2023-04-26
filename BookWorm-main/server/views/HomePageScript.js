




/////Browse Button/////////////////////////
const browseLink = document.getElementById('browse-link');
browseLink.addEventListener('click', function(){
document.body.style.opacity = 0;
setTimeout(function(){
window.location.href = 'Search.html'


}, 1000);
});


////////////////Login Button/////////////////////
const loginLink = document.getElementById('login-link')
browseLink.addEventListener('click', function(){
document.body.style.opacity = 0;
setTimeout(function(){
window.location.href = "Login.html"
},1000);


});


//////////////Sign Up Button///////////////////
const signUp = document.getElementById('signUp-link')
browseLink.addEventListener('click', function(){
document.body.style.opacity = 0;
setTimeout(function(){
window.location.href = "SignUp.html"
},1000);
});




///////////////About///////////////////////
const About = document.getElementById('about-link')
browseLink.addEventListener('click', function(){
window.location.href = "About.html"


})


/////////////Team/////////////////////////
const Team = document.getElementById('about-link')
browseLink.addEventListener('click', function(){
window.location.href = "teamPage.html"


})

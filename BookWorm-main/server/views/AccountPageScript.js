const readingListHeading = document.querySelector("h2");
const flexBox = document.querySelector(".flex-box");


// Get the Book Request link and add an event listener to it
const bookRequestLink = document.getElementById("request-link");
bookRequestLink.addEventListener("click", function() {
 // Change the text of the Reading List heading to Book Request
 readingListHeading.textContent = "Book Request";


 // Add a fresh flex box and delete old one
 const newFlexBox = document.createElement("div");
 newFlexBox.classList.add("flex-box");
 const newTextInput = document.createElement("input");
 newTextInput.setAttribute("type", "text");
 newTextInput.setAttribute("placeholder", "Type here");
 newFlexBox.appendChild(newTextInput);
 document.body.appendChild(newFlexBox);
 flexBox.parentNode.removeChild(flexBox);
});




////////////browse///////////////
const browseLink = document.getElementById('browse-link');
browseLink.addEventListener('click', function(){
document.body.style.opacity = 0;
setTimeout(function(){
window.location.href = 'Search.html'


}, 1000);
});

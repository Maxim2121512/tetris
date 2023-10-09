
let registrationForm = document.getElementById("registrationForm");
let nicknameInput = document.getElementById("nickname");
let prevNickname = localStorage.getItem("tetris.nickname");

if (prevNickname) {
    nicknameInput.value = prevNickname;
}


registrationForm.addEventListener("submit", function(event){
    let nickname = nicknameInput.value;
    if (nickname.trim() !== "") {
        localStorage.setItem("tetris.nickname", nickname);
        window.location.href = "main.html";
    } else {
        alert("Введите ник!")
        event.preventDefault();
    }
});
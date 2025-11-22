function generatePassword() {
    let user = document.getElementById("userInput").value;

    let lowercase = "abcdefghijklmnopqrstuvwxyz";
    let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numbers = "0123456789";
    let symbols = "!@#$%^&*()_+[]{}<>?";

    // Build character set based on user selections
    let chars = lowercase;

    if (document.getElementById("useUpper").checked) chars += uppercase;
    if (document.getElementById("useNumbers").checked) chars += numbers;
    if (document.getElementById("useSymbols").checked) chars += symbols;

    let length = document.getElementById("lengthSlider").value;
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    let finalPassword = `${user}${password}`;
    document.getElementById("output").innerText =
        `This password is inspired by Fly Squad: ${finalPassword}`;

    updateStrength(finalPassword);
}
function updateLength() {
    let val = document.getElementById("lengthSlider").value;
    document.getElementById("lengthValue").innerText = val;
}



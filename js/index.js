var api = 'https://learn.zone01dakar.sn/api/auth/signin';

var token=""

function encodeBase64(str) {
    // Utiliser TextEncoder pour obtenir un tableau d'octets
    var encoder = new TextEncoder();
    var byteArray = encoder.encode(str);
    // Convertir le tableau d'octets en chaîne base64
    var base64String = arrayBufferToBase64(byteArray);
    return base64String;
  }
const arrayBufferToBase64=(buffer)=>{
    var binary="";
    var bytes=new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary+=String.fromCharCode(bytes[i]);        
    } 
    return btoa(binary);
}

const Login = () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        var errorMessageElement=document.getElementById('errorMessage')
        if (username.trim() === '' || password.trim() === '') {
            errorMessageElement.textContent="your credentials is incorrect"
            return; 
        }
        const base64Credentials = encodeBase64(`${username}:${password}`);
    fetch(api, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if(!response.ok){
            if (response.status === 401) {
                errorMessageElement.textContent="your credentials is incorrect"
            }else {
                errorMessageElement.textContent="Iyour credentials is incorrect"
            }
            return
        }
        return response.json();
    })
    .then(data => {
        if (data) {
        token = data;
        localStorage.setItem("token", token);
        window.location.href = 'info.html';
        }
    })
    .catch(error => {
        console.log(error);
    });
};


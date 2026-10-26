
let countdown = 59;
let verifyCalled = false
let timerInterval;
let mob = /^\d{10}$/;
let mailformat = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
document.getElementById("responseMessage").style.display = "block";


function requestOtp() {
    verifyCalled = false
    let countdown = 59;
    validateMobileOrEmail()
    requestOtpCall()
    clearInterval(timerInterval);
    document.getElementById("otp-text-box").hidden = false;
    document.getElementById("pwd").disabled = false;
    document.getElementById("verifyotp").hidden = false;
    document.getElementById("resendotp").hidden = false;
    document.getElementById("timerdiv").hidden = false;
    document.getElementById("timer").innerText = countdown;
    document.getElementById("email").disabled = true;
    document.getElementById("verifyotp").classList.remove("disabled");
    document.getElementById("resendotp").classList.add("disabled");
    document.getElementById("requestotp").hidden = true;
    document.getElementById("messagediv").hidden = true;


    timerInterval = setInterval(() => {
        countdown--;
        document.getElementById("timer").innerText = countdown;
        if(verifyCalled){
            clearInterval(timerInterval);
        }
        if (countdown <= 0) {
            clearInterval(timerInterval);
            document.getElementById("pwd").disabled = true;
            document.getElementById("verifyotp").classList.add("disabled");
            document.getElementById("resendotp").classList.remove("disabled");
            document.getElementById("timerdiv").hidden = true;
            document.getElementById("messagediv").hidden = false;
            document.getElementById("message").innerText = "OTP expired! Please request a new one.";
        }
    }, 1000);
}

function validateMobileOrEmail() {
    let email = document.getElementById("email").value.trim();
    console.log(email)
    if (email === "" || (!email.match(mob) && !email.match(mailformat))) {
        document.getElementById("messagediv").hidden = false;
        document.getElementById("message").innerText = "Please enter valid mobile or email.";
        throw new Error("Email is required!");
    } else {
        document.getElementById("messagediv").hidden = true;
    }
}

function requestOtpCall(){
    let email = document.getElementById("email").value.trim();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://app.saleson.co.in/api/v1/users/getOTP", false);
    xhr.setRequestHeader('Content-Type', "application/json");
    xhr.onload = function(){
       if(this.status == 200) {
           var resposeJson = JSON.parse(this.responseText);
        }
    }
    var userData = JSON.stringify({user_identifier: email} );
    xhr.send(userData);
}

function verifyotp(){
    console.log("test")
    verifyCalled = true
    document.getElementById("verifyotp").classList.add("disabled");
    let email = document.getElementById("email").value.trim();
    let pwd = document.getElementById("pwd").value.trim();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://app.saleson.co.in/api/v1/users/authentication", true);
    xhr.setRequestHeader('Authorization', "Basic " + btoa(email + ":" + pwd))
    xhr.setRequestHeader('Content-Type', "application/json"); 
    xhr.onload = function(){
        if(this.status == 200) {
            var response = JSON.parse(this.responseText);
            if(response.status == "Success"){
                document.getElementById("contactLabelRow").hidden = true
                document.getElementById("contactFormRow").hidden = true
                document.getElementById("reponseMsgRow").hidden = false
            }
            else if(response.status == "Fail"){
                document.getElementById("email").disabled = false;
                document.getElementById("requestotp").hidden = false;
                document.getElementById("pwd").disabled = false;

                document.getElementById("verifyotp").hidden = true;
                document.getElementById("resendotp").hidden = true;
                document.getElementById("timerdiv").hidden = true;
                document.getElementById("message").innerText = "Invalid OTP! Please try Again.";
            }
        } else {
            resetElementsOnVerifyOtpFailure()
        }
    }
    xhr.onerror = function () {
        resetElementsOnVerifyOtpFailure()
    };
    var data = JSON.stringify({'auth_type': 'OTP'});
    xhr.send(data);
}

function resetElementsOnVerifyOtpFailure(){
    document.getElementById("email").disabled = false;
    document.getElementById("requestotp").hidden = false;
    document.getElementById("pwd").value = ""
    document.getElementById("otp-text-box").hidden = true;
    document.getElementById("verifyotp").hidden = true;
    document.getElementById("resendotp").hidden = true;
    document.getElementById("timerdiv").hidden = true;
    document.getElementById("messagediv").hidden = false;
    document.getElementById("message").innerText = "Failed to validate! Please try Again.";
}
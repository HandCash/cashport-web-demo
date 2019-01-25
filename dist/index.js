"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cashport_sdk_1 = require("cashport-sdk");
const appId = 'L77MZzEO72ZZSrRg58ysiGvveqFe51rK9lMDXKILD6YJf4lNibacSUx0xr979duv';
let cashport = new cashport_sdk_1.Cashport();
let grantedAuthorization;
let isButtonEnabled = true;
document.addEventListener("DOMContentLoaded", () => {
    setupDemo();
    document.getElementById("btn-logout").onclick = (event) => {
        clearAuthorization();
        setupDemo();
    };
});
function setupDemo() {
    document.getElementById('app-id').innerText = appId;
    grantedAuthorization = loadAuthorization();
    if (grantedAuthorization) {
        setMyContent(grantedAuthorization);
        setupCashportDonateButton();
    }
    else {
        enableCashportLogin();
    }
}
function enableCashportLogin() {
    document.getElementById('cashport-root-component').style.display = 'block';
    document.getElementById('my-content').style.display = 'none';
    let permissions = [cashport_sdk_1.PersonalInfoPermission.HANDLE, cashport_sdk_1.PersonalInfoPermission.FIRST_NAME,
        cashport_sdk_1.PersonalInfoPermission.LAST_NAME, cashport_sdk_1.PersonalInfoPermission.EMAIL];
    let authRequest = new cashport_sdk_1.AuthorizationRequest(permissions, appId);
    cashport.loadAuthorizationRequest('cashport-root-component', authRequest, {
        onDeny: () => {
            console.log('Authorization not granted :(');
        },
        onSuccess: (authorization) => {
            console.log(authorization);
            grantedAuthorization = authorization;
            storeAuthorization(authorization);
            setMyContent(authorization);
            setupCashportDonateButton();
        }
    });
}
function setMyContent(authorization) {
    document.getElementById('cashport-root-component').style.display = 'none';
    document.getElementById('my-content').style.display = 'block';
    document.getElementById('handle').innerText = authorization.personalInfo.handle;
    document.getElementById('full-name').innerText = authorization.personalInfo.firstName + " " + authorization.personalInfo.lastName;
    document.getElementById('auth-token').innerText = authorization.authToken;
    document.getElementById('expiration-timestamp').innerText = authorization.expirationTimestamp.toString();
    document.getElementById('spend-limit').innerText = authorization.spendLimitInSatoshis.toString();
    document.getElementById('email').innerText = authorization.personalInfo.email;
}
function setupCashportDonateButton() {
    var btnDonate = document.getElementById("btn-donate");
    btnDonate.innerText = 'Tap to donate 100 bits to $handcash';
    btnDonate.addEventListener('click', (event) => {
        if (!isButtonEnabled) {
            isButtonEnabled = true;
            btnDonate.innerText = 'Tap to donate 100 bits to $handcash';
        }
        else {
            sendPayToHandlePaymentRequest("handcash");
        }
    });
    function sendPayToHandlePaymentRequest(handle) {
        let request = cashport_sdk_1.SignTransactionRequestBuilder.useApiId(appId)
            .withCredentials(grantedAuthorization.personalInfo.handle, grantedAuthorization.authToken, grantedAuthorization.channelId)
            .addPayment(cashport_sdk_1.PaymentRequestFactory.create().getPayToHandle(handle, 10000))
            .build();
        console.log(request);
        cashport.sendSignTransactionRequest(request, {
            onStart: () => {
                btnDonate.innerText = "Sending request...";
            },
            onEnd: () => {
                console.log("onEnd");
                isButtonEnabled = false;
            },
            onSuccess: (requestId, transactionId) => {
                btnDonate.innerText = "Sent :)";
                console.log("onSuccess: " + requestId + " -> " + transactionId);
            },
            onAuthorizedFundsLimitReached: (requestId) => {
                btnDonate.innerText = "Authorized funds limit reached";
                console.log("onAuthorizedFundsLimitReached");
            },
            onDeviceNotAvailable: () => {
                btnDonate.innerText = "Device not available. Check your device connection";
                console.log("onDeviceNotAvailable");
            },
            onInsufficientWalletFunds: (requestId) => {
                btnDonate.innerText = "Insufficient funds";
                console.log("onInsufficientWalletFunds");
            },
            onTokenExpired: (requestId) => {
                btnDonate.innerText = "Token expired";
                console.log("onTokenExpired");
            },
            onNotAuthorized: (requestId) => {
                btnDonate.innerText = "Not authorized";
                console.log("onNotAuthorized");
            },
            onInternalWalletError: (requestId) => {
                btnDonate.innerText = "Internal wallet error :(";
                console.log("onInternalWalletError");
            },
            onBadRequest: (message, errorCode) => {
                btnDonate.innerText = "Bad request. WTF are your doing!?";
                console.log("onBadRequest: ( " + errorCode + ") " + message);
            },
            onAPICallError: (message) => {
                btnDonate.innerText = "API Call error: " + message;
                console.log("onAPICallError: " + message);
            }
        });
    }
}
function loadAuthorization() {
    var name = "auth" + "=";
    var decodedCookie = decodeURIComponent(document.cookie).split(';');
    for (var i = 0; i < decodedCookie.length; i++) {
        var cookie = decodedCookie[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            let value = cookie.substring(name.length, cookie.length);
            if (value && value.length > 6) {
                return JSON.parse(value);
            }
        }
    }
    return null;
}
function storeAuthorization(authorization) {
    let date = new Date();
    date.setTime(date.getTime() + (authorization.expirationTimestamp));
    let expires = "expires=" + date.toUTCString();
    let cookieValue = JSON.stringify(authorization);
    document.cookie = "auth" + "=" + cookieValue + ";" + expires + ";path=/";
}
function clearAuthorization() {
    document.cookie = "auth=; expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
}
//# sourceMappingURL=index.js.map
const kakakoLoginBtn = document.querySelector('#kakao');
const naverLoginBtn = document.querySelector('#naver');
const googleLoginBtn = document.querySelector('#google');

const userImg = document.querySelector('img');
const userName = document.querySelector('#user_name');
const logoutBtn = document.querySelector('#logout');

function renderUserInfo (imgUrl, name,) {
    userImg.src = imgUrl;
    userName.innerText = name;
}

let kakaoAccessToken = ''
let naverAccessToken = ''
let googleAccessToken = ''
let currentOAuthService = ''

kakakoLoginBtn.onclick = () => {
    fetch('http://localhost:3000/kakao')
        .then(res => res.json())
        .then(data => {
            window.location.href = data.authUrl;
        })
        .catch(error => console.error('Error fetching Kakao auth URL:', error));
};

naverLoginBtn.onclick = () => {
    fetch('http://localhost:3000/naver')
        .then(res => res.json())
        .then(data => {
            window.location.href = data.authUrl;
        })
        .catch(error => console.error('Error fetching Naver auth URL:', error));
}

googleLoginBtn.onclick = () => {
    fetch('http://localhost:3000/google')
        .then(res => res.json())
        .then(data => {
            window.location.href = data.authUrl;
        })
        .catch(error => console.error('Error fetching Google auth URL:', error));
}

window.onload = () => {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const authorizationCode = urlParams.get('code');
    const state = url.searchParams.get('state');

    if (authorizationCode && state) {
        switch (state) {
            case 'kakao':
                handleKakaoLogin(authorizationCode);
                break;
            case 'naver':
                handleNaverLogin(authorizationCode);
                break;
            case 'google':
                handleGoogleLogin(authorizationCode);
                break;
            default:
                console.error('Unknown platform:', state);
        }
    }
};

function handleNaverLogin(authorizationCode) {
    axios.post('http://localhost:3000/naver/login', { authorizationCode })
        .then(res => {
            naverAccessToken = res.data;
            return axios.post('http://localhost:3000/naver/userinfo', { naverAccessToken });
        })
        .then(res => {
            renderUserInfo(res.data.profile_image, res.data.name);
            currentOAuthService = 'naver';
        })
        .catch(error => {
            console.error('Naver login error:', error.message);
        });
}

function handleGoogleLogin(authorizationCode) {
    axios.post('http://localhost:3000/google/login', { authorizationCode })
        .then(res => {
            googleAccessToken = res.data;
            return axios.post('http://localhost:3000/google/userinfo', { googleAccessToken });
        })
        .then(res => {
            renderUserInfo(res.data.picture, res.data.name);
            currentOAuthService = 'google';
        })
        .catch(error => {
            console.error('Google login error:', error.message);
        });
}

function handleKakaoLogin(authorizationCode) {
    axios.post('http://localhost:3000/kakao/login', { authorizationCode })
        .then(res => {
            kakaoAccessToken = res.data;
            return axios.post('http://localhost:3000/kakao/userinfo', { kakaoAccessToken });
        })
        .then(res => {
            renderUserInfo(res.data.profile_image, res.data.nickname);
            currentOAuthService = 'kakao';
        })
        .catch(error => {
            console.error('Kakao login error:', error.message);
        });
}

logoutBtn.onclick = () => {
    console.log('Current OAuth Service:', currentOAuthService);
    switch (currentOAuthService) {
        case 'kakao':
            console.log('Kakao Access Token:', kakaoAccessToken);
            axios.delete('http://localhost:3000/kakao/logout', {
                data: { accessToken: kakaoAccessToken }
            }).then(() => resetUserInfo())
              .catch(error => console.error('Kakao logout error:', error.message));
            break;
        case 'naver':
            console.log('Naver Access Token:', naverAccessToken);
            axios.delete('http://localhost:3000/naver/logout', {
                data: { accessToken: naverAccessToken }
            }).then(() => resetUserInfo())
              .catch(error => console.error('Naver logout error:', error.message));
            break;
        case 'google':
            console.log('Google Access Token:', googleAccessToken);
            axios.delete('http://localhost:3000/google/logout', {
                data: { accessToken: googleAccessToken }
            }).then(() => resetUserInfo())
              .catch(error => console.error('Google logout error:', error.message));
            break;
        default:
            console.error('Unknown OAuth service');
    }
};


function renderUserInfo(imgUrl, name) {
    userImg.src = imgUrl;
    userName.innerText = name;
}

function resetUserInfo() {
    renderUserInfo('', '');
    currentOAuthService = '';
    kakaoAccessToken = '';
    naverAccessToken = '';
    googleAccessToken = '';
}


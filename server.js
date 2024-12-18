const express = require('express');
const cors = require('cors');
const axios = require('axios');

require("dotenv").config();

const kakakoClientId = process.env.KAKAO_CLIENT_ID;
const redirectURI = 'http://127.0.0.1:5500'

const naverClientId = process.env.NAVER_CLIENT_ID;
const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
const naverSecret = process.env.NAVER_SECRET;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientIdSecret = process.env.GOOGLE_CLIENT_SECRET;

const app = express()

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ["OPTIONS", "POST", "DELETE"],
}))

app.use(express.json())


//Kakao Login
app.get('/kakao', (req, res) => {
    const state = 'kakao';
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${redirectURI}&state=${state}`;
    res.json({ authUrl: kakaoAuthUrl });
});

app.post('/kakao/login', (req, res) => {
    //console.log(req.body);
    const authorizationCode = req.body.authorizationCode
    axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: kakakoClientId,
        redirect_uri: redirectURI,
        code: authorizationCode
    },
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }
).then(response => res.send(response.data.access_token));
})

app.post('/kakao/userinfo', (req, res) => {
    //console.log(req.body);
    const { kakaoAccessToken } = req.body
    axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }).then(response => {
        // 응답 데이터 확인
        if (response.data && response.data.properties) {
            res.json(response.data.properties);
        } else {
            res.status(400).json({ error: 'Invalid response from Kakao API' });
        }
    }).catch(error => {
        console.error('Error fetching user info:', error.message);
        res.status(500).json({ error: 'Failed to fetch user info' });
    });
});

app.delete('/kakao/logout', (req, res) => {
    //console.log(req.body)
    const { accessToken } = req.body;
    console.log(accessToken);
    axios.post('https://kapi.kakao.com/v1/user/logout', null, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }).then(response => res.send('로그아웃 성공'))
})

// Naver Login
app.get('/naver', (req, res) => {
    const state = 'naver';
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${redirectURI}&state=${state}`;
    res.json({ authUrl: naverAuthUrl });
});

app.post('/naver/login', (req, res) => {
    const authorizationCode = req.body.authorizationCode
    axios.post(`https://nid.naver.com/oauth2.0/token?client_id=${naverClientId}&client_secret=${naverClientSecret}&grant_type=authorization_code&state=${naverSecret}&code=${authorizationCode}`)
    .then(response => res.send(response.data.access_token))
});

app.post('/naver/userinfo', (req, res) => {
    //console.log(req.body);
    const { naverAccessToken } = req.body
    axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
            Authorization: `Bearer ${naverAccessToken}`,
        }
    }).then(response => {
        res.json(response.data.response);
    });
});

app.delete('/naver/logout', (req, res) => {
    //console.log(req.body)
    const { accessToken } = req.body;
    //console.log(accessToken);
    axios.post(`https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${naverClientId}&client_secret=${naverClientSecret}&access_token=${accessToken}&service_provider=NAVER`)
    .then(response => res.send('로그아웃 성공'))
})

// Google Login
app.get('/google', (req, res) => {
    const redirectURI = 'http://127.0.0.1:5500';
    const state = 'google';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${redirectURI}&scope=email profile&state=${state}`;
    res.json({ authUrl: googleAuthUrl });
});


app.post('/google/login', (req, res) => {
    //console.log(req.body);
    const authorizationCode = req.body.authorizationCode
    axios.post('https://oauth2.googleapis.com/token', {
        code: authorizationCode,
        grant_type: 'authorization_code',
        client_id: googleClientId,
        client_secret: googleClientIdSecret,
        redirect_uri: redirectURI
    },
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }
).then(response => res.send(response.data.access_token));
})

app.post('/google/userinfo', (req, res) => {
    //console.log(req.body);
    const { googleAccessToken } = req.body
    axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${googleAccessToken}`,
        }
    }).then(response => {
        res.json(response.data);
    });
});

app.delete('/google/logout', (req, res) => {
    const { accessToken } = req.body;
    //console.log(accessToken);
    axios.post('https://oauth2.googleapis.com/revoke',
        { token: accessToken },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    .then(response => res.send('로그아웃 성공'))
})


app.listen(3000, () => console.log('서버열림'))
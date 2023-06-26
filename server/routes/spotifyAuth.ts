import express from 'express'
import request from 'superagent'
import * as dotenv from 'dotenv'
dotenv.config()

const clientId = process.env.SPOTIFY_CLIENT_ID as string
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const router = express.Router()

router.use(express.json())

const genRandStr = (length:number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let  i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


async function genCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}



router.get('/login', (req, res) => {

  const  codeVerifier = genRandStr(128)

  genCodeChallenge(codeVerifier)
  .then(codeChallenge => {
    const scope = "streaming user-read-email user-read-private"
    const state = genRandStr(16)
    localStorage.setItem('code_verifier', codeVerifier)
    const args = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      redirect_uri: "https://localhost:3000/auth/callback",
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })
    res.redirect('https://accounts.spotify.com/authorize/?' + args.toString());
  })
  .catch(e => {console.error(`LOGIN ERR:${e}`)})
})

router.get('/callback', (req, res) => {
  const code = req.query.code?.toString()
  const codeVerifier = localStorage.getItem('code_verifier') as string

  // const  body  = new URLSearchParams({
  //   grant_type: 'authorization_code',
  //   code: code,
  //   redirect_uri: 'http://localhost:3000/auth/callback',
  //   client_id: clientId,
  //   code_verifier: codeVerifier
  // })
  
  const  authOptions  = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:3000/auth/callback',
      client_id: clientId,
      code_verifier: codeVerifier
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    json: true
  }

  request.post(authOptions, ((e, response, body) {
    if (!error & response.statusCode === 200) {
      const access_token = body.access_token;
      res.redirect('/')
    } 
  }))
  



})

export default router

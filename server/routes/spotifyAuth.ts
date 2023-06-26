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





router.get('/login', (req, res) => {
  
  async function genCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
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
      redirect_uri: "http://localhost:5173/auth/callback",
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

  async () => {
  await request.post(
    'https://accounts.spotify.com/api/token'
  )
  .set('Authorization', 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')))
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:5173/auth/callback',
    client_id: clientId,
    code_verifier: codeVerifier

  }).then(res => {
    localStorage.setItem('access_token', res.body.access_token)
   
    
  }).catch(e => {
    console.error(`ERR WHILE REQUESTING TOKEN: ${e}`)
  })
}

})

router.get('/token', (req, res) => {
  const access_token = localStorage.getItem('access_token')
  res.json(
    {
      access_token: access_token
    }
)
})

export default router

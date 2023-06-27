import express from 'express'
import request from 'superagent'
import crypto from 'node:crypto'
import * as dotenv from 'dotenv'
dotenv.config()

const clientId = process.env.SPOTIFY_CLIENT_ID as string
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const router = express.Router()
let access_token = ''
router.use(express.json())

// In-memory storage for the code_verifier
const codeVerifierStore: { [key: string]: string } = {};

router.get('/login', (req, res) => {
  
  const genRandStr = (length:number) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let  i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  async function genCodeChallenge(codeVerifier: string) {
    function base64encode(input:ArrayBuffer) {
      return btoa(String.fromCharCode.apply(null, [...new Uint8Array(input)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const buffer = await crypto.createHash('sha256').update(data).digest()


    return base64encode(buffer)
  }
  const  codeVerifier = genRandStr(128)

  genCodeChallenge(codeVerifier)
  .then(codeChallenge => {
    const scope = "streaming user-read-email user-read-private"
    const state = genRandStr(16)
    codeVerifierStore[state] = codeVerifier;
    const args = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      redirect_uri: "http://localhost:5173/api/v1/auth/callback",
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })
    res.redirect('https://accounts.spotify.com/authorize/?' + args.toString());
  })
  .catch(e => {console.error(`LOGIN ERR:${e}`)})
})

router.get('/callback', (req) => {
  const code = req.query.code?.toString()
  const state = req.query.state?.toString() as string;
  const codeVerifier = codeVerifierStore[state];

  async function postReq() {
  await request.post(
    'https://accounts.spotify.com/api/token'
  )
  .set('Authorization', 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')))
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:5173/api/v1/auth/callback',
    client_id: clientId,
    code_verifier: codeVerifier

  }).then(res => {
    access_token = res.body.access_token
    console.log(access_token)
   
    
  }).catch(e => {
    console.error(`ERR WHILE REQUESTING TOKEN: ${e}`)
  })
}


postReq()
})

router.get('/token', (req, res) => {
  res.json(
    {
      access_token: access_token
    }
)
})

export default router

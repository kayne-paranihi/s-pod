import express from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID as string
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
const router = express.Router()

router.use(express.json())

const generateRandomString = (length:number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let  i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/login', (req, res) => {
  const scope = "streaming \
                user-read-email \
                user-read-private"

const state = generateRandomString(16);

const searchObj = {
  response_type: "code",
  client_id: spotify_client_id,
  scope: scope,
  redirect_uri: "https://localhost:3000/auth/callback",
  state:state
}


const  auth_query_parameters = new URLSearchParams(searchObj)

res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

router.get('/callback', (req, res) => {})

export default router

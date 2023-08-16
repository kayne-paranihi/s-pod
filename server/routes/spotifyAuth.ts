import express from 'express'
import request from 'superagent'
import * as dotenv from 'dotenv'
dotenv.config()

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID as string
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET as string

function generateRandomString(length: number) {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const router = express.Router()
let access_token = ''

router.use(express.json())

router.get('/auth/login', (_req, res) => {
  const scope = `streaming 
               user-read-email 
               user-read-playback-state
               user-modify-playback-state
               user-read-currently-playing
               user-read-private`

  const state = generateRandomString(16)

  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: 'http://localhost:3000/api/v1/auth/callback',
    state: state,
  })

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  )
})

router.get('/auth/callback', async (req, res) => {
  const code = req.query.code

  try {
    const response = await request
      .post('https://accounts.spotify.com/api/token')
      .set(
        'Authorization',
        'Basic ' +
          Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString(
            'base64'
          )
      )
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/api/v1/auth/callback',
        client_id: spotify_client_id,
      })

    access_token = response.body.access_token
    // ! this redirect is only for correct redirecting during development - please change the redirect to just '/' in deployment
    res.redirect('http://localhost:5173')
  } catch (error) {
    console.error(`ERR WHILE REQUESTING TOKEN: ${error}`)
  }
})

router.get('/auth/token', (_req, res) => {
  res.json({
    access_token: access_token,
  })
})

export default router

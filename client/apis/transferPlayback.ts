import request from 'superagent'

export async function transferPlayback(
  access_token: string | null,
  device_id: string | null
) {
  try {
    await request
      .put('https://api.spotify.com/v1/me/player')
      .set('Authorization', 'Bearer ' + access_token)
      .set('Content-Type', 'application/json')
      .send({
        device_ids: [device_id],
        play: true,
      })
  } catch (error) {
    console.error(`ERR WHILE AUTO TRANSFERRING PLAYBACK: ${error}`)
  }
}

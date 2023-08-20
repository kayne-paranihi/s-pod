import { useState, useEffect } from 'react'
import { transferPlayback } from '../apis/transferPlayback'

interface Props {
  token: string
}

function WebPlayback(props: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [is_paused, setPaused] = useState<boolean>(false)
  const [is_active, setActive] = useState<boolean>(false)
  const [current_track, setTrack] = useState<Spotify.Track | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'sPod',
        getOAuthToken: (cb) => {
          cb(props.token)
        },
        volume: 0.5,
      })

      setPlayer(player)

      player.addListener('ready', ({ device_id }) => {
        setPlayerId(device_id)
      })

      player.addListener('not_ready', () => {
        console.log('Device ID has gone offline')
      })

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return
        }

        setTrack(state.track_window.current_track)
        setPaused(state.paused)

        // eslint-disable-next-line promise/catch-or-return
        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true)
        })
      })
      console.log(props.token)
      player.connect()
    }
  }, [props.token])

  if (!is_active) {
    return (
      <>
        <div className="App">
          <header className="App-header">
            <button
              className="btn-spotify"
              onClick={() => transferPlayback(props.token, playerId)}
            >
              Start
            </button>
          </header>
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={current_track?.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track?.name}</div>
              <div className="now-playing__artist">
                {current_track?.artists.map((artist) => artist.name).join(', ')}
              </div>
              <div className="now-playing__album">
                {current_track?.album.name}
              </div>
            </div>
          </div>
        </div>
        <div className="container playback__container">
          <button
            className="btn-spotify"
            onClick={() => {
              player?.previousTrack()
            }}
          >
            &lt;&lt;
          </button>

          <button
            className="btn-spotify"
            onClick={() => {
              player?.togglePlay()
            }}
          >
            {is_paused ? '⏵' : '⏸'}
          </button>

          <button
            className="btn-spotify"
            onClick={() => {
              player?.nextTrack()
            }}
          >
            &gt;&gt;
          </button>
        </div>
      </>
    )
  }
}

export default WebPlayback

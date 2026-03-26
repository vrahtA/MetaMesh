import React, { useState } from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { useAppSelector } from '../hooks'

const CameraWindow = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ControlBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`

const OverlayButton = styled(IconButton)<{ $on: boolean }>`
  && {
    background: ${({ $on }) => ($on ? 'rgba(99,102,241,0.85)' : 'rgba(239, 68, 68, 0.8)')};
    color: white;
    width: 38px;
    height: 38px;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.2s ease;

    &:hover {
      background: ${({ $on }) => ($on ? 'rgba(79,70,229,0.95)' : 'rgba(220, 38, 38, 0.95)')};
      transform: scale(1.1);
    }
  }
`

const VideoFrame = styled.div`
  position: relative;
  width: 100%;
  min-height: 170px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NoVideoPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.8rem;
  padding: 20px;
  text-align: center;

  svg {
    font-size: 2.5rem;
    opacity: 0.4;
  }
`

const ConnectButton = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.45);
  }
`

export default function VideoConnectionDialog() {
  const [connectionWarning, setConnectionWarning] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)

  const getStream = (): MediaStream | undefined => {
    try {
      const game = phaserGame.scene.keys.game as Game
      return (game?.network?.webRTC as any)?.myStream as MediaStream | undefined
    } catch {
      return undefined
    }
  }

  const handleMicToggle = () => {
    const stream = getStream()
    if (stream) {
      const track = stream.getAudioTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setMicOn(track.enabled)
        return
      }
    }
    setMicOn((prev) => !prev)
  }

  const handleCamToggle = () => {
    const stream = getStream()
    if (stream) {
      const track = stream.getVideoTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setCamOn(track.enabled)
        return
      }
    }
    setCamOn((prev) => !prev)
  }

  // When camera is connected: show control bar above the video-grid (which WebRTC manages)
  if (videoConnected) {
    return (
      <CameraWindow>
        <ControlBar>
          <Tooltip title={micOn ? 'Mute' : 'Unmute'} placement="top">
            <OverlayButton size="small" $on={micOn} onClick={handleMicToggle}>
              {micOn ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
            </OverlayButton>
          </Tooltip>
          <Tooltip title={camOn ? 'Camera On' : 'Camera Off'} placement="top">
            <OverlayButton size="small" $on={camOn} onClick={handleCamToggle}>
              {camOn ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
            </OverlayButton>
          </Tooltip>
        </ControlBar>
      </CameraWindow>
    )
  }

  // Before camera connected: show connect prompt
  return (
    <CameraWindow>
      {connectionWarning && (
        <Alert
          severity="warning"
          onClose={() => setConnectionWarning(false)}
          style={{
            borderRadius: '12px',
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(234,179,8,0.3)',
            color: '#fef08a',
            fontSize: '0.8rem',
            padding: '6px 12px',
          }}
        >
          <AlertTitle style={{ fontSize: '0.85rem', color: '#fde047' }}>No webcam connected</AlertTitle>
          Connect one for the full experience!
        </Alert>
      )}

      <VideoFrame>
        <NoVideoPlaceholder>
          <VideocamOffIcon />
          <span>Camera not connected</span>
        </NoVideoPlaceholder>
      </VideoFrame>

      <ConnectButton
        onClick={() => {
          const game = phaserGame.scene.keys.game as Game
          game.network.webRTC?.getUserMedia()
        }}
      >
        Connect Webcam
      </ConnectButton>
    </CameraWindow>
  )
}

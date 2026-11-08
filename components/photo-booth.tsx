'use client';
/* eslint-disable @next/next/no-img-element -- Photos are captured in-browser and rendered from local data URLs. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { supabase } from '../utils/supabase';
import { CaptureLayoutPreview, type CaptureLayout } from './capture-layout-preview';
import { Icon } from './icon';
import { PoseIdeaGuide } from './pose-idea-guide';
import { STICKERS } from './sticker-art';
import { FRAME_LAYOUTS, FRAME_THEMES, ThemeCardPreview, ThemedFrameSvg, type FrameLayoutId, type FrameThemeId } from './themed-frame';
import styles from './photo-booth.module.css';

const GALLERY_KEY = 'snapsync-gallery-v1';
const CAMERA_FILTERS = [
  { id: 'natural', label: 'Natural', css: 'none' },
  { id: 'warm', label: 'Warm', css: 'sepia(.28) saturate(1.22)' },
  { id: 'cool', label: 'Cool', css: 'saturate(.82) hue-rotate(12deg)' },
  { id: 'mono', label: 'B&W', css: 'grayscale(1)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(.38) contrast(.94) saturate(.82)' },
  { id: 'rosy', label: 'Rosy', css: 'sepia(.16) saturate(1.28) hue-rotate(326deg)' },
  { id: 'golden', label: 'Golden', css: 'sepia(.32) saturate(1.3) brightness(1.06)' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.1) contrast(.88) saturate(.92)' },
  { id: 'fade', label: 'Fade', css: 'brightness(1.06) contrast(.84) saturate(.76)' },
] as const;
const FRAME_COLORS = {
  white: { id: 'white', label: 'White', frameColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#D6FF5F' },
  black: { id: 'black', label: 'Black', frameColor: '#000000', textColor: '#FFFFFF', accentColor: '#D6FF5F' },
  matcha: { id: 'matcha', label: 'Matcha', frameColor: '#B7C9A0', textColor: '#2F3B26', accentColor: '#D6FF5F' },
  purple: { id: 'purple', label: 'Purple', frameColor: '#C9B6F2', textColor: '#2A1F4D', accentColor: '#D6FF5F' },
  red: { id: 'red', label: 'Red', frameColor: '#C8283A', textColor: '#FFFFFF', accentColor: '#D6FF5F' },
  custom: { id: 'custom', label: 'Custom', frameColor: '#000000', textColor: '#FFFFFF', accentColor: '#D6FF5F' },
} as const;
type Step = 1 | 2 | 3 | 4;
type Layout = CaptureLayout;
type CameraFilter = (typeof CAMERA_FILTERS)[number]['id'];
type FrameColor = keyof typeof FRAME_COLORS;
const PRESET_FRAME_COLORS = Object.values(FRAME_COLORS).filter((color) => color.id !== 'custom');
const PHOTO_LAYOUTS: { id: Layout; label: string; photoCount: number; description: string }[] = [
  { id: 'strip', label: 'Classic strip', photoCount: 4, description: '2 × 6 in · 4 shots' },
  { id: 'doubleStrip', label: 'Double strip', photoCount: 4, description: '4 × 6 in · 2 identical strips' },
  { id: 'grid', label: 'Grid 2×2', photoCount: 4, description: '4 × 6 in · 4 shots' },
  { id: 'trio', label: 'Trio strip', photoCount: 3, description: '2 × 6 in · 3 shots' },
  { id: 'polaroid', label: 'Polaroid', photoCount: 1, description: '4 × 6 in · 1 shot' },
];
type PhotoPosition = { x: number; y: number; zoom?: number };
type RoomRole = 'host' | 'guest';
type RoomPhase = 'waiting' | 'photos' | 'design' | 'save' | 'ended';
type RoomParticipant = { id: string; name: string; role: RoomRole; cameraReady: boolean };
type RoomCapturePair = { local?: string; remote?: string };
type DuoPhotoPair = { host: string; guest: string };
type RoomBroadcast = {
  event: string;
  payload: Record<string, unknown>;
};
type StickerPlacement = {
  key: string;
  stickerId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type RoomSignal = {
  from: string;
  to: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

function createRoomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function createRoomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

type RoomIceServerConfig = { iceServers: RTCIceServer[]; hasTurnServer: boolean; error: string };
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

function isAuthenticatedTurnServer(value: unknown): value is RTCIceServer {
  if (typeof value !== 'object' || value === null || !('urls' in value) || !('username' in value) || !('credential' in value)) {
    return false;
  }
  const urls = value.urls;
  const hasTurnUrl = (typeof urls === 'string' ? [urls] : Array.isArray(urls) ? urls : [])
    .some((url) => typeof url === 'string' && /^turns?:/i.test(url));
  return hasTurnUrl && typeof value.username === 'string' && typeof value.credential === 'string';
}

async function getRoomIceServers(): Promise<RoomIceServerConfig> {
  const urls = process.env.NEXT_PUBLIC_TURN_URL?.split(',').map((url) => url.trim()).filter(Boolean);
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
  if (urls?.length && username && credential) {
    return {
      iceServers: [...FALLBACK_ICE_SERVERS, { urls, username, credential }],
      hasTurnServer: true,
      error: '',
    };
  }
  const credentialsUrl = process.env.NEXT_PUBLIC_METERED_TURN_CREDENTIAL_URL;
  if (!credentialsUrl) {
    return {
      iceServers: FALLBACK_ICE_SERVERS,
      hasTurnServer: false,
      error: 'This deployment has no TURN relay configured. A relay is needed to connect cameras across some networks.',
    };
  }

  try {
    const response = await fetch(credentialsUrl, { cache: 'no-store' });
    if (!response.ok) {
      return {
        iceServers: FALLBACK_ICE_SERVERS,
        hasTurnServer: false,
        error: `The TURN provider could not issue relay credentials (HTTP ${response.status}).`,
      };
    }
    const data: unknown = await response.json();
    const turnServers = Array.isArray(data) ? data.filter(isAuthenticatedTurnServer) : [];
    if (turnServers.length === 0) {
      return {
        iceServers: FALLBACK_ICE_SERVERS,
        hasTurnServer: false,
        error: 'The TURN provider returned no valid relay servers. Check the TURN credential URL.',
      };
    }
    return {
      iceServers: [...FALLBACK_ICE_SERVERS, ...turnServers],
      hasTurnServer: true,
      error: '',
    };
  } catch {
    return {
      iceServers: FALLBACK_ICE_SERVERS,
      hasTurnServer: false,
      error: 'The TURN provider could not be reached. Check the TURN credential URL and try again.',
    };
  }
}

function getFrameTheme(frameColor: FrameColor, customFrameColor: string) {
  if (frameColor !== 'custom') return FRAME_COLORS[frameColor];

  const red = Number.parseInt(customFrameColor.slice(1, 3), 16);
  const green = Number.parseInt(customFrameColor.slice(3, 5), 16);
  const blue = Number.parseInt(customFrameColor.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return {
    ...FRAME_COLORS.custom,
    frameColor: customFrameColor,
    textColor: luminance > 0.5 ? FRAME_COLORS.white.textColor : FRAME_COLORS.black.textColor,
  };
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('A photo could not be loaded.'));
    image.src = source;
  });
}

export function PhotoBooth({ mode = 'solo', room: incomingRoom = '' }: { mode?: string; room?: string }) {
  const isDuo = mode === 'duo';
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStageRef = useRef<HTMLDivElement>(null);
  const photoDesignRef = useRef<HTMLDivElement>(null);
  const frameSvgRef = useRef<SVGSVGElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peerIdRef = useRef('');
  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const offeredPeersRef = useRef(new Set<string>());
  const pendingCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const roomMemberTokenRef = useRef('');
  const roomRoleRef = useRef<RoomRole | null>(null);
  const roomCapturePairsRef = useRef(new Map<number, RoomCapturePair>());
  const completedRoomCapturesRef = useRef(new Set<number>());
  const scheduledRoomCapturesRef = useRef(new Set<number>());
  const imageTransferRef = useRef(new Map<string, { chunks: Map<number, string>; total: number }>());
  const lastFinalImageSentRef = useRef('');
  const clockOffsetRef = useRef(0);
  const countdownIntervalRef = useRef<number | null>(null);
  const captureScrollTimeoutRef = useRef<number | null>(null);
  const capturePhotoRef = useRef<(shotIndex?: number) => void>(() => undefined);
  const hasSeenGuestRef = useRef(false);
  const hasSeenHostRef = useRef(false);
  const disconnectTimeoutRef = useRef<number | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [roomCode, setRoomCode] = useState(incomingRoom);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomConnected, setRoomConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [roomParticipants, setRoomParticipants] = useState<string[]>([]);
  const [roomParticipantDetails, setRoomParticipantDetails] = useState<RoomParticipant[]>([]);
  const [roomRole, setRoomRole] = useState<RoomRole | null>(null);
  const [roomPhase, setRoomPhase] = useState<RoomPhase>('waiting');
  const [displayName, setDisplayName] = useState(mode === 'duo' && !incomingRoom ? 'Host' : 'Guest');
  const [hostName, setHostName] = useState('Host');
  const [roomFull, setRoomFull] = useState(false);
  const [roomEnded, setRoomEnded] = useState(false);
  const [guestDisconnected, setGuestDisconnected] = useState(false);
  const [reconnectExpired, setReconnectExpired] = useState(false);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState<Map<string, MediaStream>>(() => new Map());
  const [roomError, setRoomError] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [duoPhotoPairs, setDuoPhotoPairs] = useState<Array<DuoPhotoPair | undefined>>([]);
  const [photoPositions, setPhotoPositions] = useState<PhotoPosition[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [selectedPhotoForRetake, setSelectedPhotoForRetake] = useState<number | null>(null);
  const [alignAllPhotos, setAlignAllPhotos] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [startingCamera, setStartingCamera] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const photoLimit = layout ? PHOTO_LAYOUTS.find((option) => option.id === layout)?.photoCount ?? 0 : 0;
  const [frameColor, setFrameColor] = useState<FrameColor>('black');
  const [customFrameColor, setCustomFrameColor] = useState<string>(FRAME_COLORS.custom.frameColor);
  const [showFrameText, setShowFrameText] = useState(true);
  const [customFrameMessage, setCustomFrameMessage] = useState('');
  const [frameThemeId, setFrameThemeId] = useState<FrameThemeId>('classic');
  const [frameName, setFrameName] = useState('');

  const [stickers, setStickers] = useState<StickerPlacement[]>([]);
  const [selectedStickerKey, setSelectedStickerKey] = useState<string | null>(null);
  const [cameraFilter, setCameraFilter] = useState<CameraFilter>('natural');
  const [createdImage, setCreatedImage] = useState('');
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [pendingRetakeRequest, setPendingRetakeRequest] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const displayNameRef = useRef(displayName);
  const stopCameraRef = useRef<() => void>(() => undefined);
  const completeRoomCaptureRef = useRef<(index: number) => void>(() => undefined);
  displayNameRef.current = displayName;
  const selectedStickers = stickers.flatMap((placement) => {
    const definition = STICKERS.find((item) => item.id === placement.stickerId);
    return definition ? [{ ...placement, definition }] : [];
  });
  const selectedSticker = selectedStickers.find((sticker) => sticker.key === selectedStickerKey);
  const attachLocalVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) element.srcObject = streamRef.current;
  }, []);

  useEffect(() => {
    if (!isDuo || !roomCode) return;

    let mounted = true;
    const peerId = peerIdRef.current || (peerIdRef.current = crypto.randomUUID());
    const peerConnections = peerConnectionsRef.current;
    const offeredPeers = offeredPeersRef.current;
    const pendingCandidates = pendingCandidatesRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let heartbeat: number | null = null;
    let iceServerConfig: RoomIceServerConfig = {
      iceServers: FALLBACK_ICE_SERVERS,
      hasTurnServer: false,
      error: 'TURN relay credentials have not loaded.',
    };
    const makePeerConnection = (otherPeerId: string) => {
      const connection = new RTCPeerConnection({
        iceServers: iceServerConfig.iceServers,
      });
      peerConnections.set(otherPeerId, connection);
      const localStream = streamRef.current;
      const localTrack = localStream?.getVideoTracks().find((track) => track.readyState === 'live');
      connection.addTransceiver(localTrack ?? 'video', {
        direction: 'sendrecv',
        ...(localTrack && localStream ? { streams: [localStream] } : {}),
      });
      connection.onicecandidate = (event) => {
        if (!event.candidate || !channel) return;
        void channel.send({
          type: 'broadcast',
          event: 'room-signal',
          payload: {
            from: peerId,
            to: otherPeerId,
            candidate: event.candidate.toJSON(),
          } satisfies RoomSignal,
        });
      };
      connection.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        setRemoteVideoStreams((current) => new Map(current).set(otherPeerId, stream));
        event.track.onunmute = () => {
          setRemoteVideoStreams((current) => new Map(current).set(otherPeerId, stream));
        };
      };
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'failed') {
          setRoomError(iceServerConfig.hasTurnServer
            ? 'Could not connect to the other camera. Check your network and TURN provider settings, then rejoin the room.'
            : `${iceServerConfig.error} Ask the site owner to configure TURN, then rejoin the room.`);
        } else if (connection.connectionState === 'disconnected') {
          setRoomError('Live video was interrupted. Checking the connection…');
        } else if (connection.connectionState === 'connected') {
          setRoomError('');
        }
      };
      return connection;
    };

    const scheduleRoomCapture = (index: number, captureAt: number) => {
      if (scheduledRoomCapturesRef.current.has(index)) return;
      scheduledRoomCapturesRef.current.add(index);
      if (countdownIntervalRef.current !== null) window.clearInterval(countdownIntervalRef.current);
      const update = () => {
        const remaining = captureAt - Date.now();
        if (remaining <= 0) {
          if (countdownIntervalRef.current !== null) window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdown(null);
          capturePhotoRef.current(index);
          return;
        }
        setCountdown(Math.ceil(remaining / 1000));
      };
      update();
      countdownIntervalRef.current = window.setInterval(update, 50);
    };

    const joinAndConnect = async () => {
      const storageKey = `snapsync-room-member-${roomCode}`;
      const nameStorageKey = `snapsync-room-name-${roomCode}`;
      const token = sessionStorage.getItem(storageKey) ?? createRoomToken();
      const memberName = sessionStorage.getItem(nameStorageKey) || displayNameRef.current.trim() || 'Guest';
      sessionStorage.setItem(storageKey, token);
      sessionStorage.setItem(nameStorageKey, memberName);
      roomMemberTokenRef.current = token;
      const response = await supabase.rpc('snapsync_join_room', {
        p_room_code: roomCode,
        p_member_token: token,
        p_display_name: memberName,
      });
      if (!mounted) return;
      if (response.error) {
        throw new Error('Room setup is incomplete. Apply the Duo room migration in Supabase, then reload this invite.');
      }

      const room = response.data as {
        status: string;
        role?: RoomRole;
        hostName?: string;
        guestName?: string;
        phase?: RoomPhase;
        layout?: Layout | null;
      };
      if (room.status === 'full') {
        setRoomFull(true);
        return;
      }
      if (room.status === 'ended' || room.status === 'invalid') {
        setRoomEnded(true);
        return;
      }
      if (room.status !== 'joined' || !room.role) {
        throw new Error('Could not join this room. Create a new room or check the invite link.');
      }
      roomRoleRef.current = room.role;
      setRoomRole(room.role);
      setHostName(room.hostName || 'Host');
      setDisplayName((current) => current === 'Guest' && room.role === 'host' ? room.hostName || 'Host' : current);
      setRoomPhase(room.phase || 'waiting');
      if (room.layout) setLayout(room.layout);
      else if (room.role === 'host') setLayout('strip');
      if (room.phase === 'photos') setStep(2);
      if (room.phase === 'design') setStep(3);
      if (room.phase === 'save') setStep(4);
      setRoomError('');

      iceServerConfig = await getRoomIceServers();
      if (!mounted) return;
      channel = supabase.channel(`snapsync-room-${roomCode}`, {
        config: { broadcast: { self: false, ack: true }, presence: { key: peerId } },
      });
      channelRef.current = channel;
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!mounted || !channel) return;
          const presenceState = channel.presenceState() as Record<string, Array<{
            displayName?: string;
            role?: RoomRole;
            cameraReady?: boolean;
          }>>;
          const others = Object.entries(presenceState).flatMap(([id, entries]) => {
            if (id === peerId || !entries[0]) return [];
            return [{
              id,
              name: entries[0].displayName || 'Guest',
              role: entries[0].role || 'guest',
              cameraReady: entries[0].cameraReady === true,
            }];
          });
          setRoomParticipantDetails(others);
          setRoomParticipants(others.map(({ id }) => id));
          setPartnerOnline(others.length > 0);
          const guestIsPresent = others.some(({ role }) => role === 'guest');
          const hostIsPresent = others.some(({ role }) => role === 'host');
          const presentHost = others.find(({ role }) => role === 'host');
          if (presentHost && roomRoleRef.current === 'guest') setHostName(presentHost.name);
          if (roomRoleRef.current === 'host') {
            if (guestIsPresent) {
              hasSeenGuestRef.current = true;
              setGuestDisconnected(false);
              setReconnectExpired(false);
              if (disconnectTimeoutRef.current !== null) {
                window.clearTimeout(disconnectTimeoutRef.current);
                disconnectTimeoutRef.current = null;
              }
            } else if (hasSeenGuestRef.current && disconnectTimeoutRef.current === null) {
              setGuestDisconnected(true);
              disconnectTimeoutRef.current = window.setTimeout(() => {
                setReconnectExpired(true);
                disconnectTimeoutRef.current = null;
              }, 30_000);
            }
          } else if (roomRoleRef.current === 'guest') {
            if (hostIsPresent) {
              hasSeenHostRef.current = true;
            } else if (hasSeenHostRef.current) {
              setRoomError('The host left the room.');
              stopCameraRef.current();
              router.replace('/');
            }
          }

          for (const [otherPeerId, connection] of peerConnections) {
            if (!others.some(({ id }) => id === otherPeerId)) {
              connection.close();
              peerConnections.delete(otherPeerId);
              offeredPeers.delete(otherPeerId);
              pendingCandidates.delete(otherPeerId);
              setRemoteVideoStreams((current) => {
                const next = new Map(current);
                next.delete(otherPeerId);
                return next;
              });
            }
          }
          const localCameraReady = streamRef.current?.active === true
            && streamRef.current.getVideoTracks().some((track) => track.readyState === 'live');
          if (!localCameraReady) return;
          for (const { id: otherPeerId } of others) {
            const participant = others.find(({ id }) => id === otherPeerId);
            if (!participant?.cameraReady) continue;
            let connection = peerConnections.get(otherPeerId);
            if (!connection) connection = makePeerConnection(otherPeerId);
            if (peerId < otherPeerId && !offeredPeers.has(otherPeerId)) {
              offeredPeers.add(otherPeerId);
              void (async () => {
                const offer = await connection.createOffer();
                await connection.setLocalDescription(offer);
                await channel?.send({
                  type: 'broadcast',
                  event: 'room-signal',
                  payload: {
                    from: peerId,
                    to: otherPeerId,
                    description: connection.localDescription?.toJSON(),
                  } satisfies RoomSignal,
                });
              })().catch(() => setRoomError('Could not start live video. Rejoin the room and try again.'));
            }
          }
        })
        .on('broadcast', { event: 'room-signal' }, ({ payload }) => {
          const signal = payload as RoomSignal;
          if (!mounted || signal.to !== peerId) return;
          let connection = peerConnections.get(signal.from);
          if (!connection) connection = makePeerConnection(signal.from);
          void (async () => {
            if (signal.description) {
              await connection.setRemoteDescription(signal.description);
              for (const candidate of pendingCandidates.get(signal.from) ?? []) {
                await connection.addIceCandidate(candidate);
              }
              pendingCandidates.delete(signal.from);
              if (signal.description.type === 'offer') {
                const answer = await connection.createAnswer();
                await connection.setLocalDescription(answer);
                await channel?.send({
                  type: 'broadcast',
                  event: 'room-signal',
                  payload: {
                    from: peerId,
                    to: signal.from,
                    description: connection.localDescription?.toJSON(),
                  } satisfies RoomSignal,
                });
              }
            } else if (signal.candidate) {
              if (connection.remoteDescription) await connection.addIceCandidate(signal.candidate);
              else pendingCandidates.set(signal.from, [...(pendingCandidates.get(signal.from) ?? []), signal.candidate]);
            }
          })().catch(() => setRoomError('Live video could not connect. Check your network and try again.'));
        })
        .on('broadcast', { event: 'room-state' }, ({ payload }) => {
          const message = payload as RoomBroadcast;
          if (!mounted) return;
          if (message.event === 'session-start' && typeof message.payload.layout === 'string') {
            const nextLayout = PHOTO_LAYOUTS.find((option) => option.id === message.payload.layout)?.id;
            if (!nextLayout) return;
            setLayout(nextLayout);
            setRoomPhase('photos');
            setStep(2);
          } else if (message.event === 'layout-update' && roomRoleRef.current === 'guest' && typeof message.payload.layout === 'string') {
            const nextLayout = PHOTO_LAYOUTS.find((option) => option.id === message.payload.layout)?.id;
            if (nextLayout) setLayout(nextLayout);
          } else if (message.event === 'session-phase' && typeof message.payload.phase === 'string') {
            const phase = message.payload.phase as RoomPhase;
            setRoomPhase(phase);
            if (phase === 'design') {
              stopCameraRef.current();
              setStep(3);
            }
            if (phase === 'save') setStep(4);
          } else if (message.event === 'camera-filter' && typeof message.payload.filter === 'string') {
            const filter = CAMERA_FILTERS.find((option) => option.id === message.payload.filter);
            if (filter) setCameraFilter(filter.id);
          } else if (message.event === 'capture-start' && typeof message.payload.index === 'number' && typeof message.payload.captureAt === 'number') {
            if (message.payload.isRetake === true) {
              roomCapturePairsRef.current.delete(message.payload.index);
              completedRoomCapturesRef.current.delete(message.payload.index);
              scheduledRoomCapturesRef.current.delete(message.payload.index);
              setDuoPhotoPairs((current) => current.map((pair, index) => index === message.payload.index ? undefined : pair));
              setSelectedPhotoForRetake(message.payload.index);
              setShowFinalConfirmation(false);
            }
            scheduleRoomCapture(message.payload.index, message.payload.captureAt - clockOffsetRef.current);
          } else if (message.event === 'clock-ping' && roomRoleRef.current === 'host' && typeof message.payload.clientSentAt === 'number') {
            void channel?.send({
              type: 'broadcast',
              event: 'room-state',
              payload: { event: 'clock-pong', payload: { clientSentAt: message.payload.clientSentAt, hostTime: Date.now() } },
            });
          } else if (message.event === 'clock-pong' && roomRoleRef.current === 'guest' && typeof message.payload.clientSentAt === 'number' && typeof message.payload.hostTime === 'number') {
            clockOffsetRef.current = message.payload.hostTime - (message.payload.clientSentAt + Date.now()) / 2;
          } else if (message.event === 'room-photo' && typeof message.payload.index === 'number' && typeof message.payload.photo === 'string') {
            const pair = roomCapturePairsRef.current.get(message.payload.index) ?? {};
            pair.remote = message.payload.photo;
            roomCapturePairsRef.current.set(message.payload.index, pair);
            void completeRoomCaptureRef.current(message.payload.index);
          } else if (message.event === 'retake-request' && typeof message.payload.index === 'number' && roomRoleRef.current === 'host') {
            setPendingRetakeRequest(message.payload.index);
          } else if (message.event === 'retake-approved' && typeof message.payload.index === 'number') {
            roomCapturePairsRef.current.delete(message.payload.index);
            completedRoomCapturesRef.current.delete(message.payload.index);
            scheduledRoomCapturesRef.current.delete(message.payload.index);
            setDuoPhotoPairs((current) => current.map((pair, index) => index === message.payload.index ? undefined : pair));
            setSelectedPhotoForRetake(message.payload.index);
            setShowFinalConfirmation(false);
          } else if (message.event === 'retake-declined' && typeof message.payload.index === 'number') {
            setNotice(`The host declined the retake request for photo ${message.payload.index + 1}.`);
          } else if (message.event === 'retake-cancelled' && typeof message.payload.index === 'number') {
            setSelectedPhotoForRetake((current) => current === message.payload.index ? null : current);
            setShowFinalConfirmation(true);
          } else if (message.event === 'design-update' && roomRoleRef.current === 'guest') {
            const state = message.payload;
            if (typeof state.frameColor === 'string' && state.frameColor in FRAME_COLORS) setFrameColor(state.frameColor as FrameColor);
            if (typeof state.frameThemeId === 'string' && state.frameThemeId in FRAME_THEMES) setFrameThemeId(state.frameThemeId as FrameThemeId);
            if (typeof state.frameName === 'string') setFrameName(state.frameName);
            if (typeof state.customFrameColor === 'string') setCustomFrameColor(state.customFrameColor);
            if (typeof state.showFrameText === 'boolean') setShowFrameText(state.showFrameText);
            if (typeof state.customFrameMessage === 'string') setCustomFrameMessage(state.customFrameMessage);
            if (Array.isArray(state.stickers)) setStickers(state.stickers as StickerPlacement[]);
            if (typeof state.layout === 'string' && PHOTO_LAYOUTS.some((option) => option.id === state.layout)) {
              setLayout(state.layout as Layout);
            }
            if (Array.isArray(state.photoPositions) && state.photoPositions.every((position) =>
              typeof position === 'object'
              && position !== null
              && 'x' in position
              && typeof position.x === 'number'
              && 'y' in position
              && typeof position.y === 'number')) {
              setPhotoPositions(state.photoPositions as PhotoPosition[]);
            }
          } else if (message.event === 'final-image' && typeof message.payload.image === 'string') {
            setCreatedImage(message.payload.image);
            setRoomPhase('save');
            setStep(4);
          } else if (message.event === 'final-image-chunk'
            && typeof message.payload.transferId === 'string'
            && typeof message.payload.index === 'number'
            && typeof message.payload.total === 'number'
            && typeof message.payload.chunk === 'string') {
            const transfer = imageTransferRef.current.get(message.payload.transferId) ?? {
              chunks: new Map<number, string>(),
              total: message.payload.total,
            };
            transfer.chunks.set(message.payload.index, message.payload.chunk);
            imageTransferRef.current.set(message.payload.transferId, transfer);
            if (transfer.chunks.size === transfer.total) {
              const image = Array.from({ length: transfer.total }, (_, index) => transfer.chunks.get(index) ?? '').join('');
              imageTransferRef.current.delete(message.payload.transferId);
              setCreatedImage(image);
              setRoomPhase('save');
              setStep(4);
            }
          } else if (message.event === 'room-ended') {
            setRoomEnded(true);
            setRoomError('The host ended this room.');
            if (roomRoleRef.current === 'guest') router.replace('/');
          }
        })
        .subscribe(async (status) => {
          if (!mounted || !channel) return;
          if (status === 'SUBSCRIBED') {
            setRoomConnected(true);
            setRoomError('');
            await channel.track({
              displayName: displayNameRef.current.trim() || (room.role === 'host' ? 'Host' : 'Guest'),
              role: room.role,
              cameraReady: streamRef.current?.active === true,
            });
            if (room.role === 'guest') {
              await channel.send({
                type: 'broadcast',
                event: 'room-state',
                payload: { event: 'clock-ping', payload: { clientSentAt: Date.now() } },
              });
            }
            heartbeat = window.setInterval(async () => {
              const { data, error } = await supabase.rpc('snapsync_touch_room', {
                p_room_code: roomCode,
                p_member_token: roomMemberTokenRef.current,
              });
              if (error) {
                setRoomError('Could not keep the room active. Check your Supabase connection.');
              } else if ((data as { status?: string } | null)?.status === 'ended') {
                setRoomEnded(true);
                setStep(1);
                stopCameraRef.current();
              } else if ((data as { status?: string } | null)?.status !== 'active') {
                setRoomError('Room membership could not be verified. Leave and rejoin using your invite link.');
              }
            }, 15_000);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setRoomConnected(false);
            setRoomError('Could not connect to this room. Check your internet connection and Supabase Realtime settings.');
          }
        });
    };

    void joinAndConnect().catch((error: unknown) => {
      if (!mounted) return;
      setRoomError(error instanceof Error ? error.message : 'Could not join this room.');
    });

    return () => {
      mounted = false;
      channelRef.current = null;
      if (heartbeat !== null) window.clearInterval(heartbeat);
      if (disconnectTimeoutRef.current !== null) window.clearTimeout(disconnectTimeoutRef.current);
      if (channel) void supabase.removeChannel(channel);
      for (const connection of peerConnections.values()) connection.close();
      peerConnections.clear();
      offeredPeers.clear();
      pendingCandidates.clear();
      if (countdownIntervalRef.current !== null) window.clearInterval(countdownIntervalRef.current);
      stopCameraRef.current();
    };
  }, [isDuo, roomCode, router]);

  useEffect(() => {
    if (cameraReady && streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track || track.readyState !== 'live') setRoomError('Your camera is not sending video. Turn it off and on to reconnect.');
      for (const connection of peerConnectionsRef.current.values()) {
        const sender = connection.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === 'video')?.sender;
        if (sender && sender.track !== track) {
          void sender.replaceTrack(track ?? null).catch(() => {
            setRoomError('Your camera restarted but could not reconnect to your Guest. Please rejoin the room.');
          });
        }
      }
    }
    if (isDuo && roomRole) {
      sessionStorage.setItem(`snapsync-room-name-${roomCode}`, displayName.trim() || (roomRole === 'host' ? 'Host' : 'Guest'));
      void channelRef.current?.track({
        displayName: displayName.trim() || (roomRole === 'host' ? 'Host' : 'Guest'),
        role: roomRole,
        cameraReady: cameraReady && streamRef.current?.active === true,
      });
    }
  }, [cameraReady, displayName, isDuo, roomCode, roomRole]);

  useEffect(() => {
    if (!isDuo || roomRole !== 'host' || roomParticipantDetails.length === 0 || !channelRef.current) return;
    if (roomPhase === 'photos' || roomPhase === 'design' || roomPhase === 'save') {
      void channelRef.current.send({
        type: 'broadcast',
        event: 'room-state',
        payload: {
          event: 'design-update',
          payload: {
            frameColor,
            customFrameColor,
            showFrameText,
            customFrameMessage,
            frameThemeId,
            frameName,
            stickers,
            layout,
            photoPositions,
          },
        },
      });
    }
    if (roomPhase === 'save' && createdImage && lastFinalImageSentRef.current !== createdImage) {
      lastFinalImageSentRef.current = createdImage;
      void sendFinalImage(createdImage).then((sent) => {
        if (!sent) lastFinalImageSentRef.current = '';
      });
    }
  }, [createdImage, customFrameColor, customFrameMessage, frameColor, frameName, frameThemeId, isDuo, layout, photoPositions, roomParticipantDetails, roomPhase, roomRole, showFrameText, stickers]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (captureScrollTimeoutRef.current !== null) {
      window.clearTimeout(captureScrollTimeoutRef.current);
      captureScrollTimeoutRef.current = null;
    }
    setCountdown(null);
  }, []);
  stopCameraRef.current = stopCamera;

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
      }
      if (captureScrollTimeoutRef.current !== null) {
        window.clearTimeout(captureScrollTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (streamRef.current?.active) {
          setCameraError('Your camera is on, but the browser could not display its preview. Check camera permissions and try again.');
        }
      });
    }
  }, [cameraReady, step]);

  useEffect(() => {
    if (cameraReady && window.matchMedia('(max-width: 850px)').matches) {
      cameraStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [cameraReady]);

  async function startCamera() {
    if (!layout && !isDuo) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires a supported browser and a secure connection.');
      return;
    }
    setStartingCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraReady(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setCameraError('Camera access was blocked. Allow camera permission in your browser, then try again.');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setCameraError('No camera was found. Connect a camera and try again.');
      } else {
        setCameraError('The camera could not be started. Check that it is connected and not in use.');
      }
    } finally {
      setStartingCamera(false);
    }
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(success);
    } catch {
      setNotice('Clipboard access is unavailable in this browser.');
    }
  }

  function joinRoom() {
    const code = roomCodeInput.trim().toUpperCase();
    if (!/^[A-F0-9]{32}$/.test(code)) {
      setRoomError('Enter the 32-character room code from the invite link.');
      return;
    }
    setRoomError('');
    setRoomConnected(false);
    setPartnerOnline(false);
    setRoomParticipants([]);
    sessionStorage.setItem(`snapsync-room-name-${code}`, displayName.trim() || 'Guest');
    setRoomCodeInput('');
    router.push(`/room/${code}`);
  }

  async function createDuoRoom() {
    setRoomError('');
    setRoomFull(false);
    setRoomEnded(false);
    const roomCodeValue = createRoomCode();
    const token = createRoomToken();
    const name = displayName.trim() || 'Host';
    const { data, error } = await supabase.rpc('snapsync_create_room', {
      p_room_code: roomCodeValue,
      p_member_token: token,
      p_host_name: name,
    });
    if (error) {
      if (error.code === 'PGRST202') {
        setRoomError('Supabase cannot find the room-creation function. Run supabase/migrations/20261103000000_duo_rooms.sql in your Supabase SQL Editor, then refresh this page. If you already ran it, refresh the Supabase API schema cache.');
      } else {
        setRoomError(`Supabase could not create the room${error.code ? ` (${error.code})` : ''}: ${error.message}`);
      }
      return;
    }
    if ((data as { status?: string } | null)?.status !== 'created') {
      setRoomError('Could not create a unique room. Please try again.');
      return;
    }
    sessionStorage.setItem(`snapsync-room-member-${roomCodeValue}`, token);
    sessionStorage.setItem(`snapsync-room-name-${roomCodeValue}`, name);
    roomMemberTokenRef.current = token;
    roomRoleRef.current = 'host';
    setRoomRole('host');
    setDisplayName(name);
    router.push(`/room/${roomCodeValue}`);
  }

  async function sendRoomState(event: string, payload: Record<string, unknown>) {
    const channel = channelRef.current;
    if (!channel) {
      setRoomError('The room connection is not ready yet. Please wait and try again.');
      return false;
    }
    const status = await channel.send({
      type: 'broadcast',
      event: 'room-state',
      payload: { event, payload },
    });
    if (status !== 'ok') {
      setRoomError('Could not send this update to the room. Check your connection and try again.');
      return false;
    }
    return true;
  }

  async function sendFinalImage(image: string) {
    const channel = channelRef.current;
    if (!channel) {
      setRoomError('The room connection is not ready to send the finished photo.');
      return false;
    }
    const transferId = crypto.randomUUID();
    const chunkSize = 60_000;
    const total = Math.ceil(image.length / chunkSize);
    try {
      for (let index = 0; index < total; index += 1) {
        const status = await channel.send({
          type: 'broadcast',
          event: 'room-state',
          payload: {
            event: 'final-image-chunk',
            payload: { transferId, index, total, chunk: image.slice(index * chunkSize, (index + 1) * chunkSize) },
          },
        });
        if (status !== 'ok') {
          setRoomError('Could not send the finished photo to your Guest. Check your connection and try again.');
          return false;
        }
      }
    } catch {
      setRoomError('Could not send the finished photo to your Guest. Check your connection and try again.');
      return false;
    }
    return true;
  }

  async function continueToDesign() {
    if (isDuo && roomRole !== 'host') return;
    if (photos.length !== photoLimit || selectedPhotoForRetake !== null || countdown !== null) return;
    if (isDuo) {
      const { data, error } = await supabase.rpc('snapsync_set_room_phase', {
        p_room_code: roomCode,
        p_member_token: roomMemberTokenRef.current,
        p_phase: 'design',
      });
      if (error || (data as { status?: string } | null)?.status !== 'updated') {
        setRoomError('Could not move the room to Design. Check the room connection and try again.');
        return;
      }
      setRoomPhase('design');
      await sendRoomState('session-phase', { phase: 'design' });
    }
    if (isDuo) stopCamera();
    setStep(3);
  }

  async function startDuoSession() {
    if (roomRole !== 'host' || !layout) return;
    if (!cameraReady || roomParticipantDetails.length !== 1 || !roomParticipantDetails[0]?.cameraReady) {
      setRoomError('Both people need to join and allow camera access before the booth can start.');
      return;
    }
    const { data, error } = await supabase.rpc('snapsync_set_room_phase', {
      p_room_code: roomCode,
      p_member_token: roomMemberTokenRef.current,
      p_phase: 'photos',
      p_layout: layout,
      p_photo_limit: PHOTO_LAYOUTS.find((item) => item.id === layout)?.photoCount ?? 4,
    });
    if (error || (data as { status?: string } | null)?.status !== 'updated') {
      setRoomError('Could not start the booth. The room may have expired; create a new room and invite your guest again.');
      return;
    }
    setRoomPhase('photos');
    await sendRoomState('session-start', { layout });
    setStep(2);
  }

  async function closeDuoRoom() {
    if (roomRole === 'host' && roomCode) {
      const { data, error } = await supabase.rpc('snapsync_set_room_phase', {
        p_room_code: roomCode,
        p_member_token: roomMemberTokenRef.current,
        p_phase: 'ended',
      });
      if (error || (data as { status?: string } | null)?.status !== 'updated') {
        setRoomError('Could not end the room on the server. Check your connection and try again.');
        return;
      }
      await sendRoomState('room-ended', {});
    }
    stopCamera();
    setRoomCode('');
    setRoomRole(null);
    setRoomConnected(false);
    setRoomParticipants([]);
    setRoomParticipantDetails([]);
    setStep(1);
    router.replace('/booth?mode=duo');
  }

  async function beginRoomCapture() {
    if (roomRole !== 'host' || !cameraReady || !layout) return;
    const shotIndex = selectedPhotoForRetake ?? photos.length;
    if (shotIndex >= photoLimit) return;
    if (shotIndex < photos.length) {
      roomCapturePairsRef.current.delete(shotIndex);
      completedRoomCapturesRef.current.delete(shotIndex);
      scheduledRoomCapturesRef.current.delete(shotIndex);
      setDuoPhotoPairs((current) => current.map((pair, index) => index === shotIndex ? undefined : pair));
      setShowFinalConfirmation(false);
    }
    const delay = timerSeconds || 3;
    const captureAt = Date.now() + delay * 1000;
    await sendRoomState('capture-start', { index: shotIndex, captureAt, isRetake: shotIndex < photos.length });
    scheduleLocalRoomCapture(shotIndex, captureAt);
  }

  function scheduleLocalRoomCapture(index: number, captureAt: number) {
    scheduledRoomCapturesRef.current.delete(index);
    if (countdownIntervalRef.current !== null) window.clearInterval(countdownIntervalRef.current);
    const update = () => {
      const remaining = captureAt - Date.now();
      if (remaining <= 0) {
        if (countdownIntervalRef.current !== null) window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
        capturePhotoRef.current(index);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    };
    update();
    countdownIntervalRef.current = window.setInterval(update, 50);
  }

  async function requestRetake(index: number) {
    if (roomRole !== 'guest') return;
    await sendRoomState('retake-request', { index });
    setNotice(`Retake requested for photo ${index + 1}; waiting for the host to approve.`);
  }

  async function decideRetake(index: number, approved: boolean) {
    if (roomRole !== 'host') return;
    setPendingRetakeRequest(null);
    await sendRoomState(approved ? 'retake-approved' : 'retake-declined', { index });
    if (approved) {
      roomCapturePairsRef.current.delete(index);
      completedRoomCapturesRef.current.delete(index);
      scheduledRoomCapturesRef.current.delete(index);
      setDuoPhotoPairs((current) => current.map((pair, photoIndex) => photoIndex === index ? undefined : pair));
      setSelectedPhotoForRetake(index);
      setShowFinalConfirmation(false);
    }
  }

  async function completeRoomCapture(index: number) {
    if (completedRoomCapturesRef.current.has(index)) return;
    const pair = roomCapturePairsRef.current.get(index);
    if (!pair?.local || !pair.remote) return;
    completedRoomCapturesRef.current.add(index);
    try {
      const hostImage = roomRoleRef.current === 'host' ? pair.local : pair.remote;
      const guestImage = roomRoleRef.current === 'host' ? pair.remote : pair.local;
      if (roomCapturePairsRef.current.get(index) !== pair) return;
      setDuoPhotoPairs((current) => {
        const next = [...current];
        next[index] = { host: hostImage, guest: guestImage };
        return next;
      });
      setPhotos((current) => {
        const next = [...current];
        next[index] = hostImage;
        return next;
      });
      setPhotoPositions((current) => {
        const next = [...current];
        next[index] = { x: 50, y: 35, zoom: 1 };
        return next;
      });
      setSelectedPhotoForRetake((current) => current === index ? null : current);
      setCameraError('');
      if (completedRoomCapturesRef.current.size >= photoLimit) {
        setShowFinalConfirmation(true);
      }
    } catch {
      if (roomCapturePairsRef.current.get(index) === pair) {
        completedRoomCapturesRef.current.delete(index);
        setCameraError('Could not prepare both photos. Please retake this shot.');
      }
    }
  }
  completeRoomCaptureRef.current = (index) => {
    void completeRoomCapture(index);
  };

  function takePhoto(roomShotIndex?: number) {
    const video = videoRef.current;
    const shotIndex = roomShotIndex ?? selectedPhotoForRetake ?? photos.length;
    const isReplacingPhoto = selectedPhotoForRetake !== null || (isDuo && shotIndex < photos.length);
    if (
      !layout ||
      !video ||
      !video.videoWidth ||
      (!isDuo && photos.length >= photoLimit && !isReplacingPhoto) ||
      (isDuo && roomRoleRef.current === 'guest' && roomShotIndex === undefined)
    ) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture this photo. Please try again.');
      return;
    }
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.filter = CAMERA_FILTERS.find((filter) => filter.id === cameraFilter)?.css ?? 'none';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.filter = 'none';
    const photo = canvas.toDataURL('image/jpeg', 0.88);
    if (isDuo && roomShotIndex !== undefined) {
      const sharedPhoto = photo;
      roomCapturePairsRef.current.set(roomShotIndex, {
        ...roomCapturePairsRef.current.get(roomShotIndex),
        local: sharedPhoto,
      });
      void channelRef.current?.send({
        type: 'broadcast',
        event: 'room-state',
        payload: { event: 'room-photo', payload: { index: roomShotIndex, photo: sharedPhoto } },
      }).then((status) => {
        if (status !== 'ok') setCameraError('Could not send your photo to the other person. Check your connection and retry.');
      });
      void completeRoomCapture(roomShotIndex);
      setCameraError('');
      return;
    }
    if (isReplacingPhoto) {
      const index = selectedPhotoForRetake;
      setPhotos((current) => current.map((currentPhoto, photoIndex) => photoIndex === index ? photo : currentPhoto));
      setPhotoPositions((current) => current.map((position, photoIndex) => photoIndex === index ? { x: 50, y: 35, zoom: 1 } : position));
      setSelectedPhotoForRetake(null);
    } else {
      setPhotos((current) => [...current, photo]);
      setPhotoPositions((current) => [...current, { x: 50, y: 35, zoom: 1 }]);
    }

    setCameraError('');
    if (!isReplacingPhoto && photos.length + 1 === photoLimit) {
      stopCamera();
      setShowFinalConfirmation(true);
    } else if (isReplacingPhoto && photos.length === photoLimit) {
      stopCamera();
      setShowFinalConfirmation(true);
    }
  }

  function removeSelectedPhoto() {
    if (selectedPhotoForRetake === null) return;
    const index = selectedPhotoForRetake;
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setDuoPhotoPairs((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setPhotoPositions((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setSelectedPhoto((current) => current === index ? Math.max(0, index - 1) : current > index ? current - 1 : current);
    setSelectedPhotoForRetake(null);
    setShowFinalConfirmation(false);
    setCameraError('');
  }

  function retakeAllPhotos() {
    cancelCountdown();
    setPhotos([]);
    setDuoPhotoPairs([]);
    setPhotoPositions([]);
    setSelectedPhoto(0);
    setSelectedPhotoForRetake(null);
    setShowFinalConfirmation(false);
    setCameraError('');
  }

  useEffect(() => {
    capturePhotoRef.current = takePhoto;
  });

  function cancelCountdown() {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  }

  function selectCameraFilter(filter: CameraFilter) {
    if (isDuo && roomRole !== 'host') return;
    setCameraFilter(filter);
    if (isDuo) void sendRoomState('camera-filter', { filter });
  }

  function selectLayout(nextLayout: Layout) {
    if (isDuo && roomRole !== 'host') return;
    if (photos.length > 0) return;
    setLayout(nextLayout);
    if (isDuo) void sendRoomState('layout-update', { layout: nextLayout });
  }

  function startCapture() {
    if (isDuo) {
      if (roomRole === 'host') {
        if (!roomParticipantDetails.some((participant) => participant.role === 'guest' && participant.cameraReady)) {
          setRoomError('Ask your Guest to turn their camera back on before taking or retaking a photo.');
          return;
        }
        void beginRoomCapture();
      }
      return;
    }
    if (timerSeconds === 0) {
      takePhoto();
      return;
    }
    if (countdownIntervalRef.current !== null) return;

    let secondsRemaining = timerSeconds;
    setCountdown(secondsRemaining);
    const interval = window.setInterval(() => {
      secondsRemaining -= 1;
      if (secondsRemaining === 0) {
        window.clearInterval(interval);
        countdownIntervalRef.current = null;
        setCountdown(null);
        capturePhotoRef.current();
      } else {
        setCountdown(secondsRemaining);
      }
    }, 1000);
    countdownIntervalRef.current = interval;
  }

  function captureFromButton() {
    if (captureScrollTimeoutRef.current !== null) return;
    if (!cameraStageRef.current) {
      startCapture();
      return;
    }

    cameraStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (timerSeconds === 0) {
      captureScrollTimeoutRef.current = window.setTimeout(() => {
        captureScrollTimeoutRef.current = null;
        startCapture();
      }, 450);
      return;
    }
    startCapture();
  }

  function updatePhotoPosition(axis: keyof PhotoPosition, value: number) {
    const current = photoPositions[selectedPhoto] ?? { x: 50, y: 35, zoom: 1 };
    const nextPosition = { ...current, [axis]: value };
    setPhotoPositions((positions) => alignAllPhotos
      ? photos.map(() => nextPosition)
      : positions.map((position, index) => index === selectedPhoto ? nextPosition : position));
  }

  function addSticker(id: string) {
    const key = crypto.randomUUID();
    setStickers((current) => [
      ...current,
      {
        key,
        stickerId: id,
        x: 68 + (current.length % 3) * 8,
        y: 24 + (current.length % 4) * 12,
        size: 35,
        rotation: 0,
      },
    ]);
    setSelectedStickerKey(key);
  }

  function setStickerPositionInsidePreview(key: string, x: number, y: number, size = 22) {
    const bounds = photoDesignRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    const stickerPixels = bounds.width * size / 100;
    const halfWidth = stickerPixels / 2 / bounds.width * 100;
    const halfHeight = stickerPixels / 2 / bounds.height * 100;
    setStickers((current) => current.map((sticker) => sticker.key === key
      ? {
          ...sticker,
          x: Math.max(halfWidth, Math.min(100 - halfWidth, x)),
          y: Math.max(halfHeight, Math.min(100 - halfHeight, y)),
        }
      : sticker));
  }

  function moveSticker(event: ReactPointerEvent<HTMLButtonElement>, key: string, size: number) {
    const bounds = photoDesignRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    setStickerPositionInsidePreview(
      key,
      ((event.clientX - bounds.left) / bounds.width) * 100,
      ((event.clientY - bounds.top) / bounds.height) * 100,
      size,
    );
  }

  function updateSticker(key: string, property: 'size' | 'rotation', value: number) {
    setStickers((current) => current.map((sticker) => sticker.key === key
      ? { ...sticker, [property]: value }
      : sticker));
  }

  async function makeCreation() {
    if (isDuo && roomRole !== 'host') return;
    if (!photos.length || !layout || !frameSvgRef.current) return;
    setBusy(true);
    setCameraError('');
    try {
      await document.fonts.ready;
      const svg = frameSvgRef.current.cloneNode(true) as SVGSVGElement;
      const photoNodes = Array.from(svg.querySelectorAll<SVGImageElement>('image[data-frame-photo]'));
      const stickerNodes = Array.from(svg.querySelectorAll<SVGImageElement>('image[data-frame-sticker]'));
      await Promise.all([
        ...photoNodes.map(async (node) => {
          const source = node.getAttribute('href');
          if (!source) throw new Error('A photo could not be loaded.');
          const image = await loadImage(source);
          const width = Number(node.dataset.fitWidth);
          const height = Number(node.dataset.fitHeight);
          const x = Number(node.dataset.fitX);
          const y = Number(node.dataset.fitY);
          const positionX = Number(node.dataset.positionX);
          const positionY = Number(node.dataset.positionY);
          const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * Math.max(1, Number(node.dataset.zoom ?? 1));
          const drawWidth = image.naturalWidth * scale;
          const drawHeight = image.naturalHeight * scale;
          node.setAttribute('x', String(x + (width - drawWidth) * positionX / 100));
          node.setAttribute('y', String(y + (height - drawHeight) * positionY / 100));
          node.setAttribute('width', String(drawWidth));
          node.setAttribute('height', String(drawHeight));
        }),
        ...stickerNodes.map(async (node) => {
          const source = node.getAttribute('href');
          if (!source) throw new Error('A sticker could not be loaded.');
          const image = await loadImage(source);
          const imageCanvas = document.createElement('canvas');
          imageCanvas.width = image.naturalWidth;
          imageCanvas.height = image.naturalHeight;
          const imageContext = imageCanvas.getContext('2d');
          if (!imageContext) throw new Error('A sticker could not be prepared.');
          imageContext.drawImage(image, 0, 0);
          node.setAttribute('href', imageCanvas.toDataURL('image/png'));
        }),
      ]);
      const exportWidth = FRAME_LAYOUTS[layout].width * 2;
      svg.setAttribute('width', String(exportWidth));
      svg.setAttribute('height', '3600');
      const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      let renderedSvg: HTMLImageElement;
      try {
        renderedSvg = await loadImage(svgUrl);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = 3600;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare the photo layout.');
      context.drawImage(renderedSvg, 0, 0, canvas.width, canvas.height);
      const finalImage = canvas.toDataURL('image/jpeg', 0.94);
      setCreatedImage(finalImage);
      stopCamera();
      if (isDuo) {
        const { data, error } = await supabase.rpc('snapsync_set_room_phase', {
          p_room_code: roomCode,
          p_member_token: roomMemberTokenRef.current,
          p_phase: 'save',
        });
        if (error || (data as { status?: string } | null)?.status !== 'updated') {
          setRoomError('The final image was created, but the room could not be moved to Save.');
        } else {
          lastFinalImageSentRef.current = finalImage;
          const sent = await sendFinalImage(finalImage);
          if (!sent) lastFinalImageSentRef.current = '';
        }
        setRoomPhase('save');
      }
      setStep(4);
    } catch {
      setCameraError('Could not prepare the photo layout. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function downloadCreation() {
    if (!createdImage) return;
    const anchor = document.createElement('a');
    anchor.download = 'snapsync-photo.jpg';
    anchor.href = createdImage;
    anchor.click();
  }

  function saveToGallery() {
    if (!createdImage) return;
    try {
      const stored = localStorage.getItem(GALLERY_KEY);
      const gallery: { id: string; image: string; createdAt: string }[] = stored ? JSON.parse(stored) : [];
      gallery.unshift({ id: crypto.randomUUID(), image: createdImage, createdAt: new Date().toISOString() });
      localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery.slice(0, 12)));
      window.dispatchEvent(new Event('snapsync-gallery-change'));
      setSaved(true);
      setNotice('Saved to this device’s gallery.');
    } catch {
      setNotice('The gallery is full. Download this photo to keep it.');
    }
  }

  async function shareCreation() {
    if (!createdImage) return;
    try {
      const response = await fetch(createdImage);
      const file = new File([await response.blob()], 'snapsync-photo.jpg', { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: 'My SnapSync photo', files: [file] });
      } else {
        await copyText(window.location.href, 'Link copied. Download the image to share the photo itself.');
      }
    } catch {
      setNotice('Sharing was cancelled or unavailable. You can still download your photo.');
    }
  }

  const visibleSteps = [
    { number: 1, label: isDuo ? 'Invite' : 'Start' },
    { number: 2, label: 'Photos' },
    { number: 3, label: 'Design' },
    { number: 4, label: 'Save' },
  ] as const;
  const allCapturedFrames = photos.map((image, index) => ({
    image,
    position: photoPositions[index] ?? { x: 50, y: 35, zoom: 1 },
  }));
  const allCaptured = allCapturedFrames.map(({ image }) => image);
  const layoutLabel = PHOTO_LAYOUTS.find((option) => option.id === layout)?.label ?? 'Photos';
  const remainingPhotoCount = photoLimit - photos.length;
  const photoHint =
    remainingPhotoCount === 0
      ? 'Your photos are ready to customize.'
      : `${remainingPhotoCount} ${remainingPhotoCount === 1 ? 'photo' : 'photos'} left.`;
  const frameTheme = getFrameTheme(frameColor, customFrameColor);
  const selectedLayout: FrameLayoutId = layout ?? 'strip';
  const photoDesignClass = styles.photoDesign;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link aria-label="Back to SnapSync home" className={styles.brand} href="/">
          <span className={styles.brandMark}><Icon className={styles.brandIcon} name="camera" /></span>
          Snap<span>Sync</span>
        </Link>
        <nav aria-label="Photo booth steps" className={styles.steps}>
          {visibleSteps.map(({ number, label }) => (
            <button
              aria-current={step === number ? 'step' : undefined}
                className={[styles.step, step === number ? styles.activeStep : '', step > number ? styles.completeStep : ''].filter(Boolean).join(' ')}
              disabled={number > step}
              key={number}
              onClick={() => {
                cancelCountdown();
                setStep(number as Step);
              }}
              type="button"
            >
              <i>{step > number ? '✓' : number}</i>{label}
            </button>
          ))}
        </nav>
        <Link className={styles.backLink} href="/">Back home</Link>
      </header>

      <section className={styles.booth} aria-labelledby="booth-title">
        <div className={styles.intro}>
          <span className={styles.eyebrow}><Icon name="sparkles" /> {isDuo ? 'DUO REMOTE BOOTH' : 'YOUR SOLO BOOTH'}</span>
          <h1 id="booth-title">
            {step === 1 ? isDuo ? <>Invite your <span>person.</span></> : <>A photo layout, <span>made by you.</span></> : step === 2 ? <>Take your <span>photos.</span></> : step === 3 ? <>Make it <span>your style.</span></> : <>Your photos are <span>ready.</span></>}
          </h1>
          <p>
            {step === 1 ? isDuo ? 'Invite a friend to take photos with you.' : 'Take a few pictures, pick a frame, and keep your favorite moments.' : step === 2 ? 'Choose a layout, then take the number of photos it shows.' : step === 3 ? 'Pick a theme, position your photos, and add your own words.' : 'Save your photo to your device or share it with someone.'}
          </p>
        </div>

        {isDuo && roomRole === 'host' && guestDisconnected && step !== 1 && (
          <section aria-live="polite" className={styles.disconnectBanner}>
            <p>{roomParticipantDetails.find((person) => person.role === 'guest')?.name ?? 'Guest'} disconnected{reconnectExpired ? ' for 30 seconds.' : ' — trying to reconnect for 30 seconds…'}</p>
            {reconnectExpired && <div className={styles.secondaryActions}><button className={styles.textButton} onClick={() => { setReconnectExpired(false); setGuestDisconnected(false); }} type="button">Keep waiting</button><button className={styles.textButton} onClick={() => void closeDuoRoom()} type="button">End room</button></div>}
          </section>
        )}
        {isDuo && roomError && step !== 1 && <p className={styles.errorInline} role="alert">{roomError}</p>}

        {step === 1 && !isDuo && (
          <section className={styles.startPanel}>
            <span className={styles.startPanelIcon}><Icon name="camera" /></span>
            <h2>Your photo layout in 4 easy steps</h2>
            <ol><li><strong>Choose a layout</strong><span>Pick a classic, double, grid, trio, or Polaroid frame.</span></li><li><strong>Take your photos</strong><span>Your layout shows how many to take.</span></li><li><strong>Choose a frame</strong><span>Pick black or white, and choose whether to include text.</span></li><li><strong>Save your photos</strong><span>Download them or keep them in your gallery.</span></li></ol>
            <button className={styles.captureButton} onClick={() => setStep(2)} type="button">Start taking photos <Icon name="arrow" /></button>
            <p className={styles.hint}>Your browser will ask before the camera turns on.</p>
          </section>
        )}

        {step === 1 && isDuo && (
          <div className={styles.connectGrid}>
            {roomFull || roomEnded ? (
              <section className={styles.connectCard}>
                <span className={styles.controlLabel}>DUO PHOTO BOOTH</span>
                <h2>{roomFull ? 'This room is full' : 'Room ended'}</h2>
                <p>{roomFull ? 'A SnapSync room can have one Host and one Guest. Ask the Host for a fresh invite if you think you should be here.' : 'This room has ended or has been inactive for 30 minutes. Ask the Host to create a new room.'}</p>
                <Link className={styles.captureButton} href="/booth?mode=duo">Back to Duo booth</Link>
              </section>
            ) : !roomCode ? (
              <section className={styles.connectCard}>
                <span className={styles.controlLabel}>DUO REMOTE BOOTH</span>
                <h2>Make photos together, wherever you are</h2>
                <label className={styles.roomLabel} htmlFor="display-name">YOUR DISPLAY NAME</label>
                <input className={styles.roomCodeInput} id="display-name" maxLength={32} onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
                <button className={styles.captureButton} onClick={() => void createDuoRoom()} type="button">Create a room <Icon name="arrow" /></button>
                <div aria-hidden="true" className={styles.roomDivider}><span>OR JOIN AN INVITE</span></div>
                <label className={styles.roomLabel} htmlFor="join-room-code">INVITE CODE</label>
                <input
                  autoComplete="one-time-code"
                  className={styles.roomCodeInput}
                  id="join-room-code"
                  maxLength={32}
                  onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 32))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') joinRoom();
                  }}
                  placeholder="Paste the code from your invite link"
                  value={roomCodeInput}
                />
                <button className={styles.textButton} disabled={roomCodeInput.length !== 32} onClick={joinRoom} type="button">Join room</button>
                {roomError && <p className={styles.errorInline} role="alert">{roomError}</p>}
              </section>
            ) : (
              <>
                <section className={styles.connectCard}>
                  <span className={styles.controlLabel}>{roomRole === 'host' ? 'HOST WAITING ROOM' : 'GUEST WAITING ROOM'}</span>
                  <h2>{roomRole === 'host' ? 'Your room is ready' : roomParticipantDetails.some((participant) => participant.role === 'host') ? `Waiting for ${hostName} to start the booth…` : 'The host hasn’t arrived yet'}</h2>
                  <label className={styles.roomLabel} htmlFor="duo-display-name">DISPLAY NAME</label>
                  <input className={styles.roomCodeInput} id="duo-display-name" maxLength={32} onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
                  {roomRole === 'host' && <>
                    <label className={styles.roomLabel} htmlFor="room-code">PRIVATE ROOM CODE</label>
                    <output className={styles.roomCode} id="room-code">{roomCode}</output>
                    <button className={styles.captureButton} onClick={() => void copyText(window.location.origin + '/room/' + roomCode, 'Invite link copied!')} type="button">Copy invite link</button>
                    <label className={styles.roomLabel} htmlFor="host-layout">PHOTO LAYOUT</label>
                    <select className={styles.roomCodeInput} id="host-layout" onChange={(event) => selectLayout(event.target.value as Layout)} value={layout ?? 'strip'}>
                      {PHOTO_LAYOUTS.map((option) => <option key={option.id} value={option.id}>{option.label} · {option.photoCount} photos</option>)}
                    </select>
                  </>}
                  {roomRole === 'guest' && <p className={styles.waitingMessage}>Waiting for {hostName} to start the booth<span aria-hidden="true" className={styles.waitingDots}>…</span></p>}
                  <div className={styles.localCameraPreview}>
                    {cameraReady ? <video aria-label="Your camera preview" autoPlay muted playsInline ref={attachLocalVideo} /> : <span>Your camera is off</span>}
                  </div>
                  {!cameraReady ? <button className={styles.captureButton} disabled={startingCamera} onClick={() => void startCamera()} type="button">{startingCamera ? 'Opening camera…' : cameraError ? 'Try camera again' : 'Allow camera'}</button> : <p className={styles.connectionPills}>Camera ready · video only, no audio</p>}
                  {cameraError && <p className={styles.errorInline} role="alert">{cameraError}</p>}
                  {roomError && <p className={styles.errorInline} role="alert">{roomError}</p>}
                  {roomRole === 'host' ? (
                    <>
                      <button className={styles.captureButton} disabled={!roomConnected || !cameraReady || !roomParticipantDetails.some((participant) => participant.role === 'guest' && participant.cameraReady)} onClick={() => void startDuoSession()} type="button">Start booth <Icon name="arrow" /></button>
                      <button className={styles.textButton} onClick={() => void closeDuoRoom()} type="button">End room</button>
                    </>
                  ) : <p className={styles.hint}>You can preview your camera while you wait. Only the Host can start the booth.</p>}
                  {guestDisconnected && roomRole === 'host' && <p className={styles.errorInline} role="status">{roomParticipantDetails.find((person) => person.role === 'guest')?.name ?? 'Guest'} disconnected{reconnectExpired ? ' for 30 seconds.' : ' — trying to reconnect for 30 seconds…'}</p>}
                  {reconnectExpired && roomRole === 'host' && <div className={styles.secondaryActions}><button className={styles.textButton} onClick={() => { setReconnectExpired(false); setGuestDisconnected(false); }} type="button">Keep waiting</button><button className={styles.textButton} onClick={() => void closeDuoRoom()} type="button">End room</button></div>}
                </section>
                <section className={[styles.connectCard, styles.waitingCard].join(' ')}>
                  <span className={[styles.partnerIcon, partnerOnline ? styles.partnerReady : ''].filter(Boolean).join(' ')}><Icon name="users" /></span>
                  <h2>{roomRole === 'host' ? roomParticipantDetails.find((participant) => participant.role === 'guest')?.name ? `${roomParticipantDetails.find((participant) => participant.role === 'guest')?.name} joined` : 'Waiting for your Guest' : roomParticipantDetails.some((participant) => participant.role === 'host') ? `${hostName} is here` : 'The host hasn’t arrived yet'}</h2>
                  {roomRole === 'host' && roomParticipantDetails.some((participant) => participant.role === 'guest') ? <div className={styles.localCameraPreview}>{remoteVideoStreams.size > 0 ? <video aria-label="Guest camera preview" autoPlay muted playsInline ref={(element) => {
                    if (!element) return;
                    element.srcObject = remoteVideoStreams.values().next().value ?? null;
                    void element.play().catch(() => {
                      setRoomError('Your browser blocked the Guest camera preview. Allow video playback and refresh the room.');
                    });
                  }} /> : <span>Waiting for Guest camera…</span>}</div> : <p>Room status: {roomConnected ? 'connected' : 'connecting'}. The room link expires after 30 minutes of inactivity.</p>}
                  {roomRole === 'host' && <p>{roomParticipantDetails.find((participant) => participant.role === 'guest')?.cameraReady ? remoteVideoStreams.size > 0 ? 'Guest video connected.' : 'Guest camera is ready · connecting video…' : 'Start is enabled when the Guest joins and both cameras are ready.'}</p>}
                </section>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <>
            {isDuo && <div className={styles.partnerStatus}><span className={partnerOnline ? styles.onlineDot : styles.offlineDot} />{roomParticipants.length + 1} {roomParticipants.length === 0 ? 'person' : 'people'} in the room{cameraReady && <span>Live camera on · no audio</span>}{roomError && <span role="alert">{roomError}</span>}</div>}
            <section className={styles.captureLayoutPicker} aria-labelledby="capture-layout-title">
              <div><span className={styles.controlLabel}>{isDuo ? 'HOST-SELECTED LAYOUT' : 'FIRST, PICK A LAYOUT'}</span><h2 id="capture-layout-title">{isDuo ? 'Your shared photo layout' : 'Choose a photo layout'}</h2><p>{isDuo && roomRole === 'guest' ? `The Host chose ${layoutLabel}.` : 'Choose a style before opening the camera.'}</p></div>
              <div className={styles.captureLayoutChoices}>{PHOTO_LAYOUTS.map((option) => <button aria-pressed={layout === option.id} className={[styles.captureLayoutChoice, layout === option.id ? styles.selectedCaptureLayout : ''].filter(Boolean).join(' ')} disabled={(isDuo && roomRole !== 'host') || (photos.length > 0 && layout !== option.id)} key={option.id} onClick={() => selectLayout(option.id)} type="button"><span className={[styles.layoutGlyph, styles['glyph' + option.id[0].toUpperCase() + option.id.slice(1)]].join(' ')}/><strong>{option.label}</strong><small>{option.photoCount} {option.photoCount === 1 ? 'photo' : 'photos'} · {option.description}</small></button>)}</div>
              {photos.length > 0 && <p className={styles.layoutLockedHint}>To change layouts, retake all photos first.</p>}
            </section>
            {layout && <div className={styles.workspace}>
              <PoseIdeaGuide />
              <div className={[styles.stage, isDuo ? styles.duoStage : ''].filter(Boolean).join(' ')} ref={cameraStageRef}>
                {cameraReady ? <video aria-label="Live camera preview" autoPlay className={styles.video} muted playsInline ref={attachLocalVideo} style={{ filter: CAMERA_FILTERS.find((filter) => filter.id === cameraFilter)?.css }} /> : (
                  <div className={styles.cameraPlaceholder}>
                    <span className={styles.cameraIcon}><Icon name="camera" /></span>
                    {isDuo && photos.length >= photoLimit ? (
                      <>
                        <strong>Your shared photo is ready</strong>
                        <span>Both cameras can stay off while you review your finished capture.</span>
                      </>
                    ) : (
                      <>
                        <strong>Your camera preview</strong>
                        <span>Open the camera to check your framing before each shot.</span>
                        <button className={styles.startButton} disabled={startingCamera} onClick={startCamera} type="button">{startingCamera ? 'Opening camera…' : cameraError ? 'Try camera again' : 'Open camera'}</button>
                      </>
                    )}
                  </div>
                )}
                {isDuo && remoteVideoStreams.size > 0 && (
                  <div aria-label="People in your room" className={styles.remoteVideoGrid}>
                    {Array.from(remoteVideoStreams.entries()).map(([id, stream], index) => (
                      <div className={styles.remoteVideoTile} key={id}>
                        <video
                          aria-label={`Room participant ${index + 1} live camera`}
                          autoPlay
                          muted
                          playsInline
                          style={{ filter: CAMERA_FILTERS.find((filter) => filter.id === cameraFilter)?.css }}
                          ref={(element) => {
                            if (!element) return;
                            if (element.srcObject !== stream) element.srcObject = stream;
                            void element.play().catch(() => {
                              setRoomError('Your browser blocked the other person’s camera preview. Allow video playback and refresh the room.');
                            });
                          }}
                        />
                        <span>Person {index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isDuo && cameraReady && remoteVideoStreams.size === 0 && (
                  <div className={styles.remoteVideoStatus} role="status">
                    {partnerOnline ? 'Connecting to the other camera…' : 'Waiting for the other person to join…'}
                  </div>
                )}
                {cameraReady && <span className={styles.liveBadge}><span /> LIVE PREVIEW</span>}
                {countdown !== null && (
                  <div aria-live="assertive" className={styles.countdownOverlay} role="status">
                    {countdown}
                  </div>
                )}
                {cameraError && <p className={styles.errorMessage} role="alert">{cameraError}</p>}
              </div>
              <aside aria-label="Photo booth controls" className={styles.controls}>
                {(!isDuo || roomRole === 'host') ? <div className={styles.captureFilterPicker}>
                  <span className={styles.controlLabel}>CAMERA FILTER</span>
                  <div className={styles.captureFilterChoices}>
                    {CAMERA_FILTERS.map((filter) => (
                      <button
                        aria-pressed={cameraFilter === filter.id}
                        className={cameraFilter === filter.id ? styles.selectedCaptureFilter : ''}
                        key={filter.id}
                        onClick={() => selectCameraFilter(filter.id)}
                        type="button"
                      >
                        <span style={{ filter: filter.css }} />
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div> : <p className={styles.hint}>Camera filter selected by {hostName}.</p>}
                <div className={styles.controlHeading}>
                  <div>
                    <span className={styles.controlLabel}>
                      {layoutLabel} - {photoLimit} {photoLimit === 1 ? 'photo' : 'photos'}
                    </span>
                    <h2>{photos.length === photoLimit ? 'All done!' : 'Take your photos'}</h2>
                  </div>
                  <span className={styles.counter}>{photos.length}/{photoLimit}</span>
                </div>
                <CaptureLayoutPreview
                  layout={layout}
                  onSelectPhoto={setSelectedPhotoForRetake}
                  photos={photos}
                  photoLimit={photoLimit}
                  selectedPhotoIndex={selectedPhotoForRetake}
                />
                {isDuo && roomRole === 'host' && pendingRetakeRequest !== null && (
                  <section className={styles.finalConfirmation} aria-live="polite">
                    <h3>Retake requested</h3>
                    <p>Your Guest requested a retake for photo {pendingRetakeRequest + 1}.</p>
                    <div className={styles.secondaryActions}>
                      <button className={styles.textButton} onClick={() => void decideRetake(pendingRetakeRequest, true)} type="button">Approve retake</button>
                      <button className={styles.textButton} onClick={() => void decideRetake(pendingRetakeRequest, false)} type="button">Decline</button>
                    </div>
                  </section>
                )}
                {photos.length > 0 && (
                  <p className={styles.hint}>
                    Select a photo above to retake or remove just that photo.
                  </p>
                )}
                {photos.length === 0 && <p className={styles.hint}>{photoHint}</p>}
                {(!isDuo || roomRole === 'host') && <div aria-label="Photo timer" className={styles.timerPicker}>
                  <span className={styles.controlLabel}>PHOTO TIMER</span>
                  <div className={styles.timerChoices}>
                    {([0, 3, 5, 10] as const).map((seconds) => (
                      <button
                        aria-pressed={timerSeconds === seconds}
                        className={timerSeconds === seconds ? styles.selectedTimer : ''}
                        disabled={!cameraReady || countdown !== null || (photos.length >= photoLimit && selectedPhotoForRetake === null)}
                        key={seconds}
                        onClick={() => setTimerSeconds(seconds)}
                        type="button"
                      >
                        {seconds === 0 ? 'Off' : `${seconds}s`}
                      </button>
                    ))}
                  </div>
                </div>}
                {(!isDuo || roomRole === 'host') && <button
                  className={styles.captureButton}
                  disabled={
                    !cameraReady ||
                    !layout ||
                    (isDuo && !roomParticipantDetails.some((participant) => participant.role === 'guest' && participant.cameraReady)) ||
                    (photos.length >= photoLimit && selectedPhotoForRetake === null) ||
                    countdown !== null
                  }
                  onClick={captureFromButton}
                  type="button"
                >
                  <Icon name="camera" />
                  {countdown !== null
                    ? 'Get ready…'
                    : selectedPhotoForRetake !== null
                      ? `Replace photo ${selectedPhotoForRetake + 1}`
                      : photos.length >= photoLimit
                        ? 'All photos taken'
                        : 'Take photo'}
                </button>}
                {isDuo && roomRole === 'host' && !roomParticipantDetails.some((participant) => participant.role === 'guest' && participant.cameraReady) && <p className={styles.hint}>Ask your Guest to turn their camera on before capturing or retaking a photo.</p>}
                {isDuo && roomRole === 'guest' && <p className={styles.hint}>{!cameraReady && selectedPhotoForRetake !== null ? 'Turn your camera back on so the Host can capture your retake.' : 'The Host starts the shared countdown. You cannot start a capture from this screen.'}</p>}
                {isDuo && roomRole === 'guest' && selectedPhotoForRetake !== null && <button className={styles.textButton} onClick={() => void requestRetake(selectedPhotoForRetake)} type="button">Request retake for photo {selectedPhotoForRetake + 1}</button>}
                {countdown !== null && (!isDuo || roomRole === 'host') && (
                  <button className={styles.textButton} onClick={cancelCountdown} type="button">
                    Cancel timer
                  </button>
                )}
                {photos.length > 0 && (
                  <div className={styles.secondaryActions}>
                    {!isDuo && selectedPhotoForRetake !== null && (
                      <button
                        className={styles.textButton}
                        onClick={() => setSelectedPhotoForRetake(null)}
                        type="button"
                      >
                        Clear selection
                      </button>
                    )}
                    {selectedPhotoForRetake !== null && (!isDuo || roomRole === 'host') && (
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          setShowFinalConfirmation(false);
                          if (!cameraReady) void startCamera();
                        }}
                        type="button"
                      >
                        Retake photo {selectedPhotoForRetake + 1}
                      </button>
                    )}
                    {!isDuo && selectedPhotoForRetake !== null && (
                      <button className={styles.textButton} onClick={removeSelectedPhoto} type="button">
                        Remove photo {selectedPhotoForRetake + 1}
                      </button>
                    )}
                    {!isDuo && <button className={styles.textButton} onClick={retakeAllPhotos} type="button">
                      Retake all photos
                    </button>}
                  </div>
                )}
                {photos.length === photoLimit && (isDuo || showFinalConfirmation) && (
                  <section aria-labelledby="final-photos-title" className={styles.finalConfirmation}>
                    <h3 id="final-photos-title">{selectedPhotoForRetake !== null ? `Retake photo ${selectedPhotoForRetake + 1} before continuing` : 'Your photos are ready'}</h3>
                    <p>{selectedPhotoForRetake !== null
                      ? 'Finish the selected retake, or cancel it to continue with the current photo.'
                      : isDuo && roomRole === 'guest'
                        ? `Waiting for ${hostName} to continue to Design.`
                        : 'Review your photos, then continue to Design.'}</p>
                    <div className={styles.confirmationActions}>
                      {selectedPhotoForRetake !== null && isDuo && roomRole === 'host' && <button
                        className={styles.textButton}
                        onClick={() => {
                          const index = selectedPhotoForRetake;
                          setSelectedPhotoForRetake(null);
                          setShowFinalConfirmation(true);
                          void sendRoomState('retake-cancelled', { index });
                        }}
                        type="button"
                      >
                        Cancel retake
                      </button>}
                      {(!isDuo || roomRole === 'host') && <button
                        className={styles.downloadButton}
                        disabled={selectedPhotoForRetake !== null || countdown !== null}
                        onClick={() => void continueToDesign()}
                        type="button"
                      >
                        Continue to Design
                      </button>}
                    </div>
                  </section>
                )}
                {cameraReady && <button className={styles.turnOffButton} onClick={stopCamera} type="button">Turn off camera</button>}
              </aside>
            </div>}
          </>
        )}

        {step === 3 && (
          <div className={styles.createGrid}>
            <section className={styles.previewPanel}>
              <div className={styles.previewHeading}><strong>Live preview</strong><span>{allCaptured.length} {allCaptured.length === 1 ? 'photo' : 'photos'}</span></div>
              <div
                className={photoDesignClass}
                data-layout={selectedLayout}
                ref={photoDesignRef}
                style={{
                  aspectRatio: `${FRAME_LAYOUTS[selectedLayout].width} / ${FRAME_LAYOUTS[selectedLayout].height}`,
                  width: selectedLayout === 'strip' || selectedLayout === 'trio'
                    ? 'min(285px, calc(100% - 40px))'
                    : 'min(430px, calc(100% - 40px))',
                }}
              >
                <ThemedFrameSvg
                  customMessage={customFrameMessage}
                  duoPairs={duoPhotoPairs}
                  frameColor={frameTheme.frameColor}
                  frameTextColor={frameTheme.textColor}
                  layoutId={selectedLayout}
                  name={frameName}
                  photoPositions={photoPositions}
                  photos={allCaptured}
                  showText={showFrameText}
                  stickers={selectedStickers.map((sticker) => ({
                    key: sticker.key,
                    src: sticker.definition.src,
                    x: sticker.x,
                    y: sticker.y,
                    size: sticker.size,
                    rotation: sticker.rotation,
                  }))}
                  svgRef={frameSvgRef}
                  themeId={frameThemeId}
                />
                {selectedStickers.map((sticker) => (
                  <div
                    className={styles.placedSticker}
                    key={sticker.key}
                    style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: `${sticker.size}%` }}
                  >
                    <button
                      aria-label={`Move ${sticker.definition.label} sticker: drag it or use the arrow keys`}
                      aria-pressed={selectedStickerKey === sticker.key}
                      className={styles.designSticker}
                      onClick={() => setSelectedStickerKey(sticker.key)}
                      onKeyDown={(event) => {
                        const adjustments: Record<string, { x: number; y: number }> = {
                          ArrowLeft: { x: -2, y: 0 },
                          ArrowRight: { x: 2, y: 0 },
                          ArrowUp: { x: 0, y: -2 },
                          ArrowDown: { x: 0, y: 2 },
                        };
                        const adjustment = adjustments[event.key];
                        if (!adjustment) return;
                        event.preventDefault();
                        setStickerPositionInsidePreview(
                          sticker.key,
                          sticker.x + adjustment.x,
                          sticker.y + adjustment.y,
                          sticker.size,
                        );
                      }}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        setSelectedStickerKey(sticker.key);
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={(event) => {
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          moveSticker(event, sticker.key, sticker.size);
                        }
                      }}
                      style={{ transform: `rotate(${sticker.rotation}deg)` }}
                      type="button"
                    >
                      <img alt="" aria-hidden="true" draggable={false} src={sticker.definition.src} />
                    </button>
                    <button
                      aria-label={`Remove ${sticker.definition.label} sticker`}
                      className={styles.removeSticker}
                      onClick={() => {
                        setStickers((current) => current.filter((item) => item.key !== sticker.key));
                        if (selectedStickerKey === sticker.key) setSelectedStickerKey(null);
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className={styles.customizePanel}>
              {isDuo && roomRole === 'guest' ? (
                <div className={styles.guestDesignWait}>
                  <span className={styles.controlLabel}>SHARED DESIGN</span>
                  <h2>Waiting for {hostName} to choose the frame</h2>
                  <p>Your Host controls frame colors, frame text, and stickers. The live preview will update when they make changes.</p>
                  {roomError && <p className={styles.errorInline} role="alert">{roomError}</p>}
                </div>
              ) : <>
              <div className={styles.optionGroup}>
                <h2><i>01</i> Theme</h2>
                <p className={styles.hint}>Choose a frame style for your photos.</p>
                <div aria-label="Theme" className={styles.frameThemeChoices}>
                  {(Object.keys(FRAME_THEMES) as FrameThemeId[]).map((themeId) => (
                    <button
                      aria-pressed={frameThemeId === themeId}
                      className={`${styles.frameThemeChoice} ${frameThemeId === themeId ? styles.selectedFrameTheme : ''}`}
                      key={themeId}
                      onClick={() => setFrameThemeId(themeId)}
                      type="button"
                    >
                      <ThemeCardPreview themeId={themeId} />
                      <span>{FRAME_THEMES[themeId].label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div aria-disabled={frameThemeId !== 'classic'} className={`${styles.optionGroup} ${frameThemeId !== 'classic' ? styles.disabledFrameColors : ''}`}>
                <h2><i>02</i> Frame background</h2>
                <p className={styles.hint}>{frameThemeId === 'classic' ? 'Choose a frame color.' : 'This theme has its own colors.'}</p>
                <div aria-label="Frame background" className={styles.frameColorChoices}>
                  {PRESET_FRAME_COLORS.map((theme) => (
                    <button
                      aria-pressed={frameColor === theme.id}
                      className={`${styles.frameColorChoice} ${frameColor === theme.id ? styles.selectedFrameColor : ''}`}
                      disabled={frameThemeId !== 'classic'}
                      key={theme.id}
                      onClick={() => setFrameColor(theme.id)}
                      style={{ borderColor: frameColor === theme.id ? theme.accentColor : undefined }}
                      type="button"
                    >
                      <span style={{ backgroundColor: theme.frameColor }} />
                      {theme.label}
                    </button>
                  ))}
                  <div className={styles.customFrameColorChoice}>
                    <button
                      aria-pressed={frameColor === 'custom'}
                      className={`${styles.frameColorChoice} ${frameColor === 'custom' ? styles.selectedFrameColor : ''}`}
                      disabled={frameThemeId !== 'classic'}
                      onClick={() => setFrameColor('custom')}
                      style={{ borderColor: frameColor === 'custom' ? FRAME_COLORS.custom.accentColor : undefined }}
                      type="button"
                    >
                      <span style={{ backgroundColor: customFrameColor }} />
                      {FRAME_COLORS.custom.label}
                    </button>
                    <input
                      aria-label="Custom frame color"
                      className={styles.customFrameColorPicker}
                      disabled={frameThemeId !== 'classic'}
                      onChange={(event) => {
                        setCustomFrameColor(event.target.value.toUpperCase());
                        setFrameColor('custom');
                      }}
                      onFocus={() => setFrameColor('custom')}
                      type="color"
                      value={customFrameColor}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.optionGroup}><h2><i>02</i> Move your photos</h2>{photos.length > 0 ? <><p className={styles.hint}>{isDuo ? 'Each Duo shot contains separate Host and Guest photos. Move both people together inside the selected frame.' : 'Select a photo and adjust its position inside the frame.'}</p><div className={styles.shotChoices}>{photos.map((photo, index) => <button aria-pressed={selectedPhoto === index} className={selectedPhoto === index ? styles.selectedShot : ''} key={index + '-' + photo.slice(-16)} onClick={() => setSelectedPhoto(index)} type="button"><img alt="" src={photo} />Photo {index + 1}</button>)}</div><label className={styles.adjustAllLabel}><input checked={alignAllPhotos} onChange={(event) => setAlignAllPhotos(event.target.checked)} type="checkbox" /> Move all photos together</label><label className={styles.sliderLabel}>Left and right<input max="100" min="0" onChange={(event) => updatePhotoPosition('x', Number(event.target.value))} type="range" value={(photoPositions[selectedPhoto] ?? { x: 50, y: 35, zoom: 1 }).x} /></label><label className={styles.sliderLabel}>Up and down<input max="100" min="0" onChange={(event) => updatePhotoPosition('y', Number(event.target.value))} type="range" value={(photoPositions[selectedPhoto] ?? { x: 50, y: 35, zoom: 1 }).y} /></label><label className={styles.sliderLabel}>Zoom<input max="3" min="1" onChange={(event) => setPhotoPositions((positions) => { const next = { ...(positions[selectedPhoto] ?? { x: 50, y: 35 }), zoom: Math.max(1, Number(event.target.value)) }; return alignAllPhotos ? photos.map(() => next) : positions.map((position, index) => index === selectedPhoto ? next : position); })} step="0.01" type="range" value={Math.max(1, photoPositions[selectedPhoto]?.zoom ?? 1)} /></label></> : <p className={styles.hint}>Take a photo first, then slide to move it inside its frame.</p>}</div>
              <div className={styles.optionGroup}><h2><i>03</i> Your photo layout</h2><p className={styles.selectedLayoutSummary}>{PHOTO_LAYOUTS.find((option) => option.id === layout)?.label} · {photoLimit} {photoLimit === 1 ? 'photo' : 'photos'}</p><p className={styles.hint}>Your layout controls the photo count and positions. Themes add colors, text, and decorations.</p></div>
              <div className={styles.optionGroup}>
                <h2><i>04</i> Text on frame</h2>
                <label className={styles.toggleRow}>
                  Show text on the frame
                  <input checked={showFrameText} onChange={(event) => setShowFrameText(event.target.checked)} type="checkbox" />
                  <span />
                </label>
                <p className={styles.hint}>Turn this off to keep the frame and leave its text areas blank.</p>
                <label className={styles.sliderLabel}>
                  Name
                  <input
                    className={styles.messageInput}
                    maxLength={24}
                    onChange={(event) => setFrameName(event.target.value)}
                    placeholder="Your name"
                    type="text"
                    value={frameName}
                  />
                </label>
                <label className={styles.sliderLabel}>
                  Custom frame message
                  <input
                    className={styles.messageInput}
                    maxLength={60}
                    onChange={(event) => setCustomFrameMessage(event.target.value)}
                    placeholder={FRAME_THEMES[frameThemeId].defaultMessage}
                    type="text"
                    value={customFrameMessage}
                  />
                </label>
              </div>
              <div className={styles.optionGroup}><h2><i>05</i> Add cute or funny stickers</h2><p className={styles.hint}>Add a sticker, drag it on the preview, then resize or rotate it here.</p><div aria-label="Choose stickers to add" className={styles.stickerChoices}>{STICKERS.map((item) => <button aria-label={'Add ' + item.label + ' sticker'} aria-pressed={selectedStickers.some((sticker) => sticker.definition.id === item.id)} className={selectedStickers.some((sticker) => sticker.definition.id === item.id) ? styles.selectedSticker : ''} key={item.id} onClick={() => addSticker(item.id)} type="button"><img alt="" draggable={false} src={item.src} /><small>{item.label}</small></button>)}</div>{selectedSticker && <div className={styles.stickerAdjustments}><strong>Adjust {selectedSticker.definition.label}</strong><label className={styles.sliderLabel}>Size · {selectedSticker.size}%<input aria-label="Sticker size" max="60" min="8" onChange={(event) => updateSticker(selectedSticker.key, 'size', Number(event.target.value))} type="range" value={selectedSticker.size} /></label><label className={styles.sliderLabel}>Rotation · {selectedSticker.rotation}°<input aria-label="Sticker rotation" max="360" min="0" onChange={(event) => updateSticker(selectedSticker.key, 'rotation', Number(event.target.value))} step="5" type="range" value={selectedSticker.rotation} /></label></div>}{stickers.length > 0 && <button className={styles.removeAllStickers} onClick={() => { setStickers([]); setSelectedStickerKey(null); }} type="button">Remove all {stickers.length} stickers</button>}</div>
              {cameraError && <p className={styles.errorInline} role="alert">{cameraError}</p>}
              <button className={styles.captureButton} disabled={!allCaptured.length || busy} onClick={() => void makeCreation()} type="button"><Icon name="arrow" />{busy ? 'Preparing your photo…' : 'Make my photo layout'}</button>
              <button className={styles.textButton} onClick={() => setStep(2)} type="button">Back to photos</button>
              </>}
            </section>
          </div>
        )}

        {step === 4 && (
          <div className={styles.shareGrid}>
            <section className={styles.finalPreview}>
              {createdImage && <img alt="Your finished SnapSync photo" src={createdImage} />}
              <p>High-res · Ready to keep</p>
            </section>
            <section className={styles.shareOptions}>
              <button className={styles.shareActionPrimary} onClick={downloadCreation} type="button"><span>↓</span><strong>Download HD image<small>JPEG · Best quality</small></strong><b>→</b></button>
              <button className={styles.shareAction} onClick={saveToGallery} type="button"><span>▱</span><strong>{saved ? 'Saved to your gallery' : 'Save to gallery'}<small>{saved ? 'Stored on this device' : 'Access it anytime on this device'}</small></strong><b>›</b></button>
              <button className={styles.shareAction} onClick={() => void shareCreation()} type="button"><span>▦</span><strong>Share with your people<small>Share the image from your device</small></strong><b>›</b></button>
              {notice && <p className={styles.notice} role="status">{notice}</p>}
              <Link className={styles.galleryLink} href="/gallery">Open my gallery <Icon name="arrow" /></Link>
              {!isDuo && <button className={styles.captureButton} onClick={() => { setPhotos([]); setPhotoPositions([]); setSelectedPhoto(0); setCreatedImage(''); setSaved(false); setStep(2); }} type="button"><Icon name="camera" /> Take another photo</button>}
              {isDuo && roomRole === 'host' && <button className={styles.textButton} onClick={() => void closeDuoRoom()} type="button">End remote session</button>}
              {isDuo && roomRole === 'host' && <button className={styles.textButton} onClick={() => { lastFinalImageSentRef.current = ''; void sendFinalImage(createdImage); }} type="button">Resend image to Guest</button>}
              {isDuo && roomRole === 'guest' && <p className={styles.hint}>The Host can close this room when the shared session is finished.</p>}
              <Link className={styles.homeButton} href="/">Back to home</Link>
            </section>
          </div>
        )}
        {cameraError && step !== 2 && step !== 3 && <p className={styles.errorInline} role="alert">{cameraError}</p>}
      </section>
    </main>
  );
}

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';

import { connectToSocket } from '../socket';
import { usePeer } from '../providers/PeerProvider';

export const loader = async ({ request }) => {
  const username = new URL(request.url).pathname.split('/')[2];
  const socket = connectToSocket(username);
  return { username, socket };
};

const Room = () => {
  const localVideoElement = useRef(null);
  const remoteVideoElement = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const myStream = useMemo(async () => {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }, []);

  const handleTrack = async (localStream) => {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  };

  const { username, socket } = useLoaderData();
  const { peerConnection, createOffer, createAnswer, saveAnswer } = usePeer();

  const handleOnUserConnected = async ({ username }) => {
    const offer = await createOffer();
    socket.emit('offer', { username, offer });
  };

  const handleOnOffer = async ({ offer, username }) => {
    const answer = await createAnswer(offer);
    socket.emit('answer', { username, answer });
    setIsConnected(true);
  };

  const handleOnAnswer = async ({ username, answer }) => {
    await saveAnswer(answer);
    setIsConnected(true);
  };

  const handleOnIceCandidate = async ({ iceCandidate, username }) => {
    try {
      await peerConnection.addIceCandidate(iceCandidate);
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  };

  useEffect(() => {
    myStream.then((stream) => {
      localVideoElement.current.srcObject = stream;
    });
    if (isConnected) {
      myStream.then((stream) => {
        handleTrack(stream);
      });
    }
  }, [isConnected]);

  useEffect(() => {
    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          iceCandidate: event.candidate,
          username,
        });
      }
    });

    peerConnection.addEventListener('track', async (event) => {
      const [remoteStream] = event.streams;
      remoteVideoElement.current.srcObject = remoteStream;
    });

    peerConnection.onnegotiationneeded = async () => {
      handleOnUserConnected(username);
    };

    socket.on('user-connected', handleOnUserConnected);
    socket.on('offer', handleOnOffer);
    socket.on('answer', handleOnAnswer);
    socket.on('ice-candidate', handleOnIceCandidate);

    return () => {
      socket.off('user-connected', handleOnUserConnected);
      socket.off('offer', handleOnOffer);
      socket.off('answer', handleOnAnswer);
      socket.off('ice-candidate', handleOnIceCandidate);
    };
  }, []);

  return (
    <div className='flex'>
      <video
        id='local-video'
        autoPlay
        playsInline
        controls={false}
        ref={localVideoElement}
      />
      <video
        id='remote-video'
        autoPlay
        playsInline
        controls={false}
        ref={remoteVideoElement}
      />
    </div>
  );
};
export default Room;

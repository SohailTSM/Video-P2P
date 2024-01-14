import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

const PeerContext = createContext(null);

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const usePeer = () => useContext(PeerContext);

const PeerProvider = ({ children }) => {
  const peerConnection = useMemo(
    () => new RTCPeerConnection(configuration),
    []
  );

  const createOffer = useCallback(async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }, []);

  const createAnswer = useCallback(async (offer) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }, []);

  const saveAnswer = useCallback(async (answer) => {
    await peerConnection.setRemoteDescription(answer);
  }, []);

  

  return (
    <PeerContext.Provider
      value={{ peerConnection, createOffer, createAnswer, saveAnswer }}
    >
      {children}
    </PeerContext.Provider>
  );
};
export default PeerProvider;

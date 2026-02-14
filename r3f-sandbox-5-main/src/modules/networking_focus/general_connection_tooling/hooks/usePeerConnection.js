// usePeerConnection.js
import {useEffect, useState} from 'react';
import {broadcastSceneChange} from "../broadcastSceneChange";
import {connectToPeer, initPeer} from "../initPeer";
import useSceneStore from "../../../../stores/sceneStore";
import {usePeerStore} from "../stores/peerStore";

export default function usePeerConnection() {
  const {
    scenes,
    currentSceneId,
    setSceneId
  } = useSceneStore();

  const [hostId, setHostId] = useState('');
  const {
    peerId,
    playerName,
    setMyPlayerName,
    connections,
    isHost,
  } = usePeerStore(state => ({
    peerId: state.peerId,
    playerName: state.playerName,
    setMyPlayerName: state.setMyPlayerName,
    connections: state.connections,
    isHost: state.isHost,
  }));

  const isConnected = Object.keys(connections).length > 0;

  useEffect(() => {
    initPeer(() => {
    });
  }, []);

  // This exposes the peerManager connection function so we can easily call it from any component to join other peers
  const handleConnect = () => {
    console.log("Connecting...");
    if (!hostId.trim()) return;
    if (!playerName.trim()) return;
    connectToPeer(hostId.trim(), () => setHostId(''));
  };

  const handleSceneChange = (sceneId) => {
    console.log("handleSceneChange", sceneId);
    setSceneId(sceneId);
    broadcastSceneChange(sceneId);
  };

  return {
    peerId,
    playerName,
    connections,
    isConnected,
    hostId,
    setHostId,
    setMyPlayerName,
    handleConnect,
    isHost,
    handleSceneChange
  };
}

import usePeerConnection from "../hooks/usePeerConnection";

export default function MyPeerId() {
  const { peerId } = usePeerConnection();

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#666',
        zIndex: 9999,
        userSelect: 'text',
        pointerEvents: 'auto',
      }}>
        {peerId}
      </div>
    </>
  )
}
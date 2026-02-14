import './App.css';
import ThreeCanvas from './modules/ThreeCanvas'
import HTMLContent from './structural_html/HTMLContent.js'
import usePeerConnection from "./modules/networking_focus/general_connection_tooling/hooks/usePeerConnection";

function App() {
  usePeerConnection()

  return (
    <>
      <ThreeCanvas/>
      <HTMLContent/>
    </>
  );
}

export default App;
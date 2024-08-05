import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Lobby.css'

const Lobby = () => {

  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/?room=${room}`)
  }

  return (
    <main id='lobby-container'>
      <div id="form-container">
        <div id='form__container__header'>
          <p>👏 Create OR Join a Room</p>
        </div>
        <div id="form__content__wrapper">
          <form id="join-form" onSubmit={handleSubmit}>
            <input type="text" name="invite_link" onChange={(e) => setRoom(e.target.value)} required />
            <input type="submit" value="Join Room" />
          </form>
        </div>
      </div>
    </main>
  )
}

export default Lobby

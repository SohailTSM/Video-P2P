import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const usernameElement = useRef(null);
  const navigate = useNavigate();

  const joinChat = () => {
    let username = usernameElement.current.value;
    if (!username) {
      username = 'User' + Math.floor(Math.random() * 1000);
    }

    navigate('/room/' + username);
  };

  return (
    <div>
      <input
        type='text'
        name='username'
        id='username'
        placeholder='Username'
        ref={usernameElement}
      />
      <button onClick={joinChat}>Join Chat</button>
    </div>
  );
};
export default Lobby;

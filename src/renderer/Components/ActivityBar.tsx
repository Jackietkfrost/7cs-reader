import React from 'react';

function ActivityBar() {
  const handleClick = () => {
    window.electron.ipcRenderer.sendMessage('get-book-content');
  };
  return (
    <div>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <li>
          <button
            type="button"
            style={{
              flex: '0 1 auto',
            }}
            onClick={handleClick}
          >
            Button 1
          </button>
        </li>
        <li>
          <button type="button">Button 2</button>
        </li>
        <li>
          <button type="button">Button 3</button>
        </li>
      </ul>
    </div>
  );
}

export default ActivityBar;

import RatingSystem from './RatingSystem';

interface TilePopoverProps {
  title: string;
  artist: string;
  description: string;
}

function BookPopover({ title, artist, description }: TilePopoverProps) {
  const sanitizeHTML = (html: string) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    return tempEl.textContent || tempEl.innerText || '';
  };
  return (
    <div
      style={{ backgroundColor: '#1f1f1f', color: '#adadad', padding: '10px' }}
    >
      <h2>{title}</h2>
      <h4>{artist}</h4>
      <RatingSystem />

      <br />
      <p style={{ maxWidth: '500px', maxHeight: '300px', overflowY: 'auto' }}>
        {sanitizeHTML(description)}
      </p>
    </div>
  );
}
export default BookPopover;

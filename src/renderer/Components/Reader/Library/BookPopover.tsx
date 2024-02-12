import RatingSystem from './RatingSystem';

interface TilePopoverProps {
  title: string;
  description: string;
}

function BookPopover({ title, description }: TilePopoverProps) {
  const sanitizeHTML = (html: string) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    return tempEl.textContent || tempEl.innerText || '';
  };
  return (
    <div
      style={{ backgroundColor: '#1f1f1f', color: '#adadad', padding: '10px' }}
    >
      <h2>
        {title}
        <RatingSystem />
      </h2>

      <br />
      <p style={{ maxWidth: '500px', maxHeight: '300px', overflowY: 'auto' }}>
        {sanitizeHTML(description)}
      </p>
    </div>
  );
}
export default BookPopover;

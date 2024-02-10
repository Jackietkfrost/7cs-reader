interface TilePopoverProps {
  title: string;
  ISBN: any;
  description: string;
}

function BookPopover({ title, ISBN, description }: TilePopoverProps) {
  const sanitizeHTML = (html: string) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    return tempEl.textContent || tempEl.innerText || '';
  };
  return (
    <div style={{ padding: '10px' }}>
      <h2>{title}</h2>
      <h5>ISBN: {ISBN}</h5>
      <p>{sanitizeHTML(description)}</p>
    </div>
  );
}
export default BookPopover;

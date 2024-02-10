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
    <div style={{ padding: '10px' }}>
      <h2>{title}</h2>
      <p>{sanitizeHTML(description)}</p>
    </div>
  );
}
export default BookPopover;

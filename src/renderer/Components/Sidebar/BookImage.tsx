import React from 'react';

interface BookImageProps {
  src: string;
  alt: string;
}

function BookImage({ src, alt }: BookImageProps) {
  const placeholderSrc = 'https://via.placeholder.com/80x110';
  return (
    <img
      src={src || placeholderSrc} // Use the placeholderSrc if src is falsy
      alt={alt}
    />
  );
}

export default BookImage;

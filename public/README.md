# Public Directory

This directory contains static assets that can be accessed directly from your Next.js app.

## Usage

Files in this directory are served from the root path `/`. For example:

- `public/my-gif.gif` → accessible at `/my-gif.gif`
- `public/images/logo.png` → accessible at `/images/logo.png`

## In your React components:

```jsx
// Using Next.js Image component (recommended)
import Image from 'next/image'

<Image src="/my-gif.gif" alt="My GIF" width={300} height={200} />

// Or using regular img tag
<img src="/my-gif.gif" alt="My GIF" />
```

## File types you can store here:

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Icons: `.ico`, `.svg`
- Fonts: `.woff`, `.woff2`, `.ttf`
- Other static assets: `.pdf`, `.txt`, etc.

## Tips:

- Keep file names lowercase and use hyphens instead of spaces
- Optimize images for web (compress GIFs, use appropriate formats)
- Consider using Next.js Image component for better performance

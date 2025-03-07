# PWA Icons

For a complete PWA setup, you need to generate the following icon sizes from your existing logo:

- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

You can generate these from your existing logo `public/assets/icons/logo-2.svg` using tools like:

1. Online converters:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWABuilder](https://www.pwabuilder.com/)
   - [AppIcon](https://appicon.co/)

2. Software:
   - Adobe Photoshop
   - GIMP
   - Sketch

3. Command line with ImageMagick:
   ```bash
   # Install ImageMagick first, then run:
   magick convert public/assets/icons/logo-2.svg -resize 192x192 public/icons/icon-192x192.png
   magick convert public/assets/icons/logo-2.svg -resize 384x384 public/icons/icon-384x384.png
   magick convert public/assets/icons/logo-2.svg -resize 512x512 public/icons/icon-512x512.png
   ```

Place the generated PNG files in this directory to complete your PWA setup. 
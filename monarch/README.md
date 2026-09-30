# Monarch Studio — website

```
monarch-site/
├── index.html              Page structure and content
├── styles.css              All styles (tokens, layout, sections, sample-UI kits, responsive)
├── script.js               Preloader → site behaviour → safety net
└── assets/
    ├── images/
    │   ├── amira-khan.jpg      Testimonial portrait
    │   ├── favicon.svg         Browser tab icon
    │   └── monarch-mark.svg    Logo mark (ring + lime slash)
    └── vendor/
        ├── three.min.js        three.js r128 (particle field), served locally
        └── three.LICENSE.txt   MIT licence
```

## Run it
Open `index.html` in a browser, or serve the folder (recommended):

```
npx serve monarch-site        # or: python3 -m http.server --directory monarch-site
```

## Edit content
- **Case studies:** in `script.js`, search for `var CASES=` (featured and main projects), `var MORE=` (the "More work" list), `SHOTS` (product screens) and `NOTES` (numbered annotations).
- **Testimonials:** search for `// testimonial slider` in `script.js`.
- **Particle scenes:** search for `var scenes=` in `script.js`.

## Before launch
All clients, people, quotes, figures and product screens are sample content. Replace them with real, approved work.

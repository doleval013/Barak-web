const fs = require('fs');

let content = fs.readFileSync('src/components/GefenLanding.jsx', 'utf8');

// 1. Update GALLERY_IMAGES array
content = content.replace(
/const GALLERY_IMAGES = \[[\s\S]*?\];/,
`const GALLERY_IMAGES = [
    { src: imgHighfive, alt: 'High five connection' },
    { src: imgFeed, alt: 'Training with treats' },
    { src: imgRelax2, alt: 'Workshop interaction' },
    { src: imgRelax, alt: 'Relaxed engagement' },
    { src: imgStare, alt: 'Focus and connection' },
    { src: imgCube, alt: 'Playful learning' },
];`
);

// 2. Update intro section
const introRegex = /<img\s+src=\{imgHighfive\}[\s\S]*?onClick=\{[\s\S]*?\}\s*\/>/;
content = content.replace(
introRegex,
`<MobileSlider>
                                <img
                                    src={imgHighfive}
                                    alt="High five connection"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(0)}
                                />
                                <img
                                    src={imgStare}
                                    alt="Focus and connection"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(4)}
                                />
                            </MobileSlider>`
);

// 3. Update why-dogs section
const whyDogsRegex = /<img\s+src=\{imgRelax2\}[\s\S]*?onClick=\{[\s\S]*?\}\s*\/>/;
content = content.replace(
whyDogsRegex,
`<img
                                    src={imgRelax2}
                                    alt="Workshop interaction"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(2)}
                                />
                                <img
                                    src={imgCube}
                                    alt="Playful learning"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(5)}
                                />`
);

fs.writeFileSync('src/components/GefenLanding.jsx', content);
console.log("Replaced perfectly via regex");

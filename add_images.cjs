const fs = require('fs');

let content = fs.readFileSync('src/components/GefenLanding.jsx', 'utf8');

// Add new imports right after the exact line
content = content.replace("import imgRelax2 from '../assets/schools/girl-feed-jessie.jpg';", "import imgRelax2 from '../assets/schools/girl-feed-jessie.jpg';\nimport imgStare from '../assets/schools/jessie-kid-stare.jpg';\nimport imgCube from '../assets/schools/jessie-cube-kid.jpg';");

// Update GALLERY_IMAGES
const oldGallery = `const GALLERY_IMAGES = [
    { src: imgHighfive, alt: 'High five connection' },
    { src: imgFeed, alt: 'Training with treats' },
    { src: imgRelax2, alt: 'Workshop interaction' },
    { src: imgRelax, alt: 'Relaxed engagement' },
];`;

const newGallery = `const GALLERY_IMAGES = [
    { src: imgHighfive, alt: 'High five connection' },
    { src: imgFeed, alt: 'Training with treats' },
    { src: imgRelax2, alt: 'Workshop interaction' },
    { src: imgRelax, alt: 'Relaxed engagement' },
    { src: imgStare, alt: 'Focus and connection' },
    { src: imgCube, alt: 'Playful learning' },
];`;
content = content.replace(oldGallery, newGallery);

// Update Intro Section image
const oldIntro = `<img
                                src={imgHighfive}
                                alt="High five connection"
                                className="workshop-split-image workshop-split-image--clickable"
                                loading="lazy"
                                onClick={() => setSelectedImageIndex(0)}
                            />`;

const newIntroWrapper = `<MobileSlider>
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
                            </MobileSlider>`;
content = content.replace(oldIntro, newIntroWrapper);

// Also need to add workshop-split-image-wrapper--stack class to Intro Section image wrapper
content = content.replace('className="workshop-split-image-wrapper workshop-hide-mobile"', 'className="workshop-split-image-wrapper workshop-split-image-wrapper--stack workshop-hide-mobile"');

// Wait! In the why-dogs section, there's another instance of 'workshop-split-image-wrapper workshop-split-image-wrapper--stack workshop-hide-mobile'. 
// We only wanted to replace the one in Intro. Our replace will just replace the first occurrence, which is exactly in Intro (since Why Dogs has --stack already).
// Wait, the Why Dogs one ALREADY has --stack. The string 'className="workshop-split-image-wrapper workshop-hide-mobile"' only exists in Intro and Benefits.
// Let's replace the first occurrence of:
// <div className="workshop-split-image-decoration"></div>
// to have the secondary style? No, it's fine without it.
// Let's replace only the first occurrence of `className="workshop-split-image-wrapper workshop-hide-mobile"` using regex without global flag.
let replacedClass = false;
content = content.replace('className="workshop-split-image-wrapper workshop-hide-mobile"', (match) => {
    if (!replacedClass) {
        replacedClass = true;
        return 'className="workshop-split-image-wrapper workshop-split-image-wrapper--stack workshop-hide-mobile"';
    }
    return match;
});

// Update Why Dogs Slider
const oldWhyDogs = `<MobileSlider>
                                <img
                                    src={imgFeed}
                                    alt="Training with treats"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(1)}
                                />
                                <img
                                    src={imgRelax2}
                                    alt="Workshop interaction"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(2)}
                                />
                            </MobileSlider>`;

const newWhyDogs = `<MobileSlider>
                                <img
                                    src={imgFeed}
                                    alt="Training with treats"
                                    className="workshop-split-image workshop-split-image--clickable"
                                    loading="lazy"
                                    onClick={() => setSelectedImageIndex(1)}
                                />
                                <img
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
                                />
                            </MobileSlider>`;
content = content.replace(oldWhyDogs, newWhyDogs);

fs.writeFileSync('src/components/GefenLanding.jsx', content);
console.log("Images added successfully.");

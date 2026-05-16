import sharp from 'sharp';

const jobs = [
  {
    input: 'src/assets/logo.PNG',
    output: 'src/assets/logo-optimized.webp',
    width: 360,
    quality: 78,
  },
  {
    input: 'src/assets/slide1.png',
    output: 'src/assets/slide1-optimized.webp',
    width: 1600,
    quality: 78,
  },
  {
    input: 'src/assets/slide2.jpeg',
    output: 'src/assets/slide2-optimized.webp',
    width: 1600,
    quality: 78,
  },
  {
    input: 'src/assets/slide3.jpeg',
    output: 'src/assets/slide3-optimized.webp',
    width: 1600,
    quality: 78,
  },
  {
    input: 'src/assets/عملات.PNG',
    output: 'src/assets/coins-optimized.webp',
    width: 720,
    quality: 80,
  },
];

for (const job of jobs) {
  await sharp(job.input)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality, effort: 5 })
    .toFile(job.output);
}

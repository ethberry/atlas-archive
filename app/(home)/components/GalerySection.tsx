"use client";

import { FC, memo, useState } from "react";
import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface IGalleryImage {
  src: string;
  alt: string;
}

const GALLERY_IMAGES: IGalleryImage[] = [
  {
    src: "/assets/img/pic-1.jpg",
    alt: "Fabergé Egg - Gallery Image 1",
  },
  {
    src: "/assets/img/pic-2.jpg",
    alt: "Fabergé Egg - Gallery Image 2",
  },
  {
    src: "/assets/img/pic-3.jpg",
    alt: "Fabergé Egg - Gallery Image 3",
  },
  {
    src: "/assets/img/pic-4.jpg",
    alt: "Fabergé Egg - Gallery Image 4",
  },
  {
    src: "/assets/img/pic-5.jpg",
    alt: "Fabergé Egg - Gallery Image 5",
  },
];

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1536 },
    items: 4,
    slidesToSlide: 1,
    partialVisibilityGutter: 40,
  },
  desktop: {
    breakpoint: { max: 1536, min: 1024 },
    items: 3,
    slidesToSlide: 1,
    partialVisibilityGutter: 30,
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 2,
    slidesToSlide: 1,
    partialVisibilityGutter: 20,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1,
    partialVisibilityGutter: 10,
  },
};

const GalleryImage: FC<{ image: IGalleryImage; index: number }> = ({
  image,
  index,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (imageError) {
    return (
      <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-[#33399A] shadow-2xl bg-[#0D0925] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <div className="text-sm">Image not found</div>
          <div className="text-xs mt-2 text-gray-400">{image.src}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden border-2 border-[#33399A] shadow-2xl bg-[#0D0925] hover:border-[#4A52B5] transition-colors duration-300">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D0925] z-10">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#33399A] border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm">Loading...</div>
          </div>
        </div>
      )}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
        priority={index < 2}
        quality={85}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

export const GalerySection: FC = memo(() => {
  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="gallery-carousel relative">
          <Carousel
            responsive={responsive}
            infinite
            autoPlay
            autoPlaySpeed={3000}
            keyBoardControl
            customTransition="transform 500ms ease-in-out"
            transitionDuration={500}
            arrows
            showDots
            renderDotsOutside
            renderButtonGroupOutside
          >
            {GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="px-2 flex items-center justify-center w-full"
              >
                <GalleryImage image={image} index={index} />
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
});

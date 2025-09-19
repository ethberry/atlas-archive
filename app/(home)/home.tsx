"use client";

import { FC } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";

import { LearnMore } from "@/app/(home)/More";
import { Fomo } from "@/app/(home)/Fomo";
import { Egg } from "@/app/(home)/Egg";

import FAQItem from "../../components/FAQItem";

export const Home: FC = () => {
  return (
    <main className="font-mont">
      <h2>
        <FormattedMessage id="SLOGAN" />
      </h2>
      <Egg />
      <Fomo />
      <LearnMore />

      {/* Медиа Яйцо */}
      <section className="relative w-full h-screen flex items-center justify-center snap-start px-4 md:px-8 bg-transparent">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-screen-lg">
          {/* VIDEO */}
          <div className="relative w-full max-w-[60%] md:max-w-[350px]">
            <div className="absolute inset-0 rounded-lg blur-2xl opacity-30 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse" />
            <video
              src={"/assets/egg-story.mp4"}
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 w-full rounded-lg shadow-2xl object-cover"
            />
          </div>

          {/* IMAGE */}
          <div className="relative w-full max-w-[60%] md:max-w-[400px]">
            <Image
              src={"/assets/egg-sign.jpg"}
              width={400}
              height={185}
              alt="egg sign"
              className="relative z-10 w-full rounded-lg shadow-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Discord Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 bg-transparent">
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-mont-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,100,0.5)]">
              Join our Discord
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
              Unlock exclusive updates and opportunities!
            </p>
          </div>

          <motion.a
            href="https://minisite.uno/discordfractown"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg md:text-xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(88,101,242,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-8 h-8 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
            </svg>
            Join Discord Community
          </motion.a>

          <p className="text-sm md:text-base text-gray-400 mt-4">
            Get early access to auctions, exclusive content, and connect with
            fellow art enthusiasts
          </p>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 bg-transparent">
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-mont-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,100,0.5)]">
              CoArt & FracTown Roadmap
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
              (Highlights)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-3">
                Sep 2025
              </h3>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                First CoArt Marketplace goes live (Lithuania). Fabergé Egg
                becomes the flagship asset.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-3">
                Oct–Nov 2025
              </h3>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Launch of two more regional marketplaces. Tokenized shares go
                live for trading.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-3">
                Nov–Dec 2025
              </h3>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Platform IP transferred to US company. Pre-sale of FracTown
                tokens begins.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-3">
                Q1 2026
              </h3>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Global expansion (EU, US, Southeast Asia). New blockchain
                development starts. FracTown tokens listed on DEX & CEX.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 bg-transparent">
        <div className="relative z-10 flex flex-col items-start max-w-screen-md mx-auto text-white space-y-4">
          <h2 className="text-3xl md:text-4xl font-mont-bold text-yellow-400 mb-4 drop-shadow-[0_0_8px_rgba(255,255,100,0.5)]">
            FAQ
          </h2>

          <FAQItem
            question="How will the auction be conducted?"
            answer="For the first time, an item of this caliber will be available to retail investors through our fractional ownership mechanism. The auction won't offer the entire object, but rather its FCC, divided into 200 lots, each containing different quantities of ownership shares, which we call fractions."
          />
          <FAQItem
            question="What is an FCC?"
            answer="This is a special type of crypto certificate - Fractional Crypto Certificate - that we created for precise identification of physical assets, enabling their almost instant resale, similar to the NFT market. FCC also provides the ability to own 'fractions' as shares of expensive assets."
          />
          <FAQItem
            question="What kind of expertise is required?"
            answer="There are several respected institutions and specialists in the world who can verify the authenticity of works from Karl Fabergé's workshop. We're currently in dialogue with two of them. We'll share all the details in our social media channels."
          />
          <FAQItem
            question="How can I manage my ownership shares?"
            answer="On our CoArt Marketplace, you'll be able to sell and resell both unique physical objects in their entirety and ownership shares of them as 'fractions' of specific FCCs."
          />
          <FAQItem
            question="Where will the Egg itself be stored?"
            answer="After the auction concludes, the object itself will be exhibited in one of the European museums or transferred for safekeeping to one of the specialized 'freeports'."
          />
        </div>
      </section>
    </main>
  );
};

import PillNav from "@/components/site/PillNav";
import Hero from "@/components/marketing/Hero";
import { Demo } from "@/components/demo";
import HowItWorks from "@/components/marketing/HowItWorks";
import Mechanisms from "@/components/marketing/Mechanisms";
import HonestNote from "@/components/marketing/HonestNote";
import Close from "@/components/marketing/Close";

/**
 * The whole site. One page, one scroll:
 *
 *   nav  ·  hero  ·  the scripted demo (the hero image)  ·  how it works
 *        ·  why it is not a prompt wrapper  ·  what would make us wrong
 *        ·  FAQ  ·  closing CTA  ·  footer
 *
 * Plain and raised bands alternate for rhythm. Every anchor points back into
 * this page — there are no other routes.
 */
export default function Home() {
  return (
    <>
      <PillNav />
      <main className="flex-1">
        <Hero />

        {/* The demo is the hero image: a raised band that is nothing but a
            slot. `Demo` owns its own scroll track and sticky pin at >=900px,
            so this wrapper must not set a height, a transform, or any
            overflow clip — an ancestor clip would kill the pin. Horizontal
            padding and a max width are all it contributes. */}
        <section
          id="demo"
          className="relative w-full border-y border-hairline bg-raised py-14 min-[900px]:py-0"
        >
          <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
            <Demo />
          </div>
        </section>

        <HowItWorks />
        <Mechanisms />
        <HonestNote />
        <Close />
      </main>
    </>
  );
}

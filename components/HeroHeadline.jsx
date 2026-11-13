"use client";

// Hero h1: words fade in out of a blur, one after another (adapted from the
// ReactBits BlurText idea). Consecutive `hot` words share one inline span so
// the blue → orange gradient runs across the whole phrase, even over a line
// break. Stays a real <h1>, and renders still under reduced motion.
import { Fragment } from "react";
import { motion, MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1];

// [{ text, hot }] → [{ text: "Temperature & Heat", hot: true }, …]
function group(words) {
  const out = [];
  for (const word of words) {
    const last = out.at(-1);
    if (last && last.hot && word.hot) last.text += ` ${word.text}`;
    else out.push({ ...word });
  }
  return out;
}

export default function HeroHeadline({ words, className }) {
  return (
    <MotionConfig reducedMotion="user">
      <h1
        className={cn(
          "text-[clamp(2.4rem,5.4vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink",
          className,
        )}
      >
        {group(words).map(({ text, hot }, index) => (
          <Fragment key={`${text}-${index}`}>
            {index > 0 && " "}
            {hot ? (
              // inline (not inline-block) so the gradient continues across lines;
              // transforms don't apply to inline boxes, so this one only fades
              <motion.span
                className="text-thermal"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.08 * index, ease: EASE }}
              >
                {text}
              </motion.span>
            ) : (
              <motion.span
                className="inline-block will-change-[transform,filter,opacity]"
                initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, delay: 0.08 * index, ease: EASE }}
              >
                {text}
              </motion.span>
            )}
          </Fragment>
        ))}
      </h1>
    </MotionConfig>
  );
}

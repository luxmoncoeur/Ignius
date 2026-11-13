"use client";

// YouTube embed with click-to-load thumbnail (fast pages + privacy friendly).
import { useState } from "react";
import { Play } from "lucide-react";

export default function VideoEmbed({ id, title }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="tw relative aspect-video w-full overflow-hidden bg-stage">
      {loaded ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 grid size-full cursor-pointer place-items-center"
        >
          {/* plain <img>: a remote YouTube thumbnail with an onError fallback;
              next/image would need img.youtube.com whitelisted for no gain */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-70 transition-opacity group-hover:opacity-85"
            onError={(event) => (event.currentTarget.style.display = "none")}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
          <span className="relative grid size-16 place-items-center rounded-full bg-primary text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4 text-left text-sm font-semibold text-white">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}

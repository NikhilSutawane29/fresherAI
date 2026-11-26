import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import DownloadBtn from "./DownloadBtn";
import ATSTemplate from "./ATSTemplate";

const PreviewResume = ({ data, onBack, user, setUser }) => {
  const resumeRef = useRef(null);
  const [scale, setScale] = useState(1);

  // we changes scale as per devices width
  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 640) {
        setScale(0.42);
      } else if (window.innerWidth < 768) {
        setScale(0.58);
      } else if (window.innerWidth < 1024) {
        setScale(0.72);
      } else {
        setScale(0.9);
      }
    };

    updateScale();

    // we add - addEventListener becasue - we want to chnage scale on any divices like on mobile scale(0.42) ...
    // we add "resize" -> so that we make any changes with updateScale, so we adding "resize" here so that it can "calls updateScale" automatically
    // means whenever our size changes - so it calls updateScale automatically becasue we using resize
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      {/* header */}
      <div className="sticky top-0 border-b z-20 border-black/8 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {/* left div */}
          <div>
            <h2 className="text-base font-bold sm:text-lg">Resume Preview</h2>
            <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
              Review your resume before downloading
            </p>
          </div>

          {/* right div */}
          <div
            className="flex items-center
                    justify-between lg:justify-end gap-2.5"
          >
            <button
              onClick={onBack}
              className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/15 px-2.5 sm:px-3 text-xs text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]"
            >
              <FiArrowLeft size={15} />
              <span className="hidden sm:block">Back to Edit</span>
            </button>

            <DownloadBtn docRef={resumeRef} user={user} setUser={setUser} />
          </div>
        </div>
      </div>

      {/* Template area  */}
      <div className="overflow-auto bg-[#F8F9FA] px-3 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto justify-center flex">
          <div
           style={{
            transform: `scale(${scale})`,
            transformOrigin: "top-center"
           }}
          >
            <div ref={resumeRef} className="rounded-md bg-white shadow-[0_0_50px_rgba(0,0,0,0.6)]">
              <ATSTemplate data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewResume;

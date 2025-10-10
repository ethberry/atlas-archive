import { FC, memo, useEffect, useState } from "react";

interface ICountdownProps {
  initialMilliseconds: number;
}

export const Countdown: FC<ICountdownProps> = memo(
  ({ initialMilliseconds }) => {
    const [millisecondsLeft, setMillisecondsLeft] =
      useState(initialMilliseconds);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setMillisecondsLeft((prev) => Math.max(prev - 1000, 0));
      }, 1000);

      return () => clearInterval(intervalId);
    }, []);

    const minutes = Math.floor(millisecondsLeft / 60000);
    const seconds = Math.floor((millisecondsLeft % 60000) / 1000);
    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(seconds).padStart(2, "0");

    return (
      <div className="w-full max-w-[133px] flex flex-col gap-3">
        <div
          className="text-base text-white text-right flex items-center justify-end gap-[2px]"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <span className="inline-block w-[25px] min-w-[25px] text-[50px] text-center">
            {minutesStr[0]}
          </span>
          <span
            className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
            key={`min-${minutesStr[1]}`}
          >
            {minutesStr[1]}
          </span>
          <span className="w-[25px] min-w-[25px] text-[50px] text-center">
            :
          </span>
          <span
            className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
            key={`sec-tens-${secondsStr[0]}`}
          >
            {secondsStr[0]}
          </span>
          <span
            className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
            key={`sec-ones-${secondsStr[1]}`}
          >
            {secondsStr[1]}
          </span>
        </div>
        <div
          className="relative w-full h-[12px] rounded-full"
          style={{ background: "rgba(30, 35, 70, 0.5)" }}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(millisecondsLeft / initialMilliseconds) * 100}%`,
              background: "#2887CC",
              boxShadow:
                "0 0 30px 8px rgba(66, 165, 245, 0.8), 0 0 60px 15px rgba(66, 165, 245, 0.4)",
              filter: "brightness(1.2)",
            }}
          />
        </div>
      </div>
    );
  },
);

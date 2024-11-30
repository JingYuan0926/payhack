"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Deposit({ className }) {
  const containerRef = useRef(null);
  const userRef = useRef(null);
  const fincatRef = useRef(null);
  const output1Ref = useRef(null);
  const output2Ref = useRef(null);

  return (
    <div
      className={cn(
        "relative flex h-[300px] w-full items-center justify-center rounded-lg border bg-background p-10 md:shadow-xl",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        {/* User Circle */}
        <div className="flex flex-col justify-center">
          <Circle ref={userRef}>
            <Icons.user />
          </Circle>
        </div>

        {/* FinCat Circle */}
        <div className="flex flex-col justify-center">
          <Circle ref={fincatRef} className="size-15">
            <img src="/logo.png" alt="FinCat" className="w-10 h-10" />
          </Circle>
        </div>

        {/* Output Circles */}
        <div className="flex flex-col justify-center gap-4">
          <Circle ref={output1Ref}>
            <div className="text-sm font-medium">Bank 1</div>
          </Circle>
          <Circle ref={output2Ref}>
            <div className="text-sm font-medium">Bank 2</div>
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={fincatRef}
        duration={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fincatRef}
        toRef={output1Ref}
        duration={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fincatRef}
        toRef={output2Ref}
        duration={5}
      />
    </div>
  );
}

const Icons = {
  user: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

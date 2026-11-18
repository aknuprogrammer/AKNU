import React from "react";

export default function Content({
  greetings,
  letterContent,
  faithfulText,
  hrText,
  refNo,
}) {
  return (
    <main className="p-6 bg-white text-black text-justify leading-relaxed text-sm">
      {greetings && (
        <div className="mb-4">
          <p>{greetings}</p>
        </div>
      )}

      <div className="whitespace-pre-wrap break-words">{letterContent}</div>

      {(faithfulText || hrText) && (
        <div className="mt-6 ml-10 space-y-1">
          {faithfulText && <p>{faithfulText}</p>}
          {hrText && <p>{hrText}</p>}
        </div>
      )}
    </main>
  );
}

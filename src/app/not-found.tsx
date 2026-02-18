import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] flex flex-col items-center justify-center px-5">
      <div className="text-center max-w-[440px]">
        {/* Ícono de manos */}
        <div className="flex justify-center mb-8">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14 34c-2-1-4-3-5-6-1-2-1-4 0-6l3-5c1-1 2-2 3-1l1 2 1-4c0-2 1-3 2-3s2 1 2 3l0 6 1-8c0-2 1-3 2-3s2 1 2 3l0 8 1-7c0-2 1-3 2-3s2 1 2 3l-1 9 1-4c1-2 2-2 3-1s1 2 1 3l-2 7c-1 3-3 5-5 6" stroke="#A09A93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="text-2xl italic leading-relaxed font-light mb-4" style={{ letterSpacing: "-0.01em" }}>
          Este espacio no existe.
        </p>

        <p className="font-[var(--font-sans)] text-[#6F6A64] font-light text-sm leading-relaxed mb-10">
          Pero el lugar donde puedes soltar lo que cargas sí.
        </p>

        <Link
          href="/"
          className="font-[var(--font-serif)] text-lg px-8 py-3.5 bg-[#5C7350] text-white border border-[#5C7350] rounded-lg cursor-pointer transition-all duration-250 hover:bg-[#4E6642] hover:border-[#4E6642] inline-block no-underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

"use client";

const FRONT_REGIONS = [
  { slug: "chest", d: "M150 128 C174 108 205 116 209 151 L209 213 C171 211 151 188 144 158Z M265 128 C241 108 210 116 206 151 L206 213 C244 211 264 188 271 158Z" },
  { slug: "shoulders", d: "M111 111 C82 117 66 139 65 167 C95 170 117 158 134 133 C130 120 122 113 111 111Z M304 111 C333 117 349 139 350 167 C320 170 298 158 281 133 C285 120 293 113 304 111Z" },
  { slug: "biceps", d: "M73 176 C48 203 44 250 56 292 C77 277 88 229 91 190Z M342 176 C367 203 371 250 359 292 C338 277 327 229 324 190Z" },
  { slug: "forearms", d: "M55 299 C40 329 31 363 32 398 C50 407 68 390 74 355 C77 335 75 316 67 300Z M360 299 C375 329 384 363 383 398 C365 407 347 390 341 355 C338 335 340 316 348 300Z" },
  { slug: "abs", d: "M171 220 C187 213 228 213 244 220 L237 348 C226 369 189 369 178 348Z M204 226 L204 353 M178 257 L235 257 M176 291 L237 291 M178 325 L235 325" },
  { slug: "obliques", d: "M139 201 C119 232 115 289 136 335 C150 314 159 261 164 218Z M276 201 C296 232 300 289 279 335 C265 314 256 261 251 218Z" },
  { slug: "quads", d: "M156 360 C181 354 197 370 194 404 L175 502 C171 525 143 522 142 497Z M259 360 C234 354 218 370 221 404 L240 502 C244 525 272 522 273 497Z" },
  { slug: "calves", d: "M146 512 C166 505 177 525 171 568 C164 605 139 602 139 565Z M269 512 C249 505 238 525 244 568 C251 605 276 602 276 565Z" },
];

const BACK_REGIONS = [
  { slug: "traps", d: "M160 95 L207 134 L255 95 C250 131 232 158 207 169 C183 158 165 131 160 95Z" },
  { slug: "shoulders", d: "M111 111 C82 117 66 139 65 167 C95 170 118 158 134 133 C130 120 122 113 111 111Z M304 111 C333 117 349 139 350 167 C320 170 297 158 281 133 C285 120 293 113 304 111Z" },
  { slug: "lats", d: "M139 145 C167 154 195 170 203 207 L197 319 C162 304 139 262 128 201Z M276 145 C248 154 220 170 212 207 L218 319 C253 304 276 262 287 201Z" },
  { slug: "triceps", d: "M82 171 C58 206 55 255 67 300 C91 278 101 223 101 188Z M333 171 C357 206 360 255 348 300 C324 278 314 223 314 188Z" },
  { slug: "forearms", d: "M65 306 C48 331 35 362 34 397 C51 408 71 389 78 357 C81 337 77 318 65 306Z M350 306 C367 331 380 362 381 397 C364 408 344 389 337 357 C334 337 338 318 350 306Z" },
  { slug: "lower_back", d: "M178 315 C194 323 221 323 237 315 L231 365 C218 378 197 378 184 365Z" },
  { slug: "glutes", d: "M150 366 C177 351 202 368 203 399 C199 431 165 438 144 416 C136 394 138 378 150 366Z M265 366 C238 351 213 368 212 399 C216 431 250 438 271 416 C279 394 277 378 265 366Z" },
  { slug: "hamstrings", d: "M150 420 C178 415 194 433 191 468 L177 528 C171 552 144 547 141 519Z M265 420 C237 415 221 433 224 468 L238 528 C244 552 271 547 274 519Z" },
  { slug: "calves", d: "M146 533 C166 525 177 546 171 586 C164 615 139 612 139 578Z M269 533 C249 525 238 546 244 586 C251 615 276 612 276 578Z" },
];

function Region({ region, selectedSlug, hoveredSlug, setHoveredSlug, onSelect }) {
  const active = selectedSlug === region.slug || hoveredSlug === region.slug;

  return (
    <path
      d={region.d}
      data-muscle={region.slug}
      role="button"
      tabIndex={0}
      aria-label={region.slug}
      onMouseEnter={() => setHoveredSlug(region.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
      onFocus={() => setHoveredSlug(region.slug)}
      onBlur={() => setHoveredSlug(null)}
      onClick={() => onSelect(region.slug)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(region.slug);
        }
      }}
      className="cursor-pointer outline-none transition-[fill,stroke,opacity,filter] duration-200"
      fill={active ? "#ff4d4f" : "rgba(255,255,255,0.01)"}
      stroke={active ? "#97181f" : "#101617"}
      strokeWidth={active ? 3 : 2}
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity={active ? 0.92 : 1}
      style={{ filter: active ? "drop-shadow(0 8px 15px rgba(255,77,79,.28))" : "none" }}
    />
  );
}

function BaseBody({ side = "front" }) {
  return (
    <g pointerEvents="none">
      <circle cx="207.5" cy="49" r="35" fill="#edf0ed" stroke="#101617" strokeWidth="3" />
      <path d="M183 76 C192 84 223 84 232 76 L235 108 C224 117 191 117 180 108Z" fill="#edf0ed" stroke="#101617" strokeWidth="3" />
      <path d="M133 110 C154 99 261 99 282 110 C304 125 317 153 320 190 L332 327 C336 380 312 411 287 410 L271 604 C268 639 230 639 225 604 L208 435 L190 604 C185 639 147 639 144 604 L128 410 C103 411 79 380 83 327 L95 190 C98 153 111 125 133 110Z" fill="#edf0ed" stroke="#101617" strokeWidth="3" />
      <path d="M98 150 C73 177 61 219 57 267 L42 389 C40 412 59 422 72 404 L96 324 L110 182Z" fill="#edf0ed" stroke="#101617" strokeWidth="3" />
      <path d="M317 150 C342 177 354 219 358 267 L373 389 C375 412 356 422 343 404 L319 324 L305 182Z" fill="#edf0ed" stroke="#101617" strokeWidth="3" />
      <path d="M156 604 C149 620 128 629 108 626 M259 604 C266 620 287 629 307 626" fill="none" stroke="#101617" strokeWidth="3" strokeLinecap="round" />
      {side === "front" ? (
        <>
          <path d="M142 126 C170 151 246 151 273 126 M204 218 L204 352 M170 254 L240 254 M169 289 L241 289 M172 323 L238 323" fill="none" stroke="#101617" strokeWidth="2" opacity=".9" />
          <path d="M146 153 C126 187 121 270 139 346 M269 153 C289 187 294 270 276 346" fill="none" stroke="#101617" strokeWidth="2" opacity=".8" />
          <path d="M154 362 C179 379 194 409 191 455 M261 362 C236 379 221 409 224 455" fill="none" stroke="#101617" strokeWidth="2" opacity=".85" />
        </>
      ) : (
        <>
          <path d="M160 95 L207 134 L255 95 M207 136 L207 364 M139 145 C166 166 194 191 203 227 M276 145 C249 166 221 191 212 227" fill="none" stroke="#101617" strokeWidth="2" opacity=".9" />
          <path d="M177 315 C193 331 222 331 238 315 M146 383 C169 407 194 410 207 399 M269 383 C246 407 221 410 208 399" fill="none" stroke="#101617" strokeWidth="2" opacity=".85" />
        </>
      )}
    </g>
  );
}

function Figure({ side, regions, selectedSlug, hoveredSlug, setHoveredSlug, onSelect }) {
  return (
    <g>
      <BaseBody side={side} />
      <g>
        {regions.map((region) => (
          <Region
            key={`${side}-${region.slug}`}
            region={region}
            selectedSlug={selectedSlug}
            hoveredSlug={hoveredSlug}
            setHoveredSlug={setHoveredSlug}
            onSelect={onSelect}
          />
        ))}
      </g>
    </g>
  );
}

export default function MuscleMapSvg({ selectedSlug, hoveredSlug, setHoveredSlug, onSelect }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[#9ea3b0] p-3 shadow-inner">
      <svg
        viewBox="0 0 930 680"
        className="mx-auto h-auto w-full max-w-[780px]"
        role="img"
        aria-label="Интерактивная SVG-карта мышц НашФит"
      >
        <rect x="0" y="0" width="930" height="680" rx="32" fill="#9ea3b0" />
        <g transform="translate(36 22)">
          <Figure
            side="front"
            regions={FRONT_REGIONS}
            selectedSlug={selectedSlug}
            hoveredSlug={hoveredSlug}
            setHoveredSlug={setHoveredSlug}
            onSelect={onSelect}
          />
        </g>
        <g transform="translate(478 22)">
          <Figure
            side="back"
            regions={BACK_REGIONS}
            selectedSlug={selectedSlug}
            hoveredSlug={hoveredSlug}
            setHoveredSlug={setHoveredSlug}
            onSelect={onSelect}
          />
        </g>
      </svg>
    </div>
  );
}

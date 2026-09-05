const ENAMAD_ID = "7610456";
const ENAMAD_CODE = "TTAynE31ZROySOMylq55zc6b9LnHtleu";
const ENAMAD_HREF = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_SRC = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

export function EnamadSeal({ className = "" }: { className?: string }) {
  return (
    <a
      href={ENAMAD_HREF}
      target="_blank"
      // rel="noopener"
      referrerPolicy="origin"
      className={`inline-block ${className}`}
      aria-label="نماد اعتماد الکترونیکی"
    >
      <img
        src={ENAMAD_SRC}
        alt="نماد اعتماد الکترونیکی"
        referrerPolicy="origin"
        width={125}
        height={137}
        className="h-21 w-auto cursor-pointer"
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}

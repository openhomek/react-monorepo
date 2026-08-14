import { CheckCircle } from '@phosphor-icons/react'

function GuideTakeaways({ items }: { items: string[] }) {
  return (
    <section
      id="guide-takeaways"
      aria-labelledby="guide-takeaways-heading"
      className="rounded-[14px] border border-[#ffd1d9] bg-[#fff7f8] p-5 min-[744px]:p-7"
    >
      <h2 id="guide-takeaways-heading" className="text-lg font-bold text-[#222222]">
        先看重點
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-7 text-[#3f3f3f] min-[744px]:text-base">
            <CheckCircle
              size={20}
              weight="fill"
              aria-hidden="true"
              className="mt-1 shrink-0 text-primary"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GuideTakeaways

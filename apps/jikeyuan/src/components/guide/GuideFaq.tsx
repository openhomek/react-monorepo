import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@react-monorepo/ui'

import type { GuideFaqItem } from '../../content/guides'

function GuideFaq({ items }: { items: GuideFaqItem[] }) {
  return (
    <section id="guide-faq" aria-labelledby="guide-faq-heading">
      <h2
        id="guide-faq-heading"
        className="text-[21px] leading-[1.35] font-semibold tracking-[-0.01em] text-[#222222] min-[744px]:text-[24px] min-[744px]:leading-[1.35]"
      >
        常見問題
      </h2>
      <Accordion type="single" collapsible className="mt-2">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#ebebeb]">
            <AccordionTrigger className="py-3.5 text-[15px] font-medium leading-6 text-[#222222] hover:no-underline hover:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-[14px] leading-[1.8] text-[#3f3f3f]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export default GuideFaq

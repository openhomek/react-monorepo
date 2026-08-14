import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@react-monorepo/ui'

import type { GuideFaqItem } from '../../content/guides'

function GuideFaq({ items }: { items: GuideFaqItem[] }) {
  return (
    <section aria-labelledby="guide-faq-heading">
      <h2 id="guide-faq-heading" className="text-[22px] leading-9 font-semibold text-[#222222]">
        常見問題
      </h2>
      <Accordion type="single" collapsible className="mt-4">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#ebebeb]">
            <AccordionTrigger className="py-4 text-[15px] font-medium text-[#222222] hover:no-underline hover:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-[#3f3f3f]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export default GuideFaq

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"


function SidebarUserAccordion() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="user-info">
                <AccordionTrigger>
                    Account &amp; context
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div>
                            <span className="font-medium text-foreground">shadcn</span>
                            <div>m@example.com</div>
                        </div>
                        <div className="pt-2 border-t">
                            <div>Last updated: just now</div>
                            <div>More account stuff can go here.</div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="help">
                <AccordionTrigger>
                    Help &amp; tips
                </AccordionTrigger>
                <AccordionContent>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Use the left icons to switch pages.</p>
                        <p>• Use the theme item to toggle dark/light mode.</p>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

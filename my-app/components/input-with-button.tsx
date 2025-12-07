import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-xl items-center gap-2 mx-auto">
      <Input type="text" placeholder="What do you want to explore!?" className="w-full" />
      <Button type="submit" variant="default" size="icon-sm" className="rounded-full cursor-pointer">
        <Send />
      </Button>
    </div>
  )
}
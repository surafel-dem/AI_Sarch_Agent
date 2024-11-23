interface MessageBubbleProps {
  content: string
  sender: 'user' | 'bot'
}

export function MessageBubble({ content, sender }: MessageBubbleProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-2
        ${sender === 'user' 
          ? 'bg-[#3b82f6] text-white ml-auto rounded-br-sm' 
          : 'bg-[#000435]/50 text-white mr-auto rounded-bl-sm'
        }
      `}>
        <div className="text-base">{content}</div>
      </div>
    </div>
  )
} 
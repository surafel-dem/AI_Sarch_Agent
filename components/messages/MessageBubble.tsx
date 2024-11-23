'use client'

interface MessageBubbleProps {
  content: string
  sender: 'user' | 'bot'
  type?: 'default' | 'suggestion' | 'info' | 'error'
  actions?: Array<{
    label: string
    onClick: () => void
  }>
  isTyping?: boolean
}

export function MessageBubble({ 
  content, 
  sender, 
  type = 'default',
  actions,
  isTyping 
}: MessageBubbleProps) {
  const bubbleStyles = {
    user: 'bg-[#3b82f6] text-white rounded-tr-sm',
    bot: {
      default: 'bg-[#000435]/50 text-white rounded-tl-sm',
      suggestion: 'bg-[#4f46e5]/30 text-white rounded-tl-sm border border-[#4f46e5]/30',
      info: 'bg-[#0ea5e9]/20 text-white rounded-tl-sm border border-[#0ea5e9]/30',
      error: 'bg-[#ef4444]/20 text-white rounded-tl-sm border border-[#ef4444]/30'
    }
  }

  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`
        inline-block px-4 py-2 rounded-2xl
        ${sender === 'user' 
          ? bubbleStyles.user 
          : bubbleStyles.bot[type]
        }
      `}>
        <div className="text-base">
          {isTyping ? (
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          ) : (
            <>
              {content}
              {actions && actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
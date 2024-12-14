import ReactMarkdown from 'react-markdown';
import { AgentResponse as AgentResponseType } from '@/types/search';

interface AgentResponseProps {
  response: AgentResponseType | string | undefined;
  isLoading?: boolean;
}

export function AgentResponse({ response, isLoading }: AgentResponseProps) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-4">
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const cleanResponse = (text: string): string => {
    // Parse the JSON if it's a string representation of JSON
    let content = text;
    try {
      if (text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        content = parsed.output || parsed.content || text;
      }
    } catch (e) {
      // If parsing fails, use the original text
      content = text;
    }

    // Clean up the text
    return content
      .replace(/^["']|["']$/g, '')                    // Remove surrounding quotes
      .replace(/\\n/g, '\n')                          // Replace escaped newlines
      .replace(/\\"/g, '"')                           // Replace escaped quotes
      .replace(/^{.*?"output":\s*"|"}$/g, '')         // Remove JSON wrapper
      .replace(/\\t/g, '  ')                          // Replace tabs with spaces
      .replace(/\s*\n\s*\n\s*\n+/g, '\n\n')          // Normalize multiple newlines
      .replace(/\[|\]|{|}|\\|undefined$/g, '')        // Remove JSON artifacts
      .trim();                                        // Remove extra whitespace
  };

  const content = typeof response === 'string' 
    ? cleanResponse(response)
    : cleanResponse(response.content || JSON.stringify(response));

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="prose prose-sm max-w-none text-gray-700">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-lg font-semibold" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-base font-semibold" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-sm font-semibold" {...props} />,
            p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="text-sm space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-sm" {...props} />,
            a: ({node, ...props}) => (
              <a 
                className="text-blue-600 hover:text-blue-800 no-underline" 
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

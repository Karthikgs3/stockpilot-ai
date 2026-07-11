const SUGGESTED_PROMPTS = [
  "Analyze my portfolio",
  "Summarize today's market",
  "What news affects my holdings?",
  "Compare Infosys and TCS",
  "Explain my portfolio risk",
  "Summarize today's biggest market movers",
];

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="rounded-lg border border-border px-4 py-3 text-left text-sm text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-subtle"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

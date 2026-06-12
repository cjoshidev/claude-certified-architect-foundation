// Quick-reference rules for the Claude Certified Architect exam.
// Inline code is written with `backticks` and rendered via the RichText helper.

const CHEAT_SHEET = {
  1: {
    tag: 'D1',
    title: 'Agentic Architecture & Orchestration (27%)',
    rules: [
      { label: 'Agentic loop control', text: 'Terminate on `stop_reason == "end_turn"`, continue on `stop_reason == "tool_use"`. Never parse text or use iteration caps as primary control.' },
      { label: 'Tool results', text: 'MUST append `tool_result` to messages array between iterations. Skipping causes infinite re-requests.' },
      { label: 'Hub-and-spoke', text: 'All inter-subagent communication flows through coordinator. Subagents never talk directly. Subagents have isolated context.' },
      { label: 'Context passing', text: 'Coordinator must explicitly include prior findings in each subagent\'s prompt. Subagents inherit NOTHING automatically.' },
      { label: 'Structured output', text: 'Use objects with explicit fields (claim, source_url, date) not prose. Preserves attribution through synthesis.' },
      { label: 'Parallel subagents', text: 'Emit multiple Task tool calls in a single coordinator response. Latency = max(individual), not sum.' },
      { label: 'Coordinator prompts', text: 'Specify goals & quality criteria, NOT step-by-step procedures. Let coordinator adapt to query complexity.' },
      { label: 'Programmatic prerequisites', text: 'Block downstream tools until preconditions met (e.g., no refund until customer verified). Deterministic, not prompt-based.' },
      { label: 'Hooks vs prompts', text: 'Hooks = guaranteed compliance (financial, privacy, safety). Prompts = probabilistic (tone, style, guidance).' },
      { label: 'PostToolUse hooks', text: 'Normalize data formats (dates, currencies) deterministically before model processes results.' },
      { label: 'Iterative refinement', text: 'Evaluate synthesis → identify gaps → re-delegate targeted queries → re-synthesize. NOT parallel reruns.' },
      { label: 'Session management', text: '`--resume` = linear continuation. `fork_session` = parallel branches. Fresh + summary when prior context is 60%+ stale.' },
      { label: 'Task decomposition', text: 'Prompt chaining for fixed steps (PR review). Dynamic adaptive for open-ended investigation (debugging).' },
      { label: 'Attention dilution', text: 'Large single-pass reviews → inconsistent depth. Fix: per-file passes + separate cross-file integration pass.' },
    ],
  },
  2: {
    tag: 'D2',
    title: 'Tool Design & MCP Integration (18%)',
    rules: [
      { label: 'Tool descriptions', text: 'Differentiate each tool\'s purpose, inputs, outputs, and when to use vs alternatives. Vague descriptions → misrouting.' },
      { label: 'Split generic tools', text: 'One tool per purpose with defined contracts (extract_data, summarize_content, verify_claim).' },
      { label: 'Error responses', text: 'Include `errorCategory` (transient/business/permission), `isRetryable` boolean, human-readable description.' },
      { label: 'Empty results ≠ errors', text: '`{"results": [], "total": 0}` is success. `{"isError": true}` is failure. Don\'t retry valid empty results.' },
      { label: 'Scoped tool access', text: 'Give each subagent only role-relevant tools. More tools = degraded selection reliability.' },
      { label: 'tool_choice', text: '"auto": model decides. "any": must call a tool. {"name":...}: forces specific tool.' },
      { label: 'MCP config', text: 'Project-scoped `.mcp.json` for team (version-controlled). User-scoped `~/.claude.json` for personal/experimental.' },
      { label: 'Built-in tools', text: 'Grep = content search. Glob = file name patterns. Read + Write = fallback when Edit fails on non-unique anchors.' },
    ],
  },
  3: {
    tag: 'D3',
    title: 'Claude Code Configuration (20%)',
    rules: [
      { label: 'CLAUDE.md hierarchy', text: 'User (~/.claude/CLAUDE.md) = personal. Project (.claude/CLAUDE.md) = team-shared. Rules (.claude/rules/) = conditional.' },
      { label: '@import', text: 'Modular standards files. Each package imports only relevant conventions. No duplication.' },
      { label: 'Path-specific rules', text: 'YAML frontmatter `paths: ["**/*.test.tsx"]`. Loaded only when editing matching files.' },
      { label: 'Slash commands', text: 'Project-scoped in `.claude/commands/` (version-controlled). User-scoped in `~/.claude/commands/`.' },
      { label: 'context: fork', text: 'Isolates verbose skill output in sub-agent. Prevents main session context pollution.' },
      { label: 'allowed-tools', text: 'In skill frontmatter. Restricts available tools during skill execution. Deterministic prevention.' },
      { label: 'Plan mode', text: 'For architectural decisions, large migrations, multiple valid approaches. Direct execution for clear single-file fixes.' },
      { label: 'CI/CD', text: 'Use `-p` flag for non-interactive. `--output-format json` + `--json-schema` for structured findings.' },
      { label: 'Interview pattern', text: 'Have Claude ask YOU questions before implementing in unfamiliar domains. Surfaces hidden design decisions.' },
    ],
  },
  4: {
    tag: 'D4',
    title: 'Prompt Engineering & Structured Output (20%)',
    rules: [
      { label: 'Explicit criteria', text: 'Define exactly what to report vs skip. Never rely on "be conservative" or confidence thresholds alone.' },
      { label: 'False positive trust', text: 'High FP categories undermine trust in all findings. Temporarily disable noisy categories to preserve trust in accurate ones.' },
      { label: 'Few-shot examples', text: '2-4 targeted examples for ambiguous edge cases. Show input → output → reasoning. More effective than rules.' },
      { label: 'Nullable fields', text: 'Make schema fields optional when info may be absent. Required + absent = model fabricates data.' },
      { label: '"other" + detail', text: 'Add escape hatch to enums with "other" value + companion _detail string field for unexpected categories.' },
      { label: 'Retry with context', text: 'Include original document + failed extraction + specific validation error. "Fix your response" alone is useless.' },
      { label: 'Retries won\'t help when', text: 'Information is absent from the provided document. Only retry format/structural errors, not missing data.' },
      { label: 'Batch API', text: '50% cost savings, up to 24h latency. Use for overnight/weekly analysis. Never for blocking pre-merge checks.' },
      { label: 'Independent reviewer', text: 'Separate instance without generator\'s reasoning context catches issues the generator rationalized away.' },
    ],
  },
  5: {
    tag: 'D5',
    title: 'Context Management & Reliability (15%)',
    rules: [
      { label: 'Case facts block', text: 'Extract amounts, dates, IDs into persistent block outside summarized history. Never summarize transactional facts.' },
      { label: 'Trim tool outputs', text: 'Keep only task-relevant fields before appending to context. 5 relevant fields > 40 irrelevant fields.' },
      { label: 'Lost-in-the-middle', text: 'Place key findings at START of aggregated inputs. Use explicit section headers throughout.' },
      { label: 'Explicit escalation', text: 'Always honor immediately. Never gate behind sentiment scores or thresholds.' },
      { label: 'Policy gaps', text: 'When policy is silent on the request, escalate. Don\'t approve or deny — agent can\'t make unbacked policy decisions.' },
      { label: 'Multiple matches', text: 'Ask for additional identifiers. Never select via heuristics (most recent, alphabetical).' },
      { label: 'Structured errors', text: 'failure type + what was attempted + partial results + isRetryable + alternatives.' },
      { label: 'Coverage annotations', text: 'Synthesis must flag which subtopics have gaps, not silently omit them.' },
      { label: 'Scratchpad files', text: 'Counteract context degradation in long sessions. Record key findings externally, reference later.' },
      { label: 'Confidence calibration', text: 'Set routing thresholds using labeled validation sets + actual accuracy data, not arbitrary cutoffs.' },
      { label: 'Conflicting sources', text: 'Present both with attribution + flag conflict. Never select one, average, or drop silently.' },
    ],
  },
}

export default CHEAT_SHEET

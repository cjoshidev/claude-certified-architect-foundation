const DOMAINS = [
  {
    id: 1,
    title: "Agentic Architecture & Orchestration",
    weight: "27%",
    desc: "Design and implement agentic systems, multi-agent coordination, subagent spawning, enforcement patterns, hooks, task decomposition, and session management.",
    tasks: [
      {
        id: "1.1",
        title: "Design and implement agentic loops for autonomous task execution",
        skills: [
          {
            text: "Implementing agentic loop control flow that continues when stop_reason is \"tool_use\" and terminates when stop_reason is \"end_turn\"",
            q: {
              stem: "Your agentic loop is sometimes not terminating correctly. A junior engineer suggests using `if 'I have finished' in response.content[0].text: break` as the exit condition. Why is this approach fundamentally flawed?",
              options: [
                "String matching is too slow for production agentic systems",
                "The loop must inspect `stop_reason` — when it is `\"end_turn\"` the loop terminates; when it is `\"tool_use\"` the loop continues. Parsing assistant text for natural language signals is an anti-pattern that will fail unpredictably",
                "The condition should check `response.stop_reason == 'complete'` instead",
                "The loop should use a timeout rather than any content-based termination"
              ],
              correct: 1,
              reasoning: "The agentic loop must be driven by `stop_reason`, not by parsing natural language in the assistant's text. When Claude returns `stop_reason: \"end_turn\"`, it is signalling it has finished. When it returns `stop_reason: \"tool_use\"`, it wants a tool executed. Text parsing breaks when Claude phrases its completion differently or when it returns tool calls with accompanying text."
            }
          },
          {
            text: "Adding tool results to conversation context between iterations so the model can incorporate new information into its reasoning",
            q: {
              stem: "After executing a tool, your loop sends a new request to Claude but the model keeps repeating the same tool call, seemingly unaware the tool already ran. What is the most likely cause?",
              options: [
                "Claude does not support iterative tool calling",
                "The tool result is not being appended to the conversation history before the next API call — Claude cannot see what the tool returned and therefore requests the same tool again",
                "The tool description needs to include a note that results are automatically stored",
                "You need to set `tool_choice: \"auto\"` to allow Claude to see prior results"
              ],
              correct: 1,
              reasoning: "Between each agentic loop iteration, the tool result must be appended to the messages array as a `tool_result` content block associated with the `tool_use` block. If this step is skipped, Claude sends its next request with no knowledge of what the tool returned, causing it to repeat the same call."
            }
          },
          {
            text: "Avoiding anti-patterns such as parsing natural language signals to determine loop termination, setting arbitrary iteration caps as the primary stopping mechanism, or checking for assistant text content as a completion indicator",
            q: {
              stem: "A team member proposes: `if iteration_count >= 10: break` as the sole termination condition in your agentic loop. What is wrong with this approach?",
              options: [
                "Ten iterations is too few — it should be at least 50",
                "An iteration cap as the primary stopping mechanism is an anti-pattern. The loop should terminate on `stop_reason == \"end_turn\"`. An iteration cap can exist as a safety fallback to prevent infinite loops, but it must not be the primary control mechanism",
                "The cap should be based on token count, not iteration count",
                "Iteration caps are not supported by the Claude Agent SDK"
              ],
              correct: 1,
              reasoning: "Using an iteration cap as the primary termination condition means the loop will abort tasks mid-way if they genuinely require more steps, and will never correctly signal task completion. The correct primary mechanism is `stop_reason == \"end_turn\"`. An iteration cap is acceptable as a safety net (secondary mechanism) to prevent runaway loops, not as the main driver."
            }
          }
        ]
      },
      {
        id: "1.2",
        title: "Orchestrate multi-agent systems with coordinator-subagent patterns",
        skills: [
          {
            text: "Designing coordinator agents that analyze query requirements and dynamically select which subagents to invoke rather than always routing through the full pipeline",
            q: {
              stem: "Your multi-agent research system routes every query — including simple factual lookups like \"what is the capital of France\" — through all four subagents: web search, document analysis, synthesis, and report generation. Users complain about latency. What is the root cause?",
              options: [
                "The subagents are running sequentially instead of in parallel",
                "The coordinator prompt instructs it to always route through the full pipeline rather than dynamically selecting subagents based on query complexity and requirements",
                "The synthesis subagent is too slow and needs a faster model",
                "The report generation subagent should be removed from the pipeline"
              ],
              correct: 1,
              reasoning: "The coordinator should analyze query requirements and dynamically select only the subagents needed. A simple factual query does not need document analysis, synthesis, or a full formatted report. The coordinator prompt should specify research goals and criteria for when each subagent is appropriate — not a fixed pipeline that always runs everything."
            }
          },
          {
            text: "Partitioning research scope across subagents to minimize duplication (e.g., assigning distinct subtopics or source types to each agent)",
            q: {
              stem: "Your coordinator decomposes \"the economic and social impact of AI\" into three web-search subagents, all with the instruction \"research AI's impact.\" The final report contains largely identical findings repeated three times. What should the coordinator have done?",
              options: [
                "Used only one subagent with a larger context window to cover the full topic",
                "Assigned distinct, non-overlapping scope to each subagent — for example: subagent 1 covers economic impact (GDP, employment, productivity), subagent 2 covers social impact (education, inequality, public perception), subagent 3 covers policy and regulatory responses",
                "Removed two of the three subagents to eliminate redundancy",
                "Instructed each subagent to check the others' output before writing"
              ],
              correct: 1,
              reasoning: "Partitioning scope across subagents — assigning distinct subtopics or source types to each — minimises duplication and ensures comprehensive coverage. Giving all subagents identical instructions causes them to explore the same space and return overlapping findings. The coordinator is responsible for this decomposition quality."
            }
          },
          {
            text: "Implementing iterative refinement loops where the coordinator evaluates synthesis output for gaps, re-delegates to search and analysis subagents with targeted queries, and re-invokes synthesis until coverage is sufficient",
            q: {
              stem: "Your research pipeline runs once: web search → document analysis → synthesis → report. The final report consistently has significant gaps in technical depth. What architectural change would most directly address this?",
              options: [
                "Give the synthesis subagent access to the internet so it can fill gaps itself",
                "Add an iterative refinement loop: after synthesis, the coordinator evaluates coverage gaps and re-delegates targeted queries to search and analysis subagents, then re-invokes synthesis with the supplemental findings",
                "Replace the synthesis subagent with a larger model",
                "Have the report generation subagent identify and annotate gaps in the report"
              ],
              correct: 1,
              reasoning: "Iterative refinement loops allow the coordinator to evaluate whether synthesis output is sufficient, identify specific gaps, and send targeted follow-up queries to the relevant subagents before re-invoking synthesis. A single-pass pipeline cannot adapt to gaps discovered only after seeing the initial synthesis output."
            }
          },
          {
            text: "Routing all subagent communication through the coordinator for observability, consistent error handling, and controlled information flow",
            q: {
              stem: "To reduce latency, a developer proposes allowing the web search subagent to send results directly to the synthesis subagent, bypassing the coordinator. What is the key risk of this approach?",
              options: [
                "Direct communication is not technically possible in the Claude Agent SDK",
                "Bypassing the coordinator removes observability, breaks consistent error handling, and creates uncontrolled information flow. If the web search subagent fails, there is no central point to detect the failure and decide whether to retry, use partial results, or escalate",
                "It would cause the synthesis subagent to run out of context",
                "The coordinator needs to approve all tool calls before they are executed"
              ],
              correct: 1,
              reasoning: "The hub-and-spoke pattern requires all inter-subagent communication to pass through the coordinator. This provides a central point for observability (seeing what each subagent produced), consistent error handling (deciding how to respond to failures), and controlled information flow (ensuring subagents receive only what they need). Bypassing the coordinator creates hidden failure modes and inconsistent behaviour."
            }
          }
        ]
      },
      {
        id: "1.3",
        title: "Configure subagent invocation, context passing, and spawning",
        skills: [
          {
            text: "Including complete findings from prior agents directly in the subagent's prompt (e.g., passing web search results and document analysis outputs to the synthesis subagent)",
            q: {
              stem: "Your synthesis subagent is producing generic summaries that don't reference the specific findings from the web search and document analysis subagents. Investigation shows those subagents ran successfully. What is the most likely cause?",
              options: [
                "The synthesis subagent's model is not powerful enough to use the findings",
                "Subagents operate with isolated context — they do not automatically inherit findings from prior subagents. The coordinator must explicitly include the complete findings from prior agents directly in the synthesis subagent's prompt",
                "The synthesis subagent needs read access to the coordinator's conversation history",
                "The web search and document analysis subagents need to call the synthesis subagent directly"
              ],
              correct: 1,
              reasoning: "Subagents do not automatically inherit findings from other subagents or from the coordinator's conversation history. Context is isolated per subagent. The coordinator must explicitly pass all relevant findings — web search results, document analysis outputs — in the synthesis subagent's prompt. This is one of the most commonly tested points in Domain 1."
            }
          },
          {
            text: "Using structured data formats to separate content from metadata (source URLs, document names, page numbers) when passing context between agents to preserve attribution",
            q: {
              stem: "Your synthesis subagent produces a report with accurate content but no source citations. Investigation shows the web search subagent did return source URLs but the synthesis agent's report contains no attribution. What was the architectural failure?",
              options: [
                "The synthesis subagent needs to be instructed to add citations at the end",
                "The web search subagent's findings were passed as free-form text, mixing content and metadata. Structured formats that separate claim content from metadata fields (source URL, document name, publication date) must be used when passing context between agents so attribution is preserved through synthesis",
                "A separate citation agent should run after synthesis to look up sources",
                "The coordinator should re-attach source URLs to the final report by cross-referencing subagent outputs"
              ],
              correct: 1,
              reasoning: "When subagent findings are passed as unstructured text, metadata like source URLs gets lost during synthesis. The correct pattern is to require subagents to return structured objects: `{claim: \"...\", source_url: \"...\", document_name: \"...\", excerpt: \"...\"}`. The synthesis agent then has explicit fields to preserve attribution rather than inferring it from prose."
            }
          },
          {
            text: "Spawning parallel subagents by emitting multiple Task tool calls in a single coordinator response rather than across separate turns",
            q: {
              stem: "Your coordinator invokes the web search subagent, waits for its result, then invokes the document analysis subagent, waits, then invokes the synthesis subagent. Total pipeline time is 45 seconds. Web search and document analysis are independent. How do you reduce latency?",
              options: [
                "Give the coordinator a faster model so it makes decisions more quickly",
                "Emit multiple Task tool calls in a single coordinator response to spawn web search and document analysis in parallel rather than sequentially. They run concurrently and both results are returned before the coordinator proceeds",
                "Run the entire pipeline twice in parallel and take whichever finishes first",
                "Combine web search and document analysis into a single subagent"
              ],
              correct: 1,
              reasoning: "Parallel subagent execution is achieved by emitting multiple Task tool calls in a single coordinator response — not across separate turns. The Agent SDK executes these concurrently. Web search and document analysis are independent (neither needs the other's output to start), so they can run in parallel, significantly reducing total pipeline latency."
            }
          },
          {
            text: "Designing coordinator prompts that specify research goals and quality criteria rather than step-by-step procedural instructions, to enable subagent adaptability",
            q: {
              stem: "Your coordinator's system prompt reads: \"Step 1: call web_search. Step 2: call analyze_document. Step 3: call synthesize. Step 4: call generate_report.\" For a simple factual query, it still runs all four steps. What is the fundamental problem with this prompt design?",
              options: [
                "The steps are in the wrong order",
                "Step-by-step procedural instructions prevent the coordinator from adapting to query complexity. Coordinator prompts should specify research goals and quality criteria (\"produce a comprehensive, cited report covering X aspects\") so the coordinator can dynamically decide which subagents to invoke based on what is actually needed",
                "The coordinator should not have access to all four subagents simultaneously",
                "The prompt needs more detailed instructions for each step"
              ],
              correct: 1,
              reasoning: "Hardcoding step-by-step procedures in the coordinator prompt creates a rigid pipeline that cannot adapt. The coordinator should be given goals and quality criteria — e.g., \"research the topic comprehensively, ensure coverage of economic, social, and policy dimensions, verify claims from multiple sources\" — and decide autonomously which subagents to invoke and how many iterations are needed."
            }
          }
        ]
      },
      {
        id: "1.4",
        title: "Implement multi-step workflows with enforcement and handoff patterns",
        skills: [
          {
            text: "Implementing programmatic prerequisites that block downstream tool calls until prerequisite steps have completed (e.g., blocking process_refund until get_customer has returned a verified customer ID)",
            q: {
              stem: "Your customer support agent occasionally processes refunds without first verifying the customer's identity via `get_customer`, leading to refunds being applied to the wrong account. Your system prompt says \"always verify the customer first.\" The issue persists. What is the correct fix?",
              options: [
                "Add few-shot examples showing the agent calling `get_customer` before `process_refund`",
                "Implement a programmatic prerequisite: block `process_refund` from executing unless a verified customer ID from a prior `get_customer` call is present in the session state. Prompt instructions have a non-zero failure rate; programmatic gates do not",
                "Move the verification instruction to the beginning of the system prompt where it will have more weight",
                "Add a confirmation step asking the agent to output the customer ID before calling `process_refund`"
              ],
              correct: 1,
              reasoning: "Prompt instructions are probabilistic — they work most of the time but will fail. For a critical business rule like identity verification before financial operations, you need deterministic enforcement. A programmatic prerequisite that checks for a verified customer ID before allowing `process_refund` to execute provides guaranteed compliance regardless of how the model interprets its instructions."
            }
          },
          {
            text: "Decomposing multi-concern customer requests into distinct items, then investigating each in parallel using shared context before synthesizing a unified resolution",
            q: {
              stem: "A customer sends: \"I have a missing item from order #1234 AND I was double-charged for order #5678.\" Your agent investigates the missing item, resolves it, then starts investigating the double charge. The customer is frustrated by the slow resolution. What is the better approach?",
              options: [
                "Ask the customer to submit separate tickets for each issue",
                "Decompose the request into two distinct concerns (missing item, billing dispute), investigate each in parallel using shared customer context, then synthesize a single unified response addressing both",
                "Escalate immediately since multi-concern requests are too complex",
                "Resolve the most recent issue first since it is likely more urgent"
              ],
              correct: 1,
              reasoning: "Multi-concern requests should be decomposed into distinct items and investigated in parallel where possible. Both issues share the same customer context and can be looked up simultaneously. The agent then synthesises a single response addressing both, which is faster and provides a better customer experience than sequential handling."
            }
          },
          {
            text: "Compiling structured handoff summaries (customer ID, root cause, refund amount, recommended action) when escalating to human agents who lack access to the conversation transcript",
            q: {
              stem: "A customer is escalated to a human support agent. The human agent has no access to the AI conversation transcript. The customer is frustrated at having to repeat everything. What should the AI agent have done before escalating?",
              options: [
                "Sent the full conversation transcript to the human agent's email",
                "Compiled a structured handoff summary containing: customer ID, issue summary, root cause, amounts and order IDs involved, steps already taken, and recommended next action — everything the human agent needs without access to the full transcript",
                "Asked the customer for permission before escalating",
                "Provided a confidence score so the human agent knows how certain the AI was"
              ],
              correct: 1,
              reasoning: "Human agents receiving escalations will not have access to the full AI conversation transcript. The AI must compile a structured handoff summary before escalating, covering all critical context: who the customer is, what they need, what was already tried, what the recommended resolution is, and any amounts or IDs involved. This prevents the customer needing to repeat themselves."
            }
          }
        ]
      },
      {
        id: "1.5",
        title: "Apply Agent SDK hooks for tool call interception and data normalization",
        skills: [
          {
            text: "Implementing PostToolUse hooks to normalize heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) from different MCP tools before the agent processes them",
            q: {
              stem: "Your agent integrates three MCP tools that return dates in different formats: Unix timestamps, ISO 8601 strings, and DD/MM/YYYY. The agent sometimes confuses date formats when reasoning across results. Where is the best place to normalize these formats?",
              options: [
                "In the system prompt with instructions like \"treat all dates as ISO 8601\"",
                "In a PostToolUse hook that intercepts each tool result and normalises all date fields to a consistent format before the model processes them — this provides deterministic transformation for every tool result",
                "In the tool descriptions, instructing each tool to return ISO 8601",
                "In a post-processing step applied to the final agent output"
              ],
              correct: 1,
              reasoning: "PostToolUse hooks intercept tool results after execution but before the model processes them. This is the ideal place for deterministic data normalisation — every result from every tool passes through the hook and is guaranteed to have consistent formatting. System prompt instructions are probabilistic (the model may misinterpret or miss edge cases)."
            }
          },
          {
            text: "Implementing tool call interception hooks that block policy-violating actions (e.g., refunds exceeding $500) and redirect to alternative workflows (e.g., human escalation)",
            q: {
              stem: "Your policy requires all refunds over $500 to be approved by a human agent. You add a system prompt instruction: \"Never process refunds over $500 autonomously.\" In testing, the agent correctly routes 94% of cases but bypasses the rule 6% of the time. What is the correct architectural fix?",
              options: [
                "Add more few-shot examples reinforcing the $500 rule",
                "Implement a tool call interception hook that fires before `process_refund` executes, checks the refund amount, and blocks the call if it exceeds $500 — redirecting instead to `escalate_to_human`. This provides a deterministic guarantee that no prompt compliance failure can bypass",
                "Lower the threshold to $400 to give a safety margin",
                "Use a PostToolUse hook to reverse refunds over $500 if they slip through"
              ],
              correct: 1,
              reasoning: "A 6% failure rate on a financial rule is unacceptable. Tool call interception hooks fire before tool execution, giving you a deterministic gate. The hook checks the refund amount before `process_refund` is allowed to run and redirects policy-violating calls. No matter how the model interprets its prompt, the hook will catch the violation — it is not probabilistic."
            }
          },
          {
            text: "Choosing hooks over prompt-based enforcement when business rules require guaranteed compliance",
            q: {
              stem: "Your team debates: system prompt enforcement vs programmatic hooks for a rule that prevents the agent from accessing customer financial records unless the customer has explicitly consented in the current session. Which should you choose and why?",
              options: [
                "System prompt — it is simpler to maintain and easier to update",
                "Programmatic hooks — business rules requiring guaranteed compliance must use deterministic enforcement. Prompt instructions have a non-zero failure rate; a hook that checks session state for consent before allowing the financial records tool to execute will never fail due to model interpretation",
                "Both — use a prompt instruction as the primary mechanism and a hook as backup",
                "System prompt for most cases, hooks only for rules above $1,000"
              ],
              correct: 1,
              reasoning: "The exam guide explicitly states: choose hooks over prompt-based enforcement when business rules require guaranteed compliance. Prompt instructions are probabilistic — they work most of the time but will occasionally fail. Hooks are deterministic. For rules with legal or privacy implications (like consent-gated data access), the failure mode of prompt instructions is unacceptable."
            }
          }
        ]
      },
      {
        id: "1.6",
        title: "Design task decomposition strategies for complex workflows",
        skills: [
          {
            text: "Selecting task decomposition patterns appropriate to the workflow: prompt chaining for predictable multi-aspect reviews, dynamic decomposition for open-ended investigation tasks",
            q: {
              stem: "You need to review a pull request for: (1) security vulnerabilities, (2) performance issues, (3) test coverage gaps. Each pass is well-defined and always runs. You also need to investigate a production incident with an unknown root cause. Which decomposition strategy fits each task?",
              options: [
                "Dynamic adaptive decomposition for both — it is always the more flexible approach",
                "Prompt chaining for the PR review (predictable fixed steps), dynamic adaptive decomposition for the incident investigation (open-ended, generates subtasks based on what is discovered at each step)",
                "Prompt chaining for both since both tasks have defined outputs",
                "Dynamic decomposition for the PR review, prompt chaining for the incident investigation"
              ],
              correct: 1,
              reasoning: "Prompt chaining is optimal for predictable, fixed multi-step workflows where the steps are known upfront. The PR review always runs the same three passes. Dynamic adaptive decomposition is optimal for open-ended investigation tasks where each finding determines the next step — incident investigation requires following the evidence rather than a predefined sequence."
            }
          },
          {
            text: "Splitting large code reviews into per-file local analysis passes plus a separate cross-file integration pass to avoid attention dilution",
            q: {
              stem: "Your code review agent analyses a 25-file PR in a single pass. Some files get detailed feedback, others get superficial comments, and the same anti-pattern is flagged in one file but approved in another. What is the root cause and correct fix?",
              options: [
                "The model needs a larger context window — switch to a model with 200k tokens",
                "Attention dilution: when too many files are analysed together, the model cannot maintain consistent depth. Fix: split into per-file local analysis passes (each file reviewed individually for local issues) plus a separate cross-file integration pass (for patterns spanning multiple files)",
                "Run three independent review passes on all files and flag only issues appearing in at least two runs",
                "Reduce the PR size requirement to 10 files maximum"
              ],
              correct: 1,
              reasoning: "Attention dilution is the documented cause of inconsistent depth in large single-pass reviews. The fix is architectural: per-file passes provide consistent local analysis depth for each file, and a separate cross-file integration pass identifies patterns that span modules. This is explicitly called out in the exam guide for the CI/CD scenario."
            }
          },
          {
            text: "Decomposing open-ended tasks (e.g., \"add comprehensive tests to a legacy codebase\") by first mapping structure, identifying high-impact areas, then creating a prioritized plan that adapts as dependencies are discovered",
            q: {
              stem: "You ask your agent to \"add comprehensive tests to a legacy codebase.\" It begins generating tests for files alphabetically starting with `api_client.py`. After 20 files, you notice it missed the core business logic in `order_processor.py`. What is the better decomposition approach?",
              options: [
                "Specify the exact file order in the prompt so the agent covers everything",
                "First map the codebase structure to understand module relationships and identify high-impact areas (core business logic, most-used utilities, error-prone components), then create a prioritised plan that adapts as dependencies and complexity are discovered",
                "Generate tests for all files in parallel using one subagent per file",
                "Start with the most recently modified files since they are most likely to have bugs"
              ],
              correct: 1,
              reasoning: "Alphabetical order is an arbitrary decomposition that ignores actual business value and dependency structure. For open-ended tasks like comprehensive test generation, the correct pattern is: (1) map the codebase structure, (2) identify high-impact areas based on business criticality and complexity, (3) create a prioritised plan that can adapt as dependencies between modules are discovered during implementation."
            }
          }
        ]
      },
      {
        id: "1.7",
        title: "Manage session state, resumption, and forking",
        skills: [
          {
            text: "Using --resume with session names to continue named investigation sessions across work sessions",
            q: {
              stem: "You spent two hours exploring a legacy codebase with Claude Code and named the session `legacy-audit`. You close your laptop, return the next morning, and want to continue exactly where you left off with all prior findings available. What is the correct approach?",
              options: [
                "Start a new session and paste a summary of yesterday's findings into the prompt",
                "Use `--resume legacy-audit` to continue the named session — the prior conversation context, findings, and tool results from yesterday's session are available to Claude",
                "Use `fork_session legacy-audit` to create a continuation branch",
                "Use `/memory legacy-audit` to load the session context"
              ],
              correct: 1,
              reasoning: "`--resume <session-name>` continues a specific named prior session, restoring the conversation context from that session. This is the correct mechanism for picking up an investigation across work sessions. `fork_session` is for exploring divergent approaches from a baseline, not for simple continuation."
            }
          },
          {
            text: "Using fork_session to create parallel exploration branches (e.g., comparing two testing strategies or refactoring approaches from a shared codebase analysis)",
            q: {
              stem: "After completing a thorough analysis of a payment module, you want to compare two refactoring approaches — one using the Strategy pattern, one using a plugin architecture — without contaminating either approach's findings with the other. What is the correct tool?",
              options: [
                "Start two entirely new sessions, re-run the analysis in each, then compare",
                "Use `fork_session` to create two independent branches from the shared payment module analysis baseline — each branch explores one approach without the other's findings bleeding in",
                "Use `--resume` twice with different instruction sets",
                "Run both explorations in the same session using clear section headers to separate them"
              ],
              correct: 1,
              reasoning: "`fork_session` creates independent branches from a shared analysis baseline. Both branches start from the same point (the completed payment module analysis) and can explore divergent approaches without interfering with each other. This is fundamentally different from `--resume`, which continues a single session linearly."
            }
          },
          {
            text: "Choosing between session resumption (when prior context is mostly valid) and starting fresh with injected summaries (when prior tool results are stale)",
            q: {
              stem: "You resume a session to continue a codebase audit. The session has extensive findings from 3 days ago. Since then, a major refactor changed 60% of the codebase. Many prior tool results now reference files and functions that no longer exist. What is the correct approach?",
              options: [
                "Resume the session with `--resume` and tell Claude which files changed",
                "Start a fresh session with a structured summary of the still-valid prior findings injected as context, rather than resuming with stale tool results that reference non-existent code",
                "Use `fork_session` to branch from the old analysis and re-explore from there",
                "Resume and run `/compact` to remove the stale tool results"
              ],
              correct: 1,
              reasoning: "When prior tool results are stale — they reference code that no longer exists — resuming that session imports invalid context that will confuse the model. The correct approach is to start fresh and inject a structured summary of findings that remain valid. Resuming is appropriate when prior context is mostly valid; fresh start with injected summary is appropriate when tool results are significantly stale."
            }
          },
          {
            text: "Informing a resumed session about specific file changes for targeted re-analysis rather than requiring full re-exploration",
            q: {
              stem: "You resume a session that contains a thorough audit of a 30-file codebase. Since the session, only `auth_service.py` and `token_validator.py` were modified. What is the most efficient approach?",
              options: [
                "Start a completely fresh session to avoid any risk of stale context",
                "Use `fork_session` to create a new branch and re-analyse the entire codebase",
                "Resume the session and inform Claude specifically that `auth_service.py` and `token_validator.py` changed — Claude will re-analyse only those files rather than re-exploring the entire codebase",
                "Resume and run a full re-analysis to be safe, since any file could have indirect dependencies"
              ],
              correct: 2,
              reasoning: "When only specific files have changed, resuming the session and informing Claude of exactly which files were modified triggers targeted re-analysis of only those files. The prior findings for the unchanged 28 files remain valid and do not need to be re-generated. Starting fresh or forking wastes all prior work. Full re-exploration is only needed if the changes are pervasive."
            }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Tool Design & MCP Integration",
    weight: "18%",
    desc: "Design effective MCP tool interfaces, implement structured error responses, distribute tools across agents, configure MCP servers, and select built-in tools appropriately.",
    tasks: [
      {
        id: "2.1",
        title: "Design effective tool interfaces with clear descriptions and boundaries",
        skills: [
          {
            text: "Writing tool descriptions that clearly differentiate each tool's purpose, expected inputs, outputs, and when to use it versus similar alternatives",
            q: {
              stem: "Two tools: `analyze_content` described as \"Analyzes content\" and `analyze_document` described as \"Analyzes documents.\" In production, Claude frequently calls the wrong tool. What is the most effective first fix?",
              options: [
                "Rename one tool to make names less similar",
                "Expand each description to clearly differentiate purpose, expected inputs, outputs, and when to use it vs the other — e.g., `analyze_content` for web-scraped text and HTML, `analyze_document` for PDFs and structured files with page references",
                "Add a routing classifier that pre-selects the tool based on input type",
                "Merge both tools into one that internally routes based on input format"
              ],
              correct: 1,
              reasoning: "Tool descriptions are the primary mechanism Claude uses for tool selection. Minimal descriptions like 'Analyzes content' vs 'Analyzes documents' give Claude no basis to differentiate. Expanding descriptions with input formats, example use cases, outputs, and explicit boundaries ('use this when... NOT for...') is the most direct fix and the one with lowest implementation cost."
            }
          },
          {
            text: "Renaming tools and updating descriptions to eliminate functional overlap (e.g., renaming analyze_content to extract_web_results with a web-specific description)",
            q: {
              stem: "You have two tools with near-identical descriptions that overlap in apparent functionality. Expanding descriptions has helped slightly but Claude still misroutes 20% of the time. What should you try next?",
              options: [
                "Add 10 few-shot examples showing the correct tool for each scenario",
                "Rename the tools to reflect their actual distinct purpose — if one handles web content and one handles file documents, names like `extract_web_results` and `parse_document_file` make the boundary obvious at the name level, before the description is even read",
                "Add an explicit instruction in the system prompt: 'Always prefer analyze_content for HTML'",
                "Remove one of the tools and combine their functionality"
              ],
              correct: 1,
              reasoning: "When descriptions alone don't resolve ambiguity, tool names themselves carry significant signal for Claude's selection. Renaming to reflect the actual distinct purpose — `extract_web_results` for web content, `parse_document_file` for file documents — makes the differentiation explicit at the name level. The description then reinforces rather than carrying the full burden."
            }
          },
          {
            text: "Splitting generic tools into purpose-specific tools with defined input/output contracts (e.g., splitting a generic analyze_document into extract_data_points, summarize_content, and verify_claim_against_source)",
            q: {
              stem: "You have a single `analyze_document` tool used for extracting structured data, summarising content, and verifying claims. Claude often uses it for the wrong purpose or combines operations that should be separate. What is the correct fix?",
              options: [
                "Add more parameters to `analyze_document` so callers can specify the operation type",
                "Split into purpose-specific tools with defined contracts: `extract_data_points` (returns structured fields), `summarize_content` (returns prose summary), `verify_claim_against_source` (returns boolean + evidence). Each tool has a clear, unambiguous purpose",
                "Create a router tool that calls the right internal function based on the request",
                "Add a system prompt instruction specifying when each use case applies"
              ],
              correct: 1,
              reasoning: "Generic tools that serve multiple purposes force Claude to infer the intended operation from context, leading to errors. Splitting into purpose-specific tools with defined input/output contracts gives Claude clear, unambiguous selection criteria. Each tool does exactly one thing and its name and description reflect that precisely."
            }
          },
          {
            text: "Reviewing system prompts for keyword-sensitive instructions that might override well-written tool descriptions",
            q: {
              stem: "Your tool descriptions are excellent — differentiated and specific. Yet in production, Claude always calls `get_customer` first even for pure order lookup queries. Your system prompt contains: 'Always verify the customer identity before proceeding.' What is happening?",
              options: [
                "The tool descriptions need to be longer to outweigh the system prompt",
                "The system prompt instruction 'always verify the customer identity first' creates a keyword association that overrides well-written tool descriptions — Claude interprets it as a directive to call `get_customer` for every request. The system prompt must be reviewed for keyword-sensitive instructions that create unintended tool associations",
                "This is expected behaviour — the system prompt always takes precedence over tool descriptions",
                "The `get_customer` tool description is likely too dominant in the tool list"
              ],
              correct: 1,
              reasoning: "System prompt wording can override tool selection even when descriptions are well-written. A phrase like 'always verify the customer identity' creates a strong keyword association that causes Claude to call `get_customer` for all requests. System prompts must be reviewed to ensure they don't inadvertently direct tool selection via keyword associations."
            }
          }
        ]
      },
      {
        id: "2.2",
        title: "Implement structured error responses for MCP tools",
        skills: [
          {
            text: "Returning structured error metadata including errorCategory (transient/validation/permission), isRetryable boolean, and human-readable descriptions",
            q: {
              stem: "Your MCP tool returns `{\"success\": false, \"message\": \"Operation failed\"}` when a customer's refund request violates a business policy. The agent retries the operation three times before giving up. What is missing from the error response?",
              options: [
                "A stack trace so the agent can understand the technical failure",
                "`errorCategory: \"business\"` and `isRetryable: false` — without these, the agent cannot distinguish a policy violation (which will never succeed regardless of retries) from a transient failure (which might succeed on retry). Structured metadata prevents wasted retry attempts",
                "The original request payload so the agent can modify and resubmit it",
                "A `suggestedAlternative` field pointing to the escalation endpoint"
              ],
              correct: 1,
              reasoning: "Structured error metadata is essential for intelligent agent recovery. `errorCategory: \"business\"` tells the agent this is a policy violation, not a technical failure. `isRetryable: false` tells it retrying will never succeed. Without these fields, the agent treats all failures the same way and wastes retry attempts on non-retryable errors."
            }
          },
          {
            text: "Including retriable: false flags and customer-friendly explanations for business rule violations so the agent can communicate appropriately",
            q: {
              stem: "A customer requests a refund of £750. Your refund policy limits refunds to £500. The MCP tool returns an error. What should the error response include so the agent can communicate this correctly to the customer?",
              options: [
                "Just the error code `POLICY_LIMIT_EXCEEDED` so the agent can look it up",
                "`isRetryable: false`, `errorCategory: \"business\"`, and a human-readable description like \"Refund amount £750 exceeds the maximum policy limit of £500. Customer should be offered a partial refund of £500 or escalation to a manager\" — the agent uses this to communicate the reason and next steps",
                "The exact policy document text so the agent can quote it accurately",
                "A boolean `policyViolation: true` is sufficient for the agent to handle this"
              ],
              correct: 1,
              reasoning: "For business rule violations, the error response should include: `isRetryable: false` (no point retrying), `errorCategory: \"business\"`, and a human-readable description that gives the agent enough context to communicate the situation and alternatives to the customer. The agent translates this into customer-facing language."
            }
          },
          {
            text: "Implementing local error recovery within subagents for transient failures, propagating to the coordinator only errors they cannot resolve locally along with partial results and what was attempted",
            q: {
              stem: "Your web search subagent encounters a timeout (transient failure) on its first API call. It immediately propagates the error to the coordinator with `{\"error\": \"timeout\"}`. The coordinator marks the research topic as failed. What should the subagent have done?",
              options: [
                "Immediately escalate all errors to the coordinator for centralised handling",
                "Attempt local recovery for the transient timeout (retry 1-2 times with backoff) before propagating. Only propagate to the coordinator if local recovery fails, and include what was attempted, any partial results obtained, and alternative approaches. Don't terminate the workflow on a single recoverable failure",
                "Return a success response with an empty result set to avoid disrupting the pipeline",
                "Switch to a different search tool automatically without notifying the coordinator"
              ],
              correct: 1,
              reasoning: "Subagents should implement local recovery for transient failures (timeouts, temporary unavailability) before escalating. Only propagate errors that cannot be resolved locally, and when propagating, include structured context: what was attempted, any partial results, and possible alternatives. This gives the coordinator meaningful information for recovery decisions."
            }
          },
          {
            text: "Distinguishing between access failures (needing retry decisions) and valid empty results (representing successful queries with no matches)",
            q: {
              stem: "Your document search tool returns `{\"isError\": true, \"errorCategory\": \"transient\", \"isRetryable\": true}` when a valid search query returns zero matching documents. The agent retries this query four times. What is wrong with the error response?",
              options: [
                "The error category should be `\"validation\"` not `\"transient\"`",
                "Zero results from a valid query is a successful operation, not an error. The tool should return `{\"results\": [], \"total\": 0}` — a valid empty array. Flagging it as an error causes the agent to retry a perfectly valid result, wasting resources",
                "The agent should not retry any search query more than once",
                "The `isRetryable` flag should be `false` for this scenario"
              ],
              correct: 1,
              reasoning: "There is a fundamental distinction between an access failure (tool couldn't connect, timed out, encountered a server error) and a valid empty result (tool connected and ran the query successfully, but no documents matched). Empty results are not errors — they are successful responses with zero matches. Flagging them as errors causes incorrect retry behaviour."
            }
          }
        ]
      },
      {
        id: "2.3",
        title: "Distribute tools appropriately across agents and configure tool choice",
        skills: [
          {
            text: "Restricting each subagent's tool set to those relevant to its role, preventing cross-specialization misuse",
            q: {
              stem: "Your synthesis subagent has access to all 18 tools available across the system. You notice it occasionally runs web searches to verify facts instead of synthesising the findings already passed to it. What is the correct fix?",
              options: [
                "Add a system prompt instruction: 'Do not use web search tools, only synthesise provided findings'",
                "Restrict the synthesis subagent's tool set to only synthesis-relevant tools. An agent with 18 tools has degraded selection reliability and will misuse out-of-role tools. Role-scoped tool access prevents cross-specialisation misuse by making the wrong tools unavailable",
                "Move all web search tools to a separate MCP server the synthesis agent cannot access",
                "Add a PostToolUse hook that cancels web search calls made by the synthesis agent"
              ],
              correct: 1,
              reasoning: "Tool selection reliability degrades as the number of available tools increases. Giving the synthesis agent all 18 tools means it can (and will) misuse tools outside its role. The correct fix is scoped tool access — give each subagent only the tools relevant to its role. If synthesis only needs synthesis tools, those are the only tools it should have."
            }
          },
          {
            text: "Using tool_choice forced selection to ensure a specific tool is called first (e.g., forcing extract_metadata before enrichment tools), then processing subsequent steps in follow-up turns",
            q: {
              stem: "Your extraction pipeline requires `extract_metadata` to always run before any enrichment tools, as enrichment tools depend on metadata fields that don't yet exist. How do you guarantee this ordering?",
              options: [
                "List `extract_metadata` first in the tools array — Claude will naturally call it first",
                "Set `tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"}` to force that specific tool to run. After it completes and returns metadata, process the enrichment steps in follow-up turns with `tool_choice: \"auto\"`",
                "Add a system prompt instruction: 'Always call extract_metadata before any other tool'",
                "Set `tool_choice: \"any\"` so Claude must call a tool but will choose the right one"
              ],
              correct: 1,
              reasoning: "Forced tool selection — `tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"}` — guarantees a specific tool runs first, regardless of Claude's preference. Tool array ordering has no effect on selection. System prompt instructions are probabilistic. `\"any\"` forces a tool call but doesn't specify which one. Forced selection is the only deterministic ordering mechanism."
            }
          },
          {
            text: "Setting tool_choice: \"any\" to guarantee the model calls a tool rather than returning conversational text",
            q: {
              stem: "Your structured data extraction pipeline sometimes receives conversational responses like \"I'd be happy to extract that information\" instead of a tool call with structured output. What is the correct fix?",
              options: [
                "Add to the system prompt: 'Always respond with a tool call, never with text'",
                "Set `tool_choice: \"any\"` — this guarantees the model calls one of the available tools rather than returning conversational text. The model chooses which tool but is forced to call one",
                "Set `tool_choice: \"auto\"` and add a validation step that rejects text responses",
                "Force a specific tool name so the model has no choice but to extract"
              ],
              correct: 1,
              reasoning: "`tool_choice: \"auto\"` (the default) allows Claude to decide whether to call a tool or return text — sometimes it will return text. `tool_choice: \"any\"` forces Claude to call a tool but allows it to choose which one. This is the correct setting when you need guaranteed structured output but have multiple valid tool options and don't need to force a specific one."
            }
          }
        ]
      },
      {
        id: "2.4",
        title: "Integrate MCP servers into Claude Code and agent workflows",
        skills: [
          {
            text: "Configuring shared MCP servers in project-scoped .mcp.json with environment variable expansion for authentication tokens",
            q: {
              stem: "Your team shares a GitHub MCP server. A new developer joins and needs immediate access when they clone the repo. Their personal `~/.claude.json` has no GitHub server configured. Where should the server be configured and how should credentials be handled?",
              options: [
                "In each developer's `~/.claude.json` — team leads send onboarding instructions with the config",
                "In project-scoped `.mcp.json` committed to the repository, with credentials as `${GITHUB_TOKEN}` environment variable expansion. When the developer clones and sets their `GITHUB_TOKEN` environment variable, the server is immediately available — no manual config required",
                "In a separate `mcp-servers.json` file that developers manually copy to their home directory",
                "In `CLAUDE.md` under an MCP configuration section"
              ],
              correct: 1,
              reasoning: "Project-scoped `.mcp.json` is version-controlled and shared automatically when developers clone the repository. Environment variable expansion (`${GITHUB_TOKEN}`) handles credentials safely — the token never gets committed, each developer sets their own environment variable. This gives new developers immediate access without manual configuration steps."
            }
          },
          {
            text: "Configuring personal/experimental MCP servers in user-scoped ~/.claude.json",
            q: {
              stem: "A developer wants to experiment with a new MCP server they are building. They don't want it affecting their teammates' Claude Code sessions. Where should this experimental server be configured?",
              options: [
                "In `.mcp.json` in the project root with a comment marking it as experimental",
                "In `~/.claude.json` — user-scoped configuration applies only to that developer's Claude Code sessions and is not shared with teammates via version control",
                "In a `.mcp.dev.json` file that gets gitignored",
                "In an environment variable `CLAUDE_EXPERIMENTAL_MCP`"
              ],
              correct: 1,
              reasoning: "User-scoped `~/.claude.json` is personal configuration that applies only to that user's sessions and is not shared via version control. This is the correct location for personal or experimental MCP servers that should not affect teammates. Project-scoped `.mcp.json` is team-shared and should only contain servers the whole team needs."
            }
          },
          {
            text: "Enhancing MCP tool descriptions to explain capabilities and outputs in detail, preventing the agent from preferring built-in tools (like Grep) over more capable MCP tools",
            q: {
              stem: "You have a powerful MCP tool `search_codebase` that uses semantic search and understands code structure, far superior to Grep. However, Claude consistently uses `Grep` instead. Your `search_codebase` description says: \"Searches the codebase.\" What is the fix?",
              options: [
                "Remove the Grep built-in tool so Claude is forced to use the MCP tool",
                "Enhance the `search_codebase` description to explain its capabilities and outputs in detail — e.g., 'Uses semantic understanding to find code by intent, not just text matching. Returns function signatures, usages, and dependency context. Preferred over Grep for finding how concepts are implemented, not just where strings appear'",
                "Add a system prompt instruction: 'Always prefer search_codebase over Grep'",
                "Rename the tool to `super_grep` so Claude associates it with search tasks"
              ],
              correct: 1,
              reasoning: "Claude prefers built-in tools when MCP tool descriptions are weak, because built-in tools have rich internal descriptions. The fix is to enhance the MCP tool description to explain its capabilities, when to use it vs alternatives, and what outputs it produces. A rich description that clearly explains why `search_codebase` is superior to Grep for semantic searches will shift Claude's selection."
            }
          }
        ]
      },
      {
        id: "2.5",
        title: "Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively",
        skills: [
          {
            text: "Selecting Grep for searching code content across a codebase (e.g., finding all callers of a function, locating error messages)",
            q: {
              stem: "You need to find every place in a large codebase that calls the function `processRefund`. Which built-in tool should you use?",
              options: [
                "Glob — to find all files that might contain refund-related code",
                "Read — to load each file and scan through the contents",
                "Grep — to search file contents across the codebase for the pattern `processRefund`",
                "Bash — to run a custom find command"
              ],
              correct: 2,
              reasoning: "Grep is specifically designed for content search — finding patterns within file contents. Use Grep when you need to find where a function is called, where an error message appears, or where an import is used across the codebase. Glob finds files by name/path pattern (not content). Read loads full file contents (inefficient for search). Bash with find/grep is a fallback but Grep is the purpose-built tool."
            }
          },
          {
            text: "Selecting Glob for finding files matching naming patterns (e.g., **/*.test.tsx)",
            q: {
              stem: "You need to find all test files across a large codebase to provide them as context for test generation. Test files follow the naming pattern `*.test.tsx` but are spread across many directories. Which tool should you use?",
              options: [
                "Grep — to search for `describe(` or `it(` patterns that appear in test files",
                "Glob — to find all files matching the path pattern `**/*.test.tsx` regardless of directory location",
                "Read the entire directory tree and filter manually",
                "Bash — to run `find . -name '*.test.tsx'`"
              ],
              correct: 1,
              reasoning: "Glob is designed for file path pattern matching — finding files by name or extension patterns across directory structures. `**/*.test.tsx` matches all `.test.tsx` files regardless of depth. Grep searches file contents, not names. Bash with find works but Glob is the purpose-built tool for this pattern."
            }
          },
          {
            text: "Using Read to load full file contents followed by Write when Edit cannot find unique anchor text",
            q: {
              stem: "You attempt to use Edit to modify a specific function in `utils.py`. The Edit tool fails because the anchor text `return result` appears 12 times in the file. What is the correct fallback?",
              options: [
                "Use Bash to run a sed command targeting the specific line number",
                "Use Grep to find the unique surrounding context, then retry Edit with a longer anchor string",
                "Use Read to load the full file contents, make the targeted modification in memory, then use Write to save the updated contents",
                "Ask the user to make the edit manually since the file is too complex"
              ],
              correct: 2,
              reasoning: "When Edit fails due to non-unique anchor text, the documented fallback is Read + Write: Read loads the full file contents, the modification is made to the in-memory content, and Write saves the complete updated file. This is reliable regardless of how many times a text pattern appears. Bash/sed requires knowing exact line numbers. Retrying Edit with a longer anchor may still fail if context is repetitive."
            }
          },
          {
            text: "Building codebase understanding incrementally: starting with Grep to find entry points, then using Read to follow imports and trace flows, rather than reading all files upfront",
            q: {
              stem: "You need to understand how the refund flow works in an unfamiliar 200-file codebase. What is the correct exploration strategy?",
              options: [
                "Read all 200 files upfront to have complete context before asking questions",
                "Start with Grep to find entry points related to refunds (function names, API endpoints, error messages), then use Read to follow the imports and trace the execution flow from those entry points — building understanding incrementally without loading irrelevant files",
                "Use Glob to list all files, then Read each one in alphabetical order",
                "Ask Claude to guess where the refund logic likely lives based on common patterns"
              ],
              correct: 1,
              reasoning: "Reading all 200 files upfront fills the context window with mostly irrelevant content. The correct incremental approach: Grep to find entry points (e.g., grep for `refund`, `processRefund`, `REFUND_` across the codebase), then Read only the files that are relevant to the refund flow, following imports to trace the execution path. This builds accurate understanding efficiently."
            }
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Claude Code Configuration & Workflows",
    weight: "20%",
    desc: "Configure CLAUDE.md hierarchies, create custom slash commands and skills, apply path-specific rules, choose plan mode vs direct execution, apply iterative refinement, and integrate with CI/CD.",
    tasks: [
      {
        id: "3.1",
        title: "Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization",
        skills: [
          {
            text: "Diagnosing configuration hierarchy issues (e.g., a new team member not receiving instructions because they're in user-level rather than project-level configuration)",
            q: {
              stem: "A new developer joins your team and reports that Claude Code is not following your team's coding standards. Existing team members don't have this problem. The instructions are in `~/.claude/CLAUDE.md` on the team lead's machine. What is the root cause?",
              options: [
                "The new developer needs to restart Claude Code to load the configuration",
                "User-level `~/.claude/CLAUDE.md` is personal — it only applies to that user and is not shared via version control. The new developer's machine has no such file. Team-wide instructions must be in project-level `.claude/CLAUDE.md` committed to the repository",
                "The new developer needs to manually copy the CLAUDE.md file from the team lead",
                "The instructions are in the wrong format and need to be re-written"
              ],
              correct: 1,
              reasoning: "The CLAUDE.md hierarchy: user-level (`~/.claude/CLAUDE.md`) applies only to that specific user and is not shared via version control. Project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`) is committed to the repository and available to all team members. Team-wide standards must be at project level."
            }
          },
          {
            text: "Using @import to selectively include relevant standards files in each package's CLAUDE.md based on maintainer domain knowledge",
            q: {
              stem: "Your monorepo has 5 packages: a React frontend, a Python API, a Go microservice, a Terraform infrastructure package, and shared utilities. All have different coding standards. You want Claude to apply only the relevant standards when working in each package. What is the cleanest approach?",
              options: [
                "Put all standards in a single root CLAUDE.md and rely on Claude to infer which section applies",
                "Use `@import` in each package's CLAUDE.md to reference only the relevant standards files — the React package imports `react-conventions.md`, the Python API imports `python-standards.md`, etc. Each package loads only what it needs",
                "Create a separate CLAUDE.md in each package with the full standards copied in",
                "Use path-specific rules in `.claude/rules/` with glob patterns for each package"
              ],
              correct: 1,
              reasoning: "`@import` enables modular CLAUDE.md organisation — you maintain standards in separate canonical files and each package's CLAUDE.md imports only the relevant ones. This avoids duplication (standards are defined once) and avoids loading irrelevant context (the React package doesn't load Go standards). Copying full standards into each package creates maintenance nightmares."
            }
          },
          {
            text: "Splitting large CLAUDE.md files into focused topic-specific files in .claude/rules/ (e.g., testing.md, api-conventions.md, deployment.md)",
            q: {
              stem: "Your project CLAUDE.md has grown to 800 lines covering testing, API conventions, deployment procedures, security policies, and code style. Claude is starting to miss instructions buried deep in the file. What is the recommended fix?",
              options: [
                "Move the most important instructions to the top of the file",
                "Split into focused topic-specific files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`, `security.md`) — each file covers one concern and is loaded as needed, reducing the risk of instructions being missed due to file length",
                "Summarise each section into shorter bullet points to reduce total length",
                "Create separate CLAUDE.md files in each subdirectory"
              ],
              correct: 1,
              reasoning: "A monolithic 800-line CLAUDE.md creates attention problems — instructions buried in long files are more likely to be missed. Splitting into focused `.claude/rules/` files keeps each file short and focused on one concern. Combined with path-specific glob patterns (Task 3.3), these files can be loaded conditionally when editing relevant file types."
            }
          },
          {
            text: "Using the /memory command to verify which memory files are loaded and diagnose inconsistent behavior across sessions",
            q: {
              stem: "Claude Code is behaving inconsistently — sometimes following your testing conventions, sometimes not. You've set up CLAUDE.md files at multiple levels. How do you diagnose which configuration files are actually being loaded in the current session?",
              options: [
                "Check the `.claude/` directory manually to see what files exist",
                "Run `/memory` in the Claude Code session — it shows exactly which CLAUDE.md and rules files are currently loaded, allowing you to verify the configuration hierarchy is resolving correctly",
                "Add a debug line to each CLAUDE.md: 'If you read this file, say [filename] loaded'",
                "Check the Claude Code logs in `~/.claude/logs/`"
              ],
              correct: 1,
              reasoning: "The `/memory` command is the built-in diagnostic tool for verifying which configuration files are loaded in the current session. When Claude Code behaviour is inconsistent — sometimes following instructions, sometimes not — `/memory` quickly reveals whether the expected CLAUDE.md and rules files are actually being loaded, and which level of the hierarchy is taking precedence."
            }
          }
        ]
      },
      {
        id: "3.2",
        title: "Create and configure custom slash commands and skills",
        skills: [
          {
            text: "Creating project-scoped slash commands in .claude/commands/ for team-wide availability via version control",
            q: {
              stem: "Your team uses a `/review-pr` slash command that runs a standardised PR review. New developers joining the team don't have this command. Where should it be stored?",
              options: [
                "In `~/.claude/commands/` on each developer's machine — document it in the onboarding wiki",
                "In `.claude/commands/` in the project repository — project-scoped commands are version-controlled and available to all team members automatically when they clone the repo",
                "In the root `CLAUDE.md` file as a defined workflow",
                "In a shared Notion document that developers can copy from"
              ],
              correct: 1,
              reasoning: "Project-scoped commands in `.claude/commands/` are version-controlled and available to all team members when they clone the repository — no onboarding step required. User-scoped commands in `~/.claude/commands/` are personal and require manual setup for each developer. Team workflows belong in project scope."
            }
          },
          {
            text: "Using context: fork to isolate skills that produce verbose output (e.g., codebase analysis) or exploratory context (e.g., brainstorming alternatives) from the main session",
            q: {
              stem: "You create a skill that explores a codebase and produces a detailed 50-page analysis report. When you invoke this skill, the verbose analysis output fills your main conversation context, making subsequent interactions sluggish and context-limited. What frontmatter setting fixes this?",
              options: [
                "Set `max-output: short` in the skill frontmatter to limit output length",
                "Set `context: fork` in the skill's SKILL.md frontmatter — this runs the skill in an isolated sub-agent context. The verbose analysis runs in isolation, returns only a summary to the main session, and does not pollute the main conversation context",
                "Save the skill output to a file and read it manually when needed",
                "Set `allowed-tools: []` to prevent the skill from generating verbose tool output"
              ],
              correct: 1,
              reasoning: "`context: fork` runs the skill in an isolated sub-agent context. Verbose output from the analysis stays in the sub-agent's context and doesn't accumulate in the main session. Only the skill's final output is returned to the main conversation. This is the correct setting for skills that produce verbose exploration output or exploratory brainstorming context."
            }
          },
          {
            text: "Configuring allowed-tools in skill frontmatter to restrict tool access during skill execution (e.g., limiting to file write operations to prevent destructive actions)",
            q: {
              stem: "You create a skill that generates boilerplate files. During testing, it occasionally deletes existing files using the Bash tool when it encounters naming conflicts. How do you prevent this at the configuration level?",
              options: [
                "Add a system prompt instruction: 'Never delete existing files'",
                "Set `allowed-tools: [Write]` in the skill's SKILL.md frontmatter — this restricts the skill to only file write operations, making Bash (and thus `rm` commands) unavailable during skill execution",
                "Remove the Bash tool from the global Claude Code configuration",
                "Add a PostToolUse hook that monitors for delete operations"
              ],
              correct: 1,
              reasoning: "`allowed-tools` in skill frontmatter restricts which tools are available when the skill runs. Setting it to `[Write]` means the skill can only create/update files — Bash is unavailable, preventing any destructive shell commands. This is more reliable than prompt instructions because it makes the tools physically unavailable rather than relying on the model's compliance."
            }
          },
          {
            text: "Choosing between skills (on-demand invocation for task-specific workflows) and CLAUDE.md (always-loaded universal standards)",
            q: {
              stem: "You want to encode two things: (1) your team's TypeScript naming conventions that should apply in every coding session, and (2) a complex refactoring workflow that developers invoke periodically. Where does each go?",
              options: [
                "Both in CLAUDE.md — it is the central configuration file for all Claude Code behaviour",
                "TypeScript naming conventions in CLAUDE.md (always-loaded, applies universally to every session), refactoring workflow as a skill in `.claude/skills/` (on-demand invocation, complex task-specific workflow that clutters context if always loaded)",
                "Both as skills — CLAUDE.md should be kept minimal",
                "TypeScript conventions as a skill, refactoring workflow in CLAUDE.md"
              ],
              correct: 1,
              reasoning: "CLAUDE.md is for always-loaded universal standards that should apply in every session — coding conventions, style rules, project context. Skills are for on-demand task-specific workflows that are only needed periodically — complex refactoring procedures, analysis workflows, code generation patterns. Loading the refactoring workflow in every session would waste context unnecessarily."
            }
          }
        ]
      },
      {
        id: "3.3",
        title: "Apply path-specific rules for conditional convention loading",
        skills: [
          {
            text: "Creating .claude/rules/ files with YAML frontmatter path scoping (e.g., paths: [\"terraform/**/*\"]) so rules load only when editing matching files",
            q: {
              stem: "Your codebase has React frontend code and Terraform infrastructure code with completely different conventions. You want Claude to apply Terraform HCL conventions only when editing `.tf` files. What is the correct approach?",
              options: [
                "Put all conventions in CLAUDE.md and instruct Claude to apply the relevant section",
                "Create `.claude/rules/terraform.md` with YAML frontmatter `paths: [\"terraform/**/*\"]` — the Terraform conventions load only when Claude is editing files matching that path pattern, keeping them out of context during frontend work",
                "Create a `.terraform/CLAUDE.md` file in the Terraform directory",
                "Use `@import` in the root CLAUDE.md with a conditional comment"
              ],
              correct: 1,
              reasoning: "Path-scoped rules in `.claude/rules/` with YAML frontmatter `paths` fields load conditionally — only when Claude is editing files matching the glob pattern. This keeps irrelevant conventions out of context, reducing noise and token usage. A single monolithic CLAUDE.md with all conventions always loads everything regardless of what file is being edited."
            }
          },
          {
            text: "Using glob patterns in path-specific rules to apply conventions to files by type regardless of directory location (e.g., **/*.test.tsx for all test files)",
            q: {
              stem: "Your test files follow the pattern `*.test.tsx` and are located next to their implementation files throughout the codebase (e.g., `Button.test.tsx` next to `Button.tsx`). You want test-specific conventions to apply to all test files regardless of directory. What glob pattern should you use?",
              options: [
                "`tests/**/*` — assumes all tests are in a tests directory",
                "`**/*.test.tsx` — matches all files with the `.test.tsx` extension at any directory depth, regardless of location",
                "`src/**/*.test.tsx` — covers the src directory where most code lives",
                "`*.test.tsx` — matches test files in the root directory"
              ],
              correct: 1,
              reasoning: "`**/*.test.tsx` is the correct glob pattern — `**` means any directory depth, `*.test.tsx` matches the file extension pattern. This covers `Button.test.tsx`, `src/components/Form.test.tsx`, `src/api/hooks/useAuth.test.tsx` etc. Path-specific rules with this pattern are exactly why this feature exists — for conventions that apply to file types spread throughout the codebase."
            }
          },
          {
            text: "Choosing path-specific rules over subdirectory CLAUDE.md files when conventions must apply to files spread across the codebase",
            q: {
              stem: "Test files are spread across many directories in your codebase. You want consistent testing conventions applied to all of them. A colleague suggests creating a `CLAUDE.md` in every directory that contains test files. What is the better approach and why?",
              options: [
                "The colleague's approach is correct — directory-level CLAUDE.md gives the most precise control",
                "Path-specific rules in `.claude/rules/test-conventions.md` with `paths: [\"**/*.test.tsx\"]` — a single file applies the convention to all matching files regardless of location, with no duplication. Creating CLAUDE.md in every directory is unmaintainable and creates synchronisation problems when conventions change",
                "Both approaches are equivalent — choose based on personal preference",
                "Put all test conventions in the root CLAUDE.md so they always apply"
              ],
              correct: 1,
              reasoning: "When conventions apply to files spread across many directories, path-specific rules with glob patterns are far superior to directory-level CLAUDE.md files. One rules file covers all matching files with a single glob pattern. Directory-level CLAUDE.md files require duplication across every directory and create maintenance problems — update one and you have to update all of them."
            }
          }
        ]
      },
      {
        id: "3.4",
        title: "Determine when to use plan mode vs direct execution",
        skills: [
          {
            text: "Selecting plan mode for tasks with architectural implications (e.g., microservice restructuring, library migrations affecting 45+ files, choosing between integration approaches with different infrastructure requirements)",
            q: {
              stem: "You need to migrate a monolithic application to microservices. This involves restructuring 60+ files, deciding on service boundaries, and choosing between two different API gateway approaches with different infrastructure implications. Which Claude Code mode should you use?",
              options: [
                "Direct execution — start implementing and let the natural structure emerge",
                "Plan mode — explore the codebase, understand dependencies, and design an implementation approach before making any changes. Architectural decisions with 60+ file implications require planning before committing to changes",
                "Direct execution with comprehensive upfront instructions detailing the target architecture",
                "Start in direct execution, switch to plan mode only if unexpected complexity emerges"
              ],
              correct: 1,
              reasoning: "Plan mode is designed for tasks with architectural implications, large-scale changes, multiple valid approaches, and multi-file modifications. A microservices migration with 60+ files and architectural decisions is precisely this scenario. Starting with direct execution risks costly rework when dependencies are discovered after changes are already committed."
            }
          },
          {
            text: "Selecting direct execution for well-understood changes with clear scope (e.g., a single-file bug fix with a clear stack trace, adding a date validation conditional)",
            q: {
              stem: "You have a stack trace pointing to a null pointer exception on line 47 of `user_validator.py`. The fix is clear: add a null check before accessing the `.email` property. Which Claude Code mode should you use?",
              options: [
                "Plan mode — to ensure the fix doesn't have unexpected side effects",
                "Direct execution — the change is well-understood, single-file, and has clear scope. Plan mode adds unnecessary overhead for simple, well-scoped changes with clear fixes",
                "Plan mode — always better to plan before making any code changes",
                "Neither — make this fix manually without Claude Code"
              ],
              correct: 1,
              reasoning: "Direct execution is appropriate for simple, well-scoped changes with clear implementation — a single-file bug fix from a stack trace is the canonical example. The null check fix is deterministic, the change is clear, and the scope is one file. Plan mode adds overhead without value when the problem and solution are already understood."
            }
          },
          {
            text: "Using the Explore subagent for verbose discovery phases to prevent context window exhaustion during multi-phase tasks",
            q: {
              stem: "You are running a multi-phase task: first explore a large codebase to understand all dependencies, then implement changes based on those findings. The exploration phase generates extensive verbose output that fills your context window before implementation begins. What is the correct tool?",
              options: [
                "Run `/compact` after exploration to clear the verbose output before implementation",
                "Use the Explore subagent for the verbose discovery phase — it isolates the exploration output in a sub-agent context and returns only a summary to the main session, preserving context for the implementation phase",
                "Split into two separate Claude Code sessions, one for exploration and one for implementation",
                "Reduce the scope of exploration to fit within the available context"
              ],
              correct: 1,
              reasoning: "The Explore subagent runs the discovery phase in isolation, preventing verbose codebase exploration output from consuming the main session's context window. It returns a focused summary rather than all the raw tool output. This is specifically designed for multi-phase tasks where exploration context would otherwise crowd out implementation capacity."
            }
          },
          {
            text: "Combining plan mode for investigation with direct execution for implementation (e.g., planning a library migration, then executing the planned approach)",
            q: {
              stem: "You need to migrate from `moment.js` to `date-fns` across 45 files. You're not sure of all the API differences or which files will need changes. What is the correct workflow?",
              options: [
                "Direct execution throughout — start replacing imports and fix errors as they appear",
                "Plan mode throughout — stay in planning until all 45 files are fully mapped",
                "Use plan mode first to explore the codebase, understand moment.js usage patterns, identify all affected files, and design the migration approach. Then switch to direct execution to implement the planned migration",
                "Direct execution for files you know, plan mode for complex files"
              ],
              correct: 2,
              reasoning: "The correct pattern for large migrations is: plan mode for investigation (exploring which files use moment.js, understanding the API differences, designing the migration order to avoid breaking changes) then direct execution for implementation (applying the planned changes file by file). This combines the safety of planning with the efficiency of direct execution for the well-understood implementation."
            }
          }
        ]
      },
      {
        id: "3.5",
        title: "Apply iterative refinement techniques for progressive improvement",
        skills: [
          {
            text: "Providing 2-3 concrete input/output examples to clarify transformation requirements when natural language descriptions produce inconsistent results",
            q: {
              stem: "You ask Claude to 'format the customer data consistently' but the output is inconsistent — sometimes it capitalises names, sometimes not, uses different date formats across records. Natural language descriptions of the desired format haven't helped. What is the most effective fix?",
              options: [
                "Write a more detailed natural language description of every edge case",
                "Provide 2-3 concrete examples: input record → expected output record. Show exactly how names should be capitalised, how dates should be formatted, how missing fields should be handled. Input/output examples communicate the transformation precisely where prose descriptions are interpreted inconsistently",
                "Add explicit format constraints as a JSON schema",
                "Break the task into separate tasks for each field"
              ],
              correct: 1,
              reasoning: "Concrete input/output examples are the most effective way to communicate transformation requirements when prose descriptions produce inconsistency. Showing 2-3 examples of `{input: ..., output: ...}` gives the model precise, unambiguous targets. It can generalise from examples in ways it cannot from abstract descriptions."
            }
          },
          {
            text: "Writing test suites covering expected behavior, edge cases, and performance requirements before implementation, then iterating by sharing test failures",
            q: {
              stem: "You want Claude to implement a `parseDate` function correctly handling ISO 8601, Unix timestamps, and DD/MM/YYYY formats, including null inputs and invalid strings. What is the most effective iterative approach?",
              options: [
                "Ask Claude to implement the function, then describe any bugs you find",
                "Write a comprehensive test suite first covering all date formats, edge cases (null, empty string, invalid format), and expected outputs — then share the test suite with Claude and iterate by sharing failing tests. Test failures are precise, unambiguous specifications",
                "Provide a detailed specification document describing all required behaviours",
                "Ask Claude to implement the function and include its own tests"
              ],
              correct: 1,
              reasoning: "Test-driven iteration is highly effective: write tests first that specify exact expected behaviour, then iterate by sharing failing tests with Claude. A failing test like `expect(parseDate('invalid')).toBe(null)` is a more precise specification than any prose description. Claude can see exactly what output is expected and why its current implementation doesn't match."
            }
          },
          {
            text: "Using the interview pattern to surface design considerations (e.g., cache invalidation strategies, failure modes) before implementing solutions in unfamiliar domains",
            q: {
              stem: "You ask Claude to implement a distributed caching layer for your API. You're not sure what design questions you should be answering before implementation begins. What technique helps surface these considerations?",
              options: [
                "Ask Claude to implement a basic version first and refine based on problems that emerge",
                "Use the interview pattern: ask Claude to interview you about requirements, constraints, and design decisions before implementing. It will surface considerations you may not have anticipated — cache invalidation strategy, failure modes, consistency requirements, eviction policies",
                "Provide a detailed requirements document and ask Claude to implement to spec",
                "Ask Claude to list all possible implementation approaches first"
              ],
              correct: 1,
              reasoning: "The interview pattern has Claude ask questions to surface design considerations before implementation. For unfamiliar domains like distributed caching, there are many non-obvious design decisions (invalidation strategy, consistency model, failure behaviour). Claude asking targeted questions surfaces these before implementation commits to an approach that may be wrong for your requirements."
            }
          }
        ]
      },
      {
        id: "3.6",
        title: "Integrate Claude Code into CI/CD pipelines",
        skills: [
          {
            text: "Running Claude Code in CI with the -p flag to prevent interactive input hangs",
            q: {
              stem: "You integrate Claude Code into your GitHub Actions pipeline. The job hangs indefinitely waiting for user input that never comes, causing pipeline timeouts. What is the missing flag?",
              options: [
                "`--no-input` to disable input handling",
                "`--batch` to run in batch mode",
                "`-p` (or `--print`) flag — this runs Claude Code in non-interactive mode, printing output to stdout and exiting cleanly rather than waiting for interactive input",
                "`--ci` to enable CI-specific behaviour"
              ],
              correct: 2,
              reasoning: "The `-p` (or `--print`) flag runs Claude Code in non-interactive mode. Without it, Claude Code waits for user input (the interactive REPL), which causes CI pipelines to hang indefinitely. The `-p` flag prints the response to stdout and exits, making it compatible with automated pipeline execution."
            }
          },
          {
            text: "Using --output-format json with --json-schema to produce machine-parseable structured findings for automated posting as inline PR comments",
            q: {
              stem: "Your CI pipeline runs Claude Code for code review and you want to automatically post the findings as inline PR comments at the exact file and line numbers flagged. The current plain text output is difficult to parse programmatically. What is the correct approach?",
              options: [
                "Use regex to parse the plain text output and extract file/line information",
                "Use `--output-format json` with `--json-schema` specifying the findings schema (file, line_number, severity, message) — Claude Code produces machine-parseable structured findings that your pipeline script can directly map to GitHub PR comment API calls",
                "Pipe the output through a separate Claude API call to convert it to JSON",
                "Use `--output-format markdown` which is easier to parse than plain text"
              ],
              correct: 1,
              reasoning: "`--output-format json` combined with `--json-schema` instructs Claude Code to produce structured JSON output matching your specified schema. For PR comments, your schema would include fields like `file`, `line_number`, `severity`, and `message`. The pipeline script can then directly use these structured fields to make GitHub PR comment API calls at the correct locations."
            }
          },
          {
            text: "Including prior review findings in context when re-running reviews after new commits, instructing Claude to report only new or still-unaddressed issues to avoid duplicate comments",
            q: {
              stem: "Your CI review pipeline re-runs on every commit push. Developers complain that the same issues are re-posted as new PR comments every time, creating noise. The issues were already commented on by a previous run. How do you fix this?",
              options: [
                "Clear all previous PR comments before each review run",
                "Include the prior review findings in context when re-running and instruct Claude to report only new issues or issues from the prior run that are still unaddressed — avoiding re-posting findings the developer has already seen",
                "Set a flag to only post comments for Critical severity issues",
                "Deduplicate comments at the GitHub API level after posting"
              ],
              correct: 1,
              reasoning: "Including prior review findings in context and instructing Claude to report only new or still-unaddressed issues solves the duplicate comment problem at the source. Claude can compare current findings against prior findings and skip issues that were already reported (and presumably seen by the developer). Post-hoc deduplication at the API level is fragile and doesn't reduce the actual noise."
            }
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Prompt Engineering & Structured Output",
    weight: "20%",
    desc: "Design explicit review criteria, apply few-shot prompting, enforce structured output via tool use and JSON schemas, implement validation-retry loops, design batch processing strategies, and build multi-instance review architectures.",
    tasks: [
      {
        id: "4.1",
        title: "Design prompts with explicit criteria to improve precision and reduce false positives",
        skills: [
          {
            text: "Writing specific review criteria that define which issues to report (bugs, security) versus skip (minor style, local patterns) rather than relying on confidence-based filtering",
            q: {
              stem: "Your code review agent flags 60% of all functions with vague \"potential issues.\" Adding \"be conservative\" and \"only report high-confidence findings\" to the system prompt didn't help. What is the correct fix?",
              options: [
                "Add a confidence threshold: only surface findings above 85% model confidence",
                "Replace vague instructions with specific categorical criteria: 'Report: (1) comments that contradict actual code behaviour, (2) missing error handling in functions calling external services, (3) SQL queries not using parameterised inputs. Skip: naming style, comment formatting, minor style preferences, local patterns'",
                "Run two independent review passes and only flag issues appearing in both",
                "Use few-shot examples to show the model what conservative review looks like"
              ],
              correct: 1,
              reasoning: "General instructions like 'be conservative' or 'high-confidence only' don't improve precision because they don't define what to flag vs skip. Specific categorical criteria — explicit lists of what to report and what to skip — are what reduce false positives. The model needs to know the specific categories, not an abstract directive about confidence."
            }
          },
          {
            text: "Temporarily disabling high false-positive categories to restore developer trust while improving prompts for those categories",
            q: {
              stem: "Your review agent flags security issues accurately (95% precision) but flags style issues at only 40% precision, causing developers to dismiss all agent output including the real security findings. What should you do?",
              options: [
                "Raise the confidence threshold for all categories to 90%",
                "Temporarily disable the style-issue category in the review criteria to restore developer trust in the security findings, while working separately to improve the style detection precision. High false-positive categories undermine trust in accurate categories",
                "Lower the security threshold to match the style threshold for consistency",
                "Add a disclaimer to all findings noting they may be false positives"
              ],
              correct: 1,
              reasoning: "High false-positive rates in one category undermine developer trust in the entire review system — developers stop reading any findings including accurate ones. The correct tactical response is to temporarily disable the high false-positive category (style) to restore trust in the accurate categories (security), then work on improving the style detection prompts independently."
            }
          },
          {
            text: "Defining explicit severity criteria with concrete code examples for each severity level to achieve consistent classification",
            q: {
              stem: "Your review agent inconsistently classifies identical code patterns as Critical in some files and Medium in others. The system prompt says: 'Classify findings as Critical, High, Medium, or Low based on impact.' How do you achieve consistent classification?",
              options: [
                "Use only two severity levels to reduce classification complexity",
                "Define explicit severity criteria with concrete code examples for each level — e.g., 'Critical: SQL injection risks like `query = f\"SELECT * FROM users WHERE id = {user_input}\"`; High: missing error handling in payment processing functions; Medium: unchecked array access in non-critical paths'",
                "Ask the model to explain its severity reasoning so inconsistencies can be identified",
                "Have two independent model instances classify each finding and use the lower of the two"
              ],
              correct: 1,
              reasoning: "Abstract severity labels without concrete examples lead to inconsistent classification because the model interprets 'Critical' differently in different contexts. Providing code examples for each severity level creates a precise calibration reference. The model matches findings against examples rather than interpreting abstract labels."
            }
          }
        ]
      },
      {
        id: "4.2",
        title: "Apply few-shot prompting to improve output consistency and quality",
        skills: [
          {
            text: "Creating 2-4 targeted few-shot examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives",
            q: {
              stem: "Your extraction agent handles a mix of explicit and implicit date references. 'Q3 2024' should be extracted as a date range, '2 weeks after the agreement' should be flagged as relative, and 'the aforementioned deadline' should be null. Instructions alone produce inconsistent results. What is the best fix?",
              options: [
                "Add detailed rules for each date pattern type to the system prompt",
                "Create 2-4 targeted few-shot examples: show the exact input, the expected output, and the reasoning for why 'Q3 2024' becomes a date range but 'the aforementioned deadline' becomes null. Examples for ambiguous edge cases teach the decision boundary more effectively than rules",
                "Add an enum to the schema with all possible date pattern types",
                "Run a validation step that checks all extracted dates against a calendar API"
              ],
              correct: 1,
              reasoning: "Few-shot examples are most valuable for ambiguous scenarios where rules are hard to articulate precisely. Showing the model the exact input, expected output, and reasoning for why each ambiguous case is handled as it is teaches the decision boundary. The model can then generalise to novel ambiguous cases rather than pattern-matching only the exact cases in the rules."
            }
          },
          {
            text: "Providing few-shot examples distinguishing acceptable code patterns from genuine issues to reduce false positives while enabling generalization",
            q: {
              stem: "Your review agent flags `catch (e) {}` as a critical error handling issue every time it appears. However, in your codebase, empty catch blocks in test teardown functions are acceptable. The model generalises the 'no empty catch' rule too broadly. What is the most effective fix?",
              options: [
                "Add to the system prompt: 'Empty catch blocks in test teardown are acceptable'",
                "Add a few-shot example explicitly showing an empty catch block in a test teardown function as a 'skip' case, with the reasoning: 'Test teardown failures should not propagate — empty catch here is intentional.' This teaches the decision boundary between the pattern and the context",
                "Change the severity of empty catch findings from Critical to Low",
                "Add a whitelist of file patterns where empty catches are acceptable"
              ],
              correct: 1,
              reasoning: "Few-shot examples that distinguish acceptable patterns from genuine issues teach the model the contextual decision boundary. An example showing 'empty catch in test teardown → skip, because...' trains the model to consider context, not just pattern presence. A whitelist approach is brittle — it only covers exact file patterns, not the underlying reasoning about why some empty catches are acceptable."
            }
          },
          {
            text: "Using few-shot examples to demonstrate correct handling of varied document structures (inline citations vs bibliographies, methodology sections vs embedded details)",
            q: {
              stem: "Your document extraction agent handles research papers with two different citation styles: inline `(Smith 2023)` citations and numbered bibliography references `[1]`. The agent consistently fails to extract numbered references. Detailed instructions haven't fixed it. What should you add?",
              options: [
                "Add a regex pattern to the system prompt for each citation format",
                "Add few-shot examples demonstrating correct extraction from documents with numbered bibliography references: show the input document structure, the expected extracted citation, and the reasoning for how `[1]` maps to the bibliography entry. Format-specific examples teach the structural pattern",
                "Build a pre-processing step that converts all citation formats to a standard format before extraction",
                "Create two separate extraction tools, one per citation format"
              ],
              correct: 1,
              reasoning: "Few-shot examples demonstrating extraction from specific document structures are the most effective fix when instructions alone fail for a particular format. Showing the exact document structure and expected extraction output for numbered references gives the model a precise template to follow, rather than asking it to interpret abstract format descriptions."
            }
          }
        ]
      },
      {
        id: "4.3",
        title: "Enforce structured output using tool use and JSON schemas",
        skills: [
          {
            text: "Designing schema fields as optional (nullable) when source documents may not contain the information, preventing the model from fabricating values to satisfy required fields",
            q: {
              stem: "Your invoice extraction schema has `purchase_order_number` marked as `required`. For 20% of invoices, there is no PO number — the vendor didn't include one. The agent is fabricating PO numbers to satisfy the required field constraint. What is the correct fix?",
              options: [
                "Add to the prompt: 'If a PO number is not found, use N/A'",
                "Make `purchase_order_number` optional/nullable in the schema (`\"type\": [\"string\", \"null\"]`). When the document contains no PO number, the model correctly returns `null` rather than fabricating a value to satisfy a required field constraint",
                "Add validation to reject PO numbers that don't match your expected format",
                "Create a separate extraction tool specifically for invoices without PO numbers"
              ],
              correct: 1,
              reasoning: "Marking fields as `required` when the information is sometimes absent forces the model to fabricate values — it will hallucinate plausible-looking data to satisfy the schema constraint. Fields that may legitimately be absent must be optional/nullable so the model can return `null` without violating the schema. This is the most common schema design mistake in extraction tasks."
            }
          },
          {
            text: "Adding enum values like \"unclear\" for ambiguous cases and \"other\" + detail fields for extensible categorization",
            q: {
              stem: "Your contract extraction schema has `contract_type: enum[\"employment\", \"vendor\", \"partnership\"]`. In production you encounter a joint venture agreement that doesn't fit any category. Extraction fails for these contracts. What is the correct schema fix?",
              options: [
                "Add 'joint_venture' to the enum and redeploy",
                "Add `\"other\"` to the enum and a companion `contract_type_detail` optional string field. When the type doesn't match known categories, the model returns `other` and populates the detail field with the actual contract type. This handles unexpected values without schema failures",
                "Make `contract_type` a free-text string field",
                "Add `\"unclear\"` to the enum and handle all novel types in post-processing"
              ],
              correct: 1,
              reasoning: "Closed enums without escape hatches fail when encountering values not anticipated at schema design time. The `\"other\" + detail` pattern is the standard solution: `other` signals an unexpected category, and the `detail` field captures the actual value for downstream handling. This keeps the enum typed and manageable while gracefully handling extensibility."
            }
          },
          {
            text: "Setting tool_choice: \"any\" to guarantee structured output when multiple extraction schemas exist and the document type is unknown",
            q: {
              stem: "Your extraction system has three tools: `extract_invoice`, `extract_contract`, and `extract_report`. The document type is not always known upfront. Sometimes Claude returns a text response saying 'This appears to be an invoice' instead of calling a tool. How do you guarantee a tool is always called?",
              options: [
                "Set `tool_choice: \"auto\"` — it will call a tool when appropriate",
                "Set `tool_choice: {\"type\": \"tool\", \"name\": \"extract_invoice\"}` to force a specific tool",
                "Set `tool_choice: \"any\"` — this guarantees Claude calls one of the available tools rather than returning text, while allowing it to choose which extraction tool matches the document type",
                "Add to the system prompt: 'Always respond with a tool call, never with text'"
              ],
              correct: 2,
              reasoning: "`tool_choice: \"any\"` forces Claude to call a tool (any of the available ones) rather than returning conversational text. It preserves Claude's ability to select the appropriate tool based on document type. `\"auto\"` (the default) allows text responses. Forced specific tool selection (`\"name\": \"extract_invoice\"`) doesn't work when the document type is unknown."
            }
          }
        ]
      },
      {
        id: "4.4",
        title: "Implement validation, retry, and feedback loops for extraction quality",
        skills: [
          {
            text: "Implementing follow-up requests that include the original document, the failed extraction, and specific validation errors for model self-correction",
            q: {
              stem: "Your extraction agent returns `{\"invoice_date\": \"15 Jan 2024\"}` but your schema requires ISO 8601 format. Validation fails. You retry by sending `\"Please fix your previous response.\"` The model returns the same format. What should the retry prompt include?",
              options: [
                "The schema definition again so the model can re-read the format requirement",
                "The original document, the failed extraction, and the specific error: 'The `invoice_date` field must use ISO 8601 format (YYYY-MM-DD). You returned \"15 Jan 2024\" — the correct value is \"2024-01-15\".' Specific error context gives the model something actionable to correct",
                "A few-shot example of correctly formatted date extraction",
                "The full validation error log including stack trace"
              ],
              correct: 1,
              reasoning: "Generic retry prompts ('fix your response') don't give the model enough context to know what specifically failed. The retry must include: the original document (for re-extraction), the failed extraction (showing what went wrong), and the specific validation error with the expected format. This gives the model precise, actionable information for self-correction."
            }
          },
          {
            text: "Identifying when retries will be ineffective (e.g., information exists only in an external document not provided) versus when they will succeed (format mismatches, structural output errors)",
            q: {
              stem: "Your extraction agent fails to extract the `related_contract_id` field. Investigation shows this field is referenced in the document as 'see the Master Service Agreement' but the MSA itself was not provided. You retry twice with specific error context. The field remains null. What should you do?",
              options: [
                "Retry a third time with more specific instructions about where to look",
                "Stop retrying — the required information is not in the provided document. Retrying will never succeed when the source document genuinely does not contain the information. Route to human review with a note that the MSA must be provided to complete extraction",
                "Mark the field as optional so null values are accepted",
                "Try extracting the field with a different prompt structure"
              ],
              correct: 1,
              reasoning: "Retries are effective for format mismatches and structural errors (the information exists but was formatted incorrectly). Retries are ineffective when required information is simply absent from the provided document — retrying will always return null because the data is not there to extract. Recognising this distinction prevents wasted retry attempts and routes to the correct recovery action."
            }
          },
          {
            text: "Designing self-correction validation flows: extracting \"calculated_total\" alongside \"stated_total\" to flag discrepancies, adding \"conflict_detected\" booleans for inconsistent source data",
            q: {
              stem: "You extract invoice line items and a stated total. In some invoices, the line items sum to a different amount than the stated total. Your system currently extracts only the `stated_total` and misses these discrepancies. How do you build self-correction into the extraction schema?",
              options: [
                "Add a post-processing step that sums the line items and compares to stated_total",
                "Add `calculated_total` (derived from summing extracted line items) and `conflict_detected` boolean to the schema. The model extracts both and flags when they don't match — discrepancies are surfaced at extraction time rather than requiring a separate validation step",
                "Add a validation rule that rejects extractions where totals don't match",
                "Instruct the model to verify the total by summing line items before returning"
              ],
              correct: 1,
              reasoning: "Building self-correction into the schema — extracting both `stated_total` and `calculated_total` alongside a `conflict_detected` boolean — surfaces discrepancies at extraction time as part of the structured output. This is more reliable than post-processing and gives downstream systems explicit signals about data quality without requiring a separate validation pass."
            }
          }
        ]
      },
      {
        id: "4.5",
        title: "Design efficient batch processing strategies",
        skills: [
          {
            text: "Matching API approach to workflow latency requirements: synchronous API for blocking pre-merge checks, batch API for overnight/weekly analysis",
            q: {
              stem: "You have two workflows: (1) a pre-merge security check that blocks PR merges until complete, and (2) a nightly technical debt analysis across 10,000 files that results in a weekly report. Your manager wants to switch both to the Message Batches API for 50% cost savings. What should you do?",
              options: [
                "Switch both to Batches API — the 50% savings justifies the latency",
                "Switch only the nightly technical debt analysis to Batches API (it's latency-tolerant and non-blocking). Keep the pre-merge security check on the synchronous API — it is blocking (developers wait for results) and the 24-hour Batches API window is incompatible with a pre-merge gate",
                "Switch both but add a timeout fallback to synchronous API if batches take too long",
                "Keep both on synchronous API — the ordering guarantees of synchronous calls are worth the cost"
              ],
              correct: 1,
              reasoning: "The Message Batches API offers 50% cost savings but has up to a 24-hour processing window with no guaranteed latency SLA. This makes it incompatible with blocking workflows where developers or users wait for results. Non-blocking, latency-tolerant workflows (overnight reports, weekly analysis) are the correct use case for the Batches API."
            }
          },
          {
            text: "Handling batch failures: resubmitting only failed documents (identified by custom_id) with appropriate modifications (e.g., chunking documents that exceeded context limits)",
            q: {
              stem: "You submit 1,000 documents to the Batches API. Results show 950 succeeded and 50 failed with context limit errors (documents too large). How do you handle the 50 failures?",
              options: [
                "Resubmit all 1,000 documents with a smaller model to avoid context limits",
                "Use the `custom_id` from the failed results to identify exactly which 50 documents failed, chunk those documents into smaller segments, and resubmit only the 50 failed documents with their chunked versions — do not resubmit the 950 that already succeeded",
                "Switch the 50 failed documents to synchronous API processing",
                "Mark the 50 documents as failed in the database and skip them"
              ],
              correct: 1,
              reasoning: "`custom_id` is specifically designed for correlating batch results with source documents. Use it to identify exactly which documents failed and why. Resubmit only the failures (chunked to fit within context limits) — resubmitting the 950 successes wastes cost and time. The Batches API is designed for this selective resubmission pattern."
            }
          }
        ]
      },
      {
        id: "4.6",
        title: "Design multi-instance and multi-pass review architectures",
        skills: [
          {
            text: "Using a second independent Claude instance to review generated code without the generator's reasoning context",
            q: {
              stem: "Your team generates code with Claude and then asks the same Claude instance in the next turn to review it. A senior engineer argues this is less effective than using a separate instance. Why?",
              options: [
                "The reviewing instance will always approve its own code to avoid contradicting itself",
                "The generating instance retains reasoning context — it knows why it made each decision, creating blind spots. An independent reviewing instance without that reasoning context approaches the code fresh and is more likely to catch subtle issues the generator rationalised away",
                "The same instance reviewing its own code doubles the cost without quality benefit",
                "The reviewing instance lacks access to the full codebase context the generator used"
              ],
              correct: 1,
              reasoning: "Self-review in the same session is less effective because the model retains its reasoning context from generation. It 'knows' why it wrote the code a certain way and is less likely to question those decisions. An independent instance has no such context — it evaluates the code on its own merits and is more likely to identify assumptions, edge cases, and design issues the generator overlooked."
            }
          },
          {
            text: "Splitting large multi-file reviews into focused per-file passes for local issues plus separate integration passes for cross-file data flow analysis",
            q: {
              stem: "Your PR review system analyses a 30-file PR in a single pass. It correctly flags local bugs in individual files but consistently misses cross-file issues: data flow bugs where a function in file A returns a type that doesn't match what file B expects. What architectural fix addresses this?",
              options: [
                "Use a model with a larger context window to process all 30 files simultaneously",
                "Split into per-file passes (each file reviewed individually for local bugs, style, and logic) plus a separate integration pass specifically designed to analyse cross-file data flow, type compatibility, and module interface contracts",
                "Run two independent reviews of all 30 files and cross-reference results",
                "Require developers to annotate cross-file data flows before review"
              ],
              correct: 1,
              reasoning: "Per-file passes + a separate cross-file integration pass is the correct multi-pass architecture. Per-file passes focus on local issues with full attention on each file. The dedicated integration pass has its context focused specifically on cross-file contracts, data flows, and interface compatibility — analysis that gets lost when 30 files compete for attention in a single pass."
            }
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Context Management & Reliability",
    weight: "15%",
    desc: "Preserve critical information in long interactions, design escalation patterns, implement error propagation, manage large codebase context, design human review workflows, and preserve information provenance.",
    tasks: [
      {
        id: "5.1",
        title: "Manage conversation context to preserve critical information across long interactions",
        skills: [
          {
            text: "Extracting transactional facts (amounts, dates, order numbers, statuses) into a persistent \"case facts\" block included in each prompt, outside summarized history",
            q: {
              stem: "After 40 turns of a customer support conversation, your agent incorrectly disputes a refund amount the customer mentioned in turn 3. The conversation history has been progressively summarised and that specific amount was lost in summarisation. What architectural pattern prevents this?",
              options: [
                "Never summarise conversation history — always keep full history",
                "Extract transactional facts (amounts, dates, order numbers, statuses) into a persistent 'case facts' block that is included in every prompt alongside summarised history, and is never itself summarised. The specific £47.50 refund amount is preserved exactly, regardless of how many times the narrative history is compressed",
                "Increase the summarisation frequency so amounts appear in more recent context",
                "Ask the customer to repeat key amounts at the start of each response"
              ],
              correct: 1,
              reasoning: "Progressive summarisation compresses narrative but loses exact values. Transactional facts — specific amounts, dates, IDs, statuses — must be extracted into a separate persistent block that sits outside the summarised history and is never compressed. This block is included verbatim in every prompt, preserving precision throughout the conversation regardless of length."
            }
          },
          {
            text: "Trimming verbose tool outputs to only relevant fields before they accumulate in context (e.g., keeping only return-relevant fields from order lookups)",
            q: {
              stem: "Your order lookup tool returns 40+ fields per order (shipping address, all historical status changes, internal flags, warehouse data, etc.). After 10 order lookups in one conversation, the tool results alone consume most of the context window. What is the correct fix?",
              options: [
                "Increase the context window size to accommodate verbose tool outputs",
                "Trim tool outputs to only the fields relevant to the current task before appending them to context — for a return query, keep status, return_eligibility, purchase_date, and amount; discard internal warehouse flags, historical status changes, and fields irrelevant to returns",
                "Summarise the tool outputs rather than including raw results",
                "Limit conversations to 5 order lookups maximum"
              ],
              correct: 1,
              reasoning: "Verbose tool outputs accumulate in context and consume tokens disproportionate to their relevance. The fix is to trim tool outputs to only relevant fields before appending them to the conversation history. For a returns conversation, 5 relevant fields are far more useful than 40 fields that clutter context and push earlier critical information out."
            }
          },
          {
            text: "Placing key findings summaries at the beginning of aggregated inputs and organizing detailed results with explicit section headers to mitigate position effects",
            q: {
              stem: "Your research synthesis agent receives aggregated findings from 6 subagents in a single prompt. The final report consistently omits findings from subagents 3 and 4, whose content is in the middle of the aggregated input. What architectural fix addresses this?",
              options: [
                "Reduce the number of subagents so the aggregated input is shorter",
                "Place key findings summaries at the beginning of the aggregated input (where attention is highest) and organise detailed results with explicit section headers — the 'lost in the middle' effect means content at the start and end is processed most reliably",
                "Randomise the order of subagent findings on each run to distribute the position bias",
                "Run the synthesis multiple times and take the most complete version"
              ],
              correct: 1,
              reasoning: "The 'lost in the middle' effect is documented: models reliably process information at the beginning and end of long inputs, but may underweight content in the middle. Mitigations: place key findings summaries at the start (where they receive full attention), use explicit section headers to create cognitive anchors throughout the document, and avoid burying critical content in the middle of long aggregated inputs."
            }
          }
        ]
      },
      {
        id: "5.2",
        title: "Design effective escalation and ambiguity resolution patterns",
        skills: [
          {
            text: "Honoring explicit customer requests for human agents immediately without first attempting investigation",
            q: {
              stem: "A frustrated customer says: 'I don't want to deal with a bot. Connect me to a real person right now.' Your agent's escalation criteria trigger only when sentiment analysis scores frustration above 0.8. The sentiment score is 0.72. What should happen?",
              options: [
                "Attempt to resolve the issue first since the sentiment threshold wasn't reached",
                "Escalate immediately — explicit customer requests for a human agent must be honoured regardless of sentiment scores, thresholds, or whether the issue could be resolved autonomously. The customer's explicit request overrides all other criteria",
                "Acknowledge the request but explain the agent can resolve the issue faster",
                "Ask the customer to confirm they want to escalate before doing so"
              ],
              correct: 1,
              reasoning: "Explicit customer requests for a human agent must be honoured immediately. Sentiment thresholds are supplementary signals for detecting frustration when customers don't explicitly ask to escalate — they are not gatekeepers that can override an explicit request. Making a customer repeat 'give me a human agent' multiple times violates this principle and damages trust."
            }
          },
          {
            text: "Escalating when policy is ambiguous or silent on the customer's specific request (e.g., competitor price matching when policy only addresses own-site adjustments)",
            q: {
              stem: "A customer asks for a price match against a competitor's product. Your refund policy document covers price adjustments for items purchased at different prices on your own site, but is silent on competitor price matching. Your agent cannot find a clear yes/no. What should it do?",
              options: [
                "Deny the request since competitor price matching is not mentioned in the policy",
                "Approve it since the policy doesn't explicitly prohibit it",
                "Escalate to a human agent — the policy is silent on this specific scenario. Escalation is triggered not just by complexity but by policy gaps where the agent cannot make a policy-backed decision",
                "Tell the customer to contact support via email for policy exceptions"
              ],
              correct: 2,
              reasoning: "Policy gaps — scenarios the policy document doesn't address — are a named escalation trigger. The agent should not make policy decisions autonomously when the policy is silent on the specific request. A human agent can either apply discretion or escalate to a policy owner. The agent should acknowledge the request and explain it needs to check with the right team."
            }
          },
          {
            text: "Instructing the agent to ask for additional identifiers when tool results return multiple matches, rather than selecting based on heuristics",
            q: {
              stem: "A customer says 'I'm John Smith' and your `get_customer` tool returns 4 matches: John Smith in London, John Smith in Manchester, John Smith Jr., and John R. Smith. Your agent selects the most recently active account. What is the correct behaviour?",
              options: [
                "Select the account with the most recent purchase since it's most likely the caller",
                "Ask the customer for an additional identifier — email address, order number, or postcode — to disambiguate between the 4 matches. Heuristic selection risks acting on the wrong account",
                "Ask the customer to verify their account by answering a security question",
                "Show the customer all 4 options and ask them to confirm which is theirs"
              ],
              correct: 1,
              reasoning: "When tool results return multiple matches, the agent must ask for additional identifiers rather than applying heuristics (most recent, most active, alphabetical). Heuristics can select the wrong account, leading to data privacy violations and incorrect actions. Asking for a distinguishing identifier (email, order number) resolves ambiguity reliably."
            }
          }
        ]
      },
      {
        id: "5.3",
        title: "Implement error propagation strategies across multi-agent systems",
        skills: [
          {
            text: "Returning structured error context including failure type, what was attempted, partial results, and potential alternatives to enable coordinator recovery",
            q: {
              stem: "Your web search subagent times out. It returns `{\"error\": \"search failed\"}` to the coordinator. The coordinator marks the entire research task as failed and terminates. What should the error response have included?",
              options: [
                "A full stack trace of the timeout error",
                "Structured error context: failure type (timeout), what was attempted (specific query and parameters), any partial results obtained before timeout, isRetryable (true for transient), and suggested alternatives (retry with narrower query, use cached results). This enables intelligent coordinator recovery rather than total failure",
                "A simple flag `{\"should_retry\": true}` to trigger automatic retry",
                "The subagent should have silently retried before reporting to the coordinator"
              ],
              correct: 1,
              reasoning: "Generic error messages like 'search failed' give the coordinator no basis for intelligent recovery. Structured error context — what specifically failed, what was attempted, any partial results, whether retry is viable, and alternatives — allows the coordinator to make informed decisions: retry with a narrower query, use partial results with a coverage annotation, or escalate."
            }
          },
          {
            text: "Distinguishing access failures from valid empty results in error reporting so the coordinator can make appropriate decisions",
            q: {
              stem: "Your document search subagent connects successfully to the document store, runs a valid query for 'AI regulation policy documents 2023', and finds zero matching documents. How should it report this to the coordinator?",
              options: [
                "`{\"isError\": true, \"errorCategory\": \"transient\", \"isRetryable\": true}` — no results means the search didn't work",
                "`{\"results\": [], \"total\": 0, \"query\": \"AI regulation policy documents 2023\"}` — a valid successful response with zero matches. The search worked correctly; the document store simply has no matching documents",
                "`{\"isError\": true, \"errorCategory\": \"validation\"}` — the query may need refinement",
                "`{\"status\": \"empty\", \"isRetryable\": false}` — no results and no retry needed"
              ],
              correct: 1,
              reasoning: "Zero results from a successful search is NOT an error — it is a valid response meaning the query ran correctly and found no matches. Flagging it as an error causes the coordinator to retry a perfectly valid operation. The coordinator needs to know: did the tool fail (access failure) or did it succeed but find nothing (empty result)? These require completely different responses."
            }
          },
          {
            text: "Structuring synthesis output with coverage annotations indicating which findings are well-supported versus which topic areas have gaps due to unavailable sources",
            q: {
              stem: "Your research pipeline's web search subagent successfully finds information on 4 of 6 research subtopics. For 2 subtopics, the search returned empty results. The synthesis agent produces a report covering only 4 subtopics without mentioning the 2 gaps. What is the correct behaviour?",
              options: [
                "The synthesis agent should attempt its own web searches to fill the gaps",
                "The synthesis report should include coverage annotations: flag the 2 subtopics where source retrieval failed or returned no results, distinguish well-supported findings from those with coverage gaps, and note what additional sources would be needed for complete coverage",
                "The coordinator should retry the searches before passing results to synthesis",
                "The report should include a disclaimer that it may be incomplete"
              ],
              correct: 1,
              reasoning: "Coverage annotations in synthesis output make gaps explicit and actionable. A report that silently omits 2 of 6 subtopics misleads readers into thinking coverage is complete. Annotating which findings are well-supported and which areas have gaps due to unavailable sources is honest about reliability and helps users know where to seek additional information."
            }
          }
        ]
      },
      {
        id: "5.4",
        title: "Manage context effectively in large codebase exploration",
        skills: [
          {
            text: "Having agents maintain scratchpad files recording key findings, referencing them for subsequent questions to counteract context degradation",
            q: {
              stem: "After 3 hours exploring a large codebase, your agent starts giving vague answers like 'there are typically dependency injection patterns in codebases like this' instead of referencing the specific classes it found earlier. What is the root cause and correct mitigation?",
              options: [
                "The model's knowledge about the codebase is fading — restart the session",
                "Context degradation: as the session grows, earlier specific findings get pushed out or diluted. Mitigation: have the agent maintain scratchpad files recording key discoveries (specific class names, relationships, patterns found) and reference these files in subsequent questions rather than relying on long-context memory",
                "The agent needs a larger context window to retain earlier findings",
                "The agent should summarise the codebase structure at the end of each session"
              ],
              correct: 1,
              reasoning: "Context degradation in extended sessions causes models to drift from specific findings to generic patterns as the session grows. Scratchpad files persist findings outside the context window — the agent records specific class names, relationships, and patterns as it discovers them, and references these files later. This counteracts degradation by providing explicit, specific reference material."
            }
          },
          {
            text: "Designing crash recovery using structured agent state exports (manifests) that the coordinator loads on resume and injects into agent prompts",
            q: {
              stem: "Your multi-agent codebase analysis pipeline crashed after 2 hours. 3 of 5 subagents had completed their analysis and written findings. 2 were mid-task. How do you design the system to resume efficiently without re-running the completed work?",
              options: [
                "Restart the entire pipeline from scratch to ensure consistency",
                "Design each agent to export structured state manifests to known file locations (completed findings, current subtask, progress). The coordinator loads the manifest on resume, identifies which agents completed and which were mid-task, and injects each agent's state into their resumption prompt — only re-running the 2 incomplete agents",
                "Use session resumption to restart each subagent from their last checkpoint",
                "Store all intermediate results in a database and query it on resume"
              ],
              correct: 1,
              reasoning: "Structured state exports (manifests) enable efficient crash recovery. Each agent writes its progress to a known location. On coordinator resume, the manifest is loaded to identify what was completed vs in-progress. Only the 2 incomplete agents need to restart, with their last known state injected into context. The 3 completed agents' work is preserved and usable immediately."
            }
          }
        ]
      },
      {
        id: "5.5",
        title: "Design human review workflows and confidence calibration",
        skills: [
          {
            text: "Having models output field-level confidence scores, then calibrating review thresholds using labeled validation sets",
            q: {
              stem: "Your extraction system routes all extractions with confidence below 0.7 to human review. Human reviewers confirm that extractions with confidence 0.6-0.7 are correct 95% of the time — the threshold is too conservative, creating unnecessary review workload. How do you improve it?",
              options: [
                "Raise the threshold to 0.9 to send more to human review",
                "Use a labeled validation set to calibrate confidence scores: measure actual accuracy for each confidence range, find the confidence level where accuracy drops below your acceptable threshold, and set the routing cutoff there — data-driven calibration rather than arbitrary thresholds",
                "Remove confidence-based routing and use random sampling instead",
                "Ask the model to explain its reasoning for low-confidence extractions before routing"
              ],
              correct: 1,
              reasoning: "Confidence thresholds should be calibrated against actual accuracy data from labeled validation sets, not set arbitrarily. If 0.6-0.7 confidence extractions are 95% accurate, that range may not need human review. Measure accuracy by confidence range to find the actual threshold where accuracy drops to an unacceptable level — then set the routing cutoff there."
            }
          },
          {
            text: "Routing extractions with low model confidence or ambiguous/contradictory source documents to human review, prioritizing limited reviewer capacity",
            q: {
              stem: "You have 10,000 extractions to process but only 2 human reviewers with capacity to review 500 per day. Your model outputs field-level confidence scores. How do you prioritise reviewer capacity?",
              options: [
                "Review all extractions in the order they were submitted (FIFO)",
                "Route extractions with low confidence scores or ambiguous/contradictory source documents to human review first, prioritising those with the highest downstream impact or the lowest confidence. High-confidence extractions can be auto-approved, maximising the value of limited reviewer capacity",
                "Split the 500 daily reviews randomly across all extractions",
                "Only review extractions that failed schema validation"
              ],
              correct: 1,
              reasoning: "With limited reviewer capacity, routing must be strategic. Low-confidence extractions and those from ambiguous/contradictory sources are where human judgement adds the most value — auto-approving these is risky. High-confidence extractions from clear documents can be auto-approved, freeing reviewer time for cases where human review actually changes outcomes."
            }
          }
        ]
      },
      {
        id: "5.6",
        title: "Preserve information provenance and handle uncertainty in multi-source synthesis",
        skills: [
          {
            text: "Requiring subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts) that downstream agents preserve through synthesis",
            q: {
              stem: "Your research pipeline produces a report where claims appear without any source attribution. The synthesis agent received findings from 6 subagents but dropped source information during summarisation. What is the correct architectural fix?",
              options: [
                "Instruct the synthesis agent to add citations at the end of the report",
                "Require subagents to return structured claim-source mappings: `{claim: \"...\", source_url: \"...\", document_name: \"...\", excerpt: \"...\"}`. The synthesis agent preserves these structured fields through synthesis rather than converting to prose that loses attribution",
                "Add a separate citation agent that runs after synthesis and looks up sources",
                "Have the coordinator re-attach sources to the final report by cross-referencing subagent outputs"
              ],
              correct: 1,
              reasoning: "Source attribution must be preserved structurally from subagent to synthesis. When subagents return prose summaries, source information is lost during synthesis. Structured claim-source mappings give the synthesis agent explicit fields to preserve. A post-hoc citation agent or coordinator re-attachment cannot reliably reconstruct mappings that were lost during synthesis."
            }
          },
          {
            text: "Annotating conflicting statistics with both source attributions rather than selecting one value, flagging the conflict for human review",
            q: {
              stem: "Two credible sources in your research pipeline report different market sizes: Source A says $4.2B, Source B says $6.8B. Your synthesis agent selects the higher figure ($6.8B) as more optimistic and presents it as fact. What is the correct behaviour?",
              options: [
                "Use the most recent source since it supersedes older data",
                "Use the average ($5.5B) and note that estimates vary",
                "Present both figures with their source attributions: 'Source A reports $4.2B while Source B reports $6.8B — these figures conflict and may reflect different market definitions or methodologies' and flag for human review",
                "Use the more conservative figure ($4.2B) to avoid overstating"
              ],
              correct: 2,
              reasoning: "When credible sources conflict, the correct response is to present both figures with explicit source attribution and flag the conflict — not to choose one or average them. Selecting or averaging presents false precision. The conflict itself is meaningful information: it may reflect different market definitions, time periods, or methodologies. Human review can determine the appropriate figure for the specific context."
            }
          }
        ]
      }
    ]
  }
];

export default DOMAINS;

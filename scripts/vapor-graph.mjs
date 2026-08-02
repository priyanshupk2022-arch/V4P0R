#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ORCHESTRATION = path.join(ROOT, "orchestration");
const GENERATED = path.join(ORCHESTRATION, "generated");
const RUNS = path.join(ORCHESTRATION, "runs");
const SOURCE_PATH = path.join(ORCHESTRATION, "graph-source.json");
const ROLES_PATH = path.join(ORCHESTRATION, "roles.json");
const SKILLS_PATH = path.join(ORCHESTRATION, "skill-router.json");
const INPUTS_PATH = path.join(ORCHESTRATION, "missing-inputs.json");
const APPROVALS_PATH = path.join(ORCHESTRATION, "human-approvals.json");
const GRAPH_PATH = path.join(GENERATED, "vapor-graph.jsonl");
const INDEX_PATH = path.join(GENERATED, "vapor-graph-index.json");
const SUMMARY_PATH = path.join(GENERATED, "vapor-graph-summary.md");
const STATE_PATH = path.join(ORCHESTRATION, "state.json");
const LOCK_PATH = path.join(ORCHESTRATION, ".control.lock");

const ALLOWED_STATUSES = new Set([
  "LOCKED",
  "READY",
  "RUNNING",
  "VERIFYING",
  "PASS",
  "WAITING_INPUT",
  "RETRYING",
  "FAILED_DIAGNOSIS",
  "REVALIDATE",
  "FAIL"
]);

const ALLOWED_HUMAN_GATES = new Set([
  "NONE",
  "H_PRODUCTION_PAYMENT",
  "H_FINAL_SUBMISSION"
]);

const BASE_STAGE_ACTIONS = {
  RESEARCH: [
    "Identify and cite the controlling source and its freshness",
    "Inspect and classify the current repository or runtime behavior",
    "Verify accepted predecessor evidence and required inputs",
    "Separate observed facts, inferences, assumptions, and unknowns",
    "Record conflicts, unsafe shortcuts, and prohibited interpretations",
    "Define one falsifiable acceptance oracle before any implementation"
  ],
  DESIGN: [
    "Define inputs, outputs, ownership, and trust boundaries",
    "Define invariants and allowed state or lifecycle transitions",
    "Define invalid, unavailable, timeout, and partial-failure behavior",
    "Define security, privacy, and redaction requirements",
    "Define observability, correlation, and evidence requirements",
    "Define rollback, cut, and downstream revalidation impact"
  ],
  IMPLEMENT: [
    "Add or update the smallest oracle that fails before the change",
    "Implement the primary behavior within the assigned write scope",
    "Implement input, contract, and state validation",
    "Implement fail-closed error and unavailable-state behavior",
    "Implement safe configuration, persistence, and restart behavior",
    "Implement redacted instrumentation and truthful claims or UI mapping"
  ],
  VERIFY: [
    "Prove the primary success or expected terminal outcome",
    "Prove the primary rejection or negative outcome",
    "Prove behavior when a required input is missing or invalid",
    "Prove behavior when an upstream dependency is unavailable",
    "Prove repeat, duplicate, ordering, or idempotency behavior",
    "Prove authorization, execution-authority, and sensitive-data boundaries",
    "Prove upstream and downstream integration against current contracts",
    "Hash and preserve reproducible redacted evidence"
  ],
  REVIEW: [
    "Perform an independent diff or artifact review against the requirement",
    "Perform an independent security and reliability challenge",
    "Verify evidence freshness, redaction, commit binding, and oracle result",
    "Record change impact, residual risk, reviewer identity, and final decision"
  ]
};

const PROFILE_ACTIONS = {
  governance: {
    RESEARCH: ["Compare every readiness claim with code, tests, runtime, and external proof"],
    DESIGN: ["Define claim language that cannot overstate sandbox, production, compliance, or traction"],
    IMPLEMENT: ["Remove or quarantine stale completion state and unsupported authority"],
    VERIFY: ["Prove no historical narrative can unlock a current implementation gate"],
    REVIEW: ["Independently reconcile claim, scope, graph, and evidence registers"]
  },
  graph: {
    RESEARCH: ["Resolve required role, skill, resource lock, and context sources"],
    DESIGN: ["Define dependency, ownership, stale-evidence, and resume semantics"],
    IMPLEMENT: ["Emit deterministic registry, state, run-log, context, and coverage artifacts"],
    VERIFY: ["Reject orphan, duplicate, cycle, unreachable, collision, and padding cases"],
    REVIEW: ["Forward-test the control path with a fresh agent and bounded context"]
  },
  contract: {
    RESEARCH: ["Verify account-specific guidance, official docs, SDK types, and safe observed fields"],
    DESIGN: ["Select one contract and define terminal states, retries, idempotency, and redaction"],
    IMPLEMENT: ["Map every external call to one approved contract record"],
    VERIFY: ["Prove contract drift, malformed response, rate limit, timeout, and provider-error behavior"],
    REVIEW: ["Reject mixed flows, invented fields, stale endpoints, and credential-bearing evidence"]
  },
  data: {
    RESEARCH: ["Inspect schema, migration, state, transaction, and ownership conflicts"],
    DESIGN: ["Define atomic boundaries, constraints, uniqueness, correction, and restoration semantics"],
    IMPLEMENT: ["Apply durable database enforcement rather than process-local assumptions"],
    VERIFY: ["Prove empty install, upgrade, rollback, duplicate, race, restart, and restore behavior"],
    REVIEW: ["Challenge ledger terminology and transaction guarantees against actual database behavior"]
  },
  auth: {
    RESEARCH: ["Trace every identity, tenant, role, session, and caller-controlled input"],
    DESIGN: ["Define cryptographic identity, membership lookup, RLS, and least-privilege rules"],
    IMPLEMENT: ["Remove trusted client identity headers and fail-open authorization behavior"],
    VERIFY: ["Prove unauthenticated, spoofed, cross-tenant, stale-session, and privilege-escalation refusal"],
    REVIEW: ["Adversarially inspect confused-deputy and broken-object-authorization paths"]
  },
  financial: {
    RESEARCH: ["Trace merchant, amount, currency, item, policy, approval, and state bindings"],
    DESIGN: ["Define deterministic decision and first-valid consequential human approval semantics"],
    IMPLEMENT: ["Use integer money and durable atomic transitions for every consequential decision"],
    VERIFY: ["Prove boundary amounts, expiry, duplicate, conflict, race, restart, and AI non-authority"],
    REVIEW: ["Independently challenge funds-loss, double-action, and incorrect-approval paths"]
  },
  provider: {
    RESEARCH: ["Verify the exact configured provider account, environment, auth, and response contract"],
    DESIGN: ["Define idempotency, retries, timeout, uncertain result, webhook, and correlation behavior"],
    IMPLEMENT: ["Call only approved live interfaces and remove synthetic provider fallbacks"],
    VERIFY: ["Prove live-safe happy, invalid, unavailable, replay, duplicate, and contract-drift behavior"],
    REVIEW: ["Independently correlate provider evidence with durable VAPOR state and redact secrets"]
  },
  browser: {
    RESEARCH: ["Inspect merchant flow, automation constraints, sensitive fields, CAPTCHA, and terminal outcomes"],
    DESIGN: ["Define isolated context, ephemeral credential handoff, one-attempt policy, and artifact redaction"],
    IMPLEMENT: ["Automate the real merchant path without storing or logging payment credentials"],
    VERIFY: ["Prove trace, screenshot, video, console, and network artifacts contain no payment data"],
    REVIEW: ["Independently reproduce the expected sandbox decline and provider correlation"]
  },
  api: {
    RESEARCH: ["Trace request, response, auth, persistence, provider, and recovery boundaries"],
    DESIGN: ["Define typed validation, errors, idempotency keys, correlation IDs, and recovery states"],
    IMPLEMENT: ["Keep secrets server-side and make every externally visible state durable and truthful"],
    VERIFY: ["Prove malformed, unauthorized, cross-tenant, timeout, retry, duplicate, and restart behavior"],
    REVIEW: ["Independently inspect SSRF, injection, over-posting, data leak, and partial-commit paths"]
  },
  ui: {
    RESEARCH: ["Map every visible state and claim to a durable backend or provider state"],
    DESIGN: ["Define accessible responsive idle, working, waiting, success, decline, unavailable, and failure states"],
    IMPLEMENT: ["Connect UI actions to real server workflows and remove simulated release-path success"],
    VERIFY: ["Prove refresh, reconnect, keyboard, screen-size, slow-network, and error behavior in a browser"],
    REVIEW: ["Run a fresh-user comprehension test without code knowledge or team-only access"]
  },
  test: {
    RESEARCH: ["Map every requirement to an independent positive and negative oracle"],
    DESIGN: ["Define deterministic fixtures, live-test boundaries, race control, and coverage meaning"],
    IMPLEMENT: ["Add missing test infrastructure rather than skipping absent checks"],
    VERIFY: ["Prove tests fail on representative mutations and do not pass through fabricated fallbacks"],
    REVIEW: ["Independently assess flakiness, assertion quality, blind spots, and evidence integrity"]
  },
  security: {
    RESEARCH: ["Threat-model assets, actors, trust boundaries, abuse cases, and supply-chain inputs"],
    DESIGN: ["Define containment, rotation, retention, deletion, alerting, and incident response"],
    IMPLEMENT: ["Remove exposed material and enforce least privilege, secure defaults, and safe headers"],
    VERIFY: ["Run source, history, dependency, artifact, auth, injection, and payment-data adversarial checks"],
    REVIEW: ["Independently review every Critical or High path and every accepted residual risk"]
  },
  ops: {
    RESEARCH: ["Inspect environment, deployment, CI, provider, database, and operational dependencies"],
    DESIGN: ["Define immutable release identity, health, alerts, SLOs, recovery, and rollback"],
    IMPLEMENT: ["Automate deployment and operations without exposing secrets or hiding unhealthy states"],
    VERIFY: ["Prove clean deployment, public smoke, provider outage, backup, restore, and rollback"],
    REVIEW: ["Independently operate the runbooks from a fresh environment"]
  },
  audit: {
    RESEARCH: ["Reconstruct truth from the sealed snapshot and raw artifacts without builder conclusions"],
    DESIGN: ["Define finding fingerprint, severity, release impact, reproduction, and restart scope"],
    IMPLEMENT: ["Execute a read-only fresh-context audit and write only sidecar evidence"],
    VERIFY: ["Reproduce every release-critical claim and challenge missing, stale, or contradictory proof"],
    REVIEW: ["Bind the verdict to one unchanged snapshot and certify no self-approval occurred"]
  },
  human: {
    RESEARCH: ["Verify prior independent authority, external access, scope, expiry, and user intent"],
    DESIGN: ["Bind consequential action to exact environment, merchant, amount, operation, and maximum attempts"],
    IMPLEMENT: ["Prepare the action completely but stop immediately before its named human gate"],
    VERIFY: ["Prove the approval matches the immutable scope and no broader action can occur"],
    REVIEW: ["Record redacted outcome and preserve the user's final authority"]
  }
};

const STAGE_KIND = {
  RESEARCH: "research",
  DESIGN: "design",
  IMPLEMENT: "implementation",
  VERIFY: "test",
  REVIEW: "evidence"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function recomputeNodeHash(node) {
  const { node_hash: ignored, ...content } = node;
  return digest(content);
}

function slug(value) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 48);
}

function ensureDirectories() {
  fs.mkdirSync(GENERATED, { recursive: true });
  fs.mkdirSync(RUNS, { recursive: true });
}

function atomicWrite(file, content) {
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, file);
}

function withControlLock(callback) {
  ensureDirectories();
  let descriptor;
  try {
    descriptor = fs.openSync(LOCK_PATH, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") throw new Error("Another VAPOR control-plane mutation is in progress");
    throw error;
  }
  try {
    return callback();
  } finally {
    fs.closeSync(descriptor);
    fs.unlinkSync(LOCK_PATH);
  }
}

function isWithin(child, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function fileHash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function resolvedCapabilities(outcome) {
  return outcome.capabilities.map((capability, index) => {
    const data = typeof capability === "string" ? { title: capability } : capability;
    return {
      id: `${outcome.id}.C${String(index + 1).padStart(2, "0")}`,
      title: data.title,
      profile: data.profile ?? outcome.profile,
      role: data.role ?? outcome.role,
      sources: data.sources ?? outcome.sources,
      write_scope: data.write_scope ?? outcome.write_scope,
      human_gate: data.human_gate ?? "NONE",
      required_inputs: [...(outcome.required_inputs ?? []), ...(data.required_inputs ?? [])]
    };
  });
}

function createNode(input) {
  const node = {
    id: input.id,
    level: input.level,
    parent: input.parent,
    outcome: input.outcome,
    capability: input.capability ?? null,
    profile: input.profile,
    kind: input.kind,
    title: input.title,
    requirement: input.requirement,
    claim_key: input.claim_key ?? input.id,
    sources: [...new Set(input.sources ?? [])],
    owner_role: input.owner_role,
    required_skills: [...new Set(input.required_skills ?? [])],
    depends_on: [...new Set(input.depends_on ?? [])],
    write_scope: [...new Set(input.write_scope ?? ["read-only"])],
    required_inputs: [...new Set(input.required_inputs ?? [])],
    human_gate: input.human_gate ?? "NONE",
    oracle: input.oracle,
    evidence_path: input.evidence_path,
    initial_status: input.initial_status ?? "LOCKED"
  };
  node.node_hash = digest(node);
  return node;
}

function actionsFor(profile, stage) {
  const base = BASE_STAGE_ACTIONS[stage] ?? [];
  const specific = PROFILE_ACTIONS[profile]?.[stage] ?? [];
  return [...base, ...specific];
}

function oracleFor(stage, requirement) {
  const type = stage === "IMPLEMENT"
    ? "context_resolved_command_and_diff"
    : stage === "VERIFY"
      ? "context_resolved_command_or_observation"
      : stage === "REVIEW"
        ? "independent_review"
        : "artifact_assertion";
  return {
    type,
    assertion: requirement,
    expected: "PASS with current redacted evidence bound to the node, source snapshot, actor, and verifier",
    pre_run_rule: "Resolve any exact command, browser observation, or provider probe in the current-node context pack before RUNNING"
  };
}

function buildGraph() {
  const source = readJson(SOURCE_PATH);
  const roles = readJson(ROLES_PATH);
  const router = readJson(SKILLS_PATH);
  const roleIds = new Set(roles.roles.map((role) => role.id));
  const nodes = [];

  nodes.push(createNode({
    id: source.root,
    level: "L0",
    parent: null,
    outcome: "MISSION",
    profile: "governance",
    kind: "gate",
    title: "VAPOR production mission root",
    requirement: "Authorize the approved VAPOR master execution graph without asserting implementation completion.",
    sources: [source.authority],
    owner_role: "parent-orchestrator",
    required_skills: router.profiles.governance,
    depends_on: [],
    write_scope: ["read-only"],
    oracle: { type: "human_decision", assertion: "The user approved creation and later execution of this control system.", expected: "Approved planning authority is recorded without granting the two consequential human gates." },
    evidence_path: "docs/EVIDENCE/GRAPH/VAPOR.ROOT.json",
    initial_status: "PASS"
  }));

  const outcomeFinalLeaves = new Map();

  for (const outcome of source.outcomes) {
    if (!roleIds.has(outcome.role)) throw new Error(`Unknown role ${outcome.role} in ${outcome.id}`);
    const skills = router.profiles[outcome.profile];
    if (!skills) throw new Error(`Unknown skill profile ${outcome.profile} in ${outcome.id}`);
    const outcomeDeps = outcome.depends_on.map((dependency) => dependency === source.root ? dependency : `${dependency}.COMPLETE`);

    nodes.push(createNode({
      id: outcome.id,
      level: "L1",
      parent: source.root,
      outcome: outcome.id,
      profile: outcome.profile,
      kind: "gate",
      title: outcome.title,
      requirement: `Open outcome ${outcome.id} only after every declared predecessor completion gate passes.`,
      sources: outcome.sources,
      owner_role: "parent-orchestrator",
      required_skills: skills,
      depends_on: outcomeDeps,
      write_scope: ["read-only"],
      required_inputs: outcome.required_inputs ?? [],
      oracle: { type: "graph_gate", assertion: `All declared predecessors for ${outcome.id} are PASS and current.`, expected: "The outcome opens without bypassing missing inputs, evidence, or dependencies." },
      evidence_path: `docs/EVIDENCE/GRAPH/${outcome.id}.json`
    }));

    const finalLeaves = [];
    for (const capability of resolvedCapabilities(outcome)) {
      if (!roleIds.has(capability.role)) throw new Error(`Unknown role ${capability.role} in ${capability.id}`);
      const capabilitySkills = router.profiles[capability.profile];
      if (!capabilitySkills) throw new Error(`Unknown skill profile ${capability.profile} in ${capability.id}`);

      nodes.push(createNode({
        id: capability.id,
        level: "L2",
        parent: outcome.id,
        outcome: outcome.id,
        capability: capability.title,
        profile: capability.profile,
        kind: "capability",
        title: capability.title,
        requirement: `Open and coordinate the evidence-gated capability \"${capability.title}\" after its outcome, inputs, skills, ownership, and sources are ready.`,
        sources: capability.sources,
        owner_role: capability.role,
        required_skills: capabilitySkills,
        depends_on: [outcome.id],
        write_scope: capability.write_scope,
        required_inputs: capability.required_inputs,
        oracle: { type: "capability_opener", assertion: `The capability ${capability.title} has current sources, verified inputs, resolved skills, disjoint ownership, and accepted outcome prerequisites.`, expected: "The first research package may start without claiming descendant completion." },
        evidence_path: `docs/EVIDENCE/GRAPH/${capability.id}.json`
      }));

      let previousStageDeps = [capability.id];
      for (const stage of ["RESEARCH", "DESIGN", "IMPLEMENT", "VERIFY", "REVIEW"]) {
        const packageId = `${capability.id}.P.${stage}`;
        const stageGate = "NONE";
        nodes.push(createNode({
          id: packageId,
          level: "L3",
          parent: capability.id,
          outcome: outcome.id,
          capability: capability.title,
          profile: capability.profile,
          kind: "package",
          title: `${stage.toLowerCase()} package for ${capability.title}`,
          requirement: `Open the ${stage.toLowerCase()} package for ${capability.title} only after its preceding package evidence passes.`,
          sources: capability.sources,
          owner_role: capability.role,
          required_skills: capabilitySkills,
          depends_on: previousStageDeps,
          write_scope: stage === "RESEARCH" || stage === "REVIEW" ? ["read-only"] : capability.write_scope,
          required_inputs: capability.required_inputs,
          human_gate: stageGate,
          oracle: { type: "package_gate", assertion: `The ${stage.toLowerCase()} package prerequisites, skills, context, ownership, inputs, and human gate are satisfied.`, expected: "Package is ready without dependency or authority bypass." },
          evidence_path: `docs/EVIDENCE/GRAPH/${packageId}.json`
        }));

        const leafIds = [];
        actionsFor(capability.profile, stage).forEach((action, actionIndex) => {
          const leafGate = stage === "IMPLEMENT" && actionIndex === 1 ? capability.human_gate : "NONE";
          const leafTitle = leafGate !== "NONE" ? `Human-gated execution: ${capability.title}` : `${action} — ${capability.title}`;
          const leafId = `${packageId}.L${String(actionIndex + 1).padStart(2, "0")}.${slug(leafTitle)}`;
          const requirement = leafGate !== "NONE"
            ? `Execute exactly one human-approved action for capability \"${capability.title}\" within the immutable approved scope, then consume the approval without retry.`
            : `${action} for capability \"${capability.title}\".`;
          const leaf = createNode({
            id: leafId,
            level: "L4",
            parent: packageId,
            outcome: outcome.id,
            capability: capability.title,
            profile: capability.profile,
            kind: leafGate !== "NONE" ? "human" : stage === "REVIEW" && capability.profile === "audit" ? "audit" : STAGE_KIND[stage],
            title: leafTitle,
            requirement,
            claim_key: `${capability.id}:${stage}:${String(actionIndex + 1).padStart(2, "0")}:${slug(action)}`,
            sources: capability.sources,
            owner_role: capability.role,
            required_skills: capabilitySkills,
            depends_on: [packageId],
            write_scope: stage === "IMPLEMENT" ? capability.write_scope : ["read-only"],
            required_inputs: capability.required_inputs,
            human_gate: leafGate,
            oracle: oracleFor(stage, requirement),
            evidence_path: `docs/EVIDENCE/NODES/${leafId}.json`
          });
          nodes.push(leaf);
          leafIds.push(leaf.id);
        });
        previousStageDeps = leafIds;
      }
      finalLeaves.push(...previousStageDeps);
    }

    outcomeFinalLeaves.set(outcome.id, finalLeaves);
    nodes.push(createNode({
      id: `${outcome.id}.COMPLETE`,
      level: "L1",
      parent: source.root,
      outcome: outcome.id,
      profile: outcome.profile,
      kind: "gate",
      title: `${outcome.id} completion gate`,
      requirement: `Complete ${outcome.id} only after every mandatory atomic descendant is independently verified with current evidence.`,
      sources: outcome.sources,
      owner_role: "release-controller",
      required_skills: skills,
      depends_on: finalLeaves,
      write_scope: ["read-only"],
      required_inputs: outcome.required_inputs ?? [],
      oracle: { type: "coverage_gate", assertion: `Every mandatory descendant of ${outcome.id} is PASS and current.`, expected: "Zero failed, waiting, stale, missing-evidence, or self-approved descendants." },
      evidence_path: `docs/EVIDENCE/GRAPH/${outcome.id}.COMPLETE.json`
    }));
  }

  const graphHash = digest(nodes.map((node) => node.node_hash));
  return { source, roles, router, nodes, graphHash, outcomeFinalLeaves };
}

function normalizeRequirement(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validateGraph(graph) {
  const errors = [];
  const warnings = [];
  const byId = new Map();
  const requirementMap = new Map();
  const claimKeyMap = new Map();
  const titleMap = new Map();
  const skillCatalog = new Set(Object.values(graph.router.profiles).flat());
  const roleCatalog = new Set(graph.roles.roles.map((role) => role.id));

  for (const node of graph.nodes) {
    if (byId.has(node.id)) errors.push(`duplicate node id: ${node.id}`);
    byId.set(node.id, node);
    if (recomputeNodeHash(node) !== node.node_hash) errors.push(`node hash mismatch: ${node.id}`);
    if (!node.claim_key) errors.push(`missing claim key: ${node.id}`);
    if (claimKeyMap.has(node.claim_key)) errors.push(`duplicate claim key: ${node.id} and ${claimKeyMap.get(node.claim_key)}`);
    claimKeyMap.set(node.claim_key, node.id);
    if (!ALLOWED_STATUSES.has(node.initial_status)) errors.push(`invalid initial status on ${node.id}: ${node.initial_status}`);
    if (!ALLOWED_HUMAN_GATES.has(node.human_gate)) errors.push(`invalid human gate on ${node.id}: ${node.human_gate}`);
    if (!roleCatalog.has(node.owner_role)) errors.push(`unknown owner role on ${node.id}: ${node.owner_role}`);
    if (!node.requirement || node.requirement.length < 20) errors.push(`missing or weak requirement: ${node.id}`);
    if (!node.oracle?.assertion || !node.oracle?.expected) errors.push(`missing structured oracle: ${node.id}`);
    if (!node.evidence_path?.startsWith("docs/EVIDENCE/")) errors.push(`invalid evidence path: ${node.id}`);
    if (!node.sources?.length) errors.push(`missing source: ${node.id}`);
    if (!node.required_skills?.length) errors.push(`missing skills: ${node.id}`);
    for (const skill of node.required_skills ?? []) if (!skillCatalog.has(skill)) errors.push(`unknown skill ${skill} on ${node.id}`);
    for (const scope of node.write_scope ?? []) {
      if (path.isAbsolute(scope) || scope.includes("..")) errors.push(`unsafe write scope ${scope} on ${node.id}`);
    }
    const normalized = normalizeRequirement(node.requirement);
    if (requirementMap.has(normalized)) errors.push(`duplicate normalized requirement: ${node.id} and ${requirementMap.get(normalized)}`);
    requirementMap.set(normalized, node.id);
    const normalizedTitle = normalizeRequirement(node.title);
    if (node.level === "L4" && titleMap.has(normalizedTitle)) errors.push(`duplicate atomic title: ${node.id} and ${titleMap.get(normalizedTitle)}`);
    if (node.level === "L4") titleMap.set(normalizedTitle, node.id);
    if (/(^|\W)(todo|tbd|placeholder)(\W|$)/i.test(node.requirement)) errors.push(`placeholder requirement: ${node.id}`);
  }

  for (const node of graph.nodes) {
    if (node.parent && !byId.has(node.parent)) errors.push(`missing parent ${node.parent} on ${node.id}`);
    for (const dependency of node.depends_on) {
      if (!byId.has(dependency)) errors.push(`missing dependency ${dependency} on ${node.id}`);
      if (dependency === node.id) errors.push(`self dependency on ${node.id}`);
    }
  }

  const indegree = new Map(graph.nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(graph.nodes.map((node) => [node.id, []]));
  for (const node of graph.nodes) {
    for (const dependency of node.depends_on) {
      if (!byId.has(dependency)) continue;
      indegree.set(node.id, indegree.get(node.id) + 1);
      outgoing.get(dependency).push(node.id);
    }
  }
  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id).sort();
  const sorted = [];
  while (queue.length) {
    const id = queue.shift();
    sorted.push(id);
    for (const child of outgoing.get(id) ?? []) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) {
        queue.push(child);
        queue.sort();
      }
    }
  }
  if (sorted.length !== graph.nodes.length) errors.push(`dependency cycle detected; sorted ${sorted.length}/${graph.nodes.length}`);

  const reachable = new Set([graph.source.root]);
  const walk = [graph.source.root];
  while (walk.length) {
    const id = walk.shift();
    for (const child of outgoing.get(id) ?? []) {
      if (!reachable.has(child)) {
        reachable.add(child);
        walk.push(child);
      }
    }
  }
  for (const node of graph.nodes) if (!reachable.has(node.id)) errors.push(`unreachable from root: ${node.id}`);

  const terminal = `${graph.source.outcomes.at(-1).id}.COMPLETE`;
  const ancestorsOfTerminal = new Set();
  const reverseWalk = [terminal];
  while (reverseWalk.length) {
    const id = reverseWalk.shift();
    if (ancestorsOfTerminal.has(id)) continue;
    ancestorsOfTerminal.add(id);
    const node = byId.get(id);
    for (const dependency of node?.depends_on ?? []) reverseWalk.push(dependency);
  }
  for (const node of graph.nodes) if (!ancestorsOfTerminal.has(node.id)) errors.push(`node cannot reach terminal path: ${node.id}`);

  const atomicLeaves = graph.nodes.filter((node) => node.level === "L4");
  if (atomicLeaves.length < graph.source.minimum_atomic_leaves) {
    errors.push(`atomic leaf target missed: ${atomicLeaves.length}/${graph.source.minimum_atomic_leaves}`);
  }

  const completionNodes = graph.nodes.filter((node) => node.id.endsWith(".COMPLETE"));
  for (const completion of completionNodes) {
    if (!completion.depends_on.length) errors.push(`empty completion gate: ${completion.id}`);
  }

  if (!fs.existsSync(INPUTS_PATH)) warnings.push("missing missing-input registry");
  else {
    const registry = readJson(INPUTS_PATH);
    const names = new Set(registry.items.map((item) => item.name ?? item.id));
    for (const node of graph.nodes) {
      for (const input of node.required_inputs) if (!names.has(input)) errors.push(`unregistered required input ${input} on ${node.id}`);
    }
    for (const item of registry.items) {
      if (!item.dependent_nodes?.length) errors.push(`input has no dependent nodes: ${item.name ?? item.id}`);
      for (const dependency of item.dependent_nodes ?? []) {
        if (!graph.nodes.some((node) => node.id === dependency || node.id.startsWith(`${dependency}.`))) errors.push(`input ${item.name ?? item.id} has unknown dependent node ${dependency}`);
      }
    }
  }
  if (!fs.existsSync(APPROVALS_PATH)) warnings.push("missing human-approval registry");

  return { errors, warnings, counts: countGraph(graph.nodes), terminal };
}

function countGraph(nodes) {
  const byLevel = {};
  const byOutcome = {};
  const byKind = {};
  const byProfile = {};
  for (const node of nodes) {
    byLevel[node.level] = (byLevel[node.level] ?? 0) + 1;
    byOutcome[node.outcome] = (byOutcome[node.outcome] ?? 0) + 1;
    byKind[node.kind] = (byKind[node.kind] ?? 0) + 1;
    byProfile[node.profile] = (byProfile[node.profile] ?? 0) + 1;
  }
  return { total: nodes.length, atomic_leaves: byLevel.L4 ?? 0, by_level: byLevel, by_outcome: byOutcome, by_kind: byKind, by_profile: byProfile };
}

function writeGraph(graph, validation, resetState) {
  ensureDirectories();
  const existingState = fs.existsSync(STATE_PATH) ? readJson(STATE_PATH) : null;
  if (existingState && existingState.graph_hash !== graph.graphHash && !resetState) {
    throw new Error("Graph hash changed while state exists. Re-run build with --reset-state only after preserving the prior run log and accepting revalidation.");
  }
  const index = {
    version: graph.source.version,
    authority: graph.source.authority,
    generated_at: new Date().toISOString(),
    graph_hash: graph.graphHash,
    root: graph.source.root,
    antigravity_terminal: graph.source.antigravity_terminal,
    journey_terminal: validation.terminal,
    counts: validation.counts,
    outcomes: graph.source.outcomes.map((outcome) => ({ id: outcome.id, title: outcome.title, depends_on: outcome.depends_on }))
  };
  atomicWrite(GRAPH_PATH, `${graph.nodes.map((node) => JSON.stringify(node)).join("\n")}\n`);
  atomicWrite(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  atomicWrite(SUMMARY_PATH, renderSummary(index, validation));

  if (!existingState || resetState) {
    const runId = `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const state = {
      version: "1.0.0",
      run_id: runId,
      graph_hash: graph.graphHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audit_epoch: 0,
      consecutive_clean_professor_passes: 0,
      audit_snapshot_hash: null,
      audit_passes: {},
      consumed_gates: {},
      terminal_status: "GRAPH_READY_NOT_EXECUTED",
      default_status: "LOCKED",
      nodes: Object.fromEntries(graph.nodes.filter((node) => node.initial_status !== "LOCKED").map((node) => [node.id, {
        status: node.initial_status,
        actor: node.initial_status === "PASS" ? "approved-human-bootstrap" : null,
        reviewer: null,
        evidence: node.initial_status === "PASS" ? node.evidence_path : null,
        evidence_hash: node.initial_status === "PASS" && fs.existsSync(path.resolve(ROOT, node.evidence_path)) ? fileHash(path.resolve(ROOT, node.evidence_path)) : null,
        node_hash: node.node_hash,
        updated_at: new Date().toISOString()
      }]))
    };
    atomicWrite(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
    const runPath = path.join(RUNS, `${runId}.jsonl`);
    atomicWrite(runPath, `${JSON.stringify({ event: "RUN_CREATED", at: state.created_at, graph_hash: graph.graphHash, authority: graph.source.authority })}\n`);
  }
}

function renderSummary(index, validation) {
  const lines = [
    "# VAPOR Generated Graph Summary",
    "",
    `Generated: ${index.generated_at}`,
    `Graph hash: \`${index.graph_hash}\``,
    `Authority: \`${index.authority}\``,
    `Root: \`${index.root}\``,
    `Antigravity terminal: \`${index.antigravity_terminal}\``,
    `Overall post-Codex journey terminal: \`${index.journey_terminal}\``,
    "",
    "## Counts",
    "",
    `- Total nodes: ${index.counts.total}`,
    `- Atomic L4 leaves: ${index.counts.atomic_leaves}`,
    `- Minimum atomic leaves: ${readJson(SOURCE_PATH).minimum_atomic_leaves}`,
    "",
    "| Level | Count |",
    "|---|---:|",
    ...Object.entries(index.counts.by_level).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Outcome coverage",
    "",
    "| Outcome | Nodes | Title |",
    "|---|---:|---|",
    ...index.outcomes.map((outcome) => `| ${outcome.id} | ${index.counts.by_outcome[outcome.id] ?? 0} | ${outcome.title} |`),
    "",
    "## Validation",
    "",
    `- Errors: ${validation.errors.length}`,
    `- Warnings: ${validation.warnings.length}`,
    "- Generated nodes are immutable. Runtime transitions belong in `orchestration/state.json` and the append-only run log.",
    "- A node count is never completion evidence; every mandatory leaf still requires its own oracle and redacted evidence.",
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function loadGeneratedGraph() {
  if (!fs.existsSync(GRAPH_PATH)) throw new Error("Generated graph is missing. Run: node scripts/vapor-graph.mjs build");
  const nodes = fs.readFileSync(GRAPH_PATH, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const source = readJson(SOURCE_PATH);
  const roles = readJson(ROLES_PATH);
  const router = readJson(SKILLS_PATH);
  for (const node of nodes) {
    if (recomputeNodeHash(node) !== node.node_hash) throw new Error(`Generated node hash mismatch: ${node.id}`);
  }
  const graphHash = digest(nodes.map((node) => node.node_hash));
  if (fs.existsSync(INDEX_PATH) && readJson(INDEX_PATH).graph_hash !== graphHash) throw new Error("Generated graph/index hash mismatch");
  if (fs.existsSync(STATE_PATH) && readJson(STATE_PATH).graph_hash !== graphHash) throw new Error("Generated graph/state hash mismatch");
  return { source, roles, router, nodes, graphHash };
}

function inputsRegistry() {
  return readJson(INPUTS_PATH);
}

function approvalsStatus() {
  return readJson(APPROVALS_PATH).gates;
}

function approvalIsValid(gate, node, state) {
  if (!gate || gate.approved !== true) return false;
  if (!gate.approved_by || !gate.approval_evidence || !gate.approval_evidence_hash || !gate.scope_hash) return false;
  if (gate.node_id !== node.id || gate.graph_hash !== state.graph_hash) return false;
  if (state.consumed_gates?.[node.human_gate]) return false;
  const expiresAt = Date.parse(gate.expires_at ?? "");
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  const evidenceAbsolute = path.resolve(ROOT, gate.approval_evidence);
  if (!isWithin(evidenceAbsolute, path.resolve(ROOT, "docs", "EVIDENCE")) || !fs.existsSync(evidenceAbsolute)) return false;
  if (fileHash(evidenceAbsolute) !== gate.approval_evidence_hash) return false;
  const expectedScopeHash = digest({
    node_id: node.id,
    node_hash: node.node_hash,
    graph_hash: state.graph_hash,
    approved_by: gate.approved_by,
    expires_at: gate.expires_at,
    scope_details: gate.scope_details
  });
  if (gate.scope_hash !== expectedScopeHash) return false;
  return true;
}

function runtimeEntry(state, node) {
  return state.nodes[node.id] ?? {
    status: node.initial_status ?? state.default_status ?? "LOCKED",
    actor: null,
    reviewer: null,
    evidence: null,
    evidence_hash: null,
    node_hash: node.node_hash,
    updated_at: state.created_at
  };
}

function passIsFresh(state, node) {
  const runtime = runtimeEntry(state, node);
  if (runtime.status !== "PASS" || runtime.node_hash !== node.node_hash) return false;
  const evidenceAbsolute = path.resolve(ROOT, runtime.evidence ?? "");
  if (path.normalize(runtime.evidence ?? "") !== path.normalize(node.evidence_path)) return false;
  if (!isWithin(evidenceAbsolute, path.resolve(ROOT, "docs", "EVIDENCE")) || !fs.existsSync(evidenceAbsolute)) return false;
  return runtime.evidence_hash === fileHash(evidenceAbsolute);
}

function deriveReady(graph, state) {
  const inputRegistry = inputsRegistry();
  const inputMap = new Map(inputRegistry.items.map((item) => [item.name ?? item.id, item.status]));
  const approvals = approvalsStatus();
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const ready = [];
  for (const node of graph.nodes) {
    const current = runtimeEntry(state, node);
    if (!current || !["LOCKED", "READY", "WAITING_INPUT", "RETRYING", "FAILED_DIAGNOSIS", "FAIL", "REVALIDATE"].includes(current.status)) continue;
    const depsPass = node.depends_on.every((dependency) => {
      const dependencyNode = byId.get(dependency);
      return dependencyNode && passIsFresh(state, dependencyNode);
    });
    if (!depsPass) continue;
    const dynamicInputs = inputRegistry.items
      .filter((item) => item.dependent_nodes?.some((dependency) => node.id === dependency || node.id.startsWith(`${dependency}.`)))
      .map((item) => item.name ?? item.id);
    const inputsReady = [...new Set([...node.required_inputs, ...dynamicInputs])].every((input) => inputMap.get(input) === "VERIFIED");
    if (!inputsReady) continue;
    if (node.human_gate !== "NONE" && !approvalIsValid(approvals[node.human_gate], node, state)) continue;
    ready.push(node);
  }
  return ready.sort((a, b) => a.id.localeCompare(b.id));
}

function appendRunEvent(state, event) {
  ensureDirectories();
  const runPath = path.join(RUNS, `${state.run_id}.jsonl`);
  fs.appendFileSync(runPath, `${JSON.stringify(event)}\n`, "utf8");
}

function inputCommand(args) {
  const [action, name, ...rest] = args;
  const options = parseOptions(rest);
  const registry = readJson(INPUTS_PATH);
  const graph = loadGeneratedGraph();
  if (action === "list") {
    console.log(JSON.stringify(registry.items, null, 2));
    return;
  }
  if (!name) throw new Error("Usage: input add|set <NAME> [options] or input list");
  const existingIndex = registry.items.findIndex((item) => (item.name ?? item.id) === name);
  if (action === "add") {
    if (existingIndex >= 0) throw new Error(`Input already exists: ${name}`);
    for (const required of ["reason", "destination", "validation", "nodes"]) {
      if (!options[required]) throw new Error(`input add requires --${required}`);
    }
    const now = new Date().toISOString();
    const dependentNodes = String(options.nodes).split(",").map((item) => item.trim()).filter(Boolean);
    for (const dependency of dependentNodes) {
      if (!graph.nodes.some((node) => node.id === dependency || node.id.startsWith(`${dependency}.`))) throw new Error(`Unknown dependent node: ${dependency}`);
    }
    registry.items.push({
      id: `INPUT.${slug(name).toUpperCase()}`,
      name,
      reason: options.reason,
      secure_destination: options.destination,
      validation_method: options.validation,
      dependent_nodes: dependentNodes,
      status: "MISSING",
      created_at: now,
      updated_at: now,
      evidence: null
    });
    atomicWrite(INPUTS_PATH, `${JSON.stringify(registry, null, 2)}\n`);
    console.log(`Added missing input ${name} without storing a value.`);
    return;
  }
  if (action === "set") {
    if (existingIndex < 0) throw new Error(`Unknown input: ${name}`);
    const status = options.status;
    if (!registry.allowed_statuses.includes(status)) throw new Error(`Invalid input status: ${status}`);
    if (!options.actor) throw new Error("input set requires --actor");
    if (status === "VERIFIED" && !options.evidence) throw new Error("VERIFIED requires --evidence");
    let evidenceHash = registry.items[existingIndex].evidence_hash ?? null;
    if (status === "VERIFIED") {
      const evidenceAbsolute = path.resolve(ROOT, options.evidence);
      if (!isWithin(evidenceAbsolute, path.resolve(ROOT, "docs", "EVIDENCE")) || !fs.existsSync(evidenceAbsolute)) throw new Error("VERIFIED evidence must exist under docs/EVIDENCE");
      evidenceHash = fileHash(evidenceAbsolute);
    }
    registry.items[existingIndex] = {
      ...registry.items[existingIndex],
      status,
      updated_at: new Date().toISOString(),
      verified_by: options.actor,
      evidence: options.evidence ?? registry.items[existingIndex].evidence,
      evidence_hash: evidenceHash
    };
    atomicWrite(INPUTS_PATH, `${JSON.stringify(registry, null, 2)}\n`);
    console.log(`${name}: ${status}`);
    return;
  }
  throw new Error("Usage: input add|set <NAME> [options] or input list");
}

function approvalCommand(args) {
  const [action, target, ...rest] = args;
  const approvalsDocument = readJson(APPROVALS_PATH);
  const graph = loadGeneratedGraph();
  const state = readJson(STATE_PATH);
  if (action === "list") {
    console.log(JSON.stringify(approvalsDocument, null, 2));
    return;
  }
  if (action === "prepare") {
    const node = graph.nodes.find((candidate) => candidate.id === target);
    if (!node) throw new Error(`Unknown node: ${target}`);
    if (node.human_gate === "NONE") throw new Error(`${target} has no human gate`);
    const gate = approvalsDocument.gates[node.human_gate];
    const scopeHash = digest({
      node_id: node.id,
      node_hash: node.node_hash,
      graph_hash: state.graph_hash,
      approved_by: gate.approved_by,
      expires_at: gate.expires_at,
      scope_details: gate.scope_details
    });
    console.log(JSON.stringify({
      gate: node.human_gate,
      node_id: node.id,
      node_hash: node.node_hash,
      graph_hash: state.graph_hash,
      required_policy: approvalsDocument.policy,
      required_scope_details: gate.scope_details,
      expected_scope_hash_after_fields_are_final: scopeHash,
      approval_evidence_hash_required: true,
      instruction: "The human must explicitly approve this exact immutable scope. Do not place secret values in the approval receipt."
    }, null, 2));
    return;
  }
  throw new Error("Usage: approval list | approval prepare <node-id>. A valid gate is reserved and consumed atomically when its exact node enters RUNNING.");
}

function applyLifecycleHooks(state, node, nextStatus, evidence) {
  if (nextStatus === "RUNNING" && state.audit_snapshot_hash && !/^(G16|G17|G18|G19)(\.|$)/.test(node.id)) {
    state.audit_epoch += 1;
    state.audit_snapshot_hash = null;
    state.audit_passes = {};
    state.consecutive_clean_professor_passes = 0;
    state.terminal_status = "REPAIR_IN_PROGRESS";
  }
  if (nextStatus !== "PASS") return;
  const evidenceData = evidence && evidence.endsWith(".json") ? readJson(path.resolve(ROOT, evidence)) : {};
  if (node.id === "G15.COMPLETE") {
    if (!evidenceData.snapshot_hash) throw new Error("G15.COMPLETE evidence requires snapshot_hash");
    state.audit_epoch += 1;
    state.audit_snapshot_hash = evidenceData.snapshot_hash;
    state.audit_passes = {};
    state.consecutive_clean_professor_passes = 0;
    state.terminal_status = "PROFESSOR_AUDITS_RUNNING";
  }
  const passMap = { "G16.COMPLETE": "P1", "G17.COMPLETE": "P2", "G18.COMPLETE": "P3" };
  if (passMap[node.id]) {
    const expectedPass = passMap[node.id];
    if (evidenceData.verdict !== "PASS" || evidenceData.audit_pass !== expectedPass || evidenceData.snapshot_hash !== state.audit_snapshot_hash) {
      throw new Error(`${node.id} evidence must be ${expectedPass} PASS for the sealed audit snapshot`);
    }
    const requiredPrevious = expectedPass === "P2" ? ["P1"] : expectedPass === "P3" ? ["P1", "P2"] : [];
    if (!requiredPrevious.every((pass) => state.audit_passes?.[pass]?.snapshot_hash === state.audit_snapshot_hash)) throw new Error(`${node.id} prior professor passes are missing or snapshot-mismatched`);
    state.audit_passes ??= {};
    state.audit_passes[expectedPass] = { snapshot_hash: evidenceData.snapshot_hash, evidence, at: new Date().toISOString() };
    state.consecutive_clean_professor_passes = Object.keys(state.audit_passes).length;
  }
  if (node.id === "G19.COMPLETE") {
    if (state.consecutive_clean_professor_passes !== 3) throw new Error("G19 requires three consecutive clean professor passes");
    const unresolvedPreCodex = inputsRegistry().items.filter((item) => item.status !== "VERIFIED" && !(item.dependent_nodes ?? []).every((dependency) => dependency === "G20" || dependency.startsWith("G20.")));
    if (unresolvedPreCodex.length) throw new Error(`G19 has unresolved pre-Codex inputs: ${unresolvedPreCodex.map((item) => item.name).join(", ")}`);
    state.terminal_status = "READY_FOR_CODEX_INDEPENDENT_AUDIT";
  }
  if (node.id === "G20.COMPLETE") state.terminal_status = "SUBMISSION_JOURNEY_COMPLETE";
}

function transitionNodeUnlocked(args) {
  const [id, nextStatus] = args;
  if (!id || !nextStatus) throw new Error("Usage: transition <node-id> <status> --actor <id> [--reviewer <id>] [--evidence <path>]");
  if (!ALLOWED_STATUSES.has(nextStatus)) throw new Error(`Unknown status: ${nextStatus}`);
  const graph = loadGeneratedGraph();
  const state = readJson(STATE_PATH);
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  const options = parseOptions(args.slice(2));
  const actor = options.actor;
  const reviewer = options.reviewer ?? null;
  const evidence = options.evidence ?? null;
  if (!actor) throw new Error("Every transition requires --actor");
  const roleIds = new Set(graph.roles.roles.map((role) => role.id));
  if (!roleIds.has(actor)) throw new Error(`Unknown actor role: ${actor}`);

  const currentEntry = runtimeEntry(state, node);
  const currentStatus = currentEntry.status;
  const allowed = {
    LOCKED: ["RUNNING", "WAITING_INPUT", "FAIL"],
    READY: ["RUNNING", "WAITING_INPUT", "FAIL"],
    RUNNING: ["VERIFYING", "WAITING_INPUT", "RETRYING", "FAILED_DIAGNOSIS", "FAIL"],
    RETRYING: ["RUNNING", "FAILED_DIAGNOSIS", "FAIL"],
    FAILED_DIAGNOSIS: ["RUNNING", "WAITING_INPUT", "FAIL"],
    VERIFYING: ["PASS", "FAILED_DIAGNOSIS", "FAIL", "REVALIDATE"],
    FAIL: ["FAILED_DIAGNOSIS", "RUNNING"],
    WAITING_INPUT: ["RUNNING", "FAIL"],
    REVALIDATE: ["RUNNING", "WAITING_INPUT", "FAIL"],
    PASS: ["REVALIDATE"]
  };
  if (!allowed[currentStatus]?.includes(nextStatus)) throw new Error(`Invalid transition ${currentStatus} -> ${nextStatus} for ${id}`);

  if (nextStatus === "RUNNING") {
    if (actor !== node.owner_role) throw new Error(`RUNNING actor must match node owner role ${node.owner_role}`);
    const readyIds = new Set(deriveReady(graph, state).map((item) => item.id));
    if (!readyIds.has(id)) {
      throw new Error(`${id} is not dependency/input/gate ready`);
    }
  }
  if (nextStatus === "VERIFYING" && !evidence) throw new Error("VERIFYING requires --evidence");
  if (nextStatus === "PASS") {
    if (!evidence || !reviewer) throw new Error("PASS requires --evidence and --reviewer");
    if (!roleIds.has(reviewer)) throw new Error(`Unknown reviewer role: ${reviewer}`);
    if (reviewer === actor || reviewer === currentEntry.implementer) throw new Error("Implementer/actor cannot approve the same node");
    const evidenceAbsolute = path.resolve(ROOT, evidence);
    const evidenceRoot = path.resolve(ROOT, "docs", "EVIDENCE");
    if (!isWithin(evidenceAbsolute, evidenceRoot) || !fs.existsSync(evidenceAbsolute)) throw new Error("PASS evidence must exist under docs/EVIDENCE");
    if (path.normalize(evidence) !== path.normalize(node.evidence_path)) throw new Error(`PASS evidence must use the node evidence path ${node.evidence_path}`);
  }

  const now = new Date().toISOString();
  const evidenceHash = evidence && fs.existsSync(path.resolve(ROOT, evidence))
    ? crypto.createHash("sha256").update(fs.readFileSync(path.resolve(ROOT, evidence))).digest("hex")
    : null;
  const previous = { ...currentEntry };
  const consumedGate = nextStatus === "RUNNING" && node.human_gate !== "NONE" ? node.human_gate : null;
  if (consumedGate) {
    state.consumed_gates ??= {};
    state.consumed_gates[consumedGate] = { node_id: node.id, at: now, actor, scope_hash: approvalsStatus()[consumedGate].scope_hash };
  }
  state.nodes[id] = {
    ...currentEntry,
    status: nextStatus,
    actor,
    implementer: currentEntry.implementer ?? (nextStatus === "RUNNING" ? actor : null),
    reviewer,
    evidence,
    evidence_hash: evidenceHash,
    node_hash: node.node_hash,
    updated_at: now
  };
  applyLifecycleHooks(state, node, nextStatus, evidence);
  state.updated_at = now;
  appendRunEvent(state, { event: "NODE_TRANSITION", at: now, node_id: id, from: previous.status, to: nextStatus, actor, reviewer, evidence, evidence_hash: evidenceHash, node_hash: node.node_hash, human_gate_consumed: consumedGate });
  atomicWrite(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
  console.log(`${id}: ${previous.status} -> ${nextStatus}`);
}

function transitionNode(args) {
  return withControlLock(() => transitionNodeUnlocked(args));
}

function parseOptions(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = args[index + 1] && !args[index + 1].startsWith("--") ? args[++index] : true;
    result[key] = value;
  }
  return result;
}

function printReady(limit) {
  const graph = loadGeneratedGraph();
  const state = readJson(STATE_PATH);
  const ready = deriveReady(graph, state).slice(0, limit);
  for (const node of ready) {
    console.log(`${node.id}\t${node.owner_role}\t${node.kind}\t${node.title}`);
  }
  console.log(`READY ${ready.length} shown (limit ${limit})`);
}

function printContext(id) {
  const graph = loadGeneratedGraph();
  const state = readJson(STATE_PATH);
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  const byId = new Map(graph.nodes.map((candidate) => [candidate.id, candidate]));
  const dependencies = node.depends_on.map((dependency) => {
    const dependencyNode = byId.get(dependency);
    const runtime = dependencyNode ? runtimeEntry(state, dependencyNode) : null;
    return { id: dependency, status: runtime?.status, evidence: runtime?.evidence };
  });
  console.log(JSON.stringify({ node, runtime: runtimeEntry(state, node), dependencies }, null, 2));
}

function printSummary() {
  if (!fs.existsSync(INDEX_PATH)) throw new Error("Graph index missing. Run build first.");
  const index = readJson(INDEX_PATH);
  const state = readJson(STATE_PATH);
  const graph = loadGeneratedGraph();
  const statusCounts = {};
  for (const node of graph.nodes) {
    const entry = runtimeEntry(state, node);
    statusCounts[entry.status] = (statusCounts[entry.status] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    graph_hash: index.graph_hash,
    total_nodes: index.counts.total,
    atomic_leaves: index.counts.atomic_leaves,
    run_id: state.run_id,
    terminal_status: state.terminal_status,
    audit_epoch: state.audit_epoch,
    consecutive_clean_professor_passes: state.consecutive_clean_professor_passes,
    status_counts: statusCounts
  }, null, 2));
}

function commandBuild(options) {
  withControlLock(() => {
    const graph = buildGraph();
    const validation = validateGraph(graph);
    if (validation.errors.length) throw new Error(validation.errors.join("\n"));
    writeGraph(graph, validation, options.resetState === true);
    console.log(`Built ${validation.counts.total} nodes with ${validation.counts.atomic_leaves} atomic leaves.`);
    console.log(`Graph hash: ${graph.graphHash}`);
  });
}

function commandValidate() {
  const fresh = buildGraph();
  const validation = validateGraph(fresh);
  if (fs.existsSync(GRAPH_PATH)) {
    const generated = loadGeneratedGraph();
    if (generated.graphHash !== fresh.graphHash) validation.errors.push("Generated graph differs from fresh authoritative expansion");
  }
  console.log(JSON.stringify(validation, null, 2));
  if (validation.errors.length) process.exitCode = 1;
}

function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  const options = parseOptions(args);
  if (command === "build") return commandBuild(options);
  if (command === "validate") return commandValidate();
  if (command === "summary") return printSummary();
  if (command === "ready") return printReady(Number(options.limit ?? 25));
  if (command === "context") return printContext(args[0]);
  if (command === "transition") return transitionNode(args);
  if (command === "input") return args[0] === "list" ? inputCommand(args) : withControlLock(() => inputCommand(args));
  if (command === "approval") return approvalCommand(args);
  console.log([
    "VAPOR graph control",
    "  build [--reset-state]",
    "  validate",
    "  summary",
    "  ready [--limit 25]",
    "  context <node-id>",
    "  transition <node-id> <status> --actor <id> [--reviewer <id>] [--evidence <path>]",
    "  input list",
    "  input add <NAME> --reason <text> --destination <secure-location> --validation <safe-check> --nodes <id,id>",
    "  input set <NAME> --status <status> --actor <id> [--evidence <path>]",
    "  approval list",
    "  approval prepare <gated-node-id>"
  ].join("\n"));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

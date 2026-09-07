# Sophie/QDB v0 — minimum production path

This path is intentionally narrow. It does **not** add a dashboard, CRM, follow-up automation, reconciliation engine, or next-session brief.

## Locked execution contract

```text
permitted interaction
→ n8n HTTP execution
→ POST /api/qdb-ingest
→ raw interaction persisted in Supabase
→ provenance-bounded extraction
→ deterministic state projection
→ atomic extraction/state persistence
→ operator-reviewable JSON output
```

The attached workflow contract requires a reconstructable chain and forbids treating synthetic data as real workflow evidence. This implementation stops at the first operator-reviewable output; follow-up, reconciliation, and next-session brief remain blocked until the real workflow earns them.

## 1. Apply the private Supabase schema

Run `supabase/qdb-v0.sql` in the private Supabase project.

The tables have RLS enabled and no `anon` / `authenticated` policies. The server uses `SUPABASE_SERVICE_ROLE_KEY`; never expose that key to the browser or n8n logs.

## 2. Configure server secrets

```text
QDB_INGEST_TOKEN=<high-entropy shared secret used only by n8n>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
OPENAI_API_KEY=<server-only model key>
QDB_OPENAI_MODEL=gpt-5.6-sol
QDB_OPENAI_REASONING_EFFORT=medium
QDB_OPENAI_MAX_OUTPUT_TOKENS=3000
```

## 3. n8n ingest node

Use one HTTP Request node after the permitted interaction is normalized.

**Method** `POST`

**URL**

```text
https://<impactwithtaha-deployment>/api/qdb-ingest
```

**Header**

```text
Authorization: Bearer <QDB_INGEST_TOKEN>
Content-Type: application/json
```

**Body**

```json
{
  "interaction_id": "case_01_session_01",
  "case_id": "case_01",
  "advisor_id": "advisor_01",
  "occurred_at": "2026-09-08T09:00:00+03:00",
  "source_type": "advisory_notes",
  "source_text": "<permitted private interaction text>",
  "source_ref": "private://qdb/case_01/session_01",
  "n8n_execution_id": "{{$execution.id}}",
  "permission": {
    "permitted": true,
    "basis": "advisor-provided for workflow validation"
  }
}
```

Use pseudonymous IDs. Do not place founder names, emails, phone numbers, financing details, or credentials in public receipts.

## 4. Success response

A `200` response returns:

- stable `interaction_id` / `case_id`;
- source SHA-256;
- n8n execution ID;
- extraction items;
- exact source quote + server-derived source offsets for every item;
- deterministic state projection;
- Supabase RPC receipt;
- explicit claim boundary.

The operator should review `extraction.items` and `state`. A real correction/use event is the next external receipt; the API response itself is still self-created technical evidence.

## Failure behavior

- missing/invalid ingest token → `401`;
- interaction not explicitly permitted → `403`;
- malformed input or source hash mismatch → `400`;
- raw Supabase persistence failure → `502`, extraction does not run;
- model/extraction failure after source persistence → failure response with `source_persisted: true`;
- extraction quote not present verbatim in source → `422`, state is not applied;
- atomic extraction/state RPC failure → `502`, raw source remains preserved.

## Receipt chain for the first real execution

Save privately:

```text
source artifact/ref
→ n8n execution ID
→ qdb_interactions.interaction_id + source_sha256
→ qdb_extractions rows
→ qdb_state_snapshots row
→ exact API response shown to the operator
→ Sophie correction / confirmation / rejection
```

Do not call the v0 externally used until Sophie actually inspects, corrects, or uses the output.

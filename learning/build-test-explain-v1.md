# Build, Test, Explain
## A beginner’s workbook for making reliable projects
**Open educational edition 1.0 · October 2026**
**Readers:** students, beginner builders, educators and adults. Suggested ages 13+; younger learners with guidance.

## About
This free workbook teaches beginners to turn vague problems into observable steps, test their work, explain mistakes, and complete a small independent project. No programming experience required. Read one chapter, attempt the exercise, review the example answer, then solve a variation without hints.

## Learning goals
- Identify inputs, repeatable steps and observable outputs.
- Separate observations from unverified hypotheses.
- Test normal, missing, duplicate and interrupted cases.
- Explain a task to another person and observe independent use.
- Keep source-aware notes on failures and limitations.

## 1. A workflow is a promise

A workflow moves an input through repeatable steps to an observable output. Replace vague aims such as “be productive” with verifiable ones such as “answer three questions with checked examples.”

**Try it:** Write a bag-packing workflow: input, three steps, output and a check.

**Example answer / check:** Read the timetable, select books, collect supplies and check everything against the timetable.

## 2. Separate observations from guesses

“Submitting a blank name produced an error” is an observation. “The server is broken” is a hypothesis. Hypotheses may be useful, but never become proof until tested.

**Try it:** Label these: (a) No confirmation appeared. (b) The network probably disconnected. (c) The error recurred twice.

**Example answer / check:** (a) Observation; (b) hypothesis; (c) observation only if both attempts were recorded.

## 3. Make the first step smaller

Replace projects with reversible experiments. Instead of building a tutoring platform, give one learner a ten-minute worksheet and observe where they get stuck. An unsuccessful trial still teaches you something.

**Try it:** Turn “learn programming” into a 15-minute test with visible output and a failure condition.

**Example answer / check:** Write a function that adds two integers; input 2 and 3, expect 5; investigate if the result differs.

## 4. Test normal and hostile cases

A system working once is not enough. Test valid, empty, duplicate, and interrupted actions. Write what should happen before trying each case. Protect people and their information.

**Try it:** Design normal, duplicate and missed-reminder checks for a homework reminder.

**Example answer / check:** One reminder appears on time; duplicate setup does not create two; a missed reminder does not make the task impossible to find.

## 5. Keep a recovery note

A useful recovery record describes the state before an action, what was attempted, what happened, and the safest next test. Never include passwords or private customer details.

**Try it:** Fill in: “I tried __; expected __; saw __; next I will test __.”

**Example answer / check:** A good answer names an observable difference and one action that can distinguish competing explanations.

## 6. Explain it to someone new

Explain the goal, demonstrate one example, invite a similar attempt, and then remove the cues. Repeating your words is not the same as independently solving a new problem.

**Try it:** Teach someone how to verify a saved file, then give an independent task.

**Example answer / check:** Show how to save and reopen one file; ask the learner to save a different file and verify its contents without hints.

## 7. Turn a mistake into a lesson

Compare expectation and result, test plausible causes, change the method and retest. Do not pretend every failure has one obvious cause.

**Try it:** Describe a repeated task that has not improved. Which feedback signal is missing?

**Example answer / check:** For generic job applications, track eligibility, proof quality and submission receipts rather than assuming that sending volume implies progress.

## 8. The independent project

Choose an actual problem, speak with someone affected, build a tiny aid, test independent use and record its limits. Success requires observable use, not your confidence.

**Try it:** Complete USER, PROBLEM, INPUT, STEPS, OUTPUT, TEST, OBSERVED RESULT, LIMITATION, NEXT CHANGE.

**Example answer / check:** Strong submissions contain a real attempt, observed results and a revision supported by evidence.

## Quick self-check
1. Name an observable output for your current project.
2. Identify a claim that is only a hypothesis.
3. Name one unusual input that could break your workflow.
4. Can another person reproduce the process without your help?
5. What did the last real test show?

## Seven-day practice
**Day 1:** Set one observable goal.
**Day 2:** Write inputs, steps and a check.
**Day 3:** Distinguish observation from hypothesis.
**Day 4:** Test a hostile or missing input.
**Day 5:** Document one failure and recovery step.
**Day 6:** Teach the process to someone, then remove cues.
**Day 7:** Revise one part based on the observed result.

## Facilitation notes
Ask learners to predict test outcomes before running tests, retrieve explanations from memory, and independently attempt a transfer task. Evaluate actual work and not merely confidence or polished language. Use paper exercises for younger learners; never share sensitive information.

## Source, limitations and reuse
Original educational adaptation of workflow reliability, evidence grading, recovery and externalization practices from the Taha-owned REF/Logistinfra working collection (October 2026). This is not a claim that technical prototypes are paid customer deployments. Educational effectiveness has not been independently tested. Examples are teaching scenarios. Copyright 2026; free educational and classroom sharing with attribution.
# Debug Like a Detective

**A free REF learning mini-workbook | October 2026 | Reader edition 1.0**
**Audience:** Beginning programmers and students, 13+
**Learning outcome:** Describe, reproduce, isolate and retest a small error.

## How to use this book
Read the short explanation, attempt its practice before checking the worked answer, then change the example and repeat from memory.

## 1. Name the mismatch

An error report needs the actual input, expected output and observed output. “It is broken” cannot be reproduced.

**Your practice:** A calculator shows 23 for inputs 2 and 3. Write the bug report.

**Worked example / answer check:** Input 2 and 3; expected 5; actual 23. String joining is one hypothesis, not yet the confirmed cause.

**Transfer:** Try a new case from a different topic, without copying the example; write down what you checked.

## 2. Change one variable

If several inputs or lines change simultaneously, you cannot tell what fixed the problem. Compare controlled cases.

**Your practice:** Which second input can help distinguish arithmetic from string joining?

**Worked example / answer check:** Try 10 and 5: arithmetic gives 15; joining gives 105.

**Transfer:** Try a new case from a different topic, without copying the example; write down what you checked.

## 3. Test edge cases

Try normal, empty, duplicate and interrupted actions, safely and only in systems you are authorized to test.

**Your practice:** What should a blank-name form and repeated submission do?

**Worked example / answer check:** Give a clear blank-field message; avoid creating unwanted duplicate records.

**Transfer:** Try a new case from a different topic, without copying the example; write down what you checked.

## 4. Confirm the correction

A fix needs the original failing test and a regression check. Write what changed, then test a normal case again.

**Your practice:** Fill in BEFORE, CHANGE, AFTER, REGRESSION, RISK.

**Worked example / answer check:** Before blank names saved; reject blanks; blank gets a message; valid names still save; spaces-only input remains untested.

**Transfer:** Try a new case from a different topic, without copying the example; write down what you checked.

## Independent challenge
Debug a paper algorithm or toy program with three tests and a short before/after report.

Use this evidence card: **before / action / expected / observed / one limitation / next test**.

## Five-day practice
- Day 1: Try lesson one before reading its example answer.
- Day 2: Recall the core idea with notes closed; check and correct.
- Day 3: Try another lesson with a changed example.
- Day 4: Complete the independent challenge.
- Day 5: Show the result to a suitable reviewer and revise one step based on real feedback.

## Source, privacy and evidence
This is an original, public-safe educational adaptation of methods discussed in Taha-owned REF/Logistinfra work (October 2026). Examples are illustrative. No private transcripts or customer data are reproduced. Publication does not prove that learners improved or that any product achieved adoption or revenue. Never share sensitive information during exercises.

**Companion workbook:** [Build, Test, Explain](./build-test-explain-v1.md).

**Feedback request:** Which practice task did you attempt, and could you complete a different example without hints?

**Reuse:** Free educational sharing with attribution.
# CSARCH2-G8-MCO1 — Decimal 32-bit Floating-Point Machine 

An interactive simulator for IEEE-754 decimal single-precision conversions, rounding modes, and step-by-step subtraction & division arithmetic.

**CSARCH2 Group 8 - Machine 4 Assigned**

## Links
 
- **Live Deployment:** [IEEE-754 Decimal32](https://k-k-r-c.github.io/CSARCH2-G8-MCO1/?fbclid=IwY2xjawTeyQxwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMTFjQk1BUWM0OWNEZ1RuTWRzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeudh6d01qIOjKbCvJNOa3BKQhOvBDK4Imwky9JP-mj-nNFMZZNZIolYGfdtg_aem_200ViHRhrqxyBqnZhxg08w)
- **Video Walkthrough (YouTube):** [Add demo video link here] ()
- **GitHub Repository:** [Repo Link](https://github.com/K-K-R-C/CSARCH2-G8-MCO1)

## Overview
 
This project implements **Machine 4: Decimal 32-bit Floating-Point Machine**, simulating IEEE 754 decimal single-precision operations through three interactive modules: **conversion, rounding, and arithmetic.**


## Contributors
 
- **BENDOL, Trisha Mae R.** - Converter Engine
- **CAMATO, Karl Kristoffer R.** - Rounding Engine
- **DESCALZO, Alberto Miguel T.** - Special Cases + Shared Utilities + App Shell
- **GREGORIO, John Marc Joepherl M.** - Arithmetic Engine: Subtraction
- **MARTIN, Kurt Nehemiah Z.** - Arithmetic Engine: Division

---
### Module 1: Converter Engine
Converts decimal numbers into IEEE 754 decimal 32-bit single-precision binary and hexadecimal representations, with special case detection.
 
- Decimal parsing & sign extraction
- Exponent and coefficient extraction
- Binary & hexadecimal output
- Decode-back verification
- Handles special cases: NaN, ±Infinity, ±0, overflow, underflow

**Input:** A decimal number.

**Output:** IEEE 754 decimal single-precision representation in (i) binary with proper spacing, and (ii) hexadecimal.

### Module 2: Rounding Engine
Demonstrates four IEEE 754 rounding algorithms on decimal or binary input, for any target digit count.
 
- Chopping (truncation)
- Round-up (+infinity)
- Round-down (-infinity)
- Round-to-nearest, ties-to-even

**Input:** A number in decimal or binary format, and the target number of digits to round to.

**Output:** Rounded results using all four methods.

### Module 3: Arithmetic Engine
Executes subtraction and division on IEEE 754 single-precision operands with a full step-by-step trace.
 
- Operand normalization & exponent alignment
- Significand subtraction & division
- Division-by-zero handling
- Step-by-step trace visualization

**Input:** Operands in decimal or IEEE hexadecimal format, and the operation type (subtraction or division)

**Output:** Step-by-step solution and final result (including special cases) in decimal, binary (with proper spacing), and hexadecimal

## Test Cases & Screenshots
Screenshots covering all specification cases (normal, special, and edge cases) for each module are available in the PDF uploaded in the repo.

## Tech Stack
 
- **React 19**
- **Vite 8**
- **TypeScript**

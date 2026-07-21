---
name: Undeclared Low Contrast Fixture
colors:
  primary: "#1f5f55"
  surface: "#ffffff"
typography:
  body:
    fontFamily: Arial
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
components:
  primary-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
---

## Overview

Fixture proving that populated-state colors absent from component token pairs are outside the linter's evidence.

## Colors

Implementation-only muted copy may still use `#aaaaaa` on white, but that pair is intentionally absent from the token contract.

## Typography

Body copy uses the declared body token.

## Components

Only the conforming primary button pair is declared.

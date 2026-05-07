# AI Quickstart (30 Seconds)

This is the fastest path to build and validate the AI module.

## 1) Build

```sh
make build
```

Output:

1. Windows: ai.dll
2. Linux: libai.so

## 2) Run Tests

```sh
make test
```

This builds the DLL and runs the full AI test suite.

## 3) Most Important Files

1. ai.lpr
2. uai_runtime.pas
3. uai_adapter.pas
4. uai_planning_core.pas
5. ubeam_api.pas
6. tests/ai_tests.lpr

## 4) Safety Rule

If anything is invalid or unsafe, AI must return a neutral command:

1. action = apNone
2. move = amNone

## 5) Continue Reading

For the full architecture, test strategy, and deep-dive details, see:

1. README.md

# AI Module

This folder contains the Pascal AI module for FPC Atomic Bomberman and its FPCUnit tests.

## Requirements

- GNU Make or a compatible `make` implementation
- Free Pascal Compiler (`fpc`)

On Windows, the Makefile uses the configured Lazarus/FPC path by default.
If needed, you can override it explicitly:

```powershell
make FPC=C:/path/to/fpc.exe build
```

On Linux, the Makefile uses `fpc` from the current `PATH` by default.

## Available Make Targets

### Build the AI library

Build the AI shared library only:

```sh
make build
```

This creates:

- `ai.dll` on Windows
- `libai.so` on Linux

### Build and run the tests

Compile the test executable and run the full test suite:

```sh
make test
```

This target also builds the AI library first.

### Run the default workflow

Run the default target, which builds the library and then runs the tests:

```sh
make
```

This is equivalent to:

```sh
make all
```

### Clean generated files

Remove generated binaries, object files, unit files, and the test build directory:

```sh
make clean
```

## Test Output

The test executable is generated in the `tests` directory.
Temporary test compilation output is written to `tests/build`.
#(******************************************************************************)
#(*                                                                            *)
#(* Author      : GitHub Copilot                                               *)
#(*                                                                            *)
#(* This file is part of FPC_Atomic                                            *)
#(*                                                                            *)
#(*  See the file license.md, located under:                                   *)
#(*  https://github.com/PascalCorpsman/Software_Licenses/blob/main/license.md  *)
#(*  for details about the license.                                            *)
#(*                                                                            *)
#(*               It is not allowed to change or remove this text from any     *)
#(*               source file of the project.                                  *)
#(*                                                                            *)
#(******************************************************************************)

ifeq ($(OS),Windows_NT)
FPC ?= fpc.exe
LIB_TARGET = ai.dll
TEST_EXE = tests/ai_tests.exe
BUILD_COMMAND = powershell -NoProfile -Command "$$ErrorActionPreference = 'Stop'; & '$(FPC)' ai.lpr '-Fu../server' '-Fu../units'"
TEST_COMMAND = powershell -NoProfile -Command "$$ErrorActionPreference = 'Stop'; New-Item -ItemType Directory -Path '$(TEST_BUILD_DIR)' -Force | Out-Null; Set-Location '$(TEST_DIR)'; & '$(FPC)' ai_tests.lpr '-Fu..' '-Fu../../server' '-Fu../../units' '-FUbuild' '-FE.'; & '.\\ai_tests.exe' --all --format=plain"
CLEAN_COMMAND = powershell -NoProfile -Command "$$ErrorActionPreference = 'Stop'; $$paths = @('$(LIB_TARGET)', 'ai.o', 'uatomicai.o', 'uatomicai.ppu', '$(TEST_EXE)', '$(TEST_DIR)/ai_tests.o', '$(TEST_DIR)/test_uatomicai_basic.o', '$(TEST_DIR)/test_uatomicai_basic.ppu'); foreach ($$path in $$paths) { if (Test-Path $$path) { Remove-Item $$path -Force } }; if (Test-Path '$(TEST_BUILD_DIR)') { Remove-Item '$(TEST_BUILD_DIR)' -Recurse -Force }"
else
FPC ?= fpc
LIB_TARGET = libai.so
TEST_EXE = tests/ai_tests
BUILD_COMMAND = "$(FPC)" ai.lpr -Fu../server -Fu../units
TEST_COMMAND = mkdir -p "$(TEST_BUILD_DIR)" && cd "$(TEST_DIR)" && "$(FPC)" ai_tests.lpr -Fu.. -Fu../../server -Fu../../units -FUbuild -FE. && ./ai_tests --all --format=plain
CLEAN_COMMAND = rm -f "$(LIB_TARGET)" ai.o uatomicai.o uatomicai.ppu "$(TEST_EXE)" "$(TEST_DIR)/ai_tests.o" "$(TEST_DIR)/test_uatomicai_basic.o" "$(TEST_DIR)/test_uatomicai_basic.ppu" && rm -rf "$(TEST_BUILD_DIR)"
endif

PROJECT_DIR = .
TEST_DIR = tests
TEST_BUILD_DIR = $(TEST_DIR)/build

.PHONY: all build test clean

all: build test

build:
	$(BUILD_COMMAND)

test: build
	$(TEST_COMMAND)

clean:
	$(CLEAN_COMMAND)
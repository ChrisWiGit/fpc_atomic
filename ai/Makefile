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
CLEAN_COMMAND = powershell -NoProfile -Command "$$ErrorActionPreference = 'Stop'; $$paths = @('$(LIB_TARGET)', 'ai.o', 'uatomicai.o', 'uatomicai.ppu', 'uai_adapter.o', 'uai_adapter.ppu', 'uai_agent.o', 'uai_agent.ppu', 'uai_planning_core.o', 'uai_planning_core.ppu', 'uai_runtime.o', 'uai_runtime.ppu', 'uai_safecommand.o', 'uai_safecommand.ppu', 'uai_version.o', 'uai_version.ppu', 'ubeam_types.o', 'ubeam_types.ppu', 'ubeam_config_profiles.o', 'ubeam_config_profiles.ppu', 'ubeam_tactical_filters.o', 'ubeam_tactical_filters.ppu', 'ubeam_opponent_model.o', 'ubeam_opponent_model.ppu', 'ubeam_search_core.o', 'ubeam_search_core.ppu', 'ubeam_api.o', 'ubeam_api.ppu', '$(TEST_EXE)', '$(TEST_DIR)/ai_tests.o', '$(TEST_DIR)/test_uatomicai_basic.o', '$(TEST_DIR)/test_uatomicai_basic.ppu', '$(TEST_DIR)/test_uai_runtime_contract.o', '$(TEST_DIR)/test_uai_runtime_contract.ppu', '$(TEST_DIR)/test_ubeam_api_basic.o', '$(TEST_DIR)/test_ubeam_api_basic.ppu', '$(TEST_DIR)/test_uai_adapter_mapping.o', '$(TEST_DIR)/test_uai_adapter_mapping.ppu', 'ubeam_move_types.o', 'ubeam_move_types.ppu', 'ubeam_move_rules.o', 'ubeam_move_rules.ppu', 'ubeam_move_collision.o', 'ubeam_move_collision.ppu', 'ubeam_move_transition.o', 'ubeam_move_transition.ppu', 'ubeam_move_integrator.o', 'ubeam_move_integrator.ppu', '$(TEST_DIR)/test_ubeam_movement.o', '$(TEST_DIR)/test_ubeam_movement.ppu', 'ubeam_irandom.o', 'ubeam_irandom.ppu', 'ubeam_candidates.o', 'ubeam_candidates.ppu', 'ubeam_simulator.o', 'ubeam_simulator.ppu', 'ubeam_scorer.o', 'ubeam_scorer.ppu', '$(TEST_DIR)/test_ubeam_search.o', '$(TEST_DIR)/test_ubeam_search.ppu', '$(TEST_DIR)/test_dll_contract_exports.o', '$(TEST_DIR)/test_dll_contract_exports.ppu', '$(TEST_DIR)/test_replay_golden_format.o', '$(TEST_DIR)/test_replay_golden_format.ppu'); foreach ($$path in $$paths) { if (Test-Path $$path) { Remove-Item $$path -Force } }; if (Test-Path '$(TEST_BUILD_DIR)') { Remove-Item '$(TEST_BUILD_DIR)' -Recurse -Force }"
else
FPC ?= fpc
LIB_TARGET = libai.so
TEST_EXE = tests/ai_tests
BUILD_COMMAND = "$(FPC)" ai.lpr -Fu../server -Fu../units
TEST_COMMAND = mkdir -p "$(TEST_BUILD_DIR)" && cd "$(TEST_DIR)" && "$(FPC)" ai_tests.lpr -Fu.. -Fu../../server -Fu../../units -FUbuild -FE. && ./ai_tests --all --format=plain
CLEAN_COMMAND = rm -f "$(LIB_TARGET)" ai.o uatomicai.o uatomicai.ppu uai_adapter.o uai_adapter.ppu uai_agent.o uai_agent.ppu uai_planning_core.o uai_planning_core.ppu uai_runtime.o uai_runtime.ppu uai_safecommand.o uai_safecommand.ppu uai_version.o uai_version.ppu ubeam_types.o ubeam_types.ppu ubeam_config_profiles.o ubeam_config_profiles.ppu ubeam_tactical_filters.o ubeam_tactical_filters.ppu ubeam_opponent_model.o ubeam_opponent_model.ppu ubeam_search_core.o ubeam_search_core.ppu ubeam_api.o ubeam_api.ppu "$(TEST_EXE)" "$(TEST_DIR)/ai_tests.o" "$(TEST_DIR)/test_uatomicai_basic.o" "$(TEST_DIR)/test_uatomicai_basic.ppu" "$(TEST_DIR)/test_uai_runtime_contract.o" "$(TEST_DIR)/test_uai_runtime_contract.ppu" "$(TEST_DIR)/test_ubeam_api_basic.o" "$(TEST_DIR)/test_ubeam_api_basic.ppu" "$(TEST_DIR)/test_uai_adapter_mapping.o" "$(TEST_DIR)/test_uai_adapter_mapping.ppu" ubeam_move_types.o ubeam_move_types.ppu ubeam_move_rules.o ubeam_move_rules.ppu ubeam_move_collision.o ubeam_move_collision.ppu ubeam_move_transition.o ubeam_move_transition.ppu ubeam_move_integrator.o ubeam_move_integrator.ppu "$(TEST_DIR)/test_ubeam_movement.o" "$(TEST_DIR)/test_ubeam_movement.ppu" ubeam_irandom.o ubeam_irandom.ppu ubeam_candidates.o ubeam_candidates.ppu ubeam_simulator.o ubeam_simulator.ppu ubeam_scorer.o ubeam_scorer.ppu "$(TEST_DIR)/test_ubeam_search.o" "$(TEST_DIR)/test_ubeam_search.ppu" "$(TEST_DIR)/test_dll_contract_exports.o" "$(TEST_DIR)/test_dll_contract_exports.ppu" "$(TEST_DIR)/test_replay_golden_format.o" "$(TEST_DIR)/test_replay_golden_format.ppu" && rm -rf "$(TEST_BUILD_DIR)"
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
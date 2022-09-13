# Makefile is the friend of all programmers. :D

all: setup check index

setup:
	@which pnpm > /dev/null || curl -fsSL https://get.pnpm.io/install.sh | sh -
	@cd actions && pnpm install

index: setup
	@cd actions && pnpm run -s index

check: setup
	@cd actions && pnpm run -s check

.PHONY: all setup index check

# @nebula.js/cli-validate

Validation command for nebula.js extensions.

## Usage

nebula validate

Runs these steps by default:

- static analysis checks
- smoke render with mocked engine and onRender assertion

## Options

- --cwd <path>: Project directory to validate
- --entry <path>: Visualization entry file override
- --type <name>: Visualization type for smoke fixture
- --steps <list>: Comma separated subset of static,smoke
- --smokeTimeout <ms>: Timeout for smoke step
- --dataProfile <auto|mekko>: Mock data profile for fixture generation
- --reportFile <path>: Write JSON report to file

## Examples

Validate current extension using all steps:

nebula validate

Run static + smoke only:

nebula validate --steps static,smoke

Validate another repository and save report:

nebula validate --cwd ../sn-image --reportFile validation-report.json

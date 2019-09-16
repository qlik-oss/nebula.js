---
id: create
title: Create
---

Use the `create` command to scaffold a Supernova. You can then cd into the folder created and start developing.

```shell
nebula create <name>
```

| Positionals  | Description                            | Type     |
|--------------|--------------------------------|----------|
| name         |  Name of the project           | [string] [required]|

| Options      |  Description                       | Type     |     
| ------------ | -----------------------------------|--------- |
| `--version`  | Show version number                | [boolean]|
| `--install`  | Run package installation step      | [boolean] [default: true] |
| `--pkgm`     | Package Manager                    | [string] [choices: "npm", "yarn"] |
| `--output`   |  Output directory of Extension     | [string] |
| `-h, --help` | Show help                          | [boolean]|

### Example
```shell
nebula create hello-sunshine
```
# Nebula Development Mashup example

Example mashup for nebula development

## Install

To use a local nebula version, run this in the stardust folder to allow linking your local version.

```
yarn link
```

Update dependencies and link nebula

```
yarn
yarn link "@nebula.js/stardust"
```

## Run

Run parcel server

```
yarn start
```

Open you browser to http://localhost:1234

## Making local changes

The gitignore is setup to exclude a folder named `local-dev` in the root of this repository. So to make local changes to the mashup you can create that folder and copy all files into it.

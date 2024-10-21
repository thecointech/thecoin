## internationalization.

We use formatjs/react-intl to support multi-lingual.

### Basic setup

Projects need to setup `ts-transformer` or equivalent in their webpack/babel setup.

Typescript needs to be patched using `ts-patch`.  Currently this is achieved
with the `postinstal` script.

### Defining messages In-Code

How to define messages:

in the interests of doing the least work possible, the message syntax we prefer is the following:
```ts
const messages = defineMessages({
  home:     { defaultMessage: "Home", description: "MainNav Home page" },
  claim:    { defaultMessage: "Claim", description: "MainNav page to claim an NFT" },
  profile:  { defaultMessage: "Profile", description: "MainNav page to set Profile image on NFT" }
});
```

The FormatJS document discourages explicit id's because of the risk of conflicts.

https://formatjs.io/docs/getting-started/message-extraction/#automatic-id-generation

Instead, the build tools inject an ID into all relevant messages.  We use `ts-transformer`, which is described: https://formatjs.io/docs/guides/bundler-plugins/#using-formatjsts-transformer

Although the `defineMessages` call does not actually do anything, it is important to keep here as it helps guide the AST compilation (which is what `ts-transformer` relies on);

### Libraries

Our libraries contain i18n text, and their translation files need to be merged into the final compiled translation file.

TODO:  ^^^ That

### Building

Our language files are generated, and so should not be checked into github.

The command build:i18n generates the default language file compiles it ready for use.  It is incorporated in a projects build process.

TODO: Research & incomporate https://www.npmjs.com/package/react-intl-translations-manager

# TheCoin

TheCoin captures the yield sitting in the float between when you spend on a credit card and when the bill is actually due. That yield gets invested in a diversified portfolio, and the dividends buy Gold Standard verified carbon credits. A "Shock Absorber" smart contract hedges the principal against market downturns.

The premise: climate action doesn't scale by asking people to sacrifice. It scales when the correct choice is also the selfish one. TheCoin isn't primarily an offsetting tool — it's a coordination mechanism that routes around the collective action problem by aligning incentives instead of appealing to willpower.

TheCoin Collaborative Canada is a registered non-profit and a Money Services Business (KYC implemented). It's open source because the model only works at a scale no single team can reach alone.

## How it works, roughly

1. Connect any credit card/chequing account.
2. The float between spend and due date gets invested across the index allocation above.
3. Dividends purchase verified carbon credits.
4. The Shock Absorber contract protects principal against drawdowns.
5. Principal & Capital Gains stay yours, untouched — this isn't a donation mechanism.

## Status

Early stage, actively developed. Expect rough edges. Current focus is stability across the onboarding/harvesting path.

## Getting started

- [Building](docs/building.md) — checkout and build instructions
- [Testing](docs/testing.md) — running the test suite

## Architecture notes

- Bank connectivity is handled via a Puppeteer-based harvester, with a self-hosted 8B-parameter vLLM model used to map bank websites.
- Storage was originally built around crypto-style anonymity: user details live in an encrypted store the transaction processor itself can't read. This is deliberate but does complicate alerting at scale, and is being revisited (see open issues).
- Hosting is on Firebase; content is served from Prismic.

## Contributing

Issues and PRs welcome. If you're touching the harvester or the encrypted storage layer, read the relevant open issues first — there are some known constraints that aren't obvious from the code alone.

## License

See [LICENSE](LICENSE).

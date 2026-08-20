// A pluggable source of "now", expressed as epoch milliseconds.
//
// Functions that build a signed, timestamped payload (eg BuildVerifiedXfer,
// buildAssignPluginRequest, buildUberTransfer, ...) require a TimeSource to
// be supplied explicitly, rather than reading the local clock themselves.
// The timestamp embedded in these signatures exists to guard against replay
// attacks, and is validated against the *server's* clock - if the value is
// sourced from a skewed local client clock, valid signatures can be rejected
// (or, worse, stay "fresh" for longer than intended). Callers should prefer
// a server-backed TimeSource (eg ServerTimeSource in @thecointech/apis/broker)
// so the timestamp always agrees with whatever clock will ultimately validate it.
export type TimeSource = () => Promise<number> | number;

// Only appropriate for tests/tooling that have no server to ask, or that are
// deliberately exercising local-clock behaviour. Do not use this for real
// signing flows - see the note above.
export const LocalTimeSource: TimeSource = () => Date.now();

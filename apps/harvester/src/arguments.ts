// NOTE: The easiest way to pass through args is to call it like
// <root>harvester.exe --process-start-args="--harvest"
export const hasArgument = (arg: string) => !!process.argv.find(op => op.includes(arg))

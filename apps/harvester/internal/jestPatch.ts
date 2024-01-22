// https://github.com/xenova/transformers.js/issues/401
// Helper functions used when initialising the testing environment.

// Import Node typing utilities
import * as types from "node:util/types";

// Import onnxruntime-node's default backend
import { onnxruntimeBackend } from "onnxruntime-node/dist/backend";
import ONNX_COMMON from "onnxruntime-common";

export function patchOnnxForJest() {
    // In rare cases (specifically when running unit tests with GitHub actions), possibly due to
    // a large number of concurrent executions, onnxruntime might fallback to use the WASM backend.
    // In this case, we set the number of threads to 1 to avoid errors like:
    //  - `TypeError: The worker script or module filename must be an absolute path or a relative path starting with './' or '../'. Received "blob:nodedata:..."`
    ONNX_COMMON.env.wasm.numThreads = 1;

    // A workaround to define a new backend for onnxruntime, which
    // will not throw an error when running tests with jest.
    // For more information, see: https://github.com/jestjs/jest/issues/11864#issuecomment-1261468011

    let registerBackend = ONNX_COMMON.registerBackend;

    // Define the constructors to monkey-patch
    const TYPED_ARRAYS_CONSTRUCTOR_NAMES = [
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "BigInt64Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "BigUint64Array",
        "Float32Array",
        "Float64Array",
    ];

    // Keep a reference to the original initialization method
    const originalMethod = onnxruntimeBackend.init;

    // Monkey-patch the initialization function
    onnxruntimeBackend.init = function (...args) {
        //@ts-ignore
        // There is probably a better way to do this
        Array.isArray = x =>
            typeof x === "object" &&
            x !== null &&
            typeof x.length === "number" &&
            x?.constructor.toString() === Array.toString();

        // For each typed array constructor
        for (const ctorName of TYPED_ARRAYS_CONSTRUCTOR_NAMES) {
            //@ts-ignore
            // Get the constructor from the current context
            const ctor = global[ctorName];

            //@ts-ignore
            // Get the corresponding test function from the `util` module
            const value = types[`is${ctorName}`].bind(types);

            // Monkey-patch the constructor so "x instanceof ctor" returns "types[`is${ctorName}`](x)"
            Object.defineProperty(ctor, Symbol.hasInstance, {
                value,
                writable: false,
                configurable: false,
                enumerable: false,
            });
        }

        // Call the original method
        return originalMethod.apply(this, args);
    };

    // Register the backend with the highest priority, so it is used instead of the default one
    registerBackend("test", onnxruntimeBackend, Number.POSITIVE_INFINITY);

}
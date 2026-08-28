export const electron = {
    app: {
        whenReady: () => Promise.resolve()
    },
    safeStorage: {
        isEncryptionAvailable: () => true,
        getSelectedStorageBackend: () => 'really-good-storage',
        decryptString: (buffer: Buffer) => buffer.toString(),
        encryptString: (data: string) => Buffer.from(data)
    }
};

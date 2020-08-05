declare module '3box' {

  /**
   * Please use the **openBox** method to instantiate a 3Box
   */
  class Box extends BoxApi {
    /**
     * @property public - access the profile store of the users 3Box
     */
    public: {
      public: KeyValueStore;
    };
    /**
     * @property private - access the private store of the users 3Box
     */
    private: {
      private: KeyValueStore;
    };
    /**
     * @property verified - check and create verifications
     */
    verified: {
      verified: Verified;
    };
    /**
     * @property spaces - an object containing all open spaces indexed by their name.
     */
    spaces: {
      spaces: any;
    };
    /**
     * @property syncDone - A promise that is resolved when the box is synced
     */
    syncDone: {
      syncDone: Promise<void>;
    };
    /**
     * Creates an instance of 3Box
     * @param provider - A 3ID provider, or ethereum provider
     * @param opts - Optional parameters
     * @param opts.pinningNode - A string with an ipfs multi-address to a 3box pinning node
     * @param opts.ipfs - A js-ipfs ipfs object
     * @param opts.addressServer - URL of the Address Server
     * @param opts.ghostPinbot - MultiAddress of a Ghost Pinbot node
     * @param opts.supportCheck - Gives browser alert if 3boxjs/ipfs not supported in browser env, defaults to true. You can also set to false to implement your own alert and call Box.support to check if supported.
     * @returns the 3Box session instance
     */
    static create(provider?: any, opts?: {
      pinningNode?: string;
      ipfs?: any;
      addressServer?: string;
      ghostPinbot?: string;
      supportCheck?: string;
    }): Promise<Box>;
    /**
     * Determines if this browser environment supports 3boxjs and ipfs.
     */
    static supported(): boolean;
    /**
     * Authenticate the user
     * @param spaces - A list of spaces to authenticate (optional)
     * @param opts - Optional parameters
     * @param opts.address - An ethereum address
     * @param opts.provider - A 3ID provider, or ethereum provider
     * @param opts.consentCallback - A function that will be called when the user has consented to opening the box
     */
    auth(spaces: String[], opts: {
      address: string;
      provider: string;
      consentCallback?: (...params: any[]) => any;
    }): Promise<void>;
    /**
     * Opens the 3Box associated with the given address
     * @param address - An ethereum address
     * @param provider - An ethereum or 3ID provider
     * @param opts - Optional parameters
     * @param opts.consentCallback - A function that will be called when the user has consented to opening the box
     * @param opts.pinningNode - A string with an ipfs multi-address to a 3box pinning node
     * @param opts.ipfs - A js-ipfs ipfs object
     * @param opts.addressServer - URL of the Address Server
     * @param opts.contentSignature - A signature, provided by a client of 3box using the private keys associated with the given address, of the 3box consent message
     * @returns the 3Box instance for the given address
     */
    static openBox(address: string|null, provider: any, opts?: {
      consentCallback?: (...params: any[]) => any;
      pinningNode?: string;
      ipfs?: any;
      addressServer?: string;
      contentSignature?: string;
      disableRendezvous?: boolean;
    }): Promise<Box>;
    /**
     * Opens the space with the given name in the users 3Box
     * @param name - The name of the space
     * @param opts - Optional parameters
     * @param opts.consentCallback - A function that will be called when the user has consented to opening the box
     * @param opts.onSyncDone - A function that will be called when the space has finished syncing with the pinning node
     * @returns the Space instance for the given space name
     */
    openSpace(name: string, opts: {
      consentCallback: (...params: any[]) => any;
      onSyncDone: (...params: any[]) => any;
    }): Space;
    /**
     * Open a thread. Use this to start receiving updates
     * @param space - The name of the space for this thread
     * @param name - The name of the thread
     * @param opts - Optional parameters
     * @param opts.firstModerator - DID of first moderator of a thread, by default, user is first moderator
     * @param opts.members - join a members only thread, which only members can post in, defaults to open thread
     * @param opts.noAutoSub - Disable auto subscription to the thread when posting to it (default false)
     * @param opts.ghost - Enable ephemeral messaging via Ghost Thread
     * @param opts.ghostBacklogLimit - The number of posts to maintain in the ghost backlog
     * @param opts.ghostFilters - Array of functions for filtering messages
     * @returns An instance of the thread class for the joined thread
     */
    openThread(space: string, name: string, opts: {
      firstModerator: string;
      members: boolean;
      noAutoSub: boolean;
      ghost: boolean;
      ghostBacklogLimit: number;
      ghostFilters: ((...params: any[]) => void)[];
    }): Thread;
    /**
     * Sets the callback function that will be called once when the box is fully synced.
     * @param syncDone - The function that will be called
     * @returns A promise that is fulfilled when the box is syned
     */
    onSyncDone(syncDone: (...params: any[]) => any): Promise<void>;
    /**
     * @property DID - the DID of the user
     */
    DID: {
      DID: string;
    };
    /**
     * Creates a proof that links an ethereum address to the 3Box account of the user. If given proof, it will simply be added to the root store.
     * @param [link] - Optional link object with type or proof
     * @param [link.proof] - Proof object, should follow [spec](https://github.com/3box/3box/blob/master/3IPs/3ip-5.md)
     */
    linkAddress(link?: {
      proof?: any;
    }): void;
    /**
     * Remove given address link, returns true if successful
     * @param address - address that is linked
     */
    removeAddressLink(address: string): void;
    /**
     * Checks if there is a proof that links an external account to the 3Box account of the user. If not params given and any link exists, returns true
     * @param [query] - Optional object with address and/or type.
     * @param [query.type] - Does the given type of link exist
     * @param [query.address] - Is the given adressed linked
     */
    isAddressLinked(query?: {
      type?: string;
      address?: string;
    }): void;
    /**
     * Lists address links associated with this 3Box
     * @returns An array of link objects
     */
    listAddressLinks(): any[];
    /**
     * Closes the 3box instance and clears local cache. If you call this,
     * users will need to sign a consent message to log in the next time
     * you call openBox.
     */
    logout(): void;
    /**
     * Check if the given address is logged in
     * @param address - An ethereum address
     * @returns true if the user is logged in
     */
    static isLoggedIn(address: string): boolean;
    /**
     * Instanciate ipfs used by 3Box without calling openBox.
     * @returns the ipfs instance
     */
    static getIPFS(): any;
    /**
     * A module to verify & validate claims
     */
    static idUtils: any;
  }

  class BoxApi {
    /**
     * Get the names of all spaces a user has
     * @param address - An ethereum address
     * @param opts - Optional parameters
     * @param opts.profileServer - URL of Profile API server
     * @returns an array with all spaces as strings
     */
    static listSpaces(address: string, opts: {
      profileServer: string;
    }): any;
    /**
     * Get the public data in a space of a given address with the given name
     * @param address - An ethereum address
     * @param name - A space name
     * @param opts - Optional parameters
     * @param opts.blocklist - A function that takes an address and returns true if the user has been blocked
     * @param opts.metadata - flag to retrieve metadata
     * @param opts.profileServer - URL of Profile API server
     * @returns a json object with the public space data
     */
    static getSpace(address: string, name: string, opts: {
      blocklist: (...params: any[]) => any;
      metadata: string;
      profileServer: string;
    }): any;
    /**
     * Get all posts that are made to a thread.
     * @param space - The name of the space the thread is in
     * @param name - The name of the thread
     * @param firstModerator - The DID (or ethereum address) of the first moderator
     * @param members - True if only members are allowed to post
     * @param opts - Optional parameters
     * @param opts.profileServer - URL of Profile API server
     * @returns An array of posts
     */
    static getThread(space: string, name: string, firstModerator: string, members: boolean, opts: {
      profileServer: string;
    }): object[];
    /**
     * Get all posts that are made to a thread.
     * @param address - The orbitdb-address of the thread
     * @param opts - Optional parameters
     * @param opts.profileServer - URL of Profile API server
     * @returns An array of posts
     */
    static getThreadByAddress(address: string, opts: {
      profileServer: string;
    }): object[];
    /**
     * Get the configuration of a users 3Box
     * @param address - The ethereum address
     * @param opts - Optional parameters
     * @param opts.profileServer - URL of Profile API server
     * @returns An array of posts
     */
    static getConfig(address: string, opts: {
      profileServer: string;
    }): object[];
    /**
     * Get the public profile of a given address
     * @param address - An ethereum address
     * @param opts - Optional parameters
     * @param opts.blocklist - A function that takes an address and returns true if the user has been blocked
     * @param opts.metadata - flag to retrieve metadata
     * @param opts.profileServer - URL of Profile API server
     * @returns a json object with the profile for the given address
     */
    static getProfile(address: string, opts: {
      blocklist: (...params: any[]) => any;
      metadata: string;
      profileServer: string;
    }): any;
    /**
     * Get a list of public profiles for given addresses. This relies on 3Box profile API.
     * @param address - An array of ethereum addresses
     * @param opts - Optional parameters
     * @param opts.profileServer - URL of Profile API server
     * @returns a json object with each key an address and value the profile
     */
    static getProfiles(address: any[], opts: {
      profileServer: string;
    }): any;
    /**
     * GraphQL for 3Box profile API
     * @param query - A graphQL query object.
     * @param opts - Optional parameters
     * @param opts.graphqlServer - URL of graphQL 3Box profile service
     * @returns a json object with each key an address and value the profile
     */
    static profileGraphQL(query: any, opts: {
      graphqlServer: string;
    }): any;
    /**
     * Verifies the proofs of social accounts that is present in the profile.
     * @param profile - A user profile object, received from the `getProfile` function
     * @returns An object containing the accounts that have been verified
     */
    static getVerifiedAccounts(profile: any): any;
  }

  /**
  * Please use **box.public** or **box.private** to get the instance of this class
  */
  class KeyValueStore {
    constructor();
    /**
     * Get the value and optionally metadata of the given key
     * @param key - the key
     * @param opts - optional parameters
     * @param opts.metadata - return both value and metadata
     * @returns the value associated with the key, undefined if there's no such key
     */
    get(key: string, opts: {
      metadata: boolean;
    }): string | any;
    /**
     * Get metadata for for a given key
     * @param key - the key
     * @returns Metadata for the key, undefined if there's no such key
     */
    getMetadata(key: string): object;
    /**
     * Set a value for the given key
     * @param key - the key
     * @param value - the value
     * @returns true if successful
     */
    set(key: string, value: string): boolean;
    /**
     * Set multiple values for multiple keys
     * @param keys - the keys
     * @param values - the values
     * @returns true if successful, throw error if not
     */
    setMultiple(keys: String[], values: String[]): boolean;
    /**
     * Remove the value for the given key
     * @param key - the key
     * @returns true if successful
     */
    remove(key: string): boolean;
    /**
     * Get all values and optionally metadata
     * @param opts - optional parameters
     * @param opts.metadata - return both values and metadata
     * @returns the values
     */
    all(opts: {
      metadata: boolean;
    }): (String | { value: String; timestamp: Number; })[];
    /**
     * Returns array of underlying log entries. In linearized order according to their Lamport clocks.
     * Useful for generating a complete history of all operations on store.
     * @example
     * const log = store.log
     *  const entry = log[0]
     *  console.log(entry)
     *  // { op: 'PUT', key: 'Name', value: 'Botbot', timeStamp: '1538575416068' }
     * @returns Array of ordered log entry objects
     */
    log(): object[];
  }

  class User {
    /**
     * @property DID - the DID of the user
     */
    DID: {
      DID: string;
    };
    /**
     * Sign a JWT claim
     * @param payload - The payload to sign
     * @param opts - Optional parameters
     * @returns The signed JWT
     */
    signClaim(payload: any, opts: any): string;
    /**
     * Encrypt a message. By default encrypts messages symmetrically
     * with the users private key. If the `to` parameter is used,
     * the message will be asymmetrically encrypted to the recipient.
     * @param message - The message to encrypt
     * @param opts - Optional parameters
     * @param to - The receiver of the message, a DID or an ethereum address
     * @returns An object containing the encrypted payload
     */
    encrypt(message: string, opts: any, to: string): any;
    /**
     * Decrypts a message if the user owns the correct key to decrypt it.
     * @param encryptedObject - The encrypted message to decrypt (as encoded by the `encrypt` method
     * @returns The clear text message
     */
    decrypt(encryptedObject: any): string;
  }

  /**
  * Please use **box.openSpace** to get the instance of this class
  */
  class Space {
    constructor();
    /**
     * @property public - access the profile store of the space
     */
    public: {
      public: KeyValueStore;
    };
    /**
     * @property private - access the private store of the space
     */
    private: {
      private: KeyValueStore;
    };
    /**
     * @property syncDone - A promise that is resolved when the space data is synced
     */
    syncDone: {
      syncDone: Promise<void>;
    };
    /**
     * @property user - access the user object to encrypt data and sign claims
     */
    user: {
      user: User;
    };
    /**
     * Join a thread. Use this to start receiving updates from, and to post in threads
     * @param name - The name of the thread
     * @param opts - Optional parameters
     * @param opts.firstModerator - DID of first moderator of a thread, by default, user is first moderator
     * @param opts.members - join a members only thread, which only members can post in, defaults to open thread
     * @param opts.confidential - create a confidential thread with true or join existing confidential thread with an encKeyId string
     * @param opts.noAutoSub - Disable auto subscription to the thread when posting to it (default false)
     * @param opts.ghost - Enable ephemeral messaging via Ghost Thread
     * @param opts.ghostPinbot - MultiAddress of a Ghost Pinbot node
     * @param opts.ghostBacklogLimit - The number of posts to maintain in the ghost backlog
     * @param opts.ghostFilters - Array of functions for filtering messages
     * @returns An instance of the thread class for the joined thread
     */
    joinThread(name: string, opts: {
      firstModerator: string;
      members: boolean;
      confidential: boolean;
      noAutoSub: boolean;
      ghost: boolean;
      ghostPinbot: string;
      ghostBacklogLimit: number;
      ghostFilters: ((...params: any[]) => void)[];
    }): Thread;
    /**
     * Create a confidential thread
     * @param name - The name of the thread
     * @returns An instance of the thread class for the created thread
     */
    createConfidentialThread(name: string): Thread;
    /**
     * Join a thread by full thread address. Use this to start receiving updates from, and to post in threads
     * @param address - The full address of the thread
     * @param opts - Optional parameters
     * @param opts.noAutoSub - Disable auto subscription to the thread when posting to it (default false)
     * @returns An instance of the thread class for the joined thread
     */
    joinThreadByAddress(address: string, opts: {
      noAutoSub: boolean;
    }): Thread;
    /**
     * Subscribe to the given thread, if not already subscribed
     * @param address - The address of the thread
     * @param config - configuration and thread meta data
     * @param opts.name - Name of thread
     * @param opts.firstModerator - DID of the first moderator
     * @param opts.members - Boolean string, true if a members only thread
     */
    subscribeThread(address: string, config: any): void;
    /**
     * Unsubscribe from the given thread, if subscribed
     * @param address - The address of the thread
     */
    unsubscribeThread(address: string): void;
    /**
     * Get a list of all the threads subscribed to in this space
     * @returns A list of thread objects as { address, firstModerator, members, name}
     */
    subscribedThreads(): object[];
  }

  /**
  * Please use **space.joinThread** to get the instance of this class
  */
  class Thread {
    constructor();
    /**
     * Post a message to the thread
     * @param message - The message
     * @returns The postId of the new post
     */
    post(message: any): string;
    /**
     * Add a moderator to this thread, throws error is user can not add a moderator
     * @param id - Moderator Id
     */
    addModerator(id: string): void;
    /**
     * List moderators
     * @returns Array of moderator DIDs
     */
    listModerators(): String[];
    /**
     * Add a member to this thread, throws if user can not add member, throw is not member thread
     * @param id - Member Id
     */
    addMember(id: string): void;
    /**
     * List members, throws if not member thread
     * @returns Array of member DIDs
     */
    listMembers(): String[];
    /**
     * Delete post
     * @param id - Moderator Id
     */
    deletePost(id: string): void;
    /**
     * Returns an array of posts, based on the options.
     * If hash not found when passing gt, gte, lt, or lte,
     * the iterator will return all items (respecting limit and reverse).
     * @param opts - Optional parameters
     * @param opts.gt - Greater than, takes an postId
     * @param opts.gte - Greater than or equal to, takes an postId
     * @param opts.lt - Less than, takes an postId
     * @param opts.lte - Less than or equal to, takes an postId
     * @param opts.limit - Limiting the number of entries in result, defaults to -1 (no limit)
     * @param opts.reverse - If set to true will result in reversing the result
     * @returns true if successful
     */
    getPosts(opts: {
      gt: string;
      gte: string;
      lt: string;
      lte: string;
      limit: number;
      reverse: boolean;
    }): object[];
    /**
     * Register a function to be called after new updates
     * have been received from the network or locally.
     * @param updateFn - The function that will get called
     */
    onUpdate(updateFn: (...params: any[]) => any): void;
    /**
     * Register a function to be called for every new
     * capability that is added to the thread access controller.
     * This inlcudes when a moderator or member is added.
     * The function takes one parameter, which is the capabilities obj, or
     * you can call listModerator / listMembers again instead.
     * @param updateFn - The function that will get called
     */
    onNewCapabilities(updateFn: (...params: any[]) => any): void;
  }

  /**
  * Please use **box.verified** to get the instance of this class
  */
  class Verified {
    constructor();
    /**
     * Returns the verified DID of the user
     * @returns The DID of the user
     */
    DID(): string;
    /**
     * Verifies that the user has a valid github account
     * Throws an error otherwise.
     * @returns Object containing username, and proof
     */
    github(): any;
    /**
     * Adds a github verification to the users profile
     * Throws an error if the verification fails.
     * @param gistUrl - URL of the proof
     * @returns Object containing username, and proof
     */
    addGithub(gistUrl: any): any;
    /**
     * Verifies that the user has a valid twitter account
     * Throws an error otherwise.
     * @returns Object containing username, proof, and the verifier
     */
    twitter(): any;
    /**
     * Adds a twitter verification to the users profile
     * Throws an error if the verification fails.
     * @param claim - A did-JWT claim ownership of a twitter username
     * @returns Object containing username, proof, and the verifier
     */
    addTwitter(claim: string): any;
    /**
     * Verifies that the user has a verified email account
     * Throws an error otherwise.
     * @returns Object containing username, proof, and the verifier
     */
    email(): any;
    /**
     * Adds an email verification to the users profile
     * Throws an error if the verification fails.
     * @param claim - A did-JWT claim ownership of an email username
     * @returns Object containing username, proof, and the verifier
     */
    addEmail(claim: string): any;
  }

  export = Box;
}

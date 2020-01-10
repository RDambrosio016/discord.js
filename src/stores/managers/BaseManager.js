'use strict';

const Collection = require('../../util/Collection');
const Structures = require('../../util/Structures');

/**
 * Manages the API methods of a data model and holds its cache.
 * @abstract
 */
class BaseManager {
  constructor(client, iterable, holds, cacheType = Collection, ...cacheOptions) {
    /**
     * The data structure belonging to this Manager
     * @private
     * @readonly
     */
    Object.defineProperty(this, 'holds', { value: Structures.get(holds.name) || holds });

    /**
     * The client that instantiated this Manager
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The type of Collection of the Manager.
     * @type {?Collection}
     */
    this.cacheType = cacheType;

    /**
    * Holds the cache for the data model.
    * @type {?Collection}
    */
    this.cache = cacheType ? new cacheType(...cacheOptions) : null;
    if (iterable) for (const i of iterable) this.add(i);
  }

  add(data, cache = true, { id, extras = [] } = {}) {
    if (this.cache) {
      const existing = this.cache.get(id || data.id);
      if (existing && existing._patch && cache) existing._patch(data);
      if (existing) return existing;
    }
    const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
    if (cache && this.cache) this.cache.set(id || entry.id, entry);
    return entry;
  }

  /**
   * Resolves a data entry to a data Object.
   * @param {string|Object} idOrInstance The id or instance of something in this DataStore
   * @returns {?Object} An instance from this DataStore
   */
  resolve(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string' && this.cache) return this.cache.get(idOrInstance) || null;
    return null;
  }

  /**
   * Resolves a data entry to a instance ID.
   * @param {string|Instance} idOrInstance The id or instance of something in this DataStore
   * @returns {?Snowflake}
   */
  resolveID(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance.id;
    if (typeof idOrInstance === 'string') return idOrInstance;
    return null;
  }
}

module.exports = BaseManager;

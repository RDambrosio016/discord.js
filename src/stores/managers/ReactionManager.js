'use strict';

const MessageReaction = require('../structures/MessageReaction');
const BaseManager = require('./BaseManager');

class ReactionStore extends BaseManager {
  constructor(message, iterable) {
    super(message.client, iterable, MessageReaction);

    /**
     * The message this manager belongs to.
     * @type {Message}
     */
    this.message = message;
  }

  add(data, cache) {
    return super.add(data, cache, { id: data.emoji.id || data.emoji.name, extras: [this.message] });
  }

  /**
   * The reaction cache of this manager.
   * @property {Collection<Snowflake, MessageReaction>} cache
   * @memberof ReactionStore
   * @instance
   */

  /**
   * Data that can be resolved to a MessageReaction object. This can be:
   * * A MessageReaction
   * * A Snowflake
   * @typedef {MessageReaction|Snowflake} MessageReactionResolvable
   */

  /**
    * Resolves a MessageReactionResolvable to a MessageReaction object.
    * @method resolve
    * @memberof ReactionStore
    * @instance
    * @param {MessageReactionResolvable} reaction The MessageReaction to resolve
    * @returns {?MessageReaction}
    */

  /**
    * Resolves a MessageReactionResolvable to a MessageReaction ID string.
    * @method resolveID
    * @memberof ReactionStore
    * @instance
    * @param {MessageReactionResolvable} reaction The MessageReaction to resolve
    * @returns {?Snowflake}
    */

  /**
   * Removes all reactions from a message.
   * @returns {Promise<Message>}
   */
  removeAll() {
    return this.client.api.channels(this.message.channel.id).messages(this.message.id).reactions.delete()
      .then(() => this.message);
  }

  _partial(emoji) {
    const id = emoji.id || emoji.name;
    const existing = this.cache.get(id);
    return !existing || existing.partial;
  }

  async _fetchReaction(reactionEmoji, cache) {
    const id = reactionEmoji.id || reactionEmoji.name;
    const existing = this.cache.get(id);
    if (!this._partial(reactionEmoji)) return existing;
    const data = await this.client.api.channels(this.message.channel.id).messages(this.message.id).get();
    if (!data.reactions || !data.reactions.some(r => (r.emoji.id || r.emoji.name) === id)) {
      reactionEmoji.reaction._patch({ count: 0 });
      this.message.reactions.remove(id);
      return existing;
    }
    for (const reaction of data.reactions) {
      if (this._partial(reaction.emoji)) this.add(reaction, cache);
    }
    return existing;
  }
}

module.exports = ReactionStore;

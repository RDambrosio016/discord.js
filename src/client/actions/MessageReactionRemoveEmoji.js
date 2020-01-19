'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class MessageReactionRemoveEmoji extends Action {
  handle(data) {
    const channel = this.getChannel(data);
    if (!channel || channel.type === 'voice') return false;

    const message = this.getMessage(data, channel);
    if (!message) return false;

    const reaction = this.getReaction(data, message);
    if (!reaction) return false;
    /**
     * Emitted when a bot removes a reaction from a cached message.
     * @event Client#messageReactionRemoveEmoji
     * @param {MessageReaction} reaction The reaction that was removed
     */
    this.client.emit(Events.MESSAGE_REACTION_REMOVE_EMOJI, reaction);
    return { reaction };
  }
}

module.exports = MessageReactionRemoveEmoji;

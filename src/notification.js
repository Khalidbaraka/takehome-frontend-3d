class Notification {
  notifiees = new Map();

  subscribe(topic, callback) {
    if (!this.notifiees.has(topic)) {
      this.notifiees.set(topic, []);
    }
    const callbacks = this.notifiees.get(topic);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }

    return () => this.unsubscribe(topic, callback);
  }

  unsubscribe(topic, callback) {
    if (!this.notifiees.has(topic)) {
      return;
    }
    const callbacks = this.notifiees.get(topic);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      // remove the callback from the list of callbacks for that topic
      // I think we also create a new array without that callback and set it again to the topic, but this is more efficient
      callbacks.splice(index, 1);
    }
  }

  notify(topic, value) {
    if (!this.notifiees.has(topic)) {
      return;
    }
    const callbacks = this.notifiees.get(topic);
    callbacks.forEach((callback) => callback(value));
  }
}

let notificationCenter = undefined;

/**
 * @deprecated The active app flow uses ShapeProvider as the source of truth.
 * This notification center remains only for legacy code paths.
 */
export function getNotificationCenter() {
  if (!notificationCenter) {
    notificationCenter = new Notification();
  }
  return notificationCenter;
}

/**
 * @deprecated The active app flow uses ShapeProvider as the source of truth.
 * This reset helper remains only for legacy code paths and test cleanup.
 */
export function resetNotificationCenter() {
  notificationCenter = undefined;
}

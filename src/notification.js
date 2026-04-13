class Notification {
  notifiees = new Map();

  subscribe(topic, callback) {
    if (!this.notifiees.has(topic)) {
      // add that topoc and its callbacks list to be empty
      this.notifiees.set(topic, []);
    }
    // add the callback to the list of callbacks for that topic
    // do we even check if it exists? to avoid duplicates?
    this.notifiees.get(topic).push(callback);
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
    // notify all the callbacks for that topic with the value
    callbacks.forEach((callback) => callback(value));
  }
}

let notificationCenter = undefined;
export function getNotificationCenter() {
  if (!notificationCenter) {
    notificationCenter = new Notification();
  }
  return notificationCenter;
}

export function resetNotificationCenter() {
  notificationCenter = undefined;
}

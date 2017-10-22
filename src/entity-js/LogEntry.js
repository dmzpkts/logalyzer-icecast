import Nymph from "Nymph";
import Entity from "NymphEntity";

export default class LogEntry extends Entity {

  // === Static Properties ===

  static etype = "logentry";
  // The name of the server class
  static class = "LogEntry";

  // === Constructor ===

  constructor(id) {
    super(id);
  }

  // === Instance Methods ===

  archive(...args) {
    return this.serverCall('archive', args);
  }
}

Nymph.setEntityClass(LogEntry.class, LogEntry);
export {LogEntry};

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

  // === Static Methods ===

  static getIpInfo(...args) {
    return LogEntry.serverCallStatic('getIpInfo', args);
  }
}

Nymph.setEntityClass(LogEntry.class, LogEntry);
export {LogEntry};

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogEntry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Nymph = require("Nymph");

var _Nymph2 = _interopRequireDefault(_Nymph);

var _NymphEntity = require("NymphEntity");

var _NymphEntity2 = _interopRequireDefault(_NymphEntity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LogEntry = function (_Entity) {
  _inherits(LogEntry, _Entity);

  // === Constructor ===

  // === Static Properties ===

  function LogEntry(id) {
    _classCallCheck(this, LogEntry);

    return _possibleConstructorReturn(this, (LogEntry.__proto__ || Object.getPrototypeOf(LogEntry)).call(this, id));
  }

  // === Instance Methods ===

  // The name of the server class


  _createClass(LogEntry, [{
    key: "archive",
    value: function archive() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.serverCall('archive', args);
    }
  }]);

  return LogEntry;
}(_NymphEntity2.default);

LogEntry.etype = "logentry";
LogEntry.class = "LogEntry";
exports.default = LogEntry;


_Nymph2.default.setEntityClass(LogEntry.class, LogEntry);
exports.LogEntry = LogEntry;
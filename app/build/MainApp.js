(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './LogalyzerApp.html', 'User', 'TilmeldLogin', 'TilmeldChangePassword'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./LogalyzerApp.html'), require('User'), require('TilmeldLogin'), require('TilmeldChangePassword'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.LogalyzerApp, global.User, global.TilmeldLogin, global.TilmeldChangePassword);
		global.MainApp = mod.exports;
	}
})(this, function (exports, _LogalyzerApp, _User, _TilmeldLogin, _TilmeldChangePassword) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _LogalyzerApp2 = _interopRequireDefault(_LogalyzerApp);

	var _User2 = _interopRequireDefault(_User);

	var _TilmeldLogin2 = _interopRequireDefault(_TilmeldLogin);

	var _TilmeldChangePassword2 = _interopRequireDefault(_TilmeldChangePassword);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	function data() {
		return {
			currentUser: false,
			clientConfig: {
				timezones: []
			},
			userAvatar: null,
			isTilmeldAdmin: false
		};
	};

	var methods = {
		saveUser: function saveUser() {
			this.get('currentUser').save().then(function () {}, function (errObj) {
				alert('Error: ' + errObj.textStatus);
			});
		},
		logout: function logout() {
			this.get('currentUser').logout();
		}
	};

	function oncreate() {
		var _this = this;

		// Get the current user.
		_User2.default.current().then(function (currentUser) {
			_this.set({ currentUser: currentUser });
		}, function (errObj) {
			alert("Error: " + errObj.textStatus);
		});

		// Handle logins and logouts.
		_User2.default.on('login', function (currentUser) {
			_this.set({ currentUser: currentUser });
		});
		_User2.default.on('logout', function () {
			_this.set({ currentUser: null });
		});

		this.observe('currentUser', function (user) {
			if (user) {
				// Get the user's avatar.
				user.getAvatar().then(function (userAvatar) {
					_this.set({ userAvatar: userAvatar });
				});
				// Is the user a Tilmeld admin?
				user.gatekeeper('tilmeld/admin').then(function (isTilmeldAdmin) {
					_this.set({ isTilmeldAdmin: isTilmeldAdmin });
				});
			} else {
				_this.set({
					userAvatar: null,
					isTilmeldAdmin: false
				});
			}
		});

		// Get the client config (for timezones).
		_User2.default.getClientConfig().then(function (clientConfig) {
			_this.set({ clientConfig: clientConfig });
		});
	};

	function create_main_fragment(state, component) {
		var text, text_1, text_2, if_block_3_anchor;

		var if_block = state.currentUser === false && create_if_block(state, component);

		var if_block_1 = state.currentUser !== false && create_if_block_1(state, component);

		var if_block_2 = state.currentUser === null && create_if_block_6(state, component);

		var if_block_3 = state.currentUser && create_if_block_7(state, component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				text = createText("\n");
				if (if_block_1) if_block_1.c();
				text_1 = createText("\n");
				if (if_block_2) if_block_2.c();
				text_2 = createText("\n");
				if (if_block_3) if_block_3.c();
				if_block_3_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insertNode(text, target, anchor);
				if (if_block_1) if_block_1.m(target, anchor);
				insertNode(text_1, target, anchor);
				if (if_block_2) if_block_2.m(target, anchor);
				insertNode(text_2, target, anchor);
				if (if_block_3) if_block_3.m(target, anchor);
				insertNode(if_block_3_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.currentUser === false) {
					if (!if_block) {
						if_block = create_if_block(state, component);
						if_block.c();
						if_block.m(text.parentNode, text);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.currentUser !== false) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1(state, component);
						if_block_1.c();
						if_block_1.m(text_1.parentNode, text_1);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if (state.currentUser === null) {
					if (!if_block_2) {
						if_block_2 = create_if_block_6(state, component);
						if_block_2.c();
						if_block_2.m(text_2.parentNode, text_2);
					}
				} else if (if_block_2) {
					if_block_2.u();
					if_block_2.d();
					if_block_2 = null;
				}

				if (state.currentUser) {
					if (if_block_3) {
						if_block_3.p(changed, state);
					} else {
						if_block_3 = create_if_block_7(state, component);
						if_block_3.c();
						if_block_3.m(if_block_3_anchor.parentNode, if_block_3_anchor);
					}
				} else if (if_block_3) {
					if_block_3.u();
					if_block_3.d();
					if_block_3 = null;
				}
			},

			u: function unmount() {
				if (if_block) if_block.u();
				detachNode(text);
				if (if_block_1) if_block_1.u();
				detachNode(text_1);
				if (if_block_2) if_block_2.u();
				detachNode(text_2);
				if (if_block_3) if_block_3.u();
				detachNode(if_block_3_anchor);
			},

			d: function destroy() {
				if (if_block) if_block.d();
				if (if_block_1) if_block_1.d();
				if (if_block_2) if_block_2.d();
				if (if_block_3) if_block_3.d();
			}
		};
	}

	// (1:0) {{#if currentUser === false}}
	function create_if_block(state, component) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.innerHTML = "<div class=\"row align-items-center justify-content-center\" style=\"height: 100vh;\"><div class=\"col-auto\"><svg width=\"200px\" height=\"200px\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\" class=\"lds-dual-ring\" style=\"background: none;\"><circle cx=\"50\" cy=\"50\" fill=\"none\" stroke-linecap=\"round\" r=\"40\" stroke-width=\"4\" stroke=\"#337ab7\" stroke-dasharray=\"62.83185307179586 62.83185307179586\" transform=\"rotate(99 50 50)\"><animateTransform attributeName=\"transform\" type=\"rotate\" calcMode=\"linear\" values=\"0 50 50;360 50 50\" keyTimes=\"0;1\" dur=\"2s\" begin=\"0s\" repeatCount=\"indefinite\"></animateTransform>\n          </circle>\n        </svg></div></div>";
				this.h();
			},

			h: function hydrate() {
				div.className = "container";
				setStyle(div, "height", "100vh");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			u: function unmount() {
				detachNode(div);
			},

			d: noop
		};
	}

	// (26:16) {{#if userAvatar !== null}}
	function create_if_block_3(state, component) {
		var img, img_alt_value;

		return {
			c: function create() {
				img = createElement("img");
				this.h();
			},

			h: function hydrate() {
				img.className = "rounded-circle";
				img.src = state.userAvatar;
				img.alt = img_alt_value = state.currentUser.data.nameFirst;
			},

			m: function mount(target, anchor) {
				insertNode(img, target, anchor);
			},

			p: function update(changed, state) {
				if (changed.userAvatar) {
					img.src = state.userAvatar;
				}

				if ((changed.currentUser || changed.clientConfig) && img_alt_value !== (img_alt_value = state.currentUser.data.nameFirst)) {
					img.alt = img_alt_value;
				}
			},

			u: function unmount() {
				detachNode(img);
			},

			d: noop
		};
	}

	// (28:16) {{else}}
	function create_if_block_4(state, component) {
		var text_value = state.currentUser.data.nameFirst,
		    text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insertNode(text, target, anchor);
			},

			p: function update(changed, state) {
				if ((changed.currentUser || changed.clientConfig) && text_value !== (text_value = state.currentUser.data.nameFirst)) {
					text.data = text_value;
				}
			},

			u: function unmount() {
				detachNode(text);
			},

			d: noop
		};
	}

	// (43:16) {{#if isTilmeldAdmin}}
	function create_if_block_5(state, component) {
		var div, text, h6, text_2, a;

		return {
			c: function create() {
				div = createElement("div");
				text = createText("\n                  ");
				h6 = createElement("h6");
				h6.textContent = "Admin";
				text_2 = createText("\n                  ");
				a = createElement("a");
				a.textContent = "User Admin App";
				this.h();
			},

			h: function hydrate() {
				div.className = "dropdown-divider";
				h6.className = "dropdown-header";
				a.className = "dropdown-item";
				a.href = "/user/";
				a.target = "_blank";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				insertNode(text, target, anchor);
				insertNode(h6, target, anchor);
				insertNode(text_2, target, anchor);
				insertNode(a, target, anchor);
			},

			u: function unmount() {
				detachNode(div);
				detachNode(text);
				detachNode(h6);
				detachNode(text_2);
				detachNode(a);
			},

			d: noop
		};
	}

	// (18:6) {{#if currentUser}}
	function create_if_block_2(state, component) {
		var button,
		    text_1,
		    div,
		    ul,
		    li,
		    a,
		    text_3,
		    div_1,
		    h6,
		    text_4_value = state.currentUser.data.name,
		    text_4,
		    text_6,
		    a_1,
		    text_8,
		    div_2,
		    text_9,
		    a_2,
		    text_11;

		var current_block_type = select_block_type(state);
		var if_block = current_block_type(state, component);

		function click_handler(event) {
			component.logout();
		}

		var if_block_1 = state.isTilmeldAdmin && create_if_block_5(state, component);

		return {
			c: function create() {
				button = createElement("button");
				button.innerHTML = "<span class=\"navbar-toggler-icon\"></span>";
				text_1 = createText("\n        ");
				div = createElement("div");
				ul = createElement("ul");
				li = createElement("li");
				a = createElement("a");
				if_block.c();
				text_3 = createText("\n              ");
				div_1 = createElement("div");
				h6 = createElement("h6");
				text_4 = createText(text_4_value);
				text_6 = createText("\n                ");
				a_1 = createElement("a");
				a_1.textContent = "Account Info";
				text_8 = createText("\n                ");
				div_2 = createElement("div");
				text_9 = createText("\n                ");
				a_2 = createElement("a");
				a_2.textContent = "Log Out";
				text_11 = createText("\n                ");
				if (if_block_1) if_block_1.c();
				this.h();
			},

			h: function hydrate() {
				button.className = "navbar-toggler";
				button.type = "button";
				setAttribute(button, "data-toggle", "collapse");
				setAttribute(button, "data-target", "#navbarNav");
				setAttribute(button, "aria-controls", "navbarNav");
				setAttribute(button, "aria-expanded", "false");
				setAttribute(button, "aria-label", "Toggle navigation");
				div.className = "collapse navbar-collapse";
				div.id = "navbarNav";
				ul.className = "navbar-nav ml-auto";
				li.className = "nav-item dropdown";
				a.className = "nav-link dropdown-toggle p-0";
				a.href = "javascript:void(0)";
				a.id = "userDropdown";
				setAttribute(a, "role", "button");
				setAttribute(a, "data-toggle", "dropdown");
				setAttribute(a, "aria-haspopup", "true");
				setAttribute(a, "aria-expanded", "false");
				div_1.className = "dropdown-menu dropdown-menu-right";
				setAttribute(div_1, "aria-labelledby", "userDropdown");
				h6.className = "dropdown-header";
				a_1.className = "dropdown-item";
				a_1.href = "javascript:void(0)";
				setAttribute(a_1, "data-toggle", "modal");
				setAttribute(a_1, "data-target", "#accountInfoModal");
				div_2.className = "dropdown-divider";
				a_2.className = "dropdown-item";
				a_2.href = "javascript:void(0)";
				addListener(a_2, "click", click_handler);
			},

			m: function mount(target, anchor) {
				insertNode(button, target, anchor);
				insertNode(text_1, target, anchor);
				insertNode(div, target, anchor);
				appendNode(ul, div);
				appendNode(li, ul);
				appendNode(a, li);
				if_block.m(a, null);
				appendNode(text_3, li);
				appendNode(div_1, li);
				appendNode(h6, div_1);
				appendNode(text_4, h6);
				appendNode(text_6, div_1);
				appendNode(a_1, div_1);
				appendNode(text_8, div_1);
				appendNode(div_2, div_1);
				appendNode(text_9, div_1);
				appendNode(a_2, div_1);
				appendNode(text_11, div_1);
				if (if_block_1) if_block_1.m(div_1, null);
			},

			p: function update(changed, state) {
				if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if_block.u();
					if_block.d();
					if_block = current_block_type(state, component);
					if_block.c();
					if_block.m(a, null);
				}

				if ((changed.currentUser || changed.clientConfig) && text_4_value !== (text_4_value = state.currentUser.data.name)) {
					text_4.data = text_4_value;
				}

				if (state.isTilmeldAdmin) {
					if (!if_block_1) {
						if_block_1 = create_if_block_5(state, component);
						if_block_1.c();
						if_block_1.m(div_1, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}
			},

			u: function unmount() {
				detachNode(button);
				detachNode(text_1);
				detachNode(div);
				if_block.u();
				if (if_block_1) if_block_1.u();
			},

			d: function destroy() {
				if_block.d();
				removeListener(a_2, "click", click_handler);
				if (if_block_1) if_block_1.d();
			}
		};
	}

	// (14:0) {{#if currentUser !== false}}
	function create_if_block_1(state, component) {
		var nav, div, span, text_2;

		var if_block = state.currentUser && create_if_block_2(state, component);

		return {
			c: function create() {
				nav = createElement("nav");
				div = createElement("div");
				span = createElement("span");
				span.innerHTML = "Logalyzer <small>Icecast</small>";
				text_2 = createText("\n      ");
				if (if_block) if_block.c();
				this.h();
			},

			h: function hydrate() {
				nav.className = "navbar navbar-expand-lg navbar-dark bg-dark";
				div.className = "container";
				span.className = "navbar-brand mb-0 h1";
			},

			m: function mount(target, anchor) {
				insertNode(nav, target, anchor);
				appendNode(div, nav);
				appendNode(span, div);
				appendNode(text_2, div);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, state) {
				if (state.currentUser) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block_2(state, component);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				detachNode(nav);
				if (if_block) if_block.u();
			},

			d: function destroy() {
				if (if_block) if_block.d();
			}
		};
	}

	// (60:0) {{#if currentUser === null}}
	function create_if_block_6(state, component) {
		var div, div_1, div_2, text_1, div_3;

		var tilmeldlogin = new _TilmeldLogin2.default({
			_root: component._root,
			data: {
				layout: "small",
				classInput: "form-control",
				classSelect: "form-control",
				classTextarea: "form-control",
				classSubmit: "btn btn-primary",
				classButton: "btn btn-secondary"
			}
		});

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				tilmeldlogin._fragment.c();
				text_1 = createText("\n      ");
				div_3 = createElement("div");
				div_3.innerHTML = "<div class=\"jumbotron\"><h1 class=\"display-4\">Logalyzer for Icecast!</h1>\n          <p class=\"lead\">Log analyzer for Icecast servers.</p>\n          <hr class=\"my-4\">\n          <p>Logalyzer can disect your server logs and aggregate the results into charts and graphs, helping you gain valuable insight on your users' activities and preferences.</p>\n          <p class=\"lead\"><a class=\"btn btn-primary btn-lg\" href=\"https://github.com/sciactive/logalyzer-icecast\" role=\"button\">Logalyzer on GitHub</a></p></div>";
				this.h();
			},

			h: function hydrate() {
				div.className = "container mt-3";
				div_1.className = "row";
				div_2.className = "col-sm-4 order-sm-2";
				div_3.className = "col-sm-8 order-sm-1";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				tilmeldlogin._mount(div_2, null);
				appendNode(text_1, div_1);
				appendNode(div_3, div_1);
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				tilmeldlogin.destroy(false);
			}
		};
	}

	// (120:14) {{#each clientConfig.timezones as tz}}
	function create_each_block(state, timezones, tz, tz_index, component) {
		var option,
		    option_value_value,
		    text_value = tz,
		    text;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = tz;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state, timezones, tz, tz_index) {
				if (changed.clientConfig && option_value_value !== (option_value_value = tz)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if (changed.clientConfig && text_value !== (text_value = tz)) {
					text.data = text_value;
				}
			},

			u: function unmount() {
				detachNode(option);
			},

			d: noop
		};
	}

	// (86:0) {{#if currentUser}}
	function create_if_block_7(state, component) {
		var div,
		    text_1,
		    div_1,
		    div_2,
		    div_3,
		    div_4,
		    text_7,
		    div_5,
		    div_6,
		    label,
		    text_9,
		    input,
		    input_updating = false,
		    text_11,
		    div_7,
		    label_1,
		    text_13,
		    input_1,
		    input_1_updating = false,
		    text_15,
		    div_8,
		    label_2,
		    text_17,
		    input_2,
		    input_2_updating = false,
		    text_19,
		    div_9,
		    label_3,
		    text_21,
		    input_3,
		    input_3_updating = false,
		    text_23,
		    div_10,
		    label_4,
		    text_25,
		    select,
		    option,
		    select_updating = false,
		    text_28,
		    div_11,
		    span_1,
		    text_30,
		    div_12,
		    text_34,
		    div_13,
		    button_1,
		    text_36,
		    button_2;

		var logalyzerapp = new _LogalyzerApp2.default({
			_root: component._root
		});

		function input_input_handler() {
			input_updating = true;
			var state = component.get();
			state.currentUser.data.username = input.value;
			component.set({ currentUser: state.currentUser, clientConfig: state.clientConfig });
			input_updating = false;
		}

		function input_1_input_handler() {
			input_1_updating = true;
			var state = component.get();
			state.currentUser.data.nameFirst = input_1.value;
			component.set({ currentUser: state.currentUser, clientConfig: state.clientConfig });
			input_1_updating = false;
		}

		function input_2_input_handler() {
			input_2_updating = true;
			var state = component.get();
			state.currentUser.data.nameLast = input_2.value;
			component.set({ currentUser: state.currentUser, clientConfig: state.clientConfig });
			input_2_updating = false;
		}

		function input_3_input_handler() {
			input_3_updating = true;
			var state = component.get();
			state.currentUser.data.phone = input_3.value;
			component.set({ currentUser: state.currentUser, clientConfig: state.clientConfig });
			input_3_updating = false;
		}

		var timezones = state.clientConfig.timezones;

		var each_blocks = [];

		for (var i = 0; i < timezones.length; i += 1) {
			each_blocks[i] = create_each_block(state, timezones, timezones[i], i, component);
		}

		function select_change_handler() {
			select_updating = true;
			var selectedOption = select.querySelector(':checked') || select.options[0];
			var state = component.get();
			state.currentUser.data.timezone = selectedOption && selectedOption.__value;
			component.set({ currentUser: state.currentUser, clientConfig: state.clientConfig });
			select_updating = false;
		}

		var tilmeldchangepassword = new _TilmeldChangePassword2.default({
			_root: component._root,
			data: {
				layout: "compact",
				classInput: "form-control",
				classSubmit: "btn btn-primary",
				classButton: "btn btn-secondary"
			}
		});

		function click_handler(event) {
			component.saveUser();
		}

		return {
			c: function create() {
				div = createElement("div");
				logalyzerapp._fragment.c();
				text_1 = createText("\n  ");
				div_1 = createElement("div");
				div_2 = createElement("div");
				div_3 = createElement("div");
				div_4 = createElement("div");
				div_4.innerHTML = "<h5 class=\"modal-title\" id=\"accountInfoModalLabel\">Account info</h5>\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>";
				text_7 = createText("\n        ");
				div_5 = createElement("div");
				div_6 = createElement("div");
				label = createElement("label");
				label.textContent = "Email address";
				text_9 = createText("\n            ");
				input = createElement("input");
				text_11 = createText("\n          ");
				div_7 = createElement("div");
				label_1 = createElement("label");
				label_1.textContent = "First name";
				text_13 = createText("\n            ");
				input_1 = createElement("input");
				text_15 = createText("\n          ");
				div_8 = createElement("div");
				label_2 = createElement("label");
				label_2.textContent = "Last name";
				text_17 = createText("\n            ");
				input_2 = createElement("input");
				text_19 = createText("\n          ");
				div_9 = createElement("div");
				label_3 = createElement("label");
				label_3.textContent = "Phone";
				text_21 = createText("\n            ");
				input_3 = createElement("input");
				text_23 = createText("\n          ");
				div_10 = createElement("div");
				label_4 = createElement("label");
				label_4.textContent = "Timezone";
				text_25 = createText("\n            ");
				select = createElement("select");
				option = createElement("option");
				option.textContent = "--Default--";

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_28 = createText("\n          ");
				div_11 = createElement("div");
				span_1 = createElement("span");
				span_1.textContent = "Password";
				text_30 = createText("\n            ");
				div_12 = createElement("div");
				tilmeldchangepassword._fragment.c();
				text_34 = createText("\n        ");
				div_13 = createElement("div");
				button_1 = createElement("button");
				button_1.textContent = "Save changes";
				text_36 = createText("\n          ");
				button_2 = createElement("button");
				button_2.textContent = "Close";
				this.h();
			},

			h: function hydrate() {
				div.className = "container mt-3";
				div_1.className = "modal fade";
				div_1.id = "accountInfoModal";
				div_1.tabIndex = "-1";
				setAttribute(div_1, "role", "dialog");
				setAttribute(div_1, "aria-labelledby", "accountInfoModalLabel");
				setAttribute(div_1, "aria-hidden", "true");
				div_2.className = "modal-dialog";
				setAttribute(div_2, "role", "document");
				div_3.className = "modal-content";
				div_4.className = "modal-header";
				div_5.className = "modal-body";
				div_6.className = "form-group";
				label.htmlFor = "accountDetailsEmail";
				input.type = "email";
				input.className = "form-control";
				input.id = "accountDetailsEmail";
				input.placeholder = "Enter email";
				addListener(input, "input", input_input_handler);
				div_7.className = "form-group";
				label_1.htmlFor = "accountDetailsFirstName";
				input_1.type = "text";
				input_1.className = "form-control";
				input_1.id = "accountDetailsFirstName";
				input_1.placeholder = "Enter name";
				addListener(input_1, "input", input_1_input_handler);
				div_8.className = "form-group";
				label_2.htmlFor = "accountDetailsLastName";
				input_2.type = "text";
				input_2.className = "form-control";
				input_2.id = "accountDetailsLastName";
				input_2.placeholder = "Enter name";
				addListener(input_2, "input", input_2_input_handler);
				div_9.className = "form-group";
				label_3.htmlFor = "accountDetailsPhone";
				input_3.type = "tel";
				input_3.className = "form-control";
				input_3.id = "accountDetailsPhone";
				input_3.placeholder = "Enter phone number";
				addListener(input_3, "input", input_3_input_handler);
				div_10.className = "form-group";
				label_4.htmlFor = "accountDetailsTimezone";
				select.className = "form-control";
				select.id = "accountDetailsTimezone";

				if (!('currentUser' in state)) component._root._beforecreate.push(select_change_handler);

				addListener(select, "change", select_change_handler);
				div_11.className = "form-group";
				div_13.className = "modal-footer";
				button_1.type = "button";
				button_1.className = "btn btn-primary";
				setAttribute(button_1, "data-dismiss", "modal");
				addListener(button_1, "click", click_handler);
				button_2.type = "button";
				button_2.className = "btn btn-secondary";
				setAttribute(button_2, "data-dismiss", "modal");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				logalyzerapp._mount(div, null);
				insertNode(text_1, target, anchor);
				insertNode(div_1, target, anchor);
				appendNode(div_2, div_1);
				appendNode(div_3, div_2);
				appendNode(div_4, div_3);
				appendNode(text_7, div_3);
				appendNode(div_5, div_3);
				appendNode(div_6, div_5);
				appendNode(label, div_6);
				appendNode(text_9, div_6);
				appendNode(input, div_6);

				input.value = state.currentUser.data.username;

				appendNode(text_11, div_5);
				appendNode(div_7, div_5);
				appendNode(label_1, div_7);
				appendNode(text_13, div_7);
				appendNode(input_1, div_7);

				input_1.value = state.currentUser.data.nameFirst;

				appendNode(text_15, div_5);
				appendNode(div_8, div_5);
				appendNode(label_2, div_8);
				appendNode(text_17, div_8);
				appendNode(input_2, div_8);

				input_2.value = state.currentUser.data.nameLast;

				appendNode(text_19, div_5);
				appendNode(div_9, div_5);
				appendNode(label_3, div_9);
				appendNode(text_21, div_9);
				appendNode(input_3, div_9);

				input_3.value = state.currentUser.data.phone;

				appendNode(text_23, div_5);
				appendNode(div_10, div_5);
				appendNode(label_4, div_10);
				appendNode(text_25, div_10);
				appendNode(select, div_10);
				appendNode(option, select);

				option.__value = option.textContent;

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				var value = state.currentUser.data.timezone;
				for (var i = 0; i < select.options.length; i += 1) {
					var option_1 = select.options[i];

					if (option_1.__value === value) {
						option_1.selected = true;
						break;
					}
				}

				appendNode(text_28, div_5);
				appendNode(div_11, div_5);
				appendNode(span_1, div_11);
				appendNode(text_30, div_11);
				appendNode(div_12, div_11);
				tilmeldchangepassword._mount(div_12, null);
				appendNode(text_34, div_3);
				appendNode(div_13, div_3);
				appendNode(button_1, div_13);
				appendNode(text_36, div_13);
				appendNode(button_2, div_13);
			},

			p: function update(changed, state) {
				if (!input_updating) {
					input.value = state.currentUser.data.username;
				}

				if (!input_1_updating) {
					input_1.value = state.currentUser.data.nameFirst;
				}

				if (!input_2_updating) {
					input_2.value = state.currentUser.data.nameLast;
				}

				if (!input_3_updating) {
					input_3.value = state.currentUser.data.phone;
				}

				option.__value = option.textContent;

				var timezones = state.clientConfig.timezones;

				if (changed.clientConfig) {
					for (var i = 0; i < timezones.length; i += 1) {
						if (each_blocks[i]) {
							each_blocks[i].p(changed, state, timezones, timezones[i], i);
						} else {
							each_blocks[i] = create_each_block(state, timezones, timezones[i], i, component);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = timezones.length;
				}

				if (!select_updating) {
					var value = state.currentUser.data.timezone;
					for (var i = 0; i < select.options.length; i += 1) {
						var option_1 = select.options[i];

						if (option_1.__value === value) {
							option_1.selected = true;
							break;
						}
					}
				}
			},

			u: function unmount() {
				detachNode(div);
				detachNode(text_1);
				detachNode(div_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				logalyzerapp.destroy(false);
				removeListener(input, "input", input_input_handler);
				removeListener(input_1, "input", input_1_input_handler);
				removeListener(input_2, "input", input_2_input_handler);
				removeListener(input_3, "input", input_3_input_handler);

				destroyEach(each_blocks);

				removeListener(select, "change", select_change_handler);
				tilmeldchangepassword.destroy(false);
				removeListener(button_1, "click", click_handler);
			}
		};
	}

	function select_block_type(state) {
		if (state.userAvatar !== null) return create_if_block_3;
		return create_if_block_4;
	}

	function MainApp(options) {
		init(this, options);
		this._state = assign(data(), options.data);

		var _oncreate = oncreate.bind(this);

		if (!options._root) {
			this._oncreate = [_oncreate];
			this._beforecreate = [];
			this._aftercreate = [];
		} else {
			this._root._oncreate.push(_oncreate);
		}

		this._fragment = create_main_fragment(this._state, this);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(MainApp.prototype, methods, {
		destroy: destroy,
		get: get,
		fire: fire,
		observe: observe,
		on: on,
		set: set,
		teardown: destroy,
		_set: _set,
		_mount: _mount,
		_unmount: _unmount
	});

	MainApp.prototype._recompute = noop;

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function noop() {}

	function setAttribute(node, attribute, value) {
		node.setAttribute(attribute, value);
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function destroyEach(iterations) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d();
		}
	}

	function init(component, options) {
		component.options = options;

		component._observers = { pre: blankObject(), post: blankObject() };
		component._handlers = blankObject();
		component._root = options._root || component;
		component._yield = options._yield;
		component._bind = options._bind;
	}

	function assign(target) {
		var k,
		    source,
		    i = 1,
		    len = arguments.length;
		for (; i < len; i++) {
			source = arguments[i];
			for (k in source) {
				target[k] = source[k];
			}
		}

		return target;
	}

	function callAll(fns) {
		while (fns && fns.length) {
			fns.pop()();
		}
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = this.get = noop;

		if (detach !== false) this._fragment.u();
		this._fragment.d();
		this._fragment = this._state = null;
	}

	function get(key) {
		return key ? this._state[key] : this._state;
	}

	function fire(eventName, data) {
		var handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			handlers[i].call(this, data);
		}
	}

	function observe(key, callback, options) {
		var group = options && options.defer ? this._observers.post : this._observers.pre;

		(group[key] || (group[key] = [])).push(callback);

		if (!options || options.init !== false) {
			callback.__calling = true;
			callback.call(this, this._state[key]);
			callback.__calling = false;
		}

		return {
			cancel: function cancel() {
				var index = group[key].indexOf(callback);
				if (~index) group[key].splice(index, 1);
			}
		};
	}

	function on(eventName, handler) {
		if (eventName === 'teardown') return this.on('destroy', handler);

		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function cancel() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this._root._lock) return;
		this._root._lock = true;
		callAll(this._root._beforecreate);
		callAll(this._root._oncreate);
		callAll(this._root._aftercreate);
		this._root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
		    changed = {},
		    dirty = false;

		for (var key in newState) {
			if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign({}, oldState, newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
	}

	function _mount(target, anchor) {
		this._fragment.m(target, anchor);
	}

	function _unmount() {
		this._fragment.u();
	}

	function blankObject() {
		return Object.create(null);
	}

	function differs(a, b) {
		return a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' || typeof a === 'function';
	}

	function dispatchObservers(component, group, changed, newState, oldState) {
		for (var key in group) {
			if (!changed[key]) continue;

			var newValue = newState[key];
			var oldValue = oldState[key];

			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}
	exports.default = MainApp;
});

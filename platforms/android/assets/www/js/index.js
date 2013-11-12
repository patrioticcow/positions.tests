var app = {
	initialize     : function () {
		this.bindEvents ();
	},
	bindEvents     : function () {
		document.addEventListener ('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady  : function () {
		window.deviceReady = true;
		document.addEventListener ("resume", this.onResume, false);
		document.addEventListener ("pause", this.onPause, false);
		document.addEventListener ("backbutton", this.pressBackButton, false);

		var connection = app.checkConnection ('deviceready');
		alert (connection);
	},
	checkConnection: function (id) {
		var networkState = navigator.connection.type, states = {};
		states[Connection.UNKNOWN] = 'Unknown';
		states[Connection.ETHERNET] = 'Ethernet';
		states[Connection.WIFI] = 'WiFi';
		states[Connection.CELL_2G] = '2G';
		states[Connection.CELL_3G] = '3G';
		states[Connection.CELL_4G] = '4G';
		states[Connection.NONE] = 'None';

		alert (states[networkState]);
		return states[networkState];
	},
	onResume       : function () {
		alert ('onResume');
	},
	onPause        : function () {
		alert ('onResume');
	},
	pressBackButton: function () {
		alert ('onResume');
	}
};

$ (function () {
	FastClick.attach (document.body);
});

var rest = 'http://audio.stories.massinflux.com/rest/',
	madiaUrl = 'http://audio.stories.media.massinflux.com/',
	my_media = null,
	dur = null,
	baseUrl = null,
	roundPosition = null,
	roundDur = null,
	email = window.localStorage.getItem ("email"),
	user_id = window.localStorage.getItem ("user_id"),
	obj = null;

$ (document).on ("pageinit", function () {

});

$ (document).on ('pageinit', '#index-page', function () {
	if (email) {
		$ ('#login_button').addClass ('ui-state-disabled');
		$ ('#register_button').addClass ('ui-state-disabled');
	}

	$("#jquery_jplayer_1").jPlayer({
		ready: function(event) {
			$(this).jPlayer("setMedia", {
				mp3: "http://audio.stories.media.massinflux.com/all_she_wants_to_do_is_fuck/all_she_wants_to_do_is_fuck.mp3"
			});
		},
		supplied: "mp3"
	});

});

$ (document).on ('pageshow', '#main-page', function () {
	console.log ('main-page');
	getCategories ();
});

$ (document).on ('pageshow', '#stories-page', function () {
	console.log ('stories-page');

	var category = getUrlId ('category');
	getStories (category);

	$ (document).on ("click", '.paypall_buy_button', function () {
		var price = $ (this).data ('price');
		var desc = $ (this).data ('desc');
		var story_id = $ (this).data ('story');

		buy (price, desc, story_id);
	});
});

$ (document).on ('pageshow', '#user-stories-page', function () {
	getUserStories ();
});

$ (document).on ('pageshow', '#text-page', function () {
	obj = getStoryById ();
	var storyContainer = $ ('.story');

	if (typeof getUrlId ('sample') !== 'undefined') {
		storyContainer.html (obj.story.truncate (1000));
	}
	else {
		$ ('.title').html ('<h3>' + getTitle (obj.title) + '</h3>');
		storyContainer.html (obj.story);
	}
});

$ (document).on ('pageshow', '#audio-page', function () {
	//ensureUserExist ();

	obj = getStoryById ();

	baseUrl = madiaUrl + obj.title + '/' + obj.title;
	window.localStorage.setItem ("base_url", baseUrl);

	if (obj.is_interactive === '1') {
		$ ('.show_interactivity').show ();
	}

	// set initial media file to play
	window.localStorage.setItem ("src", baseUrl + ".mp3");
	$ ('#interactivity').on ('change', function () {
		stopAudio ();
		if ($ (this).val () === 'on') {
			window.localStorage.setItem ("src", baseUrl + '_1' + ".mp3");
		}
		else {
			window.localStorage.setItem ("src", baseUrl + ".mp3");
		}
	});

	// set file title
	$ ('.media_name').html (getTitle (obj.title));

	$ ('.playAudio').on ("click", function () {
		window.localStorage.setItem ("go-to", 1);
		playAudio ();
	});
	$ ('.pauseAudio').on ("click", function () {
		pauseAudio ();
	});
	$ ('.stopAudio').on ("click", function () {
		stopAudio ();
	});
	$ ('.time_slider').on ("slidestop", function () {
		var timerVal = $ (this).val ();
		seekAudio (timerVal * 1000);
	});
	$ ('.restartAudio').on ("click", function () {
		window.localStorage.setItem ("go-to", 1);
		playChapter (1);
	});
});

$ (document).on ('pageinit', '#login-page', function () {
	parseForm ();
});
$ (document).on ('pageinit', '#register-page', function () {
	parseForm ();
});

function ensureUserExist () {
	var indexLogin = $ ('.index_login');
	var indexStories = $ ('.index_stories');

	var userId = window.localStorage.getItem ("user_id");
	if (!userId) {
		$.mobile.pageContainer.pagecontainer ("change", "login.html", {reloadPage: true});
		indexLogin.show ();
	}
	else {
		indexStories.show ();
		indexLogin.hide ();
	}
}

function getTitle (val) {
	var title = val.replace (/_/g, ' ');
	return title.charAt (0).toUpperCase () + title.slice (1);
}

function getStoryById () {
	var data = JSON.parse (window.localStorage.getItem ("stories"));

	return data[getUrlId ('category')][getUrlId ('id')];
}

function getCategories () {
	var stories = $ ('.categories');
	var storiesStorage = window.localStorage.getItem ("stories");

	if (storiesStorage) {
		stories.html (parseCategories (JSON.parse (storiesStorage)));
		stories.enhanceWithin ();
	}
	else {
		$.when (sendAjax ({}, 'get-stories')).then (function (data) {
			$.mobile.loading ("hide");
			window.localStorage.setItem ("stories", JSON.stringify (data));
			stories.html (parseCategories (data));
			stories.enhanceWithin ();
		});
	}
}

function getStories (category) {
	console.log ('getStories');
	var stories = $ ('.stories');
	var storiesStorage = window.localStorage.getItem ("stories");
	var obj = JSON.parse (storiesStorage);

	if (storiesStorage) {
		stories.html (parseStories (obj[category]));
		stories.enhanceWithin ();
	}
	else {
		$.mobile.pageContainer.pagecontainer ("change", "main.html", {reloadPage: true});
	}
}

function getUserStories () {
	console.log ('getUserStories');
	var stories = $ ('.user-stories');
	var storiesStorage = window.localStorage.getItem ("user-stories");

	if (storiesStorage) {
		stories.html (parseStories (JSON.parse (storiesStorage)));
		stories.enhanceWithin ();
	}
	else {
		var userId = window.localStorage.getItem ("user_id");
		$.when (sendAjax ({user_id: userId}, 'get-user-stories')).then (function (data) {
			$.mobile.loading ("hide");
			window.localStorage.setItem ("user-stories", JSON.stringify (data));
			stories.html (parseCategories (data));
			stories.enhanceWithin ();
		});
	}
}

function parseCategories (data) {
	var html = '';

	if (!$.isEmptyObject (data)) {

		html += '<ul data-role="listview" data-inset="true">';
		$.each (data, function (index, value) {
			html += '<li><a href="stories.html?category=' + index + '">' + getTitle (index) + ' <span class="ui-li-count">' + value.length + '</span></a></li>';
		});
		html += '</ul>';
	}
	else {
		html += '<div class="ui-body ui-body-c ui-corner-all" style="text-align: center;">';
		html += '<h2>You have no Stories</h2>';
		html += '</ul>';
	}

	return html;
}

function parseStories (data) {
	var html = '';
	var cat = getUrlId ('category');
	if (!$.isEmptyObject (data)) {
		html += '<ul data-role="listview" data-autodividers="false" data-filter="true" data-theme="a" data-inset="true">';

		$.each (data, function (index, value) {
			var p = '';
			if (typeof value.user_id === 'undefined') {
				p = '<span style="float: right;">$' + value.price + '</span>';
			}

			var d = '<span class="small_date"> - ' + getTitle (value.category) + '<small> - ' + value.created.mday + '.' + value.created.mon + '.' + value.created.year + '</small></span>';

			html += '<li>';
			html += '<div data-role="collapsible">';
			html += '<h5>' + getTitle (value.title).truncate (20) + p + d + '</h5>';
			if (value.is_free === '1' || typeof value.user_id !== 'undefined' || value.stories_story_id !== null) {
				html += '<a class="ui-btn ui-btn-inline" href="audio.html?category=' + cat + '&id=' + index + '" class="ui-btn ui-btn-inline">audio version</a>';
				html += '<a class="ui-btn ui-btn-inline" href="text.html?category=' + cat + '&id=' + index + '" class="ui-btn ui-btn-inline">text version</a>';
			}
			else if (typeof value.user_id === 'undefined') {
				html += '<button class="ui-btn ui-btn-inline paypall_buy_button" data-story="' + value.id + '" data-desc="' + getTitle (value.title) + '" data-price="' + value.price + '">buy story</button>';
				html += '<a class="ui-btn ui-btn-inline" href="text.html?category=' + cat + '&id=' + index + '&sample=true" class="ui-btn ui-btn-inline">text sample</a>';
			}
			html += '</div>';
			html += '</li>';
		});

		html += '</ul>';
	}
	else {
		html += '<div class="ui-body ui-body-c ui-corner-all" style="text-align: center;">';
		html += '<h2>You have no Stories</h2>';
		html += '</ul>';
	}

	return html;
}

function parseForm () {
	/**
	 * login
	 */
	$ ('#login_submit').on ('click', function (e) {
		e.preventDefault ();
		var loginForm = $ ('#login_form').serializeArray ();

		if (validateForms ('login')) {
			$.when (sendAjax (loginForm, 'login')).then (function (data) {
				$.mobile.loading ("hide");
				if (data === 'fail') {
					showAlert ('Wrong username or password. Please try again', '');
				}
				else if (data.id != null) {
					$.when (setInitialValues (data)).then (function () {
						$.mobile.pageContainer.pagecontainer ("change", "index.html", {reloadPage: true});
					});
				}
				else {
					showAlert ('There was a problen with our system. We are on it!', '');
				}
			});
		}
	});

	/**
	 * register
	 */
	$ ('#register_submit').on ('click', function (e) {
		e.preventDefault ();
		var registerForm = $ ('#register_form').serializeArray ();

		if (validateForms ('register')) {
			$.when (sendAjax (registerForm, 'register')).then (function (data) {
				console.log (data);

				if (data === 'duplicate_email') {
					showAlert ('This email already exists. Please choose another one', '');
					return false;
				}
				else {
					showAlert ('Registration is successful', '');
					$.mobile.changePage ("index.html");
				}
			});
		}
	});
}

function validateForms (name) {
	if (name == 'login') {
		var loginEmail = $ ('#login_email').val ();
		var loginPass = $ ('#login_password').val ();
		if (loginEmail === '') {
			showAlert ('Email is empty.', '');
			return false;
		}
		if (VALIDATORS.isValidEmailAddress (loginEmail) === false) {
			showAlert ('Email is not valid.', '');
			return false;
		}
		if (loginPass === '') {
			showAlert ('Please enter a password', '');
			return false;
		}
	}

	if (name == 'register') {
		var registerEmail = $ ('#register_email').val ();
		var registerName = $ ('#register_name').val ();
		var registerPass = $ ('#register_password').val ();
		var registerPassValid = $ ('#register_password_validate').val ();
		if (registerEmail === '') {
			showAlert ('Email is empty.', '');
			return false;
		}
		if (VALIDATORS.isValidEmailAddress (registerEmail) === false) {
			showAlert ('Email is not valid.', '');
			return false;
		}
		if (registerName === '') {
			showAlert ('Please enter your name', '');
			return false;
		}
		if (registerName.length < 3) {
			showAlert ('Name must be at least 4 characters long', '');
			return false;
		}
		if (registerPass === '') {
			showAlert ('Please enter a password', '');
			return false;
		}
		if (registerPass.length < 3) {
			showAlert ('Password must be at least 4 characters long', '');
			return false;
		}
		if (registerPassValid === '') {
			showAlert ('Please verify password', '');
			return false;
		}
		if (registerPass !== registerPassValid) {
			showAlert ('Password must match', '');
			return false;
		}
	}

	return true;
}

function sendAjax (data, type) {
	$.mobile.loading ("show");
	return $.ajax ({
		type    : "GET",
		dataType: "jsonp",
		url     : rest + type,
		data    : data
	});
}

function setInitialValues (data) {
	var deferred = jQuery.Deferred ();

	window.localStorage.setItem ("user_id", data.id);
	window.localStorage.setItem ("name", data.name);
	window.localStorage.setItem ("email", data.email);
	window.localStorage.setItem ("created_day", data.created.mday);
	window.localStorage.setItem ("created_month", data.created.mon);
	window.localStorage.setItem ("created_year", data.created.year);

	deferred.resolve ();
	return deferred.promise ();
}

function openLoader () {
	var $this = $ (this);
	$.mobile.loading ("show", {
		text       : 'loading',
		textVisible: true,
		theme      : 'b',
		textonly   : !!$this.jqmData ("textonly"),
		html       : $this.jqmData ("html") || ""
	});
}

function closeLoader () {
	$.mobile.loading ("hide");
}

function showAlert (message, title) {
	//navigator.notification.alert(message, null, title, 'Ok');
	// TODO remove alert
	alert (title ? (title + ": " + message) : message);
}

function loader (hide) {
	if (hide === 'hide') {
		$.mobile.loading ("hide");
	}
	else {
		$.mobile.loading ('show', {
			text       : 'loading',
			textVisible: true
		});
	}
}

function getUrlId (type) {
	var url = purl ();
	return purl (url.attr ('fragment')).param (type);
}

//////////////////////////////////////////////
var mediaTimer = null;
var mediaDuration = null;

function playAudio () {
	$.mobile.loading ("show");
	var src = window.localStorage.getItem ("src");
	console.log (src);
	my_media = new Media (src, onSuccess, onError, mediaStatus);

	my_media.play ();

	updateFileSize ();
	updateMediaPosition ();
}

function updateFileSize () {
	if (mediaDuration == null) {
		mediaDuration = setInterval (function () {
			var mediaDuration = $ ('.media_duration');
			var timeSlider = $ ('.time_slider');
			dur = my_media.getDuration ();
			var newDur = 0;
			if (dur >= 0 && dur < 60) {
				newDur = Math.round (dur);
				mediaDuration.html (newDur + " seconds");
				timeSlider.attr ('max', newDur);
			}
			else if (dur >= 0) {
				newDur = Math.round (dur) / 60;
				mediaDuration.html (newDur + " min");
				timeSlider.attr ('max', newDur * 60);
			}
		}, 1000);
	}
}

// Update my_media position every second
function updateMediaPosition () {
	if (mediaTimer == null) {
		mediaTimer = setInterval (function () {
			my_media.getCurrentPosition (
				function (position) {
					if (position > -1) {
						roundPosition = Math.round (position);
						roundDur = Math.round (dur);

						setAudioPosition (Math.ceil (position));
					}
				},
				function (e) {
					console.log ("Error getting pos=" + e);
					setAudioPosition ("Error: " + e);
				});
		}, 1000);
	}
}

// mediaStatus Callback
function mediaStatus (status) {
	console.log ("-------------- media status: " + status);
	$.mobile.loading ("hide");
	if (status === 4) { // stop or finidh
		if (roundPosition === (roundDur - 1) || roundPosition == roundDur) { // finish
			stopAudio ();
			showInteractivityControls ();
		}
	}
}

function showInteractivityControls () {

	var pos = window.localStorage.getItem ("go-to");

	$ ('#options').html (optionsDialog (obj.options[pos + '_']));
	$ ('#optionsDialog').trigger ('create').popup ('open');

	$ ('.select_option').on ("click", function () {
		var goTo = $ (this).data ("goTo");

		if (typeof goTo !== 'undefined') {
			window.localStorage.setItem ("go-to", goTo);
			$ ('#optionsDialog').popup ('close');
			playChapter (goTo);
		}
	});
}

function playChapter (goTo) {
	var u = window.localStorage.getItem ("base_url");
	var v = u + '_' + goTo + ".mp3";
	dur = null;
	window.localStorage.setItem ("src", v);
	playAudio ();
}

// Pause audio
function pauseAudio () {
	if (my_media) {
		my_media.pause ();
	}
}

// Stop audio
function stopAudio () {
	if (my_media) {
		my_media.stop ();
		releaseAudio ();
	}
	setAudioPosition (0);
	clearInterval (mediaTimer);
	clearInterval (mediaDuration);
	mediaTimer = null;
	mediaDuration = null;
}

// Release audio
function releaseAudio () {
	if (my_media) {
		my_media.release ();
	}
}

// onSuccess Callback
function onSuccess () {
	console.log ("playAudio(): Audio Success");
}

function seekAudio (timerVal) {
	if (my_media) {
		my_media.seekTo (timerVal);
	}
}

// onError Callback
function onError (error) {
	console.log ('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

// Set audio position
function setAudioPosition (position) {
	$ ('.time_slider').val (position).slider ("refresh");
}
// Get audio position
function getAudioPosition () {
	$ ('.time_slider').val ();
}

function optionsDialog (options) {
	var opt = '';
	$.each (options, function (key, val) {
		opt += '<a href="#" data-role="button" class="select_option" data-go-to="' + val.go_to + '" data-theme="b">' + val.question + '</a>';
	});
	opt += '<a href="#" data-role="button" class="select_option" data-go-to="1" data-theme="a">Restart Story</a>';
	opt += '<a href="#" data-role="button" class="select_option ui-group-theme-c" data-rel="back">Close</a>';

	return opt;
}

function buy (price, desc, story_id) {
	window.plugins.PayPalMobile.setEnvironment ("PayPalEnvironmentSandbox");

	var payment = new PayPalPayment (price, "USD", desc);
	console.log (payment);

	var completionCallback = function (proofOfPayment) {
		// see https://developer.paypal.com/webapps/developer/docs/integration/mobile/verify-mobile-payment/ for details.
		console.log ("Proof of payment: " + JSON.stringify (proofOfPayment));
		window.localStorage.removeItem ("stories");
		alert ('Payment was successful');
		setPayments (proofOfPayment, story_id);
	}

	var cancelCallback = function (reason) {
		console.log ("Payment cancelled: " + reason);
	}

	window.plugins.PayPalMobile.presentPaymentUI (
		"AVbxWxDm64rHf1jT6aBXzECf8xZQuwbjF7GxgPeHZgjPkrFmapuqr2GBlTal",
		"123websitesmadeeasy@gmail.com",
		email,
		payment,
		completionCallback,
		cancelCallback
	);
}

function setPayments (proofOfPayment, story_id) {
	var userId = window.localStorage.getItem ("user_id");
	$.when (sendAjax ({params: proofOfPayment, user_id: userId, story_id: story_id}, 'set-payments')).then (function () {
		$.mobile.loading ("hide");
		$.mobile.pageContainer.pagecontainer ("change", "index.html", {reloadPage: true});
	});
}

String.prototype.truncate =
	function (n, useWordBoundary) {
		var toLong = this.length > n,
			s_ = toLong ? this.substr (0, n - 1) : this;
		s_ = useWordBoundary && toLong ? s_.substr (0, s_.lastIndexOf (' ')) : s_;
		return  toLong ? s_ + '&hellip;' : s_;
	};
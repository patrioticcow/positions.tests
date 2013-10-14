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
		return states[networkState];
	},
	onResume       : function () {
		showAlert ('onResume', '');
	},
	onPause        : function () {
		showAlert ('onResume', '');
	},
	pressBackButton: function () {
		showAlert ('onResume', '');
	}
};

var rest = 'http://sex.123easywebsites.com/rest/',
	madiaUrl = 'http://sex.123easywebsites.com/audio/',
	my_media = null,
	dur = null,
	audioChapters = [],
	baseUrl = null,
	roundPosition = null,
	roundDur = null,
	obj = null;

$ (document).on ("pageinit", function () {
	console.log ("%c first time", "color: blue;");

});

$ (document).on ('pageinit', '#index-page', function () {
	console.log ("%c pageload loginPage", "color: blue;");
	var buyButton = document.getElementById ("buy");
	buyButton.onclick = function (e) {

		// See PayPalMobilePGPlugin.js for full documentation
		// set environment you want to use
		window.plugins.PayPalMobile.setEnvironment ("PayPalEnvironmentSandbox");

		// create a PayPalPayment object, usually you would pass parameters dynamically
		var payment = new PayPalPayment ("1.99", "USD", "Awesome saws");
		console.log (payment);
		// define a callback when payment has been completed
		var completionCallback = function (proofOfPayment) {
			// TODO: Send this result to the server for verification;
			// see https://developer.paypal.com/webapps/developer/docs/integration/mobile/verify-mobile-payment/ for details.
			console.log ("Proof of payment: " + JSON.stringify (proofOfPayment));
		}

		// define a callback if payment has been canceled
		var cancelCallback = function (reason) {
			console.log ("Payment cancelled: " + reason);
		}

		// launch UI, the PayPal UI will be present on screen until user cancels it or payment completed
		window.plugins.PayPalMobile.presentPaymentUI ("YOUR_CLIENT_ID", "YOUR_PAYPAL_EMAIL_ADDRESS", "someuser@somedomain.com", payment, completionCallback, cancelCallback);
	}
});

$ (document).on ('pageshow', '#main-page', function () {
	console.log ("%c pageload mainPage", "color: blue;");
	getStories ();
});

$ (document).on ('pageshow', '#text-page', function () {
	obj = getStoryById ();

	$ ('.title').html ('<h3>' + obj.title + '</h3>');
	$ ('.story').html (obj.story);
});

$ (document).on ('pageshow', '#audio-page', function () {

	obj = getStoryById ();

	baseUrl = madiaUrl + obj.title + '/' + obj.title;
	window.localStorage.setItem ("base_url", baseUrl);

	if (obj.is_interactive === '1') {
		$ ('.show_interactivity').show ();
	}

	// set initial media file to play
	window.localStorage.setItem ("src", madiaUrl + obj.title + '/' + obj.title + ".mp3");
	$ ('#interactivity').on ('change', function () {
		stopAudio ();
		if ($ (this).val () === 'on') {
			window.localStorage.setItem ("src", madiaUrl + obj.title + '/' + obj.title + '_1' + ".mp3");
		}
		else {
			window.localStorage.setItem ("src", madiaUrl + obj.title + '/' + obj.title + ".mp3");
		}
	});

	// set file title
	$ ('.media_name').html (getTitle (obj.title));

	$ ('.playAudio').on ("vclick", function () {
		window.localStorage.setItem ("go-to", 1);
		playAudio ();
	});
	$ ('.pauseAudio').on ("vclick", function () {
		pauseAudio ();
	});
	$ ('.stopAudio').on ("vclick", function () {
		stopAudio ();
	});

	$ ('#time_slider').on ("slidestop", function () {
		var timerVal = $ (this).val ();
		seekAudio (timerVal * 1000);
	});
});

$ (document).on ('pageinit', '#login-page', function () {
	parseForm ();
});
$ (document).on ('pageinit', '#register-page', function () {
	parseForm ();
});

function getTitle (val) {
	var title = val.replace (/_/g, ' ');
	return title.charAt (0).toUpperCase () + title.slice (1);
}

function getStoryById () {
	var data = JSON.parse (window.localStorage.getItem ("stories"));
	return data[getUrlId ()];
}

function getStories () {
	var stories = $ ('#stories');
	var storiesStorage = window.localStorage.getItem ("stories");

	if (storiesStorage) {
		stories.html (parseStories (JSON.parse (storiesStorage)));
		stories.enhanceWithin ();
	}
	else {
		$.when (sendAjax ({}, 'get-stories')).then (function (data) {
			window.localStorage.setItem ("stories", JSON.stringify (data));
			stories.html (parseStories (data));
			stories.enhanceWithin ();
		});
	}
}

function parseStories (data) {
	var html = '<ul data-role="listview" data-autodividers="true" data-filter="true" data-inset="true">';

	$.each (data, function (index, value) {
		html += '<li>' + '<div data-role="collapsible">' + '<h4>' + value.title + '</h4>' + '<a href="audio.html?id=' + index + '" class="ui-btn ui-btn-inline">play audio</a>' + '<a href="text.html?id=' + index + '" class="ui-btn ui-btn-inline">read text</a>' + '</div>' + '</li>';
	});

	html += '</ul>';

	return html;
}

function parseForm () {
	/**
	 * login
	 */
	$ ('#login_submit').on ('vclick', function (e) {
		e.preventDefault ();
		var loginForm = $ ('#login_form').serializeArray ();

		if (validateForms ('login')) {
			$.when (sendAjax (loginForm, 'login')).then (function (data) {
				console.log (data);

				if (data === 'fail') {
					showAlert ('Wrong username or password. Please try again', '');
				}
				else if (data.id != null) {
					setInitialValues (data);
					$.mobile.changePage ("main.html", {reloadPage: true});
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
	$ ('#register_submit').on ('vclick', function (e) {
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
	return $.ajax ({
		type    : "GET",
		dataType: "jsonp",
		url     : rest + type,
		data    : data
	});
}

function setInitialValues (data) {
	window.localStorage.setItem ("user_id", data.id);
	window.localStorage.setItem ("name", data.name);
	window.localStorage.setItem ("email", data.email);
	window.localStorage.setItem ("created_day", data.created.mday);
	window.localStorage.setItem ("created_month", data.created.mon);
	window.localStorage.setItem ("created_year", data.created.year);
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

function getUrlId () {
	var url = purl ();
	return purl (url.attr ('fragment')).param ('id');
}

//////////////////////////////////////////////
var mediaTimer = null;
var mediaDuration = null;

function playAudio () {
	var src = window.localStorage.getItem ("src");
	my_media = new Media (src, onSuccess, onError, mediaStatus);

	my_media.play ();

	updateFileSize ();
	updateMediaPosition ();
}

function updateFileSize () {
	if (mediaDuration == null) {
		mediaDuration = setInterval (function () {
			var mediaDuration = $ ('#media_duration');
			var timeSlider = $ ('#time_slider');
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
	console.log ('+++' + "media status: " + status);

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

	$ ('.select_option').on ("vclick", function () {
		var goTo = $ (this).data ("goTo");
		window.localStorage.setItem ("go-to", goTo);
		$ ('#optionsDialog').popup ('close');
		playChapter (goTo);
	});
}

function playChapter (goTo) {
	var u = window.localStorage.getItem ("base_url");
	var v = u + '_' + goTo + ".mp3";
	dur = null;
	window.localStorage.setItem ("src", v);

	console.log ('************' + v);

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
	$ ('#time_slider').val (position).slider ("refresh");
}
// Get audio position
function getAudioPosition () {
	$ ('#time_slider').val ();
}

function optionsDialog (options) {
	var opt = '';
	$.each (options, function (key, val) {
		opt += '<a href="#" data-role="button" class="select_option" data-go-to="' + val.go_to + '" data-theme="b">' + val.question + '</a>';
	});

	return opt;
}

String.prototype.toHHMMSS = function () {
	var sec_num = parseInt (this, 10);
	var hours = Math.floor (sec_num / 3600);
	var minutes = Math.floor ((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = minutes + ':' + seconds;
	return time;
}
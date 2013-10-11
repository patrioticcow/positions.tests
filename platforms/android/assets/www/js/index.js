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

var rest = 'http://sex.123easywebsites.com/rest/';
var madiaUrl = 'http://sex.123easywebsites.com/audio/';
var my_media = null;
var dur = null;
var audioChapters = [];

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
	console.log ("%c pageload textPage", "color: blue;");
	var obj = getStoryById ();
	$ ('.title').html ('<h3>' + obj.title + '</h3>');
	$ ('.story').html (obj.story);
});

$ (document).on ('pageshow', '#audio-page', function () {
	console.log ("%c pageload audioPage", "color: blue;");
	var obj = getStoryById ();
	var chapters = parseInt (obj.chapters);

	for (var i = 1; i <= chapters; i++) {
		audioChapters.push (madiaUrl + obj.title + '/' + obj.title + '_' + i + ".mp3");
	}

	console.log (audioChapters);
	console.log (obj);

	//var src = madiaUrl + obj.title + ".mp3";

	$ ('#media_name').html (getTitle (obj.title));

	window.localStorage.setItem ("chapter", 0);

	my_media = new Media (audioChapters[0], onSuccess, onError, mediaStatus);

	$ ('.playAudio').on ("vclick", function () {
		playAudio (my_media);
	});
	$ ('.pauseAudio').on ("vclick", function () {
		pauseAudio (my_media);
	});
	$ ('.stopAudio').on ("vclick", function () {
		stopAudio (my_media);
		releaseAudio (my_media);
	});

	$ ('#time_slider').on ("slidestop", function () {
		var timerVal = $ (this).val ();
		seekAudio (my_media, timerVal * 1000);
	});
});

$ (document).on ('pageinit', '#login-page', function () {
	console.log ("%c pageload loginPage", "color: blue;");
	// deals with the form
	parseForm ();
});

$ (document).on ('pageinit', '#register-page', function () {
	console.log ("%c pageload registerPage", "color: blue;");
	// deals with the form
	parseForm ();
});

function getMediaPath (int) {
	var curChapter = parseInt (window.localStorage.getItem ("chapter")) + int;
	return audioChapters[curChapter];
}

function getTitle (val) {
	var title = val.replace ('_', ' ');
	return title.charAt (0).toUpperCase () + title.slice (1);
}

function getStoryById () {
	var data = JSON.parse (window.localStorage.getItem ("stories"));
	var obj = data[getUrlId ()];

	return obj;
}

function getStories () {
	var stories = $ ('#stories');
	var storiesStorage = window.localStorage.getItem ("stories");

	if (storiesStorage) {
		stories.html (parseStories (JSON.parse (storiesStorage)));
		stories.enhanceWithin ();
	}
	else {
		$.when (sendAjax ({}, 'get-text-stories')).then (function (data) {
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

function playAudio (my_media) {
	my_media.play ();

	updateFileSize (my_media);
	updateMediaPosition (my_media);
}

function updateFileSize (my_media) {
	if (mediaDuration == null) {
		mediaDuration = setInterval (function () {
			var mediaDuration = $ ('#media_duration');
			var timeSlider = $ ('#time_slider');
			dur = my_media.getDuration ();
			var newDur = 0;
			if (dur < 60) {
				newDur = Math.round (dur);
				mediaDuration.html (newDur + " seconds");
				timeSlider.attr ('max', newDur);
			}
			else {
				newDur = Math.round (dur) / 60;
				mediaDuration.html (newDur + " min");
				timeSlider.attr ('max', newDur);
			}
		}, 1000);
	}
}

function updateMediaPosition (my_media) {
	// Update my_media position every second
	if (mediaTimer == null) {
		mediaTimer = setInterval (function () {
			// get my_media position
			my_media.getCurrentPosition (// success callback
				function (position) {
					if (position > -1) {
						setChapters (position, dur);
						setAudioPosition (Math.ceil (position));
					}
				}, // error callback
				function (e) {
					console.log ("Error getting pos=" + e);
					setAudioPosition ("Error: " + e);
				});
		}, 1000);
	}
}

// setChapters
function setChapters (position, dur) {
	var interactivity = $ ('#interactivity');
	var roundPosition = Math.round (position);
	var roundDur = Math.round (dur);

	if (interactivity.val () === 'off') {
		if (roundPosition === roundDur) {
			playNextChapter ();
		}
	}
	if (interactivity.val () === 'on') {
		if (roundPosition === roundDur - 10) {
			showInteractivityControls ();
		}
	}
}

function playNextChapter () {
	mediaTimer = null;
	mediaDuration = null;
	dur = null;
	var curChapter = parseInt (window.localStorage.getItem ("chapter")) + 1;
	window.localStorage.setItem ("chapter", curChapter);

	stopAudio (my_media);
	my_media = new Media (audioChapters[curChapter], onSuccess, onError, mediaStatus);
	playAudio (my_media);
}

function showInteractivityControls () {

}

// Pause audio
function pauseAudio (my_media) {
	if (my_media) {
		my_media.pause ();
	}
}

// Stop audio
function stopAudio (my_media) {
	if (my_media) {
		my_media.stop ();
	}
	setAudioPosition (0);
	clearInterval (mediaTimer);
	mediaTimer = null;
}

// Release audio
function releaseAudio (my_media) {
	if (my_media) {
		my_media.release ();
	}
}

// onSuccess Callback
function onSuccess () {
	console.log ("playAudio(): Audio Success");
}

function seekAudio (my_media, timerVal) {
	if (my_media) {
		my_media.seekTo (timerVal);
	}
}

// mediaStatus Callback
function mediaStatus (status) {
	console.log (status);
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
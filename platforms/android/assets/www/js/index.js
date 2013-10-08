var app = {
	initialize: function () {
		this.bindEvents ();
	},
	bindEvents: function () {
		document.addEventListener ('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady: function () {
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
	onResume: function () {
		showAlert ('onResume', '');
	},
	onPause: function () {
		showAlert ('onResume', '');
	},
	pressBackButton: function () {
		showAlert ('onResume', '');
	}
};

var rest = 'http://sex.123easywebsites.com/rest/';
var madiaUrl = 'http://sex.123easywebsites.com/audio/';

$ (document).on ("pageinit", function () { console.log ("%c first time", "color: blue;");

});

$(document).on('pageinit', '#index-page', function () { console.log("%c pageload loginPage", "color: blue;");
	// for simplicity we have defined a simple buyButton in our index.html
	// `<button id="buyButton" disabled>Buy Now!</button>`
	// and we defined a simple onclick function in our `deviceready` event
	var buyButton = document.getElementById("buy");
	buyButton.onclick = function(e) {

		// See PayPalMobilePGPlugin.js for full documentation
		// set environment you want to use
		window.plugins.PayPalMobile.setEnvironment("PayPalEnvironmentSandbox");

		// create a PayPalPayment object, usually you would pass parameters dynamically
		var payment = new PayPalPayment("1.99", "USD", "Awesome saws");
		console.log(payment);
		// define a callback when payment has been completed
		var completionCallback = function(proofOfPayment) {
			// TODO: Send this result to the server for verification;
			// see https://developer.paypal.com/webapps/developer/docs/integration/mobile/verify-mobile-payment/ for details.
			console.log("Proof of payment: " + JSON.stringify(proofOfPayment));
		}

		// define a callback if payment has been canceled
		var cancelCallback = function(reason) {
			console.log("Payment cancelled: " + reason);
		}

		// launch UI, the PayPal UI will be present on screen until user cancels it or payment completed
		window.plugins.PayPalMobile.presentPaymentUI("YOUR_CLIENT_ID", "YOUR_PAYPAL_EMAIL_ADDRESS", "someuser@somedomain.com", payment, completionCallback, cancelCallback);
	}
});

$(document).on('pageshow', '#main-page', function () { console.log("%c pageload mainPage", "color: blue;");
	getStories();
});

$(document).on('pageshow', '#text-page', function () { console.log("%c pageload textPage", "color: blue;");
	var obj = getStoryById();
	$('.title').html('<h3>' + obj.title + '</h3>');
	$('.story').html(obj.story);
});

$(document).on('pageshow', '#audio-page', function () { console.log("%c pageload audioPage", "color: blue;");
	var obj = getStoryById();
	var src = madiaUrl + obj.title + ".mp3";
	var my_media = new Media(src, onSuccess, onError);

	$('.playAudio').on("click", function(){
		playAudio(my_media);
	});
	$('.pauseAudio').on("click", function(){
		pauseAudio(my_media);
	});
	$('.stopAudio').on("click", function(){
		stopAudio(my_media);
	});
});

$(document).on('pageinit', '#login-page', function () { console.log("%c pageload loginPage", "color: blue;");
	// deals with the form
	parseForm();
});

$(document).on('pageinit', '#register-page', function () { console.log("%c pageload registerPage", "color: blue;");
	// deals with the form
	parseForm();
});

function getStoryById()
{
	var data = JSON.parse(window.localStorage.getItem("stories"));
	var obj = data[getUrlId()];

	return obj;
}

function getStories()
{
	var stories = $('#stories');
	var storiesStorage = window.localStorage.getItem("stories");

	if(storiesStorage){
		stories.html(parseStories(JSON.parse(storiesStorage)));
		stories.enhanceWithin();
	} else {
		$.when(sendAjax({}, 'get-text-stories')).then(function(data){
			window.localStorage.setItem("stories", JSON.stringify(data));
			stories.html(parseStories(data));
			stories.enhanceWithin();
		});
	}
}

function parseStories(data)
{
	var html = '<ul data-role="listview" data-autodividers="true" data-filter="true" data-inset="true">';

	$.each(data, function( index, value ) {
		html += '<li>' +
			'<div data-role="collapsible">' +
				'<h4>' + value.title + '</h4>' +
				'<a href="audio.html?id=' + index + '" class="ui-btn ui-btn-inline">play audio</a>' +
				'<a href="text.html?id=' + index + '" class="ui-btn ui-btn-inline">read text</a>' +
			'</div>' +
		'</li>';
	});

	html += '</ul>';

	return html;
}

function parseForm()
{
	/**
	 * login
	 */
	$('#login_submit').on('click', function (e) {
		e.preventDefault();
		var loginForm = $('#login_form').serializeArray();

		if(validateForms('login')){
			$.when(sendAjax(loginForm, 'login')).then(function(data){
				console.log(data);

				if(data === 'fail'){
					showAlert('Wrong username or password. Please try again', '');
				} else if (data.id != null){
					setInitialValues(data);
					$.mobile.changePage("main.html", {reloadPage:true});
				} else {
					showAlert('There was a problen with our system. We are on it!', '');
				}
			});
		}
	});

	/**
	 * register
	 */
	$('#register_submit').on('click', function (e) {
		e.preventDefault();
		var registerForm = $('#register_form').serializeArray();

		if(validateForms('register')){
			$.when(sendAjax(registerForm, 'register')).then(function(data){
				console.log(data);
				if(data === 'duplicate_email'){
					showAlert('This email already exists. Please choose another one', '');
					return false;
				} else {
					showAlert('Registration is successful', '');
					$.mobile.changePage( "index.html");
				}
			});
		}
	});
}

function validateForms(name)
{
	if(name == 'login'){
		var loginEmail 		= $('#login_email').val();
		var loginPass 		= $('#login_password').val();
		if(loginEmail === ''){ showAlert('Email is empty.', ''); return false;}
		if(VALIDATORS.isValidEmailAddress(loginEmail) === false){ showAlert('Email is not valid.', ''); return false;}
		if(loginPass === ''){showAlert('Please enter a password', ''); return false;}
	}

	if(name == 'register'){
		var registerEmail 		= $('#register_email').val();
		var registerName 		= $('#register_name').val();
		var registerPass 		= $('#register_password').val();
		var registerPassValid 	= $('#register_password_validate').val();
		if(registerEmail === ''){ showAlert('Email is empty.', ''); return false;}
		if(VALIDATORS.isValidEmailAddress(registerEmail) === false){ showAlert('Email is not valid.', ''); return false;}
		if(registerName === ''){showAlert('Please enter your name', ''); return false;}
		if(registerName.length < 3 ){showAlert('Name must be at least 4 characters long', ''); return false;}
		if(registerPass === ''){showAlert('Please enter a password', ''); return false;}
		if(registerPass.length < 3 ){showAlert('Password must be at least 4 characters long', ''); return false;}
		if(registerPassValid === '' ){showAlert('Please verify password', ''); return false;}
		if(registerPass !== registerPassValid ){showAlert('Password must match', ''); return false;}
	}

	return true;
}

function sendAjax(data, type)
{
	return $.ajax({
		type : "GET",
		dataType : "jsonp",
		url : rest + type,
		data : data
	});
}

function setInitialValues(data){
	window.localStorage.setItem("user_id", data.id);
	window.localStorage.setItem("name", data.name);
	window.localStorage.setItem("email", data.email);
	window.localStorage.setItem("created_day", data.created.mday);
	window.localStorage.setItem("created_month", data.created.mon);
	window.localStorage.setItem("created_year", data.created.year);
}

function openLoader() {
	var $this = $( this );
	$.mobile.loading( "show", {
		text: 'loading',
		textVisible: true,
		theme: 'b',
		textonly: !!$this.jqmData( "textonly" ),
		html: $this.jqmData( "html" ) || ""
	});
}

function closeLoader() {
	$.mobile.loading( "hide" );
}

function showAlert(message, title)
{
	//navigator.notification.alert(message, null, title, 'Ok');
	// TODO remove alert
	alert(title ? (title + ": " + message) : message);
}

function loader(hide)
{
	if(hide === 'hide'){
		$.mobile.loading( "hide" );
	} else {
		$.mobile.loading( 'show', {
			text: 'loading',
			textVisible: true
		});
	}
}

function getUrlId()
{
	var url = purl();
	return purl(url.attr('fragment')).param('id');
}


//////////////////////////////////////////////
var mediaTimer = null;

function playAudio(my_media) {
	my_media.play();

	updateFileSize(my_media);
	updateMediaPosition(my_media);
}

function updateFileSize(my_media)
{
	var dur = my_media.getDuration();
	var duration = Math.ceil(dur / 60);
	$('#media_duration').html(duration + " min");
	$('#time_slider').attr('max', duration * 10);
}

function updateMediaPosition(my_media)
{
	// Update my_media position every second
	if (mediaTimer == null) {
		mediaTimer = setInterval(function() {
			// get my_media position
			my_media.getCurrentPosition(
				// success callback
				function(position) {
					if (position > -1) {
						setAudioPosition((Math.ceil(position)) + " sec");
					}
				},
				// error callback
				function(e) {
					console.log("Error getting pos=" + e);
					setAudioPosition("Error: " + e);
				}
			);
		}, 1000);
	}
}

// Pause audio
function pauseAudio(my_media) {
	if (my_media) {
		my_media.pause();
	}
}

// Stop audio
function stopAudio(my_media) {
	if (my_media) {
		my_media.stop();
	}
	clearInterval(mediaTimer);
	mediaTimer = null;
}

// onSuccess Callback
function onSuccess() {
	console.log("playAudio():Audio Success");
}

// onError Callback
function onError(error) {
	alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

// Set audio position
function setAudioPosition(position) {
	document.getElementById('media_played').innerHTML = position;
}
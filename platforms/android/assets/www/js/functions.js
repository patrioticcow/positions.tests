var HELPER = (function () {
	var HELPER = function() {}

	HELPER.serializeObject = function(a) {
		var o = {};
		$.each(a, function() {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	HELPER.isEmpty = function(obj) {
		if (obj === null || obj === undefined) return true;
		if (obj.length && obj.length > 0)    return false;
		if (obj.length === 0)  return true;

		for (var key in obj) {
			if (hasOwnProperty.call(obj, key))    return false;
		}
		return true;
	};

	return HELPER;
})();

var VALIDATORS = (function () {
	var VALIDATORS = function() {}
	VALIDATORS.isValidEmailAddress = function(emailAddress) {
		var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
		return pattern.test(emailAddress);
	};
	VALIDATORS.isValidPhone = function(phone) {
		var phone = parseInt(String(phone).replace(/[^0-9\s]/g, ""));
		return /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test(phone);
	};
	VALIDATORS.isValidZip = function(zip) {
		return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
	};
	VALIDATORS.areaCode = function(code) {
		var areaCode = [201,202,203,204,205,206,207,208,209,210,212,213,214,215,216,217,218,219,224,225,226,228,229,231,234,236,239,240,242,246,248,250,251,252,253,254,256,260,262,
			264,267,268,269,270,276,278,281,283,284,289,301,302,303,304,305,306,307,308,309,310,312,313,314,315,316,317,318,319,320,321,323,325,330,331,334,336,337,339,340,341,345,
			347,351,352,360,361,369,380,385,386,401,402,403,404,405,406,407,408,409,410,412,413,414,415,416,417,418,419,423,424,425,430,431,432,434,435,438,440,442,443,450,464,469,
			470,473,475,478,479,480,484,501,502,503,504,505,506,507,508,509,510,512,513,514,515,516,517,518,519,520,530,539,540,541,551,557,559,561,562,563,564,567,570,571,573,574,
			575,580,585,586,587,601,602,603,604,605,606,607,608,609,610,612,613,614,615,616,617,618,619,620,623,626,627,628,630,631,636,639,641,646,647,649,650,651,657,660,661,662,
			664,669,670,671,678,679,681,682,684,689,701,702,703,704,705,706,707,708,712,713,714,715,716,717,718,719,720,724,727,731,732,734,737,740,747,754,757,758,760,762,763,764,
			765,767,769,770,772,773,774,775,778,779,780,781,784,785,786,787,801,802,803,804,805,806,807,808,809,810,812,813,814,815,816,817,818,819,828,829,830,831,832,835,843,845,
			847,848,849,850,856,857,858,859,860,862,863,864,865,867,868,869,870,872,876,878,901,902,903,904,905,906,907,908,909,910,912,913,914,915,916,917,918,919,920,925,927,928,
			931,935,936,937,939,940,941,947,949,951,952,954,956,957,959,970,971,972,973,975,978,979,980,984,985,989];
		return areaCode.indexOf(code);
	};
	return VALIDATORS;
})();
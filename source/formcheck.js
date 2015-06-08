/*
 * @package FormCheck for Minified.js
 * @depends minimized.js 2014.1.0+
 * @version 1.1.0
 * @authors "Ebben Feagan" <efeagan@skynet-solutions.net>
 * @description Simple form validation for minimized.js
 *
 *
 * ==ClosureCompiler==
 * @compilation_level SIMPLE_OPTIMIZATIONS
 * @output_file_name formcheck.min.js
 * ==/ClosureCompiler==
 */

define('formCheck', function(require) {
	var MINI = require('minified'), $ = MINI.$, _ = MINI._, $$ = MINI.$$; //private ref to Minified
	var SUPPORTS_PLACEHOLDER = 'placeholder' in document.createElement('INPUT')

	var formCheck = function(selector,_options) {

		this.defaultOptions = {
			'options': {
				'display': {
					showErrors: true,
					showErrorMethod: 'popup',
					errorPopupClass: 'fc-tbx',
					popupXoffset: -40,
					popupYoffset: -48,
					popupPosition: 'right',
					errorInlineClass: 'fc-error',
					validateOnInit: false,
					orderByTabIndex: true,
          submitFormIfValid: true,
          placeholderSupport: true,
          scrollToInvalid: true,
          setFocusToInvalid: true
				},
				"alerts" : {
						"required" : "This field is required.",
						"alpha" : "This field accepts alphabetic characters only.",
						"alphanum" : "This field accepts alphanumeric characters only.",
						"nodigit" : "No digits are accepted.",
						"digit" : "Please enter a valid integer.",
						"digitltd" : "The value must be between %0 and %1",
						"number" : "Please enter a valid number.",
						"email" : "Please enter a valid email.",
						"image" : "This field should only contain image types",
						"phone" : "Please enter a valid phone number.",
						"url" : "Please enter a valid url.",
						"matches" : "This field is different from %0",
						"differs" : "This value must be different from %0",
						"length_str" : "The length is incorrect, it must be between %0 and %1",
						"length_fix" : "The length is incorrect, it must be exactly %0 characters",
						"length_max" : "The length is incorrect, it must be at max %0",
						"length_min" : "The length is incorrect, it must be at least %0",
						"checkbox" : "Please check the box",
						"radios" : "Please select one of the options.",
						"select" : "Please choose a value",
						"select_multiple" : "Please choose at least one value",
						"date": "Please enter a valid date",
						"defaultMessage": "You must provide a value for this field."
				},

				regexp : {
						required : /[^.*]/,
						alpha : /^[a-z ._-]+$/i,
						alphanum : /^[a-z0-9 ._-]+$/i,
						digit : /^[-+]?[0-9]+$/,
						nodigit : /^[^0-9]+$/,
						number : /^[-+]?\d*\.?\d+$/,
						email : /^([a-zA-Z0-9_\.\-\+%])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,50})+$/,
						image : /.(jpg|jpeg|png|gif|bmp)$/i,
						phone : /^\+{0,1}[0-9 \(\)\.\-]+$/,
						phone2 : /^[\d\s ().-]+$/,
						phone3 : /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/,
						phone_inter : /^\+{0,1}[0-9 \(\)\.\-]+$/,
						url : /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i,
						date: /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{2,4}$/
				}

			}
		};

		var fc = this;

		formCheck.prototype._initialize = function(selector,_options) {

			this.options = _.copyObj(this.defaultOptions.options);

			this.selector = selector;
			if(!(_.isEmpty(_options))) {
				_.copyObj(_options.display,this.options.display);
				_.copyObj(_options.alerts,this.options.alerts);
				_.copyObj(_options.regexp,this.options.regexp);
			}
			//_.extend(this.options, _options); //merge the default options with passed in options

			this.itemsToValidate = $('input,select,textarea',selector);
			if(_.isEmpty(this.itemsToValidate)) {
				console.log('No inputs on form: ' + selector);
			}
			this.itemsToValidate.each(function(item,index) {
				var el = $(item);
				if(el.get('required')) {
					el.set('required',false);
					el.set('%required',true);
				}
				if(item.type == 'submit') {
					el.onClick(function(e){
            if( fc.options.display.placeholderSupport && !SUPPORTS_PLACEHOLDER ) {
              fc.itemsToValidate.each(function(item,index){
                var el = $(item);
                if((el.get('tagName') == 'INPUT') || (el.get('tagName') == 'TEXTAREA')) {
      						if(el.get('@type') != 'submit') {
                    var elVal = el.get('value');
                    var elDef = el.get('@placeholder');
                    if(elVal == '') {
                      el.set('value',elDef);
                    }
                  }
                }
              });
            }
            return fc._doValidation(e) && fc.options.display.submitFormIfValid;
					});
				}
			});

			if(this.options.display.orderByTabIndex) {
				this.itemsToValidate = this.itemsToValidate.sort(function(a,b) {
					var ati = $(a).get('@tabindex');
					//console.log('ati: ' + ati);
					if(_.isEmpty(ati)) {
						ati = 0;
					} else {
						ati = parseInt(ati);
					}
					var bti = $(b).get('@tabindex');
					//console.log('bti: ' + bti);
					if(_.isEmpty(bti)) {
						bti = 0;
					} else {
						bti = parseInt(bti);
					}
					if(ati < bti) {
						return -1;
					} else {
						if(bti > ati) {
							return 1;
						} else {
							return 0;
						}
					}

				});
			}

			$(selector).on('invalid', function(e) {
				e.preventDefault();
				return false;
			});

			$(selector).on('?submit', function(e) {
        if( fc.options.display.placeholderSupport && !SUPPORTS_PLACEHOLDER ) {
          fc.itemsToValidate.each(function(item,index){
            var el = $(item);
            if((el.get('tagName') == 'INPUT') || (el.get('tagName') == 'TEXTAREA')) {
  						if(el.get('@type') != 'submit') {
                var elVal = el.get('value');
                var elDef = el.get('@placeholder');
                if(elVal == '') {
                  el.set('value',elDef);
                }
              }
            }
          });
        }
				return fc._doValidation(e) && fc.options.display.submitFormIfValid;
			});

      if( fc.options.display.placeholderSupport && !SUPPORTS_PLACEHOLDER ) {
        $(selector).on('formisinvalid',function(){
          fc.itemsToValidate.each(function(item,index){
            var el = $(item);
            if((el.get('tagName') == 'INPUT') || (el.get('tagName') == 'TEXTAREA')) {
  						if(el.get('@type') != 'submit') {
                var elVal = el.get('value');
                var elDef = el.get('@placeholder');
                if(elVal == '') {
                  el.set('value',elDef);
                }
              }
            }
          });
        });
      }

			if( fc.options.display.placeholderSupport && !SUPPORTS_PLACEHOLDER ) {
				fc.itemsToValidate.each(function(item,index) {
					var el = $(item);
					if((el.get('tagName') == 'INPUT') || (el.get('tagName') == 'TEXTAREA')) {
						if(el.get('@type') != 'submit') {
              var defaultValue = el.get('@placeholder');
							if( !(_.isEmpty(defaultValue)) ) {
                if(el.get('value') == '') {
                  el.set('value', defaultValue);
                }
                //console.log('placeholder support for: ' + el.get('id'));
								el.on('focus', function(){
                  if(el.get('value') == defaultValue) {
          					el.set('value','');
          				}
                });
								el.on('blur', function(){
                  if(_.trim(el.get('value')) == '') {
          					el.set('value',defaultValue);
          				}
                });
							}
						}
					}
				});
			}

			$(selector).set('noValidate',true);

			if(fc.options.display.validateOnInit) {
				fc._doValidation({preventDefault: function(){}});
			}

		};

		formCheck.prototype._focusPlaceholders = function(evt) {
      //console.log('focus on ' + evt.target);
			if(!(_.isEmpty(evt.target))) {
				var el = $(evt.target);
				var defaultValue = el.get('@placeholder');
				if(el.get('value') == defaultValue) {
					el.set('value','');
				}
			}
		};

		formCheck.prototype._blurPlaceholders = function(evt) {
			if(!(_.isEmpty(evt.target))) {
				var el = $(evt.target);
				var defaultValue = el.get('@placeholder');
				if(_.trim(el.get('value')) == '') {
					el.set('value',defaultValue);
				}
			}
		};

    formCheck.prototype.checkIfFormIsValid = function() {
      return fc._doValidation({returnValue:false});
    }

		formCheck.prototype._doValidation = function(evt) {
			if(fc.options.display.showErrorMethod == 'popup') {
        if('repositionPopup' in fc) {
          $.off(fc.repositionPopup);
        }
				$('.'+fc.options.display.errorPopupClass).remove();
			} else {
				if(fc.options.display.showErrorMethod == 'inline') {
					$('.'+fc.options.display.errorInlineClass).remove();
				}
			}
			var foundErrors = false;
			fc.itemsToValidate.each(function(item,index) {
				if(!foundErrors) {
					var elRet = fc._validateEl($(item));
					if(!elRet) {
						foundErrors = true;
						fc._showErrors($(item));
						if(evt.preventDefault) {
							evt.preventDefault();
						} else {
							evt.returnValue = false;
						}
						$(fc.selector).trigger('formisinvalid',_($(item),$(fc.selector)));
					}
				}
			},this);


			if(foundErrors) {
				return false;
			}

			$(fc.selector).trigger('formisvalid',$(fc.selector));

			return true;
		};

		formCheck.prototype._showErrors = function(el) {
			if(el.get('errors')) {
				_(el.get('errors')).each(function(item,index) {
					if(fc.options.display.showErrors) {
						if(typeof fc.options.display.showErrorMethod == 'string') {
							switch(fc.options.display.showErrorMethod.toLowerCase()) {
								case 'inline':
									var emsg = EE('div',{
										'@class': fc.options.display.errorInlineClass
									},[
										EE('p',item)
									]);
									el.addAfter(emsg);
									break;

								case 'popup':
								default:
									var emsg = EE('div', {
											'@class': fc.options.display.errorPopupClass
										},[
											EE('table',{
												'@cellPadding':'0',
												'$borderSpacing': 0,
												'$borderCollapse': 'collapse',
												'border': 0
											},[
												EE('tr',{},[
													EE('td',{'@class':'tl'}),
													EE('td',{'@class':'t'}),
													EE('td',{'@class':'tr'})
												]),
												EE('tr',{},[
													EE('td',{'@class':'l'}),
													EE('td',{'@class':'c'},[
														EE('div',{'@class':'err'},[
															EE('p',item)
														]),
														EE('a',{'@class':'close'}).on('click', function(e) {
															$('.fc-tbx').remove();
                              $.off(fc.repositionPopup);
														})
													]),
													EE('td',{'@class':'r'})
												]),
												EE('tr',{},[
													EE('td',{'@class':'bl'}),
													EE('td',{'@class':'b'}),
													EE('td',{'@class':'br'})
												])
											])
										]);

                  var br = el[0].getBoundingClientRect();
                  window.scrollTo(0,br.top-70)

                  fc.repositionPopup = function() {
                    br = el[0].getBoundingClientRect();
                    var doc = document.documentElement;
                    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
                    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                    emsg[0].style.left = (left+parseFloat((fc.options.display.popupPosition == 'left' ? br.left : br.right ))+fc.options.display.popupXoffset) + 'px';
                    emsg[0].style.top = (parseFloat(br.top)+fc.options.display.popupYoffset+top) + 'px';
                  }

                  fc.repositionPopup();
                  $(window).on('resize',fc.repositionPopup);

									$('body').addFront(emsg);
									break;
							}
						} else {
							if(_.isFunction(fc.options.display.showErrorMethod)) {
								fc.options.display.showErrorMethod(item,el);
							} else {
								alert(item);
							}
						}
					}
				});
			}
      if(fc.options.display.setFocusToInvalid){
			     el[0].focus();
      }
		};


		formCheck.prototype._validateEl = function(el) {
			//clear errors each time
			var fc = this;
			var _validateFieldOnBlur = function(e) {
				return fc._doValidation(e);
			};
			$.off(_validateFieldOnBlur);
      if( fc.options.display.placeholderSupport && !SUPPORTS_PLACEHOLDER ) {
        var defaultValue = el.get('@placeholder');
				if(el.get('value') == defaultValue) {
					el.set('value','');
				}
      }
			el.set('errors',new Array());
			//console.log(el.get('tagName'));
			if(el.get('tagName').toUpperCase() == 'SELECT') {
				//console.log(el.get('id')+' select:' + el.get('value'));
				if(el.get('%required')) {
					if(_.trim(el.get('value')).length == 0) {
						//el.on('change',_validateFieldOnBlur);
						el.get('errors').push((el.get('multiple') ? this.options.alerts.select_multiple : this.options.alerts.select));
						return false;
					}
				}
			} else {

				var elType
				if(el.get('tagName').toUpperCase() == 'INPUT') {
					elType = el.get('@type');
				} else {
					elType = el.get('type');
				}
				if(elType.toLowerCase() == 'text') {
					var elExtType = el.get('%validate');
					if(!(_.isEmpty(elExtType,true))) {
						elType = elExtType;
					}
				}

				elType = elType.toLowerCase();
				var isRequired = el.get('%required');
				var pattern = el.get('@pattern');
				if(_.isEmpty(pattern)) {
					if(elType in this.options.regexp) {
						pattern = this.options.regexp[elType];
					}
				}
				var invalidPattern = el.get('%invalid-message');
				if(_.isEmpty(invalidPattern)) {
					if(elType in this.options.alerts) {
						invalidPattern = this.options.alerts[elType];
					}
				}

				var minLength = (_.isEmpty(el.get('@minlength')) ? 0 : parseInt(el.get('@minlength'),10));
				var maxLength = (_.isEmpty(el.get('@maxlength')) ? -1 : parseInt(el.get('@maxlength'),10));

				var elValue = el.get('value');

				if(isRequired && elValue.length == 0) {
					//el.on('blur',_validateFieldOnBlur);
					el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['defaultMessage'] : invalidPattern));
					return false;
				}


				if(elValue.length < minLength || (elValue.length > maxLength && maxLength > -1)) {
					if(maxLength > -1) {
						var emsg;
						if(maxLength == minLength) {
							emsg = this.options.alerts['length_fix'].replace('%0',maxLength);
						} else {
							emsg = this.options.alerts['length_str'].replace('%0',minLength).replace('%1',maxLength);
						}
						//el.on('blur',_validateFieldOnBlur);
						el.get('errors').push(emsg);
						return false;
					} else {
						var emsg;
						if(minLength > maxLength) {
							emsg = this.options.alerts['length_min'].replace('%0',minLength);
						} else {
							emsg = this.options.alerts['length_max'].replace('%0',maxLength);
						}
						//el.on('blur',_validateFieldOnBlur);
						el.get('errors').push(emsg);
						return false;
					}
				}

				switch (elType) {
					case 'checkbox':
						if(isRequired && !el.get('checked')) {
							//el.on('blur',_validateFieldOnBlur);
							el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['defaultMessage'] : invalidPattern));
							return false;
						}
						break;

          case 'tel':
					case 'phone':
						var phoneRegexps = _(this.options.regexp['phone'],this.options.regexp['phone2'],
											 this.options.regexp['phone3'],this.options.regexp['phone_inter']);

						var isPhoneValid = false;
						phoneRegexps.each(function(pitem,pindex) {
							if(!isPhoneValid) {
								//stop validation if one regex passes
								var r = new RegExp(pitem);
								if(r.test(elValue)) {
									isPhoneValid = true;
								}
							}
						});
						if(!isPhoneValid) {
							//el.on('blur',_validateFieldOnBlur);
							el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['defaultMessage'] : invalidPattern));
							return false;
						}
						break;

					case 'radio':
						var formValues = $(this.selector).values();
						if(el.get('@name') in formValues) {
							if(_.isEmpty(formValues[el.get('@name')])) {
								//el.on('blur',_validateFieldOnBlur);
								el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['radios'] : invalidPattern));
							}
						} else {
							//el.on('blur',_validateFieldOnBlur);
							el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['radios'] : invalidPattern));
							return false;
						}
						return true;

					default:
						if(Object.prototype.toString.call(pattern) == '[object RegExp]' || !(_.isEmpty(pattern))) {
							var r = new RegExp(pattern);
							if(!r.test(elValue)) {
								//el.on('blur',_validateFieldOnBlur);
								el.get('errors').push((_.isEmpty(invalidPattern) ? this.options.alerts['defaultMessage'] : invalidPattern));
								return false;
							}
						} else {
							if(!(_.isEmpty(el.get('%validate')))) {
								if(_.startsWith(el.get('%validate'),'%')) {
									try {
										var customFunc = eval(el.get('%validate').substr(1));
										if(!(_.isEmpty(customFunc))) {
											var ret = customFunc(el);
											if(!ret) {
												//el.on('blur',_validateFieldOnBlur);
											}
											return ret;
										}
									} catch(expception) {
										console.log('The custom function specified for the element: "' + el.get('@id') + '" is not defined.');
									}
								} else {
									if(_.startsWith(elType,'matches')) {
										var mustMatch = '#' + elType.substr(8);
										var mustMatchVal = $(mustMatch).get('value');
										if(elValue != mustMatchVal) {
											var emsg = fc.options.alerts.matches.replace('%0',$(mustMatch).get('@placeholder'));
											//el.on('blur',_validateFieldOnBlur);
											el.get('errors').push(emsg);
											return false;
										}
									} else {
										if(_.startsWith(elType,'differs')) {
											var mustMatch = '#' + elType.substr(8);
											var mustMatchVal = $(mustMatch).get('value');
											if(elValue == mustMatchVal) {
												var emsg = fc.options.alerts.differs.replace('%0',$(mustMatch).get('@placeholder'));
												//el.on('blur',_validateFieldOnBlur);
												el.get('errors').push(emsg);
												return false;
											}
										}
									}
								}
							}
						}

						break;
				}

			}

			return true;
		};

		formCheck.prototype.add = function(el) {
			if(!this.itemsToValidate.contains(el)) {
				this.itemsToValidate = _(this.itemsToValidate,el);
			}
		};

		formCheck.prototype.remove = function(el) {
			if(this.itemsToValidate.contains(el)) {
				this.itemsToValidate = this.itemsToValidate.filter(el);
			}
		};

		this._initialize(selector,_options);

	};




	MINI.$.validate = function(selector,_options) {
		return new formCheck(selector,_options);
	};
});

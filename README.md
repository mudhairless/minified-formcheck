# FormCheck for Minified.js

Use the power of HTML5 form validations in every modern browser (default theme only supported in IE8+).

## Minimal Example

    <!-- Place this in your HTML head -->
    <link href="formcheck.css" rel="stylesheet">
    <script src="minified.js" type="text/javascript"></script>
    <script src="formcheck.js" type="text/javascript"></script>
    <script type="text/javascript">
      var MINI = require('minified'), $ = MINI.$;
      require('formCheck');
      $(function(){
        $.validate('#myForm');
      });
    </script>

## Marking Up Form Inputs

All validations are defined as attributes on the form elements.
The most useful subset and some extensions of the HTML5 Form Validation specification are supported. The benefit to this
method is, in supported browsers, you will get basic form validation even if javascript is turned off.

### Supported Standard Attributes

* __Required__

  This form item must have ANY value to be valid. This attribute is boolean, meaning there are two valid ways to specifiy it:

      <input type="text" required="required" name="FavoriteTurtle" />
      <!-- OR -->
      <input type="text" required name="FavoriteTurtle" />

* __Pattern__

  This attribute is the easiest way to specify a custom validation method because it doesn't require any code, just a regular expression. To be considered valid the value of the form item must pass the specified regular expression. See this example of a simple pattern to match a hexadecimal number:

      <input type="text" pattern="^(0x)?[0-9a-fA-F]+$" name="hexnumber" />

* __Min__

  This attribute is used to specify the smallest number a number type or the latest date/time a date/time input should accept.

      <input type="number" min="1" name="numberLargerThanZero" />

* __Max__

  This attribute is analagous to the Min attribute, it is used to specify the largest number a number type or the earliest date/time a date/time input should accept.

      <input type="number" min="0" max="10" name="rateService" />

* __Max Length__

  The Max Length attribute is used to limit the number of characters that can be entered into most fields.

      <input type="text" maxlength="10" name="upToTenLetters" />

* __Min Length__

  This attribute does just what you think it does, the value of the form item is not considered valid unless it is at least minlength characters long.

      <input type="text" minlength="7" name="longNameForADog" />

### Custom Form Attributes

* __data-validate__

  Normally the __type__ attribute is used to determine how to validate the form item,
  but you can use this attribute to specify a custom type for this item. This is also
  where you specify the non-standard validations we support. This can be useful for
  situations where you don't want the browser's default form item behavior as well.

      <input type="text" data-validate="phone" name="phoneNumber" />

  #### Types recognized

  * __alpha__

    Only accepts the letters a to z in either case and the space, period, underscore and dash.

  * __alphanum__

    Same as alpha but with numbers included.

  * __digit__

    Accepts any positive or negative integer with optional sign.

  * __nodigit__

    Any character except numbers.

  * __number__

    Similar to digit but also allows a single optional period for the decimal portion.

  * __email__

    Exactly what you think, accepts an email address. Purposefully is rather forgiving as the spec is vague, but should cover the modern usages with room to grow.

  * __image__

    For file type inputs will only allow file extensions that are used by common image formats.

  * __phone__

    Synonymous with the HTML5 tel input type, both are valid here. Will match many common formats of telephone numbers from both the USA and abroad.

  * __url__

    Ensures the input is a valid URI but does not check that the address exists.

  * __date__

    Check that a date is in the common US date format of MM/DD/YYYY with optional leading digits, 2 digit year support and one of "/", "." or "-" as a separator.

  * __differs:id__

    This special type ensures that the value of this input is
    different than the value of the input with the id specified.

  * __matches:id__

    This special type ensures that the value of this input is
    the same as the value of the input with the id specified.

  * __Custom Javascript__

    You can specify a javascript function that you provide to be used to validate the field.
    To use a javascript function prefix the name of your function with "%"

        <script type="text/javascript">
          function gandalf(el) {
            if(el.get('value') == '') {
              el.get('errors').push('You shall not pass!');
              return false;
            }
            return true;
          }
        </script>

        <input type="text" name="locationOfOneRing" data-validate="%gandalf" />



* __data-invalid-message__

  With this attribute you can override the default error message with one more specific to your form.

      <input type="text" data-validate="url" name="website" data-invalid-message="Please specify your personal website." />

## Events

The validator will make the form emit an event that you can hook on to determine the
validation results. The two available events are "formisvalid" and "formisinvalid".

    <script type="text/javascript">
      var MINI = require('minified'), $ = MINI.$, $$ = MINI.$$, EE = MINI.EE, _ = MINI._;
      require('formCheck');
      var fc;
      $.ready(function() {
        fc = $.validate('#checkme');
        $('#checkme').on('formisvalid',function(formSelector) {
          console.log('form is valid');
        });

        $('#checkme').on('formisinvalid',function(invalidElement,formSelector) {
          console.log('form is invalid');
        });
      });
    </script>


## Public Functions

* __$.validate(_selector_,_optionalOptions_)__

  This is the main function into the validator. The only required parameter
  is the first, the form selector. If your form has the id "myForm" then this
  parameter would be '#myForm' (inluding the quotes). The option parameter is
  a javascript object with may possible values, see the Configuring the Validator section.

* __ _validatorObject_.checkIfFormIsValid()__

  This function is useful if you wish to trigger the validation of the form on
  some action not used by default, like another button or some other part of your
  page. This function will return true if the form is valid or false if not.
  Errors are displayed to the use like normal.

## Configuring the Validator

There are several options you can configure when intializing a form validator.
Options are passes as a javascript object as the second parameter to the validate
function on the $ object.

    $.validate('#myForm',{
      display: {
        'some option here': true
      }
    });

### Available Options

Options are split into 3 separate sub-objects: display, alerts and regexp.
Display is where the real options are located, alerts and regexp are available
to easily add new validations or customize error messages at a global level. Options
available under the display object are listed below, see the source if you would
like to override or add to built-in validations.

* __showErrors__ _Boolean_ _Default Value: true_

  Are errors displayed?

* __showErrorMethod__ _String or Function_ _Default Value: popup_

  What method is used to display errors to the user?
  Possible values are:

  * __'popup'__
    The default method, a "speech bubble" type alert.

  * __'inline'__
    A simple div with the error message is displayed before the element.

  * __custom function__

    You can specify a custom javascript function that will be
    called to display errors. This function should expect 2 parameters, the error string and the element.

* __errorPopupClass__ _String_ _Default Value: .fc-tbx_

  What css class will the popup have?

* __popupXoffset__ _Number_ _Default Value: -40_

  Used along with the theme to properly position the popuup.

* __popupYoffset__ _Number_ _Default Value: -48_

  Used along with the theme to properly position the popup.

* __popupPosition__ _String_ _Default Value: 'right'_

  Determines which side of the element will the popup appear on. Possible values are 'left' and 'right'.

* __errorInlineClass__ _String_ _Default Value: 'fc-error'_

  If the inline error method is used the output will have this class.

* __validateOnInit__ _Boolean_ _Default Value: false_

  Should we immediately check the form for errors when the page loads?

* __orderByTabIndex__ _Boolean_ _Default Value: true_

  Errors will be processed in tab index order if true.

* __submitFormIfValid__ _Boolean_ _Default Value: true_

  Determines if a valid form will submit automatically. If false you will need to call the submit method on the form directly.

* __placeholderSupport__ _Boolean_ _Default Value: true_

  Add rudimentary HTML5 placeholder attribute support to unsupported browsers. Typically IE before version 9.

* __scrollToInvalid__ _Boolean_ _Default Value: true_

  Should the page scroll to display the invalid form element.

* __setFocusToInvalid__ _Boolean_ _Default Value: true_

  Should the focus be set to the invalid form element.

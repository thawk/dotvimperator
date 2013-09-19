/*
 * searchreplace.js
 *
 *  Vimperator plugin to replace text in textareas/inputs
 *  using regexp. Implements :substitute vim command.
 *
 *  @author Konstantin Stepanov <milezv@yandex.ru>
 *  @version 0.2
 *
 *    Copyright 2008 Konstantin Stepanov <milezv@yandex.ru>
 *    Compatible with Vimperator 1.2pre or higher.  Requires Firefox 3.
 */

/*****************************************************************************

USAGE

    :%s/Some text/Some other text/
    :s/(.*), (.*)/\2, \1/g
    :2s#/oldurl#/newurl# -type=ta
    :s/[A-Z]+// -id=title

COMMANDS

:s
:substitute

    Runs search-and-replace on a set for textareas/input fields.

    Syntax:
        :[count]substitute /regexp/replace/[flags] [options]

    Available options:

        -type/-t
                Type of input fields to process. Can be set to "textarea"
                (or "ta" for short), or "input" (or "i" for short).

        -id
                Id of input field to process.

    Notes:

        JavaScript regular expsressions are used. See JavaScript docs
        for reference.

		-id option gets precedence over all other options/arguments,
		so only field with given id is proceeded.

        You can use any other separator instead of "/". Any first symbol
        in first argument is considered as regexps-replace separator.

        If you set some count, countth field will be processed (with regard
        of -type filter, i.e. :2s/a/b/ -t=ta will parse 2nd textarea field
        in page, while :2s/a/b/ -t=i will parse 2nd text input field).
		You can use "%" as a counter to process all fields on page (-type
		option works as well).

		If you don't use any count, then -type option has no sense,
		and only the last input field is proceeded.

KNOWN ISSUES

     * Regexp string parser (the one wich parses /regexp/replace/flags string
       into separate parts) is quite dumb now, it doesn't support separator
       symbol escaping, so you can't write:

       :s/\/url/\/newurl/

       Use different separator instead:

       :s#/url#/newurl#

TO DO

     * Rewrite argument string parser to handle escaped separator symbols,
       as mentioned in previous section.

*****************************************************************************/

commands.addUserCommand(["s[ubstitute]"],
	"[count]s/{what}/{replace}/[{flags}] [-id={id}] [-type|-t=input|textarea|i|ta]",
	function (args, special, count) {
		var sep = args[0].substr(0,1);
		var [ srch, repl, flags ] = args[0].substr(1).split( sep, 3 );

		if (!repl) {
			echoerr("Incorrect search/replace string is used: missing " + sep + "?");
			return;
		}

		var filter = "";
		var objs;
		var obj;

		// -id argument have the highest priority
		if (args["-id"])
		{
			filter = "//*[@id='"+args["-id"]+"']";
		}
		else if (count == 0 || count == -1) // if count is not set, use last input field
		{
			if (args["-type"]) {
				echoerr("-type argument without count");
				return;
			}
			obj = buffer.lastInputField;
		}
		else // if count is set or "%" is used as count (-2), use -type argument for filtering
		{
			if (args["-type"])
				filter = args["-type"][0] == "i"? "//input[@type='text'] | //xhtml:input[@type='text']": "//textarea | //xhtml:textarea";
			else
				filter = "//input[@type='text'] | //xhtml:input[@type='text'] | //textarea | //xhtml:textarea";
		}

		if (filter) // fetch a list of fields only if filter is not empty, so count is -2 or greater than 0.
		// Ok, if count is -2 we need an iterator object to process all fields, o/w we need snapshot object to get countth field
			objs = buffer.evaluateXPath(filter, window.content.document, null, count < 0);

		if (count > 0 && objs)
			obj = objs.snapshotItem(count - 1);

		try
		{

			var re = new RegExp(srch, flags);

			if (obj)
			{
				obj.value = obj.value.replace(re, repl);
			}
			else if (objs)
			{
				while ((obj = objs.iterateNext()) != null)
					obj.value = obj.value.replace(re, repl);
			}
			else
			{
				echoerr("Unable to find objects for substitution!");
			}

		} catch (e) {
			echoerr('Substitution error: ' + e.toString());
		}
	},
	{
		options: [
			[ ["-id"], commands.OPTION_STRING ],
			[ ["-type", "-t"], commands.OPTION_STRING, function (val) { return /^(input|textarea|i|ta)$/.test(val); }, [ "i", "ta", "input", "textarea" ] ]
		]
	}
);

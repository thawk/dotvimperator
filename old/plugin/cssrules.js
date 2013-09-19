/*
 * cssrules.js
 *
 *  Vimperator plugin to manipulate CSS style sheets & rules.
 *
 *  @author Konstantin Stepanov <milezv@yandex.ru>
 *  @version 0.21pre
 *
 *    Copyright 2008 Konstantin Stepanov <milezv@yandex.ru>
 *    Compatible with Vimperator 2.0pre or higher.  Requires Firefox 3.
 */

/*****************************************************************************

USAGE

    :cssrule body=color: red !important; background-color: navy
		change CSS style of body, setting color and background color,
		if CSS rule for body doesn't exist throw an error

    :2cssrule td#cell p.info -= border; padding
		remove border & padding CSS attributes from definition
		with selector "td#cell p.info" on 2nd stylesheet

	:cssrule! #header=white-space: both
		change CSS rule for "#header" selector, if the rule doesn't
		exist, create it

	:5cssrule p a
		show CSS rule with "p a" selector on 5th stylesheet

	:cssrules
		display all CSS rules, use "quick" rendering (only basic coloring
		will be applied)

	:2cssrules! td {.*border: black
		display all CSS rules matching given regexp on 2nd stylesheet,
		if the rule is found in @import'ed stylesheet, this stylesheet
		will appear unfolded

	:1cssrule body.grid&
		remove CSS rule with "body.grid" selector from 1st stylesheet

	:cssheets domain.example.net
		show list of style sheets for the page with "domain.example.net"
		in URL

	:cssdump ~/styles.css
		dump all stylesheets on a page into local file

	:set dcss=1
		disable only the first stylesheet

	:set dcss+=2,3
		disable 2nd and 3rd stylesheets in append to already disabled ones

	:set dcss-=1
		reenable first stylesheet

	:set dcss=all
		disable all stylesheets for the page

	:set dcss=
		enable all stylesheets for the page

	:set hlcss=ls
		use CSS syntax highlighting for both :cssrule & :cssrules commands

	:set hlcss=
		never highlight CSS syntax, so output will be faster (good for slow
		machines & pages with a lot of CSS rules)

	:set ecss
		:cssrules will show empty stylesheets/@media rules

	:sc 1-3,1.2 cssrules
		show stylesheets 1, 2, 3, & 1.2, actually run :cssrules with these
		counts one by one.

COMMANDS

:cssrule
:css

    Change/create CSS rule definition. Works like :set for CSS rules.

    Syntax:
        :[count]cssrule[!] selector=attr1: value1[; attr2: value2 [...]]
		:[count]cssrule selector-=attr1[; attr2 [...]]
		:[count]cssrule selector[&|?]
		:[count]cssrule[!] all
		:[count]cssrule[!] all&

    Notes:
		The simpliest form of :cssrule sets given CSS attributes for first
		met rule with given selector. Attribute-value pairs are seprated
		by "; " symbols (note space after semicolon).
		You can use "!important" part after value (before "; " separator)
		to make set CSS attribute's priority.

		If rule doesn't exist the commands return error. To create new
		rule use :cssrule! form. The rule by default it created in 1st
		stylesheet met on page. To make :cssrule create rule in given stylesheet,
		use count. New rules are appended to the end of stylesheet.

		If "-=" operator used command takes "; "-separated list of attribute
		names and removes them from rule definition.
		If only selector is given, :cssrule shows definition of a rule with
		this selector.

		To completely remove rule from stylesheet, use ":cssrule selector&"
		form, just like with :set.

		:cssrule all is like :cssrules command without filter, :cssrule all&
		will clear whole stylesheet (or all stylesheets without count).

		Command looks for the rule in all stylesheets attached to the page
		in order of appearance on page and operates on the first rule
		with given selector (see :cssheets command for a list of all rules).
		You can use count to designate stylesheet to look rule for.

		This command have autocompletion which completes argument with
		all available selectors of all CSS rules on page.

:cssrules

	Display list of CSS rules for current page.

	Syntax:
		:[count]cssrules[!] [filter]

	Notes:
		This commands allows fast search of a rule. Filter is a regular
		expression which matches against every single rule definition
		(CSS rule for the comparison is used in its full form with selector
		and curly brackets around attribute list), and if rule matches filter,
		it will be displayed.

		Command makes lookup in all stylesheets on page (in order of appearance).
		You can use count to set stylesheet to look for rules.

		If there're @import rules, all included stylesheets are traversed
		in order of appearance and shown "folded" under @import rules:
		there will be clickable "[x rules inside]" text to the left of @import
		definition. You can click it to view folded rules.

		You can use :cssrules! to unfold all @import'ed stylesheets &
		@media rules by default.

:cssheets

	Display full list of stylesheets for current page.

	Syntax:
		:cssheets [filter]

	Notes:
		Use this command to get full list of stylesheets used on current page.
		You can use filter to show only stylesheets with given string
		in their URL (so use ":cssheets example.net" to show only stylesheets
		from example.net and its subdomains).

		Filtering is done based on simple string matching (if filter string is
		contained in stylesheet's URL), not regular expressions.

		Disabled stylesheets (see 'disabledcssheets' option below) are displayed
		striked-through. Stylesheets embedded in document, not via @import rules
		or <link> tag (and as this doesn't have separate URL) are named
		"Embdedded Styles". All rules are numbered, and you can use these
		numbers as a count for almost all commands included in the plugin
		to designate stylehseet to work with (see separate commands description
		to see what effect count will bring to it, although it usualy just
		makes command work with this given stylesheet and not with all stylesheets
		on page).

		All commands from this plugin enumerate stylesheets in order of appearance
		in a list, displayed by this command.

:cssheetsets
:cssets

	Display full list of alternate stylesheet sets available for current page.

	Syntax:
		:cssheetsets [filter]

	Notes:
		This command is identical to :cssheets except it displays list of
		alternate stylesheet sets, with currently used stylesheet set marked
		with ">" sign.

		See also 'cssheetset' option.

:cssdump
:cssd

	Save stylesheets into local file.

	Syntax:
		:[count]cssdump[!] filename

	Notes:
		This command saves (dumps) all rules from all stylesheets used for current
		page into given file. If count is used, it dumps only rules from only one
		given stylesheet.

		If file exists, it is not overwritten and error is displayed. Use :cssdump!
		form to override this behavior and overwrite existing file.

		All rules are correctly indented, every stylesheet's is content is separated
		with comment line in format "*** <stylesheet url> ***" from other rules.

		Embedded stylesheets are given with "Embedded Styles" name instead of URL.

		This command have autocompletion which completes argument with file names
		available on user's file system.

:setcount
:setc
:sc

	Set count of a command to a value, not supported by Vimperator, and run the command.

	Syntax:
		:sc[!] count command [arguments]

	Notes:
		Stylesheets are organized in some kind of tree, so I had to think of a way
		to extend "count" idea of pointing to some specific stylesheet to support
		hierarchy.

		I decided to use dot as hierarchy separator, so "1.2" can mean "second
		stylesheet @import'ed in first root level stylesheet". It's easy to implement
		and (I hope) understand. By the time I came to this idea, almost all commands
		I created used count to designate stylesheet to work with, but Vimperator
		doesn't support dot in count! So I added this command as workaround.

		Actually this command can be used not only with commands, included in this
		plugin, but with any ex-command.

		"Count" in this command (the first argument) can have dots in it.
		But even more, it supports ranges (1-5) and lists (1,2,1.2.1) as well!
		So you can run command with a number of counts at once (actually "count"
		parameter of this command will be parsed into separate units and wrapped
		command will run with each of this unit).

		One day I will write patch to Vimperator for ranges and lists for count
		support.

		Use :sc! to pass "!" to wrapped command.

:cssload

	TODO

:mvcssrule
:mvcss

	Move CSS rule to a new place (maybe in new stylesheet).

	Syntax:
		:[count]mvcssrule[!] [newcount] [+|-]newplace selector1[; selector2 [...]]

	Notes:
		You can move some rule around with this commands, and so control its precedence.
		Count and selector are used to determine a rule to move. If there's no count,
		command will issue lookup on all stylesheets and will operate on first met rule
		with given selector.

		Newcount & newplace are used to determine where rule should be moved.
		If newcount is present, the rule will be moved into new stylesheet with this number,
		If newcount is not present, the rule will be moved inside its current parent
		stylesheet.

		You can use "+" and "-" with newplace if newcount is absent to move rule
		up and down in its current parent stylesheet.  There can be a number of selectors,
		separated by "; ".

		If you move rule to new stylesheet and it already have rule the same selector,
		an error will occur and command will not move rule. To override it and overwrite
		existing selector, use :mvcssrule! form.

	TODO

:cpcssrule
:cpcss

	Copy CSS rule to a new place (maybe in new stylesheet).

	Syntax:
		:[count]cpcssrule newcount [+|-]newplace selector1[; selector2 [...]]

	Notes:
		Actually the same as :mvcssrule, but leaves original rules intact, thus copying
		rules instead of moving it.

		See :mvcssrule for details.

	TODO

OPTIONS

'defaultcssheets'
'defcss'

	Set default stylesheet to operate on when no count is given.

	Syntax:
		:set defcss=<stylesheet numbers list>

	Notes:
		By default if not count is given all commands do global lookup
		on all stylesheets to find a rule to work with.

		Sometimes you may need to work with given set of stylesheets,
		usually one stylesheet you work with, while ignoring all others.
		The need of typing count in every time you run :cssrule may be
		time consuming & inconvinient, so you may wish to set this option
		to a stylesheet number you are working with.

'disabledcssheets'
'dcss'

	Set disabled stylesheets for a page.

	Syntax:
		:set dcss
		:set dcss[+|-]=<stylesheets numbers list>
		:set dcss=all

	Notes:
		Use this option to disable/enable stylesheets for current page.
		The value of the option is list of numbers of stylesheets
		(see :cssheets command to get numbers of stylesheets for given page).

		This option is "local": it rebuilds its value every time it is queried,
		so it always have actual list of disabled stylesheets, even if stylesheets
		were enabled/disabled with any other tool, e.g. Web Developer extension.

		You can use this option just like any other option of stringlist type:
		adding a number to the option disables stylesheet, removing number -
		enables it.

		There's special value "all" which can be the only value of the option,
		so you can only write :set dcss=all, not dcss+=all or dcss-=all.
		If you set disabledcssheets to "all", it is automatically filled with
		a list of all available stylesheets on the page, effectively disabling
		all CSS rules on page (except for embedded in HTML via "style" HTML attribute
		in tags, of cause).

		You can set it to empty value to enable all stylesheets at once.

'hlcsssyntax'
'hlcss'

	Define commands which will highlight CSS syntax in its output.

	Syntax:
		:set hlcss
		:set hlcss[+|-]=<command groups>

	Notes:
		RegExp-based renderer of rules, which translates them into form
		convinient for human's perception (i.e. indention and syntax coloring)
		have to modes: quick (only selectors are highlighted in bold and
		attributes are indented) and slow (attribute names & values are highlighted
		in different colors). Quick method is about twice as fast as slow one,
		so I created 'hlcsssyntax' option to allow user to choose what commands
		will use quick method and show CSS rules without syntax highlighting,
		and what commands will use slow rendering method and show CSS rules
		with nicely highlighted syntax.
		
		'hlcsssyntax' option is of type charlist and can have a set of two
		characters: "s" & "l" (small letter ell). If 'hlcss' contains "s"
		character, :cssrule command will use slow rules rendering ("s" means
		"show [s]ingle rule", as :cssrule shows only one rule at a time).
		If this option contains "l" character, :cssrules will use slow
		rules rendering ("l" means "show [l]ist of rules", as :cssrules
		can show lot of rules at a time).

		'hlcsssyntax' is set to "s" by default, so :cssrule will show rules
		with syntax highlighting and :cssrules will use quick rendering
		and show CSS rules without syntax highlighting. That's because
		:cssrule show one rule at a time, so slow method doesn't decrease
		performance very much, while :cssrules usually used to display a whole
		bunch of rules, which can be very long, and using slow rendering mode
		can greatly decrease performance.

		If you have small number of rules on page, you may wish to set
		'hlcss' to "sl" to use slow rendering all the time (type :set hlcss+=l
		to do it if use have never changes 'hlcss' before).

		All color definitions in form of "rgb(...)" are always appended with color
		patches so you can see color definitions in place: I tested this regexp
		and found only small difference in performance with and without this
		conversion.

'emptycssheets'
'ecss'

	Show/hide empty @import'ed stylesheets & @media rules with :cssrules command.

	Syntax:
		:set [no|inv]ecss

	Notes:
		:cssrules command have two ways of handling empty @import'ed stylesheets
		& @media rules: it can either show them, marked as empty, or hide them
		totally to give clearer view.

		This option controls this behavior: is it is set, :cssrules will show
		empty stylesheets, otherwise these stylesheets are hidden.

		Stylesheet/@media rule is marked as "empty" when it doesn't have any rules,
		matching given filter (see :cssrules command for details).
		If filter is not set, all rules are considered "match", so really empty
		stylesheets are hidden.

		Empty root level stylesheets are always hidden.

'cssheetset'
'csset'

	Set alternative stylesheet set for current page.

	Syntax:
		:set cssheetset=<set name>

	Notes:
		If page have some alternative stylesheet sets, you can use this option
		to select this stylesheet set. Set it to empty string to select default
		stylesheet set.

		See also :cssheetsets command.

KNOWN ISSUES

		* Completer of :cssrule command doesn't make out selector part from
		  CSS attributes part.

TO DO

		* Make :cssrule completer more clever, so it can complete not only CSS
		  selectors and attribute names, but attribute values as well.

		* Implement :cssload command to load stylesheets from local files.

		* As order of attributes inside of rule definitions is not important
		  (internally it all integrated in short form, so later defined
		  CSS attributes rewrites already defined ones for any given single
		  rule), but order of rule definitions matter (as it defines rule precedence
		  when applying them to HTML), make some way to move rule definitions
		  inside stylesheets and (maybe) between stylesheets.
		  Currently we can only append rule to given stylesheet (first by default).

HISTORY

	0.21
		* Made plugin compatible with latest Vimperator CVS.
		* CSS highlighter code is now produce XHTML Strict code.

	0.2
		* Added support for @import rules, so @import'ed stylesheets are
		  proceeded as well.
		* Added limited support for @charset, @font-face & @page rules
		  (user can see these rules, but can't delete/add/change them).
		* Added support for @media rules: user can work with them just like
		  with normal stylesheet.
		* Improved :cssrules performance and interface: rules are rendered
		  when they match filter only, new feedback hints are added for
		  media types.
		* Added 'emptycssheets' option to control :cssrules behavior
		  regarding display of empty stylesheets/@media rules.
		* added :setcount command to run commands with counts not supported
		  by Vimperator (with dots in values, ranges & lists).
		* CSS syntax rendering mode is now controlled via separate option.
		* Added command :cssheetsets & option 'cssheetsets' to view and set
		  alternate stylesheet sets.
		* Improved autocompletion for :cssrule, so it completes CSS attribute
		  names as well.
		* :rmcssrule command is removed: it's now integrated into :cssrule
		  to make it more like :set command.
		* Added 'defaultcssheet' option to set default stylesheet to work with
		  when no count is given.

	0.1
		* First release of cssrules.js plugin.

*****************************************************************************/

if (!liberator.plugins.cssRules) {

liberator.plugins.cssRules = function () {

	String.prototype.repeat = function (count) {
		var s = "", t = this.toString();
		while (--count >= 0) { s += t; };
		return s;
	}

	commands.addUserCommand(
		["css[rule]"],
		"Sets CSS rule for current page",
		function (args, special, count) {
			//            |<--- selector 1 ----------------------------------------------------------------------------------->|
			//                |<- tag ----------->| |<- id/class ------------------>| |<- attr ------------------------>| |<- delim -->|       |<- set value 2 >|
			var selRe = /^((?:(?:\*|[a-z][a-z0-9]*)?(?:[#.:][a-zA-Z_-][a-zA-Z0-9_-]+)*(?:\[[a-z-]+(?:[|^*~]?="[^"]*")?\])*(?: [+>] |,? )?)+)\s*([?&]|([-+^])?=\s*(.*?))?\s*$/;
			var matches = args.match(selRe);
			if (!matches) {
				echoerr("Illegal arguments!");
				return;
			}

			var ruleName = matches[1].replace(/( [+>] |,? )$/, "");
			var setValue = !!matches[2];
			var resetValue = matches[2] == "&";
			var operator = matches[3];
			var ruleValue = matches[4];
			if (parseInt(count) < 1) count = options["defaultcssheet"];

			var rule = liberator.plugins.cssRules.getRule(ruleName, count);
			if (!rule) {
				if (special && !resetValue) {
					rule = liberator.plugins.cssRules.addRule(ruleName, count, -1);
					if (!rule) {
						echoerr("Failed to add CSS rule '" + ruleName + "'");
						return;
					}
				} else {
					echoerr("CSS rule '" + ruleName + "' was not found (add ! to create one)");
					return;
				}
			}

			if (!setValue) {
            	commandline.echo(liberator.plugins.cssRules.HTMLRule(rule, options["hlcsssyntax"].indexOf("s") == -1), commandline.HL_NORMAL, commandline.FORCE_MULTILINE);
			} else {
				if (resetValue)
					liberator.plugins.cssRules.rmRule(rule);
				else if (operator == "-")
					liberator.plugins.cssRules.resetRule(rule, ruleValue);
				else
					liberator.plugins.cssRules.setRule(rule, ruleValue, operator == "+" || operator == "^");
			}
		}, {
			completer: function (filter, special, count) {
				if (!filter) filter = "";
				var op = filter.match(/(\s*[-+^]?=\s*)/);
				var start = 0;
				var cpt = [];
				if (op) {
					var tmp = filter.lastIndexOf(";");

					if (tmp >= 0)
						start = tmp + 2;
					else
						start = filter.indexOf(op[1]) + op[1].length;

					filter = filter.substring(start);
					if (filter)
						cpt = liberator.plugins.cssRules.cssProps.filter(function (v) { return v.indexOf(filter) >= 0 })
								.map(function (v) { return [v, ""] });
					else
						cpt = liberator.plugins.cssRules.cssProps.map(function (v) { return [v, ""] });

				} else {
					if (special) {
						var matches = filter.match(/(\*|[a-zA-Z][a-zA-Z0-9]*)?([#:.])([a-zA-Z0-9_-]*)\s*$/);
						if (matches) {
							start = filter.indexOf(matches[0]);
							filter = matches[3];
							var tag = matches[1] || "*";
							var lastchar = matches[2];
							var attr = "";
							var prop = "";
							if (lastchar == ":") {
								cpt = [
									[":active", ""], [":hover", ""], [":link", ""], [":visited", ""], [":focus", ""], [":lang", ""],
									[":before", ""], [":after", ""], [":first-letter", ""], [":first-line", ""], [":selection", ""], [":root", ""],
									[":first-child", ""], [":last-child", ""], [":only-child", ""], [":only-of-type"], [":empty", ""],
									[":nth-child", ""], [":nth-last-child", ""], [":nth-of-type", ""], [":nth-last-of-type", ""],
								];
							} else if (lastchar == ".") {
								attr = "class";
								prop = "className";
							} else if (lastchar == "#") {
								attr = "id";
								prop = "id";
							}

							if (attr) {
								var res = buffer.evaluateXPath("//" + tag + "[" + (filter? ("starts-with(@" + attr + ",'" + filter + "')"): ("@" + attr)) +"]", null, null, true);
								var elem;
								while ((elem = res.iterateNext()) != null) {
									var tag = elem.tagName.toLowerCase();
									var hint = "<" + tag + " " + attr + "=\"" + elem[prop] + "\">...";
									cpt.push([tag + lastchar + elem[prop], hint]);
									cpt.push([lastchar + elem[prop], hint]);
								}
							}
						}
					} else {
						cpt = liberator.plugins.cssRules.listRules(filter, parseInt(count) > 0? count: options["defaultcssheet"]);
					}
				}
				return [ start, cpt ];
			}
		}, true
	);

	commands.addUserCommand(
		["cssrules"],
		"Lists all CSS rules for current page",
		function (args, special, count) {

			var ss = liberator.plugins.cssRules.styleSheets;
			var list = "";
			var quickMode = options["hlcsssyntax"].indexOf("l") == -1;

			var filter = /./;
			var rulesCount = 0;
			var sheetsCount = 0;
			var matchedRules = 0;
			var matchedSheets = 0;
			var emptyStyles = options["emptycssheets"];

			if (args) {
				filter = new RegExp(args);
			}

			if (parseInt(count) > 0 || (count = options["defaultcssheet"])) {
				var ss = liberator.plugins.cssRules.getStyleSheet(count);
				if (!ss) {
					echoerr("Illegal stylesheet index!");
					return;
				}
				list += showRulesRecursive(ss, count);
			} else {
				for (var i = 0; i < ss.length; i++) {
					list += showRulesRecursive(ss[i], i + 1);
				}
			}

			list = ":" + (util.escapeHTML(commandline.getCommand()) || "cssrules") + "<br/>" +
					"<table><tr align=\"left\" class=\"hl-Title\"><th colspan=\"2\">--- CSS rules (showed sheets: " +
					matchedSheets + " of " + sheetsCount + ", rules: " + matchedRules + " of " + rulesCount +
					") ---</th></tr>" + list + "</table>";

			function showRulesRecursive(ss, idx) {
				var i = 0;
				var len = ss.cssRules.length;
				var rules = "";
				sheetsCount++;

				for (; i < len && ss.cssRules[i].type == CSSRule.IMPORT_RULE; i++) {
					var tmp = showSubStyleSheet(ss.cssRules[i].styleSheet, idx + "." + (i + 1));
					if (tmp)
						rules += liberator.plugins.cssRules.HTMLRule(ss.cssRules[i], quickMode) + tmp + "<br/>";
				}
				var subnum = i;
				var medianum = 0;

				for (; i < len; i++) {
					rulesCount++;
					if (ss.cssRules[i].type == CSSRule.MEDIA_RULE) {
						var tmp = showSubStyleSheet(ss.cssRules[i], idx + "." + (++medianum + subnum));
						if (tmp)
							rules += liberator.plugins.cssRules.HTMLRule(ss.cssRules[i], quickMode) +
									 tmp + " }<br/>";
					} else if (filter.test(ss.cssRules[i].cssText)) {
						rules += liberator.plugins.cssRules.HTMLRule(ss.cssRules[i], quickMode) + "<br/>";
						matchedRules++;
					}
				}

				if (rules) {
					var href;
					var media = ss.media.length == 0? "": "<span style=\"color: #999999\"> for " + ss.media.mediaText + "</span>";
					var disabled = ss.disabled? " style=\"text-decoration: line-through\" ": "";

					if (ss instanceof CSSStyleSheet) {
						href = ss.href;
						if (href)
							href = "<a href=\"#\" class=\"hl-URL\"" + disabled + ">" +
									util.escapeHTML(href) + "</a>" + media;
						else
							href = "<span class=\"hl-InfoMsg\"" + disabled + ">Embedded Styles</span>" + media;
					} else {
						href = "<span class=\"hl-InfoMsg\"" + disabled + ">@media rule</span>" + media;
					}

					rules = "<tr align=\"left\"><th>" + idx + ":</th><th>" + href +
						" <span style=\"color: #999999\">(" + ss.cssRules.length + " rule" +
						(ss.cssRules.length == 1? "": "s") + ")</span></th></tr>" +
						"<tr><td> </td><td>" + rules + "</td></tr>";

					matchedSheets++;
				}

				return rules;
			}

			function showSubStyleSheet(ss, idx) {
				var rules = showRulesRecursive(ss, idx);
				if (rules) {
					return " <span style=\"cursor: pointer; color: #999999\" onclick=\"var o=document.getElementById(\'ss" + idx +
							"\').style; o.display=o.display=='none'?'':'none';\">[" + ss.cssRules.length +
							(ss.cssRules.length == 1? " rule": " rules") + " inside]</span><table id=\"ss" +
							idx + "\"" + (special? ">": " style=\"display: none\">") + rules + "</table>";
				}
				return emptyStyles? " <span style=\"color: #999999\">(no rules)</span>": "";
			}

            commandline.echo(list, commandline.HL_NORMAL, commandline.FORCE_MULTILINE);

		}, {}, true
	);

	commands.addUserCommand(
		["cssheets"],
		"Lists all CSS stylesheets for current page",
		function (args, special, count) {

			var ss = liberator.plugins.cssRules.styleSheets;
            var list = ":" + (util.escapeHTML(commandline.getCommand()) || "cssheets") + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th colspan=\"2\">--- CSS stylesheets (" + ss.length + ") ---</th></tr>";

			filter = new RegExp(args || ".");

			list += liberator.plugins.cssRules.foreachStyleSheet(function (ss, idx, filter) {
				var href = ss.href || "";
				var disabled = ss.disabled? " style=\"text-decoration: line-through\" ": "";
				var displayHref = ss instanceof CSSMediaRule? ("@media " + ss.medis.mediaText): (href || "Embedded Styles");

				if (filter.test(displayHref)) {
					if (href)
						href = "<a href=\"#\" class=\"hl-URL\"" + disabled + ">" + util.escapeHTML(href) + "</a>";
					else
						href = "<span class=\"hl-InfoMsg\"" + disabled + ">" + displayHref + "</span>";

					return "<tr align=\"left\"><td align=\"right\">" + idx + ":</td><td>" + href + " <span style=\"color: #999999\">(" + ss.cssRules.length + " rule" + (ss.cssRules.length == 1? "": "s") + ")</span></th></tr>";
				}
			}, filter).join("");

			list += "</table>";

            commandline.echo(list, commandline.HL_NORMAL, commandline.FORCE_MULTILINE);

		}, {}, true
	);

	commands.addUserCommand(
		["cssheetsets", "cssets"],
		"Lists all CSS stylesheets for current page",
		function (args, special, count) {

			var doc = tabs.getTab().linkedBrowser.contentDocument;
			var ss = doc.styleSheetSets;
			var cur = doc.selectedStyleSheetSet;

            var list = ":" + (util.escapeHTML(commandline.getCommand()) || "cssheetsets") + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th colspan=\"3\">--- CSS stylesheet sets (" + ss.length + ") ---</th></tr>";

			filter = new RegExp(args || ".");

			for (var i = 0; i < ss.length; i++) {
				if (filter.test(ss[i])) {
					var current = ss[i] == cur? "<span style=\"color: blue\">&gt;</span>": " ";
					list += "<tr align=\"left\"><td>" + current + "</td><td>" + (i + 1) + "</td><td>" + (ss[i] || "Default stylesheet set") + "</td>";
				}
			}

			list += "</table>";

            commandline.echo(list, commandline.HL_NORMAL, commandline.FORCE_MULTILINE);

		}, {}, true
	);

	commands.addUserCommand(
		["cssd[ump]"], // FIXME
		"Dump CSS stylesheets into local file",
		function (args, special, count) {

			var fileName = args[0];
			var file;
			//var pattern = args[1];
			if (fileName) {
				file = io.getFile(fileName);
				if (file.exists() && !special) {
					echoerr("E189: \"" + fileName + "\" exists (add ! to override)");
					return;
				}
			}

			var ss;
			var list = "";

			if (parseInt(count) > 0 || (count = options["defaultcssheet"])) {
				var ss = liberator.plugins.cssRules.getStyleSheet(count);
				if (!ss) {
					echoerr("Illegal stylesheet index!");
					return;
				}

				list = buildRuleList(ss);
			} else {
				ss = liberator.plugins.cssRules.styleSheets;
				for (var i = 0; i < ss.length; i++)
					list += buildRuleList(ss[i]);
			}

			if (fileName) {
            	io.writeFile(file, list);
			} else {
				util.copyToClipboard(list, true);
			}

			function buildRuleList(ss) {
				var rules = "";
				for (var j = 0; j < ss.cssRules.length; j++) {
					rules += liberator.plugins.cssRules.textRule(ss.cssRules[j]) + "\n\n";
				}
				if (rules)
					return "/*** " + (ss.href || "Embedded Styles") + " ***/\n" + rules;

				return "";
			}
		},
		{
			argCount: "*",
			completer: function (filter) { return completion.file(filter); }
		}, true
	);

	commands.addUserCommand(
		["mvcss[rule]"],
		"Move CSS rule to a specified position in stylesheet or between stylesheets",
		function (args, special, count) {
		// TODO
		},
		{
		}, true
	);

	commands.addUserCommand(
		["cssload"],
		"Load CSS from local file",
		function (args, special, count) {
		// TODO
		},
		{
		}, true
	);

	commands.addUserCommand(
		["sc", "setc[ount]"],
		"Run ex-command with specified count, not supported by Vimperator",
		function (args, special, count) {
			var matches = args.match(/^(%|[0-9.,-]+)\s+(\w+)(\s+(.+?))?\s*$/);
			if (!matches) {
				echoerr("Illegal arguments");
				return;
			}

			var newCount = matches[1];
			var exCmd = matches[2];
			var exArgs = matches[4];

			var cmd = commands.get(exCmd);
			if (!cmd) {
				echoerr("Not an ex command: " + exCmd);
				return;
			}

			var counts = newCount.split(",");
			for (var i = 0; i < counts.length; i++) {
				var range = counts[i].match(/^(\d+)-(\d+)$/);
				if (range) {
					for (var k = range[1]; k <= range[2]; k++)
						cmd.execute(exArgs, special, k);
				} else {
					cmd.execute(exArgs, special, counts[i]);
				}
			}
		},
		{
		}, true
	);

	options.add(
		["disabledcssheets", "dcss"],
		"Set disabled CSS stylesheets",
		"stringlist",
		"",
		{
			validator: function (value) {
				if (value == "" || value == "all") return true;

				return value.split(",").every(function (v) { return liberator.plugins.cssRules.getStyleSheet(v) });
			},
			setter: function (value) {
				var arr = value + ",";

				liberator.plugins.cssRules.foreachStyleSheet(
					function (ss, idx, value) {
						ss.disabled = value == "all," || value.indexOf(idx + ",") >= 0;
						return;
					},
					arr
				);
			},
			getter: function () {

				var arr = liberator.plugins.cssRules.foreachStyleSheet(
					function (ss, idx) {
						if (ss.disabled)
							return idx;
					}
				);

				value = arr.join(",");
				this.value = value;
				return value;
			},
			completer: function (filter) {
				var cpt = [["all", "All stylesheets"]];

				cpt = cpt.concat(liberator.plugins.cssRules.foreachStyleSheet(
					function (ss, idx, cpt) {
						return [ idx, ss.href || (ss instanceof CSSMediaRule? ("@media " + ss.media.mediaText): "Embedded Style") ];
					}
				));

				return cpt;
			},
			scope: options.OPTION_SCOPE_LOCAL
		}
	);

	options.add(
		["hlcsssyntax", "hlcss"],
		"Highlight CSS syntax for :cssrule/:cssrules commands",
		"charlist",
		"s",
		{
			validator: function (value) {
				return !(/[^sl]/.test(value));
			},
			completer: function (filter) {
				return [
					["s", "Highlight CSS syntax for :cssrule command (display [s]ingle)"],
					["l", "Highlight CSS syntax for :cssrules command (display [l]ist of rules)"]
				];
			},
			scope: options.OPTION_SCOPE_BOTH
		}
	);

	options.add(
		["emptycssheets", "ecss"],
		"Show/hide empty stylesheets shown by :cssrules",
		"boolean",
		false,
		{
			scope: options.OPTION_SCOPE_BOTH
		}
	);

	options.add(
		["cssheetset", "csset"],
		"Set active stylesheet set for current page",
		"string",
		"",
		{
			validator: function (value) {
				if (value == "") return true;
				var ss = window.content.document.styleSheetSets;

				for (var i = 0; i < ss.length; i++)
					if (ss[i] == value)
						return true;

				return false;
			},
			setter: function (value) {
				window.content.document.selectedStyleSheetSet = value;
			},
			getter: function () {
				value = window.content.document.selectedStyleSheetSet;
				this.value = value;
				return value;
			},
			completer: function (filter) {
				var cpt = [["", "Default stylesheet set"]];
				var ss = window.content.document.styleSheetSets;

				for (var i = 0; i < ss.length; i++)
					cpt.push([ss[i], "Alternate stylesheet set"]);

				return cpt;
			},
			scope: options.OPTION_SCOPE_LOCAL
		}
	);

	options.add(
		["defaultcssheet", "defcss"],
		"Set default stylesheet to work with",
		"stringlist",
		"",
		{
			validator: function (value) {
				if (value == "") return true;

				return !!liberator.plugins.cssRules.getStyleSheet(value);
			},
			completer: function (filter) {
				var cpt = [["", "All stylesheets"]];

				cpt = cpt.concat(liberator.plugins.cssRules.foreachStyleSheet(
					function (ss, idx, cpt) {
						return [ idx, ss.href || (ss instanceof CSSMediaRule? ("@media " + ss.media.mediaText): "Embedded Style") ];
					}
				));

				return cpt;
			},
			scope: options.OPTION_SCOPE_LOCAL
		}
	);

	return {

	get styleSheets() {
		//return tabs.getTab().linkedBrowser.focusedWindow.document.styleSheets;
		return tabs.getTab().linkedBrowser.contentDocument.styleSheets;
	},

	getStyleSheet: function (idx) {
		var ss = liberator.plugins.cssRules.styleSheets;
		if (typeof(idx) == "number") {
			if (idx > 0 && idx <= ss.length)
				return ss[idx - 1];
			else
				return null;
		}

		var path = idx.split(".").map(function (v) { return parseInt(v) - 1 });
		if (path[0] < 0 || path[0] >= ss.length)
			return null;
		if (path.some(function (v) { return isNaN(v) || (v < 0) }))
			return null;

		var ss = ss[path[0]];
		for (var i = 1; i < path.length; i++) {
			if (ss.cssRules[path[i]] && ss.cssRules[path[i]].type == CSSRule.IMPORT_RULE) {
				ss = ss.cssRules[path[i]].styleSheet;
			} else {
				var mnum = 0;
				while (ss.cssRules[mnum] == CSSRule.IMPORT_RULE) { mnum++; }
				var failed = true;
				for (var j = mnum; j < ss.cssRules.length; j++) {
					if (ss.cssRules[j].type == CSSRule.MEDIA_RULE) {
						if (mnum++ == path[i]) {
							ss = ss.cssRules[j];
							failed = false;
							break;
						}
					}
				}
				if (failed)
					return null;
			}
		}

		return ss;
	},

	foreachStyleSheet: function (func, state, excludeMedia) {
		var ss = liberator.plugins.cssRules.styleSheets;
		var output = new Array();

		for (var i = 0; i < ss.length; i++) {
			foreachStyleSheetRecursive(ss[i], i + 1);
		}
		return output;

		function foreachStyleSheetRecursive(ss, idx) {
			var i = 0;
			var len = ss.cssRules.length;
			var out = func(ss, idx, state);
			if (out != undefined)
				output.push(out);

			for (; i < len && ss.cssRules[i].type == CSSRule.IMPORT_RULE; i++)
				foreachStyleSheetRecursive(ss.cssRules[i].styleSheet, idx + "." + (i + 1));
			if (!excludeMedia) {
				var mnum = 0;
				for (; i < len; i++)
					if (ss.cssRules[i].type == CSSRule.MEDIA_RULE)
						foreachStyleSheetRecursive(ss.cssRules[i], idx + "." + (++mnum));
			}
		}
	},

	getRule: function (filter, num) {
		var ss;
		var rule;

		filter = filter.toLowerCase();

		if (num) {
			ss = liberator.plugins.cssRules.getStyleSheet(num);
			if (ss && (rule = getRuleRecursive(ss)))
				return rule;
		} else {
			ss = liberator.plugins.cssRules.styleSheets;
			for (var i = 0; i < ss.length; i++) {
				if (rule = getRuleRecursive(ss[i]))
					return rule;
			}
		}


		function getRuleRecursive(ss) {
			var rule;
			var i = 0;
			var len = ss.cssRules.length;
			// Import rules can at the beggining of stylesheet only,
			// so we first try to parse all import rules until they are finished.
			// This way we omit one additional repeating check in main loop
			// and thus speed up whole getting process.
			for (; i < len && ss.cssRules[i].type == CSSRule.IMPORT_RULE; i++) {
				if (rule = getRuleRecursive(ss.cssRules[i].styleSheet))
					return rule;
			}

			for (; i < len; i++) {
				if (ss.cssRules[i].type == CSSRule.MEDIA_TYPE) {
					if (rule = getRuleRecursive(ss.cssRules[i]))
						return rule;
				} else if (ss.cssRules[i].type == CSSRule.STYLE_RULE && ss.cssRules[i].selectorText.toLowerCase() == filter)
					return ss.cssRules[i];
			}
			return null;
		}

		return null;
	},


	resetRule: function (rule, attributes) {
		var attrList = attributes.split("; ");
		for (var i = 0; i < attrList.length; i++) {
			var data = attrList[i].match(/^\s*([a-zA-Z-]+)\s*$/);
			if (data)
				rule.style.removeProperty(data[1]);
		}
	},

	setRule: function (rule, ruleValue, update) {
		if (update) {
			var attrList = ruleValue.split("; ");
			for (var i = 0; i < attrList.length; i++) {
				var data = attrList[i].match(/^\s*([a-zA-Z-]+)\s*:\s*(.*?)\s*;?$/);
				if (data) {
					var important = data[2].match(/!\s*important$/);
					if (important) data[2] = data[2].substring(0, data[2].length - important[0].length);
					rule.style.setProperty(data[1], data[2], important? "important": "");
				}
			}
		} else {
			rule.style.cssText = ruleValue;
		}
	},

	addRule: function (name, num, place) {
		var ss;
		var newPlace;

		if (num) {
			ss = liberator.plugins.cssRules.getStyleSheet(num);
			if (!ss) return null;
		} else {
			ss = liberator.plugins.cssRules.styleSheets[0];
		}

		if (place < 0) place = ss.cssRules.length;

		try {
			var newPlace = ss.insertRule(name + "{}", place);
		}
		catch (e) {
			return null;
		}

		return ss.cssRules[newPlace];
	},

	listRules: function (filter, num) {
		var ss;
		var allRules = [];
		if (filter) filter = filter.toLowerCase();

		if (num) {
			ss = liberator.plugins.cssRules.getStyleSheet(num);
			if (!ss) return null;
			allRules = allRules.concat(listRulesRecursive(ss));
		} else {
			ss = liberator.plugins.cssRules.styleSheets;
			for (var i = 0; i < ss.length; i++) {
				allRules = allRules.concat(listRulesRecursive(ss[i]));
			}
		}

		function listRulesRecursive(ss) {
			var results = [];
			var i = 0;
			var len = ss.cssRules.length;

			for (; i < len && ss.cssRules[i].type == CSSRule.IMPORT_RULE; i++) {
				results = results.concat(listRulesRecursive(ss.cssRules[i].styleSheet));
			}
			for (; i < len; i++) {
				if (ss.cssRules[i].type == CSSRule.MEDIA_RULE) {
					results = results.concat(listRulesRecursive(ss.cssRules[i]));
				} else if (ss.cssRules[i].type == CSSRule.STYLE_RULE || ss.cssRules[i].type == CSSRule.PAGE_RULE) {
					if (!filter || (filter && ss.cssRules[i].selectorText.toLowerCase().indexOf(filter) >= 0))
						results.push([ss.cssRules[i].selectorText, ss.cssRules[i].style.cssText]);
				} else if (ss.cssRules[i].type == CSSRule.FONT_FACE_RULE) {
					if (!filter || (filter && "@font-face".indexOf(filter) >= 0))
						results.push(["@font-face", ss.cssRules[i].style.cssText]);
				}
			}

			return results;
		}

		return allRules;
	},

	rmRule: function (rule) {
		var ss = rule.parentRule || rule.parentStyleSheet;
		var num = -1;
		for (var i = 0; i < ss.cssRules.length; i++) {
			if (ss.cssRules[i] == rule) {
				num = i;
				break;
			}
		}
		if (num < 0) return false;

		try {
			ss.deleteRule(num);
		}
		catch (e) {
			return false;
		}

		return true;
	},

	HTMLRule: function (rule, quick) {

		switch(rule.type) {
		case CSSRule.STYLE_RULE:
		case CSSRule.PAGE_RULE:
		case CSSRule.FONT_FACE_RULE:

			var html = rule.style.cssText;
			var selector = rule.type == CSSRule.FONT_FACE_RULE? "@font-face": rule.selectorText;
			if (html) {
				if (quick) {
					html = html.replace(/; /g, ";<br/>").replace(/(rgb\(\d{1,3}, \d{1,3}, \d{1,3}\))/g, "$1<span style=\"background-color: $1; border: 1px solid black\">&#160;&#160;</span>");
				} else {
					html = html.replace(/! important;/g, "<span style=\"color: red\">! important</span>;").replace(/(^|; )([a-z-]+): /g, "</span>;<br/><span style=\"color: green\">$2</span>: <span style=\"color: blue\">").replace(/url\((.+?)\)/g, "url(<a href=\"#\" class=\"hl-URL\">$1</a>)");
					html = html.substring(13, html.length - 1).replace(/(rgb\(\d{1,3}, \d{1,3}, \d{1,3}\))/g, "$1<span style=\"background-color: $1; border: 1px solid black\">&#160;&#160;</span>") + "</span>;";
				}
			}
			return "<span style=\"font-weight: bold\">" + selector + "</span> {<div style=\"margin-left: 2em;\">" + html + "</div>}";

		case CSSRule.MEDIA_RULE:
			return "<span style=\"font-weight: bold\">@media</span> <span style=\"color: blue\">" + rule.media.mediaText + "</span> {";
		case CSSRule.IMPORT_RULE:
			return "<span style=\"font-weight: bold\">@import</span> <span style=\"color: blue\">url</span>(<a href=\"#\" class=\"hl-URL\">" +
					rule.styleSheet.href + "</a>);";
		case CSSRule.CHARSET_RULE:
			return "<span style=\"font-weight: bold\">@charset</span> <span style=\"color: blue\">\"" + rule.encoding + "\"</span>;";
		}

	},

	textRule: function (rule, indent) {
		var text = "";
		var indenter = "\t".repeat(indent);
		switch (rule.type) {
		case CSSRule.STYLE_RULE:
		case CSSRule.PAGE_RULE:
			text = indenter + rule.selectorText + " {\n\t" + indenter + rule.style.cssText.replace(/-moz-[a-z-]+: .*?; ?/g, "").replace(/; /g, ";\n\t" + indenter) + "\n" + indenter + "}";
			break;
		case CSSRule.IMPORT_RULE:
			text = indenter + "@import url(" + rule.styleSheet.href + ");\n";
			break;
		case CSSRule.CHARSET_RULE:
			text = indenter + "@charset \"" + rule.encoding + "\";\n";
		case CSSRule.FONT_FACE_RULE:
			text =  indenter + "@font-face {\n\t" + indenter + rule.style.cssText.replace(/; /g, ";\n\t" + indenter) + "\n" + indenter + "}";
			break;
		}
		return text;
	},

	cssProps: [
		"azimuth",
		"background",
		"background-attachment",
		"background-color",
		"background-image",
		"background-position",
		"background-repeat",
		"border",
		"border-collapse",
		"border-color",
		"border-spacing",
		"border-style",
		"border-top",
		"border-right",
		"border-bottom",
		"border-left",
		"border-top-color",
		"border-right-color",
		"border-bottom-color",
		"border-left-color",
		"border-top-style",
		"border-right-style",
		"border-bottom-style",
		"border-left-style",
		"border-top-width",
		"border-right-width",
		"border-bottom-width",
		"border-left-width",
		"border-width",
		"bottom",
		"caption-side",
		"clear",
		"clip",
		"color",
		"content",
		"counter-increment",
		"counter-reset",
		"cue",
		"cue-after",
		"cue-before",
		"cursor",
		"direction",
		"display",
		"elevation",
		"empty-cells",
		"css-float",
		"font",
		"font-family",
		"font-size",
		"font-size-adjust",
		"font-stretch",
		"font-style",
		"font-variant",
		"font-weight",
		"height",
		"left",
		"letter-spacing",
		"line-height",
		"list-style",
		"list-style-image",
		"list-style-position",
		"list-style-type",
		"margin",
		"margin-top",
		"margin-right",
		"margin-bottom",
		"margin-left",
		"marker-offset",
		"marks",
		"max-height",
		"max-width",
		"min-height",
		"min-width",
		"orphans",
		"outline",
		"outline-color",
		"outline-style",
		"outline-width",
		"overflow",
		"padding",
		"padding-top",
		"padding-right",
		"padding-bottom",
		"padding-left",
		"page",
		"page-break-after",
		"page-break-before",
		"page-break-inside",
		"pause",
		"pause-after",
		"pause-before",
		"pitch",
		"pitch-range",
		"position",
		"quotes",
		"richness",
		"right",
		"size",
		"speak",
		"speak-header",
		"speak-numeral",
		"speak-punctuation",
		"speech-rate",
		"stress",
		"table-layout",
		"text-align",
		"text-decoration",
		"text-indent",
		"text-shadow",
		"text-transform",
		"top",
		"unicode-bidi",
		"vertical-align",
		"visibility",
		"voice-family",
		"volume",
		"white-space",
		"widows",
		"width",
		"word-spacing",
		"z-index",
		"-moz-appearance",
		"-moz-background-clip",
		"-moz-background-inline-policy",
		"-moz-background-origin",
		"-moz-binding",
		"-moz-border-bottom-colors",
		"-moz-border-left-colors",
		"-moz-border-right-colors",
		"-moz-border-top-colors",
		"-moz-border-radius",
		"-moz-border-radius-topleft",
		"-moz-border-radius-topright",
		"-moz-border-radius-bottomleft",
		"-moz-border-radius-bottomright",
		"-moz-box-align",
		"-moz-box-direction",
		"-moz-box-flex",
		"-moz-box-orient",
		"-moz-box-ordinal-group",
		"-moz-box-pack",
		"-moz-box-sizing",
		"-moz-column-count",
		"-moz-column-width",
		"-moz-column-gap",
		"-moz-float-edge",
		"-moz-force-broken-image-icon",
		"-moz-image-region",
		"-moz-margin-end",
		"-moz-margin-start",
		"-moz-opacity",
		"-moz-outline",
		"-moz-outline-color",
		"-moz-outline-radius",
		"-moz-outline-radius-topleft",
		"-moz-outline-radius-topright",
		"-moz-outline-radius-bottomleft",
		"-moz-outline-radius-bottomright",
		"-moz-outline-style",
		"-moz-outline-width",
		"-moz-outline-offset",
		"-moz-padding-end",
		"-moz-padding-start",
		"-moz-user-focus",
		"-moz-user-input",
		"-moz-user-modify",
		"-moz-user-select",
		"opacity",
		"outline-offset",
		"overflow-x",
		"overflow-y",
		"ime-mode",
		"-moz-border-end",
		"-moz-border-end-color",
		"-moz-border-end-style",
		"-moz-border-end-width",
		"-moz-border-start",
		"-moz-border-start-color",
		"-moz-border-start-style",
		"-moz-border-start-width",
	]

	};

} ();

}

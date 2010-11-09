var Combobox = function(element, options) {
	var defaults = {
		selected: null,
		showSelected: true,
		allowedChars: 'alpha',
		effect: 'slide',
		speed: 200,
		forceMatch: true,
		imgSelect: false,
		onSelect: function() {}
	};
	var settings = $.extend(defaults, options);

	var self = this;
	var jqobj = $('#' + element);
	var name = jqobj.attr('name');
	var id = jqobj.attr('id');
	var options_id = 'cb-' + id + '-options';
	var display_input_id = 'cb-' + id + '-input';
	var display_input_name = 'cb_' + id + '_input';
    var command_chars = {
    	"13": "enter",
    	"27": "esc"
    };
    
    var navigation_chars = {
    	"37" : "left",
    	"38" : "up",
    	"39" : "right",
    	"40" : "down"
    };
    
    var alpha_chars = {
    	"65" : "a",
    	"66" : "b",
    	"67" : "c",
    	"68" : "d",
    	"69" : "e",
    	"70" : "f",
    	"71" : "g",
    	"72" : "h",
    	"73" : "i",
    	"74" : "j",
    	"75" : "k",
    	"76" : "l",
    	"77" : "m",
    	"78" : "n",
    	"79" : "o",
    	"80" : "p",
    	"81" : "q",
    	"82" : "r",
    	"83" : "s",
    	"84" : "t",
    	"85" : "u",
    	"86" : "v",
    	"87" : "w",
    	"88" : "x",
    	"89" : "y",
    	"90" : "z"
    };
    
    var numeric_chars = {
    	"48" : "0",
    	"49" : "1",
    	"50" : "2",
    	"51" : "3",
    	"52" : "4",
    	"53" : "5",
    	"54" : "6",
    	"55" : "7",
    	"56" : "8",
    	"57" : "9",
    	"97" : "1",
    	"98" : "2",
    	"99" : "3",
    	"100" : "4",
    	"101" : "5",
    	"102" : "6",
    	"103" : "7",
    	"104" : "8",
    	"105" : "9",
    	"96" : "0"
    };

    var alpha_numeric_chars = $.extend($.extend({}, alpha_chars), numeric_chars, { "8": "backspace", "46": "delete" });
	var opts = [];
	var matches = [];
	var search_string = '';
	var keys = [];
	var key = null;
	var selected = {};

	jqobj.children().each(function() {
		var elem = $(this);
		option = {
			label: elem.text(),
			value: elem.val(),
			img: elem.attr('rel')
		};
		opts.push(option);
	});

	var build_control_markup = function(id, options) {
		var opts = ['<ul class="cb-options" id="' + options_id + '">'];
		var set_value = '';
		var set_label = '&nbsp;';
		$(options).each(function(n) {
			var css_class = (n == (options.length - 1)) ? 'last' : '';
			var selected = (this.value == settings.selected || this.label == settings.selected) ? true : false;
			var select = selected ? 'selected="selected"' : '';
			if(selected) {
				set_value = this.value;
				set_label = this.label;
				set_image = this.img;
				if (settings.showSelected) {
					if(settings.imgSelect) {
						opts.push('<li rel="' + this.value + '" class="' + css_class + ' selected"' + select + '  title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '" /></li>');
					}
					else {
						opts.push('<li rel="' + this.value + '" class="' + css_class + ' selected"' + select + '>' + this.label + '</li>');
					}
				}
			}
			else {
				if(settings.imgSelect) {
					opts.push('<li rel="' + this.value + '" class="' + css_class + '"' + select + '  title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '"/></li>');
				}
				else {
					opts.push('<li rel="' + this.value + '" class="' + css_class + '"' + select + '>' + this.label + '</li>');
				}
			}
		});
		opts.push('</ul>');
		var template = '';
		if(settings.imgSelect) {
			template = '<div id="cb-' + id + '" class="combobox"><span contenteditable="true" id="' + display_input_id + '"class="cb-input" type="text" name="' + display_input_name + '" value="' + set_value + '" rel="' + set_label + '"><img src="' + set_image + '" alt="' + set_value + '" title="' + set_label + '" /></span><div class="cb-selector"><span /></div>' + opts.join("\n") + '</div>';
		}
		else {

			template = '<div id="cb-' + id + '" class="combobox"><input id="' + display_input_id + '"class="cb-input" type="text" name="' + display_input_name + '" value="' + set_label + '" rel="' + set_value + '"/><div class="cb-selector"><span /></div>' + opts.join("\n") + '</div>';
		}
		return template;
	};

	var highlight_selected = function(value) {
		match_list.find('.selected').removeClass('selected');
		match_list.find('li[rel=' + value + ']').addClass('selected');
	};

	var set_value = function(value) {
		opts.each(function(option) {
			if(option.value == value) {
				selected.label = option.label;
				selected.value = option.value;
				selected.img = option.img;
			}

			if(option.label == value) {
				selected.label = option.label;
				selected.value = option.value;
				selected.img = option.img;
			}
		});

		jqobj.val(selected.value);

		if(settings.imgSelect) {
			display_input.html('<img src="' + selected.img + '" title="' + selected.label + '" />');
			display_input.attr('rel', selected.value);
		}
		else {
			display_input.val(selected.label);
			display_input.attr('rel', selected.value);
		}

		highlight_selected(selected.value);

		settings.onSelect.call(this, selected);
	};

	var reset_matches = function () {
		match_list.find('.match').removeClass('match');
		match_list.find('.last').removeClass('last');
		match_list.find('li:last').addClass('last');
		match_list_items.each(function() {
			$(this).show();
		});
	};

	var show_matches = function() {
		switch(settings.effect) {
			case 'slide':
				match_list.slideDown(settings.speed);
			break;

			case 'fade':
				match_list.fadeIn(settings.speed);
			break;

			case 'none':
				match_list.show();
			break;
		}
	};

	var hide_matches = function() {
		switch(settings.effect) {
			case 'slide':
				match_list.slideUp(settings.speed);
			break;

			case 'fade':
				match_list.fadeOut(settings.speed);
			break;

			case 'none':
				match_list.hide();
			break;
		}
	};

	var find_match = function(search_string) {
		var match = false;
		var pattern = new RegExp(search_string, 'gi');
		var num_matches = 0;
		match_list.find('li.match').removeClass('match');
		match_list.find('li.last').removeClass('last');
		opts.each(function(option) {
			if(option.label.match(pattern)) {
				match_list.find('li[rel=' + option.value + ']').show().addClass('match');
				num_matches++;
			}
			else {
				match_list.find('li[rel=' + option.value + ']').hide().removeClass('match');
			}
		});

		match_list.find('li.match:last').addClass('last');

		return match;
	};

	var filter_match_list = function() {
		search_string = display_input.val();
		if(search_string !== '') {
			var match = find_match(search_string);
			if(match_list.is(':hidden')) {
				show_matches();
			}
		}
		else {
			reset_matches();
		}
	};

	var execute_command = function(command) {
		switch(command) {
			case 'esc':
				reset_matches();
				var selected_value = match_list.find('.selected').html();
				display_input.val(selected_value);
				hide_matches();
			break;

			case 'enter':
				var current_hilighted = match_list.find('.hilighted');
				if(current_hilighted.length > 0) {
					display_input.val(current_hilighted.html());
					match_list.find('.selected').removeClass('selected');
					current_hilighted.removeClass('hilighted').addClass('selected');
					hide_matches();
				}
			break;
		}
	};

	var navigate = function(direction) {
		switch(direction) {
			case "up":
				if(!match_list.is(':hidden')) {
					var current_hilighted = match_list.find('.hilighted');
					var next_hilighted = current_hilighted.prev('li');
					if(next_hilighted.length !== 0) {
						current_hilighted.removeClass('hilighted');
						next_hilighted.addClass('hilighted');
					}
					else {
						match_list.find('.hilighted').removeClass('hilighted');
						hide_matches();
					}
				}
			break;

			case "down":
				if(match_list.is(':hidden')) {
					show_matches();
					match_list.find('li:first').addClass('hilighted');
				}
				else {
					var current_hilighted = match_list.find('.hilighted');
					var next_hilighted = current_hilighted.next('li');
					if(!current_hilighted.hasClass('last')) {
						current_hilighted.removeClass('hilighted');
						next_hilighted.addClass('hilighted');
					}
				}
			break;

			case "left":

			break;

			case "right":

			break;
		}
	};

	jqobj.hide();
	var control_markup = build_control_markup(id, opts);
	jqobj.after(control_markup);
	var combobox = $('#cb-' + id);
	var selector = combobox.find('.cb-selector');
	var match_list = $('#' + options_id);
	var match_list_items = match_list.find('li');
	var display_input = $('#' + display_input_id);

	selector.click(function() {
		switch(settings.effect) {
			case 'slide':
				match_list.slideToggle(settings.speed);
			break;

			case 'fade':
				if(match_list.is(':hidden')) {
					match_list.fadeIn(settings.speed);
				}
				else {
					match_list.fadeOut(settings.speed);
				}
			break;

			case 'none':
				match_list.toggle();
			break;
		}
	});

	display_input.keyup(function(e) {
		key = e.keyCode;

		if (typeof alpha_numeric_chars[key] !== "undefined") {
			filter_match_list();
		}
		else if (typeof command_chars[key] !== "undefined") {
			execute_command(command_chars[key]);
		}
		else if (typeof navigation_chars[key] !== "undefined") {
			navigate(navigation_chars[key]);
		}
	});

	match_list_items.live('click', function() {
		var value = $(this).attr('rel');
		var label = $(this).text();

		set_value(value);
		hide_matches();
	});

	return {
		name: name,
 		id: id,
		selector: '#' + element,
		val: function(value) {
			if(typeof value === 'undefined') {
				set_value(value);
			}
			else {
				return selected.value;
			}
		}
	};
};

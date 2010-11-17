if (window.jQuery) {
    jQuery.fn.log = function (msg) {
        console.log("%s: %o", (msg || 'Log'), this);
        return this;
    };
}

(function($) {
    $.fn.combobox = function(options) {
    	// Parse and setup plugin settings
        var defaults = {
    		selected: null,
    		showSelected: true,
    		selectdefault: true,
    		allowedChars: 'alpha',
    		effect: 'slide',
    		speed: 200,
    		forceMatch: false,
    		imgSelect: false,
    		otherField: true,
    		otherName: null,
    		onSelect: function() {}
    	};
    	
        var settings = $.extend(defaults, options);
        
        if(settings.forceMatch) {
        	settings.otherField = false;
        }

        return this.each(function() {
        	// Private functions
	        var create_markup = function(id, options) {
				var opts = ['<ul class="cb-options" id="' + options_id + '">'],
				set_value = '',
				set_label = '';
				
				if(settings.selectdefault && !settings.selected) {
			    	settings.selected = options[0].value;
			    }
			    
				$(options).each(function(n) {
					var css_class = (n == (options.length - 1)) ? 'last' : '';
					var selected = (this.value == settings.selected || this.label == settings.selected) ? true : false;
					var select = selected ? 'selected="selected"' : '';
					if (selected) {
						set_value = this.value;
						set_label = this.label;
						set_image = this.img;
						if (settings.showSelected) {
							if (settings.imgSelect) {
								opts.push('<li rel="' + this.value + '" class="' + css_class + ' selected"' + select + '  title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '" /></li>');
							}
							else {
								opts.push('<li rel="' + this.value + '" class="' + css_class + ' selected"' + select + '>' + this.label + '</li>');
							}
						}
					}
					else {
						if (settings.imgSelect) {
							opts.push('<li rel="' + this.value + '" class="' + css_class + '"' + select + '  title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '"/></li>');
						}
						else {
							opts.push('<li rel="' + this.value + '" class="' + css_class + '"' + select + '>' + this.label + '</li>');
						}
					}
				});
				opts.push('</ul>');
				var template = '';
				var other_field = settings.otherField ? '<input type="hidden" name="' + other_name + '"/>' : '';
				if (settings.imgSelect) {
					template = '<div id="cb-' + id + '" class="combobox"><span contenteditable="true" id="' + display_input_id + '"class="cb-input" type="text" name="' + display_input_name + '" value="' + set_value + '" rel="' + set_label + '"><img src="' + set_image + '" alt="' + set_value + '" title="' + set_label + '" /></span><div class="cb-selector"><span /></div>' + opts.join("\n") + '</div>' + other_field;
				}
				else {
			
					template = '<div id="cb-' + id + '" class="combobox"><input id="' + display_input_id + '"class="cb-input" type="text" name="' + display_input_name + '" value="' + set_label + '" rel="' + set_value + '"/><div class="cb-selector"><span /></div>' + opts.join("\n") + '</div>' + other_field;
				}
				return template;
			};
			
			var get_key_type = function(key) {
				if (typeof alpha_numeric_chars[key] !== "undefined") {
					return 'alpha_numeric';
				}
				else if (typeof command_chars[key] !== "undefined") {
					return 'command';
				}
				else if (typeof navigation_chars[key] !== "undefined") {
					return 'navigation';	
				}
			};
			
			var filter_match_list = function(search_string) {
				if (search_string !== '') {
					var match = find_match(search_string);
					if(match) {
					    if (match_list.is(':hidden')) {
							show_matches();
						}
					}
					else {
					    match_list.hide();
					}
				}
				else {
					reset_matches();
				}
			};
			
			var find_match = function(search_string) {
				var match = false,
					pattern = new RegExp(search_string, 'gi');
				matches = [];
				match_list.find('li.match').removeClass('match');
				match_list.find('li.last').removeClass('last');
				$(opts).each(function(i) {
					if (opts[i].label.match(pattern)) {
						match_list.find('li[rel=' + opts[i].value + ']').show().addClass('match').removeClass('hidden');
						matches.push(opts[i]);
					}
					else {
						match_list.find('li[rel=' + opts[i].value + ']').hide().removeClass('match').addClass('hidden');
					}
				});
			    
				match_list.find('li.match:last').addClass('last');
			    
				if(matches.length > 0) {
				    match = true;
				}
				
				return match;
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
			
			var reset_matches = function () {
				matches = [];
				match_list.find('.match').removeClass('match');
				match_list.find('.last').removeClass('last');
				match_list.find('li:last').addClass('last');
				match_list_items.each(function() {
					$(this).show();
				});
			};
			
			var set_value = function(value) {
				original_element.val(selected.value);
				settings.onSelect.call(this, selected);
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
						if (current_hilighted.length > 0) {
							display_input.val(current_hilighted.html());
							var selected = get_selected_option(current_hilighted.attr('rel'));
							set_value(selected);
							match_list.find('.selected').removeClass('selected');
							current_hilighted.removeClass('hilighted').addClass('selected');
							hide_matches();
						}
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
			
			var get_selected_option = function(value) {
				var selected = {};
				
				$(opts).each(function(i) {
					if (opts[i].value == value) {
						selected.label = opts[i].label;
						selected.value = opts[i].value;
						selected.img = opts[i].img;
					}
			
					if (opts[i].label == value) {
						selected.label = opts[i].label;
						selected.value = opts[i].value;
						selected.img = opts[i].img;
					}
				});
				
				return selected;
			};
			
			var navigate = function(direction) {
				switch(direction) {
					case "up":
						if (!match_list.is(':hidden')) {
							var current_hilighted = match_list.find('.hilighted');
							var next_hilighted = current_hilighted.prev('li').not(':hidden');
							if (next_hilighted.length !== 0) {
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
						if (match_list.is(':hidden')) {
							show_matches();
						}
						
						if(match_list.find('.hilighted').length === 0) {
							match_list.find('li:first').addClass('hilighted');
							console.log(match_list.find('.hilighted').text());
						}
						else {
							match_list.find('.hilighted').removeClass('hilighted').next('li:visible').addClass('hilighted');
						}
					break;
				}
			};
			
			var display_selected = function(selected) {
				if (settings.imgSelect) {
					display_input.html('<img src="' + selected.img + '" title="' + selected.label + '" />');
					display_input.attr('rel', selected.value);
				}
				else {
					display_input.val(selected.label);
					display_input.attr('rel', selected.value);
				}
				
				highlight_selected(selected.value);
			};
			
			var highlight_selected = function(value) {
				match_list.find('.selected').removeClass('selected');
				match_list.find('li[rel=' + value + ']').addClass('selected');
			};
			
			// Plugin setup
            var original_element = $(this),
            	name = original_element.attr('name'),
            	other_name = settings.otherName || name + '_other',
            	id = original_element.attr('id'),
            	options_id = 'cb-' + id + '-options',
            	display_input_id = 'cb-' + id + '-input',
            	display_input_name = 'cb_' + id + '_input',
            	command_chars = {"13": "enter","27": "esc"},
	            navigation_chars = {"38" : "up","40" : "down"},
	            alpha_chars = {"65" : "a","66" : "b","67" : "c","68" : "d","69" : "e","70" : "f","71" : "g","72" : "h","73" : "i","74" : "j","75" : "k","76" : "l","77" : "m","78" : "n","79" : "o","80" : "p","81" : "q","82" : "r","83" : "s","84" : "t","85" : "u","86" : "v","87" : "w","88" : "x","89" : "y","90" : "z"},
	            numeric_chars = {"48" : "0","49" : "1","50" : "2","51" : "3","52" : "4","53" : "5","54" : "6","55" : "7","56" : "8","57" : "9","97" : "1","98" : "2","99" : "3","100" : "4","101" : "5","102" : "6","103" : "7","104" : "8","105" : "9","96" : "0"},
	            alpha_numeric_chars = $.extend($.extend({}, alpha_chars), numeric_chars, { "8": "backspace", "46": "delete" }),
	            opts = [],
	            matches = [],
	            search_string = '',
	            keys = [],
	            key = null,
	            selected = {};
	            
	        // Populate the options array
	        original_element.children().each(function() {
				var elem = $(this);
				option = {
					label: elem.text(),
					value: elem.val(),
					img: elem.attr('rel')
				};
				opts.push(option);
			});
			
			original_element.hide();
			
			if (settings.otherField) {
				original_element.append('<option value="other"/>');
			}
			
			var control_markup = create_markup(id, opts);
			
			original_element.after(control_markup);
			
			var combobox = $('#cb-' + id),
				other_field = $('[name="'+ other_name + '"]'),
				selector = combobox.find('.cb-selector'),
				match_list = $('#' + options_id),
				match_list_items = match_list.find('li'),
				display_input = $('#' + display_input_id);
				
			// Activate plugin
			selector.click(function() {
				switch(settings.effect) {
					case 'slide':
						match_list.slideToggle(settings.speed);
					break;
			
					case 'fade':
						if (match_list.is(':hidden')) {
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
				var key = e.keyCode,
					search_string = $(this).val();
				switch(get_key_type(key)) {
					case 'alpha_numeric':
						filter_match_list(search_string);
						if(matches.length === 1) {
							var exclusive_match = matches[0];
							set_value(exclusive_match.value);
						}
						else if (matches.length === 0 && search_string !== '') {
							set_value('other');
							other_field.val(search_string);
						}
						else if (search_string === '') {
				    		other_field.val('');
						}
					break;
					
					case 'command':
						execute_command(command_chars[key]);
					break;
					
					case 'navigation':
						navigate(navigation_chars[key]);
					break;
				}
			});
			
			match_list_items.live('click', function() {
				var value = $(this).attr('rel'),
					label = $(this).text();
					selected = get_selected_option(value);
					
				set_value(selected);
				display_selected(selected);
				hide_matches();
			});
        });
    };
})(jQuery);
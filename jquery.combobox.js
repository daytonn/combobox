(function($) {
	$.fn.combobox = function(options) {
		// Parse and setup plugin settings
		var defaults = {
			selectBox: true,
			showSelected: true,
			selectdefault: true,
			allowedChars: 'alpha',
			effect: 'slide',
			speed: 200,
			forceMatch: false,
			imgSelect: false,
			otherField: true,
			otherName: null,
			wrapperClass: 'combobox',
			inputClass: 'cb-input',
			selectorClass: 'cb-selector',
			optionsClass: 'cb-options',
			optionsWrapperClass: 'cb-options-wrap',
			autocomplete: false,
			url: false,
			data: false,
			dataType: 'json',
			fetchSensitivity: 500,
			useCache: true,
    		onSelect: function() {},
			onCreate: function() {}
		};
		
		var settings = $.extend(defaults, options);
		
		// Force match excludes arbitrary values
        if (settings.forceMatch) {
        	settings.otherField = false;
        }

		// Autocomplete excludes select functionality
		if (settings.autocomplete) {
			settings.selectBox = false;
		}
		
		if (settings.autocomplete && !settings.data && !settings.url) {
			alert('autocomplete combobox requires a url or local data');
		}

        return this.each(function() {
	
			// Plugin setup
			var original_element = $(this);
			var name = original_element.attr('name');
			var other_name = settings.otherName || name + '_other';
			var display_input_name = 'cb_' + name;
			var command_chars = {"13": "enter","27": "esc"};
			var navigation_chars = {"38" : "up","40" : "down"};
			var alpha_chars = {"65" : "a","66" : "b","67" : "c","68" : "d","69" : "e","70" : "f","71" : "g","72" : "h","73" : "i","74" : "j","75" : "k","76" : "l","77" : "m","78" : "n","79" : "o","80" : "p","81" : "q","82" : "r","83" : "s","84" : "t","85" : "u","86" : "v","87" : "w","88" : "x","89" : "y","90" : "z"};
			var numeric_chars = {"48" : "0","49" : "1","50" : "2","51" : "3","52" : "4","53" : "5","54" : "6","55" : "7","56" : "8","57" : "9","97" : "1","98" : "2","99" : "3","100" : "4","101" : "5","102" : "6","103" : "7","104" : "8","105" : "9","96" : "0"};
			var alpha_numeric_chars = $.extend($.extend({}, alpha_chars), numeric_chars, { "8": "backspace", "46": "delete" });
			var available_options = [];
			var matches = [];
			var search_string = '';
			var keys = [];
			var key = null;
			var selected = {};
			var cache = settings.useCache ? [] : null;
	      
			original_element.hide();
	
			// Populate the options array using the options of the original select
			if (settings.selectBox) {
				original_element.children().each(function() {
					var elem = $(this);
					var selected = $(this).attr('selected') ? true : false;
					// create an option object to use in building markup
					option = {
						label: elem.text(),
						value: elem.val(),
						img: elem.attr('rel'),
						selected: selected
					};
					available_options.push(option);
				});
			}
			else if (settings.autocomplete && settings.data) {
				available_options = settings.data;
			}
			
			if (settings.selectBox && settings.otherField) {
				original_element.append('<option value="other"/>');
			}
			
			// Place the combobox markup
			var combobox_classes = [settings.wrapperClass];
			if (settings.autocomplete) {
				combobox_classes.push('autocomplete');
			}
			if (settings.selectBox) {
				combobox_classes.push('selectbox');
			}
			
			original_element.wrap('<div class="' + combobox_classes.join(' ') + '"/>');
			original_element.after(create_markup(available_options));
			
			var combobox = original_element.parent();
			var combobox_inner = original_element.next('.inner');
			var other_field = $('[name="'+ other_name + '"]');
			var selector = combobox_inner.find('.' + settings.selectorClass);
			var match_list = combobox_inner.find('.' + settings.optionsClass);
			var match_list_items = match_list.find('li');
			var display_input = combobox_inner.find('.' + settings.inputClass);
			
			settings.onCreate.call(this, combobox);
				
			// Show options on selector click
			selector.click(function() {
				if (match_list.is(':hidden')) {
					show_matches();
				}
				else {
					hide_matches();
				}
			});

			display_input.keyup(function(e) {
   				handle_input(e);
			});
			
			// Observe list item clicks
			combobox.delegate('.' + settings.optionsClass + ' li', 'click', function() {
				var value = $(this).attr('rel');
				var label = $(this).text();
				var selected = get_selected_option(value);

				set_value(selected);
				display_selected(selected);
				hide_matches();
			});
						
        	// Private functions
	        function create_markup(options) {
				var selected_value = '';
				var selected_label = '';
				var combobox_options = create_options_markup(options);
				var markup = [];
				
				markup.push('<div class="inner">');
							
				if (settings.imgSelect) {
					markup.push('<span contenteditable="true" class="' + settings.inputClass + '" type="text" name="' + display_input_name + '" value="' + selected_value + '" rel="' + selected_label + '"><img src="' + set_image + '" alt="' + selected_value + '" title="' + selected_label + '" /></span>');
				}
				else {
					markup.push('<input class="' + settings.inputClass + '" type="text" name="' + display_input_name + '" value="' + selected_label + '" rel="' + selected_value + '"/>');
				}
				
				if (settings.selectBox) {
   				if (settings.otherField) {
   					markup.push('<input type="hidden" name="' + other_name + '"/>');
   				}
   				
					markup.push('<div class="' + settings.selectorClass + '"><span /></div>');
				}
				markup.push('<div class="' + settings.optionsWrapperClass + '"><ul class="' + settings.optionsClass + '">');
				markup.push(combobox_options);
				markup.push('</ul></div>');
				markup.push('</div>');
				
				return markup.join("\n");
			}
			
			function create_options_markup(options) {
				var combobox_options = [];

				if (settings.selectBox && settings.selectdefault) {
			    	options[0].selected = true;
			   }
			    
				// iterate through the options object and build the list
				$(options).each(function(n) {
					var css_class = (n == (options.length - 1)) ? 'last' : '';
					var selected = this.selected ? true : false;
					
					if (selected) {
						selected_value = this.value;
						selected_label = this.label;
						set_image = this.img;
						if (settings.showSelected) {
							if (settings.imgSelect) {
								combobox_options.push('<li rel="' + this.value + '" class="selected ' + css_class + '"  title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '" /></li>');
							}
							else {
								combobox_options.push('<li rel="' + this.value + '" class="selected ' + css_class + '">' + this.label + '</li>');
							}
						}
					}
					else {
						if (settings.imgSelect) {
							combobox_options.push('<li rel="' + this.value + '" class="' + css_class + '" title="' + this.label + '"><img src="' + this.img + '" alt="' + this.value + '" title="' + this.label + '"/></li>');
						}
						else {
							combobox_options.push('<li rel="' + this.value + '" class="' + css_class + '">' + this.label + '</li>');
						}
					}
				});
				
				return combobox_options.join("\n");
			}
			
			function get_key_type(key) {
				if (navigation_chars[key] !== undefined) {
					return 'navigation';	
				}
				else if (alpha_numeric_chars[key] !== undefined) {
					return 'alpha_numeric';
				}
				else if (command_chars[key] !== undefined) {
					return 'command';
				}
				
			}
			
			function filter_match_list(search_string) {
				if (search_string !== '') {
					var match = find_match(search_string);
					if (match) {
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
			}
			
			function find_match(search_string) {
				var match = false;
				var pattern = new RegExp(search_string, 'gi');
				
				matches = [];
				
				match_list.find('li.match').removeClass('match');
				match_list.find('li.last').removeClass('last');
				
				$(available_options).each(function(i) {
					if (available_options[i].label.match(pattern)) {
						match_list.find('li[rel=\'' + available_options[i].value + '\']').show().addClass('match').removeClass('hidden');
						matches.push(available_options[i]);
					}
					else {
						match_list.find('li[rel=\'' + available_options[i].value + '\']').hide().removeClass('match').addClass('hidden');
					}
				});
			    
				match_list.find('li.match:last').addClass('last');
				
				return (matches.length > 0);
			}
			
			function reset_matches() {
				matches = [];
				match_list.find('.match').removeClass('match');
				match_list.find('.last').removeClass('last');
				match_list.find('li:last').addClass('last');
				match_list_items.each(function() {
					$(this).show();
				});
			}
			
			function set_value(selected) {
				original_element.val(selected.value).change();
				settings.onSelect.call(this, selected, display_input);
			}
			
			function execute_command(command) {
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
			}
			
			function show_matches() {
				switch(settings.effect) {
					case 'slide':
						combobox.addClass('open');
						combobox_inner.addClass('open');
						match_list.slideDown(settings.speed);
					break;
			
					case 'fade':
						combobox.addClass('open');
						combobox_inner.addClass('open');
						match_list.fadeIn(settings.speed);
					break;
			
					case 'none':
						combobox.addClass('open');
						combobox_inner.addClass('open');
						match_list.show();
					break;
				}
			}
			
			function hide_matches() {
				switch(settings.effect) {
					case 'slide':
						match_list.slideUp(settings.speed, function() {
							combobox.removeClass('open');
							combobox_inner.removeClass('open');
						});
					break;
			
					case 'fade':
						match_list.fadeOut(settings.speed, function() {
							combobox.removeClass('open');
							combobox_inner.removeClass('open');
						});
					break;
			
					case 'none':
						match_list.hide('normal', function() {
							combobox.removeClass('open');
							combobox_inner.removeClass('open');
						});
					break;
				}
			}
			
			function get_selected_option(value) {
				var selected = {};
				
				$(available_options).each(function(i) {
					if (available_options[i].value == value) {
						selected.label = available_options[i].label;
						selected.value = available_options[i].value;
						selected.img = available_options[i].img;
					}
			
					if (available_options[i].label == value) {
						selected.label = available_options[i].label;
						selected.value = available_options[i].value;
						selected.img = available_options[i].img;
					}
				});
				
				return selected;
			}
			
			function navigate(direction) {
				switch(direction) {
					case "up":
						navigate_up();
					break;
			
					case "down":
						navigate_down();
					break;
				}
			}
			
			function handle_input(e) {
			    var key = e.keyCode;
				var search_string = display_input.val();

				// Filter through key maps to determine action to handle the input
				switch(get_key_type(key)) {
					case 'alpha_numeric':
						if(search_string === '') {
							hide_matches();
							return false;
						}
						
						if (settings.autocomplete && settings.url && !settings.data) {
							observe_input_entry();
						}
						
						check_search_string_for_matches(search_string);
					break;

					case 'command':
						execute_command(command_chars[key]);
					break;

					case 'navigation':
						navigate(navigation_chars[key]);
					break;
				}
			}
			
			function check_search_string_for_matches(search_string) {
				filter_match_list(search_string);
				// if only one match make that the value
				if (matches.length === 1) {
					set_value(matches[0]);
				}
				// if not a match set input/other to unique value if appropriate
				else if (matches.length === 0 && search_string !== '') {
					if (!settings.forceMatch) {
						set_value('other');
					}							
					if (settings.otherField) {
						other_field.val(search_string);
					}
				}
				// reset if empty
				else if (search_string === '') {
					if (settings.otherField) {
						other_field.val('');
					}
				}
			}
			
			function navigate_up() {
			   if (match_list.is(':visible')) {
					var current_hilighted = match_list.find('.hilighted');
					var next_hilighted = current_hilighted.prev('li').not(':hidden');
					
					// when a previous item exists hilight it
					if (next_hilighted.length !== 0) {
						current_hilighted.removeClass('hilighted');
						next_hilighted.addClass('hilighted');
					}
					// if not we're at the top so close the list
					else {
						match_list.find('.hilighted').removeClass('hilighted');
						hide_matches();
					}
				}
			}
			
			function navigate_down() {
			   // when the list is hidden we should open it
				if (match_list.is(':hidden') && (match_list.find('li').length > 0)) {
					show_matches();
				}
				// when there is no highlighted item, hilight the first
				if (match_list.find('.hilighted').length === 0) {
					match_list.find('li:first').addClass('hilighted');
				}
				else {
					var current_hilighted = match_list.find('.hilighted');
					var next_hilighted = current_hilighted.next('li:visible');
					
					if(next_hilighted.length > 0) {
						current_hilighted.removeClass('hilighted');
						next_hilighted.addClass('hilighted');
					}
				}
			}
			
			function display_selected(selected) {
				if (settings.imgSelect) {
					display_input.html('<img src="' + selected.img + '" title="' + selected.label + '" />');
					display_input.attr('rel', selected.value);
				}
				else {
					display_input.val(selected.label);
					display_input.attr('rel', selected.value);
				}
				
				highlight_selected(selected.value);
			}
			
			function highlight_selected(value) {
				match_list.find('.selected').removeClass('selected');
				match_list.find('li[rel=\'' + value + '\']').addClass('selected');
			}
			
			// timeout var for timeout function to avoid ajax call on every keyup
			var entry_timeout;
			
			var fetchData = function() {
				$.ajax({
					type: 'get',
					url: settings.url,
					data: 'q=' + display_input.val(),
					dataType: 'json',
					contentType: "application/json; charset=utf-8",
					success: function(response) {
					   available_options = response.data;
						update_options_markup(response.data);
						show_matches();
					}
				 });
				
			};
			
			function observe_input_entry() {
				// clear the timeout because data is being entered (this prevents superfluous requests)
				if (entry_timeout !== undefined) {
					clearTimeout(entry_timeout);
				}
				
			   if (display_input.val() !== '') {
					set_fetch_timeout();
				}
			}
			
			function update_options_markup(options) {
				match_list.html(create_options_markup(options));
			}
			
			function set_fetch_timeout() {
			   entry_timeout = setTimeout(fetchData, settings.fetchSensitivity);
			}
      });       
    };
})(jQuery);
/*!
 * Backbone.Marionette.Courier, v0.5.7
 * Copyright (c)2013 Rotunda Software, LLC.
 * Distributed under MIT license
 * http://github.com/rotundasoftware/backbone.marionette.courier
*/
(function( Backbone, _ ) {
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var lastPossibleViewElement = _.isFunction( $ ) ? $( "body" )[0] : null;

	Backbone.Courier = {};

	Backbone.Courier.add = function( view ) {
		var overriddenViewMethods = {
			delegateEvents : view.delegateEvents,
			setElement : view.setElement
		};

		// ****************** Public Courier functions ****************** 

		view.spawn = function( message, data ) {
			// can be called with message argument as an object, in which case message.name is required,
			// or can be called with message as a string that represents the name of the message and
			// data object which will be added to message object at message.data
			if( _.isString( message ) )
				message = {
					name : message,
					data : _.extend( {}, data )
				};
			else if( _.isUndefined( message.name ) ) throw new Error( "Undefined message name." );

			message.source = view;
			message.data = message.data || {};

			var roundTripMessage = message.name[ message.name.length - 1 ] === "!";

			var curParent = this._getParentView();
			var messageShouldBePassed;
			var value;

			while( curParent )
			{
				// check to see if curParent has an action to perform when this message is received.
				if( _.isObject( curParent.onMessages ) )
				{
					value = getValueOfBestMatchingHashEntry( curParent.onMessages, message, curParent );
					if( value !== null )
					{
						var method = value;
						if( ! _.isFunction( method ) ) method = curParent[ value ];
						if( ! method ) throw new Error( "Method \"" + value + "\" does not exist" );

						var returnValue = method.call( curParent, message );
						if( roundTripMessage ) return returnValue;
					}
				}

				messageShouldBePassed = false;

				// check to see if this message should be passed up a level
				if( _.isObject( curParent.passMessages ) )
				{
					value = getValueOfBestMatchingHashEntry( curParent.passMessages, message, curParent );
					if( value !== null )
					{
						if( value === "." )
							; // noop - pass this message through exactly as-is
						else if( _.isString( value ) )
							message.name = value;
						else if( _.isFunction( value ) )
						{
							var oldMessageData = message.data;
							message.data = {};
							value.call( curParent, message, oldMessageData );
						}
						else throw new TypeError();

						messageShouldBePassed = true;
					}
				}

				if( roundTripMessage ) messageShouldBePassed = true; // round trip messages are passed up even if there is not an entry in the passMessages hash

				if( ! messageShouldBePassed ) break; // if this message should not be passed, then we are done

				message.source = curParent;
				curParent = curParent._getParentView();
			}

			if( roundTripMessage )
				throw new Error( "Round trip message \"" + message.name + "\" was not handled. All round trip messages must be handled." );
		};

		// supply your own _getParentView function on your view objects
		// if you would like to use custom means to determine a view's
		// "parent". The default means is to traverse the DOM tree and return
		// the closest parent element that has a view object attached in el.data( "view" )
		if( ! _.isFunction( view._getParentView ) )
			view._getParentView = function() {
				var parent = null;
				var curElement = this.$el.parent();
				while( curElement.length > 0 && curElement[0] !== lastPossibleViewElement )
				{
					var view = curElement.data( "view" );
					if( view && view instanceof Backbone.View )
					{
						parent = view;
						break;
					}

					curElement = curElement.parent();
				}

				return parent;
			};

		// supply your own _getChildViewNamed function on your view objects
		// if you would like to use another means to test the source of your
		// messages (used for keys of onMessages and passMessages of the form
		// { "message source" : handler }). By default, child views are looked
		// up by name in view.subviews[ childViewName ] (and then tested against message.source)
		if( ! _.isFunction( view._getChildViewNamed ) )
			view._getChildViewNamed = function( childViewName ) {
				if( ! _.isObject( this.subviews ) ) return null;
				return this.subviews[ childViewName ];
			};

		// ****************** Overridden Backbone.View functions ****************** 

		view.delegateEvents = function( events ) {
			var _this = this;

			if( _.isFunction( this.events ) ) this.events = this.events.call( this.events );
			events = events || _.clone( this.events ) || {};

			events = expandUIBindingsInEventsHashKeys.call( this, events );

			// Allow `spawnMessages` to be configured as a function
			var spawnMessages = _.result( this, "spawnMessages" ) || {};
			spawnMessages = expandUIBindingsInEventsHashKeys.call(this, spawnMessages );

			// Create functions for auto-spawning of messages from spawnMessages,
			// prevent default action and stop propagation of DOM events
			_.each( spawnMessages, function( value, key ) {
				var match = key.match( delegateEventSplitter );
				var eventName = match[ 1 ], uiElName = match[ 2 ];

				var doSpawnFunction = function( e ) {
					if( e && e.preventDefault ){ e.preventDefault(); }
					if( e && e.stopPropagation ){ e.stopPropagation(); }

					var message;
					if( _.isFunction( value ) )
					{
						message = { name : eventName, data : {}, source : _this };
						value.call( this, message, e );
					}
					else if( _.isString( value ) )
						message = value;
					else throw new TypeError();

					this.spawn( message );
				};

				if( ! events[ key ] )
					events[ key ] = doSpawnFunction;
				else
				{
					var existingMethod = events[ key ];
					if( ! _.isFunction( existingMethod ) ) existingMethod = _this[ events[ key ] ];
					if( ! existingMethod ) throw new Error( "Method \"" + events[key] + "\" does not exist" );

					events[ key ] = function() {
						// pass on arguments (event obj) supplied by DOM library
						existingMethod.apply( this, arguments );
						doSpawnFunction.apply( this, arguments );
					};
				}
			} );

			overriddenViewMethods.delegateEvents.call( this, events );
		};

		view.setElement = function(element, delegate) {
			overriddenViewMethods.setElement.call( this, element, delegate );
			setupLinkFromViewsElementToView( view );
		},

		// ****************** Body of Backbone.Courier.add() function ****************** 

		setupLinkFromViewsElementToView( view );
		view.delegateEvents();

		// ****************** Private Utility Functions ****************** 

		function setupLinkFromViewsElementToView( view ) {
			// store a reference to the view object in the DOM element's jQuery data. Make sure it is supported.
			if( _.isFunction( view.$el.data ) && ! view.$el.data( "view" ) ) view.$el.data( "view", view );
		}

		function expandUIBindingsInEventsHashKeys( hash ) {
			// Returns a copy of hash with any "aliases" for DOM element selectors found
			// in the keys of the hash expanded to their selector equivalents. The aliases
			// are setup from the Backbone.Marionette UI hash.

			var uiBindings = this.uiBindings || _.result( this, "ui" );
			if( ! uiBindings ) return hash;

			var newHash = {};
			_.each( hash, function( value, key ) {
				var match = key.match( delegateEventSplitter );
				var eventName = match[ 1 ], uiElName = match[ 2 ];

				if( uiElName !== "" && ! _.isUndefined( uiBindings[ uiElName ] ) ) {
					var selector = uiBindings[uiElName];
					key = eventName + " " + selector;
				}

				newHash[ key ] = value;
			} );

			return newHash;
		}

		function getValueOfBestMatchingHashEntry( hash, message, view ) {
			// return the value of the entry in a onMessages or passMessages hash that is the 
			// "most specific" match for this message, or null, of there are no matches.

			var matchingEntries = [];

			for( var key in hash )
			{
				// We are looking for kyes in the hash that have `message` 
				// as the first word of their key. If we find one, they either need
				// no source qualifier as the second word of the key (in which case
				// we will pass this message regardless of where it comes from),
				// or we need this the name of the subview that is the source of the
				// message second word of the key.

				var match = key.match(delegateEventSplitter);

				var eventName = match[1], subviewName = match[2];
				var eventNameRegEx = new RegExp( eventName.replace( "*", "[\\w]*" ) );
				if( ! eventNameRegEx.test( message.name ) ) continue;

				if( subviewName !== "" && view._getChildViewNamed( subviewName ) !== message.source ) continue;

				matchingEntries.push( { eventName : eventName, subviewName : subviewName, value : hash[ key ] } );
			}

			// if more than one hash keys match, order them by specificity, that is,
			// in descending order of how many non-wild card characters they contain,
			// so that entry with most specificity is at index 0. Also consider any
			// entries that have subview qualifier more specific than those that do not.
			if( matchingEntries.length > 1 )
				matchingEntries = _.sortBy( matchingEntries, function( thisEntry ) {
					var nonWildcardCharactersInEventName = thisEntry.eventName.replace( "*", "" );
					var hasSubviewQualifier = subviewName !== "";

					// promote all entries with subview qualifiers to a higher level of specificity.
					// Figure there will never, ever be a 1000 character long event name
					var specificity = (hasSubviewQualifier ? 1000 : 0) + nonWildcardCharactersInEventName.length;

					// negate to sort in descending order
					return (- specificity);
				} );

			return matchingEntries.length ? matchingEntries[0].value : null;
		}
	};
})( Backbone, _ );

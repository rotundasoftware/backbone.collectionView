(function(){
	var mDefaultModelViewConstructor = Backbone.View;

	Backbone.CollectionView = Backbone.View.extend({
		/* Contructor should be passed options hash with following keys. All keys are optional unless otherwise noted
		 * el (required) : An "ul" or "table" element that will serve as the dom element that contains this list
		 * modelView : A view constructor that will be used to render the models within this collection.
		 * renderFunction : Can be used to override the default render() function, in the case that you want to render the collection view yourself, for example to optimize efficiency for large collections. You should rarely need to use this option.
		 * collection : The collection of models that will serve as the content for this list
		 * referenceModelsByCid : If true (default), models will be references by their "cid" (client side id) attribute, instead of their "id" attribute.
		 * selectable : True if model views within the collection should be selectable. In this case the "selected" class will be automatically added to selected models. Default true
		 * clickToSelect : True if mouse clicks should select models as would be appropriate in standard HTML mutli-select element. Only applies to selectable collection lists. Default to true.
		 * selectableModelsFilter : in the case that selectable is true, this can be used to determine which items are selectable and which items are not. value should be a function that is passed a single parmeter which is the model in question. for example function( thisModel ){ return thisModel.get( "isSelectable" ); }.
		 * clickToToggle : True if clicking any item in a list with selectMultiple = true should toggle its selected / unselected state. Default is false. Only applies to lists with selectMultiple = true
		 * processKeyEvents : True iff the collection view should respond to arrow key events intuitively as if the collection list was a SELECT box. Note this option has no effect if selectable is false.
		 * sortable : Determines whether or not list items can be rearranged by dragging and dropping. Defaults to false.
		 * sortableModelsFilter : in the case that sortable is true, this can be used to determine which items are sortable and which items are not. value should be a function that is passed a single parmeter which is the model in question. for example function( thisModel ){ return thisModel.get( "isSortable" ); }.
		 * // allowedMessages : A allowedMessages array as expected by Backbone.Courier
		 *
		 * EVENTS FIRED
		 * selectionChanged( newSelectedItems, oldSelectedItems ) - Fired whenever the selection is chaged, either by the user or by a manual call to setSelectedItems
		 * updateDependentControls( selectedItems ) - Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after selectionChanged is fired. In addition, it is fired after rendering (even if the selection has not changed since the last render) and sorting.
		 * doubleClick( clickedItemId, theEvent ) - Fired when a model view is double clicked. clickedItemId is either the cid or id of the model, depending on if referenceModelsByCidreferenceModelsByCid is true or false respectively
		 * sortStart - Fired just as a model view is starting to be dragged (sortable collection lists only)
		 * sortStop - Fired when a drag of a model view is finished, but before the models have been reordered within the collection (sortable collection lists only)
		 * reorder - Fired after a drag of a model view is finished and after the models have been reordered within the collection (sortable collection lists only)
		 */

		tagName : "ul",
		// className : "collection-list", we add this class manually so we can spawn in className when extending class
		
		events : {
			"click li, td" : "_listItem_onClick",
			"dblclick li, td" : "_listItem_onDoubleClick",
			"click" : "_listBackground_onClick",
			"click ul.collection-list, table.collection-list" : "_listBackground_onClick",
			"keydown" : "_onKeydown"
		},

		//only used if Backbone.Courier is available
		spawnMessages : {
			"focus" : "focus"
		},
		
		//only used if Backbone.Courier is available
		passMessages : { "*" : "." },

		initialize : function( options ){
			var _this = this;
			
			if( _.isUndefined( options.collection ) ) options.collection = new Backbone.Collection();
			if( _.isUndefined( options.referenceModelsByCid ) ) options.referenceModelsByCid = true; // determines whether we use id or cid for referencing selected models
			if( _.isUndefined( options.modelView ) ) options.modelView = null;
			if( _.isUndefined( options.modelViewOptions ) ) options.modelViewOptions = {};
			if( _.isUndefined( options.itemTemplate ) ) options.itemTemplate = null;
			if( _.isUndefined( options.renderFunction ) ) options.renderFunction = null;
			if( _.isUndefined( options.selectable ) ) options.selectable = true;
			if( _.isUndefined( options.clickToSelect ) ) options.clickToSelect = true;
			if( _.isUndefined( options.selectableItemsFilter ) ) options.selectableItemsFilter = true;
			if( _.isUndefined( options.selectMultiple ) ) options.selectMultiple = false;
			if( _.isUndefined( options.clickToToggle ) ) options.clickToToggle = false;
			if( _.isUndefined( options.processKeyEvents ) ) options.processKeyEvents = true;
			if( _.isUndefined( options.sortable ) ) options.sortable = false;
			if( _.isUndefined( options.sortableModelsFilter ) ) options.sortableModelsFilter = null;
			//if( _.isUndefined( options.allowedMessages ) ) options.allowedMessages = [];

			this.collection = options.collection;
			this.referenceModelsByCid = options.referenceModelsByCid;
			this.modelView = options.modelView || this.modelView;
			this.modelViewOptions = options.modelViewOptions;
			this.itemTemplate = options.itemTemplate;
			this.selectable = options.selectable;
			this.clickToSelect = options.clickToSelect;
			this.selectableModelsFilter = options.selectableModelsFilter;
			this.selectMultiple = options.selectMultiple;
			this.clickToToggle = options.clickToToggle;
			this.processKeyEvents = options.processKeyEvents;
			this.sortable = options.sortable;
			this.sortableModelsFilter = options.sortableModelsFilter;
			this.visibleModelsFilter = options.visibleModelsFilter;
			this.emptyListDescriptionUpdateStateCallback = options.emptyListDescriptionUpdateStateCallback;
			//this.allowedMessages = _.union( _.result( this, "allowedMessages" ), options.allowedMessages );

			//If rendering a table, make sure that $el of modelView is a tr
			if( _this._isRenderedAsTable() ) {
					//need to make sure the el of the modelView is a tr.  is there a better way of doing this than creating an instance?
					if( this.modelView ) {
						var view = new options.modelView();
						if( view.$el.prop("tagName").toLowerCase() !== 'tr' ) {
							throw "If creating a CollectionView with a 'table' $el, modelView needs to have a 'tr' $el";
						}
					}
			}
			
			if( options.renderFunction !== null )
				this.render = function() {
					options.renderFunction.apply( _this.bindCallbacksTo ? _this.bindCallbacksTo : _this, arguments );
				};
			
			delete this.options;

			if(this._isBackboneCourierAvailable()) {
    		Backbone.Courier.add( this );
			}

			// because this class is designed to be an base class for derived collection list view classes, which
			// may include buttons or other controls besides just the list itself, we can not be sure that "el"
			// will refer to the list element itself. To eliminate confusion, we do NOT use $el ANYWHERE in this
			// view, but instead create a "listEl" property of this view that points to the actual unordered
			// list element that we are using for the list itself.
			if( this.$el.is( "ul, table" ) )
				this.listEl = this.$el;
			else
				this.listEl = this.$el.find( "ul, table" ).assertOne();
			
			this.listEl.addClass( "collection-list" );
			if( this.processKeyEvents )
				this.listEl.attr( "tabindex", 0 ); // so we get keyboard events
			
			if( this.listEl.next().is( "div.empty-list-description" ) && ! _.isUndefined( Rotunda.Views.EmptyListDescription ) )
				this.emptyListDescriptionView = new Rotunda.Views.EmptyListDescription( {
					el : this.listEl.next(),
					collectionListView : this,
					udpateStateCallback : this.emptyListDescriptionUpdateStateCallback
				} );
			
			this.selectedItems = [];

			var itemTemplateHtml;
			if( this.itemTemplate )
			{
				if( $( this.itemTemplate ).length == 0 ) throw "Could not find item template from selector: " + this.itemTemplate;

				itemTemplateHtml = $( this.itemTemplate ).html();
			}
			else
				itemTemplateHtml = this.$( ".item-template" ).html();

			if( itemTemplateHtml ) this.itemTemplateFunction = _.template( itemTemplateHtml );

			if( _.isString( this.bubbleEvents ) ) this.bubbleEvents = this.bubbleEvents.split( " " );

			_.bindAll( this );
			
			// spawn these events in case parent views need to rerender or take other action after we are done rendering
			this.listenTo( this.collection, "add", function() { 
				this.render();
				if( this._isBackboneCourierAvailable() )
					this.spawn( "add" );
			} );

			this.listenTo( this.collection, "remove", function() {
				this.validateSelectionAndRender();
				if( this._isBackboneCourierAvailable() )
					this.spawn( "remove" );
			} );

			this.listenTo( this.collection, "reset", function() {
				this.validateSelectionAndRender();
				if( this._isBackboneCourierAvailable() )
					this.spawn( "reset" );
			} );
			//this.listenTo( this.collection, "change", function() { this.render(); this.spawn( "change" ); } ); // don't want changes to models bubbling up and triggering the list's render() function

			// note we do NOT call render here anymore, because if we inherit from this class we will likely call this
			// function using __super__ before the rest of the initialization logic for the decendent class. however, we may
			// override the render() function in that decendent class as well, and that will certainly expect all the initialization
			// to be done already. so we have to make sure to not jump the gun and start rending at this point.
			// this.render();
		},
		
		setCollection : function( newCollection ) {
			if( newCollection !== this.collection )
			{
				this.collection = newCollection;

				this.collection.bind( "add", this.render, this );
				this.collection.bind( "remove", this.validateSelectionAndRender, this );
				this.collection.bind( "reset", this.validateSelectionAndRender, this );
				//this.collection.bind( "change", this.render, this ); //don't want changes to models bubbling up to force re-render of entire list
			}
		
			this.render();
		},
		
		getCollection : function() {
			return this.collection;
		},
		
		getListElement : function() {
			return this.listEl;
		},

		getModelViewsByReferenceId : function() {
			return this.modelViewsByReferenceId;
		},
		
		getModelViewByReferenceId : function( modelReferenceId ) {
			return this.modelViewsByReferenceId[ modelReferenceId ];
		},

		getSelectedItem : function() {
			return this.selectedItems[0];
		},
		
		getSelectedItems : function() {
			return this.selectedItems;
		},

		isItemSelected : function( itemId ) {
			if( _.isUndefined( itemId ) ) return this.selectedItems.length > 0;

			return _.contains( this.selectedItems, itemId );
		},
		
		getSelectedModel : function() {
			// returns undefined if no model is selected
			return this._getModelByReferenceId( this.getSelectedItem() );
		},
		
		getSelectedModels : function() {
			return _.map( this.getSelectedItems(), function( thisItemId ) {
				return this._getModelByReferenceId( thisItemId );
			}, this );
		},
		
		getSelectedModelView : function() {
			return _.first( this.getSelectedModelViews() );
		},
		
		getSelectedModelViews : function() {
			// return an array that contains all selected model views. if no
			// model view is selected an empty array (NOT null!) is returned.

			var viewsArray = [];
			
			_.each( this.selectedItems, function( thisItemId ) {
				viewsArray.push( this.modelViewsByReferenceId[ thisItemId ] );
			}, this );
			
			return viewsArray;
		},
		
		getSelectedModelViewElement : function() {
			// return jquery object that contains the first selected model view elements. if no
			// model view is selected an empty jquery object (NOT null!) is returned.
			return this.getSelectedModelViewElements().first();
		},
		
		getSelectedModelViewElements : function() {
			// return jquery object that contains all selected model views elements. if no
			// model view is selected an empty jquery object (NOT null!) is returned.

			var viewEls = $();
			
			_.each( this.selectedItems, function( thisItemId ) {
				viewEls = viewEls.add( this.listEl.find( "[data-item-id=" + thisItemId + "]" ) );
			}, this );
			
			return viewEls;
		},
		
		getSelectedLines : function() {
			// return the indexes of the selected items, 1 based, but only counting the
			// visible items. So if we have an collection where item 1,2 and 4 are selected
			// but only item 2 is visible, getSelectedLines would return [1]. Very useful
			// for maintaining the selection of a list when the contents of the list changes,
			// especially when an item is deleted. in this case, the desired behavor is
			// usually to select the next line in the list. However this is non-trivial to
			// calculate, because some lines may be hidden.
			
			var selectedLines = [];
			
			var curLineNumber = 1;
			this.listEl.find( "> [data-item-id]:visible" ).each( function() {
				var thisItemEl = $( this );
				if( thisItemEl.is( ".selected" ) )
					selectedLines.push( curLineNumber );
				
				curLineNumber++;
			} );
			
			return selectedLines;
		},

		getSelectedLine : function() {
			return _.first( this.getSelectedLines() );
		},
		
		setSelectedItems : function( newSelectedItems, options ) {
			if( ! this.selectable ) throw "Attempt to set selected items on non-selectable list";
			if( ! _.isArray( newSelectedItems ) ) throw "Invalid parameter value";

			options = _.extend( {}, {
				silent : true
			}, options );
			
			var oldSelectedItems = _.clone( this.selectedItems );
			this.selectedItems = this._convertStringsToInts( newSelectedItems );
			this._validateSelection();
			
			if( ! this._containSameElements( this.selectedItems, oldSelectedItems ) )
			{
				this._addSelectedClassToSelectedItems( oldSelectedItems );

				if( ! options.silent )
				{
					this.trigger( "selectionChanged", this.selectedItems, oldSelectedItems );
					if( this._isBackboneCourierAvailable() ) {
						this.spawn( "selectionChanged", {
							selectedItems : this.selectedItems,
							oldSelectedItems : oldSelectedItems
						} );
					}
				}

				this.updateDependentControls();

			}

		},
		
		setSelectedItem : function( newSelectedItem, options ) {
			this.setSelectedItems( [ newSelectedItem ], options );
		},

		toggleItemSelected : function( itemId, trueOrFalse, options ) {
			if( _.isUndefined( trueOrFalse ) )
				// if trueOrFalse is not supplied then we toggle it to the state
				// that it is NOT right now.. that is, we unselect it if it is selected
				// or select it if it is not currently selected.
				trueOrFalse = ! this.isItemSelected( itemId );

			var newSelectedItems = _.clone( this.selectedItems );

			if( trueOrFalse )
				newSelectedItems = _.union( newSelectedItems, itemId );
			else
				newSelectedItems = _.without( newSelectedItems, itemId );

			this.setSelectedItems( newSelectedItems, options );
		},
		
		setSelectedModel : function( theModel, options ) {
			if( ! theModel ) this.selectNone();
			else this.setSelectedItem( this._getModelReferenceId( theModel ), options );
		},
		
		setSelectedModels : function( theModels, options ) {
			if( ! _.isArray( theModels ) ) throw "Invalid parameter value";

			var selectedItems = _.map( theModels, function( thisModel ) {
				return this._getModelReferenceId( thisModel );
			}, this );
			
			this.setSelectedItems( selectedItems, options );
		},
		
		setSelectedLines : function( selectedLines, options ) {
			// see geSelectedLines for an explanation of what selected lines means.
			// selectedLines here is an array of selected lines.
			if( ! _.isArray( selectedLines ) ) throw "Invalid parameter value";
			
			var curLineNumber = 1;
			var selectedItems = [];
			this.listEl.find( "> [data-item-id]:visible" ).each( function() {
				var thisItemEl = $( this );
				if( _.contains( selectedLines, curLineNumber ) )
					selectedItems.push( thisItemEl.attr( "data-item-id" ) );
				
				curLineNumber++;
			} );
			
			this.setSelectedItems( selectedItems, options );
		},

		setSelectedLine : function( selectedLine, autoContrainToList, options ) {
			if( _.isUndefined( autoContrainToList ) ) autoContrainToList = true;
			
			if( autoContrainToList )
			{
				if( selectedLine < 1 ) selectedLine = 1;
				else
				{
					var lineCount = this.listEl.find( "[data-item-id]:visible" ).length;
					if( selectedLine > lineCount ) selectedLine = lineCount;
				}
			}
			
			this.setSelectedLines( [ selectedLine ], options );
		},
		
		selectNone : function( options ) {
			this.setSelectedItems( [], options );
		},
		
		saveSelection : function() {
			// save the current selection. use restoreSelection() to restore the selection to the state it was in the last time saveSelection() was called.
			
			if( ! this.selectable ) throw "Attempt to save selection on non-selectable list";
			
			this.savedSelection = {
				items : this.selectedItems,
				lines : this.getSelectedLines()
			};
		},
		
		restoreSelection : function() {
			if( ! this.savedSelection ) throw "Attempt to restore selection but no selection has been saved!";
			
			// reset selectedItems to empty so that we "redraw" all "selected" classes
			// when we set our new selection. We do this because it is likely that our
			// contents have been refreshed, and we have thus lost all old "selected" classes.
			this.setSelectedItems( [] );
			
			if( this.savedSelection.items.length > 0 )
			{
				// first try to restore the old selected items using their reference ids.
				this.setSelectedItems( this.savedSelection.items );

				// all the items with the saved reference ids have been removed from the list.
				// ok. try to restore the selection based on the lines that used to be selected.
				// this is the expected behavior after a item is deleted from a list (i.e. select
				// the line that immediately follows the deleted line).
				if( this.selectedItems.length === 0 )
					this.setSelectedLines( this.savedSelection.lines );
			}
			
			delete this.savedSelection;
		},

		render : function(){
			var _this = this;

			if( this.selectable ) this.saveSelection();
			
			this.modelViewsByReferenceId = {};

			if( this.itemTemplateFunction != null )
			{
				var listHtml = "";
				this.collection.each( function( thisModel ) {
					listHtml += _this.itemTemplateFunction( thisModel.toJSON() );
				} );

				this.listEl.html( listHtml );

				var listItemEls = this.listEl.children( "li, tr" );
				var curElNum = 0;
				this.collection.each( function( thisModel ){
					var thisModelReferenceId = this._getModelReferenceId( thisModel );
					var thisListItemEl = $( listItemEls[ curElNum ] );
					thisListItemEl.attr( "data-item-id", thisModelReferenceId );
					var thisModelView = new (mDefaultModelViewConstructor)( { el : thisListItemEl } );
					thisModelView.model = thisModel;
					_this.modelViewsByReferenceId[ thisModelReferenceId ] = thisModelView;
					curElNum++;
				}, this );
			}
			else
			{
				this.listEl.empty();
				
				this.collection.each( function( thisModel ) {
					var thisModelViewConstructor = this._getModelViewConstructor( thisModel );

					if( _.isUndefined( thisModelViewConstructor ) )
						throw "Could not find modelView for model";

					var modelViewOptions = this._getModelViewOptions( thisModel );
					var thisModelView = new (thisModelViewConstructor)( modelViewOptions );

					thisModelView.collectionListView = _this;
					thisModelView.model = thisModel;

							
					var thisModelReferenceId = this._getModelReferenceId( thisModel );
					if( _.isUndefined( thisModelReferenceId ) ) throw "Model has no reference id";
					
					// we use items client ids as opposed to real ids, since we may not have a representation
					// of these models on the server
					var thisModelViewWrapped;// = thisModelView.$el.wrapAll( "<li data-item-id='" + thisModelReferenceId + "'></li>" ).parent();


					//If we are rendering the collection in a table, the template $el is a tr so we just need to set the data-item-id
					if( this._isRenderedAsTable() ) {
						thisModelViewWrapped = thisModelView.$el.attr('data-item-id',thisModelReferenceId);

					}
					//If we are rendering the collection in a list, we need wrap each item in an <li></li> and set the data-item-id
					else if( this._isRenderedAsList() ) {
						thisModelViewWrapped = thisModelView.$el.wrapAll( "<li data-item-id='" + thisModelReferenceId + "'></li>" ).parent();
					}

					thisModelView.modelViewEl = thisModelViewWrapped;


					//if( thisModel === this.collection.first() ) thisModelViewWrapped.addClass( "first" );
					//else if( thisModel === this.collection.last() ) thisModelViewWrapped.addClass( "last" );
					
					if( _.isFunction( this.sortableModelsFilter ) )
						if( this.sortableModelsFilter.call( _this, thisModel ) )
							thisModelViewWrapped.addClass( "sortable" );

					// if( this.bubbleEvents )
					// 	_.each( this.bubbleEvents, function( thisEvent ) {
					// 		_this.listenTo( thisModelView, thisEvent, function() {
					// 			var args = Array.prototype.slice.call( arguments );

					// 			if( _.isObject( args[0] ) && args[0]._isTriggerObject ) args.shift();

					// 			args.unshift( {
					// 				_isTriggerObject : true,
					// 				view : thisModelView,
					// 				model : thisModelView.model,
					// 				collection : _this.collection
					// 			} );

					// 			args.unshift( thisEvent );
					// 			_this.trigger.apply( _this, args );
					// 		} );
					// 	} );

					this.listEl.append( thisModelViewWrapped );
					
					// we have to render the modelView after it has been put in context, as opposed to in the 
					// initialize function of the modelView, because some rendering might be dependent on
					// the modelView's context in the DOM tree. For example, if the modelView stretch()'s itself,
					// it must be in full context in the DOM tree or else the stretch will not behave as intended.
					var renderResult = thisModelView.render(); 
					
					// return false from the view's render function to hide this item
					if( renderResult === false )
						thisModelViewWrapped.hide();

					if( _.isFunction(this.visibleModelsFilter) ) {
						if( !this.visibleModelsFilter(thisModel) ) {
							thisModelViewWrapped.hide();
						}
					}

					this.modelViewsByReferenceId[ thisModelReferenceId ] = thisModelView;
				}, this );
			}
			
			if( this.sortable )
			{
				var sortableOptions = _.extend( {
					axis: "y",
					distance: 10,
					forcePlaceholderSize : true,
					start : this._sortStart,
					change : this._sortChange,
					stop : this._sortStop
				}, _.result( this, "sortableOptions" ) );

				if( this.sortableModelsFilter === null ) {
					if( _this._isRenderedAsTable() ) {
						sortableOptions.items = "> tbody > *";
					}
					else if( _this._isRenderedAsList() ) {
						sortableOptions.items = "> *";
					}
				}
				else if( _.isString( this.sortableModelsFilter ) ) {
					sortableOptions.items = this.sortableModelsFilter;
				}
				else if( _.isFunction( this.sortableModelsFilter ) ) {
					//sortableOptions.items = "> li.sortable";
					//sortableOptions.items = "> li.sortable";
					if( _this._isRenderedAsTable() ) {
						sortableOptions.items = "> tbody > tr.sortable";
					}
					else if( _this._isRenderedAsList() ) {
						sortableOptions.items = "> li.sortable";
					}
				}

				this.listEl = this.listEl.sortable( sortableOptions );
			}
			
			this.trigger( "render" );
			if( this._isBackboneCourierAvailable() ) 
				this.spawn( "render" );

			if( this.selectable )
			{
				this.restoreSelection();
				this.updateDependentControls();
			}

			if( _.isFunction( this.onAfterRender ) )
				this.onAfterRender();
		},

		validateSelectionAndRender : function() {
			this._validateSelection();
			this.render();
		},
		
		triggerAllModelViews : function( eventName ) {
			// trigger eventName for all modelViews
			_.each( this.modelViewsByReferenceId, function( thisModelView ) {
				thisModelView.trigger.apply( thisModelView, arguments );
			} );
		},
		
		getEmptyListDescriptionView : function() {
			return this.emptyListDescriptionView;
		},
		
		updateDependentControls : function() {
			this.trigger( "updateDependentControls", this.selectedItems );
			if( this._isBackboneCourierAvailable() ) {
				this.spawn( "updateDependentControls", {
					selectedItems : this.selectedItems
				} );
			}
		},

		// unrender : function() {
		// 	this.off( "sortStart sortChange sortStop" );

		// 	if( this.sortable )
		// 	{
		// 		if( this.listEl.data( "ui-sortable" ) )
		// 			this.listEl.sortable( "destroy" );
		// 	}

		// 	_.each( this.modelViewsByReferenceId, function( thisModelView ) {
		// 		if( _.isFunction( thisModelView.close ) )
		// 			thisModelView.close();
		// 		else thisModelView.remove();
		// 	} );
		// },

		_getModelReferenceId : function( theModel ) {
			if( this.referenceModelsByCid ) return theModel.cid;
			else return theModel.id;
		},
		
		_getModelByReferenceId : function( referenceId ) {
			return this.collection.get( referenceId );
		},
		
		_getClickedItemId : function( theEvent ) {
			var clickedItemId = null;
			
			// important to use currentTarget as opposed to target, since we could be bubbling
			// an event that took place within another collectionList
			var clickedItemEl = $( theEvent.currentTarget );
			if( clickedItemEl.closest( ".collection-list" ).get(0) !== this.listEl.get(0) ) return;

			// determine which list item was clicked. If we clicked in the blank area
			// underneath all the elements, we want to know that too, since in this
			// case we will want to deselect all elements. so check to see if the clicked
			// DOM element is the list itself to find that out.
			var clickedItem = clickedItemEl.closest( "[data-item-id]" );
			if( clickedItem.length > 0 )
			{
				clickedItemId = clickedItem.attr('data-item-id');
				if( $.isNumeric( clickedItemId ) ) clickedItemId = parseInt( clickedItemId, 10 );
			}
			
			return clickedItemId;
		},

		_validateSelection : function() {
			// note can't use the collection's proxy to underscore because "cid" and "id" are not attributes,
			// but elements of the model object itself.
			var modelReferenceIds = this.referenceModelsByCid
				? _.pluck( this.collection.models, "cid" )
				: _.pluck( this.collection.models, "id" );
				
			this.selectedItems = _.intersection( modelReferenceIds, this.selectedItems );

			if( _.isFunction( this.selectableModelsFilter ) )
			{
				this.selectedItems = _.filter( this.selectedItems, function( thisItemId ) {
					return this.selectableModelsFilter.call( this, this._getModelByReferenceId( thisItemId ) );
				}, this );
			}
		},
		
		_addSelectedClassToSelectedItems : function( oldItemsIdsWithSelectedClass ) {
			if( _.isUndefined( oldItemsIdsWithSelectedClass ) ) oldItemsIdsWithSelectedClass = [];
			
			// oldItemsIdsWithSelectedClass is used for optimization purposes only. If this info is supplied then we
			// only have to add / remove the "selected" class from those items that "selected" state has changed.
			
			var itemsIdsFromWhichSelectedClassNeedsToBeRemoved = oldItemsIdsWithSelectedClass;
			itemsIdsFromWhichSelectedClassNeedsToBeRemoved = _.without( itemsIdsFromWhichSelectedClassNeedsToBeRemoved, this.selectedItems );

			_.each( itemsIdsFromWhichSelectedClassNeedsToBeRemoved, function( thisItemId ) {
				this.listEl.find( "[data-item-id=" + thisItemId + "]" ).removeClass( "selected" );
			}, this );
			
			var itemsIdsFromWhichSelectedClassNeedsToBeAdded = this.selectedItems;
			itemsIdsFromWhichSelectedClassNeedsToBeAdded = _.without( itemsIdsFromWhichSelectedClassNeedsToBeAdded, oldItemsIdsWithSelectedClass );

			_.each( itemsIdsFromWhichSelectedClassNeedsToBeAdded, function( thisItemId ) {
				this.listEl.find( "[data-item-id=" + thisItemId + "]" ).addClass( "selected" );
			}, this );
		},
		
		_reorderCollectionBasedOnHTML : function() {
			//var curOrder = 0;
			var _this = this;
			
			this.listEl.children().each( function() {
				var thisModelId = $( this ).attr( "data-item-id" );
				
				if( thisModelId )
				{
					// remove the current model and then add it back (at the end of the collection).
					// When we are done looping through all models, they will be in the correct order.
					var thisModel = _this._getModelByReferenceId( thisModelId );
					if( thisModel )
					{
						_this.collection.remove( thisModel, { silent : true } );
						_this.collection.add( thisModel, { silent : true } );
					}
				}
			} );
			
			this.collection.trigger( "reorder" );
		},

		_getModelViewConstructor : function( thisModel ) {
			return this.modelView || mDefaultModelViewConstructor;
		},

		_getModelViewOptions : function( thisModel ) {
			return _.extend( { model : thisModel }, this.modelViewOptions );
		},

		_sortStart : function( event, ui ) {
			var modelBeingSorted = this.collection.get( ui.item.attr( "data-item-id" ) );
			this.trigger( "sortStart", modelBeingSorted );
			if( this._isBackboneCourierAvailable() )
				this.spawn( "sortStart", { modelBeingSorted : modelBeingSorted } );
		},

		_sortChange : function( event, ui ) {
			var modelBeingSorted = this.collection.get( ui.item.attr( "data-item-id" ) );
			this.trigger( "sortChange", modelBeingSorted );
			if( this._isBackboneCourierAvailable() )
				this.spawn( "sortChange", { modelBeingSorted : modelBeingSorted } );
		},

		_sortStop : function( event, ui ) {
			var modelBeingSorted = this.collection.get( ui.item.attr( "data-item-id" ) );
			var newIndex = this.listEl.children().index( ui.item );

			this._reorderCollectionBasedOnHTML();
			this.updateDependentControls();
			this.trigger( "sortStop", modelBeingSorted, newIndex );
			if( this._isBackboneCourierAvailable() )
				this.spawn( "sortStop", { modelBeingSorted : modelBeingSorted, newIndex : newIndex } );
		},
		
		_onKeydown : function( event ) {
			if( ! this.processKeyEvents ) return true;
			
			var trap = false;
			
			if( this.getSelectedLines().length == 1 )
			{
				// need to trap down and up arrows or else the browser
				// will end up scrolling a autoscroll div.
				
				if( event.which == this._charCodes.upArrow )
				{
					this.setSelectedLine( this.getSelectedLine() - 1 );
					trap = true;
				}
				else if( event.which == this._charCodes.downArrow )
				{
					this.setSelectedLine( this.getSelectedLine() + 1 );
					trap = true;
				}
			}
			
			return ! trap;
		},

		_listItem_onClick : function( theEvent ) {
			if( ! this.selectable || ! this.clickToSelect ) return;
			
			var clickedItemId = this._getClickedItemId( theEvent );

			if( clickedItemId )
			{
				// if this model is not selectable, then don't do anything!
				// if( _.isFunction( this.selectableModelsFilter ) )
				//	if( ! this.selectableModelsFilter.call( this, this._getModelByReferenceId( clickedItemId ) ) )
				//		return;
				// we now validate this in this_.validateSelection

				// a list item was clicked
				if( this.selectMultiple && theEvent.shiftKey )
				{
					var firstSelectedItemIndex = -1;
					
					if( this.selectedItems.length > 0 )
					{
						this.collection.find( function( thisItemModel ) {
							firstSelectedItemIndex++;
							
							// exit when we find our first selected element
							return _.contains( this.selectedItems, this._getModelReferenceId( thisItemModel ) );
						}, this );
					}
					
					var clickedItemIndex = -1;
					this.collection.find( function( thisItemModel ) {
						clickedItemIndex++;
						
						// exit when we find the clicked element
						return this._getModelReferenceId( thisItemModel ) == clickedItemId;
					}, this );
					
					var shiftKeyRootSelectedItemIndex = firstSelectedItemIndex == -1 ? clickedItemIndex : firstSelectedItemIndex;
					var minSelectedItemIndex = Math.min( clickedItemIndex, shiftKeyRootSelectedItemIndex );
					var maxSelectedItemIndex = Math.max( clickedItemIndex, shiftKeyRootSelectedItemIndex );
					
					var newSelectedItems = [];
					for( var thisIndex = minSelectedItemIndex; thisIndex <= maxSelectedItemIndex; thisIndex ++ )
						newSelectedItems.push( this._getModelReferenceId( this.collection.at( thisIndex ) ) );
					this.setSelectedItems( newSelectedItems, { silent : false } );
					
					// shift clicking will usually highlight selectable text, which we do not want.
					// this is a cross browser (hopefully) snippet that deselects all text selection.
					if( document.selection && document.selection.empty )
						document.selection.empty();
					else if(window.getSelection) {
						var sel = window.getSelection();
						if( sel && sel.removeAllRanges )
							sel.removeAllRanges();
					}
				}
				else if( this.selectMultiple && ( this.clickToToggle || theEvent.metaKey ) )
				{
					if( _.contains( this.selectedItems, clickedItemId ) )
						this.setSelectedItems( _.without( this.selectedItems, clickedItemId ), { silent : false } );
					else this.setSelectedItems( _.union( this.selectedItems, clickedItemId ), { silent : false } );
				}
				else
					this.setSelectedItems( [ clickedItemId ], { silent : false } );
			}
			else
				// the blank area of the list was clicked
				this.setSelectedItems( [], { silent : false } );

			if(this.sortable ) {
				this.listEl.focus();
			}

		},
		
		_listItem_onDoubleClick : function( theEvent ) {
			var clickedItemId = this._getClickedItemId( theEvent );
			
			if( clickedItemId )
			{
				this.trigger( "doubleClick", clickedItemId, theEvent );
				if( this._isBackboneCourierAvailable() )
					this.spawn( "doubleClick", { clickedItemId : clickedItemId } );
			}
		},
		
		_listBackground_onClick : function( theEvent ) {
			if( ! this.selectable ) return;
			if( ! $( theEvent.target ).is( ".collection-list" ) ) return;
			
			this.setSelectedItems( [], { silent : false } );
		},

  //added from underscore.mixins.js
  _convertStringsToInts : function( theArray ) { 
      return _.map( theArray, function( thisEl ) { 
        if( ! _.isString( thisEl ) ) return thisEl;
    
        var thisElAsNumber = parseInt( thisEl, 10 );
        return( thisElAsNumber == thisEl ? thisElAsNumber : thisEl );
      } );
    }, 

  //added from underscore.mixins.js
  _containSameElements : function( arrayA, arrayB ) { 
      if( arrayA.length != arrayB.length ) return false;
    
      var intersectionSize = _.intersection( arrayA, arrayB ).length;
      return intersectionSize == arrayA.length; // and must also equal arrayB.length, since arrayA.length == arrayB.length
    },

	_isRenderedAsTable : function() {
		return this.$el.prop('tagName').toLowerCase() === 'table';
	},

  
	_isRenderedAsList : function() {
		return !this._isRenderedAsTable();
		//this.$el.prop('tagName').toLowerCase() === 'ul';
	},

  _charCodes : { 
    upArrow : 38, 
    downArrow : 40
  },

	_isBackboneCourierAvailable : function() {
		return !_.isUndefined(Backbone.Courier);
	}//,
/*
	_setModelBasedVisibility : function() {
		if( _.isFunction(this.collectionListView.visibleModelsFilter) ) {
			if( this.collectionListView.visibleModelsFilter(this.model) ) {
				this.modelViewEl.show();
			}
			else {
				this.modelViewEl.hide();
			}
		}

	}*/

	}, {
		setDefaultModelViewConstructor : function( theConstructor )
		{
			mDefaultModelViewConstructor = theConstructor;
		}
	});
})();

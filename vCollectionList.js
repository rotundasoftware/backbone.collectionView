Rotunda.Views.CollectionList = Backbone.View.extend({
	// By David Beck.

	/* Contructor should be passed options hash with following keys. All keys are optional unless otherwise noted
	 * el (required) : An "ul" or "table" element that will serve as the dom element that contains this list
	 * collection : The collection of models that will serve as the content for this list
	 * modelView : A view class that will be used to render the models within this collection. 
	 * renderFunction : Can be used to override the default render() function, in the case that you want to render the collection view yourself, for example to optimize efficiency for large collections. You should rarely need to use this option.
	 * referenceModelsByCid : If true (default), models will be references by their "cid" (client side id) attribute, instead of their "id" attribute.
	 * selectable : True if the collection view should behave as a selectable list. In this case the "selected" class will be automatically added to selected models.
	 * selectMultiple : True if the collection should support multiple selected models at one time. Defaults to false.
	 * processKeyEvents : True iff the collection view should respond to arrow key events intuitively as if the collection list was a SELECT box. Note this option has no effect if selectable is false.
	 * sortable : Determines whether or not list items can be rearranged by dragging and dropping. Defaults to false.
	 * sortableItemsSelector : a CSS-style selector that can be used to filter the items in the list that are sortable, in the case that sortable is true. Defaults to "> *", which means every item is sortable.
	 * 
	 * EVENTS FIRED
	 * selectionChanged( newSelectedItems, oldSelectedItems ) - Fired whenever the selection is chaged, either by the user or by a manual call to setSelectedItems
	 * updateDependentControls( selectedItems ) - Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after selectionChanged is fired. In addition, it is fired after rendering (even if the selection has not changed since the last render) and sorting.
	 * doubleClick( clickedItemId, theEvent ) - Fired when a model view is double clicked. clickedItemId is either the cid or id of the model, depending on if referenceModelsByCidreferenceModelsByCid is true or false respectively
	 * sortStart - Fired just as a model view is starting to be dragged (sortable collection lists only)
	 * sortStop - Fired when a drag of a model view is finished, but before the models have been reordered within the collection (sortable collection lists only)
	 * reorder - Fired after a drag of a model view is finished and after the models have been reordered within the collection (sortable collection lists only)
	 */
	
	events: {
		"click li, td" : "_listItem_onClick",
		"dblclick li, td" : "_listItem_onDoubleClick",
		"click" : "_listBackground_onClick",
		"click ul.collection-list, table.collection-list" : "_listBackground_onClick",
		"keydown" : "_onKeydown"
	}, 

	initialize : function( options ){
		var _this = this;
		
		if( _.isUndefined( options.el ) ) throw "Required parameter missing";
		if( _.isUndefined( options.collection ) ) options.collection = new Backbone.Collection();
		if( _.isUndefined( options.referenceModelsByCid ) ) options.referenceModelsByCid = true; // determines whether we use id or cid for referencing selected models
		if( _.isUndefined( options.modelView ) ) options.modelView = null;
		if( _.isUndefined( options.renderFunction ) ) options.renderFunction = null;
		if( _.isUndefined( options.selectable ) ) options.selectable = true;
		if( _.isUndefined( options.selectMultiple ) ) options.selectMultiple = false;
		if( _.isUndefined( options.processKeyEvents ) ) options.processKeyEvents = true;
		if( _.isUndefined( options.sortable ) ) options.sortable = false;
		if( _.isUndefined( options.sortableItemsSelector ) ) options.sortableItemsSelector = "> *";

		this.collection = options.collection;
		this.referenceModelsByCid = options.referenceModelsByCid;
		this.modelView = options.modelView;
		this.selectable = options.selectable;
		this.selectMultiple = options.selectMultiple;
		this.sortable = options.sortable;
		this.sortableItemsSelector = options.sortableItemsSelector;
		this.processKeyEvents = options.processKeyEvents;
		
		if( options.renderFunction != null )
			this.render = function() {
				options.renderFunction.apply( _this.bindCallbacksTo ? _this.bindCallbacksTo : _this, arguments );
			};
		
		// because this class is designed to be an base class for derived collection list view classes, which
		// may include buttons or other controls besides just the list itself, we can not be sure that "el"
		// will refer to the list element itself. To eliminate confusion, we do NOT use $el ANYWHERE in this
		// view, but instead create a "listEl" property of this view that points to the actual unordered
		// list element that we are using for the list itself.
		if( this.$el.is( "ul, table" ) )
			this.listEl = this.$el;
		else
			this.listEl = this.$el.find( "ul, table" );
		
		this.listEl.addClass( "collection-list" );
		if( this.processKeyEvents ) this.listEl.attr( "tabindex", 0 ); // so we get keyboard events
		
		this.selectedItems = [];
		this.itemTemplateHtml = this.$( ".item-template" ).html();
		
		_.bindAll();
		
		this.collection.bind( "add", this.render, this );
		this.collection.bind( "remove", this.render, this );
		//this.collection.bind( "change", this.render, this ); // don't want changes to models bubbling up and triggering the list's render() function
		
		// note we do NOT call render here anymore, because if we inherit from this class we will likely call this
		// function using __super__ before the rest of the initialization logic for the decendent class. however, we may
		// override the render() function in that class, and that will certainly expect all the initialization
		// to be done already. so we have to make sure to not jump the gun and start rending at this point.
		// this.render(); 
	},
	
	setCollection : function( newCollection ) {
		if( newCollection !== this.collection )
		{
			this.collection = newCollection;

			this.collection.bind( "add", this.render, this );
			this.collection.bind( "remove", this.render, this );
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
	
	getModelViewByReferenceId : function( modelReferenceId ) {
		return this.modelViewsByReferenceId[ modelReferenceId ];
	},

	getSelectedItem : function() {
		return this.selectedItems[0];
	},
	
	getSelectedItems : function() {
		return this.selectedItems;
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
		this.listEl.find( "[data-item-id]:visible" ).each( function() {
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
	
	setSelectedItems : function( newSelectedItems ) {
		if( ! this.selectable ) throw "Attempt to set selected items on non-selectable list";
		if( ! _.isArray( newSelectedItems ) ) throw "Invalid parameter value";
		
		var oldSelectedItems = _.clone( this.selectedItems );
		this.selectedItems = _.convertStringsToInts( newSelectedItems );
		this._validateSelection();
		
		if( ! _.containSameElements( this.selectedItems, oldSelectedItems ) )
			this._selectionChanged( oldSelectedItems );
	},
	
	setSelectedItem : function( newSelectedItem ) {
		this.setSelectedItems( [ newSelectedItem ] );
	},
	
	setSelectedModel : function( theModel ) {
		this.setSelectedItem( this._getModelReferenceId( theModel ) );
	},
	
	setSelectedModels : function( theModels ) {
		if( ! _.isArray( theModels ) ) throw "Invalid parameter value";

		var selectedItems = _.map( theModels, function( thisModel ) {
			return this._getModelReferenceId( thisModel );
		}, this );
		
		this.setSelectedItems( selectedItems );
	},
	
	setSelectedLines : function( selectedLines ) {
		// see geSelectedLines for an explanation of what selected lines means.
		// selectedLines here is an array of selected lines.
		if( ! _.isArray( selectedLines ) ) throw "Invalid parameter value";
		
		var curLineNumber = 1;
		var selectedItems = [];
		this.listEl.find( "[data-item-id]:visible" ).each( function() {
			var thisItemEl = $( this );
			if( _.contains( selectedLines, curLineNumber ) )
				selectedItems.push( thisItemEl.attr( "data-item-id" ) );
			
			curLineNumber++;
		} );
		
		this.setSelectedItems( selectedItems );
	},

	setSelectedLine : function( selectedLine, autoContrainToList ) {
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
		
		this.setSelectedLines( [ selectedLine ] );
	},
	
	selectNone : function() {
		this.setSelectedItems( [] );
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
			if( this.selectedItems.length == 0 )
				this.setSelectedLines( this.savedSelection.lines );
		}
		
		delete this.savedSelection;
	},

	render : function(){
		if( this.selectable ) this.saveSelection();
		
		if( this.modelView )
		{
			this.listEl.empty();
			this.modelViewsByReferenceId = {};
			
			this.collection.each( function( thisModel ) {
				var thisModelView = new this.modelView( { model : thisModel } );
				thisModelView.collectionListView = this;
				
				var thisModelReferenceId = this._getModelReferenceId( thisModel );
				if( _.isUndefined( thisModelReferenceId ) ) throw "Model has no reference id";
				
				// we use items client ids as opposed to real ids, since we may not have a representation
				// of these models on the server
				var thisModelViewWrapped = thisModelView.$el.wrapAll( "<li data-item-id='" + thisModelReferenceId + "'></li>" ).parent();
				//if( thisModel === this.collection.first() ) thisModelViewWrapped.addClass( "first" );
				//else if( thisModel === this.collection.last() ) thisModelViewWrapped.addClass( "last" );
				
				this.listEl.append( thisModelViewWrapped );
				
				// we have to render the modelView after it has been put in context, as opposed to in the 
				// initialize function of the modelView, because some rendering might be dependent on
				// the modelView's context in the DOM tree. For example, if the modelView stretch()'s itself,
				// it must be in full context in the DOM tree or else the stretch will not behave as intended.
				var renderResult = thisModelView.render(); 
				
				// return false from the view's render function to hide this item
				if( renderResult === false )
					thisModelViewWrapped.hide();
					
				this.modelViewsByReferenceId[ thisModelReferenceId ] = thisModelView;
			}, this );
		}
		else if( this.itemTemplateHtml != null )
		{
			var listHtml = "";
			listHtml = $.tmpl( this.itemTemplateHtml, this.collection.toJSON() );
			this.listEl.html( listHtml );
		}
		
		var listItemEls = this.listEl.children( "li, tr" );
		var curElNum = 0;
		this.collection.each( function( thisModel ){
			var thisModelReferenceId = this._getModelReferenceId( thisModel );
			$( listItemEls[ curElNum ] ).attr( "data-item-id", thisModelReferenceId );
			curElNum++;
		}, this );
		
		if( this.sortable )
		{
			var _this = this;
			
			this.listEl.sortable( {
				axis: "y",
				distance: 10,
				items: this.sortableItemsSelector,
				start : function() {
					_this.trigger( "sortStart" );
				},
				stop: function() {
					_this._reorderCollectionBasedOnHTML();
					_this.updateDependentControls();
					_this.trigger( "sortStop" );
				}
			} );
		}
		
		this.trigger( "render" );
		
		if( this.selectable )
		{
			this.restoreSelection();
			this.updateDependentControls();
		}
	},
	
	triggerAllModelViews : function( eventName ) {
		// trigger eventName for all modelViews
		_.each( this.modelViewsByReferenceId, function( thisModelView ) {
			thisModelView.trigger.apply( thisModelView, arguments );
		} );
	},
	
	updateDependentControls : function() {
		this.trigger( "updateDependentControls", this.selectedItems );
	},

	_getModelReferenceId : function( theModel ) {
		if( this.referenceModelsByCid ) return theModel.cid;
		else return theModel.id;
	},
	
	_getModelByReferenceId : function( referenceId ) {
		if( this.referenceModelsByCid ) return this.collection.getByCid( referenceId );
		else return this.collection.get( referenceId );
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
			if( $.isNumeric( clickedItemId ) ) clickedItemId = parseInt( clickedItemId );
		}
		
		return clickedItemId;
	},

	_selectionChanged : function( oldSelectedItems ) {
		this._addSelectedClassToSelectedItems( oldSelectedItems );
		
		this.trigger( "selectionChanged", this.selectedItems, oldSelectedItems );
		
		this.updateDependentControls();
	},
	
	_validateSelection : function() {
		// note can't use the collection's proxy to underscore because "cid" and "id" are not attributes,
		// but elements of the model object itself.
		var modelReferenceIds = this.referenceModelsByCid
			? _.pluck( this.collection.models, "cid" )
			: _.pluck( this.collection.models, "id" );
			
		this.selectedItems = _.intersection( modelReferenceIds, this.selectedItems );
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
				_this.collection.remove( thisModel, { silent : true } );
				_this.collection.add( thisModel, { silent : true } );
			}
		} );
		
		this.collection.trigger( "reorder" );
	},
	
	_listItem_onClick : function( theEvent ) {
		if( ! this.selectable ) return;
		
		var clickedItemId = this._getClickedItemId( theEvent );

		if( clickedItemId )
		{
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
				this.setSelectedItems( newSelectedItems );
				
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
			else if( this.selectMultiple && theEvent.metaKey )
			{
				if( _.contains( this.selectedItems, clickedItemId ) )
					this.setSelectedItems( _.without( this.selectedItems, clickedItemId ) );
				else this.setSelectedItems( _.union( this.selectedItems, clickedItemId ) );
			}
			else
				this.setSelectedItems( [ clickedItemId ] );
		}
		else
			// the blank area of the list was clicked
			this.setSelectedItems( [] );
	},
	
	_listItem_onDoubleClick : function( theEvent ) {
		var clickedItemId = this._getClickedItemId( theEvent );
		
		if( clickedItemId )
			this.trigger( "doubleClick", clickedItemId, theEvent );
	},
	
	_listBackground_onClick : function( theEvent ) {
		if( ! this.selectable ) return;
		if( ! $( theEvent.target ).is( ".collection-list" ) ) return;
		
		this.setSelectedItems( [] );
	},
	
	_onKeydown : function( event ) {
		if( ! this.processKeyEvents ) return true;
		
		var trap = false;
		
		if( this.getSelectedLines().length == 1 )
		{
			// need to trap down and up arrows or else the browser
			// will end up scrolling a autoscroll div.
			
			if( event.which == Rotunda.Constants.CharCodes.upArrow )
			{
				this.setSelectedLine( this.getSelectedLine() - 1 );
				trap = true;
			}
			else if( event.which == Rotunda.Constants.CharCodes.downArrow )
			{
				this.setSelectedLine( this.getSelectedLine() + 1 );
				trap = true;
			}
		}
		
		return ! trap;
	}
});
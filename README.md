#Backbone.CollectionView

A Backbone view that provides a selectable and sortable visual representation of a Backbone collection by leveraging the jQueryUI sortable plugin.

[Click here for a demo of the key features](http://rotundasoftware.github.com/backbone-collection-view/)

##Benefits

* Supports single and multiple selection through meta-key and shift clicks.
* Allows a user to re-order the collection by dragging and dropping and automatically persists the change to the backing collection.
* Keeps track of selected model(s) and fires events when selection is changed allowing you to add your own logic.
* Adds "selected" css class to selected li or tr, allowing you to make selected items visually distinct.
* Supports changing current selection through up and down arrow key presses.
* Allows you to filter which items are selectable or sortable based on functions.
* Fires a variety of events allowing you to add your own behavior based on user actions.

##Sample Usage
```javascript
//$('#listForCollection') is a ul
//EmployeeView is a Backbone view to be used for rendering each item in the collection
//emps is a Backbone collection instance
var myCollectionView = new Backbone.CollectionView({
	el : $('#listForCollection'),
	modelView : EmployeeView,
	collection : emps
}

myCollectionView.render();
```

Note, you can also have CollectionView render as a table.  To do this, the template/html of your view should have at least one td tag and your view is required to have a tagName of 'tr' or an el type of 'tr'

##Options passed to constructor
* __renderFunction__ Can be used to override the default render() function, in the case that you want to render the collection view yourself, for example to optimize efficiency for large collections. You should rarely need to use this option.
* __collection__ The collection of models that will serve as the content for this list.
* __referenceModelsByCid__ (default: _true_) If true, models will be references by their "cid" (client side id) attribute, instead of their "id" attribute.
* __selectable__ (default: _true_) Whether model views within the collection should be selectable. In this case the "selected" class will be automatically added to selected models.
* __selectMultiple__ (default: _false_) Whether multiple model views within the collection can be selected at the same time.
* __clickToSelect__ (default: _true_) Whether mouse clicks should select models as would be appropriate in standard HTML mutli-select element. Only applies to selectable collection lists.
* __clickToToggle__ (default: _false_) Whether clicking any item in a list with selectMultiple = true should toggle its selected / unselected state.  Only applies to lists with selectMultiple = true.
* __processKeyEvents__ (default: _true_) Whether the collection view should respond to arrow key events intuitively as if there collection list was a SELECT box.  Note this option has no effect if selectable is false.
* __sortable__ (default: _false_) Whether or not list items can be rearranged by dragging and dropping.
* __selectableModelsFilter__ When selectable is true, this can be used to determine which items are selectable and which items are not. The value should be a function that is passed a single parameter which is the model in question. For example:
```javascript
	function( thisModel ){
		return thisModel.get( "isSelectable" );
	}
```

* __sortableModelsFilter__ When sortable is true, this can be used to determine which items are sotable and which ones are not.  The value should be a function that is passed a single parameter which is the model in question.  For example:
```javascript
	function( thisModel ){
		return thisModel.get( "isSortable" );
	}
```

* __visibleModelsFilter__ This can be used to determine which items are visible and which ones are not.  The value should be a function that is passed a single parameters which is the model in question.  Currently model changes do not cause the collection view to re-render.  Here is an example function:
```javascript
	function( thisModel ){
		return thisModel.get( "isVisible" );
	}
```

##Methods Reference

###Method Index

* [getSelectedItem, etc.](#getSelectedItem) A family of convenience methods for getting the currently selected item(s), model(s), view(s), view element(s), line(s)
* [setSelectedItem, etc.](#setSelectedItem) A family of convenience methods for setting the selected item(s), model(s), and line(s).
* [toggleItemSelected](#toggleItemSelected) Toggles whether an item is selected or not.
* [saveSelection,restoreSelection](#selection) Allows you to create and restore a snapshot of selected items.
* [render](#render) Renders the collection view.
* __getModelViewByReferenceId(modelReferenceId)__ Get the Backbone view backing the item with id or cid of modelReferenceId.  Use _getModelViewsByReferenceId()_ to get a map of all id/cids to Backbone views.
* __getCollection, setCollection__ Getter and setter for the Backbone collection backing this CollectionView
* __getListElement__ Get the 'el' of the collection view.  Will be either a ul or a table.
* __triggerAllModelViews(eventName)__ Triggers the eventName for all model views
* __updateDependentControls__ Fires the updateDepenentControls event.
* ~~getEmptyListDescriptionView~~


### <a name="getSelectedItem"></a>getSelectedItem method family

* __getSelectedItem / getSelectedItems__ Returns the id or cid of the selected item(s).
* __getSelectedModel / getSelectedModels__ Returns the Backbone model(s) backing the currently selected item(s).
* __getSelectedModelView / getSelectedModelViews__ Returns the Backbone view(s) backing the currently selected item(s).
* __getSelectedModelViewElement / getSelectedModelViewElements__ Returns the el(s) backing the currently selected Backbone view(s).
* __getSelectedLine / getSelectedLines__ Returns the 1-based indexes of the selected items, but only looks at the visible ones.

### <a name="setSelectedItem"></a>setSelectedItem method family

All setSelectedItem related methods take two arguments:
* The __object__ or __objectsArray__ to set.
* __options__ hash.  Currently only _silent_ (true/false) is supported.  Determines whether the selectionChanged event should be fired when making the selection.

The methods:

* __setSelectedItem / setSelectedItems__
* __setSelectedModel / setSelectedModels__
* __setSelectedItem / setSelectedItems__
* __setSelectedItem / setSelectedItems__
* __selectNone(options)__ Allows you to clear all selections.

###<a name="toggleItemSelected"></a>toggleItemSelected(itemId, trueOrFalse, options)

* __itemId__ The id or cid of the item
* __trueOrFalse__ True or false depending on whether you are trying to change it to selected or not selected, respectively.  If undefined, then the 'selected-ness' will be switched to the opposite of its current state.  A selected item will be come not selected and a not selected item will become selected.
* __options__ See description in [setSelectedItem, etc.](#setSelectedItem)

### <a name="render"></a>render

Renders the collection list.  This method is called whenever a Backbone model is added or removed from the underlying Backbone collection.  If you wish to specify your own render function, use the renderFunction option when creating your Backbone.CollectionView.

##Events Fired
* __selectionChanged(newSelectedItems, oldSelectedItems)__ Fired whenever the selection is changed, either by the user or by a programmatic call to setSelectedItems
* __updateDependentControls(selectedItems)__ Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after selectionChanged is fired. In addition, it is fired after rendering (even if the selection has not changed since the last render) and sorting.
* __doubleClick(clieckedItemId, theEvent)__ Fired when a model view is double clicked. clickedItemId is either the cid or id of the model, depending on if referenceModelsByCidreferenceModelsByCid is true or false respectively
* __sortStart__ Fired just as a model view is starting to be dragged (sortable collection lists only).
* __sortStop__ Fired when a drag of a model view is finished, but before the models have been reordered within the collection (sortable collection lists only).
* __reorder__ Fired after a drag of a model view is finished and after the models have been reordered within the collection (sortable collection lists only).

##Dependencies
* Backbone.js (tested with v0.9.10)
* jQuery (tested with v1.9.1)
* jQueryUI - for sorting (tested with v1.10.1)
* _(optional)_ [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)

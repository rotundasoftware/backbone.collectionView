#Backbone.CollectionView

A Backbone view that provides a selectable and sortable visual representation of a Backbone collection by leveraging the jQueryUI sortable plugin.

[Click here for a demo of the key features](http://rotundasoftware.github.com/backbone-collection-view/)

##Benefits

* Supports single and multiple selection through meta-key and shift clicks.
* Adds "selected" css class to selected li or tr, allowing you to make selected items visually distinct.
* Allows a user to re-order the collection by dragging and dropping and automatically persists the change to the backing collection.
* Keeps track of selected model(s) and fires events when selection is changed allowing you to add your own logic.
* Supports changing current selection through up and down arrow key presses.
* Allows you to filter which items are selectable, sortable, or visible based on functions.
* Fires a variety of events allowing you to add your own behavior based on user actions.

##Sample Usage
```javascript
// $('#listForCollection') is a ul
// EmployeeView is a Backbone view to be used for rendering each item in the collection
// emps is a Backbone collection instance
var myCollectionView = new Backbone.CollectionView({
	el : $('#listForCollection'),
	modelView : EmployeeView,
	collection : emps
}

myCollectionView.render();
```

Note: you can also have CollectionView render as a table.  To do this, the template/html of your view should have at least one td tag and your view is required to have a tagName of `tr` or an el type of `tr`

##Options passed to constructor
* __collection__ The collection of models that will serve as the content for this list.
* __selectable__ (default: _true_) Whether model views within the collection should be selectable. In this case the "selected" class will be automatically added to selected models.
* __selectMultiple__ (default: _false_) Whether multiple model views within the collection can be selected at the same time.
* __sortable__ (default: _false_) Whether or not list items can be rearranged by dragging and dropping.
* __selectableModelsFilter__ This can be used to determine which items are selectable and which items are not. The value should be a function that is passed a single parameter which is the model in question. For example:
```javascript
	function( thisModel ) {
		return thisModel.get( "isSelectable" );
	}
```

* __sortableModelsFilter__ This can be used to determine which items are sortable and which ones are not.  The value should be a function that is passed a single parameter which is the model in question.  For example:
```javascript
	function( thisModel ) {
		return thisModel.get( "isSortable" );
	}
```

* __visibleModelsFilter__ This can be used to determine which items are visible and which ones are not.  The value should be a function that is passed a single parameters which is the model in question.  Here is an example function:
```javascript
	function( thisModel ) {
		return thisModel.get( "isVisible" );
	}
```
* __clickToSelect__ (default: _true_) Whether mouse clicks should select models as would be appropriate in a standard HTML mutli-select element. Only applies to selectable collection lists.
* __clickToToggle__ (default: _false_) Whether clicking any item in a list with selectMultiple == true should toggle its selected / unselected state.  Only applies to lists with selectMultiple == true.
* __processKeyEvents__ (default: _true_) Whether the collection view should respond to arrow key events as would be appropriate in a standard HTML multi-select element.  Only applies to selectable collection lists.

##Methods and Properties Reference

###Method and Property Index

* [getSelectedItem(s)](#getSelectedItem) Returns the currently selected item(s).
* [setSelectedItem(s)](#setSelectedItem) Sets which item(s) should be selected.
* __collection__ A public property to access the Backbone collection backing this CollectionView.
* __viewManager__ A public [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter) property that contains all the item views making up the CollectionView.
* __setCollection__ Set the Backbone collection backing this CollectionView.  Will automatically re-render the CollectionView.
* __getListElement__ Get the 'el' of the collection view.  Will be either a `ul` or a `table`.


### <a name="getSelectedItem"></a>getSelectedItem(s)

```javascript
myCollectionView.getSelectedItem( [options] )
myCollectionView.getSelectedItems( [options] )
```
Returns the currently selected item(s).

The item property returned depends on `options.by`.  The possible values are:
* __cid__ The `cid` of the item's model.
* __id__ The `id` of the item's model.
* __model__ The item's model.
* __modelView__ The item's model view.
* __line__ The item's line number.  The line number is the 0-based index of the item in the item list when only counting visible items.

If no `options.by` is passed in, the returned type will default to `cid`.
```javascript
// Get the cid of the currently selected item
var myItemCid = myCollectionView.getSelectedItem( { by : "cid" } );

// Get the id of the currently selected item
var myItemId = myCollectionView.getSelectedItem( { by : "id" } );

// Get the model of the currently selected item
var myItemModel = myCollectionView.getSelectedItem( { by : "model" } );

// Get the model view of the currently selected item
var myItemModelView = myCollectionView.getSelectedItem( { by : "modelView" } );

// Get the line number of the currently selected item
var myItemLineNumber = myCollectionView.getSelectedItem( { by : "line" } );
```


### <a name="setSelectedItem"></a>setSelectedItem(s)

```javascript
myCollectionView.setSelectedItem( item, [options] )
myCollectionView.setSelectedItems( items, [options] )
```

Sets which item(s) should be selected.

The item property passed in the first argument is used to identify the item(s) to select.  It should correspond to the value of `options.by`.  See [getSelectedItem(s)](#getSelectedItem) for the possible values and default behavior

By default, a `selectionChanged` event is not fired when `setSelectedItem(s)` is called.  To have the event fire, pass in `options.silent` set to `true`.

```javascript
// Select the item with cid equal to myCid1
myCollectionView.setSelectedItem( myCid1, { by : "cid" } );

// Select the items with cids equal to myCid1 and myCid2
myCollectionView.setSelectedItems( [ myCid1, mCid2 ], { by : "cid" } );

// Select the item with id equal to myId
myCollectionView.setSelectedItem( myId, { by : "id" } );

// Select the items with model equal to myModel1 and myModel2.  Fire the 'selectionChanged' event.
myCollectionView.setSelectedItems( [ myModel1, myModel2 ], { by : "model", silent : false } );

// Select the item with modelView equal to myModelView
myCollectionView.setSelectedItem( myModelView, { by : "modelView" } );

// Select the item with line number equal to myLine
myCollectionView.setSelectedItem( myLine, { by : "line" } );
```



##Events Fired
* __"selectionChanged"__ ( _newSelectedItems, oldSelectedItems_ )  Fired whenever the selection is changed, either by the user or by a programmatic call to setSelectedItems with `silent` set to `false`.
* __"updateDependentControls"__ ( _selectedItems_ )  Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after selectionChanged is fired. In addition, it is fired after rendering (even if the selection has not changed since the last render) and sorting.
* __"doubleClick"__ ( _clickedItemId, theEvent_ )  Fired when a model view is double clicked. `clickedItemId` is the `cid`.
* __"sortStart"__  Fired just as a model view is starting to be dragged (sortable collection lists only).
* __"sortStop"__  Fired when a drag of a model view is finished, but before the models have been reordered within the collection (sortable collection lists only).
* __"reorder"__  Fired after a drag of a model view is finished and after the models have been reordered within the collection (sortable collection lists only).

##Dependencies
* Backbone.js (tested with v0.9.10)
* [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter)
* jQuery (tested with v1.9.1)
* jQueryUI - for sorting (tested with v1.10.1)
* _(optional)_ [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)

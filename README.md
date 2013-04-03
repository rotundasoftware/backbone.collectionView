# Backbone.CollectionView

A backbone view class that renders a collection of models. This class is similar to the collection view classes found in Backbone.Marionette and other frameworks, with added features for automatic selection of models in response to clicks, and support for rearranging models (and reordering the underlying collection) through drag and drop.

Depends on jQuery and jQueryUI for event handling and sorting, respectively.

[Click here for a demo of key features](http://rotundasoftware.github.com/backbone-collection-view/)

##Benefits

* Supports single and multiple selection through meta-key and shift clicks, as you would expect from a SELECT element.
* Adds "selected" css class to selected li or tr, allowing you to easily style selected items.
* Allows a user to reorder the collection by dragging and dropping and automatically applies the new order to the collection.
* Keeps track of selected model(s) and fires events when selection is changed.
* Supports changing the currently selected model(s) through up and down arrow key presses.
* Allows you to filter which models are selectable, sortable, and visible.
* Fires a variety of events allowing you to add your own behavior based on user actions.
* Integrates with [Backboune.Courier](https://github.com/rotundasoftware/backbone.courier) out of the box.

## Sample Usage
```javascript
// In the below example,
//   $( "#listForCollection" ) returns a ul element
//   EmployeeView is a Backbone view to be used for rendering each model in the collection
//   employeeCollection is a Backbone collection instance
var myCollectionView = new Backbone.CollectionView({
	el : $( "#listForCollection" ),
	modelView : EmployeeView,
	collection : employeeCollection
}

myCollectionView.render();
```

Note: you can also pass a `table` element for the CollectionView's `el` property. Just make sure if you do so, your modelView has an el type of `tr`.

##Options passed to constructor
* __collection__ The collection of models to be rendered.
* __selectable__ (default: _true_) Determines whether or not models are selectable. If true, clicks from the user will automatically change the selected models (by default), and the "selected" class will be added to the elements of the selected model views.
* __selectMultiple__ (default: _false_) Determines whether or not multiple models within the collection can be selected at the same time.
* __sortable__ (default: _false_) Determines whether or not list items can be rearranged by dragging and dropping.
* __selectableModelsFilter__ (default: _all models_) Determines which models are selectable. The value should be a function that expects a single parameter which is the model in question. For example:
```javascript
	function( thisModel ) {
		return thisModel.get( "isSelectable" );
	}
```

* __sortableModelsFilter__ (default: _all models_) This can be used to determine which items are sortable. The value should be a function that expects a single parameter which is the model in question, just like the value of the `selectableModelsFilter` option.
* __visibleModelsFilter__ (default: _all models_) This can be used to determine which items are visible. The value should be a function that expects a single parameters which is the model in question, just like the value of the `selectableModelsFilter` option.
* __clickToSelect__ (default: _true_) Determines whether or not mouse clicks should select models as would be appropriate in a standard HTML mutli-select element. Only applies to selectable collection lists.
* __clickToToggle__ (default: _false_) Determines whether or not clicking an item in a list with selectMultiple == true should toggle its selected / unselected state. Only applies to lists with selectMultiple == true.
* __processKeyEvents__ (default: _true_) Determines whether or not the collection view should respond to arrow key events as would be appropriate in a standard HTML multi-select element. Only applies to selectable collection lists.

##Methods and Properties Reference

###Method and Property Index

* [setSelectedItem(s)](#setSelectedItem) Sets which models are selected.
* [getSelectedItem(s)](#getSelectedItem) Returns references to the selected model or models.
* __collection__ (property) The Backbone collection that this CollectionView represents.
* __viewManager__ (property) A [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter) instance that contains the model views that represent the models in the collection. (These model views are created when the CollectionView is rendered.)
* __setCollection__ Changes the Backbone collection backing this CollectionView. Will automatically re-render the CollectionView.
* __getListElement__ Get the 'el' of the collection view. Will be either a `ul` or a `table`.




### <a name="setSelectedItem"></a>setSelectedItem(s) and getSelectedItem(s)

```javascript
collectionView.getSelectedItem( { by : <referenceType> } )	// returns a single model "reference"
collectionView.getSelectedItems( { by : <referenceType> } )	// returns an array of model "references"
collectionView.setSelectedItem( item, { by : <referenceType>, silent : <bool> } )	// item is a single model "reference"
collectionView.setSelectedItems( items, { by : <referenceType>, silent : <bool> } )	// items an array of model "references"
```

The getSelectedItem(s) and setSelectedItem(s) functions are able to reference models in a variety of ways. For instance, it is possible to set the currently selected model using the model's `cid`, using the model's `id`, or using the model object itself. You specify which method you are using the reference the models using the `by` option accepted by these functions. Its not hard - let's see some examples:

// Select model ids 2 and 4
myCollectionView.setSelectedItems( [ 2, 4 ], { by : "id" } );

// Return an array of the selected models
myCollectionView.getSelectedItems( { by : "model" } );

```javascript
// Select the model with cid equal to "c21"
myCollectionView.setSelectedItem( "c21" );	// the "by" option defaults to "cid"

// Get the selected model view
myCollectionView.getSelectedItem( { by : "modelView" } );
```

There are five permitted values for the `options.by` option:
* __cid__ The `cid` of the model.
* __id__ The `id` of the model.
* __model__ The model object itself.
* __modelView__ The view that was created to represent the model.
* __line__ The 0-based index of the model in the collection (only counting visible models).

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

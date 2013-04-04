# Backbone.CollectionView

A backbone view class that renders a collection of models. This class is similar to the collection view classes found in [Backbone.Marionette](https://github.com/marionettejs/backbone.marionette) and other frameworks, with added features for automatic selection of models in response to clicks, and support for rearranging models (and reordering the underlying collection) through drag and drop.

Depends on jQuery and jQueryUI for event handling and sorting, respectively.

[Click here for a demo of key features](http://rotundasoftware.github.com/backbone-collection-view/)

## Benefits

* Provides a easy way to render a collection of models.
* Supports single and multiple selection through meta-key and shift clicks, as you would expect from a SELECT element.
* Adds "selected" css class to selected li or tr, allowing you to easily style selected items.
* Allows a user to reorder the collection by dragging and dropping and automatically applies the new order to the collection.
* Keeps track of selected model(s) and fires events when the selection is changed.
* Supports changing the currently selected model(s) through up and down arrow key presses.
* Allows you to filter which models are selectable, sortable, and visible.
* Fires a variety of events allowing you to add your own behavior based on user actions.
* Integrates with [Backboune.Courier](https://github.com/rotundasoftware/backbone.courier) out of the box.

## Sample Usage
```javascript
// In the below example,
//   * $( "#listForCollection" ) returns a ul element
//   * EmployeeView is a Backbone View class to be used for rendering each model in the collection
//   * employeeCollection is a Backbone collection instance
var myCollectionView = new Backbone.CollectionView({
	el : $( "#listForCollection" ),
	modelView : EmployeeView,
	collection : employeeCollection
}

myCollectionView.render();
```

Note: you can also pass a `table` element for the CollectionView's `el` property. Just make sure if you do so, your modelView has an element type of `tr`.

## Options accepted by the CollectionView constructor
* `collection` The collection of models to be rendered.
* `selectable` (default: _true_) Determines whether models in the CollectionView are selectable.
* `clickToSelect` (default: _true_) In a selectable CollectionView, determines whether mouse clicks should select models as would be appropriate in a standard HTML mutli-SELECT element.
* `processKeyEvents` (default: _true_) In a selectable CollectionView, determines whether the collection view should respond to arrow key events as would be appropriate in a standard HTML multi-SELECT element.
* `selectMultiple` (default: _false_) In a selectable CollectionView, determines whether multiple models can be selected at once.
* `clickToToggle` (default: _false_) In a selectable CollectionView with selectMultiple == true, determines whether clicking an item should toggle its selected / unselected state.
* `sortable` (default: _false_) Determines whether models can be rearranged by dragging and dropping. (jQueryUI required.)
* `visibleModelsFilter` (default: _all models_) Determines which items are visible. The value should be a function that expects a single parameters which is the model in question, and returns true or false.
* `selectableModelsFilter` (default: _all models_) In a selectable CollectionView, determines which models are selectable. The value should be a function that expects a single parameter which is the model in question, and returns true or false.
* `sortableModelsFilter` (default: _all models_) In a sortable CollectionView, Determines which items are sortable. The value should be a function that expects a single parameter which is the model in question, and returns true or false.

## Methods and Properties Reference

* __setSelectedItem( modelReference, [options] )__ Sets which model(s) are selected. (See discussion below.)
* __getSelectedItem( options] )__ Returns references to the selected model(s). (See discussion below.)
* __setCollection( collection )__ Changes the collection being rendered. Will automatically re-render the CollectionView.
* __getListElement()__ Get the 'el' of the collection view. Will be either a `ul` or a `table`.
* __collection__ The Backbone collection instance that this CollectionView represents.
* __viewManager__ A [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter) instance that contains the model views that are created to represent the individual models in the collection (when the CollectionView is rendered).


### <a name="setSelectedItem"></a>setSelectedItem(s) and getSelectedItem(s)

The `getSelectedItem(s)` and `setSelectedItem(s)` methods are used to get or set the currently selected models. The methods are able to reference models in a variety of ways. For instance, it is possible to set the currently selected model using the model's `cid`, using the model's `id`, or using the model object itself. The magic is in the `by` option. Its not complicated - let's see some examples:

```javascript
// Select model id 2 and model id 4
myCollectionView.setSelectedItems( [ 2, 4 ], { by : "id" } );

// Returns an array of the selected models
myCollectionView.getSelectedItems( { by : "model" } );

// Select the model with cid equal to "c21"
myCollectionView.setSelectedItem( "c21" );	// the "by" option defaults to "cid"

// Returns the view object that represents the selected model
myCollectionView.getSelectedItem( { by : "modelView" } );
```

As you can see from the examples, the plural versions of the methods expect / return an array of "model references", whereas the singular versions expect / return just a single "model reference".

There are five valid values for `by` option, which correspond to the type of model reference expected / returned:
* `"cid"` : The `cid` of the model. (This is the default value of the `by` option.)
* `"id"` : The `id` of the model.
* `"model"` : The model object itself.
* `"modelView"` : The view that was created to represent the model when the CollectionView was rendered.
* `"line"` : The zero-based index of the model in the collection, only models currently visible in the CollectionView.

In addition to the `by` option, the `setSelectedItems(s)` function accepts one additional option, `silent`, which, when true, will prevent the `selectionChanged` event from being fired.

##Events Fired
CollectionViews `trigger` the following events on themselves. You can respond to these events from another view using Backbone's `listenTo` method. If [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)
 is available, these events are also spawned using Courier.
* __"selectionChanged"__ ( _newSelectedModelCids, oldSelectedModelCids_ )  Fired whenever the selection is changed, either by the user or by a programmatic call to `setSelectedItem(s)`.
* __"updateDependentControls"__ ( _selectedModelCids_ ) Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after `selectionChanged` is fired. In addition, it is fired after rendering and sorting.
* __"doubleClick"__ ( _clickedModelCid, theEvent_ ) Fired when a model view is double clicked.
* __"sortStart"__  Fired just as an item is starting to be dragged. (Sortable collection lists only.)
* __"sortStop"__  Fired when a drag of an item is finished, but before the collection has been reordered. (Sortable collection lists only.)
* __"reorder"__  Fired after a drag of an item is finished and after the collection has been reordered. (Sortable collection lists only.)

##Dependencies
* Backbone.js (tested with v0.9.10)
* [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter)
* jQuery (tested with v1.9.1)
* jQueryUI - for sorting (tested with v1.10.1)
* _(optional)_ [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)

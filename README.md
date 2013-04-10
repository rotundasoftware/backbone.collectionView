# Backbone.CollectionView

A backbone view class that renders a collection of models. This class is similar to the collection view classes found in [Backbone.Marionette](https://github.com/marionettejs/backbone.marionette) and other frameworks, with added features for automatic selection of models in response to clicks, and support for rearranging models (and reordering the underlying collection) through drag and drop.

Depends on jQuery and jQueryUI for event handling and sorting, respectively.

[Click here for a demo of key features](http://rotundasoftware.github.com/backbone-collection-view/)

## Benefits

* Provides a view that renders a collection of models, updating automatically when models are added or removed.
* Keeps track of selected model(s) and fires events when the selection is changed.
* Adds "selected" css class to selected `<li>` or `<tr>`, allowing you to easily style selected model views.
* Supports single and multiple selection through meta-key and shift clicks, as you would expect from a multi-SELECT element.
* Allows a user to reorder the collection by dragging and dropping and automatically applies the new order to the collection.
* Supports changing the currently selected model(s) through up and down arrow key presses.
* Allows you to filter which models are visible, selectable, and sortable.
* Integrates with [Backboune.Courier](https://github.com/rotundasoftware/backbone.courier) out of the box.

## Sample Usage
```javascript
var myCollectionView = new Backbone.CollectionView( {
	el : $( "#listForCollection" ),		// must be a 'ul' (i.e. unordered list) or 'table' element
	modelView : EmployeeView,			// a View class to be used for rendering each model in the collection
	collection : employeeCollection
} );

myCollectionView.render();
myCollectionView.setSelectedModel( employeeCollection.first() );
```

## Options accepted by the CollectionView constructor
* `el` : A `<ul>` or `<table>` element. If you supply a `<ul>` element, your modelView's element can be of any type (they will be wrapped in `<li>` elements), but if you supply a `<table>` element, make sure your modelView has elements of type of `<tr>`. (If no `el` is supplied, a new `<ul>` element will be created and used.)
* `collection` : The collection of models to be rendered.
* `modelView` : The view constructor that will be used to create the views for each individual model in the collection.
* `selectable` : (default: _true_) Determines whether models in the CollectionView are selectable.
* `clickToSelect` : (default: _true_) In a selectable CollectionView, determines whether mouse clicks should select models as would be appropriate in a standard HTML mutli-SELECT element.
* `processKeyEvents` : (default: _true_) In a selectable CollectionView, determines whether the collection view should respond to arrow key events as would be appropriate in a standard HTML multi-SELECT element.
* `selectMultiple` : (default: _false_) In a selectable CollectionView, determines whether multiple models can be selected at once.
* `clickToToggle` : (default: _false_) In a selectable CollectionView, determines whether clicking a model view should toggle its selected / unselected state. Only applies if selectMultiple == true.
* `sortable` : (default: _false_) Determines whether models can be rearranged by dragging and dropping. (jQueryUI required.)

The following options expect a filter function that takes a single parameter, the model in question, and returns true or false.
* `visibleModelsFilter` : (default: _all models_) Determines which models are visible. 
* `selectableModelsFilter` : (default: _all models_) In a selectable CollectionView, determines which models are selectable.
* `sortableModelsFilter` : (default: _all models_) In a sortable CollectionView, determines which models are sortable.

## Methods and Properties Reference

* __setSelectedModel( modelReference, [options] )__ Sets which model(s) are selected. (See discussion below.)
* __getSelectedModel( [options] )__ Returns references to the selected model(s). (See discussion below.)
* __setOption( optionName, optionValue )__ Updates the value of a configuration option.  All constructor options above are valid except `el`.  The CollectionView is automatically re-rendered if necessary.
* __collection__ The Backbone collection instance that this CollectionView represents.
* __viewManager__ A [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter) instance that contains the model views corresponding to the individual models in the collection. The Backbone.Babysitter implements a "view collection" that enables you to, for example, iterate through all the model views, or easily trigger an event on all model views at once. See the [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter) documentation for more information.


### <a name="setSelectedModel"></a>setSelectedModel(s) and getSelectedModel(s)

The `getSelectedModel(s)` and `setSelectedModel(s)` methods are used to get or set the currently selected models. The methods are able to reference models in a variety of ways. For instance, it is possible to set the currently selected model using the model object itself (the default), the model's `cid`, or the model's `id`. The magic is in the `by` option:

```javascript
// Returns an array of the selected models
myCollectionView.getSelectedModels();

// Returns an array of the ids of the selected models
myCollectionView.getSelectedModels( { by : "id" } );

// Select model id 2 and model id 4
myCollectionView.setSelectedModels( [ 2, 4 ], { by : "id" } );

// Select the model with cid equal to "c21"
myCollectionView.setSelectedModel( "c21", { by : "cid" } );

// Returns the view object that represents the selected model
myCollectionView.getSelectedModel( { by : "view" } );
```

As shown in the examples, the plural versions of the methods expect / return an array of "model references", whereas the singular versions expect / return just a single "model reference".

There are four valid values for `by` option, which correspond to the type of "model reference" expected / returned.
* `"cid"` : The `cid` of the model.
* `"id"` : The `id` of the model.
* `"view"` : The view that was created to represent the model when the CollectionView was rendered.
* `"offset"` : The zero-based index of the model in the collection, only counting models currently visible in the CollectionView.

If no `by` option is provided the model object itself is expected / returned. Additionally, the `setSelectedModel(s)` function accepts one additional option, `silent`, which, when true, will prevent the `selectionChanged` event from being fired.

##Events Fired
CollectionViews `trigger` the following events on themselves. You can respond to these events from another view using Backbone's `listenTo` method. If [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)
 is available, these events are also "spawned" using Courier.
* __"selectionChanged"__ ( _newSelectedModels, oldSelectedModels_ )  Fired whenever the selection is changed, either by the user or by a programmatic call to `setSelectedModel(s)`.
* __"updateDependentControls"__ ( _selectedModels_ ) Fired whenever controls that are dependent on the selection should be updated (e.g. buttons that should be disabled on no selection). This event is always fired just after `selectionChanged` is fired. In addition, it is fired after rendering and sorting.
* __"doubleClick"__ ( _clickedModel_ ) Fired when a model view is double clicked.
* __"sortStart"__  Fired just as a model view is starting to be dragged. (Sortable collection lists only.)
* __"sortStop"__  Fired when a drag of a model view is finished, but before the collection has been reordered. (Sortable collection lists only.)
* __"reorder"__  Fired after a drag of a model view is finished and after the collection has been reordered. (Sortable collection lists only.)

##Dependencies
* Backbone.js (tested with v0.9.10)
* [Backbone.BabySitter](https://github.com/marionettejs/backbone.babysitter)
* jQuery (tested with v1.9.1)
* jQueryUI - for sorting (tested with v1.10.1)
* _(optional)_ [Backbone.Courier](https://github.com/rotundasoftware/backbone.courier)

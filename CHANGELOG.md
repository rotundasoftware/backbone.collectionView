# Change log

### v0.11.0

* Added `reuseModelViews` option. Set to false to completely recreate model views on each render.

### v0.10.1

* Brought npm package version in sync with Bower package. How'd that happen?
* Fixed issue that could surface when setting multiple models using collection.set (#50)

### v0.9.3

* Fixed UMD wrapper.

### v0.9.2

* Added UMD wrapper.

### v0.9.0

* No longer re-render upon add() and remove() events in the collection.
* Due to the above, "render" events no longer trigger during add() or remove() calls on a collection.
* Made use of backbone.viewOptions by including it and updating the source to use it's facilities.

### v0.8.2

* Patch for better bower support.

### v0.8.1

* If a modelView's element is an <li>, don't wrap in an extra <li> when rendering
* Fix accidental item removal after sort stop when rendering as table.
* Add sortableOptions constructor option which is passed through to the created jQuery sortable.

### v0.8

* data-item-id attribute has been changed to data-model-cid for clarity
* selectableModelsFilter can no longer be a string.
* After the collection view is reordered via dragging: if the collection has a comparator, sort after adding all the models in the visual order.
* Never "rerender" the collection view unless it has already been rendered.  For example, adding models to the collection should not render the collection view if it was not previously rendered.
* Don't listen to events from old collection when setOptions( "collection", newCollection ) is called

### v0.7.1

* Use css classes to keep track of and determine visibility of an item
* Call remove() on views in viewManager when they are removed (so they stop listening to events)
* Add `detachedRendering` option (defaults to `false`) to improve performance by rendering all modelViews before inserting into the DOM.

### v0.7.0

* Fix to work with underscore.js 1.5.1 (remove `_.bindAll` and use `.bind` where necessary).
* Listen for `mousedown` event instead of `click` when `clickToSelect` is enabled.
* Hide empty list caption when dragging item into a `sortable` collection view.

### v0.6.5

* Model views that represent a particular model are now reused between renders.

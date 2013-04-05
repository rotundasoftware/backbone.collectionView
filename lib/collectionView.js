/*!
 *  * Backbone.CollectionView, v0.4.0
 * Copyright (c)2013 Rotunda Software, LLC.
 * Distributed under MIT license
 * http://github.com/rotundasoftware/backbone-collection-view
 */

(function() {
    var mDefaultModelViewConstructor = Backbone.View;

    var DEFAULT_REFERENCE_BY = "cid";

    Backbone.CollectionView = Backbone.View.extend({

        tagName: "ul",
        // className : "collection-list", we add this class manually so we can spawn in className when extending class

        events: {
            "click li, td": "_listItem_onClick",
            "dblclick li, td": "_listItem_onDoubleClick",
            "click": "_listBackground_onClick",
            "click ul.collection-list, table.collection-list": "_listBackground_onClick",
            "keydown": "_onKeydown"
        },

        //only used if Backbone.Courier is available
        spawnMessages: {
            "focus": "focus"
        },

        //only used if Backbone.Courier is available
        passMessages: {
            "*": "."
        },

        initialize: function(options) {
            var _this = this;

            if (_.isUndefined(options.collection)) options.collection = new Backbone.Collection();
            if (_.isUndefined(options.modelView)) options.modelView = null;
            if (_.isUndefined(options.modelViewOptions)) options.modelViewOptions = {};
            if (_.isUndefined(options.itemTemplate)) options.itemTemplate = null;
            if (_.isUndefined(options.renderFunction)) options.renderFunction = null;
            if (_.isUndefined(options.selectable)) options.selectable = true;
            if (_.isUndefined(options.clickToSelect)) options.clickToSelect = true;
            if (_.isUndefined(options.selectableItemsFilter)) options.selectableItemsFilter = true;
            if (_.isUndefined(options.selectMultiple)) options.selectMultiple = false;
            if (_.isUndefined(options.clickToToggle)) options.clickToToggle = false;
            if (_.isUndefined(options.processKeyEvents)) options.processKeyEvents = true;
            if (_.isUndefined(options.sortable)) options.sortable = false;
            if (_.isUndefined(options.sortableModelsFilter)) options.sortableModelsFilter = null;

            this.collection = options.collection;
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

            //If rendering a table, make sure that $el of modelView is a tr
            if (_this._isRenderedAsTable()) {
                //need to make sure the el of the modelView is a tr.  is there a better way of doing this than creating an instance?
                if (this.modelView) {
                    var view = new options.modelView();
                    if (view.$el.prop("tagName").toLowerCase() !== 'tr') {
                        throw "If creating a CollectionView with a 'table' $el, modelView needs to have a 'tr' $el";
                    }
                }
            }

            if (options.renderFunction !== null) this.render = function() {
                options.renderFunction.apply(_this.bindCallbacksTo ? _this.bindCallbacksTo : _this, arguments);
            };

            delete this.options;

            if (this._isBackboneCourierAvailable()) {
                Backbone.Courier.add(this);
            }

            this.$el.data("view", this); // needed for connected sortable lists
            this.$el.addClass("collection-list");
            if (this.processKeyEvents) this.$el.attr("tabindex", 0); // so we get keyboard events

            if (this.$el.next().is("div.empty-list-description") && !_.isUndefined(Rotunda.Views.EmptyListDescription)) this.emptyListDescriptionView = new Rotunda.Views.EmptyListDescription({
                el: this.$el.next(),
                collectionListView: this,
                udpateStateCallback: this.emptyListDescriptionUpdateStateCallback
            });

            this.selectedItems = [];

            var itemTemplateHtml;
            if (this.itemTemplate) {
                if ($(this.itemTemplate).length == 0) throw "Could not find item template from selector: " + this.itemTemplate;

                itemTemplateHtml = $(this.itemTemplate).html();
            } else itemTemplateHtml = this.$(".item-template").html();

            if (itemTemplateHtml) this.itemTemplateFunction = _.template(itemTemplateHtml);

            if (_.isString(this.bubbleEvents)) this.bubbleEvents = this.bubbleEvents.split(" ");

            _.bindAll(this);

            // spawn these events in case parent views need to rerender or take other action after we are done rendering
            this.listenTo(this.collection, "add", function() {
                this.render();
                if (this._isBackboneCourierAvailable()) this.spawn("add");
            });

            this.listenTo(this.collection, "remove", function() {
                this.validateSelectionAndRender();
                if (this._isBackboneCourierAvailable()) this.spawn("remove");
            });

            this.listenTo(this.collection, "reset", function() {
                this.validateSelectionAndRender();
                if (this._isBackboneCourierAvailable()) this.spawn("reset");
            });
            //this.listenTo( this.collection, "change", function() { this.render(); this.spawn( "change" ); } ); // don't want changes to models bubbling up and triggering the list's render() function

            // note we do NOT call render here anymore, because if we inherit from this class we will likely call this
            // function using __super__ before the rest of the initialization logic for the decendent class. however, we may
            // override the render() function in that decendent class as well, and that will certainly expect all the initialization
            // to be done already. so we have to make sure to not jump the gun and start rending at this point.
            // this.render();
        },

        setCollection: function(newCollection) {
            if (newCollection !== this.collection) {
                this.collection = newCollection;

                this.collection.bind("add", this.render, this);
                this.collection.bind("remove", this.validateSelectionAndRender, this);
                this.collection.bind("reset", this.validateSelectionAndRender, this);
                //this.collection.bind( "change", this.render, this ); //don't want changes to models bubbling up to force re-render of entire list
            }

            this.render();
        },

        getSelectedItem: function() {
            return this.selectedItems[0];
        },

        getSelectedItem: function(options) {
            return _.first(this.getSelectedItems(options));
        },


        getSelectedItems: function() {
            return this.selectedItems;
        },

        getSelectedItems: function(options) {

            var _this = this;

            var referenceBy;

            options = _.extend({}, {
                by: DEFAULT_REFERENCE_BY
            }, options);

            var referenceBy = options.by;

            var items = [];

            switch (referenceBy) {
                case "id":
                    _.each(this.selectedItems, function(item) {
                        items.push(_this.viewManager.findByModel(_this.collection.get(item)).model.id);
                    });
                    break;
                case "cid":
                    items = items.concat(this.selectedItems);
                    break;
                case "line":
                    var curLineNumber = 0;
                    this.$el.find("> [data-item-id]:visible").each(function() {
                        var thisItemEl = $(this);
                        if (thisItemEl.is(".selected")) items.push(curLineNumber);
                        curLineNumber++;
                    });
                    break;
                case "model":
                    _.each(this.selectedItems, function(item) {
                        items.push(_this.viewManager.findByModel(_this.collection.get(item)).model);
                    });
                    break;
                case "modelView":
                    _.each(this.selectedItems, function(item) {
                        items.push(_this.viewManager.findByModel(_this.collection.get(item)));
                    });
                    break;
                default:
                    throw "The referenceBy property was not properly set";
            };

            return items;

        },

        isItemSelected: function(itemId) {
            if (_.isUndefined(itemId)) return this.selectedItems.length > 0;

            return _.contains(this.selectedItems, itemId);
        },

        getSelectedModelViewElement: function() {
            // return jquery object that contains the first selected model view elements. if no
            // model view is selected an empty jquery object (NOT null!) is returned.
            return this.getSelectedModelViewElements().first();
        },

        getSelectedModelViewElements: function() {
            // return jquery object that contains all selected model views elements. if no
            // model view is selected an empty jquery object (NOT null!) is returned.

            var viewEls = $();

            _.each(this.selectedItems, function(thisItemId) {
                viewEls = viewEls.add(this.$el.find("[data-item-id=" + thisItemId + "]"));
            }, this);

            return viewEls;
        },

        setSelectedItems: function(newSelectedItems, options) {
            if (!this.selectable) throw "Attempt to set selected items on non-selectable list";
            if (!_.isArray(newSelectedItems)) throw "Invalid parameter value";

            options = _.extend({}, {
                silent: true,
                by: DEFAULT_REFERENCE_BY
            }, options);


            var referenceBy = options.by;

            var newSelectedItemsTemp = [];

            switch (referenceBy) {
                case "cid":
                    newSelectedItemsTemp = newSelectedItems;
                    break;
                case "id":
                    this.viewManager.each(function(view) {
                        if (_.contains(newSelectedItems, view.model.id)) newSelectedItemsTemp.push(view.model.cid);
                    });
                    break;
                case "model":
                    newSelectedItemsTemp = _.pluck(newSelectedItems, "cid");
                    break;
                case "modelView":
                    _.each(newSelectedItems, function(item) {
                        newSelectedItemsTemp.push(item.model.cid);
                    });
                    break;
                case "line":
                    var curLineNumber = 0;
                    var selectedItems = [];
                    this.$el.find("> [data-item-id]:visible").each(function() {
                        var thisItemEl = $(this);
                        if (_.contains(newSelectedItems, curLineNumber)) newSelectedItemsTemp.push(thisItemEl.attr("data-item-id"));
                        curLineNumber++;
                    });
                    break;
                default:
                    throw "The referenceBy property was not properly set"
            };

            var oldSelectedItems = _.clone(this.selectedItems);
            this.selectedItems = this._convertStringsToInts(newSelectedItemsTemp);
            this._validateSelection();

            if (!this._containSameElements(this.selectedItems, oldSelectedItems)) {
                this._addSelectedClassToSelectedItems(oldSelectedItems);

                if (!options.silent) {
                    this.trigger("selectionChanged", this.selectedItems, oldSelectedItems);
                    if (this._isBackboneCourierAvailable()) {
                        this.spawn("selectionChanged", {
                            selectedItems: this.selectedItems,
                            oldSelectedItems: oldSelectedItems
                        });
                    }
                }

                this.updateDependentControls();

            }

        },

        setSelectedItem: function(newSelectedItem, options) {
            if (_.isUndefined(newSelectedItem) || _.isNull(newSelectedItem)) this.selectNone();
            else this.setSelectedItems([newSelectedItem], options);
        },

        selectNone: function(options) {
            this.setSelectedItems([], options);
        },

        _saveSelection: function() {
            // save the current selection. use restoreSelection() to restore the selection to the state it was in the last time saveSelection() was called.

            if (!this.selectable) throw "Attempt to save selection on non-selectable list";

            this.savedSelection = {
                items: this.selectedItems,
                lines: this.getSelectedItems({
                    by: "line"
                })
            };
        },

        _restoreSelection: function() {
            if (!this.savedSelection) throw "Attempt to restore selection but no selection has been saved!";

            // reset selectedItems to empty so that we "redraw" all "selected" classes
            // when we set our new selection. We do this because it is likely that our
            // contents have been refreshed, and we have thus lost all old "selected" classes.
            this.setSelectedItems([]);

            if (this.savedSelection.items.length > 0) {
                // first try to restore the old selected items using their reference ids.
                this.setSelectedItems(this.savedSelection.items);

                // all the items with the saved reference ids have been removed from the list.
                // ok. try to restore the selection based on the lines that used to be selected.
                // this is the expected behavior after a item is deleted from a list (i.e. select
                // the line that immediately follows the deleted line).
                if (this.selectedItems.length === 0) this.setSelectedItems(this.savedSelection.lines, {
                    by: "line"
                });
            }

            delete this.savedSelection;
        },

        render: function() {
            var _this = this;

            if (this.selectable) this._saveSelection();

            this.viewManager = new Backbone.ChildViewContainer();

            if (this.itemTemplateFunction != null) {
                var listHtml = "";
                this.collection.each(function(thisModel) {
                    listHtml += _this.itemTemplateFunction(thisModel.toJSON());
                });

                this.$el.html(listHtml);

                var listItemEls = this.$el.children("li, tr");
                var curElNum = 0;
                this.collection.each(function(thisModel) {
                    var thisModelReferenceId = this._getModelReferenceId(thisModel);
                    var thisListItemEl = $(listItemEls[curElNum]);
                    thisListItemEl.attr("data-item-id", thisModelReferenceId);
                    var thisModelView = new(mDefaultModelViewConstructor)({
                        el: thisListItemEl
                    });
                    thisModelView.model = thisModel;
                    _this.viewManager.add(thisModelView);
                    curElNum++;
                }, this);
            } else {
                this.$el.empty();

                this.collection.each(function(thisModel) {
                    var thisModelViewConstructor = this._getModelViewConstructor(thisModel);

                    if (_.isUndefined(thisModelViewConstructor)) throw "Could not find modelView for model";

                    var modelViewOptions = this._getModelViewOptions(thisModel);
                    var thisModelView = new(thisModelViewConstructor)(modelViewOptions);

                    thisModelView.collectionListView = _this;
                    thisModelView.model = thisModel;


                    var thisModelReferenceId = this._getModelReferenceId(thisModel);
                    if (_.isUndefined(thisModelReferenceId)) throw "Model has no reference id";

                    // we use items client ids as opposed to real ids, since we may not have a representation
                    // of these models on the server
                    var thisModelViewWrapped;


                    //If we are rendering the collection in a table, the template $el is a tr so we just need to set the data-item-id
                    if (this._isRenderedAsTable()) {
                        thisModelViewWrapped = thisModelView.$el.attr('data-item-id', thisModelReferenceId);

                    }
                    //If we are rendering the collection in a list, we need wrap each item in an <li></li> and set the data-item-id
                    else if (this._isRenderedAsList()) {
                        thisModelViewWrapped = thisModelView.$el.wrapAll("<li data-item-id='" + thisModelReferenceId + "'></li>").parent();
                    }

                    thisModelView.modelViewEl = thisModelViewWrapped;

                    if (_.isFunction(this.sortableModelsFilter)) if (this.sortableModelsFilter.call(_this, thisModel)) thisModelViewWrapped.addClass("sortable");

                    this.$el.append(thisModelViewWrapped);

                    // we have to render the modelView after it has been put in context, as opposed to in the 
                    // initialize function of the modelView, because some rendering might be dependent on
                    // the modelView's context in the DOM tree. For example, if the modelView stretch()'s itself,
                    // it must be in full context in the DOM tree or else the stretch will not behave as intended.
                    var renderResult = thisModelView.render();

                    // return false from the view's render function to hide this item
                    if (renderResult === false) thisModelViewWrapped.hide();

                    if (_.isFunction(this.visibleModelsFilter)) {
                        if (!this.visibleModelsFilter(thisModel)) {
                            thisModelViewWrapped.hide();
                        }
                    }

                    this.viewManager.add(thisModelView);
                }, this);
            }

            if (this.sortable) {
                var sortableOptions = _.extend({
                    axis: "y",
                    distance: 10,
                    forcePlaceholderSize: true,
                    start: this._sortStart,
                    change: this._sortChange,
                    stop: this._sortStop,
                    receive: this._receive
                }, _.result(this, "sortableOptions"));

                if (this.sortableModelsFilter === null) {
                    if (_this._isRenderedAsTable()) {
                        sortableOptions.items = "> tbody > *";
                    } else if (_this._isRenderedAsList()) {
                        sortableOptions.items = "> *";
                    }
                } else if (_.isString(this.sortableModelsFilter)) {
                    sortableOptions.items = this.sortableModelsFilter;
                } else if (_.isFunction(this.sortableModelsFilter)) {
                    if (_this._isRenderedAsTable()) {
                        sortableOptions.items = "> tbody > tr.sortable";
                    } else if (_this._isRenderedAsList()) {
                        sortableOptions.items = "> li.sortable";
                    }
                }

                this.$el = this.$el.sortable(sortableOptions);
            }

            this.trigger("render");
            if (this._isBackboneCourierAvailable()) this.spawn("render");

            if (this.selectable) {
                this._restoreSelection();
                this.updateDependentControls();
            }

            if (_.isFunction(this.onAfterRender)) this.onAfterRender();
        },

        validateSelectionAndRender: function() {
            this._validateSelection();
            this.render();
        },

        getEmptyListDescriptionView: function() {
            return this.emptyListDescriptionView;
        },

        updateDependentControls: function() {
            this.trigger("updateDependentControls", this.selectedItems);
            if (this._isBackboneCourierAvailable()) {
                this.spawn("updateDependentControls", {
                    selectedItems: this.selectedItems
                });
            }
        },

        _getModelReferenceId: function(theModel) {

            return theModel.cid;
        },

        _getModelByReferenceId: function(referenceId) {
            return this.collection.get(referenceId);
        },

        _getClickedItemId: function(theEvent) {
            var clickedItemId = null;

            // important to use currentTarget as opposed to target, since we could be bubbling
            // an event that took place within another collectionList
            var clickedItemEl = $(theEvent.currentTarget);
            if (clickedItemEl.closest(".collection-list").get(0) !== this.$el.get(0)) return;

            // determine which list item was clicked. If we clicked in the blank area
            // underneath all the elements, we want to know that too, since in this
            // case we will want to deselect all elements. so check to see if the clicked
            // DOM element is the list itself to find that out.
            var clickedItem = clickedItemEl.closest("[data-item-id]");
            if (clickedItem.length > 0) {
                clickedItemId = clickedItem.attr('data-item-id');
                if ($.isNumeric(clickedItemId)) clickedItemId = parseInt(clickedItemId, 10);
            }

            return clickedItemId;
        },

        _validateSelection: function() {
            // note can't use the collection's proxy to underscore because "cid" and "id" are not attributes,
            // but elements of the model object itself.
            var modelReferenceIds = _.pluck(this.collection.models, "cid");

            this.selectedItems = _.intersection(modelReferenceIds, this.selectedItems);

            if (_.isFunction(this.selectableModelsFilter)) {
                this.selectedItems = _.filter(this.selectedItems, function(thisItemId) {
                    return this.selectableModelsFilter.call(this, this._getModelByReferenceId(thisItemId));
                }, this);
            }
        },

        _addSelectedClassToSelectedItems: function(oldItemsIdsWithSelectedClass) {
            if (_.isUndefined(oldItemsIdsWithSelectedClass)) oldItemsIdsWithSelectedClass = [];

            // oldItemsIdsWithSelectedClass is used for optimization purposes only. If this info is supplied then we
            // only have to add / remove the "selected" class from those items that "selected" state has changed.

            var itemsIdsFromWhichSelectedClassNeedsToBeRemoved = oldItemsIdsWithSelectedClass;
            itemsIdsFromWhichSelectedClassNeedsToBeRemoved = _.without(itemsIdsFromWhichSelectedClassNeedsToBeRemoved, this.selectedItems);

            _.each(itemsIdsFromWhichSelectedClassNeedsToBeRemoved, function(thisItemId) {
                this.$el.find("[data-item-id=" + thisItemId + "]").removeClass("selected");
            }, this);

            var itemsIdsFromWhichSelectedClassNeedsToBeAdded = this.selectedItems;
            itemsIdsFromWhichSelectedClassNeedsToBeAdded = _.without(itemsIdsFromWhichSelectedClassNeedsToBeAdded, oldItemsIdsWithSelectedClass);

            _.each(itemsIdsFromWhichSelectedClassNeedsToBeAdded, function(thisItemId) {
                this.$el.find("[data-item-id=" + thisItemId + "]").addClass("selected");
            }, this);
        },

        _reorderCollectionBasedOnHTML: function() {
            var _this = this;

            this.$el.children().each(function() {
                var thisModelId = $(this).attr("data-item-id");

                if (thisModelId) {
                    // remove the current model and then add it back (at the end of the collection).
                    // When we are done looping through all models, they will be in the correct order.
                    var thisModel = _this._getModelByReferenceId(thisModelId);
                    if (thisModel) {
                        _this.collection.remove(thisModel, {
                            silent: true
                        });
                        _this.collection.add(thisModel, {
                            silent: true
                        });
                    }
                }
            });

            this.collection.trigger("reorder");

            if (this._isBackboneCourierAvailable()) this.spawn("reorder");

        },

        _getModelViewConstructor: function(thisModel) {
            return this.modelView || mDefaultModelViewConstructor;
        },

        _getModelViewOptions: function(thisModel) {
            return _.extend({
                model: thisModel
            }, this.modelViewOptions);
        },

        _sortStart: function(event, ui) {
            var modelBeingSorted = this.collection.get(ui.item.attr("data-item-id"));
            this.trigger("sortStart", modelBeingSorted);
            if (this._isBackboneCourierAvailable()) this.spawn("sortStart", {
                modelBeingSorted: modelBeingSorted
            });
        },

        _sortChange: function(event, ui) {
            var modelBeingSorted = this.collection.get(ui.item.attr("data-item-id"));
            this.trigger("sortChange", modelBeingSorted);
            if (this._isBackboneCourierAvailable()) this.spawn("sortChange", {
                modelBeingSorted: modelBeingSorted
            });
        },

        _sortStop: function(event, ui) {
            var modelBeingSorted = this.collection.get(ui.item.attr("data-item-id"));
            var newIndex = this.$el.children().index(ui.item);

            if (newIndex == -1) {
                // the element was removed from this list. can happen if this sortable is connected
                // to another sortable, and the item was dropped into the other sortable.
                this.collection.remove(modelBeingSorted, {
                    silent: true
                });
            }

            this._reorderCollectionBasedOnHTML();
            this.updateDependentControls();
            this.trigger("sortStop", modelBeingSorted, newIndex);
            if (this._isBackboneCourierAvailable()) this.spawn("sortStop", {
                modelBeingSorted: modelBeingSorted,
                newIndex: newIndex
            });
        },

        _receive: function(event, ui) {
            var senderListEl = ui.sender;
            var senderCollectionListView = senderListEl.data("view");
            if (!senderCollectionListView || !senderCollectionListView.collection) return;

            var newIndex = this.$el.children().index(ui.item);
            var modelReceived = senderCollectionListView.collection.get(ui.item.attr("data-item-id"));
            this.collection.add(modelReceived, {
                at: newIndex
            });
            this.setSelectedItem(modelReceived, {
                by: "model"
            });
        },

        _onKeydown: function(event) {
            if (!this.processKeyEvents) return true;

            var trap = false;

            if (this.getSelectedItems({
                by: "line"
            }).length == 1) {
                // need to trap down and up arrows or else the browser
                // will end up scrolling a autoscroll div.

                if (event.which == this._charCodes.upArrow) {
                    this.setSelectedItem(this.getSelectedItem({
                        by: "line"
                    }) - 1, {
                        by: "line"
                    });
                    trap = true;
                } else if (event.which == this._charCodes.downArrow) {
                    this.setSelectedItem(this.getSelectedItem({
                        by: "line"
                    }) + 1, {
                        by: "line"
                    });
                    trap = true;
                }
            }

            return !trap;
        },

        _listItem_onClick: function(theEvent) {
            if (!this.selectable || !this.clickToSelect) return;

            var clickedItemId = this._getClickedItemId(theEvent);

            if (clickedItemId) {
                // a list item was clicked
                if (this.selectMultiple && theEvent.shiftKey) {
                    var firstSelectedItemIndex = -1;

                    if (this.selectedItems.length > 0) {
                        this.collection.find(function(thisItemModel) {
                            firstSelectedItemIndex++;

                            // exit when we find our first selected element
                            return _.contains(this.selectedItems, this._getModelReferenceId(thisItemModel));
                        }, this);
                    }

                    var clickedItemIndex = -1;
                    this.collection.find(function(thisItemModel) {
                        clickedItemIndex++;

                        // exit when we find the clicked element
                        return this._getModelReferenceId(thisItemModel) == clickedItemId;
                    }, this);

                    var shiftKeyRootSelectedItemIndex = firstSelectedItemIndex == -1 ? clickedItemIndex : firstSelectedItemIndex;
                    var minSelectedItemIndex = Math.min(clickedItemIndex, shiftKeyRootSelectedItemIndex);
                    var maxSelectedItemIndex = Math.max(clickedItemIndex, shiftKeyRootSelectedItemIndex);

                    var newSelectedItems = [];
                    for (var thisIndex = minSelectedItemIndex; thisIndex <= maxSelectedItemIndex; thisIndex++)
                    newSelectedItems.push(this._getModelReferenceId(this.collection.at(thisIndex)));
                    this.setSelectedItems(newSelectedItems, {
                        silent: false
                    });

                    // shift clicking will usually highlight selectable text, which we do not want.
                    // this is a cross browser (hopefully) snippet that deselects all text selection.
                    if (document.selection && document.selection.empty) document.selection.empty();
                    else if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel && sel.removeAllRanges) sel.removeAllRanges();
                    }
                } else if (this.selectMultiple && (this.clickToToggle || theEvent.metaKey)) {
                    if (_.contains(this.selectedItems, clickedItemId)) this.setSelectedItems(_.without(this.selectedItems, clickedItemId), {
                        silent: false
                    });
                    else this.setSelectedItems(_.union(this.selectedItems, clickedItemId), {
                        silent: false
                    });
                } else this.setSelectedItems([clickedItemId], {
                    silent: false
                });
            } else
            // the blank area of the list was clicked
            this.setSelectedItems([], {
                silent: false
            });

            if (this.sortable) {
                this.$el[0].focus();
            }

        },

        _listItem_onDoubleClick: function(theEvent) {
            var clickedItemId = this._getClickedItemId(theEvent);

            if (clickedItemId) {
                this.trigger("doubleClick", clickedItemId);
                if (this._isBackboneCourierAvailable()) this.spawn("doubleClick", {
                    clickedItemId: clickedItemId
                });
            }
        },

        _listBackground_onClick: function(theEvent) {
            if (!this.selectable) return;
            if (!$(theEvent.target).is(".collection-list")) return;

            this.setSelectedItems([], {
                silent: false
            });
        },

        //added from underscore.mixins.js
        _convertStringsToInts: function(theArray) {
            return _.map(theArray, function(thisEl) {
                if (!_.isString(thisEl)) return thisEl;
                var thisElAsNumber = parseInt(thisEl, 10);
                return (thisElAsNumber == thisEl ? thisElAsNumber : thisEl);
            });
        },

        //added from underscore.mixins.js
        _containSameElements: function(arrayA, arrayB) {
            if (arrayA.length != arrayB.length) return false;
            var intersectionSize = _.intersection(arrayA, arrayB).length;
            return intersectionSize == arrayA.length; // and must also equal arrayB.length, since arrayA.length == arrayB.length
        },

        _isRenderedAsTable: function() {
            return this.$el.prop('tagName').toLowerCase() === 'table';
        },


        _isRenderedAsList: function() {
            return !this._isRenderedAsTable();
        },

        _charCodes: {
            upArrow: 38,
            downArrow: 40
        },

        _isBackboneCourierAvailable: function() {
            return !_.isUndefined(Backbone.Courier);
        }

    }, {

        setDefaultModelViewConstructor: function(theConstructor) {

            mDefaultModelViewConstructor = theConstructor;
        }
    });
})();

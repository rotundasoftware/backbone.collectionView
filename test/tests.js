$(document).ready( function() {

	function commonSetup() {

		var Employee = Backbone.Model.extend( { } );
		var Employees = Backbone.Collection.extend( { model : Employee } );
		this.emp1 = new Employee( { id : 1, firstName : 'Sherlock', lastName : 'Holmes' } );
		this.emp2 = new Employee( { id : 2, firstName : 'John', lastName : 'Watson' } );
		this.emp3 = new Employee( { id : 3, firstName : 'Mycroft', lastName : 'Holmes' } );
		this.employees = new Employees( [ this.emp1, this.emp2, this.emp3 ] );

		this.EmployeeView = Backbone.View.extend( {
			template : _.template( $( "#employee-template" ).html() ),
			render : function() {
				var emp = this.model.toJSON();
				var html = this.template(emp);
				this.$el.append(html);
			}
		} );

		this.EmployeeViewForTable = Backbone.View.extend( {
			tagName : 'tr',
			template : _.template( $( "#employee-template-for-table" ).html() ),
			render : function() {
				var emp = this.model.toJSON();
				var html = this.template(emp);
				this.$el.append(html);
			}
		} );

		this.EmployeeView2 = Backbone.View.extend( {
			template : _.template( $( "#employee-template-2" ).html() ),
			render : function() {
				var emp = this.model.toJSON();
				var html = this.template(emp);
				this.$el.append(html);
			}
		} );


		var $fixture = $( "#qunit-fixture" );
		$fixture.append( "<ul id='myCollectionList'></ul>" );
		$fixture.append( "<table id='myCollectionTable'></table>" );
		$fixture.append( "<table id='myCollectionTableWithContents'><thead></thead><tbody></tbody></table>" );
		
		this.$collectionViewEl = $( "#myCollectionList" );
		this.$collectionViewForTableEl = $( "#myCollectionTable" );
		this.$collectionViewForTableWithContentsEl = $( "#myCollectionTableWithContents" );

	}

	module( "Table rendering",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);

	test( "Rendering with an empty table element", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		myCollectionView.render();

		equal( myCollectionView.$el.find( "tbody" ).length, 1, "Tbody is created" );
		equal( myCollectionView.$el.find( "tbody > tr" ).length, 3, "Model views are added inside the tbody" );
	} );

	test( "Rendering with a tbody and thead inside the table element", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableWithContentsEl,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		myCollectionView.render();

		equal( myCollectionView.$el.find( "thead" ).length, 1, "Thead remains after rendering" );
		equal( myCollectionView.$el.find( "tbody > tr" ).length, 3, "Model views are added inside the tbody" );
	} );

	module( "Item Selection",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);

	test( "getSelectedModel", 6, function() {

		var singleSelectionListView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionListView.render();

		singleSelectionListView.setSelectedModel( this.emp1 );

		var selectedCid = singleSelectionListView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp1.cid, "Selected item is the correct cid" );

		var selectedModel = singleSelectionListView.getSelectedModel();
		equal( selectedModel, this.emp1, "Selected item is the correct model" );

		var selectedId = singleSelectionListView.getSelectedModel( { by : "id" } );
		equal( selectedId, this.emp1.id, "Selected item is the correct id" );

		var selectedModelView = singleSelectionListView.getSelectedModel( { by : "view" } );
		equal( selectedModelView.model, this.emp1, "Selected item is the correct view" );

		singleSelectionListView.setSelectedModel( this.emp2 );

		var selectedListItemOffset = singleSelectionListView.getSelectedModel( { by : "offset" } );
		equal( selectedListItemOffset, 1, "Selected list item is the correct offset" );

		var singleSelectionTableView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		singleSelectionTableView.render();

		singleSelectionTableView.setSelectedModel( this.emp2 );

		var selectedTableRowOffset = singleSelectionTableView.getSelectedModel( { by : "offset" } );
		equal( selectedTableRowOffset, 1, "Selected table row is the correct offset" );

	});

	test( "setSelectedModel", 6, function() {

		var singleSelectionListView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionListView.render();

		var selectedCid;

		singleSelectionListView.setSelectedModel( this.emp1.id, { by : "id" } );
		selectedCid = singleSelectionListView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp1.cid, "Selected item correctly set using id" );

		singleSelectionListView.setSelectedModel( this.emp2.cid, { by : "cid" } );
		selectedCid = singleSelectionListView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp2.cid, "Selected item correctly set using cid" );

		singleSelectionListView.setSelectedModel( this.emp3 );
		selectedModel = singleSelectionListView.getSelectedModel();
		equal( selectedModel, this.emp3, "Selected item correctly set using model" );

		singleSelectionListView.setSelectedModel( singleSelectionListView.viewManager.findByModel( this.emp1 ), { by : "view" } );
		selectedModel = singleSelectionListView.getSelectedModel();
		equal( selectedModel, this.emp1, "Selected item correctly set using view" );

		singleSelectionListView.setSelectedModel( 1, { by : "offset" } );
		selectedModel = singleSelectionListView.getSelectedModel();
		equal( selectedModel, this.emp2, "Selected list item correctly set using offset" );

		var singleSelectionTableView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		singleSelectionTableView.render();

		singleSelectionTableView.setSelectedModel( 1, { by : "offset" } );
		selectedModel = singleSelectionTableView.getSelectedModel();
		equal( selectedModel, this.emp2, "Selected table row correctly set using offset" );

	});

	test( "getSelectedModels", 18, function() {

		var singleSelectionListView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			selectMultiple : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionListView.render();

		singleSelectionListView.setSelectedModels( [ this.emp1, this.emp2 ] );

		var selectedCids = singleSelectionListView.getSelectedModels( { by : "cid" } );
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( selectedCids[0], this.emp1.cid, "One of selected items is the correct cid" );
		equal( selectedCids[1], this.emp2.cid, "Other selected item is the correct cid" );

		var selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( selectedModels[0], this.emp1, "One of selected items is the correct model" );
		equal( selectedModels[1], this.emp2, "Other selected item is the correct model" );

		var selectedIds = singleSelectionListView.getSelectedModels({ by : "id" });
		equal( selectedIds.length, 2, "Correct number of selected items");
		equal( selectedIds[0], this.emp1.id, "One of selected items is the correct id" );
		equal( selectedIds[1], this.emp2.id, "Other selected item is the correct id" );

		var selectedModelViews = singleSelectionListView.getSelectedModels( { by : "view" });
		equal( selectedModelViews.length, 2, "Correct number of selected items");
		equal( selectedModelViews[0].model, this.emp1, "One of the selected items is the correct view" );
		equal( selectedModelViews[1].model, this.emp2, "Other selected item is the correct view" );

		var selectedListItemOffsets = singleSelectionListView.getSelectedModels( { by : "offset" } );
		equal( selectedListItemOffsets.length, 2, "Correct number of selected list items" );
		equal( selectedListItemOffsets[0], 0, "One of the selected list item is the correct offset" );
		equal( selectedListItemOffsets[1], 1, "Other selected list item is the correct offset" );

		var singleSelectionTableView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		singleSelectionTableView.render();

		singleSelectionTableView.setSelectedModels( [ this.emp1, this.emp2 ] );

		var selectedTableRowOffsets = singleSelectionTableView.getSelectedModels( { by : "offset" } );
		equal( selectedTableRowOffsets.length, 2, "Correct number of selected table rows" );
		equal( selectedTableRowOffsets[0], 0, "One of the selected table row is the correct offset" );
		equal( selectedTableRowOffsets[1], 1, "Other selected table row is the correct offset" );

	});

	test( "setSelectedModels", 14, function() {

		var singleSelectionListView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionListView.render();

		var selectedCid;

		singleSelectionListView.setSelectedModels( [ this.emp1.id, this.emp2.id ], { by : "id" } );
		selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( selectedModels[0], this.emp1, "One of selected items correctly set using 'id'" );
		equal( selectedModels[1], this.emp2, "Other selected item correctly set using 'id'" );
		equal( _.intersection( selectedModels, [this.emp1, this.emp2 ] ).length, 2,  "Selected items correctly set using 'id'" );

		singleSelectionListView.setSelectedModels([ this.emp2.cid, this.emp3.cid ], { by : "cid" } );
		selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal(_.intersection(selectedModels, [ this.emp2, this.emp3 ] ).length, 2,  "Selected items correctly set using 'cid'" );

		singleSelectionListView.setSelectedModels( [ this.emp1, this.emp2 ] );
		selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedModels, [ this.emp1, this.emp2 ] ).length, 2,  "Selected items correctly set using 'model'" );

		singleSelectionListView.setSelectedModels([ singleSelectionListView.viewManager.findByModel( this.emp2 ), singleSelectionListView.viewManager.findByModel( this.emp3 ) ], { by : "view" } );
		selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedModels, [ this.emp2, this.emp3 ] ).length, 2,  "Selected items correctly set using 'view'" );

		singleSelectionListView.setSelectedModels( [ 0, 1 ], { by : "offset" } );
		selectedModels = singleSelectionListView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected list items");
		equal( _.intersection(selectedModels, [ this.emp1, this.emp2 ] ).length, 2,  "Selected list items correctly set using 'offset'" );

		var singleSelectionTableView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeViewForTable
		} );

		singleSelectionTableView.render();

		singleSelectionTableView.setSelectedModels( [ 0, 1 ], { by : "offset" } );
		selectedModels = singleSelectionTableView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected table rows");
		equal( _.intersection(selectedModels, [ this.emp1, this.emp2 ] ).length, 2,  "Selected table rows correctly set using 'offset'" );

	});

	module( "Constructor Options",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);

	test( "selectableModelsFilter", 2, function() {

		var selectableFilterView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectableModelsFilter : function(model) {
				return model.get( "lastName" ) === "Holmes";
			}
		} );

		selectableFilterView.render();

		selectableFilterView.setSelectedModel( this.emp2 );
		var selectedModel = selectableFilterView.getSelectedModel();
		equal( selectedModel, null, "Unselectable item was not selected" );

		selectableFilterView.setSelectedModel( this.emp1 );
		var selectedModel2 = selectableFilterView.getSelectedModel();
		equal( selectedModel2, this.emp1, "Selectable item was selected" );

	} );

	test( "visibleModelsFilter", 2, function() {

		var visibleFilterView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView,
			visibleModelsFilter : function( model ) {
				return model.get('lastName') === 'Holmes';
			}
		} );

		visibleFilterView.render();

		var modelView1 = visibleFilterView.viewManager.findByModel( this.emp1 );
		ok( modelView1.$el.is( ":visible" ), "Visible item (determined by visibleModelsFilter) is visible" );

		var modelView2 = visibleFilterView.viewManager.findByModel( this.emp2 );
		ok( !modelView2.$el.is( ":visible" ), "Hidden item (determined by visibleModelsFilter) is hidden" );

	} );

	test( "clickToSelect", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		var modelView1 = myCollectionView.viewManager.findByModel( this.emp1 );

		modelView1.$el.click();
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Successfully selected an item by clicking on it" );

		myCollectionView.remove();

		myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			clickToSelect : false,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		modelView1 = myCollectionView.viewManager.findByModel( this.emp2 );
		selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, null, "Were not able to select an item by clicking on it when clickToSelect is false" );

	} );

	test( "processKeyEvents", 6, function() {

		function keyEvent ( code ) {
			var keyEvent = $.Event( "keydown" );
			keyEvent.which = code;
			return keyEvent;
		}

		var upArrow = 38;
		var downArrow = 40;

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			processKeyEvents: true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		var modelView1 = myCollectionView.viewManager.findByModel( this.emp1 );

		modelView1.$el.click();
		$( myCollectionView.$el ).trigger( keyEvent( downArrow ) );
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp2, "Down arrow keypress changes the selection to the item below the current" );

		$( myCollectionView.$el ).trigger( keyEvent( upArrow ) );
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Up arrow keypress changes the selection to the item above the current" );

		myCollectionView.setSelectedModel( this.emp1 );
		$( myCollectionView.$el ).trigger( keyEvent( upArrow ) );
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Up arrow keypress when the first item is selected doesn't change selection" );

		myCollectionView.setSelectedModel( this.emp3 );
		$( myCollectionView.$el ).trigger( keyEvent( downArrow ) );
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp3, "Down arrow keypress when the last item is selected doesn't change selection" );

		myCollectionView.remove();

		myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			processKeyEvents: false,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		var modelView1 = myCollectionView.viewManager.findByModel( this.emp1 );

		modelView1.$el.click();
		$( myCollectionView.$el ).trigger( keyEvent( downArrow ) );
		selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Were not able to change selection by pressing down arrow key when processKeyEvents is false" );

		myCollectionView.setSelectedModel( this.emp2 );
		$( myCollectionView.$el ).trigger( keyEvent( upArrow ) );
		selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp2, "Were not able to change selection by pressing up arrow key when processKeyEvents is false" );

	} );

	test( "selectable", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		myCollectionView.setSelectedModel( this.emp1 );
		var selectedModel = myCollectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Item successfully selected" );

		myCollectionView.remove();

		myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			selectable : false,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		selectedModel = myCollectionView.getSelectedModel();
		equal(selectedModel, null, "Item not selected (because 'selectable' was false");

	});

	module( "setOption",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);


	test( "selectMultiple", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectMultiple : false
		} );	

		myCollectionView.render();

		myCollectionView.setSelectedModels( [ this.emp1, this.emp2 ] );

		equal( myCollectionView.getSelectedModels().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectMultiple", false );

		equal( myCollectionView.getSelectedModels().length, 1, "Now there is only one selected item" );

	} );

	test( "selectable", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );	

		myCollectionView.render();

		myCollectionView.setSelectedModels( [ this.emp1, this.emp2 ] );

		equal( myCollectionView.getSelectedModels().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectable", false );

		equal( myCollectionView.getSelectedModels().length, 0, "Now there is no selected items" );

	} );

	test( "selectableModelsFilter", 3, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );	

		myCollectionView.render();

		myCollectionView.setSelectedModels( [ this.emp1, this.emp2 ] );

		equal( myCollectionView.getSelectedModels().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectableModelsFilter", function( model ) {
			return model.get( "lastName" ) === "Holmes";
		} );

		equal( myCollectionView.getSelectedModels().length, 1, "Now there is no selected items" );
		equal( myCollectionView.getSelectedModels()[0], this.emp1, "The remaining selected model is correct" );

	} );

	test( "visibleModelsFilter", 1, function() {

		var visibleFilterView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView,
		} );

		visibleFilterView.render();

		visibleFilterView.setOption( "visibleModelsFilter", function( model ) {
				return model.get( "lastName" ) === "Holmes";
		 } );

		var modelView2 = visibleFilterView.viewManager.findByModel( this.emp2 );
		ok( !modelView2.$el.is( ":visible" ), "Hidden item (determined by visibleModelsFilter) is hidden" );

	} );

	test( "modelView", 3, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );	

		myCollectionView.render();

		ok( myCollectionView.viewManager.findByModel( this.emp1 ).$el.html().contains( "Full name" ), "Item html contains string `Full name`" );

		myCollectionView.setOption( "modelView", this.EmployeeView2 );

		ok( ! myCollectionView.viewManager.findByModel( this.emp1 ).$el.html().contains( "Full name" ), "Item html does not contain string `Full name`" );
		ok( myCollectionView.viewManager.findByModel( this.emp1 ).$el.html().contains( "Full 2 name" ), "Item html contains string `Full 2 name`" );


	} );

	module( "Events",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);


	asyncTest( "selectionChanged", 2, function() {

		var _this = this;

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );

		myCollectionView.setSelectedModel( this.emp1 );

		var selectionChangedHandler1 = function( newSelectedModels, oldSelectedModels ) {

			start();

			equal( oldSelectedModels[0], _this.emp1, "Old selected model is correct" );
			equal( newSelectedModels[0], _this.emp2, "New selected model is correct" );

			stop();

		};

		var selectionChangedHandler2 = function( newSelectedModels, oldSelectedModels ) {
			ok( false,  "This selectionChanged handler should not have been called because silent = true. " );
		};


		myCollectionView.on( "selectionChanged", selectionChangedHandler1 );

		myCollectionView.setSelectedModel( this.emp2 );

		myCollectionView.off( "selectionChanged" );

		myCollectionView.on( "selectionChanged", selectionChangedHandler2 );


		setTimeout( function() {
			myCollectionView.setSelectedModel( _this.emp1, { silent : true } );
		}, 50 );

		setTimeout( function() { start(); }, 100 );

	} );

	asyncTest( "updateDependentControls", 1, function() {

		var _this = this;

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );


		myCollectionView.bind( "updateDependentControls", function( newSelectedModels ) {

			start();

			equal( newSelectedModels[0], _this.emp1, "New selected model is correct" );

		} );

		myCollectionView.setSelectedModel( this.emp1 );

	} );

	asyncTest( "doubleClick", 1, function() {

		var _this = this;

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );

		myCollectionView.on( "doubleClick", function( clickedModel ) {
			start();
			equal( clickedModel, _this.emp2, "Correct clicked model payload" );

		} );

		myCollectionView.render();

		var emp2View = myCollectionView.viewManager.findByModel( _this.emp2 );

		emp2View.$el.dblclick();

	} );

	module( "Empty List Caption",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);

	test( "Rendering as list", 3, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true,
			emptyListCaption : "This is an empty list"
		} );

		this.employees.reset();
		myCollectionView.render();

		equal( $( "var.empty-list-caption" ).length, 1, "Empty list caption is present" );
		equal( $( "var.empty-list-caption" ).parent().prop( "tagName" ), "LI", "Empty list caption is wrapped in an li" );

		stop();

		myCollectionView.on( "render", function() {

			start();
			equal( $( "var.empty-list-caption" ).length, 0, "Empty list caption is not present" );

		} );

		myCollectionView.collection.add( this.emp1 );

	} );

	test( "Rendering as table", 4, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewForTableEl,
			collection : this.employees,
			modelView : this.EmployeeViewForTable,
			selectable : true,
			emptyListCaption : "This is an empty list"
		} );

		this.employees.reset();
		myCollectionView.render();

		equal( $( "var.empty-list-caption" ).length, 1, "Empty list caption is present" );
		equal( $( "var.empty-list-caption" ).parent().prop( "tagName" ), "TD", "Empty list caption is wrapped in an td" );
		equal( $( "var.empty-list-caption" ).parent().parent().prop( "tagName" ), "TR", "Empty list caption is wrapped in a tr around the td" );

		stop();

		myCollectionView.on( "render", function() {

			start();
			equal( $( "var.empty-list-caption" ).length, 0, "Empty list caption is not present" );

		} );

		myCollectionView.collection.add( this.emp1 );

	} );

	test( "String caption", 1, function() {

		var myEmptyListCaption = "This is an empty list";
		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true,
			emptyListCaption : myEmptyListCaption
		} );

		this.employees.reset();
		myCollectionView.render();

		ok( $( "var.empty-list-caption" ).html().contains( myEmptyListCaption ) , "Empty list caption contains correct text" );

	} );


	test( "Function caption", 2, function() {

		var emptyCaption = "Empty caption 1";

		var myEmptyCaptionFunction = function() {
			return emptyCaption;
		};

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true,
			emptyListCaption : myEmptyCaptionFunction
		} );

		this.employees.reset();
		myCollectionView.render();

		ok( $( "var.empty-list-caption" ).html().contains( emptyCaption ), "Empty list caption contains the correct text" );

		emptyCaption = "Empty caption 2";
		myCollectionView.render();

		ok( $( "var.empty-list-caption" ).html().contains( emptyCaption ), "Empty list caption contains the correct text" );


	} );

});

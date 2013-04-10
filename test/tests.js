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
		
		this.$collectionViewEl = $( "#myCollectionList" );

	}

	module( "Item Selection",
		{
			setup: function() {
				commonSetup.call( this );
			}
		}
	);

	test( "getSelectedModel", 5, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		singleSelectionView.setSelectedModel( this.emp1 );

		var selectedCid = singleSelectionView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp1.cid, "Selected item is the correct cid" );

		var selectedModel = singleSelectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Selected item is the correct model" );

		var selectedId = singleSelectionView.getSelectedModel( { by : "id" } );
		equal( selectedId, this.emp1.id, "Selected item is the correct id" );

		var selectedModelView = singleSelectionView.getSelectedModel( { by : "view" } );
		equal( selectedModelView.model, this.emp1, "Selected item is the correct view" );

		singleSelectionView.setSelectedModel( this.emp2 );

		var selectedOffset = singleSelectionView.getSelectedModel( { by : "offset" } );
		equal( selectedOffset, 1, "Selected item is the correct offset" );

	});

	test( "setSelectedModel", 5, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		var selectedCid;

		singleSelectionView.setSelectedModel( this.emp1.id, { by : "id" } );
		selectedCid = singleSelectionView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp1.cid, "Selected item correctly set using id" );

		singleSelectionView.setSelectedModel( this.emp2.cid, { by : "cid" } );
		selectedCid = singleSelectionView.getSelectedModel( { by : "cid" } );
		equal( selectedCid, this.emp2.cid, "Selected item correctly set using cid" );

		singleSelectionView.setSelectedModel( this.emp3 );
		selectedModel = singleSelectionView.getSelectedModel();
		equal( selectedModel, this.emp3, "Selected item correctly set using model" );

		singleSelectionView.setSelectedModel( singleSelectionView.viewManager.findByModel( this.emp1 ), { by : "view" } );
		selectedModel = singleSelectionView.getSelectedModel();
		equal( selectedModel, this.emp1, "Selected item correctly set using view" );

		singleSelectionView.setSelectedModel( 1, { by : "offset" } );
		selectedModel = singleSelectionView.getSelectedModel();
		equal( selectedModel, this.emp2, "Selected item correctly set using offset" );

	});

	test( "getSelectedModels", 15, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			selectMultiple : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		singleSelectionView.setSelectedModels( [ this.emp1, this.emp2 ] );

		var selectedCids = singleSelectionView.getSelectedModels( { by : "cid" } );
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( selectedCids[0], this.emp1.cid, "One of selected items is the correct cid" );
		equal( selectedCids[1], this.emp2.cid, "Other selected item is the correct cid" );

		var selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( selectedModels[0], this.emp1, "One of selected items is the correct model" );
		equal( selectedModels[1], this.emp2, "Other selected item is the correct model" );

		var selectedIds = singleSelectionView.getSelectedModels({ by : "id" });
		equal( selectedIds.length, 2, "Correct number of selected items");
		equal( selectedIds[0], this.emp1.id, "One of selected items is the correct id" );
		equal( selectedIds[1], this.emp2.id, "Other selected item is the correct id" );

		var selectedModelViews = singleSelectionView.getSelectedModels( { by : "view" });
		equal( selectedModelViews.length, 2, "Correct number of selected items");
		equal( selectedModelViews[0].model, this.emp1, "One of the selected items is the correct view" );
		equal( selectedModelViews[1].model, this.emp2, "Other selected item is the correct view" );

		var selectedOffsets = singleSelectionView.getSelectedModels( { by : "offset" } );
		equal( selectedOffsets.length, 2, "Correct number of selected items" );
		equal( selectedOffsets[0], 0, "One of the selected item is the correct offset" );
		equal( selectedOffsets[1], 1, "Other selected item is the correct offset" );


	});

	test( "setSelectedModels", 12, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		var selectedCid;

		singleSelectionView.setSelectedModels( [ this.emp1.id, this.emp2.id ], { by : "id" } );
		selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( selectedModels[0], this.emp1, "One of selected items correctly set using 'id'" );
		equal( selectedModels[1], this.emp2, "Other selected item correctly set using 'id'" );
		equal( _.intersection( selectedModels, [this.emp1, this.emp2 ] ).length, 2,  "Selected items correctly set using 'id'" );

		singleSelectionView.setSelectedModels([ this.emp2.cid, this.emp3.cid ], { by : "cid" } );
		selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal(_.intersection(selectedModels, [ this.emp2, this.emp3 ] ).length, 2,  "Selected items correctly set using 'cid'" );

		singleSelectionView.setSelectedModels( [ this.emp1, this.emp2 ] );
		selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedModels, [ this.emp1, this.emp2 ] ).length, 2,  "Selected items correctly set using 'model'" );

		singleSelectionView.setSelectedModels([ singleSelectionView.viewManager.findByModel( this.emp2 ), singleSelectionView.viewManager.findByModel( this.emp3 ) ], { by : "view" } );
		selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedModels, [ this.emp2, this.emp3 ] ).length, 2,  "Selected items correctly set using 'view'" );

		singleSelectionView.setSelectedModels( [ 0, 1 ], { by : "offset" } );
		selectedModels = singleSelectionView.getSelectedModels();
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedModels, [ this.emp1, this.emp2 ] ).length, 2,  "Selected items correctly set using 'offset'" );

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

});

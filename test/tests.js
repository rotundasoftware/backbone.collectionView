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

	test( "getSelectedItem", 5, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		singleSelectionView.setSelectedItem( this.emp1.cid );

		var selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp1.cid, "Selected item is the correct cid" );

		var selectedModel = singleSelectionView.getSelectedItem( { by : "model" } );
		equal( selectedModel, this.emp1, "Selected item is the correct model" );

		var selectedId = singleSelectionView.getSelectedItem( { by : "id" } );
		equal( selectedId, this.emp1.id, "Selected item is the correct id" );

		var selectedModelView = singleSelectionView.getSelectedItem( { by : "modelView" } );
		equal( selectedModelView.model, this.emp1, "Selected item is the correct modelView" );

		singleSelectionView.setSelectedItem( this.emp2.cid );

		var selectedLine = singleSelectionView.getSelectedItem( { by : "line" } );
		equal( selectedLine, 1, "Selected item is the correct line" );


	});

	test( "setSelectedItem", 5, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		var selectedCid;

		singleSelectionView.setSelectedItem( this.emp1.id, { by : "id" } );
		selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp1.cid, "Selected item correctly set using id" );

		singleSelectionView.setSelectedItem( this.emp2.cid, { by : "cid" } );
		selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp2.cid, "Selected item correctly set using cid" );

		singleSelectionView.setSelectedItem( this.emp3, { by : "model" } );
		selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp3.cid, "Selected item correctly set using model" );

		singleSelectionView.setSelectedItem( singleSelectionView.viewManager.findByModel( this.emp1 ), { by : "modelView" } );
		selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp1.cid, "Selected item correctly set using modelView" );

		singleSelectionView.setSelectedItem( 1, { by : "line" } );
		selectedCid = singleSelectionView.getSelectedItem();
		equal( selectedCid, this.emp2.cid, "Selected item correctly set using line" );

	});

	test( "getSelectedItems", 15, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			selectMultiple : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		singleSelectionView.setSelectedItems( [ this.emp1.cid, this.emp2.cid ] );

		var selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( selectedCids[0], this.emp1.cid, "One of selected items is the correct cid" );
		equal( selectedCids[1], this.emp2.cid, "Other selected item is the correct cid" );

		var selectedModels = singleSelectionView.getSelectedItems({ by : "model" });
		equal( selectedModels.length, 2, "Correct number of selected items");
		equal( selectedModels[0], this.emp1, "One of selected items is the correct model" );
		equal( selectedModels[1], this.emp2, "Other selected item is the correct model" );

		var selectedIds = singleSelectionView.getSelectedItems({ by : "id" });
		equal( selectedIds.length, 2, "Correct number of selected items");
		equal( selectedIds[0], this.emp1.id, "One of selected items is the correct id" );
		equal( selectedIds[1], this.emp2.id, "Other selected item is the correct id" );

		var selectedModelViews = singleSelectionView.getSelectedItems( { by : "modelView" });
		equal( selectedModelViews.length, 2, "Correct number of selected items");
		equal( selectedModelViews[0].model, this.emp1, "One of the selected items is the correct modelView" );
		equal( selectedModelViews[1].model, this.emp2, "Other selected item is the correct modelView" );

		var selectedLines = singleSelectionView.getSelectedItems( { by : "line" } );
		equal( selectedLines.length, 2, "Correct number of selected items" );
		equal( selectedLines[0], 0, "One of the selected item is the correct line" );
		equal( selectedLines[1], 1, "Other selected item is the correct line" );


	});

	test( "setSelectedItems", 12, function() {

		var singleSelectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			selectable : true,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		singleSelectionView.render();

		var selectedCid;

		singleSelectionView.setSelectedItems( [ this.emp1.id, this.emp2.id ], { by : "id" } );
		selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( selectedCids[0], this.emp1.cid, "One of selected items correctly set using 'id'" );
		equal( selectedCids[1], this.emp2.cid, "Other selected item correctly set using 'id'" );
		equal( _.intersection( selectedCids, [this.emp1.cid, this.emp2.cid ] ).length, 2,  "Selected items correctly set using 'id'" );

		singleSelectionView.setSelectedItems([ this.emp2.cid, this.emp3.cid ], { by : "cid" } );
		selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal(_.intersection(selectedCids, [ this.emp2.cid, this.emp3.cid ] ).length, 2,  "Selected items correctly set using 'cid'" );

		singleSelectionView.setSelectedItems( [ this.emp1, this.emp2 ], { by : "model" } );
		selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedCids, [ this.emp1.cid, this.emp2.cid ] ).length, 2,  "Selected items correctly set using 'model'" );

		singleSelectionView.setSelectedItems([ singleSelectionView.viewManager.findByModel( this.emp2 ), singleSelectionView.viewManager.findByModel( this.emp3 ) ], { by : "modelView" } );
		selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedCids, [ this.emp2.cid, this.emp3.cid ] ).length, 2,  "Selected items correctly set using 'modelView'" );

		singleSelectionView.setSelectedItems( [ 0, 1 ], { by : "line" } );
		selectedCids = singleSelectionView.getSelectedItems();
		equal( selectedCids.length, 2, "Correct number of selected items");
		equal( _.intersection(selectedCids, [ this.emp1.cid, this.emp2.cid ] ).length, 2,  "Selected items correctly set using 'line'" );

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

		selectableFilterView.setSelectedItem( this.emp2.cid );
		var selectedCid = selectableFilterView.getSelectedItem();
		equal( selectedCid, null, "Unselectable item was not selected" );

		selectableFilterView.setSelectedItem( this.emp1.cid );
		var selectedCid2 = selectableFilterView.getSelectedItem();
		equal( selectedCid2, this.emp1.cid, "Selectable item was selected" );

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
		var selectedCid = myCollectionView.getSelectedItem();
		equal( selectedCid, this.emp1.cid, "Successfully selected an item by clicking on it" );

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
		selectedCid = myCollectionView.getSelectedItem();
		equal( selectedCid, null, "Were not able to select an item by clicking on it when clickToSelect is false" );

	} );

	test( "selectable", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		myCollectionView.setSelectedItem( this.emp1.cid );
		var selectedCid = myCollectionView.getSelectedItem();
		equal( selectedCid, this.emp1.cid, "Item successfully selected" );

		myCollectionView.remove();

		myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			selectable : false,
			modelView : this.EmployeeView
		} );

		myCollectionView.render();

		selectedCid = myCollectionView.getSelectedItem();
		equal(selectedCid, null, "Item not selected (because 'selectable' was false");

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

		myCollectionView.setSelectedItems( [ this.emp1, this.emp2 ], { by : "model" } );

		equal( myCollectionView.getSelectedItems().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectMultiple", false );

		equal( myCollectionView.getSelectedItems().length, 1, "Now there is only one selected item" );

	} );

	test( "selectable", 2, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );	

		myCollectionView.setSelectedItems( [ this.emp1, this.emp2 ], { by : "model" } );

		equal( myCollectionView.getSelectedItems().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectable", false );

		equal( myCollectionView.getSelectedItems().length, 0, "Now there is no selected items" );

	} );

	test( "selectableModelsFilter", 3, function() {

		var myCollectionView = new Backbone.CollectionView( {
			el : this.$collectionViewEl,
			collection : this.employees,
			modelView : this.EmployeeView,
			selectable : true
		} );	

		myCollectionView.setSelectedItems( [ this.emp1, this.emp2 ], { by : "model" } );

		equal( myCollectionView.getSelectedItems().length, 2, "There are two selected items" );

		myCollectionView.setOption( "selectableModelsFilter", function( model ) {
			return model.get( "lastName" ) === "Holmes";
		} );

		equal( myCollectionView.getSelectedItems().length, 1, "Now there is no selected items" );
		equal( myCollectionView.getSelectedItems( { by : "model" } )[0], this.emp1, "The remaining selected model is correct" );

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


});
